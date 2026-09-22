-- Promoted to supabase/migrations/20261019_add_friday_branch_class_price_and_flyer.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Friday Branch class price and optional PDF flyer attachment.
-- Run after: 20261018_add_committee_message_attachments.sql

alter table public.friday_branch_classes
  add column if not exists price_cents integer,
  add column if not exists flyer_storage_path text,
  add column if not exists flyer_file_name text,
  add column if not exists flyer_file_size_bytes bigint;

alter table public.friday_branch_classes
  drop constraint if exists friday_branch_classes_price_cents_nonneg;

alter table public.friday_branch_classes
  add constraint friday_branch_classes_price_cents_nonneg
  check (price_cents is null or price_cents >= 0);

create or replace function public.friday_branch_class_flyer_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create or replace function public.friday_branch_class_flyer_storage_class_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[3], '')::uuid;
$$;

create or replace function public.user_can_read_friday_branch_class_flyer(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.friday_branch_classes c
    where c.id = p_class_id
      and c.family_visible = true
      and public.user_has_enrolled_parent_access(c.organization_id)
  );
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'friday-branch-class-flyers',
  'friday-branch-class-flyers',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Platform admins manage friday-branch-class-flyers storage"
  on storage.objects;
create policy "Platform admins manage friday-branch-class-flyers storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'friday-branch-class-flyers'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'friday-branch-class-flyers'
    and public.is_platform_admin()
  );

drop policy if exists "Org admins manage friday-branch-class-flyers storage"
  on storage.objects;
create policy "Org admins manage friday-branch-class-flyers storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'friday-branch-class-flyers'
    and public.user_is_org_admin(public.friday_branch_class_flyer_storage_org_id(name))
  )
  with check (
    bucket_id = 'friday-branch-class-flyers'
    and (storage.foldername(name))[2] = 'classes'
    and public.user_is_org_admin(public.friday_branch_class_flyer_storage_org_id(name))
  );

drop policy if exists "Staff read friday-branch-class-flyers storage"
  on storage.objects;
create policy "Staff read friday-branch-class-flyers storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'friday-branch-class-flyers'
    and public.user_is_staff_org_member(public.friday_branch_class_flyer_storage_org_id(name))
  );

drop policy if exists "Enrolled guardians read friday-branch-class-flyers storage"
  on storage.objects;
create policy "Enrolled guardians read friday-branch-class-flyers storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'friday-branch-class-flyers'
    and public.user_can_read_friday_branch_class_flyer(
      public.friday_branch_class_flyer_storage_class_id(name)
    )
  );

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
  v_class_id uuid;
  v_block_index int := 0;
  v_slot_index int;
  v_class_index int;
  v_capacity int;
  v_price_cents int;
  v_block_ids uuid[] := '{}';
  v_slot_ids uuid[] := '{}';
  v_class_ids uuid[] := '{}';
begin
  if p_blocks is null or jsonb_typeof(p_blocks) <> 'array' then
    raise exception 'invalid_blocks_payload'
      using errcode = 'P0001';
  end if;

  for v_block in select value from jsonb_array_elements(p_blocks)
  loop
    v_block_id := coalesce((v_block->>'id')::uuid, gen_random_uuid());
    v_block_ids := array_append(v_block_ids, v_block_id);

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
    )
    on conflict (id) do update set
      organization_id = excluded.organization_id,
      label = excluded.label,
      start_date = excluded.start_date,
      end_date = excluded.end_date,
      accent = excluded.accent,
      description = excluded.description,
      status = excluded.status,
      sort_order = excluded.sort_order
    where friday_branch_blocks.organization_id = p_organization_id;

    v_slot_index := 0;
    for v_slot in
      select value
      from jsonb_array_elements(coalesce(v_block->'slots', '[]'::jsonb))
    loop
      v_slot_id := coalesce((v_slot->>'id')::uuid, gen_random_uuid());
      v_slot_ids := array_append(v_slot_ids, v_slot_id);

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
      )
      on conflict (id) do update set
        block_id = excluded.block_id,
        organization_id = excluded.organization_id,
        time = excluded.time,
        sort_order = excluded.sort_order
      where friday_branch_time_slots.organization_id = p_organization_id;

      v_class_index := 0;
      for v_class in
        select value
        from jsonb_array_elements(coalesce(v_slot->'classes', '[]'::jsonb))
      loop
        v_capacity := null;
        if v_class ? 'capacity' and v_class->>'capacity' is not null and v_class->>'capacity' <> '' then
          v_capacity := (v_class->>'capacity')::int;
        end if;

        v_price_cents := null;
        if v_class ? 'price_cents' and v_class->>'price_cents' is not null and v_class->>'price_cents' <> '' then
          v_price_cents := (v_class->>'price_cents')::int;
        end if;

        v_class_id := coalesce((v_class->>'id')::uuid, gen_random_uuid());
        v_class_ids := array_append(v_class_ids, v_class_id);

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
          price_cents,
          flyer_storage_path,
          flyer_file_name,
          flyer_file_size_bytes,
          sort_order
        ) values (
          v_class_id,
          v_slot_id,
          p_organization_id,
          coalesce(v_class->>'name', ''),
          coalesce(v_class->>'location', ''),
          coalesce(v_class->>'age_group', ''),
          coalesce(v_class->>'teacher', ''),
          coalesce((v_class->>'family_visible')::boolean, true),
          v_capacity,
          v_price_cents,
          nullif(v_class->>'flyer_storage_path', ''),
          nullif(v_class->>'flyer_file_name', ''),
          case
            when v_class ? 'flyer_file_size_bytes'
              and v_class->>'flyer_file_size_bytes' is not null
              and v_class->>'flyer_file_size_bytes' <> ''
            then (v_class->>'flyer_file_size_bytes')::bigint
            else null
          end,
          coalesce((v_class->>'sort_order')::int, v_class_index)
        )
        on conflict (id) do update set
          time_slot_id = excluded.time_slot_id,
          organization_id = excluded.organization_id,
          name = excluded.name,
          location = excluded.location,
          age_group = excluded.age_group,
          teacher = excluded.teacher,
          family_visible = excluded.family_visible,
          capacity = excluded.capacity,
          price_cents = excluded.price_cents,
          flyer_storage_path = excluded.flyer_storage_path,
          flyer_file_name = excluded.flyer_file_name,
          flyer_file_size_bytes = excluded.flyer_file_size_bytes,
          sort_order = excluded.sort_order
        where friday_branch_classes.organization_id = p_organization_id;

        v_class_index := v_class_index + 1;
      end loop;

      v_slot_index := v_slot_index + 1;
    end loop;

    v_block_index := v_block_index + 1;
  end loop;

  delete from public.friday_branch_classes
  where organization_id = p_organization_id
    and not (id = any (v_class_ids));

  delete from public.friday_branch_time_slots
  where organization_id = p_organization_id
    and not (id = any (v_slot_ids));

  delete from public.friday_branch_blocks
  where organization_id = p_organization_id
    and not (id = any (v_block_ids));

  update public.friday_branch_class_enrollments e
  set block_id = ts.block_id
  from public.friday_branch_classes c
  join public.friday_branch_time_slots ts on ts.id = c.time_slot_id
  where e.class_id = c.id
    and e.organization_id = p_organization_id
    and e.block_id is distinct from ts.block_id;
end;
$$;

revoke all on function public.save_friday_branch_schedule(uuid, jsonb)
  from public, authenticated;

grant execute on function public.save_friday_branch_schedule(uuid, jsonb)
  to service_role;
