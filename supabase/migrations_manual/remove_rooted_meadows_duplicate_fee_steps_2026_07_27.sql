-- Remove duplicate Supply Fee + Activities Fee checklist steps from rooted-meadows.
-- The bundled Payment step (payment_e2190666, $650) already covers both fees.
-- Idempotent: safe to re-run after split steps are gone.
--
-- Target org: rooted-meadows production
-- Run in Supabase SQL Editor.

begin;

do $$
declare
  v_org_id uuid;
  v_template_id uuid;
  v_deleted_payments integer;
  v_deleted_instances integer;
  v_deleted_template_items integer;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows';

  if v_org_id is null then
    raise exception 'Organization rooted-meadows not found.';
  end if;

  select t.id into v_template_id
  from public.enrollment_checklist_templates t
  where t.organization_id = v_org_id
    and t.enrollment_path = 'enrollment'
    and t.status = 'published'
  order by t.updated_at desc
  limit 1;

  if v_template_id is null then
    raise exception 'No published enrollment checklist found for rooted-meadows.';
  end if;

  if not exists (
    select 1
    from public.enrollment_checklist_template_items ti
    where ti.template_id = v_template_id
      and ti.item_key in ('supply_fee', 'activities_fee')
  ) then
    raise notice 'Supply Fee and Activities Fee template steps already removed — skipping.';
    return;
  end if;

  -- 1. Remove ledger rows tied to duplicate checklist instances (admin-bypass only).
  with duplicate_items as (
    select eci.id
    from public.enrollment_checklist_items eci
    join public.enrollment_checklists ec on ec.id = eci.checklist_id
    where ec.organization_id = v_org_id
      and ec.template_id = v_template_id
      and eci.item_key in ('supply_fee', 'activities_fee')
  )
  delete from public.application_payments ap
  using duplicate_items di
  where ap.enrollment_checklist_item_id = di.id;

  get diagnostics v_deleted_payments = row_count;

  -- 2. Remove materialized checklist instances for the duplicate steps.
  with deleted as (
    delete from public.enrollment_checklist_items eci
    using public.enrollment_checklists ec
    where ec.id = eci.checklist_id
      and ec.organization_id = v_org_id
      and ec.template_id = v_template_id
      and eci.item_key in ('supply_fee', 'activities_fee')
    returning eci.id
  )
  select count(*) into v_deleted_instances from deleted;

  -- 3. Remove duplicate template steps.
  with deleted as (
    delete from public.enrollment_checklist_template_items ti
    where ti.template_id = v_template_id
      and ti.organization_id = v_org_id
      and ti.item_key in ('supply_fee', 'activities_fee')
    returning ti.id
  )
  select count(*) into v_deleted_template_items from deleted;

  -- 4. Recompute checklist status against remaining required items.
  update public.enrollment_checklists ec
  set
    status = case
      when not exists (
        select 1
        from public.enrollment_checklist_template_items ti
        where ti.template_id = ec.template_id
          and ti.required = true
          and not exists (
            select 1
            from public.enrollment_checklist_items eci
            where eci.checklist_id = ec.id
              and eci.template_item_id = ti.id
              and eci.status = 'completed'
          )
      ) then 'completed'
      else 'in_progress'
    end,
    updated_at = now()
  where ec.organization_id = v_org_id
    and ec.template_id = v_template_id;

  -- 5. Deactivate standalone fee definitions (tuition_fee_components unchanged).
  update public.fee_definitions fd
  set active = false
  where fd.organization_id = v_org_id
    and fd.code in ('supply_fee', 'activities_fee')
    and fd.active = true;

  raise notice
    'Removed duplicate fee steps: % ledger rows, % checklist instances, % template items.',
    v_deleted_payments,
    v_deleted_instances,
    v_deleted_template_items;
end $$;

commit;
