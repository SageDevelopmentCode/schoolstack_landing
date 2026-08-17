-- Add content_revision to document_templates for enrollment agreement re-sign tracking.
-- Run after: 20260820_add_observation_slots.sql

alter table public.document_templates
  add column if not exists content_revision integer not null default 1;

comment on column public.document_templates.content_revision is
  'Incremented when inline agreement section bodies change; stored on checklist item responses when parents complete signing.';
