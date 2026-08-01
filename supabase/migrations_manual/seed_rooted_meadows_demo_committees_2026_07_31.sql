-- Blank-slate committees for rooted-meadows-demo.
-- Run manually in Supabase SQL Editor (not applied by supabase db reset).
-- Date: 2026-07-31 (revised)
--
-- Creates 6 Rooted Meadows committee workspaces from org templates:
--   Festival, Sunshine & Service, Farm Connection, Fundraising,
--   Marketing & Outreach, School Campus
--
-- Each workspace gets default duty roles only (no members, tasks, events,
-- messages, or resources). Part 0 wipes any prior demo data first.
--
-- After run, open:
--   /school/rooted-meadows-demo/admin/committees

begin;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 0 — Reset existing demo committee data
-- ═══════════════════════════════════════════════════════════════════════════════

do $$
declare
  v_org_id uuid;
  v_deleted integer;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows-demo';

  if v_org_id is null then
    raise exception 'Organization rooted-meadows-demo not found.';
  end if;

  delete from public.committees c
  where c.organization_id = v_org_id;

  get diagnostics v_deleted = row_count;
  raise notice 'Deleted % committee workspace(s) for rooted-meadows-demo.', v_deleted;

  delete from public.committee_templates t
  where t.organization_id = v_org_id
    and t.slug = 'family-communication-coordinators';

  raise notice 'Removed family-communication-coordinators template if present.';
end $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1 — Upsert 6 org-specific committee templates
-- ═══════════════════════════════════════════════════════════════════════════════

do $$
declare
  v_org_id uuid;
  v_rec record;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows-demo';

  if v_org_id is null then
    raise exception 'Organization rooted-meadows-demo not found.';
  end if;

  for v_rec in
    select *
    from (values
      (
        'festival',
        'Festival Committee',
        'event',
        'Bring magic to our school traditions! This team plans seasonal festivals, coordinates logistics, and manages volunteer sign-up sheets.',
        '{"sections":["home","about","resources","calendar","tasks","messages","members"],"defaultTermLabel":"2025–2026 School Year","taskGroups":[{"id":"booths","label":"Booths & Activities"},{"id":"general","label":"Event Logistics"}],"defaultDutyRoles":[{"title":"Committee Lead","description":"Overall festival planning and event-day coordination."},{"title":"Booth Coordinator","description":"Assigns and supports booth leads."},{"title":"Event Logistics Lead","description":"Setup schedules and supply collection."}]}'
      ),
      (
        'sunshine-service',
        'Sunshine & Service Committee',
        'annual_volunteer',
        E'Spread warmth, gratitude, and care across our community.\n\n• Plan annual school-wide and class-specific service projects\n• Organize community-building events like our Thankful Dinner\n• Discover creative ways to support families and staff',
        '{"sections":["home","about","resources","calendar","tasks","messages","members"],"defaultTermLabel":"2025–2026 School Year","taskGroups":[{"id":"annual_fall","label":"Fall Service Project"},{"id":"annual_spring","label":"Spring Service Project"},{"id":"class_projects","label":"Class Projects"},{"id":"sunshine_support","label":"Sunshine Support"}],"defaultDutyRoles":[{"title":"Committee Lead","description":"Coordinates planning meetings and overall direction."},{"title":"Fall Service Project Lead","description":"Partner outreach and fall donation drive."},{"title":"Spring Service Project Lead","description":"Spring service day logistics."},{"title":"Sunshine Support Lead","description":"Meal trains, babysitting, and celebration coordination."},{"title":"Faculty Liaison","description":"School staff coordination and scheduling."}]}'
      ),
      (
        'farm-connection',
        'Farm Connection & Development Committee',
        'hybrid',
        E'Help drive our long-term vision connecting regenerative agriculture with education.\n\n• Bridge relationships between local farmers, our school, and community\n• Launch initiatives: community markets, educational forums, farm field trips, brochures',
        '{"sections":["home","about","resources","calendar","tasks","messages","members"],"defaultTermLabel":"2025–2026 School Year","taskGroups":[{"id":"initiatives","label":"Initiatives"},{"id":"annual_projects","label":"Annual Projects"},{"id":"general","label":"General"}],"defaultDutyRoles":[{"title":"Committee Lead","description":"Coordinates planning and long-term initiatives."},{"title":"Community Outreach Lead","description":"Bridge relationships with local farmers and partners."},{"title":"Faculty Liaison","description":"School staff coordination for field trips and forums."}]}'
      ),
      (
        'fundraising',
        'Fundraising Committee',
        'annual_volunteer',
        E'Help keep our school growing and accessible.\n\n• Reach out to local businesses and donors for sponsorships\n• Plan and execute annual fundraising events\n• Research grant opportunities and assist with grant writing',
        '{"sections":["home","about","resources","calendar","tasks","messages","members"],"defaultTermLabel":"2025–2026 School Year","taskGroups":[{"id":"sponsorships","label":"Sponsorships"},{"id":"events","label":"Fundraising Events"},{"id":"grants","label":"Grants"}],"defaultDutyRoles":[{"title":"Committee Lead","description":"Coordinates fundraising strategy and meetings."},{"title":"Sponsorship Lead","description":"Local business and donor outreach."},{"title":"Grants Research Lead","description":"Research grant opportunities and assist with writing."}]}'
      ),
      (
        'marketing-outreach',
        'Marketing & Outreach Committee',
        'annual_volunteer',
        E'Spread the word about Rooted Meadows and foster community engagement.\n\n• Create engaging social media content and promotional flyers\n• Represent our school at community booths and local events\n• Brainstorm grass-roots ideas to raise awareness about our mission',
        '{"sections":["home","about","resources","calendar","tasks","messages","members"],"defaultTermLabel":"2025–2026 School Year","taskGroups":[{"id":"social_media","label":"Social Media"},{"id":"events","label":"Community Events"},{"id":"general","label":"General"}],"defaultDutyRoles":[{"title":"Committee Lead","description":"Coordinates marketing strategy and content calendar."},{"title":"Social Media Lead","description":"Creates engaging social content and promotional materials."},{"title":"Community Events Lead","description":"Represents the school at booths and local events."}]}'
      ),
      (
        'school-campus',
        'School Campus Committee',
        'long_term_role',
        'Play a crucial role in our long-term vision by researching, exploring, and helping secure a permanent site for our future campus.',
        '{"sections":["home","about","resources","calendar","tasks","messages","members"],"defaultTermLabel":"2024–2028","taskGroups":[{"id":"general","label":"Campus Research"}],"defaultDutyRoles":[{"title":"Committee Lead","description":"Coordinates site research and board communication."},{"title":"Research Lead","description":"Explores potential sites and gathers feasibility data."},{"title":"Faculty Liaison","description":"Aligns campus vision with pedagogical needs."}]}'
      )
    ) as v(slug, name, type, description, config)
  loop
    update public.committee_templates t
    set
      name = v_rec.name,
      type = v_rec.type,
      description = v_rec.description,
      config = v_rec.config::jsonb,
      updated_at = now()
    where t.organization_id = v_org_id
      and t.slug = v_rec.slug;

    if not found then
      insert into public.committee_templates (
        organization_id, slug, name, type, description, config
      ) values (
        v_org_id,
        v_rec.slug,
        v_rec.name,
        v_rec.type,
        v_rec.description,
        v_rec.config::jsonb
      );
    end if;
  end loop;

  raise notice 'Upserted 6 committee templates for rooted-meadows-demo.';
end $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2 — Create 6 blank active committees (duty roles only)
-- ═══════════════════════════════════════════════════════════════════════════════

do $$
declare
  v_org_id uuid;
  v_template record;
  v_committee_id uuid;
  v_config jsonb;
  v_role jsonb;
  v_role_index integer;
  v_slugs text[] := array[
    'festival',
    'sunshine-service',
    'farm-connection',
    'fundraising',
    'marketing-outreach',
    'school-campus'
  ];
  v_slug text;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows-demo';

  if v_org_id is null then
    raise exception 'Organization rooted-meadows-demo not found.';
  end if;

  foreach v_slug in array v_slugs
  loop
    select t.id, t.name, t.type, t.description, t.config
    into v_template
    from public.committee_templates t
    where t.organization_id = v_org_id
      and t.slug = v_slug;

    if v_template.id is null then
      raise exception 'Template % not found after Part 1.', v_slug;
    end if;

    if exists (
      select 1
      from public.committees c
      where c.organization_id = v_org_id
        and c.template_id = v_template.id
    ) then
      raise notice 'Committee for template % already exists — skipping.', v_slug;
      continue;
    end if;

    v_config := coalesce(v_template.config, '{}'::jsonb);

    insert into public.committees (
      organization_id,
      template_id,
      name,
      description,
      status,
      term_label,
      about_html,
      config
    ) values (
      v_org_id,
      v_template.id,
      v_template.name,
      v_template.description,
      'active',
      coalesce(v_config->>'defaultTermLabel', ''),
      '',
      v_config || jsonb_build_object('type', v_template.type)
    )
    returning id into v_committee_id;

    v_role_index := 0;
    for v_role in
      select value
      from jsonb_array_elements(coalesce(v_config->'defaultDutyRoles', '[]'::jsonb))
    loop
      insert into public.committee_duty_roles (
        committee_id,
        title,
        description,
        sort_order
      ) values (
        v_committee_id,
        v_role->>'title',
        coalesce(v_role->>'description', ''),
        v_role_index
      );
      v_role_index := v_role_index + 1;
    end loop;

    raise notice 'Created blank committee: % (% duty roles).', v_template.name, v_role_index;
  end loop;
end $$;

commit;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION — expect 6 committees, 0 members/tasks/events/messages each
-- ═══════════════════════════════════════════════════════════════════════════════

select
  c.name,
  c.status,
  c.term_label,
  (select count(*) from public.committee_duty_roles dr where dr.committee_id = c.id) as duty_roles,
  (select count(*) from public.committee_members m where m.committee_id = c.id) as members,
  (select count(*) from public.committee_tasks t where t.committee_id = c.id) as tasks,
  (select count(*) from public.committee_events e where e.committee_id = c.id) as events,
  (select count(*) from public.committee_messages msg where msg.committee_id = c.id) as messages
from public.committees c
join public.organizations o on o.id = c.organization_id
where o.slug = 'rooted-meadows-demo'
order by c.name;
