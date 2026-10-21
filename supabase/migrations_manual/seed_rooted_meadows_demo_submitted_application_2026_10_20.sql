-- Seed a minimal submitted application for rooted-meadows-demo (admin testing).
-- Form: Rooted Meadows 2026 Application (public_slug apply)
-- Idempotent: full success skips when responses.__seed_source exists; partial runs
--   upsert family/guardian/student and complete the application graph.
-- Default UUIDs are for this script only — do not reuse ids from import_rooted_meadows_submission_*.
-- Run in Supabase SQL Editor (remote). No auth user / parent portal link.

begin;

do $$
declare
  v_seed_source     text := 'rooted_meadows_demo_submitted_min_2026_10_20';
  v_seed_email      text := 'demo-seed-submitted@example.invalid';

  -- Default ids (demo seed only; not used by legacy import scripts)
  c_family_id       uuid := 'a0102026-1020-4d6a-b010-200000000001';
  c_guardian_id     uuid := 'a0102026-1020-4d6a-b010-200000000002';
  c_student_id      uuid := 'a0102026-1020-4d6a-b010-200000000003';
  c_application_id  uuid := 'a0102026-1020-4d6a-b010-200000000004';
  c_payment_id      uuid := 'a0102026-1020-4d6a-b010-200000000005';

  v_org_id          uuid;
  v_form_version_id uuid;
  v_program_id      uuid;
  v_fee_enabled     boolean;
  v_fee_amount      integer;

  v_family_id       uuid;
  v_guardian_id     uuid;
  v_student_id      uuid;
  v_application_id  uuid;
  v_payment_id      uuid;

  v_existing_family_id uuid;
  v_submitted_at    timestamptz := now();
  v_fee_status      text;
  v_responses       jsonb;
begin
  v_family_id := c_family_id;
  v_guardian_id := c_guardian_id;
  v_student_id := c_student_id;
  v_application_id := c_application_id;
  v_payment_id := c_payment_id;

  select o.id
  into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows-demo';

  if v_org_id is null then
    raise exception 'Organization rooted-meadows-demo not found.';
  end if;

  select
    afv.id,
    afv.program_id,
    coalesce((afv.fee_config->>'enabled')::boolean, false),
    coalesce(nullif(afv.fee_config->>'amount_cents', '')::integer, 7500)
  into
    v_form_version_id,
    v_program_id,
    v_fee_enabled,
    v_fee_amount
  from public.application_form_versions afv
  where afv.organization_id = v_org_id
    and afv.title = 'Rooted Meadows 2026 Application'
    and afv.public_slug = 'apply'
    and afv.status = 'published'
  order by afv.version desc
  limit 1;

  if v_form_version_id is null then
    raise exception
      'Published Rooted Meadows 2026 Application (apply) not found for rooted-meadows-demo.';
  end if;

  if v_program_id is null then
    raise exception
      'Application form % has no program_id; link School Year program first.',
      v_form_version_id;
  end if;

  if exists (
    select 1
    from public.applications a
    where a.organization_id = v_org_id
      and a.responses->>'__seed_source' = v_seed_source
  ) then
    raise notice 'Demo submitted application seed already exists — skipping inserts.';
    return;
  end if;

  select f.id
  into v_existing_family_id
  from public.families f
  where f.organization_id = v_org_id
    and lower(f.primary_email) = lower(v_seed_email)
  limit 1;

  if v_existing_family_id is not null then
    v_family_id := v_existing_family_id;

    select g.id
    into v_guardian_id
    from public.guardians g
    where g.organization_id = v_org_id
      and g.family_id = v_family_id
    order by case when lower(g.email) = lower(v_seed_email) then 0 else 1 end
    limit 1;

    select s.id
    into v_student_id
    from public.students s
    where s.organization_id = v_org_id
      and s.family_id = v_family_id
    order by
      case
        when s.first_name = 'Avery' and s.last_name = 'Seedling' then 0
        else 1
      end
    limit 1;

    select a.id
    into v_application_id
    from public.applications a
    where a.organization_id = v_org_id
      and a.id = c_application_id
    limit 1;

    if v_application_id is null then
      v_application_id := c_application_id;
    end if;

    if v_guardian_id is null then
      v_guardian_id := c_guardian_id;
    end if;

    if v_student_id is null then
      v_student_id := c_student_id;
    end if;
  end if;

  if v_family_id = c_family_id
    and exists (
      select 1
      from public.families f
      where f.id = c_family_id
        and f.organization_id <> v_org_id
    )
  then
    raise exception 'Default seed family id % belongs to another organization.', c_family_id;
  end if;

  if v_guardian_id = c_guardian_id
    and exists (
      select 1
      from public.guardians g
      where g.id = c_guardian_id
        and g.organization_id <> v_org_id
    )
  then
    raise exception 'Default seed guardian id % belongs to another organization.', c_guardian_id;
  end if;

  if v_student_id = c_student_id
    and exists (
      select 1
      from public.students s
      where s.id = c_student_id
        and s.organization_id <> v_org_id
    )
  then
    raise exception 'Default seed student id % belongs to another organization.', c_student_id;
  end if;

  if v_application_id = c_application_id
    and exists (
      select 1
      from public.applications a
      where a.id = c_application_id
        and a.organization_id <> v_org_id
    )
  then
    raise exception 'Default seed application id % belongs to another organization.', c_application_id;
  end if;

  v_responses := jsonb_build_object(
    '__seed_source', v_seed_source,
    '__progress', jsonb_build_object('stepIndex', 9),
    'student_first_name', 'Avery',
    'student_last_name', 'Seedling',
    'student_date_of_birth', '2018-04-12',
    'student_grade', '2'
  );

  if v_fee_enabled then
    v_fee_status := 'paid';
  else
    v_fee_status := 'not_required';
  end if;

  insert into public.families (
    id, organization_id, name, primary_email, primary_phone
  ) values (
    v_family_id,
    v_org_id,
    'Demo Seed Family',
    v_seed_email,
    '2085550100'
  )
  on conflict (id) do update set
    organization_id = excluded.organization_id,
    name = excluded.name,
    primary_email = excluded.primary_email,
    primary_phone = excluded.primary_phone,
    updated_at = now();

  insert into public.guardians (
    id, organization_id, family_id, first_name, last_name, email, phone
  ) values (
    v_guardian_id,
    v_org_id,
    v_family_id,
    'Casey',
    'Seedling',
    v_seed_email,
    '2085550100'
  )
  on conflict (id) do update set
    organization_id = excluded.organization_id,
    family_id = excluded.family_id,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    phone = excluded.phone,
    updated_at = now();

  insert into public.students (
    id, organization_id, family_id, first_name, last_name, date_of_birth, grade, status
  ) values (
    v_student_id,
    v_org_id,
    v_family_id,
    'Avery',
    'Seedling',
    '2018-04-12',
    '2',
    'prospect'
  )
  on conflict (id) do update set
    organization_id = excluded.organization_id,
    family_id = excluded.family_id,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    date_of_birth = excluded.date_of_birth,
    grade = excluded.grade,
    status = excluded.status,
    updated_at = now();

  insert into public.applications (
    id,
    organization_id,
    program_id,
    form_version_id,
    family_id,
    student_id,
    primary_guardian_id,
    status,
    responses,
    acknowledgments,
    fee_status,
    fee_paid_at,
    submitted_at,
    created_by_user_id
  ) values (
    v_application_id,
    v_org_id,
    v_program_id,
    v_form_version_id,
    v_family_id,
    v_student_id,
    v_guardian_id,
    'submitted',
    v_responses,
    '{}'::jsonb,
    v_fee_status,
    case when v_fee_enabled then v_submitted_at else null end,
    v_submitted_at,
    null
  )
  on conflict (id) do update set
    organization_id = excluded.organization_id,
    program_id = excluded.program_id,
    form_version_id = excluded.form_version_id,
    family_id = excluded.family_id,
    student_id = excluded.student_id,
    primary_guardian_id = excluded.primary_guardian_id,
    status = excluded.status,
    responses = excluded.responses,
    acknowledgments = excluded.acknowledgments,
    fee_status = excluded.fee_status,
    fee_paid_at = excluded.fee_paid_at,
    submitted_at = excluded.submitted_at,
    updated_at = now();

  if v_fee_enabled then
    select ap.id
    into v_payment_id
    from public.application_payments ap
    where ap.application_id = v_application_id
      and ap.payment_type = 'application_fee'
      and ap.status = 'succeeded'
    limit 1;

    if v_payment_id is null then
      v_payment_id := c_payment_id;
    end if;

    insert into public.application_payments (
      id,
      organization_id,
      application_id,
      payment_type,
      label,
      amount_cents,
      currency,
      status,
      paid_at
    ) values (
      v_payment_id,
      v_org_id,
      v_application_id,
      'application_fee',
      'Application fee',
      v_fee_amount,
      'USD',
      'succeeded',
      v_submitted_at
    )
    on conflict (id) do update set
      organization_id = excluded.organization_id,
      application_id = excluded.application_id,
      payment_type = excluded.payment_type,
      label = excluded.label,
      amount_cents = excluded.amount_cents,
      currency = excluded.currency,
      status = excluded.status,
      paid_at = excluded.paid_at;
  end if;

  if not exists (
    select 1
    from public.activity_events ae
    where ae.entity_id = v_application_id
      and ae.action = 'application.submitted'
      and ae.metadata->>'seed_source' = v_seed_source
  ) then
    insert into public.activity_events (
      organization_id,
      actor_type,
      surface,
      action,
      entity_type,
      entity_id,
      summary,
      metadata
    ) values (
      v_org_id,
      'system',
      'admissions',
      'application.submitted',
      'application',
      v_application_id,
      'Seeded demo submitted application for Avery Seedling',
      jsonb_build_object('seed_source', v_seed_source)
    );
  end if;

  raise notice 'Seeded demo submitted application: %', v_application_id;
end $$;

-- Verification: copy application_id into admin submissions URL
select
  a.id as application_id,
  a.status,
  a.submitted_at,
  s.first_name || ' ' || s.last_name as student_name,
  afv.title as form_title,
  '/school/rooted-meadows-demo/admin/admissions/submissions?applicationId=' || a.id::text
    as admin_submissions_url
from public.applications a
join public.organizations o on o.id = a.organization_id
join public.application_form_versions afv on afv.id = a.form_version_id
left join public.students s on s.id = a.student_id
where o.slug = 'rooted-meadows-demo'
  and a.responses->>'__seed_source' = 'rooted_meadows_demo_submitted_min_2026_10_20';

commit;
