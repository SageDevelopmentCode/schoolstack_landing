import type { OrganizationWithSettings } from '@/lib/school-admin/fetch-organization';
import type { LiveOrganization } from '@/lib/organizations';

export function toLiveOrganization(org: OrganizationWithSettings): LiveOrganization {
  return {
    id: org.id,
    slug: org.slug,
    name: org.name,
    branding: org.branding,
  };
}
