-- Promoted to supabase/migrations/20261004_add_friday_branch_class_enrollments.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-09-17 — Friday Branch class capacity + enrollments

alter table public.friday_branch_classes
  add column if not exists capacity integer
  check (capacity is null or capacity > 0);

create table if not exists public.friday_branch_class_enrollments (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  class_id         uuid not null references public.friday_branch_classes(id) on delete cascade,
  block_id         uuid not null references public.friday_branch_blocks(id) on delete cascade,
  student_id       uuid not null references public.students(id) on delete cascade,
  family_id        uuid not null references public.families(id) on delete cascade,
  status           text not null default 'confirmed'
                     check (status in ('confirmed', 'waitlisted', 'withdrawn')),
  source           text not null default 'parent'
                     check (source in ('parent', 'admin')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (class_id, student_id)
);

create index if not exists friday_branch_class_enrollments_class_id_idx
  on public.friday_branch_class_enrollments (class_id);

create index if not exists friday_branch_class_enrollments_org_block_idx
  on public.friday_branch_class_enrollments (organization_id, block_id);

create index if not exists friday_branch_class_enrollments_family_id_idx
  on public.friday_branch_class_enrollments (family_id);

drop trigger if exists on_friday_branch_class_enrollments_updated
  on public.friday_branch_class_enrollments;
create trigger on_friday_branch_class_enrollments_updated
  before update on public.friday_branch_class_enrollments
  for each row execute procedure public.handle_updated_at();

alter table public.friday_branch_class_enrollments enable row level security;

drop policy if exists "Platform admins manage friday_branch_class_enrollments"
  on public.friday_branch_class_enrollments;
create policy "Platform admins manage friday_branch_class_enrollments"
  on public.friday_branch_class_enrollments for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage friday_branch_class_enrollments"
  on public.friday_branch_class_enrollments;
create policy "Org admins manage friday_branch_class_enrollments"
  on public.friday_branch_class_enrollments for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

drop policy if exists "Staff read friday_branch_class_enrollments"
  on public.friday_branch_class_enrollments;
create policy "Staff read friday_branch_class_enrollments"
  on public.friday_branch_class_enrollments for select to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Guardians read friday_branch_class_enrollments for own family"
  on public.friday_branch_class_enrollments;
create policy "Guardians read friday_branch_class_enrollments for own family"
  on public.friday_branch_class_enrollments for select to authenticated
  using (public.user_is_guardian_for_family(family_id));

drop policy if exists "Guardians manage friday_branch_class_enrollments for own family"
  on public.friday_branch_class_enrollments;
create policy "Guardians manage friday_branch_class_enrollments for own family"
  on public.friday_branch_class_enrollments for all to authenticated
  using (public.user_is_guardian_for_family(family_id))
  with check (public.user_is_guardian_for_family(family_id));

create or replace function public.save_friday_branch_schedule(
  p_organization_id uuid,
  p_blocks jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_block jsonb;
  v_slot jsonb;
  v_class jsonb;
  v_block_id uuid;
  v_slot_id uuid;
  v_block_index int := 0;
  v_slot_index int;
  v_class_index int;
  v_capacity int;
begin
  if p_blocks is null or jsonb_typeof(p_blocks) <> 'array' then
    raise exception 'invalid_blocks_payload'
      using errcode = 'P0001';
  end if;

  delete from public.friday_branch_blocks
  where organization_id = p_organization_id;

  for v_block in select value from jsonb_array_elements(p_blocks)
  loop
    v_block_id := coalesce((v_block->>'id')::uuid, gen_random_uuid());

    insert into public.friday_branch_blocks (
      id,
      organization_id,
      label,
      start_date,
      end_date,
      accent,
      description,
      status,
      sort_order
    ) values (
      v_block_id,
      p_organization_id,
      coalesce(v_block->>'label', ''),
      nullif(v_block->>'start_date', '')::date,
      nullif(v_block->>'end_date', '')::date,
      coalesce(v_block->>'accent', 'sky'),
      coalesce(v_block->>'description', ''),
      coalesce(v_block->>'status', 'draft'),
      coalesce((v_block->>'sort_order')::int, v_block_index)
    );

    v_slot_index := 0;
    for v_slot in
      select value
      from jsonb_array_elements(coalesce(v_block->'slots', '[]'::jsonb))
    loop
      v_slot_id := coalesce((v_slot->>'id')::uuid, gen_random_uuid());

      insert into public.friday_branch_time_slots (
        id,
        block_id,
        organization_id,
        time,
        sort_order
      ) values (
        v_slot_id,
        v_block_id,
        p_organization_id,
        coalesce(v_slot->>'time', ''),
        coalesce((v_slot->>'sort_order')::int, v_slot_index)
      );

      v_class_index := 0;
      for v_class in
        select value
        from jsonb_array_elements(coalesce(v_slot->'classes', '[]'::jsonb))
      loop
        v_capacity := null;
        if v_class ? 'capacity' and v_class->>'capacity' is not null and v_class->>'capacity' <> '' then
          v_capacity := (v_class->>'capacity')::int;
        end if;

        insert into public.friday_branch_classes (
          id,
          time_slot_id,
          organization_id,
          name,
          location,
          age_group,
          teacher,
          family_visible,
          capacity,
          sort_order
        ) values (
          coalesce((v_class->>'id')::uuid, gen_random_uuid()),
          v_slot_id,
          p_organization_id,
          coalesce(v_class->>'name', ''),
          coalesce(v_class->>'location', ''),
          coalesce(v_class->>'age_group', ''),
          coalesce(v_class->>'teacher', ''),
          coalesce((v_class->>'family_visible')::boolean, true),
          v_capacity,
          coalesce((v_class->>'sort_order')::int, v_class_index)
        );

        v_class_index := v_class_index + 1;
      end loop;

      v_slot_index := v_slot_index + 1;
    end loop;

    v_block_index := v_block_index + 1;
  end loop;
end;
$$;

revoke all on function public.save_friday_branch_schedule(uuid, jsonb)
  from public, authenticated;

grant execute on function public.save_friday_branch_schedule(uuid, jsonb)
  to service_role;
