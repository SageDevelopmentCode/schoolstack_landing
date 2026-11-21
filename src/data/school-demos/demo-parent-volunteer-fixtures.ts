/*
 * Parent demo › Volunteer opportunities (Sarah Mitchell's family: Emma in the
 * Oak Room with Ms. Rivera, Jake in the Maple Room with Mr. Patel). Demo-only:
 * the page keeps sign-ups in local state, nothing is sent anywhere. Dates sit
 * after the demo's "today" (Nov 21, 2026).
 */

export type DemoVolunteerCategory = "classroom" | "event";

export type DemoVolunteerOpportunity = {
  id: string;
  title: string;
  category: DemoVolunteerCategory;
  /** YYYY-MM-DD */
  date: string;
  /** "Oak Room · Ms. Rivera" or the event's place. */
  where: string;
  /** "9:00 – 11:00 AM" */
  time: string;
  /** Counted toward "Your hours this year" when signed up. */
  hours: number;
  spotsFilled: number;
  spotsTotal: number;
};

export type DemoVolunteerPastSignup = {
  id: string;
  title: string;
  /** Meta line under the title. */
  meta: string;
};

export function buildDemoParentVolunteerOpportunities(): DemoVolunteerOpportunity[] {
  return [
    {
      id: "vol-garden-day",
      title: "Garden day helpers",
      category: "classroom",
      date: "2026-12-02",
      where: "Oak Room · Ms. Rivera",
      time: "9:00 – 11:00 AM",
      hours: 2,
      spotsFilled: 3,
      spotsTotal: 5,
    },
    {
      id: "vol-picture-day",
      title: "Picture day",
      category: "event",
      date: "2026-12-04",
      where: "Front hall",
      time: "8:30 AM – 12:00 PM",
      hours: 3,
      spotsFilled: 2,
      spotsTotal: 4,
    },
    {
      id: "vol-read-aloud",
      title: "Read-aloud",
      category: "classroom",
      date: "2026-12-08",
      where: "Maple Room · Mr. Patel",
      time: "1:30 – 2:15 PM",
      hours: 1,
      spotsFilled: 1,
      spotsTotal: 3,
    },
    {
      id: "vol-art-showcase",
      title: "Art showcase setup",
      category: "event",
      date: "2026-12-11",
      where: "Gathering room",
      time: "3:30 – 5:30 PM",
      hours: 2,
      spotsFilled: 4,
      spotsTotal: 6,
    },
    {
      id: "vol-field-trip",
      title: "Field trip chaperone",
      category: "classroom",
      date: "2027-01-14",
      where: "Maple Room · Mr. Patel",
      time: "8:45 AM – 2:00 PM",
      hours: 5,
      spotsFilled: 3,
      spotsTotal: 5,
    },
  ];
}

/** Sign-ups already on the family's record (the rail starts with these). */
export function buildDemoParentVolunteerPastSignups(): DemoVolunteerPastSignup[] {
  return [
    {
      id: "vol-past-fall-festival",
      title: "Fall festival bake table",
      meta: "Oct 24 · 3 hours",
    },
  ];
}

/** Hours already logged this school year (before any new demo sign-ups). */
export const DEMO_PARENT_VOLUNTEER_STARTING_HOURS = 6;
