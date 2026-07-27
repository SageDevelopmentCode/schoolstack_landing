-- Add Health & Emergency form step to Rooted Meadows enrollment checklist.
-- Safe to re-run: skips if item_key already exists on the published template.
-- Target org: rooted-meadows

do $$
declare
  v_org_id uuid;
  v_template_id uuid;
  v_item_id uuid := gen_random_uuid();
  v_sort_order integer;
  v_item_key text := 'health_emergency';
  v_form_schema jsonb := $form${
  "id": "health-emergency",
  "title": "Health & Emergency",
  "description": "Please list all food or environmental diagnosed allergies that your child has, including the severity of the reaction and what treatment is used in case of a reaction. Please list any chronic medical conditions or special needs the child has and any treatment or therapy we should be aware of.",
  "fields": [
    {
      "id": "allergy_1",
      "label": "Allergy 1",
      "type": "text",
      "required": false,
      "placeholder": "Food or environmental allergy"
    },
    {
      "id": "allergy_1_severity",
      "label": "Allergy 1 — severity",
      "type": "radio",
      "required": false,
      "options": [
        {
          "value": "low",
          "label": "Low"
        },
        {
          "value": "medium",
          "label": "Medium"
        },
        {
          "value": "high",
          "label": "High"
        }
      ]
    },
    {
      "id": "allergy_1_treatment",
      "label": "Allergy 1 — treatment",
      "type": "textarea",
      "required": false,
      "rows": 2,
      "placeholder": "Treatment used in case of a reaction"
    },
    {
      "id": "allergy_2",
      "label": "Allergy 2",
      "type": "text",
      "required": false,
      "placeholder": "Food or environmental allergy"
    },
    {
      "id": "allergy_2_severity",
      "label": "Allergy 2 — severity",
      "type": "radio",
      "required": false,
      "options": [
        {
          "value": "low",
          "label": "Low"
        },
        {
          "value": "medium",
          "label": "Medium"
        },
        {
          "value": "high",
          "label": "High"
        }
      ]
    },
    {
      "id": "allergy_2_treatment",
      "label": "Allergy 2 — treatment",
      "type": "textarea",
      "required": false,
      "rows": 2,
      "placeholder": "Treatment used in case of a reaction"
    },
    {
      "id": "allergy_3",
      "label": "Allergy 3",
      "type": "text",
      "required": false,
      "placeholder": "Food or environmental allergy"
    },
    {
      "id": "allergy_3_severity",
      "label": "Allergy 3 — severity",
      "type": "radio",
      "required": false,
      "options": [
        {
          "value": "low",
          "label": "Low"
        },
        {
          "value": "medium",
          "label": "Medium"
        },
        {
          "value": "high",
          "label": "High"
        }
      ]
    },
    {
      "id": "allergy_3_treatment",
      "label": "Allergy 3 — treatment",
      "type": "textarea",
      "required": false,
      "rows": 2,
      "placeholder": "Treatment used in case of a reaction"
    },
    {
      "id": "condition_1",
      "label": "Medical condition 1",
      "type": "text",
      "required": false,
      "placeholder": "Chronic medical condition or special need"
    },
    {
      "id": "condition_1_treatment",
      "label": "Medical condition 1 — treatment or therapies",
      "type": "textarea",
      "required": false,
      "rows": 2
    },
    {
      "id": "condition_2",
      "label": "Medical condition 2",
      "type": "text",
      "required": false,
      "placeholder": "Chronic medical condition or special need"
    },
    {
      "id": "condition_2_treatment",
      "label": "Medical condition 2 — treatment or therapies",
      "type": "textarea",
      "required": false,
      "rows": 2
    },
    {
      "id": "medication_self_admin",
      "label": "Student self-administration",
      "type": "checkbox",
      "required": false,
      "helpText": "As a parent, I understand that Rooted Meadows Waldorf School teachers cannot administer medication, without permission from parents, to students other than emergency life-saving medications. I have discussed with my child the safety and dosage requirements of self-administering their medication. The medication needs to be registered at the office and will be stored with the teacher in a locked cabinet."
    },
    {
      "id": "medication_authorized_adult",
      "label": "Authorized adult administration",
      "type": "checkbox",
      "required": false,
      "helpText": "I have explained to the child's main teacher the procedure for administering the needed medications to my child and authorize him/her to administer medications that are registered in the school system during school hours."
    },
    {
      "id": "emergency_contact_1_name",
      "label": "Emergency contact 1 — full name",
      "type": "text",
      "required": true
    },
    {
      "id": "emergency_contact_1_address",
      "label": "Emergency contact 1 — address",
      "type": "address",
      "required": true
    },
    {
      "id": "emergency_contact_1_phone",
      "label": "Emergency contact 1 — telephone number",
      "type": "tel",
      "required": true
    },
    {
      "id": "emergency_contact_2_name",
      "label": "Emergency contact 2 — full name",
      "type": "text",
      "required": true
    },
    {
      "id": "emergency_contact_2_address",
      "label": "Emergency contact 2 — address",
      "type": "address",
      "required": true
    },
    {
      "id": "emergency_contact_2_phone",
      "label": "Emergency contact 2 — telephone number",
      "type": "tel",
      "required": true
    },
    {
      "id": "parent_signature",
      "label": "Parent/Guardian signature (type full legal name)",
      "type": "text",
      "required": true,
      "helpText": "I certify that I am the parent or legal guardian and that all information provided is accurate and complete to the best of my knowledge. I authorize Rooted Meadows Waldorf School to take necessary action in case of a medical emergency involving my child according to the Emergency Medical Authorization stated above."
    }
  ],
  "stepNotice": {
    "placement": "bottom",
    "body": "In the event of an emergency where I cannot be reached, I authorize Rooted Meadows Waldorf School to obtain and provide emergency medical treatment for me or my child as deemed necessary, including first aid, CPR, and emergency transport. I understand that I am responsible for all medical expenses incurred and that the School and its representatives are not liable for any costs or outcomes associated with such treatment."
  }
}$form$::jsonb;
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
    raise notice 'Health & Emergency step already exists — skipping.';
    return;
  end if;

  -- Place immediately after Release of Liability & Indemnity.
  select coalesce(
    (
      select i.sort_order + 1
      from public.enrollment_checklist_template_items i
      where i.template_id = v_template_id
        and i.item_key = 'release_of_liability'
    ),
    (
      select i.sort_order + 2
      from public.enrollment_checklist_template_items i
      where i.template_id = v_template_id
        and i.item_key = 'photography_media_release'
    ),
    (
      select i.sort_order + 3
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
    'Health & Emergency',
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

  raise notice 'Added Health & Emergency step at sort_order %.', v_sort_order;
end $$;

-- Verification
select
  i.sort_order,
  i.label,
  i.type,
  i.item_key,
  jsonb_array_length(i.form_schema->'fields') as field_count
from public.enrollment_checklist_template_items i
join public.enrollment_checklist_templates t on t.id = i.template_id
join public.organizations o on o.id = t.organization_id
where o.slug = 'rooted-meadows'
  and t.enrollment_path = 'enrollment'
  and t.status = 'published'
order by i.sort_order;
