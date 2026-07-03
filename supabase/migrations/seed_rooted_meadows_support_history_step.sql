-- One-time seed: append Support and History (Step 4) to Rooted Meadows draft application form.
-- Safe to re-run: guarded by section count = 3.

update public.application_form_versions
set
  schema = jsonb_set(
    schema,
    '{sections}',
    (schema->'sections') || '[
      {
        "id": "d8f2a681c3b7",
        "title": "Support and History",
        "description": "With this information, we are able to better understand how best to meet your child and discern whether or not we have the infrastructure necessary to do so adequately. Please note that we will need documentation to support the application if there is a history of therapy, IEP/504, neuropsych evals etc. Please email documents to: enrollment@rootedmeadows.org",
        "fields": [
          {
            "id": "e9a3b792d4c8",
            "label": "Has your child ever gotten referred for Speech, Physical, or Occupational Therapy?",
            "type": "radio",
            "required": true,
            "width": "full",
            "options": [
              {"value": "yes", "label": "Yes"},
              {"value": "no", "label": "No"}
            ]
          },
          {
            "id": "f0b4c803e5d9",
            "label": "Yes, my child has gotten Speech, PT or OT therapies. Here is where we are now.",
            "type": "textarea",
            "required": false,
            "width": "full",
            "rows": 3,
            "helpText": "Complete if you answered Yes above."
          },
          {
            "id": "a1c5d914f6e0",
            "label": "Has your child ever been referred to a specialist for testing for a learning disability?",
            "type": "radio",
            "required": true,
            "width": "full",
            "options": [
              {"value": "yes", "label": "Yes"},
              {"value": "no", "label": "No"}
            ]
          },
          {
            "id": "b2d6e025a7f1",
            "label": "Yes, my child has been referred and/or assessed for a learning disability. Here is where we are now.",
            "type": "textarea",
            "required": false,
            "width": "full",
            "rows": 3,
            "helpText": "Complete if you answered Yes above. Please send the most recent documentation to our office."
          },
          {
            "id": "c3e7f136b8a2",
            "label": "Does your child have or is in the process of getting an IEP or 504 plan?",
            "type": "radio",
            "required": true,
            "width": "full",
            "options": [
              {"value": "yes", "label": "Yes"},
              {"value": "no", "label": "No"}
            ]
          },
          {
            "id": "d4f8a247c9b3",
            "label": "Yes, my child has or is getting an IEP or 504 plan. Here is where we are now.",
            "type": "textarea",
            "required": false,
            "width": "full",
            "rows": 3,
            "helpText": "Complete if you answered Yes above. Please send the most recent documentation to our office."
          },
          {
            "id": "e5a9b358d0c4",
            "label": "Please describe any additional professional services your child is receiving for physical disabilities, academic and/or emotional challenges or conditions for which the child has been under treatment that have not already been shared in this application. If this doesn''t apply to your child, please type \"None\"",
            "type": "textarea",
            "required": true,
            "width": "full",
            "rows": 4,
            "placeholder": "None"
          },
          {
            "id": "f6b0c469e1d5",
            "label": "Please list any medications your child takes to treat these conditions. If this doesn''t apply, please type \"None\"",
            "type": "textarea",
            "required": true,
            "width": "full",
            "rows": 3,
            "placeholder": "None"
          }
        ]
      }
    ]'::jsonb
  ),
  updated_at = now()
where id = 'a57d66cf-1c0b-4052-a1cd-3067c07361d3'
  and status = 'draft'
  and jsonb_array_length(schema->'sections') = 3;
