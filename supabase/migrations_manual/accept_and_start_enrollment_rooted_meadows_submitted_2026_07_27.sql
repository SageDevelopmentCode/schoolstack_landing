-- Accept and start enrollment for all rooted-meadows submitted applications (2026-07-27).
-- Mirrors admin "Start enrollment": enrolling status, in_progress checklist, not_started items.
-- Idempotent: skips applications not in submitted or that already have a checklist.
--
-- Target org: rooted-meadows production (8adbfe08-b25b-4626-b3ac-23424a1a0a3b)
-- Run in Supabase SQL Editor.

begin;

do $$
declare
  v_org_id uuid := '8adbfe08-b25b-4626-b3ac-23424a1a0a3b';
  v_application_ids uuid[] := array[
    'd5e6f7a8-b9c0-4123-d456-789abcdef012'::uuid,
    '07a8b9c0-d1e2-4345-a678-9abcdef01201'::uuid,
    '17c8d9e0-f1a2-4345-b678-9abcdef01234'::uuid,
    'c4d5e6f7-a8b9-4012-c345-6789abcdef01'::uuid,
    'f4a5b6c7-d8e9-4012-f345-6789abcdef02'::uuid,
    '3be2f3a4-b5c6-4789-d012-cdef01234567'::uuid,
    'd4e5f6a7-b8c9-4012-d345-6789abcdef01'::uuid,
    'e068aeff-fb65-45e4-a56b-c4a4c50c9f18'::uuid,
    'e8c306bd-0fe3-4686-9976-161d84a319f1'::uuid,
    '08b9c0d1-e2f3-4456-a789-abcdef012346'::uuid,
    'e4f5a6b7-c8d9-4012-e345-6789abcdef01'::uuid
  ];
  v_application_id uuid;
  v_program_id uuid;
  v_student_id uuid;
  v_enrollment_id uuid;
  v_template_id uuid;
  v_checklist_id uuid;
  v_standard_item_id uuid;
  v_group_id text;
  v_variant_resolutions jsonb;
  v_now timestamptz := now();
  v_started_count integer := 0;
begin
  foreach v_application_id in array v_application_ids loop
    if not exists (
      select 1
      from public.applications a
      where a.id = v_application_id
        and a.organization_id = v_org_id
        and a.status = 'submitted'
    ) then
      raise notice 'Skipping % — not submitted or not found.', v_application_id;
      continue;
    end if;

    if exists (
      select 1
      from public.enrollment_checklists ec
      where ec.application_id = v_application_id
    ) then
      raise notice 'Skipping % — enrollment checklist already exists.', v_application_id;
      continue;
    end if;

    select a.program_id, a.student_id
    into v_program_id, v_student_id
    from public.applications a
    where a.id = v_application_id;

    if v_program_id is null or v_student_id is null then
      raise exception 'Application % is missing student or program.', v_application_id;
    end if;

    update public.applications
    set status = 'accepted',
        updated_at = v_now
    where id = v_application_id;

    select e.id
    into v_enrollment_id
    from public.enrollments e
    where e.organization_id = v_org_id
      and e.student_id = v_student_id
      and e.program_id = v_program_id
    limit 1;

    if v_enrollment_id is null then
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

    select t.id
    into v_template_id
    from public.enrollment_checklist_templates t
    where t.organization_id = v_org_id
      and t.program_id = v_program_id
      and t.enrollment_path = 'enrollment'
      and t.status = 'published'
    order by t.updated_at desc
    limit 1;

    if v_template_id is null then
      raise exception 'No published enrollment checklist for application %.', v_application_id;
    end if;

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

    update public.applications
    set status = 'enrolling',
        updated_at = v_now
    where id = v_application_id;

    v_started_count := v_started_count + 1;
    raise notice 'Started enrollment for application % (checklist %).', v_application_id, v_checklist_id;
  end loop;

  raise notice 'Started enrollment for % application(s).', v_started_count;
end $$;

commit;
