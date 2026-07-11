-- Product admissions: RLS policies for Phase 2 tables
-- Run after: add_product_admissions_rls_helpers.sql and all Phase 2 table migrations

alter table public.fee_definitions enable row level security;
alter table public.document_templates enable row level security;
alter table public.application_form_versions enable row level security;
alter table public.applications enable row level security;
alter table public.application_files enable row level security;
alter table public.enrollment_checklist_templates enable row level security;
alter table public.enrollment_checklist_template_items enable row level security;
alter table public.enrollment_checklists enable row level security;
alter table public.document_signatures enable row level security;
alter table public.enrollment_checklist_items enable row level security;

-- ── fee_definitions ───────────────────────────────────────────────────────────

create policy "Platform admins manage fee_definitions"
  on public.fee_definitions
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read fee_definitions"
  on public.fee_definitions
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert fee_definitions"
  on public.fee_definitions
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update fee_definitions"
  on public.fee_definitions
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete fee_definitions"
  on public.fee_definitions
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── document_templates ──────────────────────────────────────────────────────────

create policy "Platform admins manage document_templates"
  on public.document_templates
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read document_templates"
  on public.document_templates
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert document_templates"
  on public.document_templates
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update document_templates"
  on public.document_templates
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete document_templates"
  on public.document_templates
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── application_form_versions ─────────────────────────────────────────────────

create policy "Platform admins manage application_form_versions"
  on public.application_form_versions
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read application_form_versions"
  on public.application_form_versions
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Guardians can read published application forms"
  on public.application_form_versions
  for select
  to authenticated
  using (
    status = 'published'
    and public.user_is_active_org_member(organization_id)
  );

create policy "Org admins can insert application_form_versions"
  on public.application_form_versions
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update application_form_versions"
  on public.application_form_versions
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete application_form_versions"
  on public.application_form_versions
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── applications ──────────────────────────────────────────────────────────────

create policy "Platform admins manage applications"
  on public.applications
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read applications"
  on public.applications
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Guardians can read own applications"
  on public.applications
  for select
  to authenticated
  using (
    (family_id is not null and public.user_is_guardian_for_family(family_id))
    or created_by_user_id = auth.uid()
  );

create policy "Org admins can insert applications"
  on public.applications
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians can insert own applications"
  on public.applications
  for insert
  to authenticated
  with check (
    public.user_is_active_org_member(organization_id)
    and (
      family_id is null
      or public.user_is_guardian_for_family(family_id)
    )
    and (created_by_user_id is null or created_by_user_id = auth.uid())
  );

create policy "Org admins can update applications"
  on public.applications
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians can update own applications"
  on public.applications
  for update
  to authenticated
  using (
    (family_id is not null and public.user_is_guardian_for_family(family_id))
    or created_by_user_id = auth.uid()
  )
  with check (
    (family_id is null or public.user_is_guardian_for_family(family_id))
    and (created_by_user_id is null or created_by_user_id = auth.uid())
  );

create policy "Org admins can delete applications"
  on public.applications
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── application_files ─────────────────────────────────────────────────────────

create policy "Platform admins manage application_files"
  on public.application_files
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read application_files"
  on public.application_files
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Guardians can read own application files"
  on public.application_files
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.applications a
      where a.id = application_id
        and (
          (a.family_id is not null and public.user_is_guardian_for_family(a.family_id))
          or a.created_by_user_id = auth.uid()
        )
    )
  );

create policy "Org admins can insert application_files"
  on public.application_files
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians can insert own application files"
  on public.application_files
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.applications a
      where a.id = application_id
        and a.organization_id = application_files.organization_id
        and (
          (a.family_id is not null and public.user_is_guardian_for_family(a.family_id))
          or a.created_by_user_id = auth.uid()
        )
    )
  );

create policy "Org admins can update application_files"
  on public.application_files
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete application_files"
  on public.application_files
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

create policy "Guardians can delete own application files"
  on public.application_files
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.applications a
      where a.id = application_id
        and (
          (a.family_id is not null and public.user_is_guardian_for_family(a.family_id))
          or a.created_by_user_id = auth.uid()
        )
    )
  );

-- ── enrollment_checklist_templates ────────────────────────────────────────────

create policy "Platform admins manage enrollment_checklist_templates"
  on public.enrollment_checklist_templates
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read enrollment_checklist_templates"
  on public.enrollment_checklist_templates
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert enrollment_checklist_templates"
  on public.enrollment_checklist_templates
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update enrollment_checklist_templates"
  on public.enrollment_checklist_templates
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete enrollment_checklist_templates"
  on public.enrollment_checklist_templates
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── enrollment_checklist_template_items ───────────────────────────────────────

create policy "Platform admins manage enrollment_checklist_template_items"
  on public.enrollment_checklist_template_items
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read enrollment_checklist_template_items"
  on public.enrollment_checklist_template_items
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert enrollment_checklist_template_items"
  on public.enrollment_checklist_template_items
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update enrollment_checklist_template_items"
  on public.enrollment_checklist_template_items
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete enrollment_checklist_template_items"
  on public.enrollment_checklist_template_items
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── enrollment_checklists ─────────────────────────────────────────────────────

create policy "Platform admins manage enrollment_checklists"
  on public.enrollment_checklists
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read enrollment_checklists"
  on public.enrollment_checklists
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Guardians can read own enrollment checklists"
  on public.enrollment_checklists
  for select
  to authenticated
  using (public.user_is_guardian_for_enrollment(enrollment_id));

create policy "Org admins can insert enrollment_checklists"
  on public.enrollment_checklists
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update enrollment_checklists"
  on public.enrollment_checklists
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians can update own enrollment checklists"
  on public.enrollment_checklists
  for update
  to authenticated
  using (public.user_is_guardian_for_enrollment(enrollment_id))
  with check (public.user_is_guardian_for_enrollment(enrollment_id));

create policy "Org admins can delete enrollment_checklists"
  on public.enrollment_checklists
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── document_signatures ───────────────────────────────────────────────────────

create policy "Platform admins manage document_signatures"
  on public.document_signatures
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read document_signatures"
  on public.document_signatures
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert document_signatures"
  on public.document_signatures
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians can insert document signatures"
  on public.document_signatures
  for insert
  to authenticated
  with check (
    public.user_is_active_org_member(organization_id)
    and (signed_by_user_id is null or signed_by_user_id = auth.uid())
  );

create policy "Org admins can update document_signatures"
  on public.document_signatures
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete document_signatures"
  on public.document_signatures
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── enrollment_checklist_items ────────────────────────────────────────────────

create policy "Platform admins manage enrollment_checklist_items"
  on public.enrollment_checklist_items
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read enrollment_checklist_items"
  on public.enrollment_checklist_items
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Guardians can read own enrollment checklist items"
  on public.enrollment_checklist_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.enrollment_checklists ec
      where ec.id = checklist_id
        and public.user_is_guardian_for_enrollment(ec.enrollment_id)
    )
  );

create policy "Org admins can insert enrollment_checklist_items"
  on public.enrollment_checklist_items
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update enrollment_checklist_items"
  on public.enrollment_checklist_items
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians can update own enrollment checklist items"
  on public.enrollment_checklist_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.enrollment_checklists ec
      where ec.id = checklist_id
        and public.user_is_guardian_for_enrollment(ec.enrollment_id)
    )
  )
  with check (
    exists (
      select 1
      from public.enrollment_checklists ec
      where ec.id = checklist_id
        and public.user_is_guardian_for_enrollment(ec.enrollment_id)
    )
    and (completed_by_user_id is null or completed_by_user_id = auth.uid())
  );

create policy "Org admins can delete enrollment_checklist_items"
  on public.enrollment_checklist_items
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));


-- =============================================================================
-- Optional bootstrap: Rooted Meadows admissions seed (commented — run manually)
-- =============================================================================
--
-- Public apply uses service role or authenticated routes; access_token on
-- applications supports magic-link resume URLs validated in app code.
--
-- Step 1: Fee definitions for Rooted Meadows
--
-- insert into public.fee_definitions (organization_id, code, label, amount_cents)
-- select o.id, v.code, v.label, v.amount_cents
-- from public.organizations o
-- cross join (
--   values
--     ('application_fee', 'Application Fee', 5000),
--     ('registration_fee', 'Registration Fee', 25000),
--     ('activities_fee', 'Activities Fee', 15000),
--     ('supply_fee', 'Supply Fee', 7500)
-- ) as v(code, label, amount_cents)
-- where o.slug = 'rooted-meadows-school';
--
-- Step 2: Application form version
-- Convert schema JSON from src/data/school-demos/rooted-meadows-application.ts
-- (ROOTED_MEADOWS_APPLICATION_SECTIONS + ROOTED_MEADOWS_APPLICATION_ACKNOWLEDGMENTS)
--
-- insert into public.application_form_versions (
--   organization_id, version, status, title, intro, schema, fee_config, published_at
-- )
-- select
--   o.id,
--   1,
--   'published',
--   'Begin Your Application',
--   'We are honored that you are considering Rooted Meadows School...',
--   '{"sections": [], "acknowledgments": []}'::jsonb,
--   '{"enabled": true, "label": "Application fee", "amount_cents": 5000, "required_to_submit": true}'::jsonb,
--   now()
-- from public.organizations o
-- where o.slug = 'rooted-meadows-school';
--
-- Step 3: Document templates + enrollment checklist template
-- Convert from src/data/school-demos/rooted-meadows-enrollment-contracts.ts and
-- parent portal checklist items in RootedMeadowsParentDashboardDemo.tsx
