-- Website sign-ups ("Get my target list" form). Anyone can submit; nobody can read through the
-- public API except the engine (x-engine-token). The landing page posts with the publishable key.

create table intake_requests (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 1 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  linkedin_url text check (linkedin_url is null or char_length(linkedin_url) <= 300),
  target_role text check (target_role is null or char_length(target_role) <= 200),
  target_companies text check (target_companies is null or char_length(target_companies) <= 1000),
  city text check (city is null or char_length(city) <= 120),
  package text check (package is null or package in ('sprint', 'standard', 'full', 'done_for_you')),
  processed_at timestamptz,
  candidate_id text
);
alter table intake_requests enable row level security;

create policy public_submit on intake_requests for insert to anon
  with check (processed_at is null and candidate_id is null);
create policy engine_read on intake_requests for select to anon using (engine_authorized());
create policy engine_update on intake_requests for update to anon using (engine_authorized()) with check (engine_authorized());
