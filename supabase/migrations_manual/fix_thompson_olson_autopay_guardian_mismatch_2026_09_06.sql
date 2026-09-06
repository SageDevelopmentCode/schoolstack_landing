-- Thompson + Olson autopay guardian mismatch remediation (2026-09-06)
--
-- Root cause: autopay stored in metadata.autopayByGuardian but families have no
-- billing split, so tuition_charges.guardian_id is NULL and the cron skipped them.
-- Code fix in autopay.ts handles this going forward; this SQL aligns stored state.
--
-- Paste into Supabase SQL Editor. Review IDs before running.

-- Verify current state
select
  f.name,
  tba.autopay_enabled,
  tba.metadata->'autopayByGuardian' as autopay_by_guardian,
  (select count(*) from tuition_billing_splits tbs where tbs.family_id = f.id) as split_count
from tuition_billing_accounts tba
join families f on f.id = tba.family_id
where tba.family_id in (
  'c1d2e3f4-a5b6-4789-c123-456789abcde0',  -- Thompson
  '5ec9c59c-1065-4269-a331-991016acc32d'   -- Olson
);

begin;

-- Families with autopayByGuardian but NO billing split should use family-level autopay.
update tuition_billing_accounts tba
set autopay_enabled = true
where tba.family_id in (
  'c1d2e3f4-a5b6-4789-c123-456789abcde0',  -- Thompson
  '5ec9c59c-1065-4269-a331-991016acc32d'   -- Olson
)
and autopay_enabled = false
and exists (
  select 1
  from jsonb_each_text(coalesce(tba.metadata->'autopayByGuardian', '{}'::jsonb)) e
  where e.value = 'true'
)
and not exists (
  select 1 from tuition_billing_splits tbs where tbs.family_id = tba.family_id
);

commit;

-- Verify after running:
-- select f.name, tba.autopay_enabled, tba.metadata->'autopayByGuardian'
-- from tuition_billing_accounts tba
-- join families f on f.id = tba.family_id
-- where tba.family_id in (
--   'c1d2e3f4-a5b6-4789-c123-456789abcde0',
--   '5ec9c59c-1065-4269-a331-991016acc32d'
-- );
