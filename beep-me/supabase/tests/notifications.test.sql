-- Push tokens are private to their owner; reminder and welcome flags are server-owned.
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

insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-0000-0000-000000000401', 'n1@uncw.edu', now()),
  ('00000000-0000-0000-0000-000000000402', 'n2@uncw.edu', now());

select pg_temp.login('00000000-0000-0000-0000-000000000401');
insert into public.push_tokens (token, user_id, platform) values ('ExponentPushToken[aaa]', '00000000-0000-0000-0000-000000000401', 'ios');
do $$ begin
  begin
    insert into public.push_tokens (token, user_id, platform) values ('ExponentPushToken[bbb]', '00000000-0000-0000-0000-000000000402', 'ios');
    raise exception 'registered a token for someone else';
  exception when insufficient_privilege then null; end;
end $$;
update public.profile_private set welcome_sent_at = now() where id = '00000000-0000-0000-0000-000000000401';
select pg_temp.logout();
select pg_temp.login('00000000-0000-0000-0000-000000000402');
do $$ begin
  assert (select count(*) from public.push_tokens) = 0, 'cannot read others tokens';
end $$;
select pg_temp.logout();
do $$ begin
  assert (select welcome_sent_at from public.profile_private where id = '00000000-0000-0000-0000-000000000401') is null, 'welcome_sent_at protected';
end $$;

\echo Notification tests passed
