-- One-time seed: append Parent 1 Information (Step 6) to Rooted Meadows draft application form.
-- Safe to re-run: guarded by section count = 5.

update public.application_form_versions
set
  schema = jsonb_set(
    schema,
    '{sections}',
    (schema->'sections') || '[
      {
        "id": "p1a2b3c4d5e6",
        "title": "Parent 1 Information",
        "fields": [
          {
            "id": "p1f001a1b2c3",
            "label": "Parent 1: First name",
            "type": "text",
            "required": true,
            "width": "half"
          },
          {
            "id": "p1f002b2c3d4",
            "label": "Parent 1: Middle name",
            "type": "text",
            "required": false,
            "width": "half"
          },
          {
            "id": "p1f003c3d4e5",
            "label": "Parent 1: Last name",
            "type": "text",
            "required": true,
            "width": "half"
          },
          {
            "id": "p1f004d4e5f6",
            "label": "Parent 1: Preferred salutation",
            "type": "text",
            "required": false,
            "width": "half",
            "placeholder": "e.g. Mr., Mrs., Dr."
          },
          {
            "id": "p1f005e5f6a7",
            "label": "Parent 1: Email address",
            "type": "email",
            "required": true,
            "width": "half"
          },
          {
            "id": "p1f006f6a7b8",
            "label": "Parent 1: Cell phone",
            "type": "tel",
            "required": true,
            "width": "half"
          },
          {
            "id": "p1f007a7b8c9",
            "label": "Parent 1: Custodial rights?",
            "type": "radio",
            "required": true,
            "width": "full",
            "options": [
              {"value": "yes", "label": "Yes"},
              {"value": "no", "label": "No"}
            ]
          },
          {
            "id": "p1f008b8c9d0",
            "label": "Parent 1: Financial responsibility?",
            "type": "radio",
            "required": true,
            "width": "full",
            "options": [
              {"value": "yes", "label": "Yes"},
              {"value": "no", "label": "No"}
            ]
          },
          {
            "id": "p1f009c9d0e1",
            "label": "Parent 1: Receive correspondence?",
            "type": "radio",
            "required": true,
            "width": "full",
            "options": [
              {"value": "yes", "label": "Yes"},
              {"value": "no", "label": "No"}
            ]
          },
          {
            "id": "p1f010d0e1f2",
            "label": "Parent 1: Marital status?",
            "type": "select",
            "required": true,
            "width": "half",
            "options": [
              {"value": "single", "label": "Single"},
              {"value": "married", "label": "Married"},
              {"value": "separated", "label": "Separated"},
              {"value": "divorced", "label": "Divorced"}
            ]
          },
          {
            "id": "p1f011e1f2a3",
            "label": "Parent 1: Home address",
            "type": "address",
            "required": true,
            "width": "full"
          },
          {
            "id": "p1f012f2a3b4",
            "label": "Parent 1: Occupation",
            "type": "text",
            "required": true,
            "width": "half"
          },
          {
            "id": "p1f013a3b4c5",
            "label": "Parent 1: Employer",
            "type": "text",
            "required": true,
            "width": "half"
          },
          {
            "id": "p1f014b4c5d6",
            "label": "Parent 1: Work phone",
            "type": "tel",
            "required": true,
            "width": "half"
          },
          {
            "id": "p1f015c5d6e7",
            "label": "Parent 1: Religious affiliation",
            "type": "text",
            "required": true,
            "width": "full"
          }
        ]
      }
    ]'::jsonb
  ),
  updated_at = now()
where id = 'a57d66cf-1c0b-4052-a1cd-3067c07361d3'
  and status = 'draft'
  and jsonb_array_length(schema->'sections') = 5;
