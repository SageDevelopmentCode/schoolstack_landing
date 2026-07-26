-- Add Idaho Parent Choice Tax Credit intent step to Rooted Meadows enrollment checklist.
-- Safe to re-run: skips if item_key already exists on the published template.
-- Target org: rooted-meadows

do $$
declare
  v_org_id uuid;
  v_template_id uuid;
  v_item_id uuid := gen_random_uuid();
  v_field_id text := replace(gen_random_uuid()::text, '-', '');
  v_section_id text := replace(gen_random_uuid()::text, '-', '');
  v_sort_order integer;
  v_item_key text := 'idaho_parent_choice_tax_credit';
  v_form_schema jsonb;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows';

  if v_org_id is null then
    raise exception 'Organization rooted-meadows not found.';
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
      and i.item_key = v_item_key
  ) then
    raise notice 'Idaho Parent Choice Tax Credit step already exists — skipping.';
    return;
  end if;

  -- Place before first payment step, otherwise append to end.
  select coalesce(
    (
      select min(i.sort_order)
      from public.enrollment_checklist_template_items i
      where i.template_id = v_template_id
        and i.type = 'payment'
    ),
    (
      select coalesce(max(i.sort_order), -1) + 1
      from public.enrollment_checklist_template_items i
      where i.template_id = v_template_id
    )
  )
  into v_sort_order;

  if exists (
    select 1
    from public.enrollment_checklist_template_items i
    where i.template_id = v_template_id
      and i.type = 'payment'
  ) then
    update public.enrollment_checklist_template_items
    set sort_order = sort_order + 1,
        updated_at = now()
    where template_id = v_template_id
      and sort_order >= v_sort_order;
  end if;

  v_form_schema := jsonb_build_object(
    'id', v_section_id,
    'title', 'Idaho Parent Choice Tax Credit',
    'description',
      'Idaho families may receive up to $5,000 per child through the Parent Choice Tax Refund program. This helps our team understand your upfront tuition plans.',
    'fields', jsonb_build_array(
      jsonb_build_object(
        'id', v_field_id,
        'label', 'Do you intend to pay tuition upfront using Idaho''s Parent Choice Tax Credit?',
        'type', 'radio',
        'required', true,
        'helpText',
          'This selection does not apply for the credit on your behalf. Idaho applications typically open each January.',
        'options', jsonb_build_array(
          jsonb_build_object(
            'value', 'yes',
            'label', 'Yes — I plan to pay tuition upfront and apply the Idaho Parent Choice Tax Credit'
          ),
          jsonb_build_object(
            'value', 'no',
            'label', 'No — I do not plan to use the tax credit for upfront payment'
          ),
          jsonb_build_object(
            'value', 'undecided',
            'label', 'I''m still deciding'
          )
        )
      )
    )
  );

  insert into public.enrollment_checklist_template_items (
    id,
    template_id,
    organization_id,
    item_key,
    sort_order,
    label,
    type,
    required,
    form_schema,
    metadata
  )
  values (
    v_item_id,
    v_template_id,
    v_org_id,
    v_item_key,
    v_sort_order,
    'Idaho Parent Choice Tax Credit',
    'form',
    true,
    v_form_schema,
    '{}'::jsonb
  );

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
    v_item_id,
    v_item_key,
    'not_started',
    'not_required'
  from public.enrollment_checklists ec
  where ec.template_id = v_template_id
    and ec.status in ('not_started', 'in_progress')
    and not exists (
      select 1
      from public.enrollment_checklist_items eci
      where eci.checklist_id = ec.id
        and eci.template_item_id = v_item_id
    );

  raise notice 'Added Idaho Parent Choice Tax Credit step at sort_order %.', v_sort_order;
end $$;
