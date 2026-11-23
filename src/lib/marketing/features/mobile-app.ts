import { Smartphone } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/mobile-app.md */

const PEW: Source = { label: "Pew Research Center, Mobile Fact Sheet", url: "https://www.pewresearch.org/internet/fact-sheet/mobile/", year: "2026" };
const SCHOOLCEO: Source = { label: "SchoolCEO (Apptegy), What Parents Want", url: "https://www.apptegy.com/schoolceo/what-parents-want/", year: "2025" };
const BW_APP: Source = { label: "Brightwheel on the App Store", url: "https://apps.apple.com/app/id902823296" };
const PG_HOME: Source = { label: "Playground home page", url: "https://www.tryplayground.com/" };
const PG_GUARDIAN: Source = { label: "Playground help: guardian app overview", url: "https://help.tryplayground.com/en/articles/5356813-guardian-app-overview" };
const PG_BRANDED: Source = { label: "Playground: branded app", url: "https://www.tryplayground.com/solutions/branded-app" };
const TC_APP: Source = {
  label: "Transparent Classroom help: sharing with parents in the mobile app",
  url: "https://transparent-classroom.helpscoutdocs.com/article/40-share-with-parents-using-our-mobile-app",
};
const TC_ONESPOT: Source = {
  label: "Transparent Classroom help: Onespot partnership",
  url: "https://transparent-classroom.helpscoutdocs.com/article/452-onespot-transparent-classroom-partnership",
};

export const mobileApp: Feature = {
  slug: "mobile-app",
  name: "The MudKitchen app",
  icon: Smartphone,
  tint: "mint",
  oneLiner: "One app on iPhone and Android for families, teachers and admins.",
  roles: ["family", "staff", "admin"],
  roleLines: {
    family: "Pay tuition, message teachers and see what's next on iPhone or Android.",
    staff: "Take attendance, clock in and message families from the classroom floor.",
    admin: "Review applications, answer messages and check the day away from your desk.",
  },
  platforms: { web: false, mobile: true },
  seo: {
    title: "The MudKitchen app for microschools: iPhone and Android",
    description:
      "One app on iPhone and Android for families, teachers and admins: tuition, messages, attendance, photos and applications, with your school's logo and colors.",
  },
  hero: {
    lead: "Your whole school,",
    accent: "in one app, on iPhone and Android.",
    body: "Families pay tuition, message teachers and see what's next. Teachers take attendance and clock in. You review applications and check the day at a glance. Inside, it carries your school's logo and colors.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    family: [
      { title: "Pay tuition on your phone", body: "See your balance, pay by card or bank, turn on autopay and keep your receipts." },
      { title: "Message teachers directly", body: "Real conversations with teachers and the school office, with photos and files, not lost in email." },
      { title: "Know what's next", body: "Start-here to-dos and upcoming events on your home screen, with bulletin posts and newsletters a tap away." },
      { title: "Alerts that matter", body: "A push alert when your child is marked present or picked up, or when new photos are posted." },
      { title: "Forms and records", body: "Sign school forms and check your child's health information and authorized pickup from your phone." },
    ],
    staff: [
      { title: "Attendance on the floor", body: "Mark students present from the roster, with a count of who's left to mark." },
      { title: "Clock in and out", body: "Track your hours, see your week, and fix past days." },
      { title: "Every student's details", body: "Student profiles and details in My Students, ready when you need them." },
      { title: "Share the day", body: "Upload class photos and message families without giving out your number." },
    ],
    admin: [
      { title: "Applications on the go", body: "Review new applications, accept or decline, and mark students enrolled from your phone." },
      { title: "The day at a glance", body: "Setup progress, recent activity and today's staff hours on one dashboard." },
      { title: "Answer from anywhere", body: "Reply to families and staff, and check attendance, the bulletin and the schedule wherever you are." },
      { title: "Payments as they land", body: "Check transactions without opening a laptop." },
    ],
  },
  useCases: [
    {
      title: "Drop-off",
      scenario: "A teacher marks the roster on her phone as children arrive.",
      outcome: "Parents get a push that their child is marked present, and the founder sees attendance without walking the building.",
    },
    {
      title: "Tuition due tomorrow",
      scenario: "A parent gets the email reminder while waiting in the pickup line.",
      outcome: "She opens the app, pays by bank account and turns on autopay. The receipt is in the app.",
    },
    {
      title: "Field-trip photos",
      scenario: "A teacher uploads photos from the farm visit.",
      outcome: "Families get a push that new photos are posted and see them in the app, with no shared-drive link.",
    },
    {
      title: "An application at 9 pm",
      scenario: "A family applies after a tour.",
      outcome: "The founder reads the answers and the fee payment on her phone that night, and accepts the family the next morning.",
    },
  ],
  evidence: [
    { stat: "97%", claim: "of U.S. adults aged 30 to 49, the age of most school parents, own a smartphone.", source: PEW },
    { stat: "Nearly half", claim: "of families say they've downloaded their school's app and use it regularly.", source: SCHOOLCEO },
    { stat: "2%", claim: "of parents chose social media as their preferred way to hear from school, so a Facebook group can't replace an app.", source: SCHOOLCEO },
  ],
  toolStack: {
    names: ["Group texts", "Email", "Venmo", "Google Drive"],
    logos: ["/images/competitors/Gmail.png", "/images/competitors/Venmo.png", "/images/competitors/GoogleDrive.png"],
  },
  comparison: [
    {
      label: "One app for families, staff and admins",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Three or more apps", mark: "no" },
      rivals: {
        brightwheel: { value: "Yes, one app for staff and families", mark: "yes", source: BW_APP },
        playground: { value: "Yes", mark: "yes", source: PG_HOME },
        "transparent-classroom": { value: "Parent app plus a separate iPad teacher app", mark: "partial", source: TC_APP },
      },
    },
    {
      label: "iPhone and Android",
      mudkitchen: { value: "Yes, iPhone and Android", mark: "yes" },
      toolStack: { value: "Any phone", mark: "yes" },
      rivals: {
        brightwheel: { value: "iPhone; Android unconfirmed", mark: "unknown", source: BW_APP },
        playground: { value: "iOS and Android", mark: "yes", source: PG_GUARDIAN },
        "transparent-classroom": { value: "iOS and Android parent view", mark: "yes", source: TC_APP },
      },
    },
    {
      label: "Pay tuition in the app",
      mudkitchen: { value: "Card or bank, with autopay", mark: "yes" },
      toolStack: { value: "Venmo or Zelle, no ledger", mark: "partial" },
      rivals: {
        brightwheel: { value: "Online bill pay", mark: "yes", source: BW_APP },
        playground: { value: "Yes, Billing tab", mark: "yes", source: PG_GUARDIAN },
        "transparent-classroom": { value: "Through Onespot, a separate vendor", mark: "partial", source: TC_ONESPOT },
      },
    },
    {
      label: "Messages with attachments",
      mudkitchen: { value: "Yes, photos and files", mark: "yes" },
      toolStack: { value: "Group texts from personal numbers", mark: "partial" },
      rivals: {
        brightwheel: { value: "Messaging", mark: "yes", source: BW_APP },
        playground: { value: "Chat with staff", mark: "yes", source: PG_GUARDIAN },
        "transparent-classroom": { value: "Group chats through Onespot", mark: "partial", source: TC_ONESPOT },
      },
    },
    {
      label: "Your school's branding",
      mudkitchen: { value: "Your logo and colors inside the app", mark: "yes" },
      toolStack: { value: "None", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_APP },
        playground: { value: "Branded app; own store listing needs 5+ locations", mark: "partial", source: PG_BRANDED },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_APP },
      },
    },
    {
      label: "Attendance and staff time clock",
      mudkitchen: { value: "Attendance and My Hours", mark: "yes" },
      toolStack: { value: "Paper or a spreadsheet", mark: "no" },
      rivals: {
        brightwheel: { value: "Attendance and check-in; time clock not listed", mark: "partial", source: BW_APP },
        playground: { value: "Check-in and staff time tracking", mark: "yes", source: PG_HOME },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_APP },
      },
    },
    {
      label: "Review applications on the phone",
      mudkitchen: { value: "Yes, accept, decline and mark enrolled", mark: "yes" },
      toolStack: { value: "Email and a spreadsheet", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_APP },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_HOME },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_APP },
      },
    },
  ],
  faq: [
    {
      question: "Is the app on Android?",
      answer:
        "Yes. Families, staff and admins can use MudKitchen on Android as well as iPhone. Tap Android on our download page and we'll send you the install link.",
    },
    {
      question: "Can families apply through the app?",
      answer:
        "No. Families apply and finish enrollment on the web from your apply link. Once they're enrolled, they sign in to the app for billing, messages and everything else.",
    },
    {
      question: "Does it show our school's brand?",
      answer: "Yes. Families download MudKitchen, choose your school, and see your logo and colors inside the app.",
    },
    {
      question: "What do push notifications cover?",
      answer:
        "New messages, bulletin posts, newsletters, new photos, classroom sign-up reminders, committee updates, and when a child is marked present or picked up. Tuition and admissions reminders arrive by email, not push.",
    },
    {
      question: "Do teachers and admins need a separate app?",
      answer:
        "No. The same app opens the family, staff or admin view based on your role. If you have more than one role, you can switch between them. Tuition setup and most settings stay on the web.",
    },
  ],
  related: ["messages", "tuition-billing", "attendance"],
};
