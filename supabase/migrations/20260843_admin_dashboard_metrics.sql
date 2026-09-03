-- Lean aggregates for school admin dashboard initial load
-- Run after: 20260842_per_program_enrollment_checklist.sql

create or replace function public.count_admin_unread_messages(
  p_organization_id uuid,
  p_user_id uuid
)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.portal_messages pm
  inner join public.message_threads mt on mt.id = pm.thread_id
  left join public.message_thread_reads mtr
    on mtr.thread_id = pm.thread_id
   and mtr.user_id = p_user_id
  where mt.organization_id = p_organization_id
    and pm.sender_user_id <> p_user_id
    and (
      mtr.last_read_at is null
      or pm.created_at > mtr.last_read_at
    );
$$;

create or replace function public.admin_dashboard_metrics(
  p_organization_id uuid,
  p_user_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'active_applications',
      (
        select count(*)::int
        from public.applications
        where organization_id = p_organization_id
          and status not in ('enrolled', 'declined', 'withdrawn')
      ),
    'enrolled_count',
      (
        select count(*)::int
        from public.applications
        where organization_id = p_organization_id
          and status = 'enrolled'
      ),
    'submitted_count',
      (
        select count(*)::int
        from public.applications
        where organization_id = p_organization_id
          and status = 'submitted'
      ),
    'collected_this_month_cents',
      coalesce(
        (
          select sum(amount_cents)::bigint
          from public.application_payments
          where organization_id = p_organization_id
            and status = 'succeeded'
            and paid_at >= date_trunc('month', now())
        ),
        0
      ),
    'messages_unread',
      public.count_admin_unread_messages(p_organization_id, p_user_id)
  );
$$;

create index if not exists applications_org_status_submitted_at_idx
  on public.applications (organization_id, status, submitted_at desc nulls last);

create index if not exists application_payments_org_status_paid_at_idx
  on public.application_payments (organization_id, status, paid_at desc nulls last)
  where status = 'succeeded';
