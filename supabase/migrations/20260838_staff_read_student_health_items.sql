-- Staff org members can read student health items (teacher portal roster + health tab).
-- Run after: 20260837_add_student_health_items.sql

drop policy if exists "Staff can read student_health_items" on public.student_health_items;

create policy "Staff can read student_health_items"
  on public.student_health_items for select to authenticated
  using (public.user_is_staff_org_member(organization_id));
