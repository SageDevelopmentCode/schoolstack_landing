import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { AttendanceProvider, useAttendance } from '@/contexts/attendance-context';
import { toDateKey } from '@/lib/attendance/attendance-date-utils';
import type { AttendanceRosterResponse } from '@/lib/attendance/attendance-types';

const mockFetchRoster = jest.fn<Promise<AttendanceRosterResponse>, [string, string]>();

jest.mock('@/lib/attendance/school-admin-attendance-api', () => ({
  schoolAdminAttendanceApi: {
    fetchRoster: (organizationId: string, dateKey: string) =>
      mockFetchRoster(organizationId, dateKey),
    saveRecord: jest.fn(),
  },
}));

jest.mock('@/lib/attendance/teacher-attendance-api', () => ({
  teacherAttendanceApi: {
    fetchRoster: jest.fn(),
    saveRecord: jest.fn(),
  },
}));

jest.mock('@/lib/mobile-error-reporter', () => ({
  createSchoolAdminErrorReporter: () => jest.fn(),
  createTeacherPortalErrorReporter: () => jest.fn(),
}));

function emptyRoster(dateKey: string): AttendanceRosterResponse {
  return {
    date: dateKey,
    students: [],
    summary: {
      totalStudents: 0,
      presentCount: 0,
      absentCount: 0,
      pickedUpCount: 0,
      notMarkedCount: 0,
    },
  };
}

type AttendanceSnapshot = ReturnType<typeof useAttendance>;

const attendanceProbe: { current: AttendanceSnapshot | null } = { current: null };

function AttendanceProbe() {
  attendanceProbe.current = useAttendance();
  return null;
}

function mountAttendanceProvider(initialDate: Date): ReactTestRenderer {
  return create(
    <AttendanceProvider organizationId="org-1" portal="school_admin" initialDate={initialDate}>
      <AttendanceProbe />
    </AttendanceProvider>,
  );
}

describe('AttendanceProvider loadRoster', () => {
  beforeEach(() => {
    attendanceProbe.current = null;
    mockFetchRoster.mockReset();
  });

  it('updates activeDate immediately when changing days', async () => {
    const initialDate = new Date('2026-11-05T12:00:00');
    const nextDate = new Date('2026-11-04T12:00:00');
    let resolveRoster: (value: AttendanceRosterResponse) => void = () => undefined;

    mockFetchRoster.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRoster = resolve;
        }),
    );

    act(() => {
      mountAttendanceProvider(initialDate);
    });
    expect(attendanceProbe.current).not.toBeNull();

    await act(async () => {
      void attendanceProbe.current!.loadRoster(initialDate);
    });
    await act(async () => {
      resolveRoster(emptyRoster(toDateKey(initialDate)));
      await Promise.resolve();
    });

    await act(async () => {
      void attendanceProbe.current!.loadRoster(nextDate);
    });

    expect(toDateKey(attendanceProbe.current!.activeDate)).toBe(toDateKey(nextDate));
    expect(attendanceProbe.current!.students).toEqual([]);
    expect(attendanceProbe.current!.summary).toBeNull();
    expect(attendanceProbe.current!.isLoading).toBe(true);
  });

  it('ignores stale roster responses when a newer date load is in flight', async () => {
    const dayOne = new Date('2026-11-05T12:00:00');
    const dayTwo = new Date('2026-11-06T12:00:00');

    let resolveFirst: (value: AttendanceRosterResponse) => void = () => undefined;
    let resolveSecond: (value: AttendanceRosterResponse) => void = () => undefined;

    mockFetchRoster
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
      );

    act(() => {
      mountAttendanceProvider(dayOne);
    });

    await act(async () => {
      void attendanceProbe.current!.loadRoster(dayOne);
      void attendanceProbe.current!.loadRoster(dayTwo);
    });

    await act(async () => {
      resolveSecond(emptyRoster(toDateKey(dayTwo)));
      await Promise.resolve();
    });

    expect(toDateKey(attendanceProbe.current!.activeDate)).toBe(toDateKey(dayTwo));
    expect(attendanceProbe.current!.isLoading).toBe(false);

    await act(async () => {
      resolveFirst({
        date: toDateKey(dayOne),
        students: [
          {
            id: 'stale-student',
            firstName: 'Stale',
            lastName: 'Student',
            grade: null,
            profilePhotoUrl: null,
            familyId: 'fam-1',
            familyName: null,
            programNames: [],
            classroomNames: [],
            attendanceStatus: 'present',
            presentAt: null,
            absentAt: null,
            pickedUpAt: null,
            pickedUpByGuardianId: null,
            pickedUpByAuthorizedContactId: null,
            pickedUpByName: null,
          },
        ],
        summary: {
          totalStudents: 1,
          presentCount: 1,
          absentCount: 0,
          pickedUpCount: 0,
          notMarkedCount: 0,
        },
      });
      await Promise.resolve();
    });

    expect(attendanceProbe.current!.students).toEqual([]);
  });
});
