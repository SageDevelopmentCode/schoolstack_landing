-- Promoted to supabase/migrations/20261112_public_form_submission_check_and_record.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- 2026-09-30: Check vs record split for public marketing form rate limits.

create or replace function public.check_public_form_submission_allowed(
  p_form text,
  p_ip text,
  p_email text
)
returns table (allowed boolean, error_message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_ip text;
  v_ip_count int;
  v_email_hourly int;
  v_email_gap int;
begin
  v_email := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_ip := nullif(trim(coalesce(p_ip, '')), '');

  if v_ip is not null then
    select count(*)::int into v_ip_count
    from public.public_form_submission_events e
    where e.form = p_form
      and e.ip = v_ip
      and e.created_at > now() - interval '1 hour';

    if v_ip_count >= 10 then
      allowed := false;
      error_message := 'Too many submissions from this network. Please try again later.';
      return next;
      return;
    end if;
  end if;

  if v_email is not null then
    select count(*)::int into v_email_hourly
    from public.public_form_submission_events e
    where e.form = p_form
      and e.email = v_email
      and e.created_at > now() - interval '1 hour';

    if v_email_hourly >= 3 then
      allowed := false;
      error_message := 'Too many submissions for this email. Please try again later.';
      return next;
      return;
    end if;

    select count(*)::int into v_email_gap
    from public.public_form_submission_events e
    where e.form = p_form
      and e.email = v_email
      and e.created_at > now() - interval '60 seconds';

    if v_email_gap >= 1 then
      allowed := false;
      error_message := 'Please wait a moment before submitting again.';
      return next;
      return;
    end if;
  end if;

  allowed := true;
  error_message := null;
  return next;
end;
$$;

create or replace function public.record_public_form_submission_event(
  p_form text,
  p_ip text,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_ip text;
begin
  v_email := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_ip := nullif(trim(coalesce(p_ip, '')), '');

  insert into public.public_form_submission_events (form, ip, email)
  values (p_form, v_ip, v_email);
end;
$$;

revoke all on function public.check_public_form_submission_allowed(text, text, text)
  from public;

grant execute on function public.check_public_form_submission_allowed(text, text, text)
  to service_role;

revoke all on function public.record_public_form_submission_event(text, text, text)
  from public;

grant execute on function public.record_public_form_submission_event(text, text, text)
  to service_role;
