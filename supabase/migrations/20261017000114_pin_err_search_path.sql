-- Hardening (not exploitable): manhunt._err was the only manhunt function without a pinned
-- search_path (Supabase linter: function_search_path_mutable). It is SECURITY INVOKER, not
-- executable by clients, and only raises, so there was no escalation path; pinning it keeps the
-- "every function pins its search_path" invariant checkable (supabase/tests/test_security.sql).

alter function manhunt._err(text, text) set search_path = pg_catalog, pg_temp;
