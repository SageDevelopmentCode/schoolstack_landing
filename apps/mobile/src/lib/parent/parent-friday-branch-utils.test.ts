import {
  getFridayBranchChildChipAriaLabel,
  getFridayBranchSpotsBadge,
  getInitialFridayBranchChildSelection,
  isFridayBranchChildChipDisabled,
  partitionFridayBranchChildSelection,
} from '@/lib/parent/parent-friday-branch-utils';
import type { ParentFridayBranchStudentEnrollmentState } from '@/lib/parent/parent-friday-branch-types';

const studentStates: ParentFridayBranchStudentEnrollmentState[] = [
  {
    studentId: 'caleb',
    studentName: 'Caleb Cecilia',
    enrollmentId: 'enroll-1',
    status: 'confirmed',
    canEnroll: false,
    blockedReason: 'Already signed up for this class.',
  },
  {
    studentId: 'jon',
    studentName: 'Jon Cecilia',
    canEnroll: true,
  },
  {
    studentId: 'julia',
    studentName: 'Julia Cecilia',
    canEnroll: true,
  },
  {
    studentId: 'blocked',
    studentName: 'Blocked Child',
    canEnroll: false,
    blockedReason: 'Already signed up for another class at this time.',
  },
];

describe('getInitialFridayBranchChildSelection', () => {
  it('pre-selects only enrollable children without a status', () => {
    expect(getInitialFridayBranchChildSelection(studentStates)).toEqual(['jon', 'julia']);
  });
});

describe('partitionFridayBranchChildSelection', () => {
  it('splits selected children into enrollable and withdrawable groups', () => {
    const result = partitionFridayBranchChildSelection(
      studentStates,
      ['caleb', 'jon', 'julia', 'blocked'],
    );
    expect(result.enrollableIds).toEqual(['jon', 'julia']);
    expect(result.withdrawableIds).toEqual(['caleb']);
  });
});

describe('isFridayBranchChildChipDisabled', () => {
  it('disables blocked children without an active enrollment', () => {
    expect(isFridayBranchChildChipDisabled(studentStates[3])).toBe(true);
    expect(isFridayBranchChildChipDisabled(studentStates[0])).toBe(false);
    expect(isFridayBranchChildChipDisabled(studentStates[1])).toBe(false);
  });
});

describe('getFridayBranchChildChipAriaLabel', () => {
  it('describes enrollment status for assistive labels', () => {
    expect(getFridayBranchChildChipAriaLabel(studentStates[0])).toBe('Caleb Cecilia, signed up');
    expect(
      getFridayBranchChildChipAriaLabel({
        ...studentStates[1],
        status: 'waitlisted',
      }),
    ).toBe('Jon Cecilia, waitlisted');
    expect(getFridayBranchChildChipAriaLabel(studentStates[1])).toBe('Jon Cecilia, not signed up');
    expect(getFridayBranchChildChipAriaLabel(studentStates[3])).toBe('Blocked Child, unavailable');
  });
});

describe('getFridayBranchSpotsBadge', () => {
  it('returns open when capacity is null', () => {
    expect(
      getFridayBranchSpotsBadge({
        classId: 'class-1',
        slotId: 'slot-1',
        slotTime: '9:00',
        name: 'Art',
        location: 'Room 1',
        ageGroup: 'K-2',
        capacity: null,
        priceCents: null,
        hasFlyer: false,
        confirmedCount: 0,
        spotsRemaining: null,
        familyEnrollments: [],
      }),
    ).toEqual({ label: 'Open', tone: 'success' });
  });

  it('returns full when no spots remain', () => {
    expect(
      getFridayBranchSpotsBadge({
        classId: 'class-1',
        slotId: 'slot-1',
        slotTime: '9:00',
        name: 'Art',
        location: 'Room 1',
        ageGroup: 'K-2',
        capacity: 10,
        priceCents: null,
        hasFlyer: false,
        confirmedCount: 10,
        spotsRemaining: 0,
        familyEnrollments: [],
      }),
    ).toEqual({ label: 'Full', tone: 'warning' });
  });
});
