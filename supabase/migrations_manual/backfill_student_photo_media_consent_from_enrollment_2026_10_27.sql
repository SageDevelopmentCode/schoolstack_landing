-- One-off backfill: copy completed enrollment media-release consent onto students.
-- Run manually in Supabase SQL Editor after add_student_photo_media_consent is applied.
-- Idempotent: only updates rows where photo_media_consent is null.

update public.students s
set
  photo_media_consent = mapped.consent,
  photo_media_consent_updated_at = coalesce(mapped.completed_at, now())
from (
  select distinct on (a.student_id)
    a.student_id,
    eci.completed_at,
    case trim(both from eci.responses->>'consentValue')
      when 'FULL' then 'full'
      when 'full_use' then 'full'
      when 'LIMITED' then 'limited'
      when 'no_face' then 'limited'
      when 'NO' then 'none'
      else null
    end as consent
  from public.enrollment_checklist_items eci
  inner join public.enrollment_checklists ec on ec.id = eci.checklist_id
  inner join public.applications a on a.id = ec.application_id
  where eci.status = 'completed'
    and a.student_id is not null
    and eci.responses ? 'consentValue'
    and trim(both from eci.responses->>'consentValue') <> ''
  order by a.student_id, eci.completed_at desc nulls last
) mapped
where s.id = mapped.student_id
  and s.photo_media_consent is null
  and mapped.consent is not null;
