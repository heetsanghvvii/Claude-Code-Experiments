-- Lets the engine use the public (publishable) API key plus a secret `x-engine-token` header,
-- so no service-role key is needed. Only the SHA-256 hash of the token is stored.
-- The hash itself is inserted separately (not committed): insert into engine_secrets values ('engine_token', '<sha256>');

create table engine_secrets (
  name text primary key,
  sha256 text not null
);
alter table engine_secrets enable row level security;   -- no policies: unreadable through the API

create or replace function engine_authorized() returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (
    select 1 from engine_secrets
    where name = 'engine_token'
      and sha256 = encode(
        extensions.digest(coalesce(current_setting('request.headers', true)::json->>'x-engine-token', ''), 'sha256'),
        'hex')
  );
$$;
revoke all on function engine_authorized() from public;
grant execute on function engine_authorized() to anon, authenticated;

create policy engine_rw on engine_state for all to anon using (engine_authorized()) with check (engine_authorized());
create policy engine_rw on inbound_replies for all to anon using (engine_authorized()) with check (engine_authorized());
create policy engine_rw on outbox for all to anon using (engine_authorized()) with check (engine_authorized());
