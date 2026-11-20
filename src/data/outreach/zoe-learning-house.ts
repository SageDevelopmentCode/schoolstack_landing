import type { OutreachPlan } from "./types";

export const zoeLearningHouseOutreach: OutreachPlan = {
  slug: "zoe-learning-house",
  schoolName: "Zoe Learning House",
  researchedAt: "2026-11-19",
  recipient: {
    firstName: "Emily",
    role: "Founder, director and lead teacher",
    source: "Zoe about page (Emily Barnitz)",
  },
  angle: "Proof plus their own three-step admissions process",
  facts: [
    {
      fact: "Launched fall 2024 as a K–5 hybrid Christian academy in New Orleans",
      source: "Zoe about page",
      url: "https://zoelearninghouse.com/about-us",
      readOn: "2026-11-19",
    },
    {
      fact: "Three steps to join: interest form, a visit with a literacy and math evaluation, then registration with a 2.5-hour Child Visit Day",
      source: "Zoe intro packet page",
      url: "https://zoelearninghouse.com/intro-packet",
      readOn: "2026-11-19",
    },
    {
      fact: "Program options from 1 to 5 days a week (1-Day Spark, 2-Day Hybrid Academy, 3-Day, 4-Day Living Academy, 5-Day)",
      source: "Zoe intro packet page",
      url: "https://zoelearninghouse.com/intro-packet",
      readOn: "2026-11-19",
    },
    {
      fact: "Hybrid families use Weekly Learning Plans in literacy and math for home days",
      source: "Zoe about page",
      url: "https://zoelearninghouse.com/about-us",
      readOn: "2026-11-19",
    },
    {
      fact: "Daily outdoor learning, nature study and gardening",
      source: "Zoe nature page",
      url: "https://zoelearninghouse.com/nature",
      readOn: "2026-11-19",
    },
  ],
  checkBeforeSending: [
    "Confirm Rooted Meadows opened on MudKitchen (the first email mentions it).",
    "The Zoe demo has their interest form and 1–5 day options, not the visit or Child Visit Day steps. Don't claim it does.",
  ],
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Their own admissions steps, plus Sage Field and Rooted Meadows as proof",
      subject: "Zoe's admissions steps",
      body: `Hi Emily,

Zoe's intro page lays out three steps to join: the interest form, a visit with the literacy and math check, then the Child Visit Day.

I run Sage Field, a microschool in Round Rock, and built MudKitchen to track every family through steps like that in one place. We grew from 0 to 35 students in under 3 months on it, and Rooted Meadows in Idaho opened on it this August.

I set up a version for Zoe with your interest form and 1–5 day options. Want me to send it?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Resource: a 60-second walkthrough",
      body: `Hi Emily,

In case it's easier than clicking around, here's a 60-second walkthrough of the Zoe version: the homepage, the interest form, and what a family sees after they join.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Instagram or Facebook",
      body: "Hi Emily, I'm Julius. I run Sage Field, a microschool in Round Rock, TX. I've enjoyed reading about the nature study and gardening at Zoe.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "A different angle: what hybrid families need on home days",
      body: `Hi Emily,

Your about page mentions Weekly Learning Plans for the hybrid families' home days. In the parent portal I set up for Zoe, families could open each week's plan next to the school calendar.

How do those plans get to parents today?

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo stays up",
      body: `Hi Emily,

I'll leave it here so I'm not cluttering your inbox. The Zoe version stays up if you ever want it, just reply and I'll send the link.

Julius`,
    },
  ],
};
