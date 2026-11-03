import { fetchTeacherApi } from '@/lib/teacher/teacher-portal-api';
import type { TeacherMyHoursPageData } from '@/lib/teacher/my-hours/types';

export async function fetchTeacherMyHoursPageData(
  organizationId: string,
  slug: string,
  options?: { from?: string; to?: string },
): Promise<TeacherMyHoursPageData> {
  const query = new URLSearchParams({ organizationId, slug });
  if (options?.from) query.set('from', options.from);
  if (options?.to) query.set('to', options.to);

  return fetchTeacherApi<TeacherMyHoursPageData>(
    `/api/teacher-portal/my-hours?${query.toString()}`,
  );
}

export async function postTeacherMyHoursClockIn(
  organizationId: string,
  slug: string,
): Promise<TeacherMyHoursPageData> {
  void slug;
  return fetchTeacherApi<TeacherMyHoursPageData>('/api/teacher-portal/my-hours/clock-in', {
    method: 'POST',
    body: { organizationId },
  });
}

export async function postTeacherMyHoursClockOut(
  organizationId: string,
  slug: string,
): Promise<{ pageData: TeacherMyHoursPageData; sessionMinutes: number }> {
  void slug;
  const payload = await fetchTeacherApi<{
    pageData?: TeacherMyHoursPageData;
    session?: { minutes: number };
  }>('/api/teacher-portal/my-hours/clock-out', {
    method: 'POST',
    body: { organizationId },
  });

  if (!payload.pageData) {
    throw new Error('Failed to clock out.');
  }

  return {
    pageData: payload.pageData,
    sessionMinutes: payload.session?.minutes ?? 0,
  };
}
