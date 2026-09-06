-- Promoted to supabase/migrations/20260853_add_message_thread_program_id.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-09-03

alter table public.message_threads
  add column if not exists program_id uuid references public.programs(id) on delete set null;

alter table public.message_threads
  drop constraint if exists message_threads_organization_id_participant_signature_key;

create unique index if not exists message_threads_org_signature_main_uidx
  on public.message_threads (organization_id, participant_signature)
  where program_id is null;

create unique index if not exists message_threads_org_signature_program_uidx
  on public.message_threads (organization_id, participant_signature, program_id)
  where program_id is not null;

create index if not exists message_threads_org_program_last_message_idx
  on public.message_threads (organization_id, program_id, last_message_at desc nulls last);
