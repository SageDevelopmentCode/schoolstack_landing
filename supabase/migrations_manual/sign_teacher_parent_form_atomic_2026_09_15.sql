-- Promoted to supabase/migrations/20260930_sign_teacher_parent_form_atomic.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
--
-- Atomically sign a teacher parent form response and increment signed_families.
-- Run after: 20260929_fix_teacher_parent_form_rls.sql

create or replace function public.sign_teacher_parent_form_response_atomic(
  p_organization_id uuid,
  p_form_id uuid,
  p_family_id uuid,
  p_responses jsonb,
  p_signed_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_response public.teacher_parent_form_responses;
begin
  update public.teacher_parent_form_responses
  set
    status = 'signed',
    signed_at = p_signed_at,
    responses = p_responses,
    updated_at = p_signed_at
  where organization_id = p_organization_id
    and form_id = p_form_id
    and family_id = p_family_id
    and status in ('pending', 'overdue')
  returning *
  into v_response;

  if not found then
    raise exception 'form_already_signed'
      using errcode = 'P0001';
  end if;

  update public.teacher_parent_forms
  set
    signed_families = signed_families + 1,
    updated_at = p_signed_at
  where organization_id = p_organization_id
    and id = p_form_id;

  return jsonb_build_object('response_id', v_response.id);
end;
$$;

revoke all on function public.sign_teacher_parent_form_response_atomic(
  uuid,
  uuid,
  uuid,
  jsonb,
  timestamptz
) from public, authenticated;

grant execute on function public.sign_teacher_parent_form_response_atomic(
  uuid,
  uuid,
  uuid,
  jsonb,
  timestamptz
) to service_role;
