-- Backfill family incomplete-admissions reminder state from legacy per-application
-- draft_reminder_sent_at (old one-shot draft reminder sender, removed 2026-09-16).
--
-- Run AFTER:
--   20261002_add_family_incomplete_admissions_reminders.sql (family columns exist)
--
-- Idempotent: only updates families where incomplete_admissions_reminder_count = 0.
-- Safe to re-run.
--
-- Semantics:
--   Any prior legacy send → count = 1 (first reminder already sent).
--   sent_at = latest draft_reminder_sent_at across the family's applications.
--   Old system had no second reminder, so never backfill count = 2.

-- Pre-check: families that would be backfilled
-- select
--   f.id,
--   f.organization_id,
--   legacy.last_sent_at
-- from public.families f
-- join (
--   select
--     a.family_id,
--     max(a.draft_reminder_sent_at) as last_sent_at
--   from public.applications a
--   where a.draft_reminder_sent_at is not null
--     and a.family_id is not null
--   group by a.family_id
-- ) legacy on legacy.family_id = f.id
-- where f.incomplete_admissions_reminder_count = 0;

update public.families f
set
  incomplete_admissions_reminder_count = 1,
  incomplete_admissions_reminder_sent_at = legacy.last_sent_at
from (
  select
    a.family_id,
    max(a.draft_reminder_sent_at) as last_sent_at
  from public.applications a
  where a.draft_reminder_sent_at is not null
    and a.family_id is not null
  group by a.family_id
) legacy
where f.id = legacy.family_id
  and f.incomplete_admissions_reminder_count = 0;

-- Post-check: families with reminder tracking set (expect 0 in prod today if no legacy sends)
-- select count(*) from public.families where incomplete_admissions_reminder_count > 0;
