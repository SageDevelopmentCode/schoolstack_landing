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
