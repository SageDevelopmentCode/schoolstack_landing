-- Arrow Calvert: materialize Supply Fee + Activities Fee checklist instances
-- for a checklist completed before seed_rooted_meadows_enrollment_fee_steps.sql ran.
-- Idempotent. Does NOT add ledger rows (existing $650 payment stays as-is).
--
-- Target: rooted-meadows production — application d4e5f6a7-b8c9-4012-e345-6789abcdef01
-- Run in Supabase SQL Editor after seed_rooted_meadows_enrollment_fee_steps.sql.

begin;

insert into public.enrollment_checklist_items (
  checklist_id,
  organization_id,
  template_item_id,
  item_key,
  status,
  payment_status,
  responses,
  completed_at
)
select
  ec.id,
  ec.organization_id,
  ti.id,
  ti.item_key,
  'completed',
  'paid',
  jsonb_build_object('adminBypass', true, 'bypassedAt', now(), 'note', 'Synced after template split'),
  coalesce(ec.updated_at, now())
from public.enrollment_checklists ec
join public.enrollment_checklist_template_items ti
  on ti.template_id = ec.template_id
  and ti.item_key in ('supply_fee', 'activities_fee')
where ec.application_id = 'd4e5f6a7-b8c9-4012-e345-6789abcdef01'
  and not exists (
    select 1
    from public.enrollment_checklist_items eci
    where eci.checklist_id = ec.id
      and eci.template_item_id = ti.id
  );

commit;
