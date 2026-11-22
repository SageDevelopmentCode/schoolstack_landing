import type { OutreachPlan } from "./types";

export const theWoodlandsMicroschoolOutreach: OutreachPlan = {
  slug: "the-woodlands-microschool",
  schoolName: "The Woodlands Microschool",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Dana",
    role: "Director",
    source: "Who We Are page: \"Our Director, Dana Yancy\" (\"Ms. Dana\"), who founded Champs Educational Services before it became The Woodlands Microschool",
  },
  angle:
    "Re-contact with a snapshot: the homepage leads with TEFA, but the TEFA link goes nowhere and a TEFA family still owes part of the $13,500 tuition",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to The Woodlands Microschool MudKitchen demo",
  },
  facts: [
    {
      fact: "The homepage says \"We Accept Texas Education Freedom Accounts\"; its \"Learn more about TEFA\" button and the homepage \"Schedule a Tour\" button both link to \"#\" and go nowhere",
      source: "The Woodlands Microschool homepage",
      url: "https://thewoodlandsmicroschool.com/",
      readOn: "2026-11-22",
    },
    {
      fact: "Elementary & Jr High (3rd–8th) and High School are $13,500 per academic year including the enrollment fee, 9am–1pm Monday–Thursday, with 12-month payment plans",
      source: "The Woodlands Microschool 3rd to 6th Gr and Jr High",
      url: "https://thewoodlandsmicroschool.com/3rd-to-6th-gr-and-jr-high",
      readOn: "2026-11-22",
    },
    {
      fact: "Six admissions steps for 2026–27: informational tour, application, testing if needed, shadow day, enrollment contract and registration fee, then a counselor meeting for an individualized plan",
      source: "The Woodlands Microschool Admissions",
      url: "https://thewoodlandsmicroschool.com/admissions",
      readOn: "2026-11-22",
    },
    {
      fact: "TEFA pays $10,474 per child at an approved private school for 2026–27",
      source: "Texas Education Freedom Accounts: Schools",
      url: "https://educationfreedom.texas.gov/schools/",
      readOn: "2026-11-22",
    },
    {
      fact: "The Student Handbook linked from the Calendar page is the 2019–2020 edition; it lists school hours as 9:00–3:00 and has printed signature pages returned as a condition of enrollment",
      source: "The Woodlands Microschool Student Handbook (PDF)",
      url: "https://thewoodlandsmicroschool.com/calendar",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June (the first email says so).",
    "Find Dana Yancy's current email; the site's tour buttons open an email to her older Champs Learning address, and the CRM has no contact.",
    "Confirm the \"Learn more about TEFA\" button still goes nowhere before sending (the first email names it).",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
  ],
  snapshot: {
    token: "ThrKeWDSyIQAPTNgSbvS1A",
    preparedOn: "2026-12-01",
    summary:
      "We read all 11 pages of thewoodlandsmicroschool.com on Dec 1, 2026, and the 38-page Student Handbook linked from the Calendar.",
    pageSpeed: { mobileScore: 77, url: "https://thewoodlandsmicroschool.com/", checkedOn: "2026-12-01" },
    observations: [
      {
        area: "find",
        gap: "\"Learn more about TEFA\" doesn't go anywhere",
        saw: "The homepage leads with \"We Accept Texas Education Freedom Accounts\". Its \"Learn more about TEFA\" button jumps back to the top of the same page.",
        impact: "TEFA is the reason many families are looking right now, and the one button about it leaves them where they started.",
        source: "The Woodlands Microschool homepage",
        url: "https://thewoodlandsmicroschool.com/",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "Your demo answers \"Do you accept TEFA?\" next to tuition, and the site we build and keep up for you has every button going somewhere.",
        },
      },
      {
        area: "tour",
        gap: "Booking a tour means writing an email",
        saw: "Book a Tour and Schedule a Tour open a blank email to the director, and the homepage Schedule a Tour button goes nowhere. Step 1 of admissions is attending a tour.",
        impact: "Every family's first step waits on an email back and forth to find a time, during a four-hour teaching day.",
        source: "The Woodlands Microschool 3rd to 6th Gr and Jr High",
        url: "https://thewoodlandsmicroschool.com/3rd-to-6th-gr-and-jr-high",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick an informational tour from the times you open, and get a reminder before they come.",
        },
      },
      {
        area: "apply",
        gap: "Step 2 is an application families can't find",
        saw: "Admissions lists \"Complete and Submit the Application\" as step 2. No page links to an application or says how to get one.",
        impact: "After the tour, families wait for you to send the application, and you track who has it and who sent it back.",
        source: "The Woodlands Microschool Admissions",
        url: "https://thewoodlandsmicroschool.com/admissions",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families apply online from your site, and every tour request and application lands in one admin inbox with where each family is.",
        },
      },
      {
        area: "enroll",
        gap: "The handbook families sign is the 2019–2020 edition",
        saw: "The Student Handbook on the Calendar page is dated 2019–2020, lists hours as 9:00–3:00 (the site says 9–1), and ends with printed signature pages that must be returned to enroll.",
        impact: "New families sign policies that don't match today's four-hour day, and each signed page is paper you file by hand.",
        source: "The Woodlands Microschool Calendar (Student Handbook PDF)",
        url: "https://thewoodlandsmicroschool.com/calendar",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: the enrollment contract and handbook signed online, then the registration fee paid, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "TEFA families pay from two places",
        saw: "Tuition is $13,500 and TEFA pays $10,474 for 2026–27. The site doesn't say how the TEFA amount is applied or what the family still owes, about $3,026.",
        impact: "A TEFA family can't see their own share, and you match TEFA payments against each family by hand.",
        source: "Texas Education Freedom Accounts: Schools",
        url: "https://educationfreedom.texas.gov/schools/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing"],
          text: "We'd set up billing so the TEFA portion is recorded against each family and they only see and pay what's left.",
        },
      },
      {
        area: "pay",
        gap: "12-month plans with no way to pay online",
        saw: "Each program offers 12-month payment plans. The handbook covers paying by check (with a driver license number and date of birth) and a $35 returned-check fee.",
        impact: "Monthly payments for every family come in by hand, and families can't see what they've paid or what's next.",
        source: "The Woodlands Microschool High School",
        url: "https://thewoodlandsmicroschool.com/high-school",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families choose the 12-month plan or pay in full in their portal and turn on autopay by card or bank.",
        },
      },
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro: acknowledge the June email, give a new reason (the snapshot), one proof number",
      subject: "TEFA at The Woodlands Microschool",
      body: `Hi Dana,

I wrote in June about a version of MudKitchen I set up for The Woodlands Microschool. Since then I put together a one-page snapshot of what a family sees on your site today, from booking a tour to paying tuition.

One thing stood out: your homepage leads with TEFA, but the "Learn more about TEFA" button doesn't go anywhere, and at $13,500 a TEFA family still owes about $3,026 after the state's $10,474.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Dana,

In case it's easier than clicking around, I recorded a 60-second walkthrough of The Woodlands version: a family booking a tour, what a parent sees for tuition, and your admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello with no pitch",
      where: "Facebook or LinkedIn (The Woodlands Microschool / Dana Yancy)",
      body: "Hi Dana, I'm Julius. I run Sage Field, a microschool up in Round Rock. I like the four-hour day with Fridays kept for make-up work.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Dana,

Here's the snapshot, no reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Dana,

I'll leave it here so I'm not cluttering your inbox. The Woodlands version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the spring semester.

Julius`,
    },
  ],
};
