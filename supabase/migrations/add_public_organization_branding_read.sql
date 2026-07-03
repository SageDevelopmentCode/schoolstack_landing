-- Public read access for school portal pages (admin baseline, apply, etc.)
-- Branding JSON contains no secrets; org must not be churned.

create policy "Public can read active organizations"
  on public.organizations
  for select
  to anon, authenticated
  using (status != 'churned');

create policy "Public can read organization settings for active orgs"
  on public.organization_settings
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.organizations o
      where o.id = organization_settings.organization_id
        and o.status != 'churned'
    )
  );
