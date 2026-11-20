-- Claim an outreach step before emailing it, so two admins (or two tabs) can't both send it.
-- sendOutreachEmail inserts a 'sending' row first; the unique index below rejects a second
-- claim for the same school + step, and the row is updated to its final status after Zoho replies.
-- Run after: 20261171_add_crm_outreach_emails.sql

alter table public.crm_outreach_emails
  drop constraint if exists crm_outreach_emails_status_check;
alter table public.crm_outreach_emails
  add constraint crm_outreach_emails_status_check
  check (status in ('sending', 'sent', 'skipped_unsubscribed', 'failed', 'logged'));

-- A step goes out once per school, counting in-flight sends (failed / skipped attempts can be retried).
drop index if exists public.crm_outreach_emails_one_success_per_step;
create unique index crm_outreach_emails_one_success_per_step
  on public.crm_outreach_emails (school_id, step_id)
  where status in ('sending', 'sent', 'logged');
