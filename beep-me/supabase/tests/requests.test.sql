-- Phase 4 behaviour: request lifecycle, seat counting, cascade, chat preview.
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

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000101', 'drv@uncw.edu', now(), '{"display_name":"Driver"}'),
  ('00000000-0000-0000-0000-000000000102', 'r1@uncw.edu',  now(), '{"display_name":"Rider One"}'),
  ('00000000-0000-0000-0000-000000000103', 'r2@uncw.edu',  now(), '{"display_name":"Rider Two"}');

-- Driver posts a 2-seat beep.
select pg_temp.login('00000000-0000-0000-0000-000000000101');
insert into public.beeps (id, driver_id, university_id, origin, destination, departure_at, seats_total, price_per_seat_cents, trip_type)
values ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'uncw', 'Campus', 'Raleigh', now() + interval '1 day', 2, 2000, 'long');
-- Driver cannot bump seats_taken by hand.
update public.beeps set seats_taken = 2 where id = '30000000-0000-0000-0000-000000000001';
select pg_temp.logout();
do $$ begin
  assert (select seats_taken from public.beeps where id = '30000000-0000-0000-0000-000000000001') = 0, 'seats_taken protected';
end $$;

-- Rider One asks for 1 seat; Rider Two asks for 2 (too many once R1 is accepted).
select pg_temp.login('00000000-0000-0000-0000-000000000102');
insert into public.seat_requests (id, beep_id, rider_id, seats_requested, status)
values ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', 1, 'accepted');
do $$ begin
  assert (select status from public.seat_requests where id = '40000000-0000-0000-0000-000000000001') = 'pending', 'inserts are always pending';
  -- rider cannot accept their own request
  begin
    update public.seat_requests set status = 'accepted' where id = '40000000-0000-0000-0000-000000000001';
    raise exception 'rider accepted own request';
  exception when check_violation then null; end;
end $$;
select pg_temp.logout();

select pg_temp.login('00000000-0000-0000-0000-000000000103');
insert into public.seat_requests (id, beep_id, rider_id, seats_requested)
values ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', 2);
do $$ begin
  begin
    insert into public.seat_requests (beep_id, rider_id, seats_requested)
    values ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', 3);
    raise exception 'over-capacity request accepted';
  exception when check_violation or unique_violation then null; end;
end $$;
select pg_temp.logout();

-- Driver accepts Rider One: 1 seat taken, still open.
select pg_temp.login('00000000-0000-0000-0000-000000000101');
update public.seat_requests set status = 'accepted' where id = '40000000-0000-0000-0000-000000000001';
do $$ begin
  assert (select seats_taken from public.beeps where id = '30000000-0000-0000-0000-000000000001') = 1, 'seats_taken = 1';
  assert (select status from public.beeps where id = '30000000-0000-0000-0000-000000000001') = 'open', 'still open';
  -- Rider Two wants 2 but only 1 left.
  begin
    update public.seat_requests set status = 'accepted' where id = '40000000-0000-0000-0000-000000000002';
    raise exception 'accepted beyond capacity';
  exception when check_violation then null; end;
  -- Driver cannot cancel a request, only decline.
  begin
    update public.seat_requests set status = 'cancelled' where id = '40000000-0000-0000-0000-000000000002';
    raise exception 'driver cancelled a request';
  exception when check_violation then null; end;
end $$;
update public.seat_requests set status = 'declined' where id = '40000000-0000-0000-0000-000000000002';
select pg_temp.logout();

-- Rider Two re-requests 1 seat after the decline; driver accepts; beep becomes full.
select pg_temp.login('00000000-0000-0000-0000-000000000103');
insert into public.seat_requests (id, beep_id, rider_id, seats_requested)
values ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', 1);
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-000000000101');
update public.seat_requests set status = 'accepted' where id = '40000000-0000-0000-0000-000000000003';
select pg_temp.logout();
do $$ begin
  assert (select seats_taken from public.beeps where id = '30000000-0000-0000-0000-000000000001') = 2, 'seats_taken = 2';
  assert (select status from public.beeps where id = '30000000-0000-0000-0000-000000000001') = 'full', 'beep full';
end $$;

-- A third rider cannot request a full beep.
insert into auth.users (id, email, email_confirmed_at) values ('00000000-0000-0000-0000-000000000104', 'r3@uncw.edu', now());
select pg_temp.login('00000000-0000-0000-0000-000000000104');
do $$ begin
  begin
    insert into public.seat_requests (beep_id, rider_id, seats_requested)
    values ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000104', 1);
    raise exception 'request on full beep accepted';
  exception when check_violation then null; end;
end $$;
select pg_temp.logout();

-- Rider One cancels: seat frees up, beep reopens.
select pg_temp.login('00000000-0000-0000-0000-000000000102');
update public.seat_requests set status = 'cancelled' where id = '40000000-0000-0000-0000-000000000001';
select pg_temp.logout();
do $$ begin
  assert (select seats_taken from public.beeps where id = '30000000-0000-0000-0000-000000000001') = 1, 'seat freed';
  assert (select status from public.beeps where id = '30000000-0000-0000-0000-000000000001') = 'open', 'reopened';
end $$;

-- Chat preview lands on the request; clients cannot write it directly.
select pg_temp.login('00000000-0000-0000-0000-000000000103');
insert into public.messages (seat_request_id, sender_id, body)
values ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000103', 'See you at the Fisher lot!');
update public.seat_requests set last_message_preview = 'forged' where id = '40000000-0000-0000-0000-000000000003';
select pg_temp.logout();
do $$ begin
  assert (select last_message_preview from public.seat_requests where id = '40000000-0000-0000-0000-000000000003') = 'See you at the Fisher lot!', 'preview recorded';
  assert (select last_message_at from public.seat_requests where id = '40000000-0000-0000-0000-000000000003') is not null, 'preview time recorded';
end $$;

-- Driver edits seats: cannot go below booked; can raise.
select pg_temp.login('00000000-0000-0000-0000-000000000101');
do $$ begin
  begin
    update public.beeps set seats_total = 0 where id = '30000000-0000-0000-0000-000000000001';
    raise exception 'seats below booked accepted';
  exception when check_violation then null; end;
end $$;
update public.beeps set seats_total = 4, price_per_seat_cents = 2500 where id = '30000000-0000-0000-0000-000000000001';
-- Cannot complete before departure.
do $$ begin
  begin
    update public.beeps set status = 'completed' where id = '30000000-0000-0000-0000-000000000001';
    raise exception 'completed early';
  exception when check_violation then null; end;
end $$;
-- Cancel cascades to live requests.
update public.beeps set status = 'cancelled' where id = '30000000-0000-0000-0000-000000000001';
select pg_temp.logout();
do $$ begin
  assert (select seats_total from public.beeps where id = '30000000-0000-0000-0000-000000000001') = 4, 'seats raised';
  assert (select status from public.seat_requests where id = '40000000-0000-0000-0000-000000000003') = 'cancelled', 'accepted request cancelled with beep';
  assert (select status from public.seat_requests where id = '40000000-0000-0000-0000-000000000002') = 'declined', 'declined request untouched';
end $$;

\echo Request tests passed
