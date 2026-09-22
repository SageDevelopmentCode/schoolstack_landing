-- Promoted to supabase/migrations/20261017_add_committee_join_request_staff_member.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.committee_join_requests
  add column if not exists staff_member_id uuid
    references public.staff_members(id) on delete set null;

create index if not exists committee_join_requests_staff_member_id_idx
  on public.committee_join_requests (staff_member_id)
  where staff_member_id is not null;
