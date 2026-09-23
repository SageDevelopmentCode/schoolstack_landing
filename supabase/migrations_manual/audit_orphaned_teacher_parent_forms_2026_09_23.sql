-- Audit active teacher/parent forms that have no response rows.
-- Paste into Supabase SQL Editor to find forms stuck "sent" without parent-visible responses.
-- Run after: add_teacher_parent_forms_2026_09_28.sql

select
  f.id as form_id,
  f.organization_id,
  f.title,
  f.status,
  f.total_families,
  f.published_at,
  count(r.id) as response_count
from public.teacher_parent_forms f
left join public.teacher_parent_form_responses r
  on r.form_id = f.id
where f.status = 'active'
  and f.total_families > 0
group by f.id, f.organization_id, f.title, f.status, f.total_families, f.published_at
having count(r.id) = 0
order by f.published_at desc nulls last;
