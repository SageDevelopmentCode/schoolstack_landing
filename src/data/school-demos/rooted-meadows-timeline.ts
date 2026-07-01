import { ROOTED_MEADOWS_ADMIN_COLORS } from "./rootedmeadows-admin-demo";
import {
  ROOTED_MEADOWS_ACTIVITIES_FEE,
  ROOTED_MEADOWS_SCHOOL_YEAR_ANNUAL,
  ROOTED_MEADOWS_SCHOOL_YEAR_PAYMENTS,
  ROOTED_MEADOWS_SUPPLY_FEE,
} from "./rooted-meadows-tuition";

export const ROOTED_MEADOWS_TIMELINE_START = new Date("2026-06-30");
export const ROOTED_MEADOWS_TIMELINE_V1 = new Date("2026-08-15");

export type TimelinePersona = "admin" | "parent" | "teacher";

export type TimelineFeature = {
  title: string;
  description: string;
  prototypeStepId?: string;
};

export type TimelinePhase = {
  id: string;
  number: string;
  title: string;
  dateRange: string;
  goal: string;
  summary: string;
  personas: TimelinePersona[];
  features: TimelineFeature[];
  isPriority?: boolean;
  accent: "purple" | "olive";
};

export const ROOTED_MEADOWS_TIMELINE_PHASES: TimelinePhase[] = [
  {
    id: "foundation",
    number: "01",
    title: "Foundation",
    dateRange: "Jul 1 – 10",
    goal: "Set up your school records",
    summary:
      "Before admissions or billing can run, your admin portal needs student profiles, programs, classrooms, and staff in one place.",
    personas: ["admin"],
    accent: "purple",
    features: [
      {
        title: "Student & family records",
        description:
          "Profiles with health, paperwork, immunizations, and authorized pickup contacts.",
      },
      {
        title: "Programs & classrooms",
        description:
          "School-year, summer, and homeschool drop-in programs with classroom rosters and schedules.",
      },
      {
        title: "Staff directory",
        description:
          "Credentials, payroll paperwork, and role assignments for guides and admin.",
      },
      {
        title: "Admin dashboard",
        description:
          "A single home for leads, school setup, and day-one orientation for your team.",
        prototypeStepId: "send-enrollment-contract",
      },
    ],
  },
  {
    id: "admissions",
    number: "02",
    title: "Admissions",
    dateRange: "Jul 11 – 20",
    goal: "Application through enrollment contract",
    summary:
      "Families apply, book an observation visit, and receive their enrollment contract — all without spreadsheets or email chains.",
    personas: ["admin", "parent"],
    accent: "olive",
    features: [
      {
        title: "MudKitchen-hosted application",
        description:
          "Customizable application form with acknowledgments and application fee collection.",
        prototypeStepId: "submit-application",
      },
      {
        title: "Observation visit booking",
        description:
          "Parents schedule their child's observation from available afternoon slots you set.",
        prototypeStepId: "book-observation",
      },
      {
        title: "Send enrollment contract",
        description:
          "After observation, admin sends the contract from the admissions pipeline.",
        prototypeStepId: "send-enrollment-contract",
      },
      {
        title: "Parent enrollment checklist",
        description:
          "Families sign agreements and complete health forms, photo release, and supply fees.",
        prototypeStepId: "parent-enrollment",
      },
    ],
  },
  {
    id: "tuition",
    number: "03",
    title: "Tuition & billing",
    dateRange: "Jul 21 – 31",
    goal: "Custom rates and family payments",
    summary: `Tuition at $${ROOTED_MEADOWS_SCHOOL_YEAR_ANNUAL.toLocaleString()}/yr (${ROOTED_MEADOWS_SCHOOL_YEAR_PAYMENTS} payments), with per-family overrides and parent self-service billing.`,
    personas: ["admin", "parent"],
    accent: "purple",
    features: [
      {
        title: "Tuition plans",
        description: `Standard school-year pricing with ${ROOTED_MEADOWS_SCHOOL_YEAR_PAYMENTS}-payment schedule, supply fee ($${ROOTED_MEADOWS_SUPPLY_FEE}), and activities fee ($${ROOTED_MEADOWS_ACTIVITIES_FEE}).`,
      },
      {
        title: "Per-family rate overrides",
        description:
          "Sibling discounts, financial aid, or custom monthly amounts from the admin tuition tab.",
        prototypeStepId: "assign-family-tuition",
      },
      {
        title: "Parent billing portal",
        description:
          "Families view invoices, pay tuition, and manage autopay from their portal.",
        prototypeStepId: "parent-pays-tuition",
      },
    ],
  },
  {
    id: "committees",
    number: "04",
    title: "Committees",
    dateRange: "Aug 1 – 8",
    goal: "Full committee workflow",
    summary:
      "Create workspaces from templates, run August volunteer signup, assign tasks, and give parents a dedicated committee home.",
    personas: ["admin", "parent"],
    accent: "olive",
    isPriority: true,
    features: [
      {
        title: "Create committee workspace",
        description:
          "Spin up Service & Sunshine from a template with handbook, calendar, and starter tasks.",
        prototypeStepId: "create-committee",
      },
      {
        title: "Role-based resource access",
        description:
          "Restrict planning docs and files by duty role so the right members see the right materials.",
        prototypeStepId: "committee-resource-access",
      },
      {
        title: "August volunteer signup",
        description:
          "Send preference forms to all enrolled families and track placement responses.",
        prototypeStepId: "august-volunteer-signup",
      },
      {
        title: "Task assignment",
        description:
          "Kanban board for assigning and tracking committee work across members.",
        prototypeStepId: "assign-committee-tasks",
      },
      {
        title: "Parent committee workspace",
        description:
          "Families join their committee, view resources, and participate in messages and tasks.",
        prototypeStepId: "parent-committee-workspace",
      },
      {
        title: "Archive & year rollover",
        description:
          "Close out the year and duplicate templates for the next cycle.",
        prototypeStepId: "archive-committee",
      },
    ],
  },
  {
    id: "teacher",
    number: "05",
    title: "Teacher portal",
    dateRange: "Aug 9 – 12",
    goal: "Day-to-day classroom tools",
    summary:
      "Guides take Mon–Thu attendance, view student profiles, and message parents — all from one portal.",
    personas: ["teacher"],
    accent: "purple",
    features: [
      {
        title: "Attendance",
        description:
          "Daily check-in across your Waldorf Mon–Thu schedule with live roster status.",
        prototypeStepId: "teacher-attendance",
      },
      {
        title: "Student roster & profiles",
        description:
          "My Students view with grade, room, learning profile, and attendance history.",
        prototypeStepId: "teacher-view-students",
      },
      {
        title: "Parent messaging",
        description:
          "One-on-one threads for check-ins, conferences, and day-of updates.",
        prototypeStepId: "teacher-message-parents",
      },
    ],
  },
  {
    id: "launch",
    number: "06",
    title: "v1 launch prep",
    dateRange: "Aug 13 – 15",
    goal: "Go-live ready",
    summary:
      "Parent portal polish, mobile access, training, and a final launch checklist so your team is ready on day one.",
    personas: ["admin", "parent", "teacher"],
    accent: "olive",
    features: [
      {
        title: "Parent portal",
        description:
          "Home, enrollment, billing, committees, messages, and calendar in one place for families.",
        prototypeStepId: "parent-pays-tuition",
      },
      {
        title: "Mobile app",
        description:
          "Parents and teachers get messaging, tuition, attendance, and student profiles on mobile.",
        prototypeStepId: "mobile-app",
      },
      {
        title: "Training & data import",
        description:
          "Onboarding sessions for admin and staff, plus student and family data migration.",
      },
      {
        title: "Launch checklist",
        description:
          "Final verification of programs, tuition, committees, and portal access before opening day.",
      },
    ],
  },
];

export const ROOTED_MEADOWS_POST_V1_FEATURES = [
  "Finances (expenses, revenue, insights)",
  "Payroll",
  "Marketing tools",
  "Calendar & school feed polish",
] as const;

export const ROOTED_MEADOWS_OUT_OF_SCOPE = ["Website"] as const;

export const ROOTED_MEADOWS_TIMELINE_THEME = {
  ...ROOTED_MEADOWS_ADMIN_COLORS,
  pageBg: "#FAF8F4",
  purpleStepBg: "#F0EBF2",
  purpleStepTitle: "#5A4D68",
  oliveStepBg: "#F5F3E6",
  oliveStepTitle: "#5C5A30",
} as const;
