-- Promoted to supabase/migrations/20261152_revoke_public_form_function_grants.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-11-08 — closes the open Phase 2 note in docs/parent-portal-audit.md.
--
-- No code dependency: the public forms rate-limit through the service role only.
-- Order relative to staff_only_reads_phase1b_step3_2026_11_08.sql does not matter.
--
-- HOW TO RUN SAFELY
--   1. Dry run (bottom of file): confirms anon and authenticated lose execute and the service
--      role keeps it. Always rolls back.
--   2. Run between the "=== MIGRATION ===" markers.
--   3. Smoke-check: submit a public form (support request / tour request) once from the website;
--      it should succeed. Discord should stay quiet.
--
-- === MIGRATION START ===

-- Public-form rate-limit functions are server-only: src/lib/public-forms/rate-limit.ts calls them
-- with the service-role client. 20261111 and 20261112 ran `revoke all ... from public`, but
-- Supabase grants execute to anon and authenticated directly (not through PUBLIC), so anyone with
-- the public key could still call them: fill the rate-limit table to block a real form, or probe
-- whether an email / IP is rate limited. Same root cause as finding C2 (20261146).
--
-- Service role keeps execute. No code change is needed.

revoke all on function public.check_public_form_submission_allowed(text, text, text)
  from public, anon, authenticated;
grant execute on function public.check_public_form_submission_allowed(text, text, text)
  to service_role;

revoke all on function public.record_public_form_submission_event(text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_public_form_submission_event(text, text, text)
  to service_role;

revoke all on function public.record_public_form_submission_if_allowed(text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_public_form_submission_if_allowed(text, text, text)
  to service_role;

-- === MIGRATION END ===

-- ===========================================================================
-- DRY RUN (copy this whole block; it never commits)
-- ===========================================================================
--
-- begin;
--
--   -- >>> paste the MIGRATION body here <<<
--
--   select p.proname,
--          has_function_privilege('anon', p.oid, 'execute') as anon_can_execute,           -- expect false
--          has_function_privilege('authenticated', p.oid, 'execute') as auth_can_execute,  -- expect false
--          has_function_privilege('service_role', p.oid, 'execute') as service_can_execute -- expect true
--   from pg_proc p
--   join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public'
--     and p.proname in (
--       'check_public_form_submission_allowed',
--       'record_public_form_submission_event',
--       'record_public_form_submission_if_allowed'
--     );
--
-- rollback;  -- never commit the dry run

-- ===========================================================================
-- ROLLBACK (re-opens the functions to the public key; only if a public form stops working)
-- ===========================================================================
--
-- begin;
--   grant execute on function public.check_public_form_submission_allowed(text, text, text)
--     to anon, authenticated;
--   grant execute on function public.record_public_form_submission_event(text, text, text)
--     to anon, authenticated;
--   grant execute on function public.record_public_form_submission_if_allowed(text, text, text)
--     to anon, authenticated;
-- commit;
