-- Clone Rooted Meadows demo org into production tenant.
-- Source: rooted-meadows-demo
-- Target: rooted-meadows
--
-- Copies all school configuration (forms, programs, branding, enrollment templates,
-- progress log). Keeps only Olivia Ritchie and Joseph Olson admissions submissions.
-- Skips Stripe Connect, memberships, staff, schedule openings, visits, and demo enrollment state.
--
-- Safe to re-run only after teardown (see STEP 3 at bottom).
-- Does NOT modify the source org.
--
-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 0 — Pre-flight (run separately first)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Confirm source exists and target is free:
--
-- select id, slug, name, status, timezone
-- from public.organizations
-- where slug in ('rooted-meadows-demo', 'rooted-meadows', 'rooted-meadows-school')
-- order by slug;
--
-- List demo applications (expect 2 legacy imports; extra demo rows are ignored):
--
-- select
--   a.id,
--   s.first_name || ' ' || s.last_name as student,
--   f.primary_email,
--   a.responses->>'__import_source' as import_source,
--   a.status,
--   a.fee_status
-- from public.applications a
-- left join public.students s on s.id = a.student_id
-- left join public.families f on f.id = a.family_id
-- join public.organizations o on o.id = a.organization_id
-- where o.slug = 'rooted-meadows-demo'
-- order by a.created_at;
--
-- Confirm no Stripe account on demo (production org will also have none):
--
-- select o.slug, pa.*
-- from public.organization_payment_accounts pa
-- join public.organizations o on o.id = pa.organization_id
-- where o.slug = 'rooted-meadows-demo';
--
-- Count schedule openings on demo (production org will have 0):
--
-- select count(*) as demo_slots
-- from public.admissions_availability_slots s
-- join public.organizations o on o.id = s.organization_id
-- where o.slug = 'rooted-meadows-demo';
--
-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1 — Run everything below (begin … commit)
-- ═══════════════════════════════════════════════════════════════════════════════

begin;

do $$
declare
  v_source_slug text := 'rooted-meadows-demo';
  v_target_slug text := 'rooted-meadows';
  v_target_name text := 'Rooted Meadows Waldorf School';
  v_target_status text := 'live';
  v_target_crm_school_id text := 'rooted-meadows';

  v_import_sources text[] := array[
    'legacy_google_form_2026_27_ritchie_olivia',
    'legacy_google_form_2026_27_olson_joseph'
  ];

  v_source_org_id uuid;
  v_target_org_id uuid;
  v_kept_application_count integer;
begin
  select id into v_source_org_id
  from public.organizations
  where slug = v_source_slug;

  if v_source_org_id is null then
    raise exception 'Source org "%" not found.', v_source_slug;
  end if;

  if exists (select 1 from public.organizations where slug = v_target_slug) then
    raise exception 'Target org "%" already exists. Run teardown first (STEP 3).', v_target_slug;
  end if;

  select count(*) into v_kept_application_count
  from public.applications a
  where a.organization_id = v_source_org_id
    and a.responses->>'__import_source' = any (v_import_sources);

  if v_kept_application_count <> 2 then
    raise exception
      'Expected exactly 2 legacy applications on "%", found %. Check __import_source tags.',
      v_source_slug, v_kept_application_count;
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
    v_target_slug,
    v_target_name,
    v_target_status,
    o.timezone,
    v_target_crm_school_id
  from public.organizations o
  where o.id = v_source_org_id
  returning id into v_target_org_id;

  -- 2) organization_settings
  insert into public.organization_settings (organization_id, branding, features, created_at, updated_at)
  select v_target_org_id, branding, features, created_at, updated_at
  from public.organization_settings
  where organization_id = v_source_org_id;

  -- Config: programs
  insert into id_map (entity, old_id, new_id)
  select 'programs', id, gen_random_uuid()
  from public.programs
  where organization_id = v_source_org_id;

  insert into public.programs (
    id, organization_id, name, type, status, start_date, end_date, capacity, created_at, updated_at
  )
  select
    m.new_id,
    v_target_org_id,
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

  -- Config: classrooms
  insert into id_map (entity, old_id, new_id)
  select 'classrooms', id, gen_random_uuid()
  from public.classrooms
  where organization_id = v_source_org_id;

  insert into public.classrooms (
    id, organization_id, program_id, name, status, created_at, updated_at
  )
  select
    m.new_id,
    v_target_org_id,
    (select new_id from id_map where entity = 'programs' and old_id = c.program_id),
    c.name,
    c.status,
    c.created_at,
    c.updated_at
  from public.classrooms c
  join id_map m on m.entity = 'classrooms' and m.old_id = c.id
  where c.organization_id = v_source_org_id;

  -- Config: document_templates
  insert into id_map (entity, old_id, new_id)
  select 'document_templates', id, gen_random_uuid()
  from public.document_templates
  where organization_id = v_source_org_id;

  insert into public.document_templates (
    id, organization_id, name, kind, content, status, created_at, updated_at
  )
  select
    m.new_id,
    v_target_org_id,
    d.name,
    d.kind,
    d.content,
    d.status,
    d.created_at,
    d.updated_at
  from public.document_templates d
  join id_map m on m.entity = 'document_templates' and m.old_id = d.id
  where d.organization_id = v_source_org_id;

  -- Config: fee_definitions
  insert into id_map (entity, old_id, new_id)
  select 'fee_definitions', id, gen_random_uuid()
  from public.fee_definitions
  where organization_id = v_source_org_id;

  insert into public.fee_definitions (
    id, organization_id, program_id, code, label, amount_cents, currency, active, created_at, updated_at
  )
  select
    m.new_id,
    v_target_org_id,
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

  -- Admissions data: families (only those linked to kept applications)
  insert into id_map (entity, old_id, new_id)
  select 'families', f.id, gen_random_uuid()
  from public.families f
  where f.organization_id = v_source_org_id
    and f.id in (
      select a.family_id
      from public.applications a
      where a.organization_id = v_source_org_id
        and a.responses->>'__import_source' = any (v_import_sources)
        and a.family_id is not null
    );

  insert into public.families (
    id, organization_id, name, primary_email, primary_phone, created_at, updated_at
  )
  select
    m.new_id,
    v_target_org_id,
    f.name,
    f.primary_email,
    f.primary_phone,
    f.created_at,
    f.updated_at
  from public.families f
  join id_map m on m.entity = 'families' and m.old_id = f.id
  where f.organization_id = v_source_org_id;

  -- Admissions data: guardians (families linked to kept applications; user_id cleared)
  insert into id_map (entity, old_id, new_id)
  select 'guardians', g.id, gen_random_uuid()
  from public.guardians g
  where g.organization_id = v_source_org_id
    and g.family_id in (
      select old_id from id_map where entity = 'families'
    );

  insert into public.guardians (
    id, organization_id, family_id, user_id, first_name, last_name, email, phone, relationship, created_at, updated_at
  )
  select
    m.new_id,
    v_target_org_id,
    (select new_id from id_map where entity = 'families' and old_id = g.family_id),
    null,
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

  -- Admissions data: students (only those linked to kept applications)
  insert into id_map (entity, old_id, new_id)
  select 'students', s.id, gen_random_uuid()
  from public.students s
  where s.organization_id = v_source_org_id
    and s.id in (
      select a.student_id
      from public.applications a
      where a.organization_id = v_source_org_id
        and a.responses->>'__import_source' = any (v_import_sources)
        and a.student_id is not null
    );

  insert into public.students (
    id, organization_id, family_id, first_name, last_name, date_of_birth, grade, status, created_at, updated_at
  )
  select
    m.new_id,
    v_target_org_id,
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

  -- Config: application_form_versions
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
    v_target_org_id,
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

  -- Config: enrollment_checklist_templates
  insert into id_map (entity, old_id, new_id)
  select 'enrollment_checklist_templates', id, gen_random_uuid()
  from public.enrollment_checklist_templates
  where organization_id = v_source_org_id;

  insert into public.enrollment_checklist_templates (
    id, organization_id, program_id, name, enrollment_path, status, created_at, updated_at
  )
  select
    m.new_id,
    v_target_org_id,
    (select new_id from id_map where entity = 'programs' and old_id = t.program_id),
    t.name,
    t.enrollment_path,
    t.status,
    t.created_at,
    t.updated_at
  from public.enrollment_checklist_templates t
  join id_map m on m.entity = 'enrollment_checklist_templates' and m.old_id = t.id
  where t.organization_id = v_source_org_id;

  -- Config: enrollment_checklist_template_items
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
    v_target_org_id,
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

  -- Admissions data: applications (Ritchie + Olson only; access_token regenerated, created_by cleared)
  insert into id_map (entity, old_id, new_id)
  select 'applications', a.id, gen_random_uuid()
  from public.applications a
  where a.organization_id = v_source_org_id
    and a.responses->>'__import_source' = any (v_import_sources);

  insert into public.applications (
    id, organization_id, program_id, form_version_id, family_id, student_id, primary_guardian_id,
    status, responses, acknowledgments, fee_status, fee_paid_at, submitted_at, access_token,
    created_by_user_id, created_at, updated_at
  )
  select
    m.new_id,
    v_target_org_id,
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
    null,
    a.created_at,
    a.updated_at
  from public.applications a
  join id_map m on m.entity = 'applications' and m.old_id = a.id
  where a.organization_id = v_source_org_id;

  -- Admissions data: application_files (kept applications only; storage paths rewritten for RLS)
  insert into public.application_files (
    organization_id, application_id, field_id, file_name, storage_path, mime_type, size_bytes, uploaded_by_user_id, created_at
  )
  select
    v_target_org_id,
    app_map.new_id,
    af.field_id,
    af.file_name,
    replace(
      replace(af.storage_path, v_source_org_id::text, v_target_org_id::text),
      af.application_id::text,
      app_map.new_id::text
    ),
    af.mime_type,
    af.size_bytes,
    null,
    af.created_at
  from public.application_files af
  join id_map app_map
    on app_map.entity = 'applications'
   and app_map.old_id = af.application_id
  where af.organization_id = v_source_org_id;

  -- Admissions data: application_payments (kept applications only; Stripe IDs nulled)
  insert into public.application_payments (
    organization_id, application_id, enrollment_checklist_item_id, payer_user_id,
    amount_cents, currency, status, payment_type, label,
    charged_amount_cents, processing_fee_cents, payment_method_type,
    stripe_checkout_session_id, stripe_payment_intent_id,
    paid_at, created_at
  )
  select
    v_target_org_id,
    app_map.new_id,
    null,
    null,
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
  join id_map app_map
    on app_map.entity = 'applications'
   and app_map.old_id = ap.application_id
  where ap.organization_id = v_source_org_id
    and ap.application_id in (
      select old_id from id_map where entity = 'applications'
    );

  -- Config: organization_progress_log
  insert into public.organization_progress_log (
    organization_id, entry_date, phase_number, phase_title, title, summary, highlights, published, created_at, updated_at
  )
  select
    v_target_org_id,
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

  raise notice 'Production org created: % (id=%)', v_target_slug, v_target_org_id;
end $$;

commit;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2 — Post-flight verification (run separately after Step 1)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- select o.slug, o.name, o.status,
--        (select count(*) from application_form_versions f where f.organization_id = o.id) as forms,
--        (select count(*) from applications a where a.organization_id = o.id) as applications,
--        (select count(*) from admissions_availability_slots s where s.organization_id = o.id) as slots,
--        (select count(*) from organization_payment_accounts pa where pa.organization_id = o.id) as stripe_accounts
-- from public.organizations o
-- where o.slug in ('rooted-meadows-demo', 'rooted-meadows')
-- order by o.slug;
--
-- Expected for rooted-meadows:
--   same form counts as demo, applications = 2, slots = 0, stripe_accounts = 0
--
-- select
--   s.first_name || ' ' || s.last_name as student,
--   f.primary_email,
--   a.status,
--   a.fee_status
-- from public.applications a
-- join public.organizations o on o.id = a.organization_id
-- join public.students s on s.id = a.student_id
-- join public.families f on f.id = a.family_id
-- where o.slug = 'rooted-meadows';
--
-- Production URLs:
--   /school/rooted-meadows/admin
--   /school/rooted-meadows/apply
--   /school/rooted-meadows/forms/apply
--
-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3 — Teardown (production org only, when you need to re-run Step 1)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- delete from public.organizations where slug = 'rooted-meadows';
--
-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 4 — Add school owner membership (after auth user exists)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- select id, email from auth.users where email = 'OWNER_EMAIL_HERE';
--
-- insert into public.organization_memberships (organization_id, user_id, role, status)
-- select o.id, 'OWNER_USER_UUID', 'owner', 'active'
-- from public.organizations o
-- where o.slug = 'rooted-meadows'
-- on conflict (organization_id, user_id) do update
--   set role = 'owner', status = 'active';
--
-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 5 — Link parent portal accounts (run after each parent signs up)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Olivia Ritchie / francescathemaker@gmail.com:
--
-- select id from auth.users where email = 'francescathemaker@gmail.com';
--
-- begin;
--
-- update public.guardians g
-- set user_id = 'PARENT_USER_UUID'
-- from public.organizations o
-- where g.organization_id = o.id
--   and o.slug = 'rooted-meadows'
--   and g.email = 'francescathemaker@gmail.com';
--
-- update public.applications a
-- set created_by_user_id = 'PARENT_USER_UUID'
-- from public.organizations o, public.students s
-- where a.organization_id = o.id
--   and o.slug = 'rooted-meadows'
--   and a.student_id = s.id
--   and s.first_name = 'Olivia' and s.last_name = 'Ritchie';
--
-- insert into public.organization_memberships (organization_id, user_id, role, status)
-- select o.id, 'PARENT_USER_UUID', 'parent', 'active'
-- from public.organizations o where o.slug = 'rooted-meadows'
-- on conflict (organization_id, user_id) do nothing;
--
-- commit;
--
-- Joseph Olson / bolsonmft@gmail.com:
--
-- select id from auth.users where email = 'bolsonmft@gmail.com';
--
-- begin;
--
-- update public.guardians g
-- set user_id = 'PARENT_USER_UUID'
-- from public.organizations o
-- where g.organization_id = o.id
--   and o.slug = 'rooted-meadows'
--   and g.email = 'bolsonmft@gmail.com';
--
-- update public.applications a
-- set created_by_user_id = 'PARENT_USER_UUID'
-- from public.organizations o, public.students s
-- where a.organization_id = o.id
--   and o.slug = 'rooted-meadows'
--   and a.student_id = s.id
--   and s.first_name = 'Joseph' and s.last_name = 'Olson';
--
-- insert into public.organization_memberships (organization_id, user_id, role, status)
-- select o.id, 'PARENT_USER_UUID', 'parent', 'active'
-- from public.organizations o where o.slug = 'rooted-meadows'
-- on conflict (organization_id, user_id) do nothing;
--
-- commit;
--
-- If application_files were copied, also copy objects in the application-files
-- storage bucket from demo paths to the rewritten paths (org prefix must match for RLS).
