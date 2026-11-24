import { Clock } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/staff-hours.md */

const DOL_FS21: Source = {
  label: "U.S. Department of Labor, Fact Sheet #21: Recordkeeping under the FLSA",
  url: "https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping",
  year: "2008",
};
const QB_TIME: Source = {
  label: "QuickBooks Time survey of 731 U.S. business owners",
  url: "https://quickbooks.intuit.com/time-tracking/resources/avoiding-timesheet-errors/",
  year: "2018",
};
const BW_CHECKIN: Source = { label: "Brightwheel help: check in and out as staff", url: "https://help.mybrightwheel.com/en/articles/1445626-check-in-and-out-as-staff" };
const BW_TIMECARDS: Source = { label: "Brightwheel help: add and manage staff timecards", url: "https://help.mybrightwheel.com/en/articles/1546574-add-manage-staff-timecards" };
const PG_TEACHERS: Source = { label: "Playground help: staff hours for teachers", url: "https://help.tryplayground.com/en/articles/9441159-staff-hours-for-teachers" };
const PG_MANAGE: Source = { label: "Playground help: manage and edit staff attendance", url: "https://help.tryplayground.com/en/articles/9376492-manage-edit-staff-attendance" };
const TC_PRICING: Source = { label: "Transparent Classroom pricing", url: "https://www.transparentclassroom.com/pricing" };
const TC_ATTENDANCE: Source = { label: "Transparent Classroom help: attendance overview", url: "https://transparent-classroom.helpscoutdocs.com/article/77-attendance-overview" };

export const staffHours: Feature = {
  slug: "staff-hours",
  name: "Timeclock & staff hours",
  icon: Clock,
  tint: "butter",
  oneLiner: "A simple time clock for your team, with approvals built in.",
  roles: ["admin", "staff"],
  roleLines: {
    admin: "See who's clocked in, approve hour fixes, and check totals for any range.",
    staff: "Clock in and out from your phone, and fix a missed punch yourself.",
  },
  platforms: { web: true, mobile: true },
  seo: {
    title: "Staff time clock & hours for microschools",
    description:
      "Staff clock in and out on the web or in the app and send fixes for missed punches. You approve them, see who's on the clock and check totals.",
  },
  hero: {
    lead: "Staff hours that add up,",
    accent: "without the timesheet chase.",
    body: "Staff clock in and out on the web or in the app. Missed a punch? They send a fix for you to approve. See who's on the clock and everyone's totals for any dates.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      { title: "Who's on the clock", body: "See everyone clocked in right now, how long they've been working, and who finished today." },
      { title: "Totals for any range", body: "Pick this week, the last 30 days or your own dates, and see hours for each staff member." },
      { title: "Approve every fix", body: "When staff change a past day, you see current and proposed hours side by side, then approve or deny." },
      { title: "Your approval rule", body: "Require approval for hour changes, or let them save right away. Switch it anytime in Staff hours." },
      { title: "An email when needed", body: "Get an email with a direct link when a change is waiting for you." },
      { title: "Review from your phone", body: "Check who's clocked in and approve changes in the MudKitchen app." },
    ],
    staff: [
      { title: "Clock in with one tap", body: "Clock in when your day starts and out when it ends, on the web or in the app on iPhone and Android." },
      { title: "Split days are fine", body: "Log several sessions in one day, like a morning block and after-school care." },
      { title: "Your week and month", body: "See your hours by day, week and month, with a running total for the week." },
      { title: "Fix a forgotten punch", body: "Add hours you missed or correct a past day, with a note explaining why." },
      { title: "Know when it's approved", body: "Get a notification in the MudKitchen app when your school approves or denies your change." },
    ],
  },
  useCases: [
    {
      title: "The aide who forgot to clock out",
      scenario: "An aftercare aide leaves at 5:30, but the next morning the clock still says she's working.",
      outcome: "She opens My Hours, clocks out and fixes yesterday with a note. The founder approves it from her phone.",
    },
    {
      title: "Totals for two part-time assistants",
      scenario: "Every two weeks the founder needs each assistant's hours.",
      outcome: "She picks the dates in the summary and reads each person's total, instead of adding up a paper sheet.",
    },
    {
      title: "Is anyone in yet?",
      scenario: "The founder is at a meeting across town at 7:45 am.",
      outcome: "The live view in the app shows which staff have clocked in.",
    },
    {
      title: "A question about last month",
      scenario: "A former assistant asks about their hours from last month.",
      outcome: "Every session is on file, and every approved or denied change shows the original and proposed times.",
    },
  ],
  evidence: [
    {
      stat: "Every day",
      claim: "Employers must record hours worked each day and each workweek for every non-exempt worker, under U.S. labor law.",
      source: DOL_FS21,
    },
    {
      stat: "2 years",
      claim: "is how long the Department of Labor says time cards behind wage calculations should be kept.",
      source: DOL_FS21,
    },
    {
      stat: "34%",
      claim: "of business owners surveyed say staff forgetting to clock in or out is their biggest timesheet problem.",
      source: QB_TIME,
    },
  ],
  toolStack: {
    names: ["Paper timesheets", "Google Sheets", "Homebase"],
    logos: ["/images/competitors/GoogleSheets.png"],
  },
  comparison: [
    {
      label: "Staff clock in and out",
      mudkitchen: { value: "Yes, web or the app, own login", mark: "yes" },
      toolStack: { value: "Paper, a sheet or a separate app", mark: "partial" },
      rivals: {
        brightwheel: { value: "Kiosk, QR or Attendance Mode", mark: "yes", source: BW_CHECKIN },
        playground: { value: "App QR code or tablet PIN", mark: "yes", source: PG_TEACHERS },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_PRICING },
      },
    },
    {
      label: "Staff request a fix themselves",
      mudkitchen: { value: "Yes, with a note", mark: "yes" },
      toolStack: { value: "Text the owner", mark: "no" },
      rivals: {
        brightwheel: { value: "No, staff message the admin", mark: "no", source: BW_CHECKIN },
        playground: { value: "No, staff contact the admin", mark: "no", source: PG_TEACHERS },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_ATTENDANCE },
      },
    },
    {
      label: "Approve or deny changes",
      mudkitchen: { value: "Yes, optional setting", mark: "yes" },
      toolStack: { value: "Anyone can edit the sheet", mark: "no" },
      rivals: {
        brightwheel: { value: "Admin edits directly, with audit history", mark: "partial", source: BW_TIMECARDS },
        playground: { value: "Admin edits directly, with edit history", mark: "partial", source: PG_MANAGE },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_PRICING },
      },
    },
    {
      label: "Live view of who's clocked in",
      mudkitchen: { value: "Yes, on the web and in the app", mark: "yes" },
      toolStack: { value: "No", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_TIMECARDS },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_MANAGE },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_PRICING },
      },
    },
    {
      label: "Totals per person for a date range",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Add it up by hand", mark: "partial" },
      rivals: {
        brightwheel: { value: "Yes; custom ranges up to 180 days", mark: "yes", source: BW_TIMECARDS },
        playground: { value: "Yes, staff hours reports", mark: "yes", source: PG_MANAGE },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_PRICING },
      },
    },
    {
      label: "Overtime calculation",
      mudkitchen: { value: "No", mark: "no" },
      toolStack: { value: "By hand", mark: "no" },
      rivals: {
        brightwheel: { value: "Yes", mark: "yes", source: BW_TIMECARDS },
        playground: { value: "Yes, daily and weekly", mark: "yes", source: PG_MANAGE },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_PRICING },
      },
    },
    {
      label: "Export hours to a file",
      mudkitchen: { value: "Not yet", mark: "no" },
      toolStack: { value: "Already a spreadsheet", mark: "yes" },
      rivals: {
        brightwheel: { value: "Yes", mark: "yes", source: BW_TIMECARDS },
        playground: { value: "Yes, CSV and PDF reports", mark: "yes", source: PG_MANAGE },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_PRICING },
      },
    },
  ],
  faq: [
    {
      question: "Do teachers need a separate time-clock app?",
      answer:
        "No. Clocking in is part of the staff portal they already use for students, messages and the calendar, on the web and in the MudKitchen app.",
    },
    {
      question: "What happens when someone forgets to clock in?",
      answer:
        "They open My Hours, pick the day and add the hours they worked, with an optional note. If your school requires approval, the change waits for you. Otherwise it saves right away.",
    },
    {
      question: "Can I approve changes from my phone?",
      answer:
        "Yes. Pending changes show up in the app and on the web, with the current and proposed times side by side. You also get an email with a link to the request.",
    },
    {
      question: "Can a day have more than one session?",
      answer: "Yes. Staff can clock in and out more than once a day, for example around a lunch break or a split shift.",
    },
    {
      question: "Can I export hours or track overtime?",
      answer:
        "Not yet. MudKitchen records each session and shows totals per person for any date range. There's no export file, overtime calculation or time-off request today.",
    },
  ],
  related: ["staff", "attendance", "mobile-app"],
};
