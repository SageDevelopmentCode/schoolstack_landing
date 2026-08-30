-- 2026-08-29: Clear stale amendment pending state for Amelia Sisco Thompson enrollment agreement.
-- Instance 616f511c-dbe5-4560-ad28-701199fe4d63 already re-signed std-2 but pendingResignSectionIds
-- was not cleared by the prior server bug. After deploy, she can tap Continue on the final section
-- to be routed to std-1 and finish signing normally.
--
-- Run in Supabase SQL Editor (manual paste only).

update enrollment_checklist_items
set
  responses = responses - 'pendingResignSectionIds' - 'amendmentNotice',
  updated_at = now()
where id = '616f511c-dbe5-4560-ad28-701199fe4d63'
  and status = 'in_progress'
  and responses ? 'pendingResignSectionIds';
