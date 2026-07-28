-- Put Caleb Cecilia into enrolling state on rooted-meadows-demo with a fresh 10-step checklist.
-- Run AFTER sync_rooted_meadows_checklist_to_demo_2026_07_28.sql.
-- Does not touch rooted-meadows production or Julia's application.
--
-- Target: juliuscecilia33@gmail.com / Caleb Cecilia
-- Enrollment URL after run:
--   /school/rooted-meadows-demo/apply/ac48c884-a892-473e-8264-890c940156d6/enrollment
--
-- ═══════════════════════════════════════════════════════════════════════════════
-- PRE-FLIGHT — confirm Caleb exists and template has 10 steps
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- select s.first_name, s.last_name, a.id as application_id, a.status
-- from public.applications a
-- join public.students s on s.id = a.student_id
-- join public.organizations o on o.id = a.organization_id
-- where o.slug = 'rooted-meadows-demo'
--   and s.first_name = 'Caleb'
--   and s.last_name = 'Cecilia';
--
-- select count(*) as demo_template_items
-- from public.enrollment_checklist_template_items i
-- join public.enrollment_checklist_templates t on t.id = i.template_id
-- join public.organizations o on o.id = t.organization_id
-- where o.slug = 'rooted-meadows-demo'
--   and t.status = 'published';

begin;

do $$
declare
  v_org_slug text := 'rooted-meadows-demo';
  v_org_id uuid := '1085332b-aef4-4910-a35d-ccb2611d9b11';
  v_application_id uuid := 'ac48c884-a892-473e-8264-890c940156d6';
  v_student_id uuid := 'f420c417-7049-47dd-b07c-0cd1d3be9081';
  v_enrollment_id uuid := '19c3fb92-338c-4035-b083-11c0c9a1a6d1';
  v_program_id uuid;
  v_template_id uuid;
  v_checklist_id uuid;
  v_standard_item_id uuid;
  v_group_id text;
  v_variant_resolutions jsonb;
  v_item_count integer;
  v_now timestamptz := now();
begin
  if not exists (
    select 1
    from public.organizations
    where id = v_org_id
      and slug = v_org_slug
  ) then
    raise exception 'Demo org % (%) not found.', v_org_slug, v_org_id;
  end if;

  if not exists (
    select 1
    from public.applications a
    where a.id = v_application_id
      and a.organization_id = v_org_id
      and a.student_id = v_student_id
  ) then
    raise exception 'Caleb application % not found on demo org.', v_application_id;
  end if;

  select t.id into v_template_id
  from public.enrollment_checklist_templates t
  where t.organization_id = v_org_id
    and t.enrollment_path = 'enrollment'
    and t.status = 'published'
  order by t.updated_at desc
  limit 1;

  if v_template_id is null then
    raise exception 'No published enrollment checklist on demo. Run sync script first.';
  end if;

  select count(*) into v_item_count
  from public.enrollment_checklist_template_items i
  where i.template_id = v_template_id;

  if v_item_count < 10 then
    raise exception 'Demo checklist has % items (expected 10). Run sync script first.', v_item_count;
  end if;

  if exists (
    select 1
    from public.enrollment_checklists ec
    where ec.application_id = v_application_id
      and ec.status = 'in_progress'
  ) then
    raise notice 'Caleb already has an in-progress checklist — skipping materialization.';
    return;
  end if;

  select a.program_id into v_program_id
  from public.applications a
  where a.id = v_application_id;

  -- Reset enrolled state back to enrolling prerequisites
  update public.students
  set status = 'prospect',
      updated_at = v_now
  where id = v_student_id
    and organization_id = v_org_id;

  update public.enrollments
  set status = 'pending',
      updated_at = v_now
  where id = v_enrollment_id
    and organization_id = v_org_id
    and student_id = v_student_id;

  if not found then
    insert into public.enrollments (
      organization_id,
      student_id,
      program_id,
      status
    )
    values (
      v_org_id,
      v_student_id,
      v_program_id,
      'pending'
    )
    returning id into v_enrollment_id;
  end if;

  update public.applications
  set status = 'enrolling',
      updated_at = v_now
  where id = v_application_id
    and organization_id = v_org_id;

  select i.id,
         i.metadata->'variant'->>'groupId'
  into v_standard_item_id, v_group_id
  from public.enrollment_checklist_template_items i
  where i.template_id = v_template_id
    and i.metadata->'variant'->>'variantKey' = 'standard'
    and coalesce(i.metadata->'variant'->>'isDefault', 'false')::boolean = true
  limit 1;

  if v_standard_item_id is null then
    select i.id,
           i.metadata->'variant'->>'groupId'
    into v_standard_item_id, v_group_id
    from public.enrollment_checklist_template_items i
    where i.template_id = v_template_id
      and i.metadata->'variant'->>'variantKey' = 'standard'
    limit 1;
  end if;

  if v_standard_item_id is not null and v_group_id is not null then
    v_variant_resolutions := jsonb_build_object(
      v_group_id,
      jsonb_build_object(
        'templateItemId', v_standard_item_id::text,
        'variantKey', 'standard',
        'resolvedBy', 'admin',
        'resolvedAt', v_now
      )
    );
  else
    v_variant_resolutions := '{}'::jsonb;
  end if;

  insert into public.enrollment_checklists (
    organization_id,
    enrollment_id,
    application_id,
    template_id,
    status,
    metadata
  )
  values (
    v_org_id,
    v_enrollment_id,
    v_application_id,
    v_template_id,
    'in_progress',
    jsonb_build_object('variantResolutions', v_variant_resolutions)
  )
  returning id into v_checklist_id;

  insert into public.enrollment_checklist_items (
    checklist_id,
    organization_id,
    template_item_id,
    item_key,
    status,
    payment_status
  )
  select
    v_checklist_id,
    v_org_id,
    ti.id,
    ti.item_key,
    case
      when ti.metadata ? 'variant'
        and (v_variant_resolutions = '{}'::jsonb
          or not (
            v_variant_resolutions ? (ti.metadata->'variant'->>'groupId')
            and (v_variant_resolutions->(ti.metadata->'variant'->>'groupId'))->>'templateItemId' = ti.id::text
          ))
      then 'waived'
      else 'not_started'
    end,
    case
      when ti.type = 'payment'
        and not (
          ti.metadata ? 'variant'
          and (v_variant_resolutions = '{}'::jsonb
            or not (
              v_variant_resolutions ? (ti.metadata->'variant'->>'groupId')
              and (v_variant_resolutions->(ti.metadata->'variant'->>'groupId'))->>'templateItemId' = ti.id::text
            ))
        )
      then 'pending'
      else 'not_required'
    end
  from public.enrollment_checklist_template_items ti
  where ti.template_id = v_template_id;

  raise notice 'Caleb enrollment checklist created: % (% items).', v_checklist_id, v_item_count;
  raise notice 'Open: /school/rooted-meadows-demo/apply/%/enrollment', v_application_id;
end $$;

commit;

-- ═══════════════════════════════════════════════════════════════════════════════
-- POST-FLIGHT — expect enrolling / in_progress / 10 instance items
-- ═══════════════════════════════════════════════════════════════════════════════

select
  s.first_name,
  s.last_name,
  s.status as student_status,
  a.status as application_status,
  e.status as enrollment_status,
  ec.status as checklist_status,
  count(eci.id) as checklist_item_count
from public.applications a
join public.students s on s.id = a.student_id
left join public.enrollments e
  on e.student_id = a.student_id
 and e.program_id = a.program_id
 and e.organization_id = a.organization_id
left join public.enrollment_checklists ec on ec.application_id = a.id
left join public.enrollment_checklist_items eci on eci.checklist_id = ec.id
where a.id = 'ac48c884-a892-473e-8264-890c940156d6'
group by s.first_name, s.last_name, s.status, a.status, e.status, ec.status;

select eci.item_key, eci.status, eci.payment_status
from public.enrollment_checklist_items eci
join public.enrollment_checklists ec on ec.id = eci.checklist_id
where ec.application_id = 'ac48c884-a892-473e-8264-890c940156d6'
order by eci.item_key;

-- ═══════════════════════════════════════════════════════════════════════════════
-- OPTIONAL — bypass payment step without Stripe checkout (uncomment to run)
-- Use after testing steps 1–9. Marks payment item complete so enrollment can finalize.
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- begin;
--
-- update public.enrollment_checklist_items eci
-- set status = 'completed',
--     payment_status = 'paid',
--     responses = jsonb_build_object(
--       'adminBypass', true,
--       'bypassedAt', now(),
--       'note', 'Demo payment bypass for parent checklist QA'
--     ),
--     completed_at = now(),
--     updated_at = now()
-- from public.enrollment_checklists ec
-- where ec.id = eci.checklist_id
--   and ec.application_id = 'ac48c884-a892-473e-8264-890c940156d6'
--   and eci.item_key = 'payment_e2190666'
--   and eci.status <> 'completed';
--
-- commit;

-- ═══════════════════════════════════════════════════════════════════════════════
-- OPTIONAL — tear down Caleb checklist to re-run this script (uncomment to run)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- begin;
--
-- delete from public.application_payments ap
-- using public.enrollment_checklist_items eci,
--       public.enrollment_checklists ec
-- where ap.enrollment_checklist_item_id = eci.id
--   and eci.checklist_id = ec.id
--   and ec.application_id = 'ac48c884-a892-473e-8264-890c940156d6';
--
-- delete from public.enrollment_checklist_items eci
-- using public.enrollment_checklists ec
-- where eci.checklist_id = ec.id
--   and ec.application_id = 'ac48c884-a892-473e-8264-890c940156d6';
--
-- delete from public.enrollment_checklists
-- where application_id = 'ac48c884-a892-473e-8264-890c940156d6';
--
-- commit;
