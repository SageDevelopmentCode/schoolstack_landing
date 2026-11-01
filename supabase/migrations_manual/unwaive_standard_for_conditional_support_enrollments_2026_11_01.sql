-- 2026-11-01: Un-waive Standard Enrollment Agreement for enrollments started with conditional_support.
-- After app deploy, families with conditional support should see standard + conditional agreements.
-- Idempotent: only updates checklist items currently waived.
--
-- Example: Landeen Family (Maggie) checklist ea6bc240-2751-4a47-bce1-2e352799d892
-- Run in Supabase SQL Editor (production). Not applied by supabase db reset / CI.

begin;

update public.enrollment_checklist_items eci
set
  status = 'not_started',
  updated_at = now()
from public.enrollment_checklists ec
join public.enrollment_checklist_template_items ti
  on ti.template_id = ec.template_id
where eci.checklist_id = ec.id
  and eci.template_item_id = ti.id
  and eci.status = 'waived'
  and ti.item_key = 'standard_enrollment_agreement'
  and (ti.metadata->'variant'->>'isDefault')::boolean is true
  and exists (
    select 1
    from jsonb_each(coalesce(ec.metadata->'variantResolutions', '{}'::jsonb)) resolution
    where resolution.value->>'variantKey' = 'conditional_support'
  );

commit;
