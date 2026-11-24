import { School } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/classrooms.md */

const THE74: Source = {
  label: "The 74, on the National Microschooling Center's 2025 sector analysis",
  url: "https://www.the74million.org/article/exclusive-report-as-movement-grows-microschools-arent-so-micro-anymore/",
  year: "2025",
};
const NEWSCHOOLS: Source = {
  label: "NewSchools Venture Fund, Micro schools: opportunities and challenges",
  url: "https://www.newschools.org/blog/micro-schools-opportunities-and-potential-challenges/",
  year: "2015",
};
const CDC: Source = { label: "CDC, Food allergies in schools", url: "https://cdc.gov/school-health-conditions/food-allergies/index.html", year: "2024" };
const BW_PRICING: Source = { label: "Brightwheel pricing page", url: "https://mybrightwheel.com/pricing/" };
const BW_ROOMS: Source = { label: "Brightwheel help: create and manage rooms", url: "https://help.mybrightwheel.com/en/articles/942335-create-manage-rooms" };
const BW_ASSIGN: Source = { label: "Brightwheel help: assign staff to rooms", url: "https://help.mybrightwheel.com/en/articles/942343-assign-staff-to-rooms" };
const PG_CLASSROOMS: Source = { label: "Playground help: create and manage classrooms", url: "https://help.tryplayground.com/en/articles/5506778-create-manage-classrooms" };
const TC_PRICING: Source = { label: "Transparent Classroom pricing", url: "https://www.transparentclassroom.com/pricing" };
const TC_CHILDREN: Source = { label: "Transparent Classroom help: Children page", url: "https://transparent-classroom.helpscoutdocs.com/article/21-children-page" };

export const classrooms: Feature = {
  slug: "classrooms",
  name: "Classrooms",
  icon: School,
  tint: "lav",
  oneLiner: "Simple class groups that connect students, teachers and families.",
  roles: ["admin", "staff", "family"],
  roleLines: {
    admin: "Create class groups, assign a lead teacher, and spot students without a class.",
    staff: "Filter your roster to your own group in one tap.",
    family: "See the teachers assigned to your child's class group.",
  },
  platforms: { web: true, mobile: true },
  afterBell: true,
  seo: {
    title: "Classrooms & class groups for microschools",
    description:
      "Create classrooms for pods, grades or programs, add a lead teacher and assistants, and build rosters from enrolled students. Teachers see their group first.",
  },
  hero: {
    lead: "Group your students,",
    accent: "give every teacher their class.",
    body: "Create classrooms for your pods, grades or programs. Add a lead teacher and assistants, then add students from your enrolled list. Teachers see their group first, and families see who teaches their child.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      { title: "Groups that fit you", body: "Name a classroom anything: a pod, a grade band, a program. Tie it to one program or leave it open." },
      { title: "Lead and assistant", body: "Assign staff as lead teacher or assistant, and see which classrooms still need a lead." },
      { title: "Add from enrolled", body: "Build each roster from students already enrolled, with the classroom's own program listed first." },
      { title: "Find the gaps", body: "See students with no classroom and place them from the student list in a few taps." },
      { title: "More than one group", body: "Put a student in several classrooms when they split time between groups. MudKitchen checks each fits their program." },
    ],
    staff: [
      { title: "Your group first", body: "Tap a classroom card to filter your roster to just those students." },
      { title: "Health at hand", body: "Open any student in your group to see allergies, medications and family contacts." },
      { title: "From the dashboard", body: "Classroom cards on your home page open the right roster in one tap." },
    ],
    family: [
      { title: "Your child's team", body: "See the teachers assigned to your child's class group, with names, titles and photos." },
      { title: "Changes with the group", body: "Your child's teachers come from their class group, so the list follows any regroup." },
    ],
  },
  useCases: [
    {
      title: "Setting up the first week",
      scenario: "A founder opens with two mixed-age groups.",
      outcome: "She creates Seedlings (K–2) and Explorers (3–5), assigns a lead to each and adds students from the enrolled list. Families see their child's teachers that day.",
    },
    {
      title: "A mid-year regroup",
      scenario: "Two students move up to the older group in January.",
      outcome: "The admin changes their classrooms from the student list. Teachers' rosters and families' teacher lists update without anyone re-sending a class list.",
    },
    {
      title: "The Friday nature program",
      scenario: "Some students also attend an enrichment program on Fridays.",
      outcome: "They're added to a second classroom tied to that program, while staying in their main group.",
    },
    {
      title: "A new assistant joins",
      scenario: "An assistant starts in the Explorers room.",
      outcome: "The admin adds her as Assistant, and she sees those students first in My Students.",
    },
  ],
  evidence: [
    { stat: "22", claim: "students is the median microschool in 2025, up from 16 the year before.", source: THE74 },
    { stat: "1–2", claim: "full-time teachers is all many microschools are designed to employ.", source: NEWSCHOOLS },
    { stat: "2 per class", claim: "is about how many students in a typical classroom have a food allergy, or 1 in 13 children.", source: CDC },
  ],
  toolStack: {
    names: ["Google Sheets", "Google Drive", "Whiteboard class lists"],
    logos: ["/images/competitors/GoogleSheets.png", "/images/competitors/GoogleDrive.png"],
  },
  comparison: [
    {
      label: "Create class groups",
      mudkitchen: { value: "Yes, on the web, iPhone and Android", mark: "yes" },
      toolStack: { value: "A tab or folder per group", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_ROOMS },
        playground: { value: "Yes, classrooms", mark: "yes", source: PG_CLASSROOMS },
        "transparent-classroom": { value: "Yes, unlimited classrooms", mark: "yes", source: TC_PRICING },
      },
    },
    {
      label: "Lead teacher and assistant roles",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Not tracked", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_ASSIGN },
        playground: { value: "Staff on homeroom classes; roles unconfirmed", mark: "partial", source: PG_CLASSROOMS },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_CHILDREN },
      },
    },
    {
      label: "A student in more than one group",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Copy the row", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_ROOMS },
        playground: { value: "One homeroom plus a current classroom", mark: "partial", source: PG_CLASSROOMS },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_CHILDREN },
      },
    },
    {
      label: "Teachers see their group first",
      mudkitchen: { value: "Yes, Your groups filter", mark: "yes" },
      toolStack: { value: "Separate lists", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_ASSIGN },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_CLASSROOMS },
        "transparent-classroom": { value: "Yes, Children page class roster", mark: "yes", source: TC_CHILDREN },
      },
    },
    {
      label: "Families see their child's teachers",
      mudkitchen: { value: "Yes", mark: "yes" },
      toolStack: { value: "Only if someone emails it", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_PRICING },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_CLASSROOMS },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_CHILDREN },
      },
    },
    {
      label: "Flags students with no class",
      mudkitchen: { value: "Yes, and rooms with no lead", mark: "yes" },
      toolStack: { value: "No", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_ROOMS },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_CLASSROOMS },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_CHILDREN },
      },
    },
    {
      label: "Ratio and capacity tracking",
      mudkitchen: { value: "No", mark: "no" },
      toolStack: { value: "By hand", mark: "no" },
      rivals: {
        brightwheel: { value: "Ratio tracking listed", mark: "yes", source: BW_PRICING },
        playground: { value: "Optional capacity and ratio", mark: "yes", source: PG_CLASSROOMS },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_PRICING },
      },
    },
  ],
  faq: [
    {
      question: "Do I need classrooms if I only have one group?",
      answer:
        "Not strictly. But even one classroom with a lead teacher means families see who teaches their child, and teachers get a filtered roster.",
    },
    {
      question: "Can a student be in more than one classroom?",
      answer: "Yes. Pick every classroom a student belongs to, and MudKitchen checks that each one fits the student's program.",
    },
    {
      question: "What roles can staff have in a classroom?",
      answer: "Lead teacher or Assistant. The admin view flags any classroom that doesn't have a lead teacher yet.",
    },
    {
      question: "Do classrooms limit what teachers can see?",
      answer:
        "No. Classrooms decide which students a teacher sees first. Teachers can still open the All students tab for the rest of the school.",
    },
    {
      question: "Does MudKitchen track ratios or room capacity?",
      answer:
        "No. Classrooms in MudKitchen are groups of students and teachers, with a simple open, full or inactive status. If you need licensed childcare ratio tracking, a childcare platform is built for that.",
    },
  ],
  related: ["students", "staff", "attendance"],
};
