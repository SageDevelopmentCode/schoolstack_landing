-- Promoted to supabase/migrations/20260821_add_document_template_content_revision.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.document_templates
  add column if not exists content_revision integer not null default 1;

comment on column public.document_templates.content_revision is
  'Incremented when inline agreement section bodies change; stored on checklist item responses when parents complete signing.';
