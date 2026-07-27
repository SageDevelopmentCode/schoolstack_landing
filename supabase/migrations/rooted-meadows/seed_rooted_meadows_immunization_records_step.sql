-- Add Immunization Records file-upload step to Rooted Meadows enrollment checklist.
-- Safe to re-run: skips if item_key already exists on the published template.
-- Target org: rooted-meadows

do $$
declare
  v_org_id uuid;
  v_template_id uuid;
  v_item_id uuid := gen_random_uuid();
  v_sort_order integer;
  v_item_key text := 'immunization_records';
  v_metadata jsonb := $metadata${
  "fileUpload": {
    "accept": ".pdf,.jpg,.jpeg,.png",
    "maxFiles": 3,
    "directions": {
      "intro": "Please upload one of the following for your child:",
      "options": [
        "Current immunization / vaccine records from your healthcare provider",
        "A completed Idaho Certificate of Immunization Exemption form"
      ]
    },
    "helpText": "PDF, JPG, or PNG files only."
  }
}$metadata$::jsonb;
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
    raise notice 'Immunization Records step already exists — skipping.';
    return;
  end if;

  -- Place immediately after Health & Emergency.
  select coalesce(
    (
      select i.sort_order + 1
      from public.enrollment_checklist_template_items i
      where i.template_id = v_template_id
        and i.item_key = 'health_emergency'
    ),
    (
      select i.sort_order + 2
      from public.enrollment_checklist_template_items i
      where i.template_id = v_template_id
        and i.item_key = 'release_of_liability'
    ),
    (
      select i.sort_order + 3
      from public.enrollment_checklist_template_items i
      where i.template_id = v_template_id
        and i.item_key = 'photography_media_release'
    ),
    (
      select i.sort_order + 4
      from public.enrollment_checklist_template_items i
      where i.template_id = v_template_id
        and i.item_key = 'media_technology_policy'
    ),
    (
      select coalesce(max(i.sort_order), -1) + 1
      from public.enrollment_checklist_template_items i
      where i.template_id = v_template_id
        and i.metadata ? 'variant'
    )
  )
  into v_sort_order;

  update public.enrollment_checklist_template_items
  set sort_order = sort_order + 1,
      updated_at = now()
  where template_id = v_template_id
    and sort_order >= v_sort_order
    and not (metadata ? 'variant');

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
    'Immunization Records',
    'file_upload',
    true,
    null,
    v_metadata
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

  raise notice 'Added Immunization Records step at sort_order %.', v_sort_order;
end $$;

-- Verification
select
  i.sort_order,
  i.label,
  i.type,
  i.item_key,
  i.metadata->'fileUpload'->>'helpText' as help_text
from public.enrollment_checklist_template_items i
join public.enrollment_checklist_templates t on t.id = i.template_id
join public.organizations o on o.id = t.organization_id
where o.slug = 'rooted-meadows'
  and t.enrollment_path = 'enrollment'
  and t.status = 'published'
order by i.sort_order;
