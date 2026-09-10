-- Promoted to supabase/migrations/20260920_coop_signup_rpc_service_role_only.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-09-10
-- Run after: fix_coop_teaching_schedule_rpc_role_branches_2026_09_10.sql
--            (or 20260919_fix_coop_teaching_schedule_rpc_role_branches.sql)
--
-- Parent-portal API routes already write via createAdminClient(); these
-- SECURITY DEFINER functions must not be callable directly by authenticated
-- PostgREST clients with arbitrary p_family_id.

revoke execute on function public.append_program_coop_supply_assigned_family(uuid, uuid, uuid, uuid)
  from public, authenticated;

revoke execute on function public.append_program_coop_teaching_schedule_parent(uuid, uuid, uuid, text, uuid, boolean)
  from public, authenticated;

revoke execute on function public.remove_program_coop_supply_assigned_family(uuid, uuid, uuid, uuid)
  from public, authenticated;

revoke execute on function public.remove_program_coop_teaching_schedule_parent(uuid, uuid, uuid, text, uuid)
  from public, authenticated;

grant execute on function public.append_program_coop_supply_assigned_family(uuid, uuid, uuid, uuid)
  to service_role;

grant execute on function public.append_program_coop_teaching_schedule_parent(uuid, uuid, uuid, text, uuid, boolean)
  to service_role;

grant execute on function public.remove_program_coop_supply_assigned_family(uuid, uuid, uuid, uuid)
  to service_role;

grant execute on function public.remove_program_coop_teaching_schedule_parent(uuid, uuid, uuid, text, uuid)
  to service_role;
