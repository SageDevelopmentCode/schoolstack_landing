-- One-time seed: append Academic History (Step 2) to Rooted Meadows draft application form.
-- Safe to re-run: guarded by section count = 1.

update public.application_form_versions
set
  schema = jsonb_set(
    schema,
    '{sections}',
    (schema->'sections') || '[
      {
        "id": "a8f2c914e6b0",
        "title": "Academic History",
        "description": "Please know that we will need unofficial transcripts/reports to complete the application. You may upload them at the end of this section.",
        "fields": [
          {
            "id": "b9a3d025f7c1",
            "label": "Home School District",
            "type": "text",
            "required": true,
            "width": "full",
            "helpText": "This is based on your address. It''s fine if your child has never been enrolled there."
          },
          {
            "id": "c0b4e136a8d2",
            "label": "Most Recent School Attended",
            "type": "text",
            "required": true,
            "width": "full"
          },
          {
            "id": "d1c5f247b9e3",
            "label": "Year(s) Attended",
            "type": "select",
            "required": true,
            "width": "half",
            "options": [
              {"value": "25-26", "label": "2025-26"},
              {"value": "24-25", "label": "2024-25"},
              {"value": "23-24", "label": "2023-24"},
              {"value": "22-23", "label": "2022-23"},
              {"value": "21-22", "label": "2021-22"},
              {"value": "20-21", "label": "2020-21"},
              {"value": "19-20", "label": "2019-20"},
              {"value": "18-19", "label": "2018-19"}
            ]
          },
          {
            "id": "e2d6a358c0f4",
            "label": "Have you attended any additional schools? If so, please list the name(s) and year(s) attended. If no, please write \"no\".",
            "type": "textarea",
            "required": true,
            "width": "full",
            "rows": 3,
            "placeholder": "If no, write \"no\""
          },
          {
            "id": "f3e7b469d1a5",
            "label": "Unofficial Transcript(s)",
            "type": "file",
            "required": true,
            "width": "full",
            "maxFiles": 5,
            "accept": ".pdf,.jpg,.jpeg,.png",
            "helpText": "Upload up to 5 supported files (PDF, JPG, PNG)."
          }
        ]
      }
    ]'::jsonb
  ),
  updated_at = now()
where id = 'a57d66cf-1c0b-4052-a1cd-3067c07361d3'
  and status = 'draft'
  and jsonb_array_length(schema->'sections') = 1;
