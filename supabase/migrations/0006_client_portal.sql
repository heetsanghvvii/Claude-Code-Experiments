-- Client portal (/portal). Additive only: no existing rows or columns change.
--
-- 1. Replies a client pastes in the portal are already matched to one prospect, so the sync does not
--    have to guess by LinkedIn URL or name. Both columns stay null for replies from other sources.
--    Until this is applied, the API falls back to inserting without them (url/name matching).
alter table inbound_replies add column if not exists candidate_id text;
alter table inbound_replies add column if not exists prospect_id text;

-- 2. Portal links are looked up by the SHA-256 hash stored in each candidate document
--    (doc->story->>portal_token_hash). The raw token is never stored. This index keeps that lookup cheap.
create index if not exists engine_state_portal_token_hash
  on engine_state ((doc->'story'->>'portal_token_hash'))
  where doc->'story'->>'portal_token_hash' is not null;

-- RLS is unchanged: inbound_replies and engine_state stay behind engine_authorized() (migration 0003).
