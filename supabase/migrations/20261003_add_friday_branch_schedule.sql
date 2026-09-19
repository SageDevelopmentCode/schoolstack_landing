-- Friday Branch program schedule (blocks, time slots, classes) per organization.
-- Run after: 20261002_add_family_incomplete_admissions_reminders.sql

create table if not exists public.friday_branch_blocks (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  label            text not null default '',
  start_date       date,
  end_date         date,
  accent           text not null default 'sky'
                     check (accent in ('sky', 'berry', 'sage', 'sun')),
  description      text not null default '',
  status           text not null default 'draft'
                     check (status in ('current', 'upcoming', 'draft')),
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (
    start_date is null
    or end_date is null
    or end_date >= start_date
  )
);

create index if not exists friday_branch_blocks_organization_id_idx
  on public.friday_branch_blocks (organization_id);

create index if not exists friday_branch_blocks_organization_id_sort_order_idx
  on public.friday_branch_blocks (organization_id, sort_order);

drop trigger if exists on_friday_branch_blocks_updated on public.friday_branch_blocks;
create trigger on_friday_branch_blocks_updated
  before update on public.friday_branch_blocks
  for each row execute procedure public.handle_updated_at();

create table if not exists public.friday_branch_time_slots (
  id               uuid primary key default gen_random_uuid(),
  block_id         uuid not null references public.friday_branch_blocks(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  time             text not null default '',
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists friday_branch_time_slots_block_id_idx
  on public.friday_branch_time_slots (block_id);

create index if not exists friday_branch_time_slots_organization_id_idx
  on public.friday_branch_time_slots (organization_id);

create index if not exists friday_branch_time_slots_block_id_sort_order_idx
  on public.friday_branch_time_slots (block_id, sort_order);

drop trigger if exists on_friday_branch_time_slots_updated on public.friday_branch_time_slots;
create trigger on_friday_branch_time_slots_updated
  before update on public.friday_branch_time_slots
  for each row execute procedure public.handle_updated_at();

create table if not exists public.friday_branch_classes (
  id               uuid primary key default gen_random_uuid(),
  time_slot_id     uuid not null references public.friday_branch_time_slots(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  name             text not null default '',
  location         text not null default '',
  age_group        text not null default '',
  teacher          text not null default '',
  family_visible   boolean not null default true,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists friday_branch_classes_time_slot_id_idx
  on public.friday_branch_classes (time_slot_id);

create index if not exists friday_branch_classes_organization_id_idx
  on public.friday_branch_classes (organization_id);

create index if not exists friday_branch_classes_time_slot_id_sort_order_idx
  on public.friday_branch_classes (time_slot_id, sort_order);

drop trigger if exists on_friday_branch_classes_updated on public.friday_branch_classes;
create trigger on_friday_branch_classes_updated
  before update on public.friday_branch_classes
  for each row execute procedure public.handle_updated_at();

alter table public.friday_branch_blocks enable row level security;
alter table public.friday_branch_time_slots enable row level security;
alter table public.friday_branch_classes enable row level security;

drop policy if exists "Platform admins manage friday_branch_blocks"
  on public.friday_branch_blocks;
create policy "Platform admins manage friday_branch_blocks"
  on public.friday_branch_blocks for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage friday_branch_blocks"
  on public.friday_branch_blocks;
create policy "Org admins manage friday_branch_blocks"
  on public.friday_branch_blocks for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

drop policy if exists "Staff read friday_branch_blocks"
  on public.friday_branch_blocks;
create policy "Staff read friday_branch_blocks"
  on public.friday_branch_blocks for select to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Platform admins manage friday_branch_time_slots"
  on public.friday_branch_time_slots;
create policy "Platform admins manage friday_branch_time_slots"
  on public.friday_branch_time_slots for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage friday_branch_time_slots"
  on public.friday_branch_time_slots;
create policy "Org admins manage friday_branch_time_slots"
  on public.friday_branch_time_slots for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

drop policy if exists "Staff read friday_branch_time_slots"
  on public.friday_branch_time_slots;
create policy "Staff read friday_branch_time_slots"
  on public.friday_branch_time_slots for select to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Platform admins manage friday_branch_classes"
  on public.friday_branch_classes;
create policy "Platform admins manage friday_branch_classes"
  on public.friday_branch_classes for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage friday_branch_classes"
  on public.friday_branch_classes;
create policy "Org admins manage friday_branch_classes"
  on public.friday_branch_classes for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

drop policy if exists "Staff read friday_branch_classes"
  on public.friday_branch_classes;
create policy "Staff read friday_branch_classes"
  on public.friday_branch_classes for select to authenticated
  using (public.user_is_staff_org_member(organization_id));

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
        insert into public.friday_branch_classes (
          id,
          time_slot_id,
          organization_id,
          name,
          location,
          age_group,
          teacher,
          family_visible,
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
