-- Client onboarding (after sign-up): full intake answers, consents and uploaded PDFs.
-- All writes go through the Vercel API with the engine token; nothing is publicly readable.
create table onboarding (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  intake_id bigint references intake_requests(id),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  full_name text not null check (char_length(full_name) between 1 and 120),
  answers jsonb not null default '{}'::jsonb,
  consents jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'incomplete', 'ready', 'imported')),
  processed_at timestamptz,
  candidate_id text
);
create table candidate_files (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  onboarding_id uuid references onboarding(id) on delete cascade,
  kind text not null check (kind in ('linkedin_pdf', 'cv')),
  filename text check (char_length(filename) <= 200),
  size_bytes int check (size_bytes between 1 and 4500000),
  text_content text,
  pdf bytea
);
alter table onboarding enable row level security;
alter table candidate_files enable row level security;
create policy engine_rw on onboarding for all to anon using (engine_authorized()) with check (engine_authorized());
create policy engine_rw on candidate_files for all to anon using (engine_authorized()) with check (engine_authorized());
