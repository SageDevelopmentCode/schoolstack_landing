-- Seed tuition rate catalog for rooted-meadows-demo
-- Safe to re-run: skips if rate plan already exists for program.

do $$
declare
  v_org_id uuid;
  v_program_id uuid;
  v_rate_plan_id uuid;
  v_payment_plan_id uuid;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows-demo';

  if v_org_id is null then
    raise notice 'Organization rooted-meadows-demo not found — skipping tuition seed.';
    return;
  end if;

  select p.id into v_program_id
  from public.programs p
  where p.organization_id = v_org_id
    and p.name ilike '%School Year 2026%'
  order by p.created_at desc
  limit 1;

  if v_program_id is null then
    raise notice 'School Year program not found for rooted-meadows-demo — skipping.';
    return;
  end if;

  select rp.id into v_rate_plan_id
  from public.tuition_rate_plans rp
  where rp.organization_id = v_org_id
    and rp.program_id = v_program_id
    and rp.name = 'School Year 2026–27'
  limit 1;

  if v_rate_plan_id is null then
    insert into public.tuition_rate_plans (
      organization_id,
      program_id,
      name,
      billing_basis,
      amount_cents,
      currency,
      effective_start,
      effective_end,
      status
    )
    values (
      v_org_id,
      v_program_id,
      'School Year 2026–27',
      'annual',
      720000,
      'USD',
      '2026-08-01',
      '2027-05-31',
      'active'
    )
    returning id into v_rate_plan_id;

    insert into public.tuition_payment_plans (
      organization_id,
      rate_plan_id,
      name,
      installment_count,
      installment_amount_cents,
      billing_day_of_month,
      is_default
    )
    values (
      v_org_id,
      v_rate_plan_id,
      '10 monthly payments',
      10,
      72000,
      1,
      true
    )
    returning id into v_payment_plan_id;

    insert into public.tuition_fee_components (
      organization_id,
      rate_plan_id,
      code,
      label,
      amount_cents,
      timing,
      required
    )
    values
      (v_org_id, v_rate_plan_id, 'supply_fee', 'Supply Fee', 50000, 'enrollment', true),
      (v_org_id, v_rate_plan_id, 'activities_fee', 'Activities Fee', 15000, 'enrollment', true);

    insert into public.tuition_adjustment_rules (
      organization_id,
      name,
      priority,
      conditions,
      adjustment_type,
      value_percent,
      reason,
      auto_apply,
      active
    )
    values (
      v_org_id,
      'Sibling discount',
      10,
      '{"all":[{"field":"active_enrollments_in_family","op":"gte","value":2}]}'::jsonb,
      'percent_discount',
      10,
      'Sibling discount',
      true,
      true
    );

    insert into public.tuition_rate_tiers (
      organization_id,
      rate_plan_id,
      code,
      label,
      amount_cents,
      sort_order,
      is_default
    )
    values (
      v_org_id,
      v_rate_plan_id,
      'default',
      'Standard',
      720000,
      0,
      true
    );

    raise notice 'Created tuition rate plan for rooted-meadows-demo.';
  else
    raise notice 'Tuition rate plan already exists for rooted-meadows-demo — skipping.';
  end if;
end $$;
