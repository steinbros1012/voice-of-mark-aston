-- Phase 5: payments visibility, rating aggregates, completion counters, consent.
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
  ('00000000-0000-0000-0000-000000000201', 'd5@uncw.edu', now(), '{"display_name":"Driver Five"}'),
  ('00000000-0000-0000-0000-000000000202', 'r5@uncw.edu', now(), '{"display_name":"Rider Five"}'),
  ('00000000-0000-0000-0000-000000000203', 'x5@uncw.edu', now(), '{"display_name":"Outsider"}'),
  ('00000000-0000-0000-0000-000000000204', 'y5@uncw.edu', now(), '{"display_name":"Rider Six"}');

-- A beep that already departed, with one accepted rider.
select pg_temp.login('00000000-0000-0000-0000-000000000201');
insert into public.beeps (id, driver_id, university_id, origin, destination, departure_at, seats_total, price_per_seat_cents)
values ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'uncw', 'Campus', 'Raleigh', now() + interval '1 hour', 2, 2000);
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-000000000202');
insert into public.seat_requests (id, beep_id, rider_id, seats_requested)
values ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 1);
select pg_temp.logout();

-- Service role (no auth.uid) accepts, as the accept-request Edge Function does.
update public.seat_requests set status = 'accepted' where id = '60000000-0000-0000-0000-000000000001';
-- Service role inserts the payment row.
insert into public.payments (id, seat_request_id, rider_id, driver_id, seat_subtotal_cents, booking_fee_cents, amount_cents, platform_fee_cents, driver_payout_cents, status, stripe_payment_intent_id)
values ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000201', 2000, 100, 2100, 400, 1700, 'succeeded', 'pi_test_1');

-- Capacity still enforced for service-role writes: one seat left, two pending.
select pg_temp.login('00000000-0000-0000-0000-000000000203');
insert into public.seat_requests (id, beep_id, rider_id, seats_requested)
values ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 1);
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-000000000204');
insert into public.seat_requests (id, beep_id, rider_id, seats_requested)
values ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000204', 1);
select pg_temp.logout();
update public.seat_requests set status = 'accepted' where id = '60000000-0000-0000-0000-000000000003';
do $$ begin
  assert (select status from public.beeps where id = '50000000-0000-0000-0000-000000000001') = 'full', 'beep full after second accept';
  begin
    update public.seat_requests set status = 'accepted' where id = '60000000-0000-0000-0000-000000000002';
    raise exception 'service role accepted beyond capacity';
  exception when check_violation then null; end;
end $$;

-- Payment visibility: rider and driver see it, outsider does not; nobody can write.
select pg_temp.login('00000000-0000-0000-0000-000000000202');
do $$ begin
  assert (select count(*) from public.payments) = 1, 'rider sees payment';
  begin
    update public.payments set status = 'refunded' where id = '70000000-0000-0000-0000-000000000001';
  exception when insufficient_privilege then null; end;
  assert (select status from public.payments where id = '70000000-0000-0000-0000-000000000001') = 'succeeded', 'rider cannot change payment';
  -- Stripe/Plus columns are server-owned; consent columns are not.
  update public.profiles set has_payment_method = true, plus_active = true, accepted_terms_version = '2026-10-29', accepted_terms_at = now()
  where id = '00000000-0000-0000-0000-000000000202';
end $$;
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-000000000201');
do $$ begin
  assert (select count(*) from public.payments) = 1, 'driver sees payment';
end $$;
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-000000000203');
do $$ begin
  assert (select count(*) from public.payments) = 0, 'outsider sees no payment';
end $$;
select pg_temp.logout();
do $$ begin
  assert not (select has_payment_method from public.profiles where id = '00000000-0000-0000-0000-000000000202'), 'has_payment_method protected';
  assert not (select plus_active from public.profiles where id = '00000000-0000-0000-0000-000000000202'), 'plus_active protected';
  assert (select accepted_terms_version from public.profiles where id = '00000000-0000-0000-0000-000000000202') = '2026-10-29', 'consent recorded';
end $$;

-- Completion counters: service role completes after departure.
update public.beeps set departure_at = now() - interval '1 minute' where id = '50000000-0000-0000-0000-000000000001';
update public.beeps set status = 'completed' where id = '50000000-0000-0000-0000-000000000001';
do $$ begin
  assert (select rides_given from public.profiles where id = '00000000-0000-0000-0000-000000000201') = 1, 'rides_given counted';
  assert (select rides_taken from public.profiles where id = '00000000-0000-0000-0000-000000000202') = 1, 'rides_taken counted';
  assert (select rides_taken from public.profiles where id = '00000000-0000-0000-0000-000000000203') = 0, 'pending rider not counted';
  assert (select rides_taken from public.profiles where id = '00000000-0000-0000-0000-000000000204') = 1, 'second accepted rider counted';
end $$;

-- Ratings: both sides review; aggregates update; outsider cannot review.
select pg_temp.login('00000000-0000-0000-0000-000000000202');
insert into public.reviews (beep_id, reviewer_id, reviewee_id, stars, text)
values ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000201', 4, 'Good ride');
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-000000000201');
insert into public.reviews (beep_id, reviewer_id, reviewee_id, stars)
values ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000202', 5);
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-000000000203');
do $$ begin
  begin
    insert into public.reviews (beep_id, reviewer_id, reviewee_id, stars)
    values ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000201', 1);
    raise exception 'outsider reviewed';
  exception when insufficient_privilege then null; end;
end $$;
select pg_temp.logout();
do $$ begin
  assert (select average_rating from public.profiles where id = '00000000-0000-0000-0000-000000000201') = 4.00, 'driver rating averaged';
  assert (select rating_count from public.profiles where id = '00000000-0000-0000-0000-000000000201') = 1, 'driver rating counted';
  assert (select average_rating from public.profiles where id = '00000000-0000-0000-0000-000000000202') = 5.00, 'rider rating averaged';
end $$;

\echo Payment tests passed
