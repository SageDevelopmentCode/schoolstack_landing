import { CalendarCheck } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/attendance.md */

const FL_REGISTER: Source = { label: "Florida Statutes s. 1003.23(2), attendance records", url: "https://m.flsenate.gov/Statutes/1003.23", year: "2026" };
const AZ_PRIVATE: Source = { label: "Arizona Revised Statutes 15-802(G)(3)", url: "https://www.azleg.gov/ars/15/00802.htm" };
const BW_PRICING: Source = { label: "Brightwheel pricing page", url: "https://mybrightwheel.com/pricing/" };
const BW_CONTACTS: Source = { label: "Brightwheel help: add and invite student contacts", url: "https://help.mybrightwheel.com/en/articles/1161612-add-and-invite-student-contacts" };
const PG_ATTENDANCE: Source = { label: "Playground help: attendance overview", url: "https://help.tryplayground.com/en/articles/16111397-attendance-overview" };
const PG_GUARDIANS: Source = { label: "Playground help: add and manage guardians", url: "https://help.tryplayground.com/en/articles/6460616-add-manage-guardians-as-a-family" };
const PG_NOTIFY: Source = {
  label: "Playground changelog: check-in and out notifications",
  url: "https://www.tryplayground.com/changelog/settings-revamp-update-billing-plans-check-in-and-out-notifications",
  year: "2025",
};
const TC_ATTENDANCE: Source = { label: "Transparent Classroom help: attendance overview", url: "https://transparent-classroom.helpscoutdocs.com/article/77-attendance-overview" };
const TC_CHILDREN: Source = { label: "Transparent Classroom help: Children page", url: "https://transparent-classroom.helpscoutdocs.com/article/21-children-page" };

export const attendance: Feature = {
  slug: "attendance",
  name: "Attendance",
  icon: CalendarCheck,
  tint: "mint",
  oneLiner: "Daily roll call and pickup, recorded once and shared with families.",
  roles: ["admin", "staff", "family"],
  roleLines: {
    admin: "Today's roll and every pickup on record, with a history for each child.",
    staff: "Take roll and record pickups from the classroom, on a laptop or phone.",
    family: "Get a notification when your child arrives and when they're picked up.",
  },
  platforms: { web: true, mobile: true },
  seo: {
    title: "Attendance & pickup tracking for microschools",
    description:
      "Mark students present or absent, record who picked each child up from the family's list, and notify parents. On the web and in the MudKitchen app.",
  },
  hero: {
    lead: "Know who's here,",
    accent: "and who took them home.",
    body: "Mark each child present or absent from a laptop or the MudKitchen app. At pickup, choose the adult from the family's list. Parents get a notification, and every day stays on file.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      { title: "Today at a glance", body: "Present, absent, not marked and picked up, counted for today. Tap a number to see exactly who." },
      { title: "Pickup with a name", body: "Record who collected each child, chosen from parents on file or the family's authorized pickup list." },
      { title: "Fix a missed day", body: "Step back to any past day to mark or correct it. Each mark keeps the time and who recorded it." },
      { title: "History for each child", body: "Open a student to see each day's status and times, who picked them up and who recorded it." },
      { title: "Only the programs you track", body: "We can turn attendance on per program for your school, so drop-in or enrichment students stay off the roster." },
    ],
    staff: [
      { title: "Guided roll call", body: "On the web, go through the class one child at a time, with a strip showing who's left to mark." },
      { title: "Mark from your phone", body: "Mark present, absent or picked up from the classroom floor in the MudKitchen app on iPhone and Android." },
      { title: "Pickup from the family's list", body: "At pickup, choose from the parents on file and the adults the family has added, then confirm." },
      { title: "Search the roster", body: "In the app, find a student by name and see how many are left to mark." },
    ],
    family: [
      { title: "Know they arrived", body: "Get a notification in the MudKitchen app when your child is marked present for the day." },
      { title: "Know who picked up", body: "The pickup notification names the adult who collected your child." },
      { title: "Your child's record", body: "See the latest day, recent weeks and full history, including who recorded each day." },
      { title: "You set the pickup list", body: "Add grandparents, sitters or carpool parents. They don't need a MudKitchen account." },
    ],
  },
  useCases: [
    {
      title: "Morning roll call with one adult",
      scenario: "The founder is greeting families at the door while the class settles in.",
      outcome: "She opens the roster in the app, taps through each child, and parents get an arrival notification without a single text.",
    },
    {
      title: "Grandma's first pickup",
      scenario: "A grandmother arrives at 3:15 and the teacher has never met her.",
      outcome: "The teacher opens Record Pickup, finds her on the family's authorized list, confirms, and the parents get a notification with her name.",
    },
    {
      title: "Someone asks how many days a student attended",
      scenario: "A funder or reviewer asks about one student's attendance this term.",
      outcome: "The founder opens that student's history and reads it day by day, with times and who recorded each mark.",
    },
    {
      title: "A forgotten Friday",
      scenario: "Nobody marked attendance on a busy field-trip day.",
      outcome: "On Monday the admin steps back to Friday and marks it. The record shows who entered it and when.",
    },
  ],
  evidence: [
    {
      stat: "FL law",
      claim: "Florida's enrollment register must show each student's attendance or absence for every school day, private schools included.",
      source: FL_REGISTER,
    },
    {
      stat: "On request",
      claim: "Florida's attendance register must be open to inspection by the district superintendent or a designated school representative.",
      source: FL_REGISTER,
    },
    {
      stat: "AZ law",
      claim: "Arizona defines a private school as one that teaches at least as many days and hours a year as a public school.",
      source: AZ_PRIVATE,
    },
  ],
  toolStack: {
    names: ["Paper sign-in sheet", "Google Sheets", "Group texts"],
    logos: ["/images/competitors/GoogleSheets.png"],
  },
  comparison: [
    {
      label: "Mark present and absent",
      mudkitchen: { value: "Yes, on the web and in the app", mark: "yes" },
      toolStack: { value: "Paper sheet, then a spreadsheet", mark: "partial" },
      rivals: {
        brightwheel: { value: "Yes, check-in and out", mark: "yes", source: BW_PRICING },
        playground: { value: "Checked in, checked out or absent", mark: "yes", source: PG_ATTENDANCE },
        "transparent-classroom": { value: "Yes, P/A/T buttons", mark: "yes", source: TC_ATTENDANCE },
      },
    },
    {
      label: "Pickup chosen from an approved list",
      mudkitchen: { value: "Parents on file or the family's pickup list", mark: "yes" },
      toolStack: { value: "A name on a sheet, no check", mark: "no" },
      rivals: {
        brightwheel: { value: "Approved Pickup contact type", mark: "yes", source: BW_CONTACTS },
        playground: { value: "Authorized Pickup guardian type", mark: "yes", source: PG_GUARDIANS },
        "transparent-classroom": { value: "Approved Adults on file; pickup check unconfirmed", mark: "unknown", source: TC_CHILDREN },
      },
    },
    {
      label: "Parents notified at arrival and pickup",
      mudkitchen: { value: "Yes, in the app", mark: "yes" },
      toolStack: { value: "Only if someone texts", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_PRICING },
        playground: { value: "Yes, check-in and out notifications", mark: "yes", source: PG_NOTIFY },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_ATTENDANCE },
      },
    },
    {
      label: "Attendance history per student",
      mudkitchen: { value: "Day by day, with who recorded it", mark: "yes" },
      toolStack: { value: "Scroll the spreadsheet", mark: "partial" },
      rivals: {
        brightwheel: { value: "Attendance reporting listed", mark: "yes", source: BW_PRICING },
        playground: { value: "Yes, attendance reports", mark: "yes", source: PG_ATTENDANCE },
        "transparent-classroom": { value: "Yes, Attendance Report", mark: "yes", source: TC_ATTENDANCE },
      },
    },
    {
      label: "Late / tardy status",
      mudkitchen: { value: "No: present, absent and picked up", mark: "no" },
      toolStack: { value: "Add a column", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_PRICING },
        playground: { value: "Not mentioned", mark: "unknown", source: PG_ATTENDANCE },
        "transparent-classroom": { value: "Yes, a T state", mark: "yes", source: TC_ATTENDANCE },
      },
    },
    {
      label: "Parents check in themselves",
      mudkitchen: { value: "No, staff mark attendance", mark: "no" },
      toolStack: { value: "Parent signs the sheet", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_PRICING },
        playground: { value: "Kiosk QR or PIN, or contactless", mark: "yes", source: PG_ATTENDANCE },
        "transparent-classroom": { value: "Drop-off page with e-signature", mark: "yes", source: TC_ATTENDANCE },
      },
    },
    {
      label: "Export attendance to a file",
      mudkitchen: { value: "Not yet", mark: "no" },
      toolStack: { value: "Already a spreadsheet", mark: "yes" },
      rivals: {
        brightwheel: { value: "Reporting listed; export unconfirmed", mark: "unknown", source: BW_PRICING },
        playground: { value: "Yes, export or print", mark: "yes", source: PG_ATTENDANCE },
        "transparent-classroom": { value: "Export not mentioned", mark: "unknown", source: TC_ATTENDANCE },
      },
    },
  ],
  faq: [
    {
      question: "Can parents see attendance?",
      answer:
        "Yes. Families see their child's latest day, recent weeks and full history on the web and in the MudKitchen app. In the app they also get a notification when their child is marked present and when they're picked up.",
    },
    {
      question: "How does pickup work?",
      answer:
        "Staff tap Record Pickup and choose the adult from the family's parents on file or their authorized pickup list. Families keep that list up to date themselves, and the people on it don't need a MudKitchen account.",
    },
    {
      question: "Can teachers take attendance, or only the office?",
      answer:
        "Both. Teachers have an Attendance page with guided roll call on the web, and the same roster in the MudKitchen app. Every mark records who made it and when.",
    },
    {
      question: "Can families check in or report an absence themselves?",
      answer:
        "Not today. Staff mark each child present or absent from the web or the app, and families see each day's mark in their portal.",
    },
    {
      question: "Can I export attendance or mark a student late?",
      answer:
        "Not yet. Attendance records present, absent and picked up, with times and who recorded each mark, and you can read any student's history day by day. There's no late status or export file today.",
    },
  ],
  related: ["students", "classrooms", "mobile-app"],
};
