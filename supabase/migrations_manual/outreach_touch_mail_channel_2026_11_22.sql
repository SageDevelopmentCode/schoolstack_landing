-- Handwritten founder letters (/admin/research): log "letter mailed" as a crm_outreach_touches row
-- with channel = 'mail'. The funnel holds the first email until 5 business days after it.
-- Run after: 20261174_demo_requests_meeting_link.sql

alter table public.crm_outreach_touches
  drop constraint if exists crm_outreach_touches_channel_check;

alter table public.crm_outreach_touches
  add constraint crm_outreach_touches_channel_check
  check (channel in ('email', 'instagram', 'facebook', 'linkedin', 'phone', 'in_person', 'mail', 'other'));
