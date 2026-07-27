-- Add Release of Liability & Indemnity step to Rooted Meadows enrollment checklist.
-- Safe to re-run: skips if item_key already exists on the published template.
-- Target org: rooted-meadows

do $$
declare
  v_org_id uuid;
  v_template_id uuid;
  v_doc_id uuid;
  v_item_id uuid := gen_random_uuid();
  v_sort_order integer;
  v_item_key text := 'release_of_liability';
  v_sections jsonb := $sections$[
  {
    "id": "liability-1",
    "title": "Release of Liability & Indemnity",
    "body": "This Waiver, Release of Liability and Indemnity (hereinafter \"Agreement\") is entered into by and between Rooted Meadows Waldorf School (\"School\") and the undersigned participant(s) and/or their parent(s) or guardian(s) (\"Participant\" or \"Releasor\"). This Agreement includes and applies to the homeowners (school hosts), affiliates, managers, members, agents, teachers, assistants, staff, volunteers, and other representatives of Rooted Meadows Waldorf School.\n\n---\n\n## Waiver and Release of Liability\n\nBy signing this Agreement, I, the undersigned Participant or parent/guardian of a minor Participant, acknowledge and assume the inherent risks associated with all activities at Rooted Meadows Waldorf School, including but not limited to participation in classes and on the school farm, field trips, transportation, and other school-related events, activities, or clubs, the above hereafter known as (\"Activities\").\n\nI hereby release, discharge, indemnify and hold harmless Rooted Meadows Waldorf School, its homeowners (school hosts), teachers, assistants, agents, staff, and volunteers from any and all liability, claims, or causes of action, known or unknown, for injuries, damages, or losses of any kind arising from my or my child's participation in the Activities. This release includes, but is not limited to, claims arising from the negligence of the School or its representatives.\n\nI understand and agree that my participation, or my child's participation, is voluntary and entirely at our own risk. I also agree to indemnify and hold harmless the Rooted Meadows Waldorf School, its homeowners (school hosts), teachers, assistants, agents, staff, and volunteers against any and all claims, suits, or actions brought by me, my child, or anyone on our behalf for damages or injuries related to the Activities. In addition, I agree to indemnify and hold harmless the Rooted Meadows Waldorf School, its homeowners (school hosts), teachers, assistants, agents, staff, and volunteers against any and all claims, suits, or actions brought by a health care provider for Participant or Releasor or Participant's child for subrogation or health care reimbursement purposes.\n\n---\n\n## Indemnification and Notice of Activities\n\nI consent to my child's participation in all school activities, including transportation-related events with the understanding that I will be informed of such activities through notices sent home, via email or other communication platform, or at teacher-parent meetings. I agree to indemnify and hold harmless the school and all associated with the named school for any liability arising from these activities and acknowledge that it is my responsibility to ensure receipt of these notices.\n\n---\n\n## Duration and Governing Law\n\nThis Agreement remains in effect for the duration of my or my child's participation in any and all School activities whether enrolled or not in the school.\n\n---\n\nI certify that I am the parent or legal guardian and that I accept and agree to the terms stated above."
  }
]$sections$::jsonb;
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
    raise notice 'Release of Liability & Indemnity step already exists — skipping.';
    return;
  end if;

  -- Place immediately after Photography and Media Release.
  select coalesce(
    (
      select i.sort_order + 1
      from public.enrollment_checklist_template_items i
      where i.template_id = v_template_id
        and i.item_key = 'photography_media_release'
    ),
    (
      select i.sort_order + 2
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

  insert into public.document_templates (
    organization_id,
    name,
    kind,
    content,
    status
  )
  values (
    v_org_id,
    'Release of Liability & Indemnity',
    'inline_sections',
    jsonb_build_object('sections', v_sections),
    'published'
  )
  returning id into v_doc_id;

  insert into public.enrollment_checklist_template_items (
    id,
    template_id,
    organization_id,
    item_key,
    sort_order,
    label,
    type,
    required,
    document_template_id,
    metadata
  )
  values (
    v_item_id,
    v_template_id,
    v_org_id,
    v_item_key,
    v_sort_order,
    'Release of Liability & Indemnity',
    'document_sign',
    true,
    v_doc_id,
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

  raise notice 'Added Release of Liability & Indemnity step at sort_order %.', v_sort_order;
end $$;

-- Verification
select
  i.sort_order,
  i.label,
  i.type,
  i.item_key,
  jsonb_array_length(dt.content->'sections') as section_count
from public.enrollment_checklist_template_items i
join public.enrollment_checklist_templates t on t.id = i.template_id
join public.organizations o on o.id = t.organization_id
left join public.document_templates dt on dt.id = i.document_template_id
where o.slug = 'rooted-meadows'
  and t.enrollment_path = 'enrollment'
  and t.status = 'published'
order by i.sort_order;
