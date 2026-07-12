-- Clone Rooted Meadows production org into a demo sandbox.
-- Source: rooted-meadows-school (c14e04d2-d39a-4704-af0a-847edae8220a)
-- Target: rooted-meadows-demo
--
-- Safe to re-run only after teardown (see bottom of file).
-- Does NOT modify the source org. Skips memberships and Stripe accounts.
--
-- STEP 0 (optional pre-flight — run separately first):
-- select id, slug, name, status, timezone from public.organizations where slug = 'rooted-meadows-school';
-- select id, slug from public.organizations where slug = 'rooted-meadows-demo';  -- should return 0 rows
--
-- STEP 1: Run everything below (begin … commit).

begin;

do $$
declare
  v_source_org_id uuid := 'c14e04d2-d39a-4704-af0a-847edae8220a';
  v_demo_slug text := 'rooted-meadows-demo';
  v_demo_org_id uuid;
begin
  if exists (select 1 from public.organizations where slug = v_demo_slug) then
    raise exception 'Demo org "%" already exists. Run teardown first.', v_demo_slug;
  end if;

  if not exists (select 1 from public.organizations where id = v_source_org_id) then
    raise exception 'Source org % not found.', v_source_org_id;
  end if;

  create temporary table id_map (
    entity text not null,
    old_id uuid not null,
    new_id uuid not null,
    primary key (entity, old_id)
  ) on commit drop;

  -- 1) organizations
  insert into public.organizations (slug, name, status, timezone, crm_school_id)
  select
    v_demo_slug,
    o.name || ' (Demo)',
    o.status,
    o.timezone,
    coalesce(o.crm_school_id, o.slug) || '-demo'
  from public.organizations o
  where o.id = v_source_org_id
  returning id into v_demo_org_id;

  -- 2) organization_settings
  insert into public.organization_settings (organization_id, branding, features, created_at, updated_at)
  select v_demo_org_id, branding, features, created_at, updated_at
  from public.organization_settings
  where organization_id = v_source_org_id;

  -- Pre-generate ID maps, then insert with explicit new IDs.
  insert into id_map (entity, old_id, new_id)
  select 'programs', id, gen_random_uuid()
  from public.programs
  where organization_id = v_source_org_id;

  insert into public.programs (
    id, organization_id, name, type, status, start_date, end_date, capacity, created_at, updated_at
  )
  select
    m.new_id,
    v_demo_org_id,
    p.name,
    p.type,
    p.status,
    p.start_date,
    p.end_date,
    p.capacity,
    p.created_at,
    p.updated_at
  from public.programs p
  join id_map m on m.entity = 'programs' and m.old_id = p.id
  where p.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'classrooms', id, gen_random_uuid()
  from public.classrooms
  where organization_id = v_source_org_id;

  insert into public.classrooms (
    id, organization_id, program_id, name, status, created_at, updated_at
  )
  select
    m.new_id,
    v_demo_org_id,
    (select new_id from id_map where entity = 'programs' and old_id = c.program_id),
    c.name,
    c.status,
    c.created_at,
    c.updated_at
  from public.classrooms c
  join id_map m on m.entity = 'classrooms' and m.old_id = c.id
  where c.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'document_templates', id, gen_random_uuid()
  from public.document_templates
  where organization_id = v_source_org_id;

  insert into public.document_templates (
    id, organization_id, name, kind, content, status, created_at, updated_at
  )
  select
    m.new_id,
    v_demo_org_id,
    d.name,
    d.kind,
    d.content,
    d.status,
    d.created_at,
    d.updated_at
  from public.document_templates d
  join id_map m on m.entity = 'document_templates' and m.old_id = d.id
  where d.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'fee_definitions', id, gen_random_uuid()
  from public.fee_definitions
  where organization_id = v_source_org_id;

  insert into public.fee_definitions (
    id, organization_id, program_id, code, label, amount_cents, currency, active, created_at, updated_at
  )
  select
    m.new_id,
    v_demo_org_id,
    (select new_id from id_map where entity = 'programs' and old_id = f.program_id),
    f.code,
    f.label,
    f.amount_cents,
    f.currency,
    f.active,
    f.created_at,
    f.updated_at
  from public.fee_definitions f
  join id_map m on m.entity = 'fee_definitions' and m.old_id = f.id
  where f.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'families', id, gen_random_uuid()
  from public.families
  where organization_id = v_source_org_id;

  insert into public.families (
    id, organization_id, name, primary_email, primary_phone, created_at, updated_at
  )
  select
    m.new_id,
    v_demo_org_id,
    f.name,
    f.primary_email,
    f.primary_phone,
    f.created_at,
    f.updated_at
  from public.families f
  join id_map m on m.entity = 'families' and m.old_id = f.id
  where f.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'guardians', id, gen_random_uuid()
  from public.guardians
  where organization_id = v_source_org_id;

  insert into public.guardians (
    id, organization_id, family_id, user_id, first_name, last_name, email, phone, relationship, created_at, updated_at
  )
  select
    m.new_id,
    v_demo_org_id,
    (select new_id from id_map where entity = 'families' and old_id = g.family_id),
    g.user_id,
    g.first_name,
    g.last_name,
    g.email,
    g.phone,
    g.relationship,
    g.created_at,
    g.updated_at
  from public.guardians g
  join id_map m on m.entity = 'guardians' and m.old_id = g.id
  where g.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'students', id, gen_random_uuid()
  from public.students
  where organization_id = v_source_org_id;

  insert into public.students (
    id, organization_id, family_id, first_name, last_name, date_of_birth, grade, status, created_at, updated_at
  )
  select
    m.new_id,
    v_demo_org_id,
    (select new_id from id_map where entity = 'families' and old_id = s.family_id),
    s.first_name,
    s.last_name,
    s.date_of_birth,
    s.grade,
    s.status,
    s.created_at,
    s.updated_at
  from public.students s
  join id_map m on m.entity = 'students' and m.old_id = s.id
  where s.organization_id = v_source_org_id;

  insert into public.staff_members (
    organization_id, user_id, first_name, last_name, email, role_title, status, created_at, updated_at
  )
  select
    v_demo_org_id,
    sm.user_id,
    sm.first_name,
    sm.last_name,
    sm.email,
    sm.role_title,
    sm.status,
    sm.created_at,
    sm.updated_at
  from public.staff_members sm
  where sm.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'application_form_versions', id, gen_random_uuid()
  from public.application_form_versions
  where organization_id = v_source_org_id;

  insert into public.application_form_versions (
    id, organization_id, program_id, version, status, title, intro, schema, fee_config,
    post_submit_config, public_slug, published_at, created_at, updated_at
  )
  select
    m.new_id,
    v_demo_org_id,
    (select new_id from id_map where entity = 'programs' and old_id = f.program_id),
    f.version,
    f.status,
    f.title,
    f.intro,
    f.schema,
    f.fee_config,
    f.post_submit_config,
    f.public_slug,
    f.published_at,
    f.created_at,
    f.updated_at
  from public.application_form_versions f
  join id_map m on m.entity = 'application_form_versions' and m.old_id = f.id
  where f.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'enrollment_checklist_templates', id, gen_random_uuid()
  from public.enrollment_checklist_templates
  where organization_id = v_source_org_id;

  insert into public.enrollment_checklist_templates (
    id, organization_id, program_id, name, enrollment_path, status, created_at, updated_at
  )
  select
    m.new_id,
    v_demo_org_id,
    (select new_id from id_map where entity = 'programs' and old_id = t.program_id),
    t.name,
    t.enrollment_path,
    t.status,
    t.created_at,
    t.updated_at
  from public.enrollment_checklist_templates t
  join id_map m on m.entity = 'enrollment_checklist_templates' and m.old_id = t.id
  where t.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'enrollment_checklist_template_items', id, gen_random_uuid()
  from public.enrollment_checklist_template_items
  where organization_id = v_source_org_id;

  insert into public.enrollment_checklist_template_items (
    id, template_id, organization_id, item_key, sort_order, label, type, required,
    document_template_id, fee_definition_id, form_schema, metadata, created_at, updated_at
  )
  select
    m.new_id,
    (select new_id from id_map where entity = 'enrollment_checklist_templates' and old_id = i.template_id),
    v_demo_org_id,
    i.item_key,
    i.sort_order,
    i.label,
    i.type,
    i.required,
    (select new_id from id_map where entity = 'document_templates' and old_id = i.document_template_id),
    (select new_id from id_map where entity = 'fee_definitions' and old_id = i.fee_definition_id),
    i.form_schema,
    i.metadata,
    i.created_at,
    i.updated_at
  from public.enrollment_checklist_template_items i
  join id_map m on m.entity = 'enrollment_checklist_template_items' and m.old_id = i.id
  where i.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'applications', id, gen_random_uuid()
  from public.applications
  where organization_id = v_source_org_id;

  insert into public.applications (
    id, organization_id, program_id, form_version_id, family_id, student_id, primary_guardian_id,
    status, responses, acknowledgments, fee_status, fee_paid_at, submitted_at, access_token,
    created_by_user_id, created_at, updated_at
  )
  select
    m.new_id,
    v_demo_org_id,
    (select new_id from id_map where entity = 'programs' and old_id = a.program_id),
    (select new_id from id_map where entity = 'application_form_versions' and old_id = a.form_version_id),
    (select new_id from id_map where entity = 'families' and old_id = a.family_id),
    (select new_id from id_map where entity = 'students' and old_id = a.student_id),
    (select new_id from id_map where entity = 'guardians' and old_id = a.primary_guardian_id),
    a.status,
    a.responses,
    a.acknowledgments,
    a.fee_status,
    a.fee_paid_at,
    a.submitted_at,
    gen_random_uuid(),
    a.created_by_user_id,
    a.created_at,
    a.updated_at
  from public.applications a
  join id_map m on m.entity = 'applications' and m.old_id = a.id
  where a.organization_id = v_source_org_id;

  insert into public.application_files (
    organization_id, application_id, field_id, file_name, storage_path, mime_type, size_bytes, uploaded_by_user_id, created_at
  )
  select
    v_demo_org_id,
    (select new_id from id_map where entity = 'applications' and old_id = af.application_id),
    af.field_id,
    af.file_name,
    af.storage_path,
    af.mime_type,
    af.size_bytes,
    af.uploaded_by_user_id,
    af.created_at
  from public.application_files af
  where af.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'enrollments', id, gen_random_uuid()
  from public.enrollments
  where organization_id = v_source_org_id;

  insert into public.enrollments (
    id, organization_id, student_id, program_id, classroom_id, status, created_at, updated_at
  )
  select
    m.new_id,
    v_demo_org_id,
    (select new_id from id_map where entity = 'students' and old_id = e.student_id),
    (select new_id from id_map where entity = 'programs' and old_id = e.program_id),
    (select new_id from id_map where entity = 'classrooms' and old_id = e.classroom_id),
    e.status,
    e.created_at,
    e.updated_at
  from public.enrollments e
  join id_map m on m.entity = 'enrollments' and m.old_id = e.id
  where e.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'enrollment_checklists', id, gen_random_uuid()
  from public.enrollment_checklists
  where organization_id = v_source_org_id;

  insert into public.enrollment_checklists (
    id, organization_id, enrollment_id, template_id, application_id, status, metadata, created_at, updated_at
  )
  select
    m.new_id,
    v_demo_org_id,
    (select new_id from id_map where entity = 'enrollments' and old_id = c.enrollment_id),
    (select new_id from id_map where entity = 'enrollment_checklist_templates' and old_id = c.template_id),
    (select new_id from id_map where entity = 'applications' and old_id = c.application_id),
    c.status,
    c.metadata,
    c.created_at,
    c.updated_at
  from public.enrollment_checklists c
  join id_map m on m.entity = 'enrollment_checklists' and m.old_id = c.id
  where c.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'document_signatures', id, gen_random_uuid()
  from public.document_signatures
  where organization_id = v_source_org_id;

  insert into public.document_signatures (
    id, organization_id, document_template_id, signed_by_user_id, signer_name,
    signature_data, signed_at, ip_address, created_at
  )
  select
    m.new_id,
    v_demo_org_id,
    (select new_id from id_map where entity = 'document_templates' and old_id = ds.document_template_id),
    ds.signed_by_user_id,
    ds.signer_name,
    ds.signature_data,
    ds.signed_at,
    ds.ip_address,
    ds.created_at
  from public.document_signatures ds
  join id_map m on m.entity = 'document_signatures' and m.old_id = ds.id
  where ds.organization_id = v_source_org_id;

  insert into id_map (entity, old_id, new_id)
  select 'enrollment_checklist_items', id, gen_random_uuid()
  from public.enrollment_checklist_items
  where organization_id = v_source_org_id;

  insert into public.enrollment_checklist_items (
    id, checklist_id, organization_id, template_item_id, item_key, status, responses,
    storage_path, document_signature_id, payment_status, completed_at, completed_by_user_id,
    created_at, updated_at
  )
  select
    m.new_id,
    (select new_id from id_map where entity = 'enrollment_checklists' and old_id = i.checklist_id),
    v_demo_org_id,
    (select new_id from id_map where entity = 'enrollment_checklist_template_items' and old_id = i.template_item_id),
    i.item_key,
    i.status,
    i.responses,
    i.storage_path,
    (select new_id from id_map where entity = 'document_signatures' and old_id = i.document_signature_id),
    i.payment_status,
    i.completed_at,
    i.completed_by_user_id,
    i.created_at,
    i.updated_at
  from public.enrollment_checklist_items i
  join id_map m on m.entity = 'enrollment_checklist_items' and m.old_id = i.id
  where i.organization_id = v_source_org_id;

  insert into public.application_payments (
    organization_id, application_id, enrollment_checklist_item_id, payer_user_id,
    amount_cents, currency, status, payment_type, label,
    charged_amount_cents, processing_fee_cents, payment_method_type,
    stripe_checkout_session_id, stripe_payment_intent_id,
    paid_at, created_at
  )
  select
    v_demo_org_id,
    (select new_id from id_map where entity = 'applications' and old_id = ap.application_id),
    (select new_id from id_map where entity = 'enrollment_checklist_items' and old_id = ap.enrollment_checklist_item_id),
    ap.payer_user_id,
    ap.amount_cents,
    ap.currency,
    ap.status,
    ap.payment_type,
    ap.label,
    ap.charged_amount_cents,
    ap.processing_fee_cents,
    ap.payment_method_type,
    null,
    null,
    ap.paid_at,
    ap.created_at
  from public.application_payments ap
  where ap.organization_id = v_source_org_id;

  insert into public.admissions_availability_slots (organization_id, date, time_slot, created_at)
  select v_demo_org_id, date, time_slot, created_at
  from public.admissions_availability_slots
  where organization_id = v_source_org_id;

  insert into public.admissions_scheduled_visits (
    organization_id, application_id, post_submit_action_id, action_type,
    scheduled_date, start_time_slot, duration_minutes, status, created_at, updated_at
  )
  select
    v_demo_org_id,
    (select new_id from id_map where entity = 'applications' and old_id = v.application_id),
    v.post_submit_action_id,
    v.action_type,
    v.scheduled_date,
    v.start_time_slot,
    v.duration_minutes,
    v.status,
    v.created_at,
    v.updated_at
  from public.admissions_scheduled_visits v
  where v.organization_id = v_source_org_id;

  insert into public.organization_progress_log (
    organization_id, entry_date, phase_number, phase_title, title, summary, highlights, published, created_at, updated_at
  )
  select
    v_demo_org_id,
    entry_date,
    phase_number,
    phase_title,
    title,
    summary,
    highlights,
    published,
    created_at,
    updated_at
  from public.organization_progress_log
  where organization_id = v_source_org_id;

  insert into public.activity_events (
    organization_id, actor_type, actor_user_id, actor_email, surface, action,
    entity_type, entity_id, summary, metadata, severity, created_at
  )
  select
    v_demo_org_id,
    e.actor_type,
    e.actor_user_id,
    e.actor_email,
    e.surface,
    e.action,
    e.entity_type,
    coalesce(
      (
        select m.new_id
        from id_map m
        where m.old_id = e.entity_id
          and m.entity in (
            'application_form_versions',
            'applications',
            'programs',
            'document_templates',
            'enrollment_checklist_templates'
          )
      ),
      e.entity_id
    ),
    e.summary,
    e.metadata,
    e.severity,
    e.created_at
  from public.activity_events e
  where e.organization_id = v_source_org_id;

  raise notice 'Demo org created: % (id=%)', v_demo_slug, v_demo_org_id;
end $$;

commit;

-- STEP 2 (post-flight verification — run separately after Step 1):
-- select o.id, o.slug, o.name, o.timezone,
--        (select count(*) from application_form_versions f where f.organization_id = o.id) as forms,
--        (select count(*) from organization_progress_log p where p.organization_id = o.id) as progress_entries,
--        (select count(*) from admissions_availability_slots s where s.organization_id = o.id) as slots
-- from public.organizations o
-- where o.slug in ('rooted-meadows-school', 'rooted-meadows-demo')
-- order by o.slug;
--
-- Expected: same counts for both orgs, different IDs.
--
-- Demo URLs:
--   /school/rooted-meadows-demo/admin
--   /school/rooted-meadows-demo/apply
--   /school/rooted-meadows-demo/forms/apply
--
-- STEP 3 (teardown — demo org only, when you want to reset):
-- delete from public.organizations where slug = 'rooted-meadows-demo';
