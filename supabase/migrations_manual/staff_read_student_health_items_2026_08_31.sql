-- Promoted to supabase/migrations/20260838_staff_read_student_health_items.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Purpose: 2026-08-31 — let teachers read health items for roster flags and health tab.

drop policy if exists "Staff can read student_health_items" on public.student_health_items;

create policy "Staff can read student_health_items"
  on public.student_health_items for select to authenticated
  using (public.user_is_staff_org_member(organization_id));
