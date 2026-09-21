import { createAttendanceApi } from '@/lib/attendance/attendance-api';
import { fetchSchoolAdminApi } from '@/lib/school-admin-api';

export const schoolAdminAttendanceApi = createAttendanceApi(
  fetchSchoolAdminApi,
  '/api/school-admin/attendance',
);
