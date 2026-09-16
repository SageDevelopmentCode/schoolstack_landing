-- Promoted to supabase/migrations/20260929_fix_teacher_parent_form_rls.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
--
-- Tighten teacher parent form RLS: parents must not read other families' responses.

-- Responses: drop org-member read (parents retain guardian-scoped read).
drop policy if exists "Org members read teacher_parent_form_responses"
  on public.teacher_parent_form_responses;

-- Forms: staff read + guardian read only for forms assigned to their family.
drop policy if exists "Org members read teacher_parent_forms"
  on public.teacher_parent_forms;

create policy "Staff read teacher_parent_forms"
  on public.teacher_parent_forms for select to authenticated
  using (public.user_is_staff_org_member(organization_id));

create policy "Guardians read teacher_parent_forms for own family"
  on public.teacher_parent_forms for select to authenticated
  using (
    exists (
      select 1
      from public.teacher_parent_form_responses r
      where r.form_id = teacher_parent_forms.id
        and public.user_is_guardian_for_family(r.family_id)
    )
  );
