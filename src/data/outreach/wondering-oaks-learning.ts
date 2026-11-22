import type { OutreachPlan } from "./types";

export const wonderingOaksLearningOutreach: OutreachPlan = {
  slug: "wondering-oaks-learning",
  schoolName: "Wondering Oaks Learning",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Christian",
    role: "Director/Founder (no longer on site; the Staff page says she is \"always available for questions\")",
    source:
      "Staff page: Christian Rust (Ms. Christian), Director/Founder, now living abroad. No current director or teacher is named on the site; the demo's Ms. Lisa and Ms. Laura have no source we could open",
  },
  angle:
    "Re-contact with a snapshot: the registration form never asks how to reach the family, and tuition, payment and calendar files are all from 2022–23",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the Wondering Oaks MudKitchen demo, most likely to the school's shared inbox",
  },
  facts: [
    {
      fact: "The Student Registration Form (Google Form) asks for the parent's name and the child's name, birthday, reading and math levels, program and reasons, but no email or phone, and says \"Someone will get back to you soon!\"",
      source: "Wondering Oaks Student Registration Form",
      url: "https://forms.gle/EShfwCpT5F9nAkiN7",
      readOn: "2026-11-22",
    },
    {
      fact: "Full time is $4,500 a year for 3 days ($375 monthly) or $5,500 for 4 days ($500 monthly), covering August through June; part time is $40 a day; supply fees are $100 per weekly day; 5% off for annual payment and a 30% sibling discount",
      source: "Wondering Oaks Tuition",
      url: "https://www.wonderingoakslearning.com/tuition",
      readOn: "2026-11-22",
    },
    {
      fact: "The tuition sheet linked from Registration is for 2022–2023: monthly tuition is annual tuition divided by 11, and Zelle is the preferred payment method, then PayPal, Venmo or Cash App (Friends/Family)",
      source: "Wondering Oaks Tuition and Fees 2022–2023 (PDF)",
      url: "https://www.wonderingoakslearning.com/_files/ugd/fc27d2_535e943a70724c94b09f3eb821bef48f.pdf",
      readOn: "2026-11-22",
    },
    {
      fact: "Registration links a 2022–2023 calendar and a 10-page Safety and Health Forms packet to drop off at a scheduled visit or email in before the first day",
      source: "Wondering Oaks Registration",
      url: "https://www.wonderingoakslearning.com/registration",
      readOn: "2026-11-22",
    },
    {
      fact: "Visits are by appointment only because the school shares property with a family photographer",
      source: "Wondering Oaks homepage",
      url: "https://www.wonderingoakslearning.com/",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June, and to which address (the first email says June).",
    "Confirm who runs Wondering Oaks now. The Staff page names only founder Christian Rust, who has moved abroad; the demo names Ms. Lisa and Ms. Laura but no page we could open does. If one of them leads it, change the first name in every step.",
    "Confirm the school is running in 2026–27: the calendar and tuition sheet are 2022–23 and the last public Facebook post we could see is from March 2023.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "5r3KO_M4yh3E_B28kzk5Fg",
    preparedOn: "2026-11-22",
    summary:
      "We read all 11 pages of wonderingoakslearning.com on Nov 22, 2026, plus the registration form, the tuition sheet, the calendar and the 10-page health forms packet.",
    pageSpeed: { mobileScore: 82, url: "https://www.wonderingoakslearning.com/", checkedOn: "2026-11-22" },
    toolStack: [
      { name: "Google Forms", usedFor: "Student registration", url: "https://www.wonderingoakslearning.com/registration" },
      {
        name: "Zelle",
        usedFor: "Tuition and supply fees (preferred)",
        url: "https://www.wonderingoakslearning.com/_files/ugd/fc27d2_535e943a70724c94b09f3eb821bef48f.pdf",
      },
      {
        name: "PayPal, Venmo or Cash App",
        usedFor: "Tuition when Zelle isn't used",
        url: "https://www.wonderingoakslearning.com/_files/ugd/fc27d2_535e943a70724c94b09f3eb821bef48f.pdf",
      },
    ],
    observations: [
      {
        area: "apply",
        gap: "The registration form never asks how to reach the family",
        saw: "The Student Registration Form asks for your name, your child's name, birthday, reading and math level and why you're interested, then says someone will get back to you soon. There's no field for an email or phone number.",
        impact: "A family can register and never hear back, because there's no way to reply to them unless they also email you.",
        source: "Wondering Oaks Student Registration Form",
        url: "https://forms.gle/EShfwCpT5F9nAkiN7",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Your demo's inquiry form takes the parent's contact details with the child's, and every inquiry lands in one admin inbox for follow-up.",
        },
      },
      {
        area: "find",
        gap: "The 3-day monthly price doesn't add up to the yearly one",
        saw: "Tuition lists 3 days a week at $4,500 ($375 monthly). The tuition sheet says monthly is the yearly amount divided by 11 payments, and 11 payments of $375 come to $4,125.",
        impact: "A family on the monthly plan can't tell whether they owe $4,125 or $4,500 for the year until they ask.",
        source: "Wondering Oaks Tuition",
        url: "https://www.wonderingoakslearning.com/tuition",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "discounts"],
          text: "We'd set up annual, 11-month and per-day pricing once, with the 5% pay-in-full and sibling discounts worked out for each family.",
        },
      },
      {
        area: "tour",
        gap: "Visits are by appointment, with no way to book one",
        saw: "The homepage asks \"Ready to Come Visit?\" and explains visits are by appointment only, then offers a name, email and message form.",
        impact: "Each visit takes a few messages to set up, and a family can't see when you're free.",
        source: "Wondering Oaks homepage",
        url: "https://www.wonderingoakslearning.com/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a visit from the times you open, with the address and parking notes sent only after they book.",
        },
      },
      {
        area: "enroll",
        gap: "Health and safety forms are a 10-page packet to print",
        saw: "Registration links a 10-page PDF (emergency contacts, health information, first aid form, waivers and policies) to drop off at a scheduled visit or email in before the first day.",
        impact: "Each family prints, signs and returns ten pages, and you check every packet by hand before day one.",
        source: "Wondering Oaks Registration",
        url: "https://www.wonderingoakslearning.com/registration",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: the waivers and policies signed online and the supply fee paid, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "Tuition goes through Zelle and friends-and-family apps",
        saw: "The tuition sheet asks families to pay by Zelle, or PayPal, Venmo or Cash App as Friends/Family, on the 1st or split across the 1st and 15th.",
        impact: "Payments arrive in different apps with no invoice, so you match each one to a family by hand and families keep their own records.",
        source: "Wondering Oaks Tuition and Fees 2022–2023 (PDF)",
        url: "https://www.wonderingoakslearning.com/_files/ugd/fc27d2_535e943a70724c94b09f3eb821bef48f.pdf",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families choose annual or monthly in their portal, pay by card or bank, and can turn on autopay. You see every balance in one place.",
        },
      },
      {
        area: "website",
        gap: "The calendar and tuition sheet are from 2022–2023",
        saw: "About and Registration link \"See 2022-2023 Calendar\", and the tuition sheet is titled for the 2022–2023 school year with a pay-by date of August 15, 2022.",
        impact: "A family checking dates for this year can't tell whether Wondering Oaks is open or what it costs now.",
        source: "Wondering Oaks About",
        url: "https://www.wonderingoakslearning.com/about",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "website-service"],
          text: "A school calendar families see in their portal, and a site we keep current for you each year.",
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
      subject: "Wondering Oaks registration form",
      body: `Hi Christian,

I wrote in June about a version of MudKitchen I set up for Wondering Oaks. Since then I put together a one-page snapshot of what a family sees on your site today, from registering to paying tuition.

One thing stood out: the Student Registration form asks about the child but not for an email or phone, so a family can send it without any way for you to reach them.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Christian,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Wondering Oaks version: the registration form, what a parent sees for tuition, and the admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello on the school's page, with no pitch",
      where: "Facebook (wonderingoakslearning)",
      body: "Hi, I'm Julius. I run Sage Field, an outdoor microschool up in Round Rock. Love that Wondering Oaks keeps Fridays for Free Forest School and field trips.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Christian,

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
      body: `Hi Christian,

I'll leave it here so I'm not cluttering your inbox. The Wondering Oaks version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the spring term.

Julius`,
    },
  ],
};
