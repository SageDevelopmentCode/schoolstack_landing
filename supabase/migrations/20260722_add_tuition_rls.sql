-- Tuition billing RLS policies
-- Run after: 20260722_add_tuition_schema.sql

alter table public.tuition_rate_plans enable row level security;
alter table public.tuition_payment_plans enable row level security;
alter table public.tuition_fee_components enable row level security;
alter table public.tuition_billing_accounts enable row level security;
alter table public.tuition_enrollment_assignments enable row level security;
alter table public.tuition_adjustments enable row level security;
alter table public.tuition_charges enable row level security;
alter table public.tuition_adjustment_rules enable row level security;
alter table public.family_payment_methods enable row level security;

-- Helper macro pattern: org admin full access, guardians read own family data

-- ── tuition_rate_plans ───────────────────────────────────────────────────────

create policy "Platform admins manage tuition_rate_plans"
  on public.tuition_rate_plans for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read tuition_rate_plans"
  on public.tuition_rate_plans for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins manage tuition_rate_plans"
  on public.tuition_rate_plans for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

-- ── tuition_payment_plans ────────────────────────────────────────────────────

create policy "Platform admins manage tuition_payment_plans"
  on public.tuition_payment_plans for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read tuition_payment_plans"
  on public.tuition_payment_plans for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins manage tuition_payment_plans"
  on public.tuition_payment_plans for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

-- ── tuition_fee_components ───────────────────────────────────────────────────

create policy "Platform admins manage tuition_fee_components"
  on public.tuition_fee_components for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read tuition_fee_components"
  on public.tuition_fee_components for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins manage tuition_fee_components"
  on public.tuition_fee_components for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

-- ── tuition_billing_accounts ─────────────────────────────────────────────────

create policy "Platform admins manage tuition_billing_accounts"
  on public.tuition_billing_accounts for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read tuition_billing_accounts"
  on public.tuition_billing_accounts for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Guardians read own tuition_billing_accounts"
  on public.tuition_billing_accounts for select to authenticated
  using (public.user_is_guardian_for_family(family_id));

create policy "Org admins manage tuition_billing_accounts"
  on public.tuition_billing_accounts for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians update own tuition_billing_accounts"
  on public.tuition_billing_accounts for update to authenticated
  using (public.user_is_guardian_for_family(family_id))
  with check (public.user_is_guardian_for_family(family_id));

-- ── tuition_enrollment_assignments ─────────────────────────────────────────────

create policy "Platform admins manage tuition_enrollment_assignments"
  on public.tuition_enrollment_assignments for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read tuition_enrollment_assignments"
  on public.tuition_enrollment_assignments for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Guardians read own tuition_enrollment_assignments"
  on public.tuition_enrollment_assignments for select to authenticated
  using (public.user_is_guardian_for_family(family_id));

create policy "Org admins manage tuition_enrollment_assignments"
  on public.tuition_enrollment_assignments for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

-- ── tuition_adjustments ──────────────────────────────────────────────────────

create policy "Platform admins manage tuition_adjustments"
  on public.tuition_adjustments for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read tuition_adjustments"
  on public.tuition_adjustments for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Guardians read own tuition_adjustments"
  on public.tuition_adjustments for select to authenticated
  using (
    exists (
      select 1 from public.tuition_enrollment_assignments a
      where a.id = assignment_id
        and public.user_is_guardian_for_family(a.family_id)
    )
  );

create policy "Org admins manage tuition_adjustments"
  on public.tuition_adjustments for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

-- ── tuition_charges ────────────────────────────────────────────────────────────

create policy "Platform admins manage tuition_charges"
  on public.tuition_charges for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read tuition_charges"
  on public.tuition_charges for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Guardians read own tuition_charges"
  on public.tuition_charges for select to authenticated
  using (public.user_is_guardian_for_family(family_id));

create policy "Org admins manage tuition_charges"
  on public.tuition_charges for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

-- ── tuition_adjustment_rules ─────────────────────────────────────────────────

create policy "Platform admins manage tuition_adjustment_rules"
  on public.tuition_adjustment_rules for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read tuition_adjustment_rules"
  on public.tuition_adjustment_rules for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins manage tuition_adjustment_rules"
  on public.tuition_adjustment_rules for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

-- ── family_payment_methods ───────────────────────────────────────────────────

create policy "Platform admins manage family_payment_methods"
  on public.family_payment_methods for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read family_payment_methods"
  on public.family_payment_methods for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Guardians read own family_payment_methods"
  on public.family_payment_methods for select to authenticated
  using (public.user_is_guardian_for_family(family_id));

create policy "Org admins manage family_payment_methods"
  on public.family_payment_methods for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Guardians manage own family_payment_methods"
  on public.family_payment_methods for all to authenticated
  using (public.user_is_guardian_for_family(family_id))
  with check (public.user_is_guardian_for_family(family_id));
