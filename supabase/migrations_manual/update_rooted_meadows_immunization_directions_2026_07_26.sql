-- Update Immunization Records directions card on existing rooted-meadows template item.
-- Run if seed_rooted_meadows_immunization_records_step.sql was already applied before directions were added.
-- Target org: rooted-meadows

update public.enrollment_checklist_template_items i
set metadata = $metadata${
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
}$metadata$::jsonb,
    updated_at = now()
from public.enrollment_checklist_templates t
join public.organizations o on o.id = t.organization_id
where i.template_id = t.id
  and o.slug = 'rooted-meadows'
  and t.enrollment_path = 'enrollment'
  and t.status = 'published'
  and i.item_key = 'immunization_records';

-- Verification
select
  i.item_key,
  i.metadata->'fileUpload'->'directions'->>'intro' as directions_intro,
  jsonb_array_length(i.metadata->'fileUpload'->'directions'->'options') as option_count,
  i.metadata->'fileUpload'->>'helpText' as help_text
from public.enrollment_checklist_template_items i
join public.enrollment_checklist_templates t on t.id = i.template_id
join public.organizations o on o.id = t.organization_id
where o.slug = 'rooted-meadows'
  and t.enrollment_path = 'enrollment'
  and t.status = 'published'
  and i.item_key = 'immunization_records';
