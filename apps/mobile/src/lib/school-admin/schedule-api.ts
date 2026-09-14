import { fetchSchoolAdminApi } from '@/lib/school-admin-api';

export async function toggleAdmissionsAvailabilitySlotViaApi(input: {
  organizationId: string;
  date: string;
  timeSlot: string;
  open: boolean;
}): Promise<void> {
  await fetchSchoolAdminApi('/api/school-admin/admissions/availability/toggle', {
    method: 'POST',
    body: input,
  });
}

export async function toggleObservationDayViaApi(input: {
  organizationId: string;
  date: string;
  open: boolean;
}): Promise<void> {
  await fetchSchoolAdminApi('/api/school-admin/admissions/observation/day-toggle', {
    method: 'POST',
    body: input,
  });
}

export type ObservationSlotApiInput = {
  organizationId: string;
  date: string;
  startTime: string;
  endTime?: string | null;
  label?: string | null;
  gradeValues: string[];
};

export async function createObservationSlotViaApi(
  input: ObservationSlotApiInput,
): Promise<{ id: string }> {
  const payload = await fetchSchoolAdminApi<{ slot: { id: string } }>(
    '/api/school-admin/admissions/observation/slots',
    {
      method: 'POST',
      body: input,
    },
  );

  if (!payload.slot?.id) {
    throw new Error('Failed to create shadow slot.');
  }

  return payload.slot;
}

export async function deleteObservationSlotViaApi(
  organizationId: string,
  slotId: string,
): Promise<void> {
  const query = new URLSearchParams({ organizationId }).toString();
  await fetchSchoolAdminApi(
    `/api/school-admin/admissions/observation/slots/${slotId}?${query}`,
    {
      method: 'DELETE',
    },
  );
}
