-- Sync rooted-meadows production enrollment checklist template → rooted-meadows-demo.
-- Copies document_templates and published template_items so demo matches prod (10 steps).
-- Read-only on production; safe to re-run (upserts by document name / item_key).
--
-- Run in Supabase SQL Editor BEFORE start_caleb_enrollment_checklist_demo_2026_07_28.sql
--
-- ═══════════════════════════════════════════════════════════════════════════════
-- PRE-FLIGHT — run separately to confirm current state
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- select o.slug, t.id as template_id, t.status, count(i.id) as item_count
-- from public.enrollment_checklist_templates t
-- join public.organizations o on o.id = t.organization_id
-- left join public.enrollment_checklist_template_items i on i.template_id = t.id
-- where o.slug in ('rooted-meadows', 'rooted-meadows-demo')
--   and t.status = 'published'
-- group by o.slug, t.id, t.status
-- order by o.slug;
--
-- Expected before: rooted-meadows = 10 items, rooted-meadows-demo = 3 items

begin;

do $$
declare
  v_prod_slug text := 'rooted-meadows';
  v_demo_slug text := 'rooted-meadows-demo';
  v_prod_org_id uuid;
  v_demo_org_id uuid;
  v_prod_template_id uuid;
  v_demo_template_id uuid;
  v_prod_doc record;
  v_prod_item record;
  v_demo_doc_id uuid;
  v_demo_fee_id uuid;
  v_updated_docs integer := 0;
  v_inserted_docs integer := 0;
  v_updated_items integer := 0;
  v_inserted_items integer := 0;
begin
  select id into v_prod_org_id
  from public.organizations
  where slug = v_prod_slug;

  select id into v_demo_org_id
  from public.organizations
  where slug = v_demo_slug;

  if v_prod_org_id is null then
    raise exception 'Source org "%" not found.', v_prod_slug;
  end if;

  if v_demo_org_id is null then
    raise exception 'Target org "%" not found.', v_demo_slug;
  end if;

  select t.id into v_prod_template_id
  from public.enrollment_checklist_templates t
  where t.organization_id = v_prod_org_id
    and t.enrollment_path = 'enrollment'
    and t.status = 'published'
  order by t.updated_at desc
  limit 1;

  select t.id into v_demo_template_id
  from public.enrollment_checklist_templates t
  where t.organization_id = v_demo_org_id
    and t.enrollment_path = 'enrollment'
    and t.status = 'published'
  order by t.updated_at desc
  limit 1;

  if v_prod_template_id is null then
    raise exception 'No published enrollment checklist on "%".', v_prod_slug;
  end if;

  if v_demo_template_id is null then
    raise exception 'No published enrollment checklist on "%".', v_demo_slug;
  end if;

  -- 1) Upsert document_templates by name
  for v_prod_doc in
    select d.id, d.name, d.kind, d.content, d.status
    from public.document_templates d
    where d.organization_id = v_prod_org_id
    order by d.name
  loop
    select d.id into v_demo_doc_id
    from public.document_templates d
    where d.organization_id = v_demo_org_id
      and d.name = v_prod_doc.name
    limit 1;

    if v_demo_doc_id is not null then
      update public.document_templates
      set kind = v_prod_doc.kind,
          content = v_prod_doc.content,
          status = v_prod_doc.status,
          updated_at = now()
      where id = v_demo_doc_id;

      v_updated_docs := v_updated_docs + 1;
    else
      insert into public.document_templates (
        organization_id,
        name,
        kind,
        content,
        status
      )
      values (
        v_demo_org_id,
        v_prod_doc.name,
        v_prod_doc.kind,
        v_prod_doc.content,
        v_prod_doc.status
      );

      v_inserted_docs := v_inserted_docs + 1;
    end if;
  end loop;

  -- 2) Align fee_definitions referenced by prod checklist items (by code)
  update public.fee_definitions demo_fd
  set label = prod_fd.label,
      amount_cents = prod_fd.amount_cents,
      currency = prod_fd.currency,
      active = prod_fd.active,
      updated_at = now()
  from public.fee_definitions prod_fd
  where prod_fd.organization_id = v_prod_org_id
    and demo_fd.organization_id = v_demo_org_id
    and demo_fd.code = prod_fd.code
    and exists (
      select 1
      from public.enrollment_checklist_template_items i
      where i.template_id = v_prod_template_id
        and i.fee_definition_id = prod_fd.id
    );

  -- 3) Upsert template_items by item_key
  for v_prod_item in
    select
      i.item_key,
      i.sort_order,
      i.label,
      i.type,
      i.required,
      i.document_template_id,
      i.fee_definition_id,
      i.form_schema,
      i.metadata
    from public.enrollment_checklist_template_items i
    where i.template_id = v_prod_template_id
    order by i.sort_order
  loop
    v_demo_doc_id := null;
    v_demo_fee_id := null;

    if v_prod_item.document_template_id is not null then
      select demo_d.id into v_demo_doc_id
      from public.document_templates prod_d
      join public.document_templates demo_d
        on demo_d.name = prod_d.name
       and demo_d.organization_id = v_demo_org_id
      where prod_d.id = v_prod_item.document_template_id
        and prod_d.organization_id = v_prod_org_id
      limit 1;

      if v_demo_doc_id is null then
        raise exception 'Demo document template missing for prod doc % (item_key %).',
          v_prod_item.document_template_id, v_prod_item.item_key;
      end if;
    end if;

    if v_prod_item.fee_definition_id is not null then
      select demo_f.id into v_demo_fee_id
      from public.fee_definitions prod_f
      join public.fee_definitions demo_f
        on demo_f.code = prod_f.code
       and demo_f.organization_id = v_demo_org_id
      where prod_f.id = v_prod_item.fee_definition_id
        and prod_f.organization_id = v_prod_org_id
      limit 1;

      if v_demo_fee_id is null then
        raise exception 'Demo fee_definition missing for prod fee % (item_key %).',
          v_prod_item.fee_definition_id, v_prod_item.item_key;
      end if;
    end if;

    update public.enrollment_checklist_template_items
    set sort_order = v_prod_item.sort_order,
        label = v_prod_item.label,
        type = v_prod_item.type,
        required = v_prod_item.required,
        document_template_id = v_demo_doc_id,
        fee_definition_id = v_demo_fee_id,
        form_schema = v_prod_item.form_schema,
        metadata = v_prod_item.metadata,
        updated_at = now()
    where template_id = v_demo_template_id
      and item_key = v_prod_item.item_key;

    if found then
      v_updated_items := v_updated_items + 1;
    else
      insert into public.enrollment_checklist_template_items (
        template_id,
        organization_id,
        item_key,
        sort_order,
        label,
        type,
        required,
        document_template_id,
        fee_definition_id,
        form_schema,
        metadata
      )
      values (
        v_demo_template_id,
        v_demo_org_id,
        v_prod_item.item_key,
        v_prod_item.sort_order,
        v_prod_item.label,
        v_prod_item.type,
        v_prod_item.required,
        v_demo_doc_id,
        v_demo_fee_id,
        v_prod_item.form_schema,
        v_prod_item.metadata
      );

      v_inserted_items := v_inserted_items + 1;
    end if;
  end loop;

  raise notice 'Document templates: % updated, % inserted.', v_updated_docs, v_inserted_docs;
  raise notice 'Template items: % updated, % inserted.', v_updated_items, v_inserted_items;
end $$;

commit;

-- ═══════════════════════════════════════════════════════════════════════════════
-- POST-FLIGHT — verify demo now matches prod (expect 10 items each)
-- ═══════════════════════════════════════════════════════════════════════════════

select o.slug, count(i.id) as item_count
from public.enrollment_checklist_template_items i
join public.enrollment_checklist_templates t on t.id = i.template_id
join public.organizations o on o.id = t.organization_id
where o.slug in ('rooted-meadows', 'rooted-meadows-demo')
  and t.status = 'published'
group by o.slug
order by o.slug;

select o.slug, i.sort_order, i.item_key, i.label, i.type
from public.enrollment_checklist_template_items i
join public.enrollment_checklist_templates t on t.id = i.template_id
join public.organizations o on o.id = t.organization_id
where o.slug = 'rooted-meadows-demo'
  and t.status = 'published'
order by i.sort_order;
