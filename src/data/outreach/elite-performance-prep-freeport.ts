import type { OutreachPlan } from "./types";

export const elitePerformancePrepFreeportOutreach: OutreachPlan = {
  slug: "elite-performance-prep-freeport",
  schoolName: "Elite Performance Prep Academy Freeport",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Trent and Stephanie",
    role: "Owners | Center Managers (Trent and Stephanie Robertson)",
    source: "Elite Freeport center page, Center Leadership",
  },
  angle:
    "One real question: the Freeport page lists founding-member and standard tuition by the year or month, premium electives with their own monthly fee and registration, PE paid directly to T48 Athletics, and Step Up for Students. How do the owners keep track of what each family owes each month?",
  facts: [
    {
      fact: "Elite Performance Prep Academy Freeport is a personalized K–8 microschool at 13295 Business 331 A100, Freeport, FL, open 9:00–1:30 Monday to Thursday, with elective days Monday and Wednesday and core days Tuesday and Thursday",
      source: "Elite Freeport center page",
      url: "https://freeport.eliteperformanceprepacademy.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "Founding members tuition is $6,500 a year or $650 a month for 4 days ($350 registration) and $4,500 or $450 a month for 2 days ($250 registration); standard tuition is $7,250/$725 and $5,250/$525, with $500 and $350 registration fees; sibling discounts are available",
      source: "Elite Freeport center page, Academic Programs",
      url: "https://freeport.eliteperformanceprepacademy.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "Premium electives (Art with Stephanie, Cooking, PE hosted by T48 Athletics) cost $200 a month full time or $125 part time plus a registration fee; PE is $189 a month paid directly to T48",
      source: "Elite Freeport center page, Premium Electives",
      url: "https://freeport.eliteperformanceprepacademy.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "Elite Freeport is an approved Step Up For Students provider",
      source: "Elite Freeport center page",
      url: "https://freeport.eliteperformanceprepacademy.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "The center is owned by Trent and Stephanie Robertson (center managers) and Charlotte Jones (admissions manager, a retired U.S. Air Force veteran); it is one of 19 Elite Performance Prep Academy locations",
      source: "Elite Freeport center page and Elite, List of Locations",
      url: "https://www.eliteperformanceprepacademy.com/list-of-locations/",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Network: Freeport is one of 19 Elite Performance Prep Academy centers (parent company Elite Academics, Las Vegas). The center page is on the network's LeadConnector site, and the network runs one application form for every center at apply.eliteacademics.net. Decide whether to pitch the owners directly or the network.",
    "Uses Elite Performance Prep Academy's Elite Academics application: decide whether to pitch replacing it",
    "Charlotte Jones is also an owner and runs admissions. Consider sending to her, or copying her, since the angle touches enrollment.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds).",
    "We'd build: Monthly billing for clubs, after-care or add-on classes.",
    "Step Up for Students is work-alongside; T48 Athletics bills PE directly and stays separate.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "8gHGvXXUqegO3bcZd5MlQA",
    preparedOn: "2026-11-23",
    summary:
      "We read the Freeport center page on Nov 23, 2026, plus the Elite network's locations page and its application form.",
    pageSpeed: { mobileScore: 81, url: "https://freeport.eliteperformanceprepacademy.com/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "apply",
        gap: "The Freeport page has no way to apply",
        saw: "The center page offers \"View Programs\" and \"Schedule a Tour\". The application lives on the main Elite site, where families pick their center from a list.",
        impact: "A Freeport family ready to apply has to leave the center page and find the network's form on its own.",
        source: "Elite Freeport center page; Elite application",
        url: "https://freeport.eliteperformanceprepacademy.com/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "An application on the Freeport site itself, landing in your own admin inbox next to every tour request.",
        },
      },
      {
        area: "find",
        gap: "Two price lists, without saying who gets which",
        saw: "The page lists \"Elite founding members tuition\" and a higher \"elite microschool tuition\" for the same programs. It doesn't say who counts as a founding member or until when.",
        impact: "A family can't tell which price they'd pay, or whether to enroll now to get the lower one.",
        source: "Elite Freeport center page, Academic Programs",
        url: "https://freeport.eliteperformanceprepacademy.com/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "discounts", "website-service"],
          text: "Founding-member pricing set up as its own rate with an end date, and sibling discounts applied automatically.",
        },
      },
      {
        area: "pay",
        gap: "How families pay each month isn't shown",
        saw: "Every program is priced by the year or by the month, with a registration fee and sibling discounts. The page doesn't say how families pay or set up monthly payments.",
        impact: "A family choosing monthly can't see how they'll pay it, or what the sibling discount comes to.",
        source: "Elite Freeport center page, Academic Programs",
        url: "https://freeport.eliteperformanceprepacademy.com/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families pick yearly or monthly, see their balance, and pay by card or bank automatically.",
        },
      },
      {
        area: "pay",
        gap: "Electives have their own monthly fee and registration",
        saw: "Premium electives are $200 a month full time or $125 part time, with their own registration fee. PE is $189 a month paid directly to T48 Athletics.",
        impact: "A family with tuition, electives and PE keeps track of three monthly amounts, one of them paid to another company.",
        source: "Elite Freeport center page, Premium Electives",
        url: "https://freeport.eliteperformanceprepacademy.com/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "parent-billing"],
          text: "We'd set up elective fees to bill with tuition on one monthly statement; PE stays with T48.",
        },
      },
      {
        area: "pay",
        gap: "Step Up families' share isn't shown",
        saw: "The page says Elite is an approved Step Up For Students provider and links to Step Up's site. It doesn't say what a scholarship covers here or how a family pays the rest.",
        impact: "A Step Up family can't see what their scholarship pays and what they'd still owe each month.",
        source: "Elite Freeport center page",
        url: "https://freeport.eliteperformanceprepacademy.com/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing with you so Step Up's share and the family's share show side by side.",
        },
      },
      {
        area: "website",
        gap: "The page gives two different school weeks",
        saw: "Location Logistics lists hours as Monday to Friday, 9:00 to 1:30. Each program's schedule says 9 to 1:30, Monday to Thursday.",
        impact: "A family can't tell whether Friday is a school day.",
        source: "Elite Freeport center page",
        url: "https://freeport.eliteperformanceprepacademy.com/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and keep the site up to date for you, with one schedule shown everywhere.",
        },
      },
    ],
    toolStack: [
      {
        name: "Google Calendar booking",
        usedFor: "Tour booking",
        url: "https://freeport.eliteperformanceprepacademy.com/",
      },
      {
        name: "Elite Academics application",
        usedFor: "Application for every Elite center",
        url: "https://apply.eliteacademics.net/apply",
        network: "Elite Performance Prep Academy",
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Elite Freeport",
    founder: {
      fullName: "Trent and Stephanie Robertson",
      firstName: "Trent and Stephanie",
      role: "Owners | Center Managers",
      source: "Elite Freeport center page, Center Leadership",
      url: "https://freeport.eliteperformanceprepacademy.com/",
    },
    mailTo: {
      lines: ["Trent and Stephanie Robertson", "Elite Performance Prep Academy", "13295 Business 331 A100", "Freeport, FL 32439"],
      source: "Elite Freeport center page, Location Logistics (\"13295 Business 331 A100, Freeport FL 32439\")",
      url: "https://freeport.eliteperformanceprepacademy.com/",
    },
    founderFacts: [
      {
        fact: "Elite Freeport is offering founding-members tuition to its first families, with premium electives (art, cooking, PE with T48 Athletics) on Monday and Wednesday.",
        source: "Elite Freeport center page",
        url: "https://freeport.eliteperformanceprepacademy.com/",
        readOn: "2026-11-23",
      },
      {
        fact: "Trent and Stephanie Robertson own and manage the center; the page says they create a high-standard, relationship-driven environment where students feel confident, supported and connected.",
        source: "Elite Freeport center page, Center Leadership",
        url: "https://freeport.eliteperformanceprepacademy.com/",
        readOn: "2026-11-23",
      },
    ],
    hook: "Elite Freeport is offering founding-members tuition to its first families, with premium electives (art, cooking, PE with T48 Athletics) on Monday and Wednesday.",
    body: `Hi Trent and Stephanie,

Congratulations on opening Elite in Freeport, with founding-member tuition for your first families and cooking and art on elective days. Opening a new center asks a lot, and yours looks well underway.

We remember those first months well. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Elite Freeport.

I'd love to hear how your founding families found you.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Trent and Stephanie, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "elitefreeport-a5df",
    checkBeforeMailing: [
      "The iTunes search for Stephanie Robertson returned only other people (a teacher-tips episode didn't name Elite or Freeport); the hook is from the center page.",
      "The page doesn't say when Freeport opened; \"founding members\" tuition suggests it's new. Check the center's Instagram before mailing.",
      "Charlotte Jones is the third owner (admissions); the letter goes to the Robertsons as center managers.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about tracking tuition, electives and Step Up each month, then who's asking and one proof number",
      subject: "Monthly billing at Elite Freeport",
      body: `Hi Trent and Stephanie,

I mailed you a handwritten note last week with a card for Elite Freeport.

Your Freeport page lists founding-member tuition by the year or month, premium electives with their own monthly fee, and Step Up for Students as a way to pay.

With that mix, how do you keep track of what each family owes each month?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Trent and Stephanie,

In case it's easier to see than describe, I set up a version of MudKitchen for Elite Freeport and recorded a 60-second walkthrough: a tour request landing in your admin inbox, the enrollment checklist with the registration fee, and a family paying monthly by card or bank.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Elite Freeport is, with no pitch",
      where: "Instagram (eliteacademy_freeportfl)",
      body: "Hi Trent and Stephanie, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Cooking and art as electives at a K–8 microschool is a great mix.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Trent and Stephanie,

I also put together a one-page snapshot of what a family sees on your Freeport page today, from finding a price to paying tuition. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Trent and Stephanie,

I'll leave it here so I'm not cluttering your inbox. The Elite Freeport version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
