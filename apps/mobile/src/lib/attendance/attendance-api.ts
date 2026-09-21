import type {
  AttendanceHistoryResponse,
  AttendancePickupContact,
  AttendanceRecordRequest,
  AttendanceRosterResponse,
  UpsertAttendanceRecordResult,
} from '@/lib/attendance/attendance-types';

type AttendanceFetchFn = <T>(
  path: string,
  options?: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown },
) => Promise<T>;

export function createAttendanceApi(fetchFn: AttendanceFetchFn, basePath: string) {
  return {
    fetchRoster(organizationId: string, date: string): Promise<AttendanceRosterResponse> {
      const params = new URLSearchParams({ organizationId, date });
      return fetchFn<AttendanceRosterResponse>(`${basePath}?${params.toString()}`);
    },

    saveRecord(body: AttendanceRecordRequest): Promise<UpsertAttendanceRecordResult> {
      return fetchFn<UpsertAttendanceRecordResult>(`${basePath}/records`, {
        method: 'POST',
        body,
      });
    },

    fetchHistory(
      organizationId: string,
      studentId: string,
      options?: { limit?: number; offset?: number },
    ): Promise<AttendanceHistoryResponse> {
      const params = new URLSearchParams({
        organizationId,
        studentId,
        limit: String(options?.limit ?? 14),
        offset: String(options?.offset ?? 0),
      });
      return fetchFn<AttendanceHistoryResponse>(`${basePath}/history?${params.toString()}`);
    },

    fetchPickupContacts(
      organizationId: string,
      familyId: string,
      studentId: string,
    ): Promise<{ contacts: AttendancePickupContact[] }> {
      const params = new URLSearchParams({ organizationId, familyId, studentId });
      return fetchFn<{ contacts: AttendancePickupContact[] }>(
        `${basePath}/pickup-contacts?${params.toString()}`,
      );
    },
  };
}
