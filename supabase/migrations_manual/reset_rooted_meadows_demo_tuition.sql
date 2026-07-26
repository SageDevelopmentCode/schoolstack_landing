-- Reset tuition catalog for rooted-meadows-demo.
-- Run in Supabase SQL Editor (or: node scripts/reset-rooted-meadows-demo-tuition.mjs)
-- After reset, Tuition tab shows the setup wizard (no active rate plans).

do $$
declare
  v_org_id uuid;
begin
  select id into v_org_id
  from public.organizations
  where slug = 'rooted-meadows-demo';

  if v_org_id is null then
    raise exception 'Organization rooted-meadows-demo not found';
  end if;

  update public.application_payments
  set tuition_charge_id = null
  where organization_id = v_org_id
    and tuition_charge_id is not null;

  delete from public.tuition_charges
  where organization_id = v_org_id;

  delete from public.tuition_adjustments
  where organization_id = v_org_id;

  delete from public.tuition_enrollment_assignments
  where organization_id = v_org_id;

  delete from public.tuition_payment_plans
  where organization_id = v_org_id;

  delete from public.tuition_fee_components
  where organization_id = v_org_id;

  delete from public.tuition_rate_plans
  where organization_id = v_org_id;

  delete from public.tuition_adjustment_rules
  where organization_id = v_org_id;

  delete from public.tuition_billing_accounts
  where organization_id = v_org_id;

  raise notice 'Tuition reset complete for rooted-meadows-demo';
end $$;

-- Verify wizard gate will open
select count(*) as active_rate_plans
from public.tuition_rate_plans rp
join public.organizations o on o.id = rp.organization_id
where o.slug = 'rooted-meadows-demo'
  and rp.status = 'active';
