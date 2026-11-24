import { Users } from "lucide-react";
import type { Feature, Source } from "./types";

/** Research and sources: docs/features-research/staff.md */

const NCES: Source = {
  label: "NCES / Institute of Education Sciences, teacher attrition release",
  url: "https://ies.ed.gov/learn/press-release/eight-percent-public-school-teachers-left-teaching-2021-rate-unchanged-last-measured-2012",
  year: "2023",
};
const NEWSCHOOLS: Source = {
  label: "NewSchools Venture Fund, Micro schools: opportunities and challenges",
  url: "https://www.newschools.org/blog/micro-schools-opportunities-and-potential-challenges/",
  year: "2015",
};
const BEYOND_ID: Source = {
  label: "Beyond Identity survey, via Help Net Security",
  url: "https://www.helpnetsecurity.com/2022/02/21/employees-maintaining-accounts-access/",
  year: "2022",
};
const BW_ROLES: Source = { label: "Brightwheel help: staff permissions and roles", url: "https://help.mybrightwheel.com/en/articles/2109290-understanding-staff-permissions-and-roles" };
const BW_ADD: Source = { label: "Brightwheel help: add staff", url: "https://help.mybrightwheel.com/en/articles/942340-add-staff" };
const BW_ROOMS: Source = { label: "Brightwheel help: assign staff to rooms", url: "https://help.mybrightwheel.com/en/articles/942343-assign-staff-to-rooms" };
const PG_STAFF_HOURS: Source = { label: "Playground help: staff hours for teachers", url: "https://help.tryplayground.com/en/articles/9441159-staff-hours-for-teachers" };
const PG_INVITE: Source = { label: "Playground help: add and invite staff", url: "https://help.tryplayground.com/en/articles/5101959-add-invite-staff-to-playground" };
const PG_MANAGE: Source = { label: "Playground help: edit and manage staff", url: "https://help.tryplayground.com/en/articles/8618904-edit-manage-staff" };
const PG_CLASSROOMS: Source = { label: "Playground help: create and manage classrooms", url: "https://help.tryplayground.com/en/articles/5506778-create-manage-classrooms" };
const PG_PRICING: Source = { label: "Playground pricing", url: "https://www.tryplayground.com/pricing" };
const TC_PRICING: Source = { label: "Transparent Classroom pricing", url: "https://www.transparentclassroom.com/pricing" };
const TC_INACTIVE: Source = { label: "Transparent Classroom help: make users inactive", url: "https://transparent-classroom.helpscoutdocs.com/article/387-how-to-make-users-inactive" };
const TC_CHILDREN: Source = { label: "Transparent Classroom help: Children page", url: "https://transparent-classroom.helpscoutdocs.com/article/21-children-page" };

export const staff: Feature = {
  slug: "staff",
  name: "Staff",
  icon: Users,
  tint: "peach",
  oneLiner: "Your team's logins, students and access, managed in one place.",
  roles: ["admin", "staff", "family"],
  roleLines: {
    admin: "Add staff, assign their students, and turn off access when someone leaves.",
    staff: "Sign in with an email code and find your students on day one.",
    family: "See your child's teachers with names, job titles and photos.",
  },
  platforms: { web: true, mobile: true },
  afterBell: true,
  seo: {
    title: "Staff accounts & access for microschools",
    description:
      "Add teachers with a name and email. They sign in with a one-time code, no shared passwords. Assign their students and turn off access when someone leaves.",
  },
  hero: {
    lead: "Add a teacher today,",
    accent: "turn off access in one step.",
    body: "Add staff with a name and email, and they sign in with a one-time code. No shared passwords. Assign their students, see who has signed in, and turn access off when someone leaves.",
  },
  shots: [],
  heroShots: {},
  capabilities: {
    admin: [
      { title: "No shared passwords", body: "Each person signs in with a one-time code sent to their own email. Nothing to reset when someone leaves." },
      { title: "See who's set up", body: "Know at a glance who has never signed in, who is active, and whose profile is unfinished." },
      { title: "Assign their students", body: "Pick the students each staff member works with. They see them first in My Students." },
      { title: "Off in one step", body: "Deactivate portal access when someone leaves. Their record and history stay; their sign-in doesn't." },
      { title: "Status and job titles", body: "Mark staff active, inactive or on leave, and give each a job title families can see." },
      { title: "Manage from your phone", body: "Add staff, edit profiles, assign students and turn access off or on in the MudKitchen app." },
    ],
    staff: [
      { title: "Ready on day one", body: "Their dashboard, students, messages and calendar are waiting the first time they sign in." },
      { title: "Know your students", body: "Open any student to see family contacts and health notes before the first morning." },
      { title: "Web or phone", body: "The same portal works in a browser and in the MudKitchen app on iPhone and Android." },
      { title: "Your own login", body: "Sign in with a code sent to your email. No password to remember or share." },
    ],
    family: [
      { title: "Meet the team", body: "See your child's teachers with their names, job titles and photos." },
      { title: "All their teachers", body: "Open the Teachers tab on your child's record to see everyone assigned to their class group." },
    ],
  },
  useCases: [
    {
      title: "A new assistant starts Monday",
      scenario: "The founder hires a part-time assistant on Friday.",
      outcome: "She adds his name and email and assigns his students. On Monday he signs in with a code and sees his class and their allergies.",
    },
    {
      title: "A teacher leaves mid-year",
      scenario: "A lead teacher gives notice in February.",
      outcome: "On her last day the founder turns off her portal access. Her record stays, and her students are assigned to the new teacher.",
    },
    {
      title: "Did the new hire ever log in?",
      scenario: "Two weeks in, the founder isn't sure the new aide is reading messages.",
      outcome: "The staff list shows Never signed in, so she copies his sign-in link and texts it to him.",
    },
    {
      title: "A spring on leave",
      scenario: "A teacher goes on leave for the spring term.",
      outcome: "The founder marks her On leave and keeps her record ready for her return.",
    },
  ],
  evidence: [
    { stat: "12%", claim: "of private-school teachers left the profession between 2020–21 and 2021–22, against 8% of public-school teachers.", source: NCES },
    { stat: "1–2", claim: "full-time teachers is all many microschools employ, so any midyear departure has a big impact.", source: NEWSCHOOLS },
    { stat: "83%", claim: "of former employees surveyed said they kept access to accounts from a previous employer.", source: BEYOND_ID },
  ],
  toolStack: {
    names: ["Shared logins", "Google Sheets", "Google Drive"],
    logos: ["/images/competitors/GoogleSheets.png", "/images/competitors/GoogleDrive.png"],
  },
  comparison: [
    {
      label: "A login for each staff member",
      mudkitchen: { value: "Yes, one-time code by email", mark: "yes" },
      toolStack: { value: "Often one shared account", mark: "no" },
      rivals: {
        brightwheel: { value: "Yes, with a role per person", mark: "yes", source: BW_ROLES },
        playground: { value: "Yes, staff app accounts", mark: "yes", source: PG_STAFF_HOURS },
        "transparent-classroom": { value: "Yes, unlimited staff", mark: "yes", source: TC_PRICING },
      },
    },
    {
      label: "See who has signed in",
      mudkitchen: { value: "Never signed in, last sign-in date", mark: "yes" },
      toolStack: { value: "No", mark: "no" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_ADD },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_INVITE },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_PRICING },
      },
    },
    {
      label: "Turn off access, keep history",
      mudkitchen: { value: "Deactivate and reactivate", mark: "yes" },
      toolStack: { value: "Change the shared password", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_ROLES },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_MANAGE },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_INACTIVE },
      },
    },
    {
      label: "Role levels",
      mudkitchen: { value: "Teacher or Staff, same access today", mark: "partial" },
      toolStack: { value: "None", mark: "no" },
      rivals: {
        brightwheel: { value: "Six-plus roles, e.g. Lead Staff, Billing Only", mark: "yes", source: BW_ROLES },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_PRICING },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_PRICING },
      },
    },
    {
      label: "Assign students to a staff member",
      mudkitchen: { value: "Directly or through classrooms", mark: "yes" },
      toolStack: { value: "A class list per teacher", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_ROOMS },
        playground: { value: "Through homeroom classrooms", mark: "yes", source: PG_CLASSROOMS },
        "transparent-classroom": { value: "Through class rosters", mark: "yes", source: TC_CHILDREN },
      },
    },
    {
      label: "Manage staff from a phone",
      mudkitchen: { value: "Yes, in the MudKitchen app", mark: "yes" },
      toolStack: { value: "Partly", mark: "partial" },
      rivals: {
        brightwheel: { value: "Unconfirmed", mark: "unknown", source: BW_ADD },
        playground: { value: "Unconfirmed", mark: "unknown", source: PG_INVITE },
        "transparent-classroom": { value: "Unconfirmed", mark: "unknown", source: TC_PRICING },
      },
    },
  ],
  faq: [
    {
      question: "How do staff sign in?",
      answer:
        "With a one-time code sent to the email you added for them, on the web or in the MudKitchen app. There are no passwords to create, share or reset.",
    },
    {
      question: "What happens when I deactivate someone?",
      answer:
        "They can no longer sign in to the staff portal. Their record and history stay in MudKitchen, and you can reactivate them later.",
    },
    {
      question: "Can teachers see every student?",
      answer:
        "Teachers see their assigned students first, with an All students tab for the rest of the school. Student profiles include family contacts and health details, so give access only to people you trust with that information.",
    },
    {
      question: "Can I set custom roles or permissions?",
      answer:
        "Not today. Staff are Teacher or Staff, and both use the same portal. The role labels your team and helps decide who may manage school calendar events. We turn on the staff-portal pages your school uses.",
    },
    {
      question: "Can I manage staff from my phone?",
      answer: "Yes. In the MudKitchen app you can add staff, edit profiles, assign students and turn portal access off or on.",
    },
  ],
  related: ["classrooms", "staff-hours", "students"],
};
