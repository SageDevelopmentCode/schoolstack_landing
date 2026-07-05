-- Seed program and link published application form for Rooted Meadows bootstrap.
-- Run after: add_product_programs.sql, application form seeds.

insert into public.programs (organization_id, name, type, status)
select o.id, 'School Year 2026–27', 'school_year', 'open'
from public.organizations o
where o.slug = 'rooted-meadows-school'
  and not exists (
    select 1
    from public.programs p
    where p.organization_id = o.id
      and p.name = 'School Year 2026–27'
  );

update public.application_form_versions afv
set program_id = p.id
from public.organizations o
join public.programs p
  on p.organization_id = o.id
 and p.name = 'School Year 2026–27'
where afv.organization_id = o.id
  and o.slug = 'rooted-meadows-school'
  and afv.id = 'a57d66cf-1c0b-4052-a1cd-3067c07361d3'
  and afv.program_id is null;
