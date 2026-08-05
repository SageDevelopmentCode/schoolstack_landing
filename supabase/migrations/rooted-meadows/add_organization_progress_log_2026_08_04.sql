-- Organization progress log: August 4, 2026 — Phase 03 Tuition & billing (Rooted Meadows)
-- Run after: add_product_organization_progress_log.sql (or add_product_timeline_bootstrap.sql)

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
  '2026-08-04'::date,
  '03',
  'Tuition & billing',
  'Tuition admin redesign, smoother portals, and clearer billing next steps',
  $summary$We kept pushing tuition and billing forward while making the whole portal feel faster and easier to preview. Your tuition setup screens are now organized into clear tabs — rates, payment options, fees, late fees, and adjustments — with smoother modals and animations. Families who still need to pick a payment schedule now see a clear warning banner, badges, and a highlighted plan selector so nothing gets missed. We also added loading feedback when moving between pages, a portal switcher so dual-access accounts can jump between school admin and family views, and read-only preview links for billing, committees, and enrollment that match what families see live. August tuition due dates and late-fee timing are configured for the school year.$summary$,
  $highlights$[
    "Tuition rate catalog tabs — Tuition rates, Payment options, and Fees in one organized view",
    "Tuition rules tabs — Late fees and Adjustments separated for easier setup",
    "Smoother admin modals — consistent animated dialogs across tuition assignment, adjustments, and billing splits",
    "Payment schedule preview — clearer modal when reviewing installment plans",
    "Schedule selection warnings — families see a prominent banner when a payment plan still needs to be chosen",
    "Schedule needed badges — visible on billing summary and per-child tabs when action is required",
    "Navigation loading overlay — feedback when moving between apply, enrollment, and parent portal pages",
    "Portal switcher — jump between school admin and family views from the profile menu",
    "School admin preview — dual-access owners can preview admin and family portals side by side",
    "Family preview parity — billing, committees, children, and enrollment previews match live parent UI",
    "Submissions panel preview links — separate Family and Admin preview buttons per application",
    "August tuition dates configured — due Aug 10 with late fee Aug 15; monthly schedule from September onward"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
