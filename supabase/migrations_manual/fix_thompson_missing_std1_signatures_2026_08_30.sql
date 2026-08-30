-- Verify Thompson family enrollment agreement state (Amelia / Maggie + Nina).
-- Date: 2026-08-30
--
-- Amelia's agreements are in_progress with std-2..std-5 signed but std-1 missing.
-- No data mutation is required: after deploying the resumeSectionId fix, she can
-- tap "Complete agreement" on std-5 and will be routed to std-1 to finish signing.
--
-- Run in Supabase SQL Editor (manual paste only).

-- Maggie Thompson — application 27d8e9f0-a1b2-4345-c789-abcdef012346
select
  s.first_name,
  eci.id as instance_id,
  eci.status,
  eci.responses->'pendingResignSectionIds' as pending_resign,
  (
    select jsonb_agg(sig->>'sectionId' order by ordinality)
    from jsonb_array_elements(eci.responses->'sectionSignatures') with ordinality as t(sig, ordinality)
  ) as signed_section_ids,
  eci.updated_at
from public.enrollment_checklist_items eci
join public.enrollment_checklists ec on ec.id = eci.checklist_id
join public.applications a on a.id = ec.application_id
join public.students s on s.id = a.student_id
join public.enrollment_checklist_template_items ti on ti.id = eci.template_item_id
where eci.id = '2a9969e5-6d34-4e14-b5c6-37b627b1578f'
  and ti.metadata->'variant'->>'variantKey' = 'standard';

-- Nina Thompson — application f4a5b6c7-d8e9-4012-f456-789abcdef013
select
  s.first_name,
  eci.id as instance_id,
  eci.status,
  eci.responses->'pendingResignSectionIds' as pending_resign,
  (
    select jsonb_agg(sig->>'sectionId' order by ordinality)
    from jsonb_array_elements(eci.responses->'sectionSignatures') with ordinality as t(sig, ordinality)
  ) as signed_section_ids,
  eci.updated_at
from public.enrollment_checklist_items eci
join public.enrollment_checklists ec on ec.id = eci.checklist_id
join public.applications a on a.id = ec.application_id
join public.students s on s.id = a.student_id
join public.enrollment_checklist_template_items ti on ti.id = eci.template_item_id
where eci.id = '616f511c-dbe5-4560-ad28-701199fe4d63'
  and ti.metadata->'variant'->>'variantKey' = 'standard';

-- Expect after Amelia completes signing: status = completed, signed_section_ids includes std-1..std-5

-- ═══════════════════════════════════════════════════════════════════════════════
-- EMERGENCY ONLY (before code deploy): backfill missing std-1 and mark completed.
-- Leave commented unless you need an immediate unblock without the app fix.
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- begin;
--
-- update public.enrollment_checklist_items eci
-- set
--   status = 'completed',
--   completed_at = coalesce(eci.completed_at, now()),
--   responses = jsonb_set(
--     eci.responses,
--     '{sectionSignatures}',
--     (
--       select jsonb_agg(sig order by ordinality)
--       from (
--         select jsonb_build_object(
--           'sectionId', 'std-1',
--           'signerName', coalesce(
--             (eci.responses->'sectionSignatures'->0->>'signerName'),
--             eci.responses->>'signerName',
--             'Amelia Sisco Thompson'
--           ),
--           'signedAt', to_jsonb(now()::text)
--         ) as sig, 0 as ordinality
--         union all
--         select sig, ordinality
--         from jsonb_array_elements(eci.responses->'sectionSignatures') with ordinality as t(sig, ordinality)
--         where sig->>'sectionId' <> 'std-1'
--       ) ordered
--     ),
--     false
--   ),
--   updated_at = now()
-- where eci.id in (
--   '2a9969e5-6d34-4e14-b5c6-37b627b1578f',
--   '616f511c-dbe5-4560-ad28-701199fe4d63'
-- )
--   and eci.status = 'in_progress'
--   and not exists (
--     select 1
--     from jsonb_array_elements(eci.responses->'sectionSignatures') sig
--     where sig->>'sectionId' = 'std-1'
--   );
--
-- commit;
