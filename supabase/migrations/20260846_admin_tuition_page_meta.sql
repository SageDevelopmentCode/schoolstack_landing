-- Lean aggregates for school admin tuition dashboard initial load
-- Run after: 20260845_admin_messages_list_helpers.sql

create or replace function public.tuition_charge_outstanding_balance(
  p_amount_cents integer,
  p_paid_cents integer
)
returns bigint
language sql
immutable
as $$
  select greatest(0, p_amount_cents - coalesce(p_paid_cents, 0))::bigint;
$$;

create or replace function public.admin_tuition_page_meta(
  p_organization_id uuid,
  p_outstanding_period text default 'current_month',
  p_school_year_start date default null,
  p_school_year_end date default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_today date := current_date;
  v_range_start date;
  v_range_end date;
  v_collected_ytd bigint;
  v_outstanding bigint := 0;
  v_families_at_risk integer;
  v_active_assignments integer;
  v_active_rate_plan_count integer;
  v_enrolled_count integer;
  v_unassigned_enrollment_count integer;
  v_pending_payment_plan_count integer;
  v_assignments_without_charges_count integer;
begin
  if p_outstanding_period = 'current_month' then
    v_range_start := date_trunc('month', v_today)::date;
    v_range_end := (date_trunc('month', v_today) + interval '1 month - 1 day')::date;
  elsif p_outstanding_period = 'next_month' then
    v_range_start := (date_trunc('month', v_today) + interval '1 month')::date;
    v_range_end := (date_trunc('month', v_today) + interval '2 months - 1 day')::date;
  elsif p_outstanding_period = 'next_3_months' then
    v_range_start := date_trunc('month', v_today)::date;
    v_range_end := (date_trunc('month', v_today) + interval '3 months - 1 day')::date;
  elsif p_outstanding_period = 'school_year_remainder' then
    v_range_start := v_today;
    v_range_end := p_school_year_end;
  else
    v_range_start := date_trunc('month', v_today)::date;
    v_range_end := (date_trunc('month', v_today) + interval '1 month - 1 day')::date;
  end if;

  select coalesce(sum(tc.amount_cents), 0)::bigint
  into v_collected_ytd
  from public.tuition_charges tc
  where tc.organization_id = p_organization_id
    and tc.status = 'paid'
    and tc.paid_at >= date_trunc('year', now());

  if p_outstanding_period = 'school_year_remainder' and v_range_end is null then
    v_outstanding := 0;
  else
    select coalesce(sum(public.tuition_charge_outstanding_balance(tc.amount_cents, tc.paid_cents)), 0)::bigint
    into v_outstanding
    from public.tuition_charges tc
    where tc.organization_id = p_organization_id
      and tc.status in ('scheduled', 'sent', 'overdue')
      and public.tuition_charge_outstanding_balance(tc.amount_cents, tc.paid_cents) > 0
      and (
        (p_outstanding_period <> 'next_month' and tc.status = 'overdue')
        or (
          v_range_start is not null
          and v_range_end is not null
          and tc.due_date >= v_range_start
          and tc.due_date <= v_range_end
        )
      );
  end if;

  select count(distinct tc.family_id)::integer
  into v_families_at_risk
  from public.tuition_charges tc
  where tc.organization_id = p_organization_id
    and tc.status = 'overdue'
    and public.tuition_charge_outstanding_balance(tc.amount_cents, tc.paid_cents) > 0;

  select count(*)::integer
  into v_active_assignments
  from public.tuition_enrollment_assignments tea
  where tea.organization_id = p_organization_id
    and tea.status = 'active';

  select count(*)::integer
  into v_active_rate_plan_count
  from public.tuition_rate_plans trp
  where trp.organization_id = p_organization_id
    and trp.status = 'active';

  select count(*)::integer
  into v_enrolled_count
  from public.enrollments e
  where e.organization_id = p_organization_id
    and e.status = 'enrolled';

  with assigned_enrollment_ids as (
    select tea.enrollment_id
    from public.tuition_enrollment_assignments tea
    where tea.organization_id = p_organization_id
      and tea.status = 'active'
  )
  select count(*)::integer
  into v_unassigned_enrollment_count
  from public.enrollments e
  where e.organization_id = p_organization_id
    and e.status = 'enrolled'
    and not exists (
      select 1
      from assigned_enrollment_ids a
      where a.enrollment_id = e.id
    );

  select count(*)::integer
  into v_pending_payment_plan_count
  from public.tuition_enrollment_assignments tea
  where tea.organization_id = p_organization_id
    and tea.status = 'active'
    and coalesce((tea.metadata ->> 'pendingPaymentPlanSelection')::boolean, false) = true;

  with assignment_ids_with_charges as (
    select distinct tc.assignment_id
    from public.tuition_charges tc
    where tc.organization_id = p_organization_id
      and tc.status <> 'void'
      and tc.assignment_id is not null
  )
  select count(*)::integer
  into v_assignments_without_charges_count
  from public.tuition_enrollment_assignments tea
  where tea.organization_id = p_organization_id
    and tea.status = 'active'
    and coalesce((tea.metadata ->> 'pendingPaymentPlanSelection')::boolean, false) = false
    and not exists (
      select 1
      from assignment_ids_with_charges c
      where c.assignment_id = tea.id
    );

  return jsonb_build_object(
    'collected_ytd_cents', v_collected_ytd,
    'outstanding_cents', v_outstanding,
    'families_at_risk', v_families_at_risk,
    'active_assignments', v_active_assignments,
    'readiness', jsonb_build_object(
      'has_active_rate_plan', v_active_rate_plan_count > 0,
      'enrolled_count', v_enrolled_count,
      'unassigned_enrollment_count', v_unassigned_enrollment_count,
      'pending_payment_plan_count', v_pending_payment_plan_count,
      'assignments_without_charges_count', v_assignments_without_charges_count
    )
  );
end;
$$;
