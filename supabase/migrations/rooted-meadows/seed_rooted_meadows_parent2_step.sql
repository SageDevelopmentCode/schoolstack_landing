-- One-time seed: append Parent 2 Information (Step 7) to Rooted Meadows draft application form.
-- Safe to re-run: guarded by section count = 6.
-- All Parent 2 fields are optional; one-parent families may skip this step.

update public.application_form_versions
set
  schema = jsonb_set(
    schema,
    '{sections}',
    (schema->'sections') || '[
      {
        "id": "p2b3c4d5e6f7",
        "title": "Parent 2 Information",
        "description": "If there is only one parent or guardian, you may leave this step blank and continue.",
        "fields": [
          {
            "id": "p2f001a1b2c3",
            "label": "Parent 2: First name",
            "type": "text",
            "required": false,
            "width": "half"
          },
          {
            "id": "p2f002b2c3d4",
            "label": "Parent 2: Middle name",
            "type": "text",
            "required": false,
            "width": "half"
          },
          {
            "id": "p2f003c3d4e5",
            "label": "Parent 2: Last name",
            "type": "text",
            "required": false,
            "width": "half"
          },
          {
            "id": "p2f004d4e5f6",
            "label": "Parent 2: Preferred salutation",
            "type": "text",
            "required": false,
            "width": "half",
            "placeholder": "e.g. Mr., Mrs., Dr."
          },
          {
            "id": "p2f005e5f6a7",
            "label": "Parent 2: Email address",
            "type": "email",
            "required": false,
            "width": "half"
          },
          {
            "id": "p2f006f6a7b8",
            "label": "Parent 2: Cell phone",
            "type": "tel",
            "required": false,
            "width": "half"
          },
          {
            "id": "p2f007a7b8c9",
            "label": "Parent 2: Custodial rights?",
            "type": "radio",
            "required": false,
            "width": "full",
            "options": [
              {"value": "yes", "label": "Yes"},
              {"value": "no", "label": "No"}
            ]
          },
          {
            "id": "p2f008b8c9d0",
            "label": "Parent 2: Financial responsibility?",
            "type": "radio",
            "required": false,
            "width": "full",
            "options": [
              {"value": "yes", "label": "Yes"},
              {"value": "no", "label": "No"}
            ]
          },
          {
            "id": "p2f009c9d0e1",
            "label": "Parent 2: Receive correspondence?",
            "type": "radio",
            "required": false,
            "width": "full",
            "options": [
              {"value": "yes", "label": "Yes"},
              {"value": "no", "label": "No"}
            ]
          },
          {
            "id": "p2f010d0e1f2",
            "label": "Parent 2: Marital status?",
            "type": "select",
            "required": false,
            "width": "half",
            "options": [
              {"value": "single", "label": "Single"},
              {"value": "married", "label": "Married"},
              {"value": "separated", "label": "Separated"},
              {"value": "divorced", "label": "Divorced"}
            ]
          },
          {
            "id": "p2f011e1f2a3",
            "label": "Parent 2: Home address",
            "type": "address",
            "required": false,
            "width": "full"
          },
          {
            "id": "p2f012f2a3b4",
            "label": "Parent 2: Occupation",
            "type": "text",
            "required": false,
            "width": "half"
          },
          {
            "id": "p2f013a3b4c5",
            "label": "Parent 2: Employer",
            "type": "text",
            "required": false,
            "width": "half"
          },
          {
            "id": "p2f014b4c5d6",
            "label": "Parent 2: Work phone",
            "type": "tel",
            "required": false,
            "width": "half"
          },
          {
            "id": "p2f015c5d6e7",
            "label": "Parent 2: Religious affiliation",
            "type": "text",
            "required": false,
            "width": "full"
          }
        ]
      }
    ]'::jsonb
  ),
  updated_at = now()
where id = 'a57d66cf-1c0b-4052-a1cd-3067c07361d3'
  and status = 'draft'
  and jsonb_array_length(schema->'sections') = 6;
