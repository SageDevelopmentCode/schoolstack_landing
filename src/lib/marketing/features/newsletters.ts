import { Newspaper } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/newsletters.md */

const PARENTSQUARE: Source = {
  label: "ParentSquare & Hanover Research parent study, via K-12 Dive",
  url: "https://www.k12dive.com/press-release/20261020-new-parentsquare-and-hanover-research-study-school-communication-shapes-wh/",
  year: "2026",
};
const GREATSCHOOLS: Source = {
  label: "GreatSchools parent survey, via Education Week",
  url: "https://www.edweek.org/leadership/what-parents-want-most-from-schools-clear-honest-communication/2025/12",
  year: "2025",
};
const SCHOOLSTATUS: Source = {
  label: "SchoolStatus 2024 School-Family Communications Report, via eSchool News",
  url: "https://www.eschoolnews.com/district-management/2024/04/10/school-home-communication-remains-challenge/",
  year: "2024",
};
const BW_NEWSLETTERS: Source = { label: "Brightwheel help: send newsletters", url: "https://help.mybrightwheel.com/en/articles/3400687-send-newsletters" };
const PG_COMMS: Source = { label: "Playground: communication", url: "https://tryplayground.com/solutions/communication" };
const TC_HOME: Source = { label: "Transparent Classroom feature list", url: "https://www.transparentclassroom.com/" };

export const newsletters: Feature = {
  slug: "newsletters",
  name: "Newsletters",
  icon: Newspaper,
  tint: "peach",
  oneLiner: "Guided weekly newsletters built from your school's own photos and stories.",
  roles: ["admin", "family", "staff"],
  roleLines: {
    admin: "Write the weekly newsletter from guided prompts and your school's photos.",
    family: "Get an alert and read each edition on your phone or computer.",
    staff: "Read every published edition, including the update about your class.",
  },
  platforms: { web: true, mobile: true },
  afterBell: true,
  seo: {
    title: "School newsletter builder for microschools",
    description:
      "Write a weekly school newsletter from guided prompts, add photos from your gallery and a note per teacher. Families get an email and app alert to read it.",
  },
  hero: {
    lead: "A weekly newsletter,",
    accent: "from prompts, not a blank page.",
    body: "Answer a few guided prompts, pick photos from your school's library and add a line for each teacher. Publish, and families get an email and app alert to read it on any phone.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      {
        title: "Prompts, not a blank page",
        body: "Guided blocks like Little discoveries, Looking ahead and An invitation for home tell you what to write.",
      },
      { title: "Photos already here", body: "Pick up to 30 photos and a cover from your school's photo library, or upload new ones." },
      { title: "A line for each teacher", body: "Add a short update for each teacher, listed from your staff roster." },
      { title: "Check before you publish", body: "A readiness list flags a missing title, week or content before families see it." },
      { title: "Restore an earlier version", body: "Version history keeps earlier copies, so you can roll back an edit that went wrong." },
      { title: "Take it anywhere", body: "Download HTML or text, or copy the text to paste into another tool." },
    ],
    family: [
      { title: "A link, not an attachment", body: "Get an email and an app notification with a Read newsletter button. No PDF to download." },
      { title: "Made for phones", body: "Each edition opens full-screen on your phone or computer." },
      { title: "Every past edition", body: "Older newsletters stay in your portal and app, so last month's dates are easy to find." },
      { title: "Something to try at home", body: "Editions can include an invitation for home that connects school learning to your evenings." },
    ],
    staff: [
      { title: "Read what families read", body: "Published newsletters appear in your portal and the app, so you know what families were told." },
      { title: "Your class in the story", body: "The founder adds a short update for each teacher, so every classroom is represented." },
    ],
  },
  useCases: [
    {
      title: "The Friday wrap-up",
      scenario: "The founder has one free period on Friday afternoon.",
      outcome: "She fills in the prompts, picks four photos from this week's uploads and publishes. Every family gets an email and an app alert.",
    },
    {
      title: "Field-trip photos",
      scenario: "Teachers uploaded the farm-trip photos to the school gallery on Tuesday.",
      outcome: "The founder picks the cover and the photo section from those uploads, with no downloading or re-uploading.",
    },
    {
      title: "A family joins in February",
      scenario: "A new family enrolls mid-year and wants to catch up.",
      outcome: "They open Newsletters in their portal and read back through January's editions. There's no mailing list to update.",
    },
    {
      title: "The wrong pickup time",
      scenario: "After publishing, the founder spots a mistake in Reminders.",
      outcome: "She returns the edition to draft, fixes the time and publishes again. Version history keeps the earlier copy.",
    },
  ],
  evidence: [
    { stat: "64%", claim: "of parents feel informed when schools share updates on their child's academic progress.", source: PARENTSQUARE },
    { stat: "Nearly 80%", claim: "of parents want clear information about their school's academic offerings.", source: GREATSCHOOLS },
    { stat: "45%", claim: "of families say school communications don't come often enough.", source: SCHOOLSTATUS },
  ],
  toolStack: {
    names: ["Canva or Google Docs", "Gmail", "Mailchimp"],
    logos: ["/images/competitors/GoogleDocs.png", "/images/competitors/Gmail.png"],
  },
  comparison: [
    {
      label: "Built-in newsletter builder",
      mudkitchen: { value: "Yes, with guided prompts", mark: "yes" },
      toolStack: { value: "Separate design and email tools", mark: "partial" },
      rivals: {
        brightwheel: { value: "Yes, sections editor", mark: "yes", source: BW_NEWSLETTERS },
        playground: { value: "Yes, drag-and-drop", mark: "yes", source: PG_COMMS },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HOME },
      },
    },
    {
      label: "Photos from the school's library",
      mudkitchen: { value: "Any gallery photo, up to 30", mark: "yes" },
      toolStack: { value: "Download and re-upload", mark: "no" },
      rivals: {
        brightwheel: { value: "Only photos logged to a child, one per section", mark: "partial", source: BW_NEWSLETTERS },
        playground: { value: "Images yes; library source unconfirmed", mark: "unknown", source: PG_COMMS },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HOME },
      },
    },
    {
      label: "Prompts for what to write",
      mudkitchen: { value: "Yes, guided story blocks", mark: "yes" },
      toolStack: { value: "Generic templates", mark: "partial" },
      rivals: {
        brightwheel: { value: "Not mentioned", mark: "unknown", source: BW_NEWSLETTERS },
        playground: { value: "Not listed", mark: "unknown", source: PG_COMMS },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HOME },
      },
    },
    {
      label: "Schedule send",
      mudkitchen: { value: "No; publishes when you click", mark: "no" },
      toolStack: { value: "Yes, in Mailchimp or Gmail", mark: "yes" },
      rivals: {
        brightwheel: { value: "Sends right away; scheduling not mentioned", mark: "unknown", source: BW_NEWSLETTERS },
        playground: { value: "Yes", mark: "yes", source: PG_COMMS },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HOME },
      },
    },
    {
      label: "Full newsletter inside the email",
      mudkitchen: { value: "No; the email links to it", mark: "no" },
      toolStack: { value: "Yes", mark: "yes" },
      rivals: {
        brightwheel: { value: "No; read in the app as a message", mark: "no", source: BW_NEWSLETTERS },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_COMMS },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HOME },
      },
    },
    {
      label: "Past editions for families",
      mudkitchen: { value: "Yes, in the portal and app", mark: "yes" },
      toolStack: { value: "Scattered across inboxes", mark: "no" },
      rivals: {
        brightwheel: { value: "In each student's message thread", mark: "partial", source: BW_NEWSLETTERS },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_COMMS },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_HOME },
      },
    },
  ],
  faq: [
    {
      question: "Do families get the newsletter by email?",
      answer:
        "They get an email saying a new newsletter is out, with a Read newsletter button, plus a push notification in the app. The newsletter itself opens in the parent portal on any phone or computer.",
    },
    {
      question: "Can I use photos teachers already uploaded?",
      answer:
        "Yes. Pick photos and a cover image from your school's photo library, or upload new ones. Each photo can have a short caption.",
    },
    {
      question: "Can I write the newsletter on my phone?",
      answer:
        "Not yet. The builder is on the web. Families and staff read published editions on the web and in the MudKitchen app on iPhone and Android.",
    },
    {
      question: "Can I schedule a newsletter?",
      answer: "Not today. Newsletters publish when you click Publish. Keep an edition in draft until you're ready.",
    },
    {
      question: "Can I send it through Mailchimp instead?",
      answer:
        "You can download the newsletter as HTML or text, or copy the text, and use it elsewhere. The HTML is a standalone page, not an email template, so check the formatting in your email tool.",
    },
  ],
  related: ["photos", "bulletin", "messages"],
};
