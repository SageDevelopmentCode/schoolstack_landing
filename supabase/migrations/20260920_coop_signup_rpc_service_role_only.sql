-- Restrict co-op signup RPCs to service_role only.
-- Run after: 20260919_fix_coop_teaching_schedule_rpc_role_branches.sql
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
