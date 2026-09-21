import { createAttendanceApi } from '@/lib/attendance/attendance-api';
import { fetchTeacherApi } from '@/lib/teacher/teacher-portal-api';

export const teacherAttendanceApi = createAttendanceApi(
  fetchTeacherApi,
  '/api/teacher-portal/attendance',
);
