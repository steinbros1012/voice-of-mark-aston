-- Beep Me: notifications (Phase 6). Push tokens, reminder bookkeeping, and
-- one-time welcome email tracking.

create table public.push_tokens (
  token      text primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  platform   text not null check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);

create index push_tokens_user_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

create policy "users manage their own push tokens"
  on public.push_tokens for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Ride reminders go out once, about a day before departure.
alter table public.beeps add column reminder_sent_at timestamptz;

-- Welcome email goes out once per account.
alter table public.profile_private add column welcome_sent_at timestamptz;

-- Both are server-owned.
create or replace function public.protect_profile_private_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not public.is_internal_write() then
    new.stripe_customer_id := old.stripe_customer_id;
    new.has_payment_method := old.has_payment_method;
    new.stripe_account_id  := old.stripe_account_id;
    new.payouts_enabled    := old.payouts_enabled;
    new.plus_expires_at    := old.plus_expires_at;
    new.welcome_sent_at    := old.welcome_sent_at;
  end if;
  return new;
end;
$$;

create or replace function public.guard_beep_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  live_requests integer;
begin
  if public.is_internal_write() or (select auth.uid()) is null then
    return new;
  end if;

  new.driver_id := old.driver_id;
  new.university_id := old.university_id;
  new.seats_taken := old.seats_taken;
  new.created_at := old.created_at;
  new.reminder_sent_at := old.reminder_sent_at;

  if old.status in ('completed', 'cancelled') then
    raise exception 'This Beep is closed' using errcode = 'check_violation';
  end if;

  if new.status <> old.status then
    if new.status = 'completed' and old.departure_at > now() then
      raise exception 'A Beep can be completed after its departure time' using errcode = 'check_violation';
    end if;
    if new.status not in ('completed', 'cancelled') then
      raise exception 'Only cancel or complete are allowed' using errcode = 'check_violation';
    end if;
  end if;

  if new.departure_at <> old.departure_at and new.departure_at <= now() then
    raise exception 'Departure must be in the future' using errcode = 'check_violation';
  end if;

  if new.price_per_seat_cents <> old.price_per_seat_cents then
    select count(*) into live_requests
    from public.seat_requests where beep_id = old.id and status in ('pending', 'accepted');
    if live_requests > 0 then
      raise exception 'The price cannot change while riders have requested seats' using errcode = 'check_violation';
    end if;
  end if;

  if new.seats_total < old.seats_taken then
    raise exception 'Seats cannot go below the seats already booked' using errcode = 'check_violation';
  end if;
  if new.seats_total > old.seats_taken and new.status = 'full' then
    new.status := 'open';
  end if;
  return new;
end;
$$;
