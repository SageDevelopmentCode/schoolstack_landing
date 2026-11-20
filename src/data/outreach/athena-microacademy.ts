import type { OutreachPlan } from "./types";

export const athenaMicroacademyOutreach: OutreachPlan = {
  slug: "athena-microacademy",
  schoolName: "Athena Micro-academy of Austin",
  researchedAt: "2026-11-19",
  recipient: {
    firstName: "Mily",
    role: "Founder",
    source: "microschool.directory listing (Mily Pérez, Founder); confirm on amaustin.org Meet the Founder",
  },
  angle: "Why now: Athena takes TEFA through Odyssey, so one student can mean two payers",
  facts: [
    {
      fact: "Approved TEFA vendor; families can find Athena on Odyssey",
      source: "Athena FAQ",
      url: "https://www.amaustin.org/faqs.html",
      readOn: "2026-11-19",
    },
    {
      fact: "Full-time tuition is $17,000, with a part-time program available",
      source: "Athena homepage",
      url: "https://www.amaustin.org/",
      readOn: "2026-11-19",
    },
    {
      fact: "Grades 6–11 for 2026–27; year-round calendar, 6–7 weeks on and 2 weeks off; after-school 3:30–5",
      source: "Athena FAQ",
      url: "https://www.amaustin.org/faqs.html",
      readOn: "2026-11-19",
    },
    {
      fact: "TEFA pays $10,474 per child at an approved private school for 2026–27",
      source: "Texas Education Freedom Accounts",
      url: "https://educationfreedom.texas.gov/schools/",
      readOn: "2026-11-19",
    },
  ],
  checkBeforeSending: [
    "Only send the first email as written if MudKitchen can bill part of tuition to TEFA. Otherwise swap the TEFA sentence for the year-round calendar.",
    "Confirm the founder's first name (Mily) on Athena's Meet the Founder page.",
    "Confirm Rooted Meadows opened on MudKitchen before sending follow-up 2.",
  ],
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "A why-now reason from their own FAQ, plus Sage Field's result",
      subject: "TEFA families at Athena",
      body: `Hi Mily,

Your FAQ says Athena is an approved TEFA vendor on Odyssey. At $17,000 tuition, a TEFA family still owes about $6,500 on top of the $10,474 the state pays, so one student can mean two payers.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen, the enrollment and tuition system I built for it. I set up a version for Athena with your programs in it.

Want me to send it?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Resource: a 60-second walkthrough so they don't have to click around",
      body: `Hi Mily,

In case clicking around a demo isn't appealing, I recorded a 60-second walkthrough of the Athena version. It shows the homepage, what a parent sees for tuition, and your admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Instagram, Facebook or LinkedIn",
      body: "Hi Mily, I'm Julius. I run Sage Field, a microschool up in Round Rock. Glad to see Athena open in South Austin this fall.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Proof: another new school that opened on it",
      body: `Hi Mily,

One more thing that might matter in a first year. Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen, the same system we use at Sage Field.

If it would help to hear how their first months went, I'm happy to share.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo stays up",
      body: `Hi Mily,

I'll leave it here so I'm not cluttering your inbox. The Athena version of MudKitchen stays up if you ever want it, just reply and I'll send the link.

Good luck with the first term.

Julius`,
    },
  ],
};
