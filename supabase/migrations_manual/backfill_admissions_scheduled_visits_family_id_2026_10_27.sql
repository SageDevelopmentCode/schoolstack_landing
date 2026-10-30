-- 2026-10-27: Backfill family_id on application-booked scheduled visits
-- Run in Supabase SQL Editor (migrations_manual is not applied by db reset / CI).

UPDATE admissions_scheduled_visits sv
SET family_id = a.family_id,
    updated_at = now()
FROM applications a
WHERE sv.application_id = a.id
  AND sv.family_id IS NULL
  AND a.family_id IS NOT NULL;
