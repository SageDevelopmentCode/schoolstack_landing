-- Track daily unread workspace digest per committee section (messages, tasks, resources, calendar).
-- Run after: 20261110_committee_member_section_reads.sql

alter table public.committee_member_section_reads
  add column if not exists last_unread_digest_notified_at timestamptz;
