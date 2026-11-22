import type { OutreachPlan } from "./types";

export const arizonaGiftedAcademyOutreach: OutreachPlan = {
  slug: "arizona-gifted-academy",
  schoolName: "Arizona Gifted Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "",
    role: "Board of Directors",
    source: "Arizona Gifted Academy Important Update (signed by the Board of Directors, no name published)",
  },
  angle: "None: the school decided not to open for 2026–27",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the Arizona Gifted Academy MudKitchen demo",
  },
  facts: [
    {
      fact: "The Board of Directors decided not to open for the 2026–2027 school year, citing facility considerations and enrollment for the inaugural year; enrolled families were refunded",
      source: "Arizona Gifted Academy: An Important Update",
      url: "https://www.arizonagiftedacademy.org/important-update",
      readOn: "2026-11-22",
    },
    {
      fact: "The home page now only links to that update; no programs, tuition or admissions pages are live",
      source: "Arizona Gifted Academy home page",
      url: "https://www.arizonagiftedacademy.org/",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: ["Find out whether they plan to open for 2027–28 before any outreach."],
  doNotEmail: {
    reason:
      "The board announced it will not open for the 2026–27 school year and refunded enrolled families; the site now shows only that update.",
    source: "https://www.arizonagiftedacademy.org/important-update",
  },
  steps: [],
};
