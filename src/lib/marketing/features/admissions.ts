import { ClipboardList } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/admissions.md */

const MANIFEST: Source = { label: "The Manifest, online form abandonment survey", url: "https://themanifest.com/web-design/6-steps-avoiding-online-form-abandonment", year: "2018" };
const EDCHOICE: Source = { label: "EdChoice, The State of Microschooling", url: "https://www.edchoice.org/the-state-of-microschooling/", year: "2025" };
const GREATSCHOOLS: Source = {
  label: "GreatSchools national parent survey",
  url: "https://blog.greatschools.org/2025/12/09/new-national-survey-finds-parents-want-clearer-school-information-and-are-more-satisfied-when-they-can-find-it/",
  year: "2025",
};
const BW_ADMISSIONS: Source = { label: "Brightwheel help: admissions features", url: "https://help.mybrightwheel.com/en/articles/6143589-overview-of-brightwheel-admissions-features" };
const BW_ENROLL: Source = { label: "Brightwheel: enrollment & registration", url: "https://mybrightwheel.com/childcare-enrollment-registration/" };
const BW_CRM: Source = { label: "Brightwheel: CRM & enrollment", url: "https://mybrightwheel.com/crm-and-enrollment-forecasting/" };
const BW_BILLING: Source = { label: "Brightwheel: billing", url: "https://mybrightwheel.com/features/billing" };
const PG_HELP: Source = { label: "Playground help: enrollment overview", url: "https://help.tryplayground.com/en/articles/9702730-enrollment-overview" };
const PG_ENROLL: Source = { label: "Playground: enrollment", url: "https://www.tryplayground.com/solutions/enrollment" };
const PG_BILLING: Source = { label: "Playground: billing", url: "https://www.tryplayground.com/solutions/billing" };
const TC_APPS: Source = { label: "Transparent Classroom help: applications", url: "https://transparent-classroom.helpscoutdocs.com/article/52-applications-overview" };
const TC_FEE: Source = { label: "Transparent Classroom help: application fees", url: "https://transparent-classroom.helpscoutdocs.com/article/57-collecting-an-application-fee" };
const TC_ACCEPT: Source = { label: "Transparent Classroom help: accepting applications", url: "https://transparent-classroom.helpscoutdocs.com/article/56-accepting-applications" };
const TC_PRICING: Source = { label: "Transparent Classroom pricing", url: "https://www.transparentclassroom.com/pricing" };

export const admissions: Feature = {
  slug: "admissions",
  name: "Admissions & enrollment",
  icon: ClipboardList,
  tint: "peach",
  oneLiner: "Applications, visits, agreements and fees, tracked from inquiry to enrolled.",
  roles: ["admin", "family"],
  roleLines: {
    admin: "One pipeline from application to enrolled, with fees, visits and agreements built in.",
    family: "Apply at your own pace, book a visit, and finish enrollment from one checklist.",
  },
  platforms: { web: true, mobile: true },
  seo: {
    title: "Admissions & enrollment software for microschools",
    description:
      "Publish your application, take fees, let families book tours and shadow days, accept families and send the enrollment checklist and agreement, all in one pipeline.",
  },
  hero: {
    lead: "From first click to enrolled,",
    accent: "in one place.",
    body: "Publish your application, take fees, book tours, review and accept families, then send the enrollment checklist and agreement. Enrolled families move straight into billing and the parent portal.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      { title: "Build your apply form", body: "Add steps, custom questions and acknowledgments, then publish one link for your website, emails and posts." },
      { title: "Take application fees", body: "Turn on an optional fee. Families pay by card or bank through Stripe before they submit." },
      { title: "Let families book visits", body: "Open tour, interview and shadow-day times. Families pick a slot and get a reminder the day before." },
      { title: "Review every application", body: "See status, contact details and progress in one list. Accept or decline, even from your phone." },
      { title: "Send the enrollment checklist", body: "Send forms, uploads, fees and the agreement to sign in one go, and see what's still missing." },
      { title: "Nudge unfinished families", body: "Families with a half-finished application or checklist get reminder emails after three days and after a week." },
    ],
    family: [
      { title: "Apply at your own pace", body: "Start the application, save a draft and come back later from any browser." },
      { title: "Book a visit yourself", body: "Choose a tour, interview or shadow day from the open times after you apply." },
      { title: "One checklist to enroll", body: "Health forms, documents, fees and the agreement, one item at a time, with progress you can see." },
      { title: "Both parents included", body: "A second parent or guardian gets their own sign-in to help finish enrollment." },
      { title: "Pay fees online", body: "Pay by card or bank, with any processing fee shown before you pay." },
    ],
  },
  useCases: [
    {
      title: "Open-house week",
      scenario: "A founder shares one apply link and the tour page in a newsletter and on Instagram.",
      outcome: "Tour bookings and applications land in one list with contact details, instead of in DMs and a spreadsheet.",
    },
    {
      title: "A yes in the pickup line",
      scenario: "A shadow day goes well and the founder wants to say yes the same afternoon.",
      outcome: "She opens the application on her phone and accepts it, then sends the enrollment checklist from her laptop that evening.",
    },
    {
      title: "The half-finished application",
      scenario: "A parent starts the form at 10 pm and never comes back.",
      outcome: "MudKitchen emails a reminder after three days and again after a week, and the founder can see the draft in the meantime.",
    },
    {
      title: "Two agreements, one school",
      scenario: "Most families sign the standard agreement, but one needs a different version.",
      outcome: "The founder picks the right version when starting enrollment, and the family signs it inside their checklist.",
    },
  ],
  evidence: [
    { stat: "81%", claim: "of people have abandoned an online form after starting to fill it out.", source: MANIFEST },
    { stat: "22", claim: "students is the median private microschool, so the founder usually is the admissions office.", source: EDCHOICE },
    { stat: "74%", claim: "of parents who'd recommend their school say information is easy to find there, against 20% of those who wouldn't.", source: GREATSCHOOLS },
  ],
  toolStack: {
    names: ["Google Forms", "Google Sheets", "Calendly", "DocuSign"],
    logos: ["/images/competitors/GoogleForms.png", "/images/competitors/GoogleSheets.png", "/images/competitors/Calendly.webp", "/images/competitors/DocuSign.png"],
  },
  comparison: [
    {
      label: "Online application, save and finish later",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Depends on the family's Google sign-in", mark: "partial" },
      rivals: {
        brightwheel: { value: "Digital forms; saving a draft unconfirmed", mark: "partial", source: BW_ADMISSIONS },
        playground: { value: "Yes, save and exit anytime", mark: "yes", source: PG_HELP },
        "transparent-classroom": { value: "Online applications", mark: "yes", source: TC_APPS },
      },
    },
    {
      label: "Application fee in the same flow",
      mudkitchen: { value: "Yes, card or bank through Stripe", mark: "yes" },
      toolStack: { value: "Separate Venmo or PayPal request", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_ENROLL },
        playground: { value: "Yes", mark: "yes", source: PG_ENROLL },
        "transparent-classroom": { value: "Third-party payment button", mark: "partial", source: TC_FEE },
      },
    },
    {
      label: "Families book tours themselves",
      mudkitchen: { value: "Tours, interviews and shadow days", mark: "yes" },
      toolStack: { value: "Add Calendly", mark: "partial" },
      rivals: {
        brightwheel: { value: "Yes, through its CRM", mark: "yes", source: BW_CRM },
        playground: { value: "Yes, tours", mark: "yes", source: PG_ENROLL },
        "transparent-classroom": { value: "Not listed", mark: "unknown", source: TC_APPS },
      },
    },
    {
      label: "Accept and decline pipeline",
      mudkitchen: { value: "Yes, on the web, iPhone and Android", mark: "yes" },
      toolStack: { value: "A status column you update by hand", mark: "partial" },
      rivals: {
        brightwheel: { value: "Yes, admissions dashboard", mark: "yes", source: BW_ADMISSIONS },
        playground: { value: "Yes, enrollment funnel", mark: "yes", source: PG_HELP },
        "transparent-classroom": { value: "Yes, application states", mark: "yes", source: TC_ACCEPT },
      },
    },
    {
      label: "Family waitlist",
      mudkitchen: { value: "Program status only", mark: "partial" },
      toolStack: { value: "Manual list", mark: "partial" },
      rivals: {
        brightwheel: { value: "Yes, waitlist tab", mark: "yes", source: BW_ADMISSIONS },
        playground: { value: "Yes", mark: "yes", source: PG_HELP },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_APPS },
      },
    },
    {
      label: "Reminders for unfinished applications",
      mudkitchen: { value: "Yes, after 3 days and a week", mark: "yes" },
      toolStack: { value: "Manual email", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_ADMISSIONS },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_HELP },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_APPS },
      },
    },
    {
      label: "Enrolled family flows into billing",
      mudkitchen: { value: "Yes, and into the parent portal", mark: "yes" },
      toolStack: { value: "Copy into another tool", mark: "no" },
      rivals: {
        brightwheel: { value: "Yes", mark: "yes", source: BW_BILLING },
        playground: { value: "Yes", mark: "yes", source: PG_BILLING },
        "transparent-classroom": { value: "Billing not on its pricing page", mark: "unknown", source: TC_PRICING },
      },
    },
  ],
  faq: [
    {
      question: "Can families apply from their phone?",
      answer:
        "Yes, in any mobile browser through your apply link. The MudKitchen app is for families who are already enrolled. Before that, it sends them to the web to finish applying.",
    },
    {
      question: "Can I charge an application fee?",
      answer:
        "Yes. Set the label and amount in the apply form builder. Families pay by card or bank account through Stripe, which you connect once under Payments.",
    },
    {
      question: "What do families complete after I accept them?",
      answer:
        "Your enrollment checklist: forms, document uploads, fees, acknowledgments and the enrollment agreement. When it's done, mark the student enrolled and the full parent portal opens.",
    },
    {
      question: "What if the paperwork was done on paper?",
      answer: "Use Mark as enrolled. You can complete every checklist step at once, or enroll the student without changing the checklist.",
    },
    {
      question: "Do tours and shadow days connect to applications?",
      answer: "Yes. Families book them from their apply dashboard after they submit. Visits show up in your schedule and link back to the application.",
    },
  ],
  related: ["tuition-billing", "forms-documents", "calendar"],
};
