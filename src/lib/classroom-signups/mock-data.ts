import type {
  ClassroomSignup,
  ClassroomSignupResponse,
  TeacherClassroomOption,
} from "./types";

export const MOCK_TEACHER_CLASSROOMS: TeacherClassroomOption[] = [
  { id: "classroom-oak", name: "Oak Room", familyCount: 18 },
  { id: "classroom-maple", name: "Maple Room", familyCount: 16 },
];

export const MOCK_CLASSROOM_SIGNUPS: ClassroomSignup[] = [
  {
    id: "signup-reading-buddies",
    organizationId: "org-demo",
    createdByStaffMemberId: "staff-1",
    teacherName: "Ms. Rivera",
    title: "Reading buddies — October",
    description:
      "Join us Friday mornings for 15-minute reading sessions with students. No experience needed — just bring a favorite picture book!",
    signupType: "time_slots",
    audience: "assigned",
    classroomId: "classroom-oak",
    classroomName: "Oak Room",
    familyCount: 12,
    status: "open",
    responseDeadline: "2026-10-15T23:59:59.000Z",
    config: {
      allowMultipleSelections: false,
      slots: [
        {
          id: "slot-1",
          label: "Friday, Oct 10",
          date: "2026-10-10",
          startTime: "08:30",
          endTime: "08:45",
          capacity: 1,
        },
        {
          id: "slot-2",
          label: "Friday, Oct 10",
          date: "2026-10-10",
          startTime: "08:45",
          endTime: "09:00",
          capacity: 1,
        },
        {
          id: "slot-3",
          label: "Friday, Oct 17",
          date: "2026-10-17",
          startTime: "08:30",
          endTime: "08:45",
          capacity: 1,
        },
        {
          id: "slot-4",
          label: "Friday, Oct 17",
          date: "2026-10-17",
          startTime: "08:45",
          endTime: "09:00",
          capacity: 1,
        },
      ],
    },
    publishedAt: "2026-09-20T14:00:00.000Z",
    closedAt: null,
    createdAt: "2026-09-18T10:00:00.000Z",
    updatedAt: "2026-09-20T14:00:00.000Z",
  },
  {
    id: "signup-spring-play",
    organizationId: "org-demo",
    createdByStaffMemberId: "staff-1",
    teacherName: "Ms. Rivera",
    title: "Spring play volunteers",
    description:
      "Our class play is May 12! We need help with sets, costumes, and day-of setup. Sign up for any role you can support.",
    signupType: "roles",
    audience: "classroom",
    classroomId: "classroom-oak",
    classroomName: "Oak Room",
    familyCount: 18,
    status: "open",
    responseDeadline: "2026-05-01T23:59:59.000Z",
    config: {
      allowMultipleSelections: true,
      roles: [
        {
          id: "role-sets",
          name: "Sets & scenery",
          description: "Help build and paint backdrops the week before the play.",
          quantityNeeded: 3,
        },
        {
          id: "role-costumes",
          name: "Costumes",
          description: "Sew, alter, or source costume pieces.",
          quantityNeeded: 2,
        },
        {
          id: "role-setup",
          name: "Setup & cleanup",
          description: "Arrive 30 minutes early and stay after for teardown.",
          quantityNeeded: 4,
        },
      ],
    },
    publishedAt: "2026-03-10T09:00:00.000Z",
    closedAt: null,
    createdAt: "2026-03-08T11:00:00.000Z",
    updatedAt: "2026-03-10T09:00:00.000Z",
  },
  {
    id: "signup-field-trip",
    organizationId: "org-demo",
    createdByStaffMemberId: "staff-1",
    teacherName: "Ms. Rivera",
    title: "Nature center field trip chaperones",
    description:
      "We are visiting the nature center on Nov 8 and need parent chaperones for the morning and afternoon blocks.",
    signupType: "time_slots",
    audience: "classroom",
    classroomId: "classroom-oak",
    classroomName: "Oak Room",
    familyCount: 18,
    status: "draft",
    responseDeadline: "2026-11-01T23:59:59.000Z",
    config: {
      allowMultipleSelections: false,
      slots: [
        {
          id: "slot-am",
          label: "Morning chaperone",
          date: "2026-11-08",
          startTime: "09:00",
          endTime: "12:00",
          capacity: 2,
        },
        {
          id: "slot-pm",
          label: "Afternoon chaperone",
          date: "2026-11-08",
          startTime: "12:00",
          endTime: "15:00",
          capacity: 2,
        },
      ],
    },
    publishedAt: null,
    closedAt: null,
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "signup-harvest-festival",
    organizationId: "org-demo",
    createdByStaffMemberId: "staff-1",
    teacherName: "Ms. Rivera",
    title: "Harvest festival volunteers",
    description:
      "Our class harvest festival is coming up! We need parents to help with games, snacks, and setup.",
    signupType: "roles",
    audience: "assigned",
    classroomId: "classroom-oak",
    classroomName: "Oak Room",
    familyCount: 12,
    status: "open",
    responseDeadline: "2026-11-20T23:59:59.000Z",
    config: {
      allowMultipleSelections: true,
      roles: [
        {
          id: "role-games",
          name: "Game station helper",
          description: "Run a simple craft or game station for 30 minutes.",
          quantityNeeded: 4,
        },
        {
          id: "role-snacks",
          name: "Snack table",
          description: "Set up and monitor the snack table.",
          quantityNeeded: 2,
        },
      ],
    },
    publishedAt: "2026-11-01T10:00:00.000Z",
    closedAt: null,
    createdAt: "2026-10-28T09:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
  },
];

export const MOCK_CLASSROOM_SIGNUP_RESPONSES: ClassroomSignupResponse[] = [
  {
    id: "resp-1",
    signupId: "signup-reading-buddies",
    familyId: "family-1",
    familyName: "Chen Family",
    guardianName: "Lisa Chen",
    guardianEmail: "lisa.chen@example.com",
    studentId: "student-1",
    studentName: "Mia Chen",
    selectedSlotIds: ["slot-1"],
    selectedRoleIds: [],
    note: "Bringing a nature-themed book.",
    status: "confirmed",
    createdAt: "2026-09-21T10:30:00.000Z",
    updatedAt: "2026-09-21T10:30:00.000Z",
  },
  {
    id: "resp-2",
    signupId: "signup-reading-buddies",
    familyId: "family-2",
    familyName: "Patel Family",
    guardianName: "Raj Patel",
    guardianEmail: "raj.patel@example.com",
    studentId: "student-2",
    studentName: "Arjun Patel",
    selectedSlotIds: ["slot-2"],
    selectedRoleIds: [],
    note: null,
    status: "confirmed",
    createdAt: "2026-09-22T14:15:00.000Z",
    updatedAt: "2026-09-22T14:15:00.000Z",
  },
  {
    id: "resp-3",
    signupId: "signup-spring-play",
    familyId: "family-3",
    familyName: "Johnson Family",
    guardianName: "Emily Johnson",
    guardianEmail: "emily.j@example.com",
    studentId: "student-3",
    studentName: "Sam Johnson",
    selectedSlotIds: [],
    selectedRoleIds: ["role-costumes", "role-setup"],
    note: "Happy to help with sewing and setup.",
    status: "confirmed",
    createdAt: "2026-03-12T09:00:00.000Z",
    updatedAt: "2026-03-12T09:00:00.000Z",
  },
  {
    id: "resp-4",
    signupId: "signup-spring-play",
    familyId: "family-4",
    familyName: "Williams Family",
    guardianName: "David Williams",
    guardianEmail: "david.w@example.com",
    studentId: "student-4",
    studentName: "Olivia Williams",
    selectedSlotIds: [],
    selectedRoleIds: ["role-sets"],
    note: null,
    status: "confirmed",
    createdAt: "2026-03-14T16:45:00.000Z",
    updatedAt: "2026-03-14T16:45:00.000Z",
  },
];

export function getMockSignupsForTeacher(
  _staffMemberId: string | null,
): ClassroomSignup[] {
  return MOCK_CLASSROOM_SIGNUPS;
}

export function getMockResponsesForSignup(signupId: string): ClassroomSignupResponse[] {
  return MOCK_CLASSROOM_SIGNUP_RESPONSES.filter((r) => r.signupId === signupId);
}

export function getMockResponsesBySignupId(): Record<string, ClassroomSignupResponse[]> {
  const map: Record<string, ClassroomSignupResponse[]> = {};
  for (const response of MOCK_CLASSROOM_SIGNUP_RESPONSES) {
    if (!map[response.signupId]) {
      map[response.signupId] = [];
    }
    map[response.signupId].push(response);
  }
  return map;
}

export function getMockSignupById(signupId: string): ClassroomSignup | undefined {
  return MOCK_CLASSROOM_SIGNUPS.find((s) => s.id === signupId);
}

export type ParentSignupAttentionItem = {
  signupId: string;
  teacherName: string;
  title: string;
  classroomName: string | null;
};

export function getMockParentSignupAttentionItems(): ParentSignupAttentionItem[] {
  const respondedSignupIds = new Set(
    MOCK_CLASSROOM_SIGNUP_RESPONSES.filter((r) => r.status === "confirmed").map(
      (r) => r.signupId,
    ),
  );

  return MOCK_CLASSROOM_SIGNUPS.filter(
    (signup) => signup.status === "open" && !respondedSignupIds.has(signup.id),
  ).map((signup) => ({
    signupId: signup.id,
    teacherName: signup.teacherName,
    title: signup.title,
    classroomName: signup.classroomName,
  }));
}

export const MOCK_ASSIGNED_FAMILY_COUNT = 12;
