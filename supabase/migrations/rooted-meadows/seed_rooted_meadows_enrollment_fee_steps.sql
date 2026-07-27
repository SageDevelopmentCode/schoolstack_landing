-- Add Supply Fee and Activities Fee payment steps to Rooted Meadows enrollment checklist.
-- Safe to re-run: skips when item_keys already exist on the published template.
-- Target org: rooted-meadows

do $$
declare
  v_org_id uuid;
  v_program_id uuid;
  v_template_id uuid;
  v_supply_fee_id uuid;
  v_activities_fee_id uuid;
  v_supply_item_id uuid := gen_random_uuid();
  v_activities_item_id uuid := gen_random_uuid();
  v_sort_order integer;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows';

  if v_org_id is null then
    raise exception 'Organization rooted-meadows not found.';
  end if;

  select p.id into v_program_id
  from public.programs p
  where p.organization_id = v_org_id
    and p.name = 'School Year 2026–27'
  limit 1;

  if v_program_id is null then
    raise exception 'School Year 2026–27 program not found for rooted-meadows.';
  end if;

  select t.id into v_template_id
  from public.enrollment_checklist_templates t
  where t.organization_id = v_org_id
    and t.enrollment_path = 'enrollment'
    and t.status = 'published'
  order by t.updated_at desc
  limit 1;

  if v_template_id is null then
    raise exception 'No published enrollment checklist found for rooted-meadows.';
  end if;

  if exists (
    select 1
    from public.enrollment_checklist_template_items i
    where i.template_id = v_template_id
      and i.item_key = 'supply_fee'
  ) and exists (
    select 1
    from public.enrollment_checklist_template_items i
    where i.template_id = v_template_id
      and i.item_key = 'activities_fee'
  ) then
    raise notice 'Supply Fee and Activities Fee payment steps already exist — skipping.';
    return;
  end if;

  insert into public.fee_definitions (
    organization_id,
    program_id,
    code,
    label,
    amount_cents,
    currency,
    active
  )
  select
    v_org_id,
    v_program_id,
    'supply_fee',
    'Supply Fee',
    50000,
    'USD',
    true
  where not exists (
    select 1
    from public.fee_definitions fd
    where fd.organization_id = v_org_id
      and fd.code = 'supply_fee'
      and fd.active = true
  );

  insert into public.fee_definitions (
    organization_id,
    program_id,
    code,
    label,
    amount_cents,
    currency,
    active
  )
  select
    v_org_id,
    v_program_id,
    'activities_fee',
    'Activities Fee',
    15000,
    'USD',
    true
  where not exists (
    select 1
    from public.fee_definitions fd
    where fd.organization_id = v_org_id
      and fd.code = 'activities_fee'
      and fd.active = true
  );

  select id into v_supply_fee_id
  from public.fee_definitions
  where organization_id = v_org_id
    and code = 'supply_fee'
    and active = true
  limit 1;

  select id into v_activities_fee_id
  from public.fee_definitions
  where organization_id = v_org_id
    and code = 'activities_fee'
    and active = true
  limit 1;

  select coalesce(max(i.sort_order), -1) + 1
  into v_sort_order
  from public.enrollment_checklist_template_items i
  where i.template_id = v_template_id;

  if not exists (
    select 1
    from public.enrollment_checklist_template_items i
    where i.template_id = v_template_id
      and i.item_key = 'supply_fee'
  ) then
    insert into public.enrollment_checklist_template_items (
      id,
      template_id,
      organization_id,
      item_key,
      sort_order,
      label,
      type,
      required,
      fee_definition_id,
      metadata
    )
    values (
      v_supply_item_id,
      v_template_id,
      v_org_id,
      'supply_fee',
      v_sort_order,
      'Supply Fee',
      'payment',
      true,
      v_supply_fee_id,
      '{}'::jsonb
    );

    v_sort_order := v_sort_order + 1;
  end if;

  if not exists (
    select 1
    from public.enrollment_checklist_template_items i
    where i.template_id = v_template_id
      and i.item_key = 'activities_fee'
  ) then
    insert into public.enrollment_checklist_template_items (
      id,
      template_id,
      organization_id,
      item_key,
      sort_order,
      label,
      type,
      required,
      fee_definition_id,
      metadata
    )
    values (
      v_activities_item_id,
      v_template_id,
      v_org_id,
      'activities_fee',
      v_sort_order,
      'Activities Fee',
      'payment',
      true,
      v_activities_fee_id,
      '{}'::jsonb
    );
  end if;

  -- Backfill families already in progress on this template.
  insert into public.enrollment_checklist_items (
    checklist_id,
    organization_id,
    template_item_id,
    item_key,
    status,
    payment_status
  )
  select
    ec.id,
    ec.organization_id,
    ti.id,
    ti.item_key,
    'not_started',
    'pending'
  from public.enrollment_checklists ec
  join public.enrollment_checklist_template_items ti
    on ti.template_id = ec.template_id
   and ti.item_key in ('supply_fee', 'activities_fee')
  where ec.template_id = v_template_id
    and ec.status in ('not_started', 'in_progress')
    and not exists (
      select 1
      from public.enrollment_checklist_items eci
      where eci.checklist_id = ec.id
        and eci.template_item_id = ti.id
    );

  raise notice 'Added Supply Fee and Activities Fee payment steps to rooted-meadows enrollment checklist.';
end $$;
