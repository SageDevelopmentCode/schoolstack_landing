-- Unified admissions payment ledger: extend application_payments for all charge types
-- Run after: add_organization_payment_accounts.sql, add_product_enrollment_checklists.sql

alter table public.application_payments
  add column if not exists payment_type text not null default 'application_fee'
    check (payment_type in ('application_fee', 'enrollment_checklist'));

alter table public.application_payments
  add column if not exists enrollment_checklist_item_id uuid
    references public.enrollment_checklist_items(id) on delete set null;

alter table public.application_payments
  add column if not exists label text;

alter table public.application_payments
  add column if not exists payer_user_id uuid references auth.users(id) on delete set null;

create index if not exists application_payments_org_created_at_idx
  on public.application_payments (organization_id, created_at desc);

create index if not exists application_payments_app_created_at_idx
  on public.application_payments (application_id, created_at desc);

create index if not exists application_payments_checklist_item_idx
  on public.application_payments (enrollment_checklist_item_id)
  where enrollment_checklist_item_id is not null;

create unique index if not exists application_payments_checklist_succeeded_unique_idx
  on public.application_payments (enrollment_checklist_item_id)
  where enrollment_checklist_item_id is not null and status = 'succeeded';

-- Backfill existing application-fee rows
update public.application_payments
set
  payment_type = 'application_fee',
  label = coalesce(label, 'Application fee')
where payment_type is null or label is null;

-- Fix stale application-fee rows stuck at pending after successful payment
update public.application_payments ap
set
  status = 'succeeded',
  paid_at = coalesce(ap.paid_at, a.fee_paid_at, now())
from public.applications a
where ap.application_id = a.id
  and ap.payment_type = 'application_fee'
  and ap.status = 'pending'
  and a.fee_status = 'paid';

-- Backfill succeeded enrollment checklist payments missing from the ledger
insert into public.application_payments (
  organization_id,
  application_id,
  payment_type,
  enrollment_checklist_item_id,
  label,
  amount_cents,
  currency,
  status,
  stripe_checkout_session_id,
  stripe_payment_intent_id,
  paid_at,
  created_at
)
select
  eci.organization_id,
  ec.application_id,
  'enrollment_checklist',
  eci.id,
  coalesce(fd.label, ti.label, 'Enrollment payment'),
  fd.amount_cents,
  coalesce(fd.currency, 'USD'),
  'succeeded',
  nullif(eci.responses->>'checkoutSessionId', ''),
  nullif(eci.responses->>'paymentIntentId', ''),
  coalesce(eci.completed_at, eci.updated_at, now()),
  coalesce(eci.completed_at, eci.updated_at, now())
from public.enrollment_checklist_items eci
join public.enrollment_checklists ec on ec.id = eci.checklist_id
join public.enrollment_checklist_template_items ti on ti.id = eci.template_item_id
left join public.fee_definitions fd on fd.id = ti.fee_definition_id
where eci.payment_status = 'paid'
  and fd.amount_cents is not null
  and not exists (
    select 1
    from public.application_payments ap
    where ap.enrollment_checklist_item_id = eci.id
      and ap.status = 'succeeded'
  );
