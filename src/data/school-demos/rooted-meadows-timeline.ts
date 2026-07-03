import { ROOTED_MEADOWS_ADMIN_COLORS } from "./rootedmeadows-admin-demo";

export const ROOTED_MEADOWS_TIMELINE_START = new Date("2026-06-30");
export const ROOTED_MEADOWS_TIMELINE_V1 = new Date("2026-08-24");

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
  startDate: string;
  endDate: string;
  goal: string;
  summary: string;
  personas: TimelinePersona[];
  features: TimelineFeature[];
  accent: "purple" | "olive";
};

export const ROOTED_MEADOWS_TIMELINE_PHASES: TimelinePhase[] = [
  {
    id: "admissions",
    number: "01",
    title: "Admissions",
    dateRange: "Jul 1 – 12",
    startDate: "2026-07-01",
    endDate: "2026-07-12",
    goal: "Application through enrollment contract",
    summary:
      "Families apply, book an observation visit, and receive their enrollment contract — all without spreadsheets or email chains.",
    personas: ["admin", "parent"],
    accent: "purple",
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
    id: "foundation",
    number: "02",
    title: "Foundation",
    dateRange: "Jul 13 – 22",
    startDate: "2026-07-13",
    endDate: "2026-07-22",
    goal: "Set up records and bring in what you already have",
    summary:
      "With your application form live, we set up your admin portal and import any existing student, family, and staff data you already have — spreadsheets, prior rosters, or contact lists — so admissions and billing can run on real records, not spreadsheets.",
    personas: ["admin"],
    accent: "olive",
    features: [
      {
        title: "Student & family records",
        description:
          "Profiles with health, paperwork, immunizations, and authorized pickup contacts — for new or imported families.",
      },
      {
        title: "Import existing data",
        description:
          "Bring in spreadsheets, prior-year rosters, family contact lists, and staff info you already maintain. We'll map fields, clean duplicates, and load records into MudKitchen so your team isn't re-entering everything by hand.",
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
    id: "tuition",
    number: "03",
    title: "Tuition & billing",
    dateRange: "Jul 23 – 31",
    startDate: "2026-07-23",
    endDate: "2026-07-31",
    goal: "Custom rates and family payments",
    summary:
      "Set up tuition plans, per-family rate overrides, and parent self-service billing so families can view invoices and pay online.",
    personas: ["admin", "parent"],
    accent: "purple",
    features: [
      {
        title: "Tuition plans",
        description:
          "Configure school-year tuition schedules, supply fees, and activities fees from the admin portal.",
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
    dateRange: "Aug 1 – 10",
    startDate: "2026-08-01",
    endDate: "2026-08-10",
    goal: "Full committee workflow",
    summary:
      "Create workspaces from templates, run August volunteer signup, assign tasks, and give parents a dedicated committee home.",
    personas: ["admin", "parent"],
    accent: "olive",
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
    dateRange: "Aug 11 – 14",
    startDate: "2026-08-11",
    endDate: "2026-08-14",
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
    id: "mobile",
    number: "06",
    title: "Mobile app",
    dateRange: "Aug 15 – 19",
    startDate: "2026-08-15",
    endDate: "2026-08-19",
    goal: "School-branded mobile for families and guides",
    summary:
      "A Rooted Meadows-branded mobile app for parents and teachers — the features they reach for most, optimized for phone.",
    personas: ["parent", "teacher"],
    accent: "olive",
    features: [
      {
        title: "Parent mobile",
        description:
          "Tuition, messages, committees, and enrollment — accessible on iOS and Android.",
        prototypeStepId: "mobile-app",
      },
      {
        title: "Teacher mobile",
        description:
          "Attendance, student profiles, and parent messaging on the go from the classroom.",
        prototypeStepId: "mobile-app",
      },
      {
        title: "Branded app build",
        description:
          "Rooted Meadows branding, app store setup, and rollout to families and staff.",
      },
    ],
  },
  {
    id: "launch",
    number: "07",
    title: "v1 launch prep",
    dateRange: "Aug 20 – 24",
    startDate: "2026-08-20",
    endDate: "2026-08-24",
    goal: "Go-live ready",
    summary:
      "Parent portal polish, training, and a final launch checklist so your team is ready on day one.",
    personas: ["admin", "parent", "teacher"],
    accent: "purple",
    features: [
      {
        title: "Parent portal",
        description:
          "Home, enrollment, billing, committees, messages, and calendar in one place for families.",
        prototypeStepId: "parent-pays-tuition",
      },
      {
        title: "Team training",
        description:
          "Walkthroughs for admin and staff, plus parent portal orientation so everyone knows where to go on day one.",
      },
      {
        title: "Launch checklist",
        description:
          "Final verification of programs, tuition, committees, and portal access before opening day.",
      },
    ],
  },
];

export const ROOTED_MEADOWS_TIMELINE_THEME = {
  ...ROOTED_MEADOWS_ADMIN_COLORS,
  pageBg: "#FAF8F4",
  purpleStepBg: "#F0EBF2",
  purpleStepTitle: "#5A4D68",
  oliveStepBg: "#F5F3E6",
  oliveStepTitle: "#5C5A30",
} as const;
