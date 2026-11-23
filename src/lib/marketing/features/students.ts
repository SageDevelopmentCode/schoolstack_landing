import { GraduationCap } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/students.md */

const CDC: Source = { label: "CDC, Food allergies in schools", url: "https://cdc.gov/school-health-conditions/food-allergies/index.html", year: "2024" };
const NCMEC: Source = { label: "National Center for Missing & Exploited Children, Family abduction", url: "https://www.missingkids.org/FamilyAbduction", year: "2023" };
const TX_IMMUNIZATION: Source = {
  label: "Texas Administrative Code, 25 TAC §97.67 (via Cornell LII)",
  url: "https://www.law.cornell.edu/regulations/texas/25-Tex-Admin-Code-SS-97-67",
};
const BW_CONTACTS: Source = { label: "Brightwheel help: add and invite student contacts", url: "https://help.mybrightwheel.com/en/articles/1161612-add-and-invite-student-contacts" };
const BW_EMERGENCY: Source = {
  label: "Brightwheel help: print student information for emergencies",
  url: "https://help.mybrightwheel.com/en/articles/9659904-print-student-information-for-emergencies",
};
const BW_FAMILY: Source = {
  label: "Brightwheel help: manage your child's contacts and approved pickup list",
  url: "https://help.mybrightwheel.com/en/articles/1161627-manage-your-child-s-contacts-and-approved-pickup-list",
};
const BW_PRICING: Source = { label: "Brightwheel pricing page", url: "https://mybrightwheel.com/pricing/" };
const PG_PROFILE: Source = { label: "Playground help: student profile overview", url: "https://help.tryplayground.com/en/articles/9557921-student-profile-overview" };
const PG_FAMILY_EDIT: Source = {
  label: "Playground help: view and edit a student's profile as a family",
  url: "https://help.tryplayground.com/en/articles/5406865-view-edit-a-student-s-profile-as-a-family",
};
const PG_GUARDIANS: Source = { label: "Playground help: add and manage guardians", url: "https://help.tryplayground.com/en/articles/6460616-add-manage-guardians-as-a-family" };
const PG_CARDS: Source = {
  label: "Playground help: printable emergency cards",
  url: "https://help.tryplayground.com/en/articles/9533710-printable-emergency-cards-for-students",
};
const TC_CHILDREN: Source = { label: "Transparent Classroom help: Children page", url: "https://transparent-classroom.helpscoutdocs.com/article/21-children-page" };

export const students: Feature = {
  slug: "students",
  name: "Students & families",
  icon: GraduationCap,
  tint: "sky",
  oneLiner: "Student records families keep current and teachers can actually see.",
  roles: ["admin", "family", "staff"],
  roleLines: {
    admin: "Every enrolled child's profile, health and family details, straight from admissions.",
    family: "Keep your child's health info and pickup list current from your phone.",
    staff: "See your students' allergies, medications and family contacts before the day starts.",
  },
  platforms: { web: true, mobile: true },
  seo: {
    title: "Student records, health info & pickup lists for microschools",
    description:
      "Students join your roster when you enroll them. Families keep allergies, medications and pickup lists current, and teachers see them on their roster.",
  },
  hero: {
    lead: "Every child's details,",
    accent: "current, shared and in one place.",
    body: "Families keep allergies, medications and pickup lists up to date from their phone. Teachers see them on their roster. When anyone adds a health update, the other side sees it in MudKitchen.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      { title: "Roster from enrollment", body: "Students appear the moment you mark them enrolled in Admissions. No retyping from the application." },
      { title: "One profile per child", body: "Family contacts, programs, classrooms, health and photo permissions on one page, with a link to the application." },
      { title: "Health at a glance", body: "See which students have standing health items, and add or update allergies, medications and health notes." },
      { title: "Emergency info at enrollment", body: "Collect emergency contacts, physician details and immunization records with ready-made enrollment checklist forms." },
      { title: "Who's missing a class", body: "Spot enrolled students without a classroom and place them in a few taps." },
      { title: "See what changed", body: "Health and pickup-list changes show in your activity feed, so you know who changed what." },
    ],
    family: [
      { title: "You keep it current", body: "Add allergies with severity and treatment, medications with dose and schedule, or a quick health update." },
      { title: "Your pickup list", body: "Add grandparents, sitters or carpool parents with phone and notes. They don't need an account." },
      { title: "Siblings in one step", body: "Copy pickup contacts from one child to another instead of typing them twice." },
      { title: "The school sees it", body: "Health changes you make show up for teachers and the office in MudKitchen." },
      { title: "From your phone", body: "Your child's record works on the web and in the MudKitchen app on iPhone and Android." },
    ],
    staff: [
      { title: "Your students first", body: "Your assigned students, searchable, with a tab for everyone else at school." },
      { title: "Health flags", body: "Tap one number to see every student with allergies or medications at school." },
      { title: "Share what you saw", body: "Log a health update on the web, and the family and office see it in MudKitchen." },
      { title: "Reach the family", body: "Family contacts are on each profile, and you can message parents from the MudKitchen app." },
    ],
  },
  useCases: [
    {
      title: "A new allergy, mid-year",
      scenario: "A child is diagnosed with a peanut allergy in November.",
      outcome: "The parent adds it from her phone with high severity and treatment notes. The child now shows under Health flags on the teacher's roster.",
    },
    {
      title: "Grandpa's getting her today",
      scenario: "A grandfather comes to pick up for the first time.",
      outcome: "The family added him to the authorized pickup list in September. The teacher finds him in Record Pickup and confirms.",
    },
    {
      title: "A substitute's first morning",
      scenario: "The lead teacher is out sick.",
      outcome: "The sub signs in with a one-time code, taps Health flags and sees the students with medications at school, with dose and time.",
    },
    {
      title: "Staying home sick",
      scenario: "A parent keeps a child home with a stomach bug.",
      outcome: "She posts a health update with dates, and the teacher sees it on the child's profile.",
    },
  ],
  evidence: [
    { stat: "1 in 13", claim: "children has a food allergy, about two students in every classroom.", source: CDC },
    { stat: "59%", claim: "of AMBER Alerts issued in 2023 were for family abduction cases.", source: NCMEC },
    {
      stat: "TX rule",
      claim: "Texas requires every school and child-care facility to keep immunization records, on paper or electronically.",
      source: TX_IMMUNIZATION,
    },
  ],
  toolStack: {
    names: ["Google Forms", "Google Sheets", "Google Drive", "Emergency binder"],
    logos: ["/images/competitors/GoogleForms.png", "/images/competitors/GoogleSheets.png", "/images/competitors/GoogleDrive.png"],
  },
  comparison: [
    {
      label: "Allergies with severity and treatment",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "A cell in a spreadsheet", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_EMERGENCY },
        playground: { value: "Allergies on the student profile", mark: "yes", source: PG_PROFILE },
        "transparent-classroom": { value: "Allergies on the Children page", mark: "yes", source: TC_CHILDREN },
      },
    },
    {
      label: "Medication schedule (dose, time, days)",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Free text", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_EMERGENCY },
        playground: { value: "Medications on the profile; schedule unconfirmed", mark: "partial", source: PG_PROFILE },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_CHILDREN },
      },
    },
    {
      label: "Families update health info themselves",
      mudkitchen: { value: "Yes, and the school sees each change", mark: "yes" },
      toolStack: { value: "Re-send the form", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_FAMILY },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_FAMILY_EDIT },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_CHILDREN },
      },
    },
    {
      label: "Authorized pickup list",
      mudkitchen: { value: "Kept by the family; no account needed", mark: "yes" },
      toolStack: { value: "On the form or by text", mark: "partial" },
      rivals: {
        brightwheel: { value: "Approved Pickup contact type", mark: "yes", source: BW_CONTACTS },
        playground: { value: "Authorized Pickup guardian type", mark: "yes", source: PG_GUARDIANS },
        "transparent-classroom": { value: "Approved Adults", mark: "yes", source: TC_CHILDREN },
      },
    },
    {
      label: "Emergency contacts",
      mudkitchen: { value: "Collected at enrollment with a checklist form", mark: "partial" },
      toolStack: { value: "On the enrollment form", mark: "partial" },
      rivals: {
        brightwheel: { value: "Emergency Contact type", mark: "yes", source: BW_CONTACTS },
        playground: { value: "Emergency Contact guardian type", mark: "yes", source: PG_GUARDIANS },
        "transparent-classroom": { value: "On the child's profile", mark: "yes", source: TC_CHILDREN },
      },
    },
    {
      label: "Printable emergency sheet",
      mudkitchen: { value: "Not yet", mark: "no" },
      toolStack: { value: "The binder", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_EMERGENCY },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_CARDS },
        "transparent-classroom": { value: "Yes, print from the Children page", mark: "yes", source: TC_CHILDREN },
      },
    },
    {
      label: "Roster built from enrollment",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Copy and paste", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_PRICING },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_PROFILE },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_CHILDREN },
      },
    },
  ],
  faq: [
    {
      question: "Who can update a child's health information?",
      answer:
        "Families, teachers and school admins can all add or update allergies, medications and health updates. Each change shows up for the other side in MudKitchen's activity feed, and each item shows who added it and when.",
    },
    {
      question: "Where do emergency contacts go?",
      answer:
        "Collect them at enrollment with the ready-made Emergency Contact, Health & Immunization Form in your enrollment checklist. Day-to-day pickup permissions live on each child's authorized pickup list, which families manage.",
    },
    {
      question: "Do authorized pickup contacts need an account?",
      answer:
        "No. Families add a name, relationship, phone and notes. Staff see that person when recording pickup, and parents get a notification in the MudKitchen app naming who collected their child.",
    },
    {
      question: "Can teachers see every student's health information?",
      answer:
        "Teachers see their assigned students first and can open any enrolled student's profile, including the Health tab. Give staff access only to people you'd trust with that information.",
    },
    {
      question: "Can I print an emergency sheet?",
      answer:
        "Not yet. Allergies, medications and pickup lists are on each profile on the web and in the app, and emergency contacts come in through your enrollment checklist forms.",
    },
  ],
  related: ["admissions", "attendance", "classrooms"],
};
