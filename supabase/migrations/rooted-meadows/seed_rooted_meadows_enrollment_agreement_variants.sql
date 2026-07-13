-- Seed step 1 of the Rooted Meadows enrollment checklist: a variant agreement group
-- with Standard Enrollment Agreement (default) and Conditional Support Agreement.
-- Safe to re-run: skips when the variant group already exists.
-- Target org: rooted-meadows-demo

do $$
declare
  v_org_id uuid;
  v_program_id uuid;
  v_template_id uuid;
  v_group_id text;
  v_std_doc_id uuid;
  v_cond_doc_id uuid;
  v_std_item_id uuid;
  v_cond_item_id uuid;
  v_standard_sections jsonb;
  v_conditional_sections jsonb;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows-demo';

  if v_org_id is null then
    raise notice 'rooted-meadows-demo organization not found — skipping enrollment agreement seed.';
    return;
  end if;

  select p.id into v_program_id
  from public.programs p
  where p.organization_id = v_org_id
    and p.name = 'School Year 2026–27'
  limit 1;

  if v_program_id is null then
    raise notice 'School Year 2026–27 program not found for rooted-meadows-demo — skipping enrollment agreement seed.';
    return;
  end if;

  select t.id into v_template_id
  from public.enrollment_checklist_templates t
  where t.organization_id = v_org_id
    and t.enrollment_path = 'enrollment'
    and t.status = 'draft'
  order by t.updated_at desc
  limit 1;

  if v_template_id is null then
    insert into public.enrollment_checklist_templates (
      organization_id,
      program_id,
      name,
      enrollment_path,
      status
    )
    values (
      v_org_id,
      v_program_id,
      'Enrollment checklist',
      'enrollment',
      'draft'
    )
    returning id into v_template_id;

    raise notice 'Created draft enrollment checklist for rooted-meadows-demo.';
  end if;

  if exists (
    select 1
    from public.enrollment_checklist_template_items i
    where i.template_id = v_template_id
      and i.metadata->'variant'->>'variantKey' = 'standard'
  ) and exists (
    select 1
    from public.enrollment_checklist_template_items i
    where i.template_id = v_template_id
      and i.metadata->'variant'->>'variantKey' = 'conditional_support'
  ) then
    raise notice 'Enrollment agreement variant group already exists — skipping.';
    return;
  end if;

  v_group_id := 'vg_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);

  v_standard_sections := $sections$[
    {
      "id": "1-1",
      "title": "1. Program Description & Schedule",
      "body": "Rooted Meadows Waldorf School offers a nature-centered, play-based learning environment for Pre-K through Elementary students. Our program runs Monday through Friday, 8:00 AM to 3:00 PM, with optional after-care until 5:30 PM. Students participate in outdoor learning, project-based study, and community-focused activities aligned with each season."
    },
    {
      "id": "1-2",
      "title": "2. Tuition & Payment Policy",
      "body": "Tuition is due on the first of each month. A 5-day grace period is provided. Accounts more than 10 days past due may result in a temporary enrollment hold. Families experiencing hardship are encouraged to contact the director to discuss payment arrangements. All fees are non-refundable once the program month has begun."
    },
    {
      "id": "1-3",
      "title": "3. Health & Wellness Standards",
      "body": "Students must be symptom-free for 24 hours before returning to school after illness. Please do not send your child with fever, vomiting, or signs of a communicable illness. The school follows local public health guidance and may require additional protocols during community health events. Up-to-date immunization records or an approved exemption must be on file."
    },
    {
      "id": "1-4",
      "title": "4. Acknowledgment & Agreement",
      "body": "By signing below, I confirm that I have read and understand all sections of the Program Description and Key Policies document. I agree to the terms outlined herein and commit to supporting the Rooted Meadows community through my participation, communication, and adherence to the policies described."
    },
    {
      "id": "std-2-1",
      "title": "5. Core Commitments",
      "body": "As a member of the Rooted Meadows community, I commit to treating all students, staff, and families with dignity and respect. I will communicate concerns directly and constructively through appropriate channels, maintain confidentiality about individual children and families, and actively support a culture of inclusion, curiosity, and kindness."
    },
    {
      "id": "std-2-2",
      "title": "6. Respectful Communication",
      "body": "I agree to address disagreements or concerns calmly and directly with the appropriate staff member. I will refrain from posting negative or identifying comments about students, families, or staff on social media or other public platforms. I understand that repeated or serious violations of community communication standards may result in a required meeting with the director."
    },
    {
      "id": "std-2-3",
      "title": "7. Acknowledgment",
      "body": "By signing below, I confirm that I have read and agree to uphold the Rooted Meadows Community Agreement for the duration of my child's enrollment. I understand that this agreement exists to protect the safety, wellbeing, and dignity of every member of our school community."
    }
  ]$sections$::jsonb;

  v_conditional_sections := $sections$[
    {
      "id": "cs-1",
      "title": "1. Collaborative Support Plan",
      "body": "This agreement outlines a structured, collaborative support plan between Rooted Meadows Waldorf School and the family. Together we will identify specific developmental goals, classroom accommodations, and communication rhythms that support the child's successful integration into our program while honoring Waldorf principles of rhythm, reverence, and whole-child development."
    },
    {
      "id": "cs-2",
      "title": "2. Trial Period & Review Checkpoints",
      "body": "Enrollment begins with a six-to-eight-week trial period during which teachers and guides will observe the child's adaptation to classroom rhythm, social engagement, and developmental readiness. Formal review checkpoints occur at weeks three and six. At each checkpoint, the admissions team and lead guide will meet with the family to share observations and adjust the support plan as needed."
    },
    {
      "id": "cs-3",
      "title": "3. Transition to Full Enrollment",
      "body": "Upon successful completion of the trial period and collaborative review, the family may transition to the Standard Enrollment Agreement. If, at any checkpoint, the school and family determine that additional support or a different educational environment would better serve the child, Rooted Meadows will work thoughtfully with the family on next steps — including referrals to programs that may be a stronger fit."
    },
    {
      "id": "cond-1-1",
      "title": "4. Program Description & Schedule",
      "body": "Rooted Meadows Waldorf School offers a nature-centered, play-based learning environment for Pre-K through Elementary students. Our program runs Monday through Friday, 8:00 AM to 3:00 PM, with optional after-care until 5:30 PM. Students participate in outdoor learning, project-based study, and community-focused activities aligned with each season."
    },
    {
      "id": "cond-1-2",
      "title": "5. Tuition & Payment Policy",
      "body": "Tuition is due on the first of each month. A 5-day grace period is provided. Accounts more than 10 days past due may result in a temporary enrollment hold. Families experiencing hardship are encouraged to contact the director to discuss payment arrangements. All fees are non-refundable once the program month has begun."
    },
    {
      "id": "cond-1-3",
      "title": "6. Health & Wellness Standards",
      "body": "Students must be symptom-free for 24 hours before returning to school after illness. Please do not send your child with fever, vomiting, or signs of a communicable illness. The school follows local public health guidance and may require additional protocols during community health events. Up-to-date immunization records or an approved exemption must be on file."
    },
    {
      "id": "cond-1-4",
      "title": "7. Acknowledgment & Agreement",
      "body": "By signing below, I confirm that I have read and understand all sections of the Program Description and Key Policies document. I agree to the terms outlined herein and commit to supporting the Rooted Meadows community through my participation, communication, and adherence to the policies described."
    },
    {
      "id": "cond-2-1",
      "title": "8. Core Commitments",
      "body": "As a member of the Rooted Meadows community, I commit to treating all students, staff, and families with dignity and respect. I will communicate concerns directly and constructively through appropriate channels, maintain confidentiality about individual children and families, and actively support a culture of inclusion, curiosity, and kindness."
    },
    {
      "id": "cond-2-2",
      "title": "9. Respectful Communication",
      "body": "I agree to address disagreements or concerns calmly and directly with the appropriate staff member. I will refrain from posting negative or identifying comments about students, families, or staff on social media or other public platforms. I understand that repeated or serious violations of community communication standards may result in a required meeting with the director."
    },
    {
      "id": "cond-2-3",
      "title": "10. Acknowledgment",
      "body": "By signing below, I confirm that I have read and agree to uphold the Rooted Meadows Community Agreement for the duration of my child's enrollment. I understand that this agreement exists to protect the safety, wellbeing, and dignity of every member of our school community."
    }
  ]$sections$::jsonb;

  insert into public.document_templates (
    organization_id,
    name,
    kind,
    content,
    status
  )
  values (
    v_org_id,
    'Standard Enrollment Agreement',
    'inline_sections',
    jsonb_build_object('sections', v_standard_sections),
    'published'
  )
  returning id into v_std_doc_id;

  insert into public.document_templates (
    organization_id,
    name,
    kind,
    content,
    status
  )
  values (
    v_org_id,
    'Conditional Support Agreement',
    'inline_sections',
    jsonb_build_object('sections', v_conditional_sections),
    'published'
  )
  returning id into v_cond_doc_id;

  v_std_item_id := gen_random_uuid();
  v_cond_item_id := gen_random_uuid();

  insert into public.enrollment_checklist_template_items (
    id,
    template_id,
    organization_id,
    item_key,
    sort_order,
    label,
    type,
    required,
    document_template_id,
    metadata
  )
  values (
    v_std_item_id,
    v_template_id,
    v_org_id,
    'standard_enrollment_agreement',
    0,
    'Standard Enrollment Agreement',
    'document_sign',
    true,
    v_std_doc_id,
    jsonb_build_object(
      'variant',
      jsonb_build_object(
        'groupId', v_group_id,
        'groupLabel', 'Enrollment Agreement',
        'variantKey', 'standard',
        'isDefault', true
      )
    )
  );

  insert into public.enrollment_checklist_template_items (
    id,
    template_id,
    organization_id,
    item_key,
    sort_order,
    label,
    type,
    required,
    document_template_id,
    metadata
  )
  values (
    v_cond_item_id,
    v_template_id,
    v_org_id,
    'conditional_support_agreement',
    1,
    'Conditional Support Agreement',
    'document_sign',
    true,
    v_cond_doc_id,
    jsonb_build_object(
      'variant',
      jsonb_build_object(
        'groupId', v_group_id,
        'groupLabel', 'Enrollment Agreement',
        'variantKey', 'conditional_support',
        'isDefault', false
      )
    )
  );

  raise notice 'Seeded enrollment agreement variant group (standard + conditional support) for rooted-meadows-demo.';
end $$;
