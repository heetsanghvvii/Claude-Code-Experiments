-- Outbound engine core schema.
-- Every row hangs off a candidate so row-level security can scope clients to their own data.

create extension if not exists "pgcrypto";

create type tier as enum ('self_send', 'done_for_you');
create type prospect_bucket as enum (
  'hiring_manager', 'team_member', 'recruiter', 'alumni', 'senior_connector', 'other'
);
create type prospect_status as enum (
  'discovered', 'shortlisted', 'enriched', 'message_ready', 'approved',
  'sent', 'accepted', 'replied', 'conversation', 'referral', 'interview', 'offer',
  'no_response', 'declined', 'skipped'
);
create type fact_owner as enum ('candidate', 'prospect');
create type message_direction as enum ('outbound', 'inbound');

create table candidates (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,                -- Supabase Auth user for the client site
  full_name text not null,
  email text,
  tier tier not null default 'self_send',
  target_roles text[] not null default '{}',
  target_companies text[] not null default '{}',
  locations text[] not null default '{}',
  industries text[] not null default '{}',
  constraints jsonb not null default '{}',
  story jsonb not null default '{}',       -- intake answers: why now, proud projects, tone
  profile jsonb,                           -- parsed structured profile
  created_at timestamptz not null default now()
);

create table prospects (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  full_name text not null,
  headline text,
  company text,
  linkedin_url text,
  location text,
  bucket prospect_bucket not null default 'other',
  bucket_reason text,
  status prospect_status not null default 'discovered',
  profile jsonb,                           -- parsed structured profile
  source text,                             -- brave, manual, clay
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_id, linkedin_url)
);
create index on prospects (candidate_id, status);

-- Atomic facts. Hooks must cite one candidate fact and one prospect fact.
create table facts (
  id text primary key,                     -- e.g. c:<candidate>:edu1, p:<prospect>:job2
  candidate_id uuid not null references candidates(id) on delete cascade,
  prospect_id uuid references prospects(id) on delete cascade,
  owner fact_owner not null,
  kind text not null,                      -- education, employer, role_change, project, post, location, skill, award, community
  text text not null,
  source text,                             -- cv, linkedin_pdf, post, web
  created_at timestamptz not null default now()
);
create index on facts (prospect_id);

create table hooks (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references prospects(id) on delete cascade,
  hook_type text not null,                 -- shared_school, shared_employer, similar_transition, relevant_work, post_reaction, shared_geo, shared_interest
  summary text not null,
  candidate_fact_id text not null references facts(id),
  prospect_fact_id text not null references facts(id),
  specificity smallint not null,
  rarity smallint not null,
  relevance smallint not null,
  recency smallint not null,
  score numeric not null,
  selected boolean not null default false,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references prospects(id) on delete cascade,
  hook_id uuid references hooks(id),
  direction message_direction not null,
  step smallint not null,                  -- 1 = opener, 2+ = follow-ups
  body text not null,
  ask_type text,                           -- none, opening, referral, hiring_manager, advice, intro
  style text,                              -- question, observation
  approved boolean not null default false,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index on messages (prospect_id, created_at);

-- Every status change and outcome, for funnel analytics.
create table events (
  id bigserial primary key,
  candidate_id uuid not null references candidates(id) on delete cascade,
  prospect_id uuid references prospects(id) on delete cascade,
  kind text not null,                      -- status change name or custom event
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index on events (candidate_id, kind);

-- Funnel per candidate.
create view candidate_funnel as
select
  c.id as candidate_id,
  c.full_name,
  count(p.*) filter (where p.status not in ('discovered', 'skipped')) as targeted,
  count(p.*) filter (where p.status in ('sent','accepted','replied','conversation','referral','interview','offer','no_response','declined')) as contacted,
  count(p.*) filter (where p.status in ('accepted','replied','conversation','referral','interview','offer')) as accepted,
  count(p.*) filter (where p.status in ('replied','conversation','referral','interview','offer')) as replied,
  count(p.*) filter (where p.status in ('conversation','referral','interview','offer')) as conversations,
  count(p.*) filter (where p.status in ('referral','interview','offer')) as referrals,
  count(p.*) filter (where p.status in ('interview','offer')) as interviews,
  count(p.*) filter (where p.status = 'offer') as offers
from candidates c
left join prospects p on p.candidate_id = c.id
group by c.id, c.full_name;

-- Conversion by hook type and bucket across all candidates (the dataset moat).
create view hook_performance as
select
  h.hook_type,
  p.bucket,
  count(*) as contacted,
  count(*) filter (where p.status in ('replied','conversation','referral','interview','offer')) as replied,
  count(*) filter (where p.status in ('conversation','referral','interview','offer')) as conversations,
  count(*) filter (where p.status in ('interview','offer')) as interviews
from hooks h
join prospects p on p.id = h.prospect_id
where h.selected
  and p.status in ('sent','accepted','replied','conversation','referral','interview','offer','no_response','declined')
group by h.hook_type, p.bucket;

-- Row-level security: clients see only their own candidate record and children.
alter table candidates enable row level security;
alter table prospects enable row level security;
alter table facts enable row level security;
alter table hooks enable row level security;
alter table messages enable row level security;
alter table events enable row level security;

create policy own_candidate on candidates for select using (auth_user_id = auth.uid());
create policy own_prospects on prospects for all using (
  candidate_id in (select id from candidates where auth_user_id = auth.uid())
);
create policy own_facts on facts for select using (
  candidate_id in (select id from candidates where auth_user_id = auth.uid())
);
create policy own_hooks on hooks for select using (
  prospect_id in (select p.id from prospects p join candidates c on c.id = p.candidate_id where c.auth_user_id = auth.uid())
);
create policy own_messages on messages for all using (
  prospect_id in (select p.id from prospects p join candidates c on c.id = p.candidate_id where c.auth_user_id = auth.uid())
);
create policy own_events on events for all using (
  candidate_id in (select id from candidates where auth_user_id = auth.uid())
);
