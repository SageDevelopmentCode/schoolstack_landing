-- One-time seed: append referral source (Step 8) to Rooted Meadows draft application form.
-- Safe to re-run: guarded by section count = 7.

update public.application_form_versions
set
  schema = jsonb_set(
    schema,
    '{sections}',
    (schema->'sections') || '[
      {
        "id": "r8a1b2c3d4e5",
        "title": "How did you hear about Rooted Meadows School?",
        "fields": [
          {
            "id": "r8f001a1b2c3",
            "label": "How did you hear about Rooted Meadows School?",
            "type": "text",
            "required": false,
            "width": "full",
            "placeholder": "e.g. Friend, social media, website, event"
          }
        ]
      }
    ]'::jsonb
  ),
  updated_at = now()
where id = 'a57d66cf-1c0b-4052-a1cd-3067c07361d3'
  and status = 'draft'
  and jsonb_array_length(schema->'sections') = 7;
