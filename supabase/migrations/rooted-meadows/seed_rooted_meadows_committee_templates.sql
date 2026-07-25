-- Rooted Meadows demo: org-specific committee templates
-- Run manually in Supabase SQL Editor (not applied by supabase db reset).
-- Date: 2026-07-26
-- Purpose: Seed six committee definitions for rooted-meadows-demo.

do $$
declare
  v_org_id uuid;
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = 'rooted-meadows-demo';

  if v_org_id is null then
    raise notice 'Organization rooted-meadows-demo not found — skipping committee template seed.';
    return;
  end if;

  insert into public.committee_templates (
    organization_id, slug, name, type, description, config
  )
  select v_org_id, v.slug, v.name, v.type, v.description, v.config::jsonb
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
      'Spread warmth, gratitude, and care across our community.',
      '{"sections":["home","about","resources","calendar","tasks","messages","members"],"defaultTermLabel":"2025–2026 School Year","taskGroups":[{"id":"annual_fall","label":"Fall Service Project"},{"id":"annual_spring","label":"Spring Service Project"},{"id":"class_projects","label":"Class Projects"},{"id":"sunshine_support","label":"Sunshine Support"}],"defaultDutyRoles":[{"title":"Committee Lead","description":"Coordinates planning meetings and overall direction."},{"title":"Fall Service Project Lead","description":"Partner outreach and fall donation drive."},{"title":"Spring Service Project Lead","description":"Spring service day logistics."},{"title":"Sunshine Support Lead","description":"Meal trains, babysitting, and celebration coordination."},{"title":"Faculty Liaison","description":"School staff coordination and scheduling."}]}'
    ),
    (
      'farm-connection',
      'Farm Connection & Development Committee',
      'hybrid',
      'Help drive our long-term vision connecting regenerative agriculture with education.',
      '{"sections":["home","about","resources","calendar","tasks","messages","members"],"defaultTermLabel":"2025–2026 School Year","taskGroups":[{"id":"initiatives","label":"Initiatives"},{"id":"annual_projects","label":"Annual Projects"},{"id":"general","label":"General"}],"defaultDutyRoles":[{"title":"Committee Lead","description":"Coordinates planning and long-term initiatives."},{"title":"Community Outreach Lead","description":"Bridge relationships with local farmers and partners."},{"title":"Faculty Liaison","description":"School staff coordination for field trips and forums."}]}'
    ),
    (
      'fundraising',
      'Fundraising Committee',
      'annual_volunteer',
      'Help keep our school growing and accessible.',
      '{"sections":["home","about","resources","calendar","tasks","messages","members"],"defaultTermLabel":"2025–2026 School Year","taskGroups":[{"id":"sponsorships","label":"Sponsorships"},{"id":"events","label":"Fundraising Events"},{"id":"grants","label":"Grants"}],"defaultDutyRoles":[{"title":"Committee Lead","description":"Coordinates fundraising strategy and meetings."},{"title":"Sponsorship Lead","description":"Local business and donor outreach."},{"title":"Grants Research Lead","description":"Research grant opportunities and assist with writing."}]}'
    ),
    (
      'marketing-outreach',
      'Marketing & Outreach Committee',
      'annual_volunteer',
      'Spread the word about Rooted Meadows and foster community engagement.',
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
  where not exists (
    select 1
    from public.committee_templates t
    where t.organization_id = v_org_id
      and t.slug = v.slug
  );

  raise notice 'rooted-meadows-demo committee templates seeded (skipped duplicates).';
end $$;
