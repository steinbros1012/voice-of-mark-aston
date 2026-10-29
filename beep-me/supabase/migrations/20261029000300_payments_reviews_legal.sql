-- Beep Me: payments, payouts, ratings, premium, and legal consent (Phase 5).

-- ---------------------------------------------------------------------------
-- Profiles: Stripe, RevenueCat and consent columns
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column stripe_customer_id     text,
  add column has_payment_method     boolean not null default false,
  add column stripe_account_id      text,
  add column payouts_enabled        boolean not null default false,
  add column plus_active            boolean not null default false,
  add column plus_expires_at        timestamptz,
  add column accepted_terms_version text,
  add column accepted_terms_at      timestamptz;

-- Server-owned columns now include the Stripe and Plus state. Consent columns
-- stay client-writable: the student records their own acceptance.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not public.is_internal_write() then
    new.edu_verified       := old.edu_verified;
    new.university_id      := old.university_id;
    new.average_rating     := old.average_rating;
    new.rating_count       := old.rating_count;
    new.rides_given        := old.rides_given;
    new.rides_taken        := old.rides_taken;
    new.created_at         := old.created_at;
    new.stripe_customer_id := old.stripe_customer_id;
    new.has_payment_method := old.has_payment_method;
    new.stripe_account_id  := old.stripe_account_id;
    new.payouts_enabled    := old.payouts_enabled;
    new.plus_active        := old.plus_active;
    new.plus_expires_at    := old.plus_expires_at;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Payments: one per accepted seat request, written only by Edge Functions
-- ---------------------------------------------------------------------------
create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'refunded', 'paid_out');

create table public.payments (
  id                       uuid primary key default gen_random_uuid(),
  seat_request_id          uuid not null unique references public.seat_requests (id) on delete cascade,
  rider_id                 uuid not null references public.profiles (id) on delete cascade,
  driver_id                uuid not null references public.profiles (id) on delete cascade,
  -- seats × price per seat
  seat_subtotal_cents      integer not null check (seat_subtotal_cents >= 0),
  -- rider-side booking fee, waived for Beep Me Plus riders
  booking_fee_cents        integer not null default 0 check (booking_fee_cents >= 0),
  -- what the rider was charged: subtotal + booking fee
  amount_cents             integer not null check (amount_cents >= 0),
  -- 15% of the subtotal plus the booking fee (before Stripe processing costs)
  platform_fee_cents       integer not null check (platform_fee_cents >= 0),
  -- subtotal minus the 15%, transferred to the driver on completion
  driver_payout_cents      integer not null check (driver_payout_cents >= 0),
  currency                 text not null default 'usd',
  stripe_payment_intent_id text unique,
  stripe_charge_id         text,
  stripe_transfer_id       text,
  stripe_refund_id         text,
  status                   public.payment_status not null default 'pending',
  failure_message          text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  check (amount_cents = seat_subtotal_cents + booking_fee_cents),
  check (driver_payout_cents + platform_fee_cents = amount_cents)
);

create index payments_driver_idx on public.payments (driver_id, created_at desc);
create index payments_rider_idx on public.payments (rider_id, created_at desc);

alter table public.payments enable row level security;

create policy "riders and drivers see their payments"
  on public.payments for select
  to authenticated
  using (rider_id = (select auth.uid()) or driver_id = (select auth.uid()));
-- No insert/update/delete policies: Edge Functions write with the service role.

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seat requests: capacity checks now apply to service-role writes too
-- ---------------------------------------------------------------------------
create or replace function public.guard_seat_request_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  driver uuid;
  b public.beeps%rowtype;
  taken integer;
begin
  if public.is_internal_write() then
    return new;
  end if;

  if uid is not null then
    -- Clients may only change status.
    new.beep_id := old.beep_id;
    new.rider_id := old.rider_id;
    new.seats_requested := old.seats_requested;
    new.last_message_at := old.last_message_at;
    new.last_message_preview := old.last_message_preview;
    new.created_at := old.created_at;
  end if;

  if new.status = old.status then
    return new;
  end if;

  driver := public.beep_driver_id(old.beep_id);

  if uid is not null then
    if uid = old.rider_id then
      if new.status <> 'cancelled' or old.status not in ('pending', 'accepted') then
        raise exception 'Riders can only cancel a pending or accepted request' using errcode = 'check_violation';
      end if;
    elsif uid = driver then
      if old.status <> 'pending' or new.status not in ('accepted', 'declined') then
        raise exception 'Drivers can only accept or decline a pending request' using errcode = 'check_violation';
      end if;
    else
      raise exception 'Only the rider or the driver can change a request' using errcode = 'insufficient_privilege';
    end if;
  end if;

  -- Capacity applies to everyone, including Edge Functions.
  if new.status = 'accepted' then
    select * into b from public.beeps where id = old.beep_id;
    if b.status <> 'open' then
      raise exception 'This Beep is no longer open' using errcode = 'check_violation';
    end if;
    select coalesce(sum(seats_requested), 0) into taken
    from public.seat_requests where beep_id = old.beep_id and status = 'accepted' and id <> old.id;
    if taken + old.seats_requested > b.seats_total then
      raise exception 'Not enough seats left to accept this request' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reviews: keep profile rating aggregates in step
-- ---------------------------------------------------------------------------
create or replace function public.sync_profile_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.reviewee_id, old.reviewee_id);
begin
  perform set_config('beepme.internal', 'on', true);
  update public.profiles p
  set average_rating = s.avg_stars,
      rating_count = s.n
  from (
    select round(avg(stars)::numeric, 2) as avg_stars, count(*)::integer as n
    from public.reviews where reviewee_id = target
  ) s
  where p.id = target;
  perform set_config('beepme.internal', 'off', true);
  return null;
end;
$$;

create trigger reviews_sync_rating
  after insert or update or delete on public.reviews
  for each row execute function public.sync_profile_rating();

-- ---------------------------------------------------------------------------
-- Completion: count rides given and taken once per completed Beep
-- ---------------------------------------------------------------------------
create or replace function public.count_completed_rides()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'completed' and old.status <> 'completed' then
    perform set_config('beepme.internal', 'on', true);
    update public.profiles set rides_given = rides_given + 1 where id = new.driver_id;
    update public.profiles p
    set rides_taken = rides_taken + 1
    from public.seat_requests r
    where r.beep_id = new.id and r.status = 'accepted' and p.id = r.rider_id;
    perform set_config('beepme.internal', 'off', true);
  end if;
  return null;
end;
$$;

create trigger beeps_count_completed_rides
  after update of status on public.beeps
  for each row execute function public.count_completed_rides();

-- Realtime for payment status (RLS applies).
alter publication supabase_realtime add table public.payments;
