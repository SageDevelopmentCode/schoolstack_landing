-- Lean aggregates for parent portal billing summary cards
-- Run after: 20260848_admin_schedule_page_meta.sql

create or replace function public.parent_billing_page_meta(
  p_organization_id uuid,
  p_family_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_balance_due_cents bigint := 0;
  v_total_remaining_cents bigint := 0;
  v_next_due_date date;
  v_next_due_amount_cents integer := 0;
  v_open_charge_count integer := 0;
  v_payment_count integer := 0;
  v_has_billing_split boolean := false;
begin
  select coalesce(
    sum(public.tuition_charge_outstanding_balance(tc.amount_cents, tc.paid_cents)),
    0
  )::bigint
  into v_total_remaining_cents
  from public.tuition_charges tc
  where tc.organization_id = p_organization_id
    and tc.family_id = p_family_id
    and tc.status in ('scheduled', 'sent', 'overdue')
    and public.tuition_charge_outstanding_balance(tc.amount_cents, tc.paid_cents) > 0;

  select coalesce(
    sum(public.tuition_charge_outstanding_balance(tc.amount_cents, tc.paid_cents)),
    0
  )::bigint
  into v_balance_due_cents
  from public.tuition_charges tc
  where tc.organization_id = p_organization_id
    and tc.family_id = p_family_id
    and tc.status in ('scheduled', 'sent', 'overdue')
    and public.tuition_charge_outstanding_balance(tc.amount_cents, tc.paid_cents) > 0
    and (tc.status = 'overdue' or tc.due_date <= current_date);

  select count(*)::integer
  into v_open_charge_count
  from public.tuition_charges tc
  where tc.organization_id = p_organization_id
    and tc.family_id = p_family_id
    and tc.status in ('scheduled', 'sent', 'overdue')
    and public.tuition_charge_outstanding_balance(tc.amount_cents, tc.paid_cents) > 0;

  select tc.due_date, tc.amount_cents
  into v_next_due_date, v_next_due_amount_cents
  from public.tuition_charges tc
  where tc.organization_id = p_organization_id
    and tc.family_id = p_family_id
    and tc.status in ('scheduled', 'sent', 'overdue')
    and public.tuition_charge_outstanding_balance(tc.amount_cents, tc.paid_cents) > 0
  order by tc.due_date asc nulls last, tc.created_at asc
  limit 1;

  select count(*)::integer
  into v_payment_count
  from public.application_payments ap
  where ap.family_id = p_family_id
    and ap.payment_type = 'tuition'
    and ap.status = 'succeeded';

  select exists (
    select 1
    from public.tuition_billing_splits tbs
    where tbs.family_id = p_family_id
  )
  into v_has_billing_split;

  return jsonb_build_object(
    'balance_due_cents', v_balance_due_cents,
    'total_remaining_cents', v_total_remaining_cents,
    'next_due_date', v_next_due_date,
    'next_due_amount_cents', coalesce(v_next_due_amount_cents, 0),
    'open_charge_count', v_open_charge_count,
    'payment_count', v_payment_count,
    'has_billing_split', v_has_billing_split
  );
end;
$$;

grant execute on function public.parent_billing_page_meta(uuid, uuid) to authenticated;
