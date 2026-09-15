import type { ClassroomSignup } from '@/lib/parent/parent-classroom-signups-types';
import {
  classifyParentClassroomSignupListItem,
  formatSignupDeadline,
  isSlotFull,
} from '@/lib/parent/parent-classroom-signups-utils';

const baseSignup: ClassroomSignup = {
  id: 'signup-1',
  organizationId: 'org-1',
  createdByStaffMemberId: 'staff-1',
  teacherName: 'Ms. Smith',
  title: 'Field trip helpers',
  description: 'Help chaperone',
  signupType: 'time_slots',
  audience: 'classroom',
  classroomId: 'class-1',
  classroomIds: [],
  classroomName: 'Room 3',
  familyCount: 10,
  status: 'open',
  responseDeadline: '2026-12-01T00:00:00.000Z',
  config: { slots: [{ id: 'slot-1', label: 'Morning', date: '2026-12-05', startTime: '09:00', endTime: '11:00', capacity: 2 }] },
  publishedAt: '2026-09-01T00:00:00.000Z',
  closedAt: null,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

describe('parent-classroom-signups-utils', () => {
  it('formats signup deadlines', () => {
    expect(formatSignupDeadline('2026-12-01T00:00:00.000Z')).toBe('Nov 30, 2026');
    expect(formatSignupDeadline(null)).toBeNull();
  });

  it('detects full slots', () => {
    const responses = [
      {
        id: 'r1',
        signupId: 'signup-1',
        familyId: 'f1',
        familyName: 'Family 1',
        guardianName: 'Parent 1',
        guardianEmail: 'p1@example.com',
        studentId: 's1',
        studentName: 'Child 1',
        selectedSlotIds: ['slot-1'],
        selectedRoleIds: [],
        note: null,
        status: 'confirmed' as const,
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'r2',
        signupId: 'signup-1',
        familyId: 'f2',
        familyName: 'Family 2',
        guardianName: 'Parent 2',
        guardianEmail: 'p2@example.com',
        studentId: 's2',
        studentName: 'Child 2',
        selectedSlotIds: ['slot-1'],
        selectedRoleIds: [],
        note: null,
        status: 'confirmed' as const,
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
    ];

    expect(isSlotFull('slot-1', 2, responses)).toBe(true);
  });

  it('classifies open signups needing response', () => {
    const item = classifyParentClassroomSignupListItem(baseSignup, null);
    expect(item?.listStatus).toBe('needs_response');
  });

  it('classifies signed-up open signups', () => {
    const item = classifyParentClassroomSignupListItem(baseSignup, {
      id: 'r1',
      signupId: 'signup-1',
      familyId: 'f1',
      familyName: 'Family 1',
      guardianName: 'Parent 1',
      guardianEmail: 'p1@example.com',
      studentId: 's1',
      studentName: 'Child 1',
      selectedSlotIds: ['slot-1'],
      selectedRoleIds: [],
      note: null,
      status: 'confirmed',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    });
    expect(item?.listStatus).toBe('signed_up');
  });
});
