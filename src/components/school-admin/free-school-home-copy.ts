import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  GitBranch,
  Mail,
  type LucideIcon,
} from "lucide-react";

/* Copy for the free-plan admin Home (src/components/school-admin/FreeSchoolHome.tsx). */

export type FreeHomeStartItem = {
  id: string;
  title: string;
  description: string;
  feature: string;
  subtab?: string;
  /** Extra query string, e.g. to open a specific tab. */
  query?: string;
  icon: LucideIcon;
  tint: string;
};

/** The pages a free school can open, in the order we suggest setting them up. */
export const FREE_HOME_START_ITEMS: readonly FreeHomeStartItem[] = [
  {
    id: "programs",
    title: "Programs",
    description: "Add the programs families can apply to.",
    feature: "admissions",
    subtab: "programs",
    icon: BookOpen,
    tint: "bg-[var(--sf-butter)]",
  },
  {
    id: "flows",
    title: "Enrollment Flows",
    description: "Build the application and the steps families follow to enroll.",
    feature: "admissions",
    subtab: "flows",
    icon: GitBranch,
    tint: "bg-[var(--sf-sky)]",
  },
  {
    id: "submissions",
    title: "Submissions",
    description: "Review applications as families send them in.",
    feature: "admissions",
    subtab: "submissions",
    icon: ClipboardList,
    tint: "bg-[var(--sf-mint)]",
  },
  {
    id: "tour-page",
    title: "Tour page",
    description: "Set tour times and share your booking page.",
    feature: "schedule",
    query: "tab=tours&toursSubtab=public-tour",
    icon: CalendarDays,
    tint: "bg-[var(--sf-lav)]",
  },
  {
    id: "newsletters",
    title: "Newsletters",
    description: "Write newsletters and send them to your families.",
    feature: "my_school",
    subtab: "newsletters",
    icon: Mail,
    tint: "bg-[var(--sf-peach)]",
  },
];

/**
 * Locked features shown as cards on Home. `label` must match the sidebar label
 * so the popup opens with the same pitch; `pitchKey` picks the card's copy.
 */
export const FREE_HOME_LOCKED_ITEMS: readonly { label: string; pitchKey: string }[] = [
  { label: "Dashboard", pitchKey: "dashboard" },
  { label: "Tuition", pitchKey: "my_school:tuition" },
  { label: "My Students", pitchKey: "my_school:students" },
  { label: "Attendance", pitchKey: "my_school:attendance" },
  { label: "Staff hours", pitchKey: "my_school:staff_hours" },
  { label: "Messages", pitchKey: "messages" },
  { label: "Photos", pitchKey: "photos" },
  { label: "Payments", pitchKey: "admissions:payments" },
  { label: "Alerts", pitchKey: "notifications" },
];

export const FREE_HOME_COPY = {
  nameKicker: "Welcome to MudKitchen",
  nameTitleLead: "What's your",
  nameTitleAccent: "name?",
  nameBody: (school: string) => `We'll use it to welcome you to ${school}.`,
  nameHand: "pull up a chair!",
  welcomeSubtitle: "Here's where to start, and what opens up with the full plan.",
  startKicker: "Start here",
  startTitle: "Get admissions ready",
  callKicker: "Ready for more?",
  callTitle: (school: string) => `See MudKitchen set up for ${school}`,
  callBody:
    "Book a call and we'll walk through the full plan with you, then set it up for your school.",
  callCta: "See the full plan",
  lockedTitle: "In the full plan",
  lockedBody: (school: string) => `Pick one to see what it does for ${school}.`,
} as const;
