import type { OutreachPlan } from "./types";

export const prestigeHomeschoolAcademyOutreach: OutreachPlan = {
  slug: "prestige-homeschool-academy",
  schoolName: "Prestige Homeschool Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Amber",
    role: "Director",
    source: "Prestige Meet The Teachers page (Amber Merrell, Prestige Homeschool Academy director)",
  },
  angle: "Re-contact with a snapshot: $400 a month, month to month, with Step Up accepted and no stated way to pay",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the Prestige MudKitchen demo",
  },
  facts: [
    {
      fact: "Tuition is $400 a month per student for the 2-day option, plus a $200 non-refundable registration deposit. The school is month to month and bills monthly",
      source: "Prestige Frequently Asked ?",
      url: "https://prestigehomeschoolacademy.com/frequently-asked-%3F",
      readOn: "2026-11-22",
    },
    {
      fact: "Accepts the Step Up For Students scholarship; families pick the school from a drop-down on the Step Up site",
      source: "Prestige Frequently Asked ?",
      url: "https://prestigehomeschoolacademy.com/frequently-asked-%3F",
      readOn: "2026-11-22",
    },
    {
      fact: "Three drop-off options: Mon/Wed subject-based 9–2, Tue/Thu with project-based life skills 9–2, or all four days. Classes max out at 12",
      source: "Prestige What We Do",
      url: "https://prestigehomeschoolacademy.com/what-we-do",
      readOn: "2026-11-22",
    },
    {
      fact: "Registration for 2026–27 runs on Jotform; the $200 fee is invoiced once a student is accepted",
      source: "Prestige Homeschool Academy 2026/2027 Registration Form (Jotform)",
      url: "https://form.jotform.com/260774644105154",
      readOn: "2026-11-22",
    },
    {
      fact: "Tours run on select Mondays and are requested by email",
      source: "Prestige Contact Us",
      url: "https://prestigehomeschoolacademy.com/contact-us",
      readOn: "2026-11-22",
    },
    {
      fact: "Every student does two community-focused service projects a year",
      source: "Prestige home page",
      url: "https://prestigehomeschoolacademy.com/",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June (the first email says so).",
    "Confirm Amber Merrell is still the director (listed on Meet The Teachers as Prestige Homeschool Academy director).",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
  ],
  snapshot: {
    token: "8crm_ASDXBm9HHhg-hmeyA",
    preparedOn: "2026-11-22",
    summary:
      "We read all 6 pages of prestigehomeschoolacademy.com and both registration forms it links to on Nov 22, 2026.",
    toolStack: [
      { name: "Jotform", usedFor: "Registration form", url: "https://prestigehomeschoolacademy.com/" },
      { name: "Brightwheel", usedFor: "Check-in and check-out", url: "https://prestigehomeschoolacademy.com/frequently-asked-%3F" },
    ],
    observations: [
      {
        area: "find",
        gap: "Only the 2-day price is on the site",
        saw: "The FAQ gives $400 a month for the 2-day option. The Tuesday/Thursday class and the 4-day program have no price anywhere on the site.",
        impact: "A family weighing the 4-day program has to email to learn what it costs before they can compare.",
        source: "Prestige Frequently Asked ?",
        url: "https://prestigehomeschoolacademy.com/frequently-asked-%3F",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "The site we build for you lists each option with its days, hours and monthly price, and marks each class Open, Waitlist or Full.",
        },
      },
      {
        area: "tour",
        gap: "Tours are requested by email",
        saw: "The Contact page says tours run on select Mondays. The Schedule a tour button opens a blank email, and Book Tour on the home page leads to that same page.",
        impact: "Each tour takes a few emails to find a Monday that works, and a family who writes in the evening waits for an answer.",
        source: "Prestige Contact Us",
        url: "https://prestigehomeschoolacademy.com/contact-us",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick one of the Monday tour slots you open, and get a reminder before they come.",
        },
      },
      {
        area: "apply",
        gap: "Two Register Now buttons open two different forms",
        saw: "Register Now on the home page and Sign me up! on Contact open a Jotform titled 2025/26 Registration. The Register Now! banner on every page opens a copy titled Clone of 2025/26 Registration.",
        impact: "New registrations land in two places, so you check both, and a family sees last year's form name in their browser tab.",
        source: "Prestige home page",
        url: "https://prestigehomeschoolacademy.com/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "One online application for 2026–27, with every registration in one admin inbox, whichever button a family clicks.",
        },
      },
      {
        area: "enroll",
        gap: "The $200 fee comes as a separate invoice",
        saw: "The registration form says the $200 non-refundable fee is invoiced after a student is accepted, and that invoice secures the spot.",
        impact: "A spot isn't held until a second message is paid, and you track which accepted families have paid yourself.",
        source: "Prestige Homeschool Academy 2026/2027 Registration Form",
        url: "https://form.jotform.com/260774644105154",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-fees"],
          text: "Accepted families get one checklist with the $200 fee paid inside it, and reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say how monthly tuition is paid",
        saw: "The FAQ says Prestige bills monthly, month to month, and an unpaid spot can go to the waitlist. It doesn't say how families pay each month or whether they can set up automatic payments.",
        impact: "Every month you send bills and check who has paid, and a family who misses one risks their child's spot.",
        source: "Prestige Frequently Asked ?",
        url: "https://prestigehomeschoolacademy.com/frequently-asked-%3F",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "autopay", "card-and-ach"],
          text: "Each family sees their monthly bill in their portal and can turn on autopay by card or bank, so the $400 comes in on its own.",
        },
      },
      {
        area: "pay",
        gap: "Step Up families can't see what they still owe",
        saw: "Prestige accepts the Step Up For Students scholarship, and families find the school in Step Up's drop-down. The site doesn't say how the scholarship is applied to $400 a month or what the family pays.",
        impact: "A Step Up family can't see their own share, and you match scholarship payments to each family by hand.",
        source: "Prestige Frequently Asked ?",
        url: "https://prestigehomeschoolacademy.com/frequently-asked-%3F",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing"],
          text: "We'd set up billing so the Step Up portion is recorded against each family and they only see and pay what's left.",
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
      subject: "Prestige's month-to-month tuition",
      body: `Hi Amber,

I wrote in June about a version of MudKitchen I set up for Prestige. Since then I put together a one-page snapshot of what a family sees on your site today, from the Register Now button to monthly tuition.

One thing stood out: tuition is $400 a month, month to month, with Step Up accepted, but the site doesn't say how families pay each month or how Step Up is applied.

I run Sage Field, a microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Amber,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Prestige version: your Mon/Wed, Tue/Thu and 4-day options, registration, and what a parent sees for monthly tuition.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Instagram or Facebook (prestigehomeschoolniceville)",
      body: "Hi Amber, I'm Julius. I run Sage Field, a microschool in Round Rock, TX. Love that every Prestige student does two community service projects a year.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Amber,

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
      body: `Hi Amber,

I'll leave it here so I'm not cluttering your inbox. The Prestige version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the school year.

Julius`,
    },
  ],
};
