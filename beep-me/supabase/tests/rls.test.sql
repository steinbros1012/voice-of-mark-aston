-- Row Level Security tests. Run with scripts/db-test.sh against a throwaway
-- local Postgres. Each block impersonates a user the way PostgREST does
-- (role + request.jwt.claim.sub) and asserts what that user can and cannot do.
\set ON_ERROR_STOP on
\set QUIET on

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

-- Users: A and B are verified UNCW students, C is unverified, D has no campus.
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'alice@uncw.edu', now(), '{"display_name":"Alice"}'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@uncw.edu',   null,  '{"display_name":"Bob"}'),
  ('00000000-0000-0000-0000-00000000000c', 'cara@uncw.edu',  null,  '{}'),
  ('00000000-0000-0000-0000-00000000000d', 'dan@gmail.com',  now(), '{}');

do $$ begin
  -- profile trigger
  assert (select university_id from public.profiles where id = '00000000-0000-0000-0000-00000000000a') = 'uncw', 'A mapped to uncw';
  assert (select edu_verified from public.profiles where id = '00000000-0000-0000-0000-00000000000a'), 'A verified at creation';
  assert (select display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000a') = 'Alice', 'display name copied';
  assert not (select edu_verified from public.profiles where id = '00000000-0000-0000-0000-00000000000b'), 'B unverified until confirmed';
  assert (select university_id from public.profiles where id = '00000000-0000-0000-0000-00000000000d') is null, 'gmail has no campus';
  -- before-user-created hook
  assert public.hook_before_user_created('{"user":{"email":"x@gmail.com"}}') ? 'error', 'hook rejects gmail';
  assert public.hook_before_user_created('{"user":{"email":"x@uncw.edu"}}') = '{}'::jsonb, 'hook allows uncw';
  assert public.hook_before_user_created('{"user":{"email":"x@mail.uncw.edu"}}') = '{}'::jsonb, 'hook allows subdomain';
end $$;

-- Confirming B's email flips the flag.
update auth.users set email_confirmed_at = now() where id = '00000000-0000-0000-0000-00000000000b';
do $$ begin
  assert (select edu_verified from public.profiles where id = '00000000-0000-0000-0000-00000000000b'), 'B verified after confirmation';
end $$;

-- A edits her profile; protected columns stay put.
select pg_temp.login('00000000-0000-0000-0000-00000000000a');
update public.profiles set display_name = 'Alice W', edu_verified = false, rides_given = 99, university_id = null
  where id = '00000000-0000-0000-0000-00000000000a';
update public.profiles set display_name = 'hacked' where id = '00000000-0000-0000-0000-00000000000b';
select pg_temp.logout();
do $$ begin
  assert (select display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000a') = 'Alice W', 'own display_name updated';
  assert (select edu_verified from public.profiles where id = '00000000-0000-0000-0000-00000000000a'), 'edu_verified protected';
  assert (select rides_given from public.profiles where id = '00000000-0000-0000-0000-00000000000a') = 0, 'rides_given protected';
  assert (select university_id from public.profiles where id = '00000000-0000-0000-0000-00000000000a') = 'uncw', 'university protected';
  assert (select display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000b') = 'Bob', 'cannot edit others';
end $$;

-- A posts a beep. C (unverified) cannot.
select pg_temp.login('00000000-0000-0000-0000-00000000000a');
insert into public.beeps (id, driver_id, university_id, origin, destination, departure_at, seats_total, price_per_seat_cents)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'uncw', 'Fisher Student Center', 'Raleigh', now() + interval '2 days', 3, 2000);
select pg_temp.logout();

select pg_temp.login('00000000-0000-0000-0000-00000000000c');
do $$ begin
  begin
    insert into public.beeps (driver_id, university_id, origin, destination, departure_at, seats_total, price_per_seat_cents)
    values ('00000000-0000-0000-0000-00000000000c', 'uncw', 'x', 'y', now(), 1, 100);
    raise exception 'unverified user should not post';
  exception when insufficient_privilege then null; end;
end $$;
select pg_temp.logout();

-- A cannot post as someone else.
select pg_temp.login('00000000-0000-0000-0000-00000000000a');
do $$ begin
  begin
    insert into public.beeps (driver_id, university_id, origin, destination, departure_at, seats_total, price_per_seat_cents)
    values ('00000000-0000-0000-0000-00000000000b', 'uncw', 'x', 'y', now(), 1, 100);
    raise exception 'should not post for another driver';
  exception when insufficient_privilege then null; end;
end $$;
select pg_temp.logout();

-- B (same campus) sees the beep; D (no campus) does not.
select pg_temp.login('00000000-0000-0000-0000-00000000000b');
do $$ begin
  assert (select count(*) from public.beeps where id = '10000000-0000-0000-0000-000000000001') = 1, 'B sees campus beep';
end $$;
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-00000000000d');
do $$ begin
  assert (select count(*) from public.beeps) = 0, 'D sees nothing';
end $$;
select pg_temp.logout();

-- B requests a seat; A cannot request her own beep.
select pg_temp.login('00000000-0000-0000-0000-00000000000b');
insert into public.seat_requests (id, beep_id, rider_id, seats_requested)
values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 1);
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-00000000000a');
do $$ begin
  begin
    insert into public.seat_requests (beep_id, rider_id, seats_requested)
    values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 1);
    raise exception 'driver should not request own beep';
  exception when insufficient_privilege then null; end;
  assert (select count(*) from public.seat_requests) = 1, 'driver sees incoming request';
end $$;
select pg_temp.logout();

-- Messages: both participants can chat; C cannot read it.
select pg_temp.login('00000000-0000-0000-0000-00000000000b');
insert into public.messages (seat_request_id, sender_id, body)
values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'Can you pick me up at Fisher?');
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-00000000000a');
insert into public.messages (seat_request_id, sender_id, body)
values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'Yes, 5pm.');
do $$ begin
  assert (select count(*) from public.messages) = 2, 'driver reads conversation';
end $$;
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-00000000000c');
do $$ begin
  assert (select count(*) from public.messages) = 0, 'outsider reads nothing';
  assert (select count(*) from public.seat_requests) = 0, 'outsider sees no requests';
end $$;
select pg_temp.logout();

-- Reviews require a completed beep.
select pg_temp.login('00000000-0000-0000-0000-00000000000b');
do $$ begin
  begin
    insert into public.reviews (beep_id, reviewer_id, reviewee_id, stars)
    values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000a', 5);
    raise exception 'review before completion should fail';
  exception when insufficient_privilege then null; end;
end $$;
select pg_temp.logout();
update public.seat_requests set status = 'accepted' where id = '20000000-0000-0000-0000-000000000001';
update public.beeps set status = 'completed' where id = '10000000-0000-0000-0000-000000000001';
select pg_temp.login('00000000-0000-0000-0000-00000000000b');
insert into public.reviews (beep_id, reviewer_id, reviewee_id, stars, text)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000a', 5, 'Great driver');
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-00000000000a');
insert into public.reviews (beep_id, reviewer_id, reviewee_id, stars)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000b', 4);
select pg_temp.logout();

-- Reports: only the reporter sees their report.
select pg_temp.login('00000000-0000-0000-0000-00000000000b');
insert into public.reports (reporter_id, reported_user_id, reason, details)
values ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000a', 'other', 'test');
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-00000000000a');
do $$ begin
  assert (select count(*) from public.reports) = 0, 'reported user cannot see report';
end $$;
select pg_temp.logout();

-- Blocks hide beeps both ways.
select pg_temp.login('00000000-0000-0000-0000-00000000000a');
insert into public.beeps (id, driver_id, university_id, origin, destination, departure_at, seats_total, price_per_seat_cents)
values ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000a', 'uncw', 'Campus', 'Charlotte', now() + interval '3 days', 2, 2500);
insert into public.blocks (blocker_id, blocked_id) values ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000b');
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-00000000000b');
do $$ begin
  assert (select count(*) from public.beeps where driver_id = '00000000-0000-0000-0000-00000000000a') = 0, 'blocked rider cannot see driver beeps';
  begin
    insert into public.seat_requests (beep_id, rider_id, seats_requested)
    values ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000b', 1);
    raise exception 'blocked rider should not request';
  exception when insufficient_privilege then null; end;
end $$;
select pg_temp.logout();

-- Storage: users only write under their own folder.
select pg_temp.login('00000000-0000-0000-0000-00000000000a');
insert into storage.objects (bucket_id, name) values ('avatars', '00000000-0000-0000-0000-00000000000a/avatar.jpg');
do $$ begin
  begin
    insert into storage.objects (bucket_id, name) values ('avatars', '00000000-0000-0000-0000-00000000000b/avatar.jpg');
    raise exception 'should not write to another folder';
  exception when insufficient_privilege then null; end;
end $$;
select pg_temp.logout();

\echo RLS tests passed
