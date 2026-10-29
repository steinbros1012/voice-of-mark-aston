-- Security hardening: private profile isolation, price/departure guards, storage.
\set ON_ERROR_STOP on
\set QUIET on
\pset tuples_only on

create or replace function pg_temp.login(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', uid::text, false);
  perform set_config('request.jwt.claim.role', 'authenticated', false);
  perform set_config('role', 'authenticated', false);
end $$;
create or replace function pg_temp.logout() returns void language plpgsql as $$
begin
  perform set_config('role', 'postgres', false);
  perform set_config('request.jwt.claim.sub', '', false);
end $$;
create or replace function pg_temp.anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', '', false);
  perform set_config('request.jwt.claim.role', 'anon', false);
  perform set_config('role', 'anon', false);
end $$;

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000301', 'h1@uncw.edu', now(), '{"display_name":"Hal"}'),
  ('00000000-0000-0000-0000-000000000302', 'h2@uncw.edu', now(), '{"display_name":"Ivy"}');

update public.profile_private set stripe_customer_id = 'cus_secret', stripe_account_id = 'acct_secret', has_payment_method = true
where id = '00000000-0000-0000-0000-000000000301';

-- Private rows: owner only; public profile has no Stripe columns at all.
select pg_temp.login('00000000-0000-0000-0000-000000000302');
do $$ begin
  assert (select count(*) from public.profile_private) = 1, 'only own private row visible';
  assert (select id from public.profile_private) = '00000000-0000-0000-0000-000000000302', 'own private row';
  assert not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'stripe_customer_id'), 'profiles carries no Stripe columns';
end $$;
select pg_temp.logout();

-- Owner cannot forge server-owned private fields; can record consent.
select pg_temp.login('00000000-0000-0000-0000-000000000302');
update public.profile_private set payouts_enabled = true, has_payment_method = true, accepted_terms_version = 'v1', accepted_terms_at = now()
where id = '00000000-0000-0000-0000-000000000302';
select pg_temp.logout();
do $$ begin
  assert not (select payouts_enabled from public.profile_private where id = '00000000-0000-0000-0000-000000000302'), 'payouts_enabled protected';
  assert (select accepted_terms_version from public.profile_private where id = '00000000-0000-0000-0000-000000000302') = 'v1', 'consent stored';
end $$;

-- Departure guard and price guard.
select pg_temp.login('00000000-0000-0000-0000-000000000301');
do $$ begin
  begin
    insert into public.beeps (driver_id, university_id, origin, destination, departure_at, seats_total, price_per_seat_cents)
    values ('00000000-0000-0000-0000-000000000301', 'uncw', 'a', 'b', now() - interval '1 hour', 2, 1000);
    raise exception 'past departure accepted';
  exception when check_violation then null; end;
end $$;
insert into public.beeps (id, driver_id, university_id, origin, destination, departure_at, seats_total, price_per_seat_cents)
values ('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', 'uncw', 'Campus', 'Durham', now() + interval '2 days', 2, 1500);
update public.beeps set price_per_seat_cents = 2000 where id = '90000000-0000-0000-0000-000000000001';
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-000000000302');
insert into public.seat_requests (beep_id, rider_id, seats_requested)
values ('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000302', 1);
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-000000000301');
do $$ begin
  assert (select price_per_seat_cents from public.beeps where id = '90000000-0000-0000-0000-000000000001') = 2000, 'price change allowed before requests';
  begin
    update public.beeps set price_per_seat_cents = 5000 where id = '90000000-0000-0000-0000-000000000001';
    raise exception 'price changed with live request';
  exception when check_violation then null; end;
  begin
    update public.beeps set departure_at = now() - interval '1 day' where id = '90000000-0000-0000-0000-000000000001';
    raise exception 'departure moved to the past';
  exception when check_violation then null; end;
end $$;
select pg_temp.logout();

-- A rider never sees another rider's request on the same beep.
insert into auth.users (id, email, email_confirmed_at) values ('00000000-0000-0000-0000-000000000303', 'h3@uncw.edu', now());
select pg_temp.login('00000000-0000-0000-0000-000000000303');
insert into public.seat_requests (beep_id, rider_id, seats_requested)
values ('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000303', 1);
do $$ begin
  assert (select count(*) from public.seat_requests where beep_id = '90000000-0000-0000-0000-000000000001') = 1, 'rider sees only own request';
end $$;
select pg_temp.logout();

-- Storage: anonymous users cannot read or list avatars; students can read.
insert into storage.objects (bucket_id, name) values ('avatars', '00000000-0000-0000-0000-000000000301/avatar.jpg');
select pg_temp.anon();
do $$ begin
  assert (select count(*) from storage.objects where bucket_id = 'avatars') = 0, 'anon cannot list avatars';
end $$;
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-000000000302');
do $$ begin
  assert (select count(*) from storage.objects where bucket_id = 'avatars') >= 1, 'students can read avatars for signed urls';
end $$;
select pg_temp.logout();
do $$ begin
  assert not (select public from storage.buckets where id = 'avatars'), 'avatars bucket private';
end $$;

-- Deleted accounts are hidden from other students.
update public.profiles set deleted_at = now(), display_name = 'Deleted student' where id = '00000000-0000-0000-0000-000000000303';
select pg_temp.login('00000000-0000-0000-0000-000000000302');
do $$ begin
  assert (select count(*) from public.profiles where id = '00000000-0000-0000-0000-000000000303') = 0, 'deleted profile hidden';
end $$;
select pg_temp.logout();

\echo Hardening tests passed
