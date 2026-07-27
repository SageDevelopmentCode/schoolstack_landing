-- Add Photography and Media Release step to Rooted Meadows enrollment checklist.
-- Safe to re-run: skips if item_key already exists on the published template.
-- Target org: rooted-meadows

do $$
declare
  v_org_id uuid;
  v_template_id uuid;
  v_doc_id uuid;
  v_item_id uuid := gen_random_uuid();
  v_sort_order integer;
  v_item_key text := 'photography_media_release';
  v_sections jsonb := $sections$[
  {
    "id": "photo-release-1",
    "title": "Photography and Media Release",
    "body": "## Purpose of Photography/Video\n\nThe school may photograph, film, or record students during school activities, events, or programs for educational, promotional, or informational purposes. Because of modern marketing practices, these pictures and videos are vital to being able to promote and demonstrate the capabilities and possibilities of our school for fundraising and enrollment. These images may appear in:\n\n- School newsletters or yearbook\n- School website or social media pages\n- Classroom projects\n- Local news media\n- Printed promotional materials\n\n---\n\n## Permission and Release\n\nPlease read and select one option below.\n\n\n### Full use permission\n\n\n**YES, I give permission for full use of any pictures my child is in.**\n\nI hereby give Rooted Meadows Waldorf School permission to photograph, video record, and/or audio record my child. I grant the school the right to use these images or recordings for the purposes listed above, without compensation.\n\nI understand that my child's first name, grade level, or classroom may be used, but no other personal information will be shared without additional consent.\n\n\n### Limited use permission\n\n\n**ONLY use pictures where the front of my child's face is not exposed.**\n\nThis means your child might possibly be in a photo or video as an \"extra\" where their back or side is shown. I understand that the school will make reasonable efforts to try to exclude my child from photos and media materials, but sometimes they get caught in the action of a photo or video.\n\n---\n\nI certify that I am the parent or legal guardian and that I have the authority to grant permission."
  }
]$sections$::jsonb;
  v_consent_options jsonb := $consent$[
  {
    "value": "full_use",
    "label": "YES, I give permission for full use of any pictures my child is in."
  },
  {
    "value": "no_face",
    "label": "ONLY use pictures where the front of my child's face is not exposed."
  }
]$consent$::jsonb;
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
    raise notice 'Photography and Media Release step already exists — skipping.';
    return;
  end if;

  -- Place immediately after Media & Technology, or after enrollment agreement variants.
  select coalesce(
    (
      select i.sort_order + 1
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
    'Photography and Media Release',
    'inline_sections',
    jsonb_build_object('sections', v_sections, 'consentOptions', v_consent_options),
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
    'Photography and Media Release',
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

  raise notice 'Added Photography and Media Release step at sort_order %.', v_sort_order;
end $$;

-- Verification
select
  i.sort_order,
  i.label,
  i.type,
  i.item_key,
  jsonb_array_length(dt.content->'sections') as section_count,
  jsonb_array_length(dt.content->'consentOptions') as consent_option_count
from public.enrollment_checklist_template_items i
join public.enrollment_checklist_templates t on t.id = i.template_id
join public.organizations o on o.id = t.organization_id
left join public.document_templates dt on dt.id = i.document_template_id
where o.slug = 'rooted-meadows'
  and t.enrollment_path = 'enrollment'
  and t.status = 'published'
order by i.sort_order;
