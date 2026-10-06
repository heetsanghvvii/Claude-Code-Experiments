-- Customer app (/login, /app). Additive only: no existing rows or columns change.
--
-- 1. Files a signed-in client re-uploads from My profile are tied to their candidate directly.
--    Until this is applied, the API inserts without the column (onboarding_id still links them when known).
alter table candidate_files add column if not exists candidate_id text;

-- 2. Sign-in maps the verified email to the candidate whose story.email matches, case-insensitively
--    (doc->story->>email ilike <email>, then an exact lowercase compare in the API). No index is needed
--    at this size; add a trigram index if engine_state grows past a few thousand rows.

-- Auth itself is Supabase Auth (email one-time code). RLS is unchanged: engine_state and candidate_files stay
-- behind engine_authorized() (migration 0003); the browser never reads these tables, only the Vercel API does.
