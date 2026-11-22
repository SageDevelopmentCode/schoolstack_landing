import type { OutreachPlan } from "./types";

export const micahsMissionSchoolOutreach: OutreachPlan = {
  slug: "micahs-mission-school",
  schoolName: "Micah's Mission School",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Emily",
    role: "Founder, President & Chief Visionary Officer",
    source: "micahsmissionschool.org home page, Meet the Administrator (Dr. Emily Harber Williams)",
  },
  angle: "Re-contact with a snapshot: sponsorships and tuition use the same $5,000 semesters, but the site doesn't say how a gift reaches a family's bill",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the Micah's Mission MudKitchen demo",
  },
  facts: [
    {
      fact: "Dr. Emily Harber Williams is Founder, President & Chief Visionary Officer",
      source: "Micah's Mission home page",
      url: "https://micahsmissionschool.org/index.html",
      readOn: "2026-11-22",
    },
    {
      fact: "Private Microschool (K–12, 7 seats) and Hybrid Homeschool (15 seats) are $30 per day; the same page lists Fall $5,000, Spring $5,000 and Summer $2,000 semesters, $12,000 a year",
      source: "Micah's Mission Enrollment",
      url: "https://micahsmissionschool.org/enrol.html",
      readOn: "2026-11-22",
    },
    {
      fact: "The registration packet is requested by email; there is no online application",
      source: "Micah's Mission Enrollment",
      url: "https://micahsmissionschool.org/enrol.html",
      readOn: "2026-11-22",
    },
    {
      fact: "A 501(c)3 funded through tuition, grants and donations, with the goal that every student who needs it is fully funded",
      source: "Micah's Mission About Us",
      url: "https://micahsmissionschool.org/about_us.html",
      readOn: "2026-11-22",
    },
    {
      fact: "Sponsor a Student levels include a $5,000 Fall semester, $5,000 Spring and $2,000 Summer, given through PayPal",
      source: "Micah's Mission Sponsor a Student",
      url: "https://micahsmissionschool.org/donate",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June (the first email says so).",
    "Confirm Micah's is open and enrolling for 2026–27: the site has no current-year dates, and its latest dated items are from 2024.",
    "Confirm the greeting: she signs \"Dr. Em\" on the site; \"Hi Emily\" may need to be \"Hi Dr. Harber Williams\".",
    "The sponsorship page is a memorial fund for a former student: never mention it beyond \"Sponsor a Student\".",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
  ],
  snapshot: {
    token: "VgV1bgUGF8q99KGLqY0xuQ",
    preparedOn: "2026-11-22",
    summary:
      "We read all 10 pages of micahsmissionschool.org on Nov 22, 2026, from Enrollment and About Us to Sponsor a Student and Fundraisers.",
    observations: [
      {
        area: "find",
        gap: "Two tuition figures for the same programs",
        saw: "The Enrollment page lists the Private Microschool and Hybrid Homeschool at $30 per day, then lists tuition for both as Fall $5,000, Spring $5,000 and Summer $2,000, $12,000 a year.",
        impact: "A family can't tell whether they'd pay by the day or by the semester, so they email to ask before going further.",
        source: "Micah's Mission Enrollment",
        url: "https://micahsmissionschool.org/enrol.html",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service", "parent-plan-choice"],
          text: "The site we build shows one clear price for each program, and families pick the same plan in their portal when they enroll.",
        },
      },
      {
        area: "tour",
        gap: "There's no way to arrange a visit online",
        saw: "The site doesn't mention visits or tours. The Contact page has the open hours and a general form with a name, an email and a message box.",
        impact: "A family who wants to see the school before enrolling has to write in and wait for a time.",
        source: "Micah's Mission Contact Us",
        url: "https://micahsmissionschool.org/contact.html",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a visit time from the slots you open, and get a reminder before they come.",
        },
      },
      {
        area: "apply",
        gap: "The registration packet is by email request",
        saw: "Under \"Registration Packet?\" the Enrollment page asks families to request information by email. There is no application on the site.",
        impact: "Every family waits for a reply before they can start, and you send each packet by hand.",
        source: "Micah's Mission Enrollment",
        url: "https://micahsmissionschool.org/enrol.html",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families apply online from the Enrollment page, any time of day, and every application lands in one admin inbox.",
        },
      },
      {
        area: "enroll",
        gap: "What's in the packet isn't described",
        saw: "The site doesn't say what the registration packet holds or how it's returned and signed. Hybrid families must also register with the truancy officer as homeschoolers before school begins.",
        impact: "Every family gets their forms a different way, and you track who has finished what yourself.",
        source: "Micah's Mission About Us",
        url: "https://micahsmissionschool.org/about_us.html",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: the registration forms, the enrollment agreement signed online, and the first payment, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "Tuition has no way to pay online",
        saw: "The only payment buttons on the site are PayPal donations for fundraisers and sponsorships. The site doesn't say how families pay tuition or whether a $5,000 semester can be split.",
        impact: "Families ask how to pay, and each semester's payments are collected and recorded by hand.",
        source: "Micah's Mission Enrollment",
        url: "https://micahsmissionschool.org/enrol.html",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families see their balance in their portal, pick a plan (by semester or monthly) and pay by card or bank, with autopay if they want it.",
        },
      },
      {
        area: "pay",
        gap: "Sponsorships aren't tied to a family's bill",
        saw: "Sponsor a Student takes gifts by the day, the month or the $5,000 semester through PayPal, and the school's goal is for every student to be fully funded. The site doesn't say how a gift is applied to a family's tuition.",
        impact: "A sponsored family can't see what's covered and what they still owe, and you match PayPal gifts to students yourself.",
        source: "Micah's Mission Sponsor a Student",
        url: "https://micahsmissionschool.org/donate",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing"],
          text: "We'd set up billing so a sponsorship or grant is recorded against the student's tuition, and the family only sees and pays what's left.",
        },
      },
      {
        area: "website",
        gap: "Placeholder social links and 2024 dates",
        saw: "The Facebook, Twitter and LinkedIn icons on the Contact page go to placeholder addresses. The Services page looks ahead to a baptism at the summer 2024 camp, and the Fundraisers page lists the Horse Show for September 21, 2024.",
        impact: "A family checking whether the school is active finds dates from two years ago and social links that lead nowhere.",
        source: "Micah's Mission Contact Us",
        url: "https://micahsmissionschool.org/contact.html",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and keep the site up to date for you, with your real Facebook page and this year's events.",
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
      subject: "sponsored students at Micah's",
      body: `Hi Emily,

I wrote in June about a version of MudKitchen I set up for Micah's Mission. Since then I put together a one-page snapshot of what a family sees on your site today, from finding tuition to paying it.

One thing stood out: Sponsor a Student uses the same $5,000 semesters as tuition, and your goal is for every student to be fully funded. The site doesn't say how a gift reaches a family's bill.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Emily,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Micah's Mission version: the homepage, what a parent sees for enrollment and tuition, and your admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Facebook (micahsmissionschool)",
      body: "Hi Emily, I'm Julius. I run Sage Field, a small microschool in Round Rock, TX. I enjoyed reading about the Safe Harbor Sips coffee truck and your pre-work skills program.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Emily,

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
      body: `Hi Emily,

I'll leave it here so I'm not cluttering your inbox. The Micah's Mission version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the school year.

Julius`,
    },
  ],
};
