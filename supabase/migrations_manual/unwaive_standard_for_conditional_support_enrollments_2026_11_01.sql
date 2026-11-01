-- 2026-11-01: Un-waive Standard Enrollment Agreement for enrollments started with conditional_support.
-- After app deploy, families with conditional support should see standard + conditional agreements.
--
-- Also reopens completed checklists when the standard step becomes required again, so apply/parent
-- loaders and incomplete-agreement banners reflect outstanding work. Applications and enrollments
-- stay enrolled when already finalized (same pattern as std-2 amendment repairs).
--
-- Idempotent: only updates waived standard items; re-runs checklist reopen for stale completed
-- checklists if v1 of this script already set items to not_started.
--
-- Example: Landeen Family (Maggie) checklist ea6bc240-2751-4a47-bce1-2e352799d892
-- Run in Supabase SQL Editor (production). Not applied by supabase db reset / CI.

begin;

-- Step A: un-waive waived standard agreement → in_progress (enables incomplete-agreement banners)
with affected_items as (
  select eci.id, eci.checklist_id
  from public.enrollment_checklist_items eci
  join public.enrollment_checklists ec on ec.id = eci.checklist_id
  join public.enrollment_checklist_template_items ti
    on ti.template_id = ec.template_id
   and ti.id = eci.template_item_id
  where eci.status = 'waived'
    and ti.item_key = 'standard_enrollment_agreement'
    and (ti.metadata->'variant'->>'isDefault')::boolean is true
    and exists (
      select 1
      from jsonb_each(coalesce(ec.metadata->'variantResolutions', '{}'::jsonb)) resolution
      where resolution.value->>'variantKey' = 'conditional_support'
    )
),
updated_items as (
  update public.enrollment_checklist_items eci
  set
    status = 'in_progress',
    completed_at = null,
    completed_by_user_id = null,
    updated_at = now()
  from affected_items ai
  where eci.id = ai.id
  returning eci.checklist_id
),
affected_checklists as (
  select distinct checklist_id from updated_items
),
updated_checklists as (
  update public.enrollment_checklists ec
  set status = 'in_progress', updated_at = now()
  from affected_checklists ac
  where ec.id = ac.checklist_id
    and ec.status = 'completed'
  returning ec.id
)
select
  (select count(*) from updated_items) as items_unwaived,
  (select count(*) from updated_checklists) as checklists_reopened_from_unwaive;

-- Step B: v1 follow-up — promote not_started → in_progress and reopen stale completed checklists
with affected_not_started as (
  select eci.id, eci.checklist_id
  from public.enrollment_checklist_items eci
  join public.enrollment_checklists ec on ec.id = eci.checklist_id
  join public.enrollment_checklist_template_items ti
    on ti.template_id = ec.template_id
   and ti.id = eci.template_item_id
  where eci.status = 'not_started'
    and ti.item_key = 'standard_enrollment_agreement'
    and (ti.metadata->'variant'->>'isDefault')::boolean is true
    and exists (
      select 1
      from jsonb_each(coalesce(ec.metadata->'variantResolutions', '{}'::jsonb)) resolution
      where resolution.value->>'variantKey' = 'conditional_support'
    )
),
promoted_items as (
  update public.enrollment_checklist_items eci
  set
    status = 'in_progress',
    completed_at = null,
    completed_by_user_id = null,
    updated_at = now()
  from affected_not_started ans
  where eci.id = ans.id
  returning eci.checklist_id
),
stale_completed_checklists as (
  select distinct ec.id as checklist_id
  from public.enrollment_checklists ec
  join public.enrollment_checklist_items eci on eci.checklist_id = ec.id
  join public.enrollment_checklist_template_items ti
    on ti.template_id = ec.template_id
   and ti.id = eci.template_item_id
  where ec.status = 'completed'
    and eci.status in ('not_started', 'in_progress')
    and ti.item_key = 'standard_enrollment_agreement'
    and (ti.metadata->'variant'->>'isDefault')::boolean is true
    and exists (
      select 1
      from jsonb_each(coalesce(ec.metadata->'variantResolutions', '{}'::jsonb)) resolution
      where resolution.value->>'variantKey' = 'conditional_support'
    )
),
updated_stale_checklists as (
  update public.enrollment_checklists ec
  set status = 'in_progress', updated_at = now()
  from stale_completed_checklists scc
  where ec.id = scc.checklist_id
  returning ec.id
)
select
  (select count(*) from promoted_items) as items_promoted_from_not_started,
  (select count(*) from updated_stale_checklists) as stale_checklists_reopened;

commit;

-- Verification: outstanding standard agreement on conditional_support enrollments
select
  ec.id as checklist_id,
  ec.status as checklist_status,
  a.id as application_id,
  a.status as application_status,
  eci.id as standard_item_id,
  eci.status as standard_item_status
from public.enrollment_checklists ec
join public.applications a on a.id = ec.application_id
join public.enrollment_checklist_items eci on eci.checklist_id = ec.id
join public.enrollment_checklist_template_items ti
  on ti.template_id = ec.template_id
 and ti.id = eci.template_item_id
where ti.item_key = 'standard_enrollment_agreement'
  and (ti.metadata->'variant'->>'isDefault')::boolean is true
  and exists (
    select 1
    from jsonb_each(coalesce(ec.metadata->'variantResolutions', '{}'::jsonb)) resolution
    where resolution.value->>'variantKey' = 'conditional_support'
  )
  and eci.status in ('in_progress', 'not_started', 'waived')
order by ec.updated_at desc;
