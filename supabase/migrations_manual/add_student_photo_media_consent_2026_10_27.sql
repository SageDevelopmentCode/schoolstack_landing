-- Promoted to supabase/migrations/20261135_add_student_photo_media_consent.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.students
  add column if not exists photo_media_consent text
    check (photo_media_consent in ('full', 'limited', 'none'));

alter table public.students
  add column if not exists photo_media_consent_updated_at timestamptz;

comment on column public.students.photo_media_consent is
  'Parent/guardian photo and video use consent: full, limited, or none.';
