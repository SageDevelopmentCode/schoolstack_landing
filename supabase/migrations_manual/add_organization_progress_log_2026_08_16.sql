-- Rooted Meadows build log: August 16, 2026 — Family notification emails + enrollment agreement updates
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
  '2026-08-16'::date,
  '01',
  'Admissions',
  'Family notification emails and enrollment agreement updates',
  $summary$Parents can now choose where family emails go, independently of the address they use to sign in. From Notification settings in the parent portal, a family can add up to three addresses — useful when someone logs in with a school or work email but wants applications, billing, and messages at a personal inbox. Those addresses now receive application confirmations, billing notices, message alerts, support confirmations, and a new Enrollment Confirmed email when a child's enrollment is finished.

We also made it possible to update enrollment agreement wording after families have signed, and ask them to review and re-sign only the changed sections. Parents see a banner on apply and parent home with a Review and re-sign link.$summary$,
  $highlights$[
    "Notification settings — add up to three family email addresses from the parent portal menu",
    "Separate from login — sign in with one email, receive school emails at another",
    "Family emails follow that list — applications, billing, messages, and support confirmations",
    "Enrollment Confirmed email — a welcome note when enrollment is complete, with a link to the parent portal",
    "Enrollment agreement updates — change contract wording and ask families to re-sign the updated sections",
    "Review and re-sign banner — a clear prompt on apply and parent home when a signature is needed again"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
