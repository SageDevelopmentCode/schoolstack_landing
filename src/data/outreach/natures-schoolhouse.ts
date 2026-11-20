import type { OutreachPlan } from "./types";

export const naturesSchoolhouseOutreach: OutreachPlan = {
  slug: "natures-schoolhouse",
  schoolName: "Nature's Schoolhouse Microschool",
  researchedAt: "2026-11-19",
  recipient: {
    firstName: "",
    role: "Program director",
    source: "Wonderschool listing (name not published)",
  },
  angle: "None: the school appears to be paused",
  facts: [
    {
      fact: "Listed as \"currently pausing operations\" and \"not enrolling new learners\"",
      source: "Wonderschool listing",
      url: "https://www.wonderschool.com/tx/cedar-park/natures-schoolhouse-microschool-8557",
      readOn: "2026-11-19",
    },
    {
      fact: "naturesschoolhouse.com returned 404 on the home and programs pages",
      source: "Nature's Schoolhouse website",
      url: "https://www.naturesschoolhouse.com/",
      readOn: "2026-11-19",
    },
  ],
  checkBeforeSending: ["Find out whether they plan to reopen before any outreach."],
  doNotEmail: {
    reason: "Wonderschool lists them as pausing operations and not enrolling, and their website is down.",
    source: "https://www.wonderschool.com/tx/cedar-park/natures-schoolhouse-microschool-8557",
  },
  steps: [],
};
