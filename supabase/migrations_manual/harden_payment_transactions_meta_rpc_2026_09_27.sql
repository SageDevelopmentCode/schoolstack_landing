-- Promoted to supabase/migrations/20260927_harden_payment_transactions_meta_rpc.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- 2026-09-27: Auth guard + scoped execute grants for payment transactions meta RPC.

create or replace function public.get_organization_payment_transactions_meta(
  p_organization_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (
    public.is_platform_admin()
    or public.user_is_org_admin(p_organization_id)
  ) then
    raise exception 'permission_denied'
      using errcode = '42501';
  end if;

  return (
    with base as (
      select
        ap.status,
        ap.payment_type,
        ap.amount_cents,
        coalesce(ap.paid_at, ap.created_at) as payment_ts
      from public.application_payments ap
      where ap.organization_id = p_organization_id
    ),
    status_counts as (
      select coalesce(
        jsonb_object_agg(status, count)::jsonb,
        '{}'::jsonb
      ) as counts
      from (
        select status::text as status, count(*)::int as count
        from base
        group by status
      ) grouped
    ),
    type_counts as (
      select coalesce(
        jsonb_object_agg(payment_type, count)::jsonb,
        '{}'::jsonb
      ) as counts
      from (
        select payment_type::text as payment_type, count(*)::int as count
        from base
        group by payment_type
      ) grouped
    ),
    summary_row as (
      select
        coalesce(
          sum(
            case
              when status = 'succeeded'
                and extract(year from payment_ts) = extract(year from now())
                and extract(month from payment_ts) = extract(month from now())
              then amount_cents
              else 0
            end
          ),
          0
        )::bigint as collected_this_month_cents,
        coalesce(
          sum(
            case
              when status = 'succeeded'
                and extract(year from payment_ts) = extract(year from now())
              then amount_cents
              else 0
            end
          ),
          0
        )::bigint as collected_ytd_cents,
        coalesce(
          sum(case when status = 'pending' then 1 else 0 end),
          0
        )::int as pending_count,
        coalesce(
          sum(case when status = 'pending' then amount_cents else 0 end),
          0
        )::bigint as pending_cents,
        coalesce(
          sum(case when status = 'failed' then 1 else 0 end),
          0
        )::int as failed_count,
        coalesce(
          sum(case when status = 'refunded' then 1 else 0 end),
          0
        )::int as refunded_count,
        coalesce(
          sum(case when status = 'refunded' then amount_cents else 0 end),
          0
        )::bigint as refunded_cents,
        coalesce(
          sum(
            case
              when status = 'succeeded' and payment_type = 'application_fee'
              then amount_cents
              else 0
            end
          ),
          0
        )::bigint as application_fee_cents,
        coalesce(
          sum(
            case
              when status = 'succeeded' and payment_type = 'enrollment_checklist'
              then amount_cents
              else 0
            end
          ),
          0
        )::bigint as enrollment_cents,
        coalesce(
          sum(
            case
              when status = 'succeeded' and payment_type = 'tuition'
              then amount_cents
              else 0
            end
          ),
          0
        )::bigint as tuition_cents
      from base
    )
    select jsonb_build_object(
      'total_count',
      (select count(*)::int from base),
      'status_counts',
      (select counts from status_counts),
      'type_counts',
      (select counts from type_counts),
      'summary',
      (
        select jsonb_build_object(
          'collected_this_month_cents',
          collected_this_month_cents,
          'collected_ytd_cents',
          collected_ytd_cents,
          'pending_count',
          pending_count,
          'pending_cents',
          pending_cents,
          'failed_count',
          failed_count,
          'refunded_count',
          refunded_count,
          'refunded_cents',
          refunded_cents,
          'application_fee_cents',
          application_fee_cents,
          'enrollment_cents',
          enrollment_cents,
          'tuition_cents',
          tuition_cents
        )
        from summary_row
      )
    )
  );
end;
$$;

revoke all on function public.get_organization_payment_transactions_meta(uuid)
  from public;

grant execute on function public.get_organization_payment_transactions_meta(uuid)
  to authenticated;
