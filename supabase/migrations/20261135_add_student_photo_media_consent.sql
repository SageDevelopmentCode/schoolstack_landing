-- Student photo/media consent for parent portal and enrollment sync.
-- Run after: 20261134_restrict_post_submit_internal_files_guardian_access.sql

alter table public.students
  add column if not exists photo_media_consent text
    check (photo_media_consent in ('full', 'limited', 'none'));

alter table public.students
  add column if not exists photo_media_consent_updated_at timestamptz;

comment on column public.students.photo_media_consent is
  'Parent/guardian photo and video use consent: full, limited, or none.';
