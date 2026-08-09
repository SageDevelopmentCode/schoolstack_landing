-- Rooted Meadows build log: August 8, 2026 — Teacher portal + afternoon billing
-- Run in Supabase SQL Editor on remote. Safe to re-run (idempotent).

insert into public.organization_progress_log (
  organization_id,
  entry_date,
  phase_number,
  phase_title,
  title,
  summary,
  highlights
)
select
  o.id,
  '2026-08-08'::date,
  '05',
  'Teacher portal',
  'Student roster, teacher assignments, and tuition payment receipts',
  $summary$We connected your enrolled students to the teacher portal. School admins now have a searchable Students page with a detail panel for each child — family contacts, programs, and enrollment info in one place. You can assign a primary teacher from the student list or from the student profile. On the other side, each guide's My Students page shows only the children assigned to them, with a student profile panel for day-to-day reference. The admin dashboard also gained quick links to copy or open your apply form and other key admin pages, plus clearer in-portal notifications when applications, enrollments, or committees need attention.

Later that afternoon we pushed tuition billing forward. Families can now apply a tax credit, bonus, or lump sum toward tuition — with a live preview of how the extra amount pays ahead and recalculates remaining installments. After each payment, parents get an email receipt and can open a detailed receipt from their payment history, including per-child line items and lump-sum breakdowns. School admins can record manual payments (checks, cash, or transfers) from the tuition families panel, and checkout sessions now show clearer per-student charge details for single and combined payments.$summary$,
  $highlights$[
    "Enrolled students page — searchable roster with student, program, parent, and enrollment date",
    "Student detail panel — overview, family and guardians, programs, and links back to admissions",
    "Assign primary teacher — pick a guide from the students list or student profile",
    "Admin dashboard quick links — copy or open your apply link, Stripe dashboard, and key admin pages",
    "Teacher My Students — each guide sees only students assigned to them",
    "Teacher student profile — grade, family contacts, programs, and enrollment details",
    "Admin activity notifications — alerts for new applications, enrollments, payments, and committee requests",
    "Tax credit and lump-sum payments — families pay ahead and future installments recalculate automatically",
    "Pay-ahead schedule preview — see how extra payments reduce remaining installments before checkout",
    "Payment receipt panel — parents open itemized receipts from billing payment history",
    "Payment receipt emails — families receive a receipt after Stripe checkout, autopay, or manual payments",
    "Manual payment recording — admins log checks, cash, or bank transfers against a charge from tuition families",
    "Checkout line items by student — clearer Stripe summaries for single and combined tuition payments",
    "Payment history improvements — tuition and enrollment payments show method labels and open receipt details"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
