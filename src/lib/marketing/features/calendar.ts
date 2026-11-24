import { CalendarDays } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/calendar.md */

const BRIGHT_HORIZONS: Source = {
  label: "Bright Horizons, Modern Family Index",
  url: "https://brighthorizons.com/newsroom/mental-load-impact-working-mothers-study",
  year: "2017",
};
const PARENTSQUARE: Source = {
  label: "ParentSquare & Hanover Research parent study, via K-12 Dive",
  url: "https://www.k12dive.com/press-release/20261020-new-parentsquare-and-hanover-research-study-school-communication-shapes-wh/",
  year: "2026",
};
const BW_CALENDAR: Source = {
  label: "Brightwheel help: add events to your program calendar",
  url: "https://help.mybrightwheel.com/en/articles/942407-add-events-to-your-program-calendar",
};
const BW_SIGNUPS: Source = {
  label: "Brightwheel help: sign-up sheets",
  url: "https://help.mybrightwheel.com/en/articles/11175244-create-sign-up-sheets-for-events-supplies-parent-teacher-conferences-more",
};
const BW_CRM: Source = { label: "Brightwheel: CRM & enrollment", url: "https://mybrightwheel.com/crm-and-enrollment-forecasting/" };
const PG_CALENDAR: Source = { label: "Playground help: manage the calendar", url: "https://help.tryplayground.com/en/articles/7017265-manage-the-calendar" };
const PG_CRM: Source = { label: "Playground help: what is CRM", url: "https://help.tryplayground.com/en/articles/9875841-what-is-crm" };
const TC_HOME: Source = { label: "Transparent Classroom feature list", url: "https://www.transparentclassroom.com/" };
const TC_EVENTS: Source = {
  label: "Transparent Classroom help: events and Google Calendar",
  url: "https://transparent-classroom.helpscoutdocs.com/category/7-category",
};

export const calendar: Feature = {
  slug: "calendar",
  name: "Calendar & schedule",
  icon: CalendarDays,
  tint: "sky",
  oneLiner: "School events and admissions visits in one schedule, reminders included.",
  roles: ["admin", "family", "staff"],
  roleLines: {
    admin: "Post school events and open tour, interview and shadow-day slots in one place.",
    family: "See school events by month or list, and add them to your calendar.",
    staff: "See today's events on your dashboard, and add events when allowed.",
  },
  platforms: { web: true, mobile: true },
  afterBell: true,
  seo: {
    title: "School calendar & tour scheduling for microschools",
    description:
      "Post school events for all families or one program. Open tour, interview and shadow-day times, and let MudKitchen email the reminders. Web, iPhone and Android.",
  },
  hero: {
    lead: "The school calendar and every visit,",
    accent: "in one schedule.",
    body: "Post field trips and no-school days for the families who need them. Open slots for tours, interviews and shadow days, and MudKitchen emails the reminders. Families and teachers see it on their phones.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      { title: "Events for the right families", body: "Post an event for the whole school or one program, with time, place, type and color." },
      { title: "Families book their own tours", body: "Open time slots for tours and interviews. Families pick one, and it shows up under All visits." },
      { title: "Shadow days, built in", body: "Choose which school days are open for whole-day observation visits." },
      { title: "Reminders sent for you", body: "Families get an email the day before their visit. You get a Monday digest and a day-before summary." },
      { title: "Visits tied to applications", body: "Each visit links to the family's application, so you're ready when they walk in." },
      { title: "Share the pen", body: "Let teachers or chosen staff add events, or keep the calendar to admins." },
    ],
    family: [
      { title: "This month at a glance", body: "See school events by month or as a list, with your next event on the home page." },
      { title: "Add it to your calendar", body: "On the web, save any event to Apple, Google or Outlook Calendar, or copy the details." },
      { title: "Directions in one tap", body: "Open an event's address in Maps from the web or the app." },
      { title: "Book your visit", body: "Prospective families pick a tour, interview or shadow-day time and get a reminder email the day before." },
    ],
    staff: [
      { title: "Today on your dashboard", body: "Today's events show on your dashboard, so an assembly never catches you out." },
      { title: "Day, week or month", body: "Switch calendar views to plan the week ahead, on the web or in the app." },
      { title: "Add events when allowed", body: "If your admin gives you permission, add and edit school events from the web or app." },
    ],
  },
  useCases: [
    {
      title: "A no-school day",
      scenario: "The founder decides to close for a staff day next week.",
      outcome: "She adds a No school event for all families. It shows on every family's calendar and in their notification bell, and a Bulletin post sends the email.",
    },
    {
      title: "One program's field trip",
      scenario: "Only the upper-elementary program is visiting the nature center.",
      outcome: "The event goes to that program's families, who add it to their own calendar and open the address in Maps.",
    },
    {
      title: "Spring tour season",
      scenario: "Ten families want tours in March, and the founder teaches most mornings.",
      outcome: "She opens Tuesday and Thursday slots. Families book, get a reminder the day before, and she reads Monday's digest over coffee.",
    },
    {
      title: "A shadow day before enrolling",
      scenario: "An applicant wants to try a full school day before the family commits.",
      outcome: "The family picks an open shadow day, the visit links to their application, and the founder sees it under All visits.",
    },
  ],
  evidence: [
    { stat: "72%", claim: "of working mothers say it's their job to stay on top of their children's schedules.", source: BRIGHT_HORIZONS },
    {
      stat: "3×",
      claim: "Breadwinning mothers are three times as likely as breadwinning fathers to keep their children's schedules (76% vs 22%).",
      source: BRIGHT_HORIZONS,
    },
    { stat: "50%", claim: "of parents say a school's communication influenced their decision to enroll.", source: PARENTSQUARE },
  ],
  toolStack: {
    names: ["Google Calendar", "Calendly", "Google Forms"],
    logos: ["/images/competitors/Calendly.webp", "/images/competitors/GoogleForms.png"],
  },
  comparison: [
    {
      label: "School events calendar for families",
      mudkitchen: { value: "Yes, on the web and in the app", mark: "yes" },
      toolStack: { value: "Google Calendar embed", mark: "partial" },
      rivals: {
        brightwheel: { value: "Yes, organized by room", mark: "yes", source: BW_CALENDAR },
        playground: { value: "Yes", mark: "yes", source: PG_CALENDAR },
        "transparent-classroom": { value: "Via a connected Google Calendar", mark: "yes", source: TC_EVENTS },
      },
    },
    {
      label: "Events for one group only",
      mudkitchen: { value: "All families or one program", mark: "yes" },
      toolStack: { value: "A separate calendar per group", mark: "partial" },
      rivals: {
        brightwheel: { value: "By room", mark: "yes", source: BW_CALENDAR },
        playground: { value: "Everyone or specific groups", mark: "yes", source: PG_CALENDAR },
        "transparent-classroom": { value: "School or classroom calendar", mark: "yes", source: TC_HOME },
      },
    },
    {
      label: "RSVPs",
      mudkitchen: { value: "No", mark: "no" },
      toolStack: { value: "Google Forms or Calendly", mark: "partial" },
      rivals: {
        brightwheel: { value: "Through separate Sign-ups", mark: "partial", source: BW_SIGNUPS },
        playground: { value: "Yes, except on recurring events", mark: "yes", source: PG_CALENDAR },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HOME },
      },
    },
    {
      label: "Recurring events",
      mudkitchen: { value: "No; add each date", mark: "no" },
      toolStack: { value: "Yes", mark: "yes" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_CALENDAR },
        playground: { value: "Yes", mark: "yes", source: PG_CALENDAR },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_EVENTS },
      },
    },
    {
      label: "Sync to personal calendars",
      mudkitchen: { value: "Single events only (.ics, web)", mark: "partial" },
      toolStack: { value: "Yes", mark: "yes" },
      rivals: {
        brightwheel: { value: "Yes, Calendar Sharing", mark: "yes", source: BW_CALENDAR },
        playground: { value: "Subscribe to public events only", mark: "partial", source: PG_CALENDAR },
        "transparent-classroom": { value: "Through Google Calendar", mark: "yes", source: TC_EVENTS },
      },
    },
    {
      label: "Families book tours themselves",
      mudkitchen: { value: "Yes, from the apply dashboard or a public tour page", mark: "yes" },
      toolStack: { value: "Calendly or Acuity", mark: "yes" },
      rivals: {
        brightwheel: { value: "Yes; plan tier unconfirmed", mark: "yes", source: BW_CRM },
        playground: { value: "Yes, in CRM via your account manager", mark: "yes", source: PG_CRM },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HOME },
      },
    },
    {
      label: "Interviews and shadow days",
      mudkitchen: { value: "Yes, both", mark: "yes" },
      toolStack: { value: "Tracked by hand", mark: "no" },
      rivals: {
        brightwheel: { value: "Not listed", mark: "unknown", source: BW_CRM },
        playground: { value: "Custom meeting types; shadow days not listed", mark: "partial", source: PG_CRM },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HOME },
      },
    },
  ],
  faq: [
    {
      question: "Does it sync with Google or Apple Calendar?",
      answer:
        "There's no live sync today. On the web, families can add any single event to Apple, Google or Outlook Calendar. In the app they can copy or share an event's details and open the address in Maps.",
    },
    {
      question: "Are families notified about new events?",
      answer:
        "New events appear in families' notification bell and on their calendar, but no email or push is sent. For a closure or anything urgent, post it in Bulletin or Messages as well.",
    },
    {
      question: "Can families RSVP, or can I repeat an event?",
      answer: "Not today. School events don't take RSVPs or repeat on a schedule, so add each date on its own.",
    },
    {
      question: "Can prospective families book a tour without an account?",
      answer:
        "Yes, once we turn on the public tour page for your school. Families pick a slot and answer your intake questions. Applicants can also book tours, interviews and shadow days from their apply dashboard.",
    },
    {
      question: "Who gets visit reminders?",
      answer:
        "Families get an email the day before a tour, interview or shadow day. Admins get a weekly Monday digest of upcoming visits and a summary the day before. You can add extra recipients in Settings.",
    },
  ],
  related: ["admissions", "bulletin", "messages"],
};
