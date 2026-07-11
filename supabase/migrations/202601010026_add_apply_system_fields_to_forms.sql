-- Prepend locked Student information step to existing apply forms.
-- Matches buildApplySystemSection() in src/lib/admissions/apply-system-fields.ts

do $$
declare
  form_row record;
  system_section jsonb;
  grade_options jsonb;
begin
  grade_options := jsonb_build_array(
    jsonb_build_object('value', 'pk', 'label', 'Pre-K'),
    jsonb_build_object('value', 'k', 'label', 'Kindergarten'),
    jsonb_build_object('value', '1', 'label', '1st Grade'),
    jsonb_build_object('value', '2', 'label', '2nd Grade'),
    jsonb_build_object('value', '3', 'label', '3rd Grade'),
    jsonb_build_object('value', '4', 'label', '4th Grade'),
    jsonb_build_object('value', '5', 'label', '5th Grade'),
    jsonb_build_object('value', '6', 'label', '6th Grade'),
    jsonb_build_object('value', '7', 'label', '7th Grade'),
    jsonb_build_object('value', '8', 'label', '8th Grade'),
    jsonb_build_object('value', '9', 'label', '9th Grade'),
    jsonb_build_object('value', '10', 'label', '10th Grade'),
    jsonb_build_object('value', '11', 'label', '11th Grade'),
    jsonb_build_object('value', '12', 'label', '12th Grade')
  );

  for form_row in
    select id, schema
    from public.application_form_versions
    where public_slug = 'apply'
      and status in ('draft', 'published')
  loop
    if coalesce(form_row.schema->'sections'->0->>'system', 'false') = 'true' then
      continue;
    end if;

    system_section := jsonb_build_object(
      'id', substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
      'title', 'Student information',
      'system', true,
      'description',
        'Tell us about the student you''re applying for. This information is saved to your school''s records when you submit.',
      'fields', jsonb_build_array(
        jsonb_build_object(
          'id', 'student_first_name',
          'label', 'Student first name',
          'type', 'text',
          'required', true,
          'width', 'half',
          'system', true
        ),
        jsonb_build_object(
          'id', 'student_last_name',
          'label', 'Student last name',
          'type', 'text',
          'required', true,
          'width', 'half',
          'system', true
        ),
        jsonb_build_object(
          'id', 'student_date_of_birth',
          'label', 'Date of birth',
          'type', 'date',
          'required', true,
          'width', 'half',
          'system', true
        ),
        jsonb_build_object(
          'id', 'student_grade',
          'label', 'Grade level',
          'type', 'select',
          'required', true,
          'width', 'half',
          'system', true,
          'options', grade_options
        )
      )
    );

    update public.application_form_versions
    set schema = jsonb_set(
      coalesce(form_row.schema, '{}'::jsonb),
      '{sections}',
      jsonb_build_array(system_section)
        || coalesce(form_row.schema->'sections', '[]'::jsonb)
    )
    where id = form_row.id;
  end loop;
end $$;
