-- Backfill Arrow Calvert's enrollment checklist after admin mark-as-enrolled bypass.
-- Creates a completed checklist with all steps (including supply/activity fees) marked paid.
-- Idempotent: when a completed checklist already exists, syncs only missing template items.
--
-- Target: rooted-meadows production import from import_rooted_meadows_submission_calvert_arrow.sql
-- Run in Supabase SQL Editor after seed_rooted_meadows_enrollment_fee_steps.sql (if payment steps missing).

begin;

do $$
declare
  v_org_id uuid := '8adbfe08-b25b-4626-b3ac-23424a1a0a3b';
  v_application_id uuid := 'd4e5f6a7-b8c9-4012-e345-6789abcdef01';
  v_program_id uuid;
  v_student_id uuid;
  v_family_id uuid;
  v_enrollment_id uuid;
  v_template_id uuid;
  v_checklist_id uuid;
  v_standard_item_id uuid;
  v_group_id text;
  v_variant_resolutions jsonb;
  v_now timestamptz := now();
begin
  select a.program_id, a.student_id, a.family_id
  into v_program_id, v_student_id, v_family_id
  from public.applications a
  where a.id = v_application_id
    and a.organization_id = v_org_id;

  if v_program_id is null then
    raise notice 'Arrow Calvert application not found — skipping backfill.';
    return;
  end if;

  if exists (
    select 1
    from public.enrollment_checklists ec
    where ec.application_id = v_application_id
      and ec.status = 'completed'
  ) then
    select ec.id, ec.template_id
    into v_checklist_id, v_template_id
    from public.enrollment_checklists ec
    where ec.application_id = v_application_id
      and ec.status = 'completed'
    limit 1;

    insert into public.enrollment_checklist_items (
      checklist_id,
      organization_id,
      template_item_id,
      item_key,
      status,
      payment_status,
      responses,
      completed_at
    )
    select
      v_checklist_id,
      v_org_id,
      ti.id,
      ti.item_key,
      'completed',
      case when ti.type = 'payment' then 'paid' else 'not_required' end,
      jsonb_build_object('adminBypass', true, 'bypassedAt', v_now, 'note', 'Synced missing template items'),
      v_now
    from public.enrollment_checklist_template_items ti
    where ti.template_id = v_template_id
      and not exists (
        select 1
        from public.enrollment_checklist_items eci
        where eci.checklist_id = v_checklist_id
          and eci.template_item_id = ti.id
      );

    raise notice 'Arrow Calvert completed checklist exists — synced missing items for checklist %', v_checklist_id;
    return;
  end if;

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
      'enrolled'
    )
    returning id into v_enrollment_id;
  else
    update public.enrollments
    set status = 'enrolled',
        updated_at = v_now
    where id = v_enrollment_id;
  end if;

  update public.students
  set status = 'active',
      updated_at = v_now
  where id = v_student_id;

  update public.applications
  set status = 'enrolled',
      updated_at = v_now
  where id = v_application_id;

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
    raise exception 'No published enrollment checklist found for Arrow Calvert program.';
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

  select ec.id
  into v_checklist_id
  from public.enrollment_checklists ec
  where ec.application_id = v_application_id
  limit 1;

  if v_checklist_id is null then
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
  else
    update public.enrollment_checklists
    set metadata = jsonb_build_object('variantResolutions', v_variant_resolutions),
        updated_at = v_now
    where id = v_checklist_id;
  end if;

  insert into public.enrollment_checklist_items (
    checklist_id,
    organization_id,
    template_item_id,
    item_key,
    status,
    payment_status,
    responses,
    completed_at
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
      else 'completed'
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
      then 'paid'
      else 'not_required'
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
      then jsonb_build_object('adminBypass', true, 'bypassedAt', v_now)
      when ti.metadata ? 'variant'
        and (v_variant_resolutions = '{}'::jsonb
          or not (
            v_variant_resolutions ? (ti.metadata->'variant'->>'groupId')
            and (v_variant_resolutions->(ti.metadata->'variant'->>'groupId'))->>'templateItemId' = ti.id::text
          ))
      then '{}'::jsonb
      else jsonb_build_object('adminBypass', true, 'bypassedAt', v_now)
    end,
    case
      when ti.metadata ? 'variant'
        and (v_variant_resolutions = '{}'::jsonb
          or not (
            v_variant_resolutions ? (ti.metadata->'variant'->>'groupId')
            and (v_variant_resolutions->(ti.metadata->'variant'->>'groupId'))->>'templateItemId' = ti.id::text
          ))
      then null
      else v_now
    end
  from public.enrollment_checklist_template_items ti
  where ti.template_id = v_template_id
    and not exists (
      select 1
      from public.enrollment_checklist_items eci
      where eci.checklist_id = v_checklist_id
        and eci.template_item_id = ti.id
    );

  update public.enrollment_checklist_items eci
  set
    status = case
      when ti.metadata ? 'variant'
        and (v_variant_resolutions = '{}'::jsonb
          or not (
            v_variant_resolutions ? (ti.metadata->'variant'->>'groupId')
            and (v_variant_resolutions->(ti.metadata->'variant'->>'groupId'))->>'templateItemId' = ti.id::text
          ))
      then 'waived'
      else 'completed'
    end,
    payment_status = case
      when ti.type = 'payment'
        and not (
          ti.metadata ? 'variant'
          and (v_variant_resolutions = '{}'::jsonb
            or not (
              v_variant_resolutions ? (ti.metadata->'variant'->>'groupId')
              and (v_variant_resolutions->(ti.metadata->'variant'->>'groupId'))->>'templateItemId' = ti.id::text
            ))
        )
      then 'paid'
      else eci.payment_status
    end,
    responses = coalesce(eci.responses, '{}'::jsonb) || jsonb_build_object(
      'adminBypass', true,
      'bypassedAt', v_now
    ),
    completed_at = coalesce(eci.completed_at, v_now),
    updated_at = v_now
  from public.enrollment_checklist_template_items ti
  where eci.checklist_id = v_checklist_id
    and eci.template_item_id = ti.id
    and eci.status <> 'waived';

  update public.enrollment_checklists
  set status = 'completed',
      updated_at = v_now
  where id = v_checklist_id;

  raise notice 'Backfilled completed enrollment checklist for Arrow Calvert: %', v_checklist_id;
end $$;

-- Record enrollment checklist payments in the unified ledger for Payments + Finances.
insert into public.application_payments (
  organization_id,
  application_id,
  payment_type,
  enrollment_checklist_item_id,
  label,
  amount_cents,
  charged_amount_cents,
  processing_fee_cents,
  currency,
  status,
  paid_at,
  created_at
)
select
  eci.organization_id,
  ec.application_id,
  'enrollment_checklist',
  eci.id,
  coalesce(fd.label, ti.label, 'Enrollment payment'),
  coalesce(fd.amount_cents, 0),
  coalesce(fd.amount_cents, 0),
  0,
  coalesce(fd.currency, 'USD'),
  'succeeded',
  coalesce(eci.completed_at, eci.updated_at, now()),
  coalesce(eci.completed_at, eci.updated_at, now())
from public.enrollment_checklist_items eci
join public.enrollment_checklists ec on ec.id = eci.checklist_id
join public.enrollment_checklist_template_items ti on ti.id = eci.template_item_id
left join public.fee_definitions fd on fd.id = ti.fee_definition_id
where ec.application_id = 'd4e5f6a7-b8c9-4012-e345-6789abcdef01'
  and eci.payment_status = 'paid'
  and ti.type = 'payment'
  and coalesce(fd.amount_cents, 0) > 0
  and not exists (
    select 1
    from public.application_payments ap
    where ap.enrollment_checklist_item_id = eci.id
      and ap.status = 'succeeded'
  )
  and not (
    ti.item_key in ('supply_fee', 'activities_fee')
    and exists (
      select 1
      from public.enrollment_checklist_items legacy_eci
      join public.enrollment_checklist_template_items legacy_ti
        on legacy_ti.id = legacy_eci.template_item_id
      join public.application_payments legacy_ap
        on legacy_ap.enrollment_checklist_item_id = legacy_eci.id
      where legacy_eci.checklist_id = ec.id
        and legacy_ti.item_key = 'payment_e2190666'
        and legacy_ap.status = 'succeeded'
    )
  );

commit;
