-- Rooted Meadows: shift Evensen & Ritchie tuition to a September billing start.
-- Families enrolled late August and should not owe August tuition or late fees.
--
-- Run in Supabase SQL Editor AFTER deploying the billing-start code changes.
-- Do NOT open the assignment modal and click Save (it no-ops when values are unchanged).
-- Do NOT toggle the payment plan or change the billing date during this procedure.
--
-- After Steps 1–3 (and optional 2b), regenerate charges with a same-value PATCH per
-- assignment while logged in as school admin (browser console):
--
-- await fetch("/api/tuition/assignments/d6dc604d-943c-4e79-a417-9f21caf3f636", {
--   method: "PATCH",
--   headers: { "Content-Type": "application/json" },
--   body: JSON.stringify({
--     paymentPlanId: "d71cbc99-6d74-4c57-b174-fa0bd8d6a164",
--     effectiveStart: "2026-09-01",
--   }),
-- });
-- await fetch("/api/tuition/assignments/fa3d745b-c239-460e-9446-969f0b239740", {
--   method: "PATCH",
--   headers: { "Content-Type": "application/json" },
--   body: JSON.stringify({
--     paymentPlanId: "d71cbc99-6d74-4c57-b174-fa0bd8d6a164",
--     effectiveStart: "2026-09-01",
--   }),
-- });
--
-- Re-run the verify select. Expect: Aug gone, Sep paid/owed as installment 1,
-- then Oct… through Aug 2027 as 2–12 (12-pay preserved).
--
-- Ritchie note: Zachary's paid August charge is reassigned to September (no refund).

-- ── Step 1: Set per-family billing start to September 1 ─────────────────────

update public.tuition_enrollment_assignments tea
set effective_start = '2026-09-01',
    updated_at = now()
from public.families f
join public.organizations o on o.id = f.organization_id
where tea.family_id = f.id
  and o.slug = 'rooted-meadows'
  and f.name in ('Evensen Family', 'Ritchie Family')
  and tea.status = 'active';

-- ── Step 2: Evensen — void unpaid August tuition + late fees ────────────────

update public.tuition_charges tc
set status = 'void',
    updated_at = now()
from public.tuition_enrollment_assignments tea
join public.families f on f.id = tea.family_id
join public.organizations o on o.id = f.organization_id
where tc.assignment_id = tea.id
  and o.slug = 'rooted-meadows'
  and f.name = 'Evensen Family'
  and tc.charge_type = 'tuition'
  and tc.due_date = '2026-08-01'
  and tc.status in ('scheduled', 'sent', 'overdue');

update public.tuition_charges tc
set status = 'waived',
    updated_at = now()
from public.tuition_enrollment_assignments tea
join public.families f on f.id = tea.family_id
join public.organizations o on o.id = f.organization_id
where tc.assignment_id = tea.id
  and o.slug = 'rooted-meadows'
  and f.name = 'Evensen Family'
  and tc.charge_type = 'late_fee'
  and tc.due_date in ('2026-08-15', '2026-09-10')
  and tc.status in ('scheduled', 'sent', 'overdue');

-- ── Step 2b (optional): void all remaining open tuition before regen ─────────
-- Closes the pay-the-old-installment window until regen runs. Paid rows untouched.

update public.tuition_charges tc
set status = 'void',
    updated_at = now()
from public.tuition_enrollment_assignments tea
join public.families f on f.id = tea.family_id
join public.organizations o on o.id = f.organization_id
where tc.assignment_id = tea.id
  and o.slug = 'rooted-meadows'
  and f.name in ('Evensen Family', 'Ritchie Family')
  and tc.charge_type = 'tuition'
  and tc.status in ('scheduled', 'sent', 'overdue');

-- ── Step 3: Ritchie — reassign paid August, void unpaid August/Sep dupes ────

-- Zachary: paid Aug → Sep installment 1
update public.tuition_charges tc
set due_date = '2026-09-01',
    label = 'Sep Tuition (Zachary)',
    installment_number = 1,
    updated_at = now()
from public.tuition_enrollment_assignments tea
join public.families f on f.id = tea.family_id
join public.organizations o on o.id = f.organization_id
where tc.assignment_id = tea.id
  and o.slug = 'rooted-meadows'
  and f.name = 'Ritchie Family'
  and tc.charge_type = 'tuition'
  and tc.due_date = '2026-08-01'
  and tc.label = 'Aug Tuition (Zachary)'
  and tc.status = 'paid';

-- Francesca: paid Sep → installment 1 (already correct month)
update public.tuition_charges tc
set installment_number = 1,
    updated_at = now()
from public.tuition_enrollment_assignments tea
join public.families f on f.id = tea.family_id
join public.organizations o on o.id = f.organization_id
where tc.assignment_id = tea.id
  and o.slug = 'rooted-meadows'
  and f.name = 'Ritchie Family'
  and tc.charge_type = 'tuition'
  and tc.due_date = '2026-09-01'
  and tc.label = 'Sep Tuition (Francesca)'
  and tc.status = 'paid';

-- Void unpaid August (Francesca) and duplicate September (Zachary overdue)
update public.tuition_charges tc
set status = 'void',
    updated_at = now()
from public.tuition_enrollment_assignments tea
join public.families f on f.id = tea.family_id
join public.organizations o on o.id = f.organization_id
where tc.assignment_id = tea.id
  and o.slug = 'rooted-meadows'
  and f.name = 'Ritchie Family'
  and tc.charge_type = 'tuition'
  and (
    (tc.due_date = '2026-08-01' and tc.status in ('scheduled', 'sent', 'overdue'))
    or (tc.due_date = '2026-09-01' and tc.label = 'Sep Tuition (Zachary)' and tc.status in ('scheduled', 'sent', 'overdue'))
  );

update public.tuition_charges tc
set status = 'waived',
    updated_at = now()
from public.tuition_enrollment_assignments tea
join public.families f on f.id = tea.family_id
join public.organizations o on o.id = f.organization_id
where tc.assignment_id = tea.id
  and o.slug = 'rooted-meadows'
  and f.name = 'Ritchie Family'
  and tc.charge_type = 'late_fee'
  and tc.due_date in ('2026-08-15', '2026-09-10')
  and tc.status in ('scheduled', 'sent', 'overdue');

-- ── Verify ─────────────────────────────────────────────────────────────────

select
  f.name,
  tea.effective_start,
  tc.due_date,
  tc.label,
  tc.status,
  tc.amount_cents,
  tc.installment_number
from public.families f
join public.organizations o on o.id = f.organization_id
join public.tuition_enrollment_assignments tea on tea.family_id = f.id
left join public.tuition_charges tc on tc.assignment_id = tea.id and tc.status != 'void'
where o.slug = 'rooted-meadows'
  and f.name in ('Evensen Family', 'Ritchie Family')
order by f.name, tc.due_date nulls first, tc.label;
