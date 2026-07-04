-- One-time seed: append Educator Referral (Step 3) to Rooted Meadows draft application form.
-- Safe to re-run: guarded by section count = 2.

update public.application_form_versions
set
  schema = jsonb_set(
    schema,
    '{sections}',
    (schema->'sections') || '[
      {
        "id": "f4b8c570e2a6",
        "title": "Educator Referral",
        "description": "Our Enrollment Director will reach out to the referral directly to send a reference form. We are looking to better understand how your child operates in a learning environment with somebody other than a parent. Great options to list are: a prior school teacher, coach, tutor, church leader, etc.",
        "fields": [
          {
            "id": "a5c9d681f3b7",
            "label": "Name (First & Last)",
            "type": "text",
            "required": true,
            "width": "full"
          },
          {
            "id": "b6d0e792a4c8",
            "label": "Email Address",
            "type": "email",
            "required": true,
            "width": "half"
          },
          {
            "id": "c7e1f8a3b5d9",
            "label": "Relationship",
            "type": "text",
            "required": true,
            "width": "half",
            "placeholder": "e.g. Teacher, coach, tutor, church leader"
          }
        ]
      }
    ]'::jsonb
  ),
  updated_at = now()
where id = 'a57d66cf-1c0b-4052-a1cd-3067c07361d3'
  and status = 'draft'
  and jsonb_array_length(schema->'sections') = 2;
