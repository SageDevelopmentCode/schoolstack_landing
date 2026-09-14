import { fetchSchoolAdminApi } from '@/lib/school-admin-api';
import type {
  CreateOrganizationEventInput,
  UpdateOrganizationEventInput,
} from '@/lib/school-events/events';
import type { OrganizationEvent } from '@/lib/school-events/types';

export async function createOrganizationEventViaApi(
  organizationId: string,
  input: CreateOrganizationEventInput,
): Promise<OrganizationEvent> {
  const payload = await fetchSchoolAdminApi<{ event: OrganizationEvent }>('/api/school-events', {
    method: 'POST',
    body: { organizationId, ...input },
  });

  if (!payload.event) {
    throw new Error('Failed to add event.');
  }

  return payload.event;
}

export async function updateOrganizationEventViaApi(
  organizationId: string,
  eventId: string,
  input: UpdateOrganizationEventInput,
): Promise<void> {
  await fetchSchoolAdminApi(`/api/school-events/${eventId}`, {
    method: 'PATCH',
    body: { organizationId, ...input },
  });
}

export async function deleteOrganizationEventViaApi(
  organizationId: string,
  eventId: string,
): Promise<void> {
  const query = new URLSearchParams({ organizationId }).toString();
  await fetchSchoolAdminApi(`/api/school-events/${eventId}?${query}`, {
    method: 'DELETE',
  });
}
