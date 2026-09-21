import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  createSchoolAdminErrorReporter,
  createTeacherPortalErrorReporter,
  type MobileErrorReporter,
} from '@/lib/mobile-error-reporter';
import type { createAttendanceApi } from '@/lib/attendance/attendance-api';
import { toDateKey } from '@/lib/attendance/attendance-date-utils';
import { schoolAdminAttendanceApi } from '@/lib/attendance/school-admin-attendance-api';
import { teacherAttendanceApi } from '@/lib/attendance/teacher-attendance-api';
import type {
  AttendanceAction,
  AttendancePickupSelection,
  AttendanceRosterResponse,
  AttendanceRosterStudent,
  AttendanceRosterSummary,
} from '@/lib/attendance/attendance-types';

export type AttendancePortal = 'teacher' | 'school_admin';

type AttendanceApi = ReturnType<typeof createAttendanceApi>;

type AttendanceContextValue = {
  organizationId: string;
  portal: AttendancePortal;
  activeDate: Date;
  setActiveDate: (date: Date) => void;
  students: AttendanceRosterStudent[];
  summary: AttendanceRosterSummary | null;
  isLoading: boolean;
  isRefreshing: boolean;
  savingStudentId: string | null;
  error: string | null;
  loadRoster: (date?: Date) => Promise<void>;
  refresh: () => Promise<void>;
  saveAction: (
    student: AttendanceRosterStudent,
    action: AttendanceAction,
    pickupSelection?: AttendancePickupSelection,
  ) => Promise<boolean>;
  api: AttendanceApi;
};

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

function getApi(portal: AttendancePortal): AttendanceApi {
  return portal === 'teacher' ? teacherAttendanceApi : schoolAdminAttendanceApi;
}

function getErrorReporter(portal: AttendancePortal, organizationId: string): MobileErrorReporter {
  return portal === 'teacher'
    ? createTeacherPortalErrorReporter(organizationId)
    : createSchoolAdminErrorReporter(organizationId);
}

type AttendanceProviderProps = {
  children: ReactNode;
  organizationId: string;
  portal: AttendancePortal;
  initialDate?: Date;
};

export function AttendanceProvider({
  children,
  organizationId,
  portal,
  initialDate,
}: AttendanceProviderProps) {
  const api = useMemo(() => getApi(portal), [portal]);
  const reportError = useMemo(
    () => getErrorReporter(portal, organizationId),
    [organizationId, portal],
  );

  const [activeDate, setActiveDate] = useState(() => initialDate ?? new Date());
  const [students, setStudents] = useState<AttendanceRosterStudent[]>([]);
  const [summary, setSummary] = useState<AttendanceRosterSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyRoster = useCallback((roster: AttendanceRosterResponse) => {
    setStudents(roster.students);
    setSummary(roster.summary);
  }, []);

  const loadRoster = useCallback(
    async (date?: Date, options?: { refresh?: boolean }) => {
      const targetDate = date ?? activeDate;
      const dateKey = toDateKey(targetDate);
      const isRefresh = options?.refresh === true;

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const roster = await api.fetchRoster(organizationId, dateKey);
        if (date) {
          setActiveDate(targetDate);
        }
        applyRoster(roster);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load attendance roster.';
        setError(message);
        reportError('attendance.load_roster', err, { error: message });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeDate, api, applyRoster, organizationId, reportError],
  );

  const refresh = useCallback(async () => {
    await loadRoster(undefined, { refresh: true });
  }, [loadRoster]);

  const saveAction = useCallback(
    async (
      student: AttendanceRosterStudent,
      action: AttendanceAction,
      pickupSelection?: AttendancePickupSelection,
    ): Promise<boolean> => {
      setSavingStudentId(student.id);
      try {
        await api.saveRecord({
          organizationId,
          studentId: student.id,
          date: toDateKey(activeDate),
          action,
          pickupSource: pickupSelection?.source,
          pickupContactId: pickupSelection?.contactId,
        });
        await loadRoster();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save attendance.';
        reportError('attendance.save_record', err, { error: message });
        return false;
      } finally {
        setSavingStudentId(null);
      }
    },
    [activeDate, api, loadRoster, organizationId, reportError],
  );

  const value = useMemo<AttendanceContextValue>(
    () => ({
      organizationId,
      portal,
      activeDate,
      setActiveDate,
      students,
      summary,
      isLoading,
      isRefreshing,
      savingStudentId,
      error,
      loadRoster,
      refresh,
      saveAction,
      api,
    }),
    [
      organizationId,
      portal,
      activeDate,
      students,
      summary,
      isLoading,
      isRefreshing,
      savingStudentId,
      error,
      loadRoster,
      refresh,
      saveAction,
      api,
    ],
  );

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within AttendanceProvider');
  }
  return context;
}
