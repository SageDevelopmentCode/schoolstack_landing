-- One-time seed: append Getting to know your child (Step 5) to Rooted Meadows draft application form.
-- Safe to re-run: guarded by section count = 4.

update public.application_form_versions
set
  schema = jsonb_set(
    schema,
    '{sections}',
    (schema->'sections') || '[
      {
        "id": "a7c1d570f2a8",
        "title": "Getting to know your child",
        "description": "The questions below are intended to help us better understand your child and their interests, in addition to the hopes you hold for them at our school. Please respond to the prompts below with 100 words or less.",
        "fields": [
          {
            "id": "b8d2e681a3b9",
            "label": "Please share the subject(s) your child most enjoyed or was most interested in at their prior school.",
            "type": "textarea",
            "required": true,
            "width": "full",
            "rows": 4,
            "helpText": "100 words or less"
          },
          {
            "id": "c9e3f792b4c0",
            "label": "Why are you pursuing Rooted Meadows School for your child''s education? What are you hoping to find or achieve?",
            "type": "textarea",
            "required": true,
            "width": "full",
            "rows": 4,
            "helpText": "100 words or less"
          },
          {
            "id": "d0f4a803c5d1",
            "label": "Is there one thing you would like the teacher to know about your child or information that would be helpful for the teacher to know to support your child in transitioning to this new school?",
            "type": "textarea",
            "required": true,
            "width": "full",
            "rows": 4,
            "helpText": "100 words or less"
          }
        ]
      }
    ]'::jsonb
  ),
  updated_at = now()
where id = 'a57d66cf-1c0b-4052-a1cd-3067c07361d3'
  and status = 'draft'
  and jsonb_array_length(schema->'sections') = 4;
