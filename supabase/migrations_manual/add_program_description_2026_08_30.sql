-- Promoted to supabase/migrations/20260836_add_program_description.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- 2026-08-30: Optional internal description for programs.

alter table public.programs
  add column if not exists description text;
