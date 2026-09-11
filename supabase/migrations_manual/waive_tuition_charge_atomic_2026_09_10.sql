-- Promoted to supabase/migrations/20260921_waive_tuition_charge_atomic.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

create or replace function public.waive_tuition_charge_atomic(
  p_charge_id uuid,
  p_organization_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent public.tuition_charges;
  v_cascaded_ids uuid[];
begin
  select *
  into v_parent
  from public.tuition_charges
  where id = p_charge_id
    and organization_id = p_organization_id
    and charge_type = 'tuition'
    and status = 'overdue'
    and paid_cents = 0
  for update;

  if not found then
    raise exception 'charge_waive_conflict'
      using errcode = 'P0001';
  end if;

  select coalesce(array_agg(id order by id), '{}')
  into v_cascaded_ids
  from public.tuition_charges
  where organization_id = p_organization_id
    and charge_type = 'late_fee'
    and status in ('scheduled', 'sent', 'overdue')
    and paid_cents = 0
    and metadata->>'sourceChargeId' = p_charge_id::text;

  if cardinality(v_cascaded_ids) > 0 then
    update public.tuition_charges
    set status = 'waived'
    where id = any (v_cascaded_ids)
      and organization_id = p_organization_id
      and charge_type = 'late_fee'
      and status in ('scheduled', 'sent', 'overdue')
      and paid_cents = 0;
  end if;

  update public.tuition_charges
  set status = 'waived'
  where id = p_charge_id
    and organization_id = p_organization_id
    and charge_type = 'tuition'
    and status = 'overdue'
    and paid_cents = 0
  returning *
  into v_parent;

  if not found then
    raise exception 'charge_waive_conflict'
      using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'charge', to_jsonb(v_parent),
    'cascaded_late_fee_ids', to_jsonb(v_cascaded_ids)
  );
end;
$$;

revoke all on function public.waive_tuition_charge_atomic(uuid, uuid)
  from public, authenticated;

grant execute on function public.waive_tuition_charge_atomic(uuid, uuid)
  to service_role;
