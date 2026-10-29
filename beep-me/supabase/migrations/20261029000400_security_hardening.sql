-- Beep Me: pre-launch security hardening.
--  * Stripe/consent/subscription state moves to profile_private (own row only)
--  * price changes blocked while requests are live; departures must be future
--  * avatars bucket becomes private (signed URLs), never listable anonymously
--  * soft account deletion support

-- ---------------------------------------------------------------------------
-- profile_private: fields only the owner (and the server) may read
-- ---------------------------------------------------------------------------
create table public.profile_private (
  id                      uuid primary key references public.profiles (id) on delete cascade,
  stripe_customer_id      text,
  has_payment_method      boolean not null default false,
  stripe_account_id       text,
  payouts_enabled         boolean not null default false,
  plus_expires_at         timestamptz,
  accepted_terms_version  text,
  accepted_terms_at       timestamptz,
  updated_at              timestamptz not null default now()
);

insert into public.profile_private (id, stripe_customer_id, has_payment_method, stripe_account_id, payouts_enabled, plus_expires_at, accepted_terms_version, accepted_terms_at)
select id, stripe_customer_id, has_payment_method, stripe_account_id, payouts_enabled, plus_expires_at, accepted_terms_version, accepted_terms_at
from public.profiles;

alter table public.profiles
  drop column stripe_customer_id,
  drop column has_payment_method,
  drop column stripe_account_id,
  drop column payouts_enabled,
  drop column plus_expires_at,
  drop column accepted_terms_version,
  drop column accepted_terms_at,
  add column deleted_at timestamptz;

alter table public.profile_private enable row level security;

create policy "users read their own private profile"
  on public.profile_private for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "users update their own private profile"
  on public.profile_private for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create trigger profile_private_set_updated_at
  before update on public.profile_private
  for each row execute function public.set_updated_at();

-- Only consent columns are client-writable; everything else is server-owned.
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
  end if;
  return new;
end;
$$;

create trigger profile_private_protect_columns
  before update on public.profile_private
  for each row execute function public.protect_profile_private_columns();

-- profiles keeps only public fields; its guard shrinks accordingly.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not public.is_internal_write() then
    new.edu_verified   := old.edu_verified;
    new.university_id  := old.university_id;
    new.average_rating := old.average_rating;
    new.rating_count   := old.rating_count;
    new.rides_given    := old.rides_given;
    new.rides_taken    := old.rides_taken;
    new.created_at     := old.created_at;
    new.plus_active    := old.plus_active;
    new.deleted_at     := old.deleted_at;
  end if;
  return new;
end;
$$;

-- New users get both rows.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, university_id, edu_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    public.university_for_email(new.email),
    new.email_confirmed_at is not null
  );
  insert into public.profile_private (id) values (new.id);
  return new;
end;
$$;

-- Deleted accounts disappear from everyone else's reads.
drop policy "profiles are readable by signed-in students" on public.profiles;
create policy "profiles are readable by signed-in students"
  on public.profiles for select
  to authenticated
  using (deleted_at is null or id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Beeps: no price changes with live requests; departures stay in the future
-- ---------------------------------------------------------------------------
create or replace function public.guard_beep_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.departure_at <= now() then
    raise exception 'Departure must be in the future' using errcode = 'check_violation';
  end if;
  if new.departure_at > now() + interval '90 days' then
    raise exception 'Departure must be within 90 days' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger beeps_guard_insert
  before insert on public.beeps
  for each row execute function public.guard_beep_insert();

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

-- ---------------------------------------------------------------------------
-- Storage: avatars are private; students fetch them through signed URLs
-- ---------------------------------------------------------------------------
update storage.buckets set public = false where id = 'avatars';

drop policy "avatars are publicly readable" on storage.objects;

create policy "signed-in students can read avatars"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars');
