-- Engine state and the inbox/outbox bridge used by the scheduled Chrome task.
-- All three are operator-only: RLS on with no policies, so only the service role key can use them.

-- One JSON document per candidate (plus shared docs such as the feedback playbook).
create table engine_state (
  id text primary key,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

-- Replies copied from the LGM inbox. The engine fills processed_at and result.
create table inbound_replies (
  id bigserial primary key,
  linkedin_url text,
  prospect_name text,
  text text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  result text
);
create index on inbound_replies (processed_at) where processed_at is null;

-- Messages waiting to be sent from LGM. The sender fills sent_at.
create table outbox (
  id bigserial primary key,
  candidate_id text not null,
  prospect_id text not null,
  prospect_name text,
  linkedin_url text,
  step smallint not null,
  body text not null,
  send_after timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index on outbox (send_after) where sent_at is null;

alter table engine_state enable row level security;
alter table inbound_replies enable row level security;
alter table outbox enable row level security;
