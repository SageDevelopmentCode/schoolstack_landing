-- Extend payment ledger for tuition charges
-- Run after: 20260722_add_tuition_schema.sql, add_unified_payment_ledger.sql

alter table public.application_payments
  drop constraint if exists application_payments_payment_type_check;

alter table public.application_payments
  add constraint application_payments_payment_type_check
  check (payment_type in ('application_fee', 'enrollment_checklist', 'tuition'));

alter table public.application_payments
  alter column application_id drop not null;

alter table public.application_payments
  add column if not exists tuition_charge_id uuid
    references public.tuition_charges(id) on delete set null;

alter table public.application_payments
  add column if not exists family_id uuid
    references public.families(id) on delete set null;

create index if not exists application_payments_tuition_charge_id_idx
  on public.application_payments (tuition_charge_id)
  where tuition_charge_id is not null;

create index if not exists application_payments_family_id_idx
  on public.application_payments (family_id)
  where family_id is not null;

create unique index if not exists application_payments_tuition_succeeded_unique_idx
  on public.application_payments (tuition_charge_id)
  where tuition_charge_id is not null and status = 'succeeded';
