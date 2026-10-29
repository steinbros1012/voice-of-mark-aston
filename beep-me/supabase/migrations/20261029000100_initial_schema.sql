-- Beep Me: initial schema.
-- Every table has Row Level Security enabled. Policies live in this file next
-- to the tables they protect. Money is stored as integer cents.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.beep_status as enum ('open', 'full', 'completed', 'cancelled');
create type public.seat_request_status as enum ('pending', 'accepted', 'declined', 'cancelled');
create type public.report_reason as enum (
  'no_show', 'unsafe_driving', 'harassment', 'scam', 'inappropriate_content', 'other'
);
create type public.report_status as enum ('open', 'reviewed', 'actioned', 'dismissed');

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- universities: one row per campus marketplace
-- ---------------------------------------------------------------------------
create table public.universities (
  id            text primary key,
  name          text not null,
  short_name    text not null,
  city          text not null,
  state         text not null,
  -- Email domains that verify a student for this campus (e.g. uncw.edu).
  email_domains text[] not null check (cardinality(email_domains) > 0),
  created_at    timestamptz not null default now()
);

alter table public.universities enable row level security;

create policy "universities are readable by everyone"
  on public.universities for select
  to anon, authenticated
  using (true);

insert into public.universities (id, name, short_name, city, state, email_domains)
values ('uncw', 'University of North Carolina Wilmington', 'UNCW', 'Wilmington', 'NC', array['uncw.edu']);

-- Map an email address to a campus by its domain. Null when unsupported.
create or replace function public.university_for_email(email text)
returns text
language sql
stable
set search_path = ''
as $$
  select u.id
  from public.universities u
  where exists (
    select 1 from unnest(u.email_domains) d
    where lower(split_part(email, '@', 2)) = d
       or lower(split_part(email, '@', 2)) like '%.' || d
  )
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one per auth user, created by trigger
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                      uuid primary key references auth.users (id) on delete cascade,
  display_name            text not null default '' check (char_length(display_name) <= 40),
  university_id           text references public.universities (id),
  edu_verified            boolean not null default false,
  avatar_url              text,
  bio                     text check (char_length(bio) <= 280),
  average_rating          numeric(3, 2) check (average_rating between 1 and 5),
  rating_count            integer not null default 0,
  rides_given             integer not null default 0,
  rides_taken             integer not null default 0,
  onboarding_completed_at timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index profiles_university_idx on public.profiles (university_id);

alter table public.profiles enable row level security;

create policy "profiles are readable by signed-in students"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No insert/delete policies: rows are created by the auth trigger below and
-- removed by the cascade when the auth user is deleted.

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Columns the server owns. A user editing their own row cannot change them;
-- service-role and trigger writes (auth.uid() is null) can.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    new.edu_verified   := old.edu_verified;
    new.university_id  := old.university_id;
    new.average_rating := old.average_rating;
    new.rating_count   := old.rating_count;
    new.rides_given    := old.rides_given;
    new.rides_taken    := old.rides_taken;
    new.created_at     := old.created_at;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- Create the profile when the auth user is created.
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
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Flip edu_verified once the .edu address is confirmed.
create or replace function public.handle_user_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles
    set edu_verified = true,
        university_id = coalesce(university_id, public.university_for_email(new.email))
    where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_user_email_confirmed();

-- Reject sign-ups from unsupported domains before the user exists.
-- Enable under Authentication → Hooks → "Before User Created" (Postgres).
create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  email text := event -> 'user' ->> 'email';
begin
  if email is null or public.university_for_email(email) is null then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 400,
        'message', 'Sign up with your university .edu email. Beep Me is only open at supported campuses right now.'
      )
    );
  end if;
  return '{}'::jsonb;
end;
$$;

grant execute on function public.hook_before_user_created to supabase_auth_admin;
revoke execute on function public.hook_before_user_created from authenticated, anon, public;

-- Helpers used by policies. SECURITY DEFINER so they can read profiles
-- without recursing through the profiles policies.
create or replace function public.current_university_id()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select university_id from public.profiles where id = (select auth.uid());
$$;

create or replace function public.is_edu_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select edu_verified from public.profiles where id = (select auth.uid())),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- blocks: a user hides another user from their marketplace
-- ---------------------------------------------------------------------------
create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.blocks enable row level security;

create policy "users see their own blocks"
  on public.blocks for select
  to authenticated
  using ((select auth.uid()) = blocker_id);

create policy "users block other users"
  on public.blocks for insert
  to authenticated
  with check ((select auth.uid()) = blocker_id);

create policy "users unblock"
  on public.blocks for delete
  to authenticated
  using ((select auth.uid()) = blocker_id);

-- True when either side has blocked the other.
create or replace function public.is_blocked_either_way(other_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.blocks b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = other_user)
       or (b.blocker_id = other_user and b.blocked_id = (select auth.uid()))
  );
$$;

-- ---------------------------------------------------------------------------
-- beeps: a driver's ride offer
-- ---------------------------------------------------------------------------
create table public.beeps (
  id                   uuid primary key default gen_random_uuid(),
  driver_id            uuid not null references public.profiles (id) on delete cascade,
  university_id        text not null references public.universities (id),
  origin               text not null check (char_length(origin) between 1 and 120),
  destination          text not null check (char_length(destination) between 1 and 120),
  departure_at         timestamptz not null,
  seats_total          integer not null check (seats_total between 1 and 8),
  seats_taken          integer not null default 0 check (seats_taken >= 0),
  price_per_seat_cents integer not null check (price_per_seat_cents between 0 and 50000),
  note                 text check (char_length(note) <= 500),
  status               public.beep_status not null default 'open',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  check (seats_taken <= seats_total)
);

create index beeps_feed_idx on public.beeps (university_id, status, departure_at);
create index beeps_driver_idx on public.beeps (driver_id);

alter table public.beeps enable row level security;

create policy "students read beeps on their campus"
  on public.beeps for select
  to authenticated
  using (
    university_id = public.current_university_id()
    and not public.is_blocked_either_way(driver_id)
  );

create policy "verified students post beeps on their campus"
  on public.beeps for insert
  to authenticated
  with check (
    driver_id = (select auth.uid())
    and university_id = public.current_university_id()
    and public.is_edu_verified()
  );

create policy "drivers update their own beeps"
  on public.beeps for update
  to authenticated
  using (driver_id = (select auth.uid()))
  with check (driver_id = (select auth.uid()));

create trigger beeps_set_updated_at
  before update on public.beeps
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- seat_requests: a rider asks for seats on a beep (a booking once accepted)
-- ---------------------------------------------------------------------------
create table public.seat_requests (
  id              uuid primary key default gen_random_uuid(),
  beep_id         uuid not null references public.beeps (id) on delete cascade,
  rider_id        uuid not null references public.profiles (id) on delete cascade,
  seats_requested integer not null check (seats_requested between 1 and 8),
  status          public.seat_request_status not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index seat_requests_beep_idx on public.seat_requests (beep_id);
create index seat_requests_rider_idx on public.seat_requests (rider_id);
-- One live request per rider per beep. Cancelled/declined rows do not block a retry.
create unique index seat_requests_one_live_per_rider
  on public.seat_requests (beep_id, rider_id)
  where status in ('pending', 'accepted');

alter table public.seat_requests enable row level security;

-- The driver of a beep, resolved without recursing into seat_requests policies.
create or replace function public.beep_driver_id(beep uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select driver_id from public.beeps where id = beep;
$$;

create policy "riders and the driver see a request"
  on public.seat_requests for select
  to authenticated
  using (
    rider_id = (select auth.uid())
    or public.beep_driver_id(beep_id) = (select auth.uid())
  );

create policy "verified riders request seats"
  on public.seat_requests for insert
  to authenticated
  with check (
    rider_id = (select auth.uid())
    and public.is_edu_verified()
    and public.beep_driver_id(beep_id) <> (select auth.uid())
    and not public.is_blocked_either_way(public.beep_driver_id(beep_id))
  );

create policy "riders and the driver update a request"
  on public.seat_requests for update
  to authenticated
  using (
    rider_id = (select auth.uid())
    or public.beep_driver_id(beep_id) = (select auth.uid())
  )
  with check (
    rider_id = (select auth.uid())
    or public.beep_driver_id(beep_id) = (select auth.uid())
  );
-- Which status transitions each side may make is enforced by a trigger in the
-- Phase 4 migration, together with seat counting.

create trigger seat_requests_set_updated_at
  before update on public.seat_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- messages: chat per seat request (driver <-> rider)
-- ---------------------------------------------------------------------------
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  seat_request_id uuid not null references public.seat_requests (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null check (char_length(body) between 1 and 2000),
  created_at      timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (seat_request_id, created_at);

alter table public.messages enable row level security;

-- Is the current user the rider or the driver on this seat request?
create or replace function public.is_seat_request_participant(request uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.seat_requests r
    join public.beeps b on b.id = r.beep_id
    where r.id = request
      and (r.rider_id = (select auth.uid()) or b.driver_id = (select auth.uid()))
  );
$$;

create or replace function public.seat_request_is_chattable(request uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.seat_requests r
    where r.id = request and r.status in ('pending', 'accepted')
  );
$$;

create policy "participants read their conversation"
  on public.messages for select
  to authenticated
  using (public.is_seat_request_participant(seat_request_id));

create policy "participants send messages while the request is live"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.is_seat_request_participant(seat_request_id)
    and public.seat_request_is_chattable(seat_request_id)
  );

-- ---------------------------------------------------------------------------
-- reviews: both sides rate each other after a completed ride
-- ---------------------------------------------------------------------------
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  beep_id     uuid not null references public.beeps (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  stars       integer not null check (stars between 1 and 5),
  text        text check (char_length(text) <= 1000),
  created_at  timestamptz not null default now(),
  unique (beep_id, reviewer_id, reviewee_id),
  check (reviewer_id <> reviewee_id)
);

create index reviews_reviewee_idx on public.reviews (reviewee_id, created_at desc);

alter table public.reviews enable row level security;

create policy "reviews are readable by signed-in students"
  on public.reviews for select
  to authenticated
  using (true);

create policy "participants review each other after a completed beep"
  on public.reviews for insert
  to authenticated
  with check (
    reviewer_id = (select auth.uid())
    and exists (
      select 1 from public.beeps b
      where b.id = beep_id and b.status = 'completed'
    )
    and (
      -- reviewer is the driver reviewing an accepted rider
      (public.beep_driver_id(beep_id) = (select auth.uid()) and exists (
        select 1 from public.seat_requests r
        where r.beep_id = reviews.beep_id and r.rider_id = reviewee_id and r.status = 'accepted'
      ))
      or
      -- reviewer is an accepted rider reviewing the driver
      (public.beep_driver_id(beep_id) = reviewee_id and exists (
        select 1 from public.seat_requests r
        where r.beep_id = reviews.beep_id and r.rider_id = (select auth.uid()) and r.status = 'accepted'
      ))
    )
  );
-- Rating aggregates on profiles are maintained by a trigger in the Phase 5 migration.

-- ---------------------------------------------------------------------------
-- reports: safety reports against a user or a beep
-- ---------------------------------------------------------------------------
create table public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete cascade,
  reported_beep_id uuid references public.beeps (id) on delete cascade,
  reason           public.report_reason not null,
  details          text check (char_length(details) <= 2000),
  status           public.report_status not null default 'open',
  created_at       timestamptz not null default now(),
  check (reported_user_id is not null or reported_beep_id is not null),
  check (reported_user_id is null or reported_user_id <> reporter_id)
);

create index reports_status_idx on public.reports (status, created_at);

alter table public.reports enable row level security;

create policy "reporters see their own reports"
  on public.reports for select
  to authenticated
  using (reporter_id = (select auth.uid()));

create policy "signed-in students file reports"
  on public.reports for insert
  to authenticated
  with check (reporter_id = (select auth.uid()));
-- Status changes are made by staff with the service role; no client update policy.

-- ---------------------------------------------------------------------------
-- Storage: avatars bucket. Public read, owners write under their own folder.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "avatars are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

create policy "users upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "users replace their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "users delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
