import { newAdmissionsId } from "@/lib/admissions/application-form-schema";
import type {
  ClassroomSignupConfig,
  ClassroomSignupDraft,
  ClassroomSignupTemplateId,
  ClassroomSignupType,
} from "./types";

export type ClassroomSignupTemplate = {
  id: ClassroomSignupTemplateId;
  label: string;
  description: string;
  icon: string;
  signupType: ClassroomSignupType;
  build: () => Pick<
    ClassroomSignupDraft,
    "title" | "description" | "signupType" | "config" | "responseDeadline"
  >;
};

function newSlotId(): string {
  return `slot-${newAdmissionsId()}`;
}

function newRoleId(): string {
  return `role-${newAdmissionsId()}`;
}

const TEMPLATE_DEFS: ClassroomSignupTemplate[] = [
  {
    id: "reading_buddies",
    label: "Reading buddies",
    description: "Parents sign up for short reading sessions with students.",
    icon: "book-open",
    signupType: "time_slots",
    build: () => ({
      title: "Reading buddies",
      description:
        "We would love for families to join us for reading buddies! Sign up for a 15-minute slot on Friday mornings to read with a student in our classroom.",
      signupType: "time_slots",
      responseDeadline: null,
      config: {
        allowMultipleSelections: false,
        slots: [
          {
            id: newSlotId(),
            label: "Friday morning",
            date: "",
            startTime: "08:30",
            endTime: "08:45",
            capacity: 1,
          },
          {
            id: newSlotId(),
            label: "Friday morning",
            date: "",
            startTime: "08:45",
            endTime: "09:00",
            capacity: 1,
          },
          {
            id: newSlotId(),
            label: "Friday morning",
            date: "",
            startTime: "09:00",
            endTime: "09:15",
            capacity: 1,
          },
        ],
      },
    }),
  },
  {
    id: "class_event_helpers",
    label: "Class event helpers",
    description: "Recruit parents for sets, costumes, setup, and cleanup.",
    icon: "users",
    signupType: "roles",
    build: () => ({
      title: "Spring play volunteers",
      description:
        "Our class play is coming up! Please sign up to help with sets, costumes, or day-of setup. Thank you for supporting our students.",
      signupType: "roles",
      responseDeadline: null,
      config: {
        allowMultipleSelections: true,
        roles: [
          {
            id: newRoleId(),
            name: "Sets & scenery",
            description: "Help build and paint backdrops before the performance.",
            quantityNeeded: 3,
          },
          {
            id: newRoleId(),
            name: "Costumes",
            description: "Sew, alter, or source costume pieces.",
            quantityNeeded: 2,
          },
          {
            id: newRoleId(),
            name: "Setup & cleanup",
            description: "Arrive 30 minutes early and stay after for teardown.",
            quantityNeeded: 4,
          },
        ],
      },
    }),
  },
  {
    id: "field_trip_chaperones",
    label: "Field trip chaperones",
    description: "Time slots for chaperoning a class outing.",
    icon: "calendar-days",
    signupType: "time_slots",
    build: () => ({
      title: "Field trip chaperones",
      description:
        "We need parent chaperones for our upcoming field trip. Please sign up for a time block if you can join us.",
      signupType: "time_slots",
      responseDeadline: null,
      config: {
        allowMultipleSelections: false,
        slots: [
          {
            id: newSlotId(),
            label: "Morning chaperone",
            date: "",
            startTime: "09:00",
            endTime: "12:00",
            capacity: 2,
          },
          {
            id: newSlotId(),
            label: "Afternoon chaperone",
            date: "",
            startTime: "12:00",
            endTime: "15:00",
            capacity: 2,
          },
        ],
      },
    }),
  },
  {
    id: "class_party_contributions",
    label: "Class party contributions",
    description: "Parents sign up to bring snacks, drinks, or supplies.",
    icon: "heart",
    signupType: "roles",
    build: () => ({
      title: "Class celebration contributions",
      description:
        "Help us celebrate the end of the term! Sign up to bring an item for our class party.",
      signupType: "roles",
      responseDeadline: null,
      config: {
        allowMultipleSelections: true,
        roles: [
          {
            id: newRoleId(),
            name: "Healthy snacks",
            description: "Fruit, veggies, or nut-free snacks for 20 students.",
            quantityNeeded: 2,
          },
          {
            id: newRoleId(),
            name: "Drinks",
            description: "Juice boxes or water bottles.",
            quantityNeeded: 1,
          },
          {
            id: newRoleId(),
            name: "Plates & napkins",
            description: "Disposable serving supplies.",
            quantityNeeded: 1,
          },
        ],
      },
    }),
  },
  {
    id: "blank",
    label: "Start blank",
    description: "Configure title, type, and options from scratch.",
    icon: "file-text",
    signupType: "open",
    build: () => ({
      title: "",
      description: "",
      signupType: "open",
      responseDeadline: null,
      config: {
        parentPrompt: "How would you like to help?",
        maxFamilies: undefined,
      },
    }),
  },
];

export const CLASSROOM_SIGNUP_TEMPLATES = TEMPLATE_DEFS;

export function getClassroomSignupTemplate(
  id: ClassroomSignupTemplateId,
): ClassroomSignupTemplate | undefined {
  return TEMPLATE_DEFS.find((template) => template.id === id);
}

export function buildSignupFromTemplate(
  id: ClassroomSignupTemplateId,
  overrides: Partial<ClassroomSignupDraft> = {},
): ClassroomSignupDraft {
  const template = getClassroomSignupTemplate(id);
  if (!template) {
    throw new Error(`Unknown signup template: ${id}`);
  }

  const built = template.build();

  return {
    title: built.title,
    description: built.description,
    signupType: built.signupType,
    audience: "assigned",
    classroomId: null,
    classroomName: null,
    familyCount: 12,
    status: "draft",
    responseDeadline: built.responseDeadline,
    config: built.config,
    ...overrides,
  };
}

export function emptySignupConfig(signupType: ClassroomSignupType): ClassroomSignupConfig {
  switch (signupType) {
    case "time_slots":
      return { slots: [], allowMultipleSelections: false };
    case "roles":
      return { roles: [], allowMultipleSelections: true };
    case "open":
      return { parentPrompt: "How would you like to help?" };
  }
}
