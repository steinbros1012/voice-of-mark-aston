-- Beep Me: seat requests, seat counting, and chat (Phase 4).

-- ---------------------------------------------------------------------------
-- Schema additions
-- ---------------------------------------------------------------------------
-- Short hop around town vs. a longer journey; drives the Local / Going farther
-- filter on the Explore screen.
alter table public.beeps
  add column trip_type text not null default 'long' check (trip_type in ('local', 'long'));

-- Denormalised chat preview so the Inbox needs one query.
alter table public.seat_requests
  add column last_message_at timestamptz,
  add column last_message_preview text;

create index seat_requests_inbox_idx on public.seat_requests (last_message_at desc nulls last);

-- Internal writes made by triggers set this flag so the client guards below
-- let them through. It is transaction-local and clients cannot set it
-- through PostgREST.
create or replace function public.is_internal_write()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(current_setting('beepme.internal', true), '') = 'on';
$$;

-- ---------------------------------------------------------------------------
-- Seat requests: what each side may change, and when
-- ---------------------------------------------------------------------------
create or replace function public.guard_seat_request_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  b public.beeps%rowtype;
  taken integer;
begin
  select * into b from public.beeps where id = new.beep_id;
  if b.id is null then
    raise exception 'Beep not found' using errcode = 'foreign_key_violation';
  end if;
  if b.status <> 'open' then
    raise exception 'This Beep is no longer taking requests' using errcode = 'check_violation';
  end if;
  if b.departure_at <= now() then
    raise exception 'This Beep has already left' using errcode = 'check_violation';
  end if;
  select coalesce(sum(seats_requested), 0) into taken
  from public.seat_requests where beep_id = new.beep_id and status = 'accepted';
  if taken + new.seats_requested > b.seats_total then
    raise exception 'Not enough seats left' using errcode = 'check_violation';
  end if;
  new.status := 'pending';
  new.last_message_at := null;
  new.last_message_preview := null;
  return new;
end;
$$;

create trigger seat_requests_guard_insert
  before insert on public.seat_requests
  for each row execute function public.guard_seat_request_insert();

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
  if public.is_internal_write() or uid is null then
    return new;
  end if;

  -- Clients may only change status.
  new.beep_id := old.beep_id;
  new.rider_id := old.rider_id;
  new.seats_requested := old.seats_requested;
  new.last_message_at := old.last_message_at;
  new.last_message_preview := old.last_message_preview;
  new.created_at := old.created_at;

  if new.status = old.status then
    return new;
  end if;

  driver := public.beep_driver_id(old.beep_id);

  if uid = old.rider_id then
    if new.status <> 'cancelled' or old.status not in ('pending', 'accepted') then
      raise exception 'Riders can only cancel a pending or accepted request' using errcode = 'check_violation';
    end if;
  elsif uid = driver then
    if old.status <> 'pending' or new.status not in ('accepted', 'declined') then
      raise exception 'Drivers can only accept or decline a pending request' using errcode = 'check_violation';
    end if;
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
  else
    raise exception 'Only the rider or the driver can change a request' using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

create trigger seat_requests_guard_update
  before update on public.seat_requests
  for each row execute function public.guard_seat_request_update();

-- Keep beeps.seats_taken and the open/full status in step with accepted requests.
create or replace function public.sync_beep_seats()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.beep_id, old.beep_id);
  taken integer;
begin
  select coalesce(sum(seats_requested), 0) into taken
  from public.seat_requests where beep_id = target and status = 'accepted';

  perform set_config('beepme.internal', 'on', true);
  update public.beeps
  set seats_taken = taken,
      status = case
        when status in ('completed', 'cancelled') then status
        when taken >= seats_total then 'full'::public.beep_status
        else 'open'::public.beep_status
      end
  where id = target;
  perform set_config('beepme.internal', 'off', true);
  return null;
end;
$$;

create trigger seat_requests_sync_seats
  after insert or update of status or delete on public.seat_requests
  for each row execute function public.sync_beep_seats();

-- ---------------------------------------------------------------------------
-- Beeps: server-owned columns, driver status changes, cascade cancellation
-- ---------------------------------------------------------------------------
create or replace function public.guard_beep_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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

  if new.seats_total < old.seats_taken then
    raise exception 'Seats cannot go below the seats already booked' using errcode = 'check_violation';
  end if;
  if new.seats_total > old.seats_taken and new.status = 'full' then
    new.status := 'open';
  end if;
  return new;
end;
$$;

create trigger beeps_guard_update
  before update on public.beeps
  for each row execute function public.guard_beep_update();

-- Cancelling a Beep cancels every live request on it.
create or replace function public.cascade_beep_cancellation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    perform set_config('beepme.internal', 'on', true);
    update public.seat_requests
    set status = 'cancelled'
    where beep_id = new.id and status in ('pending', 'accepted');
    perform set_config('beepme.internal', 'off', true);
  end if;
  return null;
end;
$$;

create trigger beeps_cascade_cancellation
  after update of status on public.beeps
  for each row execute function public.cascade_beep_cancellation();

-- ---------------------------------------------------------------------------
-- Messages: inbox preview
-- ---------------------------------------------------------------------------
create or replace function public.record_message_preview()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('beepme.internal', 'on', true);
  update public.seat_requests
  set last_message_at = new.created_at,
      last_message_preview = left(new.body, 120)
  where id = new.seat_request_id;
  perform set_config('beepme.internal', 'off', true);
  return null;
end;
$$;

create trigger messages_record_preview
  after insert on public.messages
  for each row execute function public.record_message_preview();

-- Live updates for chat and request status (RLS still applies to subscribers).
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.seat_requests;
