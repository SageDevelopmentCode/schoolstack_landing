import type { OutreachPlan } from "./types";

export const wildHeartsAdventureOutreach: OutreachPlan = {
  slug: "wild-hearts-adventure",
  schoolName: "Wild Hearts Adventure Co.",
  researchedAt: "2026-11-19",
  recipient: {
    firstName: "Cara",
    role: "Director of Operations",
    source: "Wild Hearts about page (Cara Weeks, Director of Operations)",
  },
  angle: "One real question about charter-fund billing, no pitch in the first email",
  facts: [
    {
      fact: "Accepts charter school enrichment funds for tuition",
      source: "Wild Hearts homepage",
      url: "https://wildheartsadventure.co/",
      readOn: "2026-11-19",
    },
    {
      fact: "Application fee is $40 per student or $75 per family; core program meets twice weekly, late August to May",
      source: "Wild Hearts homepage",
      url: "https://wildheartsadventure.co/",
      readOn: "2026-11-19",
    },
    {
      fact: "Afternoon classes run weekly at $60 a month per class",
      source: "Wild Hearts afternoon class registration",
      url: "https://wildheartsadventure.co/product/afternoon-class-reg/",
      readOn: "2026-11-19",
    },
    {
      fact: "The Family Info page is password-protected",
      source: "Wild Hearts Family Info",
      url: "https://wildheartsadventure.co/family-info/",
      readOn: "2026-11-19",
    },
    {
      fact: "Projects include woodworking, cooking, mechanics and homesteading; Cara Weeks is Director of Operations",
      source: "Wild Hearts about page",
      url: "https://wildheartsadventure.co/about/",
      readOn: "2026-11-19",
    },
  ],
  checkBeforeSending: [
    "Confirm Rooted Meadows opened on MudKitchen before sending follow-up 2.",
    "If Cara replies to the first email, answer her yourself and stop the sequence.",
  ],
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "One real question about something on their own site; no demo yet",
      subject: "charter funds at Wild Hearts",
      body: `Hi Cara,

I was reading the Wild Hearts site. Families can pay with charter enrichment funds, afternoon classes are $60 a month each, and Family Info sits behind a shared password.

Do families come through more than one charter? I'm curious how you keep that straight alongside the afternoon class sign-ups.

I ask because I run a small outdoor microschool in Round Rock, TX, and billing like that is why I built MudKitchen, the software we run it on.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Resource: show the version built for them",
      body: `Hi Cara,

Rather than just ask, I put together a version of the Wild Hearts site with a parent portal, so each family logs in to their own page instead of sharing one password. Here's a 60-second look:

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello on Facebook, with no pitch",
      where: "Facebook (facebook.com/WildHeartsAdventureCo)",
      body: "Hi Cara, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. The woodworking and homesteading projects at Wild Hearts look great.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Proof: another small school that opened on it",
      body: `Hi Cara,

One more data point. Rooted Meadows, a K–8 farm school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen, the system we run Sage Field on.

If it would help to hear how their first months went, I'm happy to share.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo stays up",
      body: `Hi Cara,

I'll stop here so I'm not crowding your inbox. The Wild Hearts version stays up if it's ever useful, just reply and I'll send the link.

Julius`,
    },
  ],
};
