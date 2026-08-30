-- Clean up Julius Cecilia demo drafts and put Caleb into enrollment agreement amendment state.
-- Date: 2026-08-29
-- Target org: rooted-meadows-demo
-- Target user: juliuscecilia33@gmail.com (62fb8359-5366-4cb6-bbbf-d008389bb824)
-- Target application: ac48c884-a892-473e-8264-890c940156d6 (Caleb Cecilia)
-- Target agreement instance: 381bb968-9f5f-4d72-8f14-765dde726d87
--
-- Run in Supabase SQL Editor. Idempotent: draft delete is a no-op if already removed;
-- amendment step only affects Caleb's completed standard agreement instance.
--
-- Optional: if std-2 template text was never updated on demo, run Step A from
-- update_rooted_meadows_demo_std2_withdrawal_2026_08_16.sql first (or uncomment below).
--
-- After running, test as juliuscecilia33@gmail.com on rooted-meadows-demo:
--   Parent portal: /school/rooted-meadows-demo/parent/portal
--   Enrollment:    /school/rooted-meadows-demo/apply/ac48c884-a892-473e-8264-890c940156d6/enrollment

-- ═══════════════════════════════════════════════════════════════════════════════
-- PRE-FLIGHT — confirm targets (expect 8 drafts, Caleb agreement completed)
-- ═══════════════════════════════════════════════════════════════════════════════

select a.id, a.status, a.created_at
from public.applications a
join public.organizations o on o.id = a.organization_id
where o.slug = 'rooted-meadows-demo'
  and a.created_by_user_id = (
    select id from auth.users where email = 'juliuscecilia33@gmail.com'
  )
  and a.status = 'draft'
order by a.created_at desc;

select
  eci.id as instance_id,
  eci.status,
  jsonb_array_length(coalesce(eci.responses->'sectionSignatures', '[]'::jsonb)) as signature_count,
  eci.responses->'pendingResignSectionIds' as pending_resign
from public.enrollment_checklist_items eci
where eci.id = '381bb968-9f5f-4d72-8f14-765dde726d87';

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1 — Remove draft applications for Julius on rooted-meadows-demo
-- ═══════════════════════════════════════════════════════════════════════════════

begin;

delete from public.applications a
using public.organizations o
where a.organization_id = o.id
  and o.slug = 'rooted-meadows-demo'
  and a.created_by_user_id = (
    select id from auth.users where email = 'juliuscecilia33@gmail.com'
  )
  and a.status = 'draft';

commit;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2 — Trigger amendment / re-sign state for Caleb only
-- (scoped copy of Step B from update_rooted_meadows_demo_std2_withdrawal_2026_08_16.sql)
-- ═══════════════════════════════════════════════════════════════════════════════

begin;

do $$
declare
  v_org_slug text := 'rooted-meadows-demo';
  v_org_id uuid;
  v_user_email text := 'juliuscecilia33@gmail.com';
  v_application_id uuid := 'ac48c884-a892-473e-8264-890c940156d6';
  v_instance_id uuid := '381bb968-9f5f-4d72-8f14-765dde726d87';
  v_standard_template_item_id uuid := '86b6945d-7581-451d-a8e8-16766aacb74b';
  v_resign_section_id text := 'std-2';
  v_amendment_notice text := 'The Withdrawal and Termination section of your enrollment agreement was updated. Please review and re-sign.';
  v_filtered_signatures jsonb;
  v_checklist_id uuid;
  v_reset_instances int;
  v_reset_checklists int;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = v_org_slug;

  if v_org_id is null then
    raise exception 'Organization % not found.', v_org_slug;
  end if;

  if not exists (
    select 1
    from public.applications a
    where a.id = v_application_id
      and a.organization_id = v_org_id
      and a.created_by_user_id = (select id from auth.users where email = v_user_email)
  ) then
    raise exception 'Application % not found for % on %.', v_application_id, v_user_email, v_org_slug;
  end if;

  select
    eci.checklist_id,
    coalesce(
      (
        select jsonb_agg(sig order by ordinality)
        from jsonb_array_elements(eci.responses->'sectionSignatures') with ordinality as t(sig, ordinality)
        where sig->>'sectionId' <> v_resign_section_id
      ),
      '[]'::jsonb
    )
  into v_checklist_id, v_filtered_signatures
  from public.enrollment_checklist_items eci
  where eci.id = v_instance_id
    and eci.organization_id = v_org_id
    and eci.template_item_id = v_standard_template_item_id
    and eci.status = 'completed';

  if v_checklist_id is null then
    raise notice 'Step 2 skipped: instance % is not a completed standard agreement (may already be in amendment state).', v_instance_id;
    return;
  end if;

  update public.enrollment_checklist_items eci
  set
    status = 'in_progress',
    completed_at = null,
    completed_by_user_id = null,
    responses = (
      coalesce(eci.responses, '{}'::jsonb)
      - 'sectionSignatures'
      - 'amendmentNotice'
      - 'pendingResignSectionIds'
    )
    || jsonb_build_object(
      'sectionSignatures', v_filtered_signatures,
      'amendmentNotice', v_amendment_notice,
      'pendingResignSectionIds', jsonb_build_array(v_resign_section_id)
    ),
    updated_at = now()
  where eci.id = v_instance_id;

  get diagnostics v_reset_instances = row_count;
  raise notice 'Step 2: reset % agreement instance(s) for Caleb re-sign.', v_reset_instances;

  update public.enrollment_checklists ec
  set status = 'in_progress', updated_at = now()
  where ec.id = v_checklist_id
    and ec.status = 'completed';

  get diagnostics v_reset_checklists = row_count;
  raise notice 'Step 2: set % enrollment checklist(s) back to in_progress.', v_reset_checklists;
end $$;

commit;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFY
-- ═══════════════════════════════════════════════════════════════════════════════

-- Expect: 0 draft applications for Julius
select count(*) as remaining_drafts
from public.applications a
join public.organizations o on o.id = a.organization_id
where o.slug = 'rooted-meadows-demo'
  and a.created_by_user_id = (
    select id from auth.users where email = 'juliuscecilia33@gmail.com'
  )
  and a.status = 'draft';

-- Expect: 3 enrolled applications (Caleb, Jon, Julia)
select a.id, a.status, s.first_name, s.last_name
from public.applications a
join public.organizations o on o.id = a.organization_id
left join public.students s on s.id = a.student_id
where o.slug = 'rooted-meadows-demo'
  and a.created_by_user_id = (
    select id from auth.users where email = 'juliuscecilia33@gmail.com'
  )
order by s.first_name;

-- Expect: Caleb agreement in_progress, pending ["std-2"], 4 signatures (std-2 removed)
select
  eci.id as instance_id,
  eci.status,
  eci.responses->'pendingResignSectionIds' as pending_resign,
  eci.responses->>'amendmentNotice' as amendment_notice,
  jsonb_array_length(coalesce(eci.responses->'sectionSignatures', '[]'::jsonb)) as signature_count,
  (
    select jsonb_agg(sig->>'sectionId' order by ordinality)
    from jsonb_array_elements(eci.responses->'sectionSignatures') with ordinality as t(sig, ordinality)
  ) as signed_section_ids,
  ec.status as checklist_status
from public.enrollment_checklist_items eci
join public.enrollment_checklists ec on ec.id = eci.checklist_id
where eci.id = '381bb968-9f5f-4d72-8f14-765dde726d87';

-- Optional: confirm std-2 template was updated on demo (content_revision > 1)
select
  dt.id,
  dt.content_revision,
  left(
    (
      select s->>'body'
      from jsonb_array_elements(dt.content->'sections') s
      where s->>'id' = 'std-2'
    ),
    120
  ) as std2_body_preview
from public.document_templates dt
join public.organizations o on o.id = dt.organization_id
join public.enrollment_checklist_template_items i on i.document_template_id = dt.id
where o.slug = 'rooted-meadows-demo'
  and i.metadata->'variant'->>'variantKey' = 'standard';

-- ═══════════════════════════════════════════════════════════════════════════════
-- OPTIONAL STEP 3 — Replicate Amelia's broken state on Caleb (missing std-1)
-- Uncomment to test the "Complete agreement" dead-end fix locally.
-- Leaves agreement in_progress with std-2..std-5 signed only.
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- begin;
--
-- update public.enrollment_checklist_items eci
-- set
--   status = 'in_progress',
--   completed_at = null,
--   completed_by_user_id = null,
--   responses = jsonb_set(
--     eci.responses,
--     '{sectionSignatures}',
--     coalesce(
--       (
--         select jsonb_agg(sig order by ordinality)
--         from jsonb_array_elements(eci.responses->'sectionSignatures') with ordinality as t(sig, ordinality)
--         where sig->>'sectionId' <> 'std-1'
--       ),
--       '[]'::jsonb
--     ),
--     false
--   ),
--   updated_at = now()
-- where eci.id = '381bb968-9f5f-4d72-8f14-765dde726d87'
--   and eci.status = 'completed';
--
-- update public.enrollment_checklists ec
-- set status = 'in_progress', updated_at = now()
-- where ec.id = (
--   select checklist_id
--   from public.enrollment_checklist_items
--   where id = '381bb968-9f5f-4d72-8f14-765dde726d87'
-- )
--   and ec.status = 'completed';
--
-- commit;
--
-- Test URL (open on std-5, tap Complete agreement — should jump to std-1):
-- /school/rooted-meadows-demo/apply/ac48c884-a892-473e-8264-890c940156d6/enrollment?item=86b6945d-7581-451d-a8e8-16766aacb74b&section=std-5
