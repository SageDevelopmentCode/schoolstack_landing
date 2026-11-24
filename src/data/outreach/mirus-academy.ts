import type { OutreachPlan } from "./types";

export const mirusAcademyOutreach: OutreachPlan = {
  slug: "mirus-academy",
  schoolName: "Mirus Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Laura and Scott",
    role: "School Founders (Laura Hogan, Academic Administrator; Scott Hogan, Business Administrator)",
    source: "Mirus Academy Contact Us page (\"School Administrators\")",
  },
  priorContact: {
    when: "May",
    what: "A hand-sent first email with a link to the Mirus MudKitchen demo",
  },
  angle:
    "Re-contact with the Family experience snapshot. Why now: TEFA starts this year and Mirus is eligible; at $19,120 tuition and $10,474 from TEFA, a TEFA family still owes about $8,646 across six payment plans that are only listed in a PDF.",
  facts: [
    {
      fact: "Mirus Academy is a private high school for 8th–12th grade in Old Town Katy, founded in 2006, with 25–30 students and 5–6 staff, accredited by Cognia and NIPSA",
      source: "Mirus Academy, About and FAQ",
      url: "https://www.mirus-academy.org/about",
      readOn: "2026-11-23",
    },
    {
      fact: "2026–27 tuition is $19,120 with six payment plans (annual, semester, 10 or 12 months with autodraft or monthly billing, the monthly-billing options costing more) plus fees including an $800 registration fee and $400 senior fee; all of it is in a PDF linked from the Tuition & Fees page",
      source: "Mirus Academy, 2026–2027 Tuition & Fees PDF",
      url: "https://www.mirus-academy.org/tuition-fees",
      readOn: "2026-11-23",
    },
    {
      fact: "Mirus says it is eligible for TEFA as a fully accredited school in operation for 20 years",
      source: "Mirus Academy, Tuition & Fees and FAQ",
      url: "https://www.mirus-academy.org/faq",
      readOn: "2026-11-23",
    },
    {
      fact: "TEA set the 2026–27 TEFA amount at $10,474 per child at an approved private school",
      source: "Texas Education Freedom Accounts, For Schools",
      url: "https://educationfreedom.texas.gov/schools/",
      readOn: "2026-11-23",
    },
    {
      fact: "The Application for Admissions is four separate pages (general, academic, personal history, recommendations), opened with a shared password printed on the start page; families must first attend an admissions meeting, scheduled by phone, text or email",
      source: "Mirus Academy, Apply for Admission, Application Start Page and Contact Us",
      url: "https://www.mirus-academy.org/application-start-page",
      readOn: "2026-11-23",
    },
    {
      fact: "The Microschools page says Mirus was established in 2006 as something between homeschooling and traditional school, and \"at the time, we had never heard the term 'micro-school'\"",
      source: "Mirus Academy, Microschools",
      url: "https://www.mirus-academy.org/copy-of-about",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in May (the first email says so).",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). TEFA payments go through Odyssey; MudKitchen works alongside it.",
    "Mirus is a high school (grades 8–12), unlike most of our schools. The demo uses grade groups rather than K–8 programs.",
    "Both founders get every step; Scott is the Business Administrator, so you could switch billing follow-ups to him alone.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "pPHnlyMrPs3MN80AxYlALw",
    preparedOn: "2026-11-23",
    summary:
      "We read 60 pages of mirus-academy.org on Nov 23, 2026, plus the 2026–27 tuition sheet and every part of the application.",
    pageSpeed: { mobileScore: 66, url: "https://www.mirus-academy.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Website application forms",
        usedFor: "Four-part Application for Admissions",
        url: "https://www.mirus-academy.org/application-start-page",
      },
      {
        name: "PDF tuition sheet",
        usedFor: "Tuition, payment plans and fees",
        url: "https://www.mirus-academy.org/tuition-fees",
      },
      {
        name: "Google Docs",
        usedFor: "Letters to families on the Announcements page",
        url: "https://www.mirus-academy.org/announcements",
      },
    ],
    observations: [
      {
        area: "pay",
        gap: "TEFA families will pay from two places",
        saw: "Mirus says it's eligible for TEFA. Tuition is $19,120, and TEFA pays $10,474 for 2026–27, so a TEFA family still owes about $8,646. The site doesn't say how that share is billed.",
        impact: "A TEFA family can't see their own share, or which payment plan it falls into, until they ask.",
        source: "Mirus Academy, Tuition & Fees and FAQ; Texas Education Freedom Accounts",
        url: "https://www.mirus-academy.org/tuition-fees",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "autopay"],
          text: "We'd set up each family's billing page to show TEFA's share and their own, with autopay for their part.",
        },
      },
      {
        area: "find",
        gap: "Tuition, plans and fees are only in a PDF",
        saw: "The Tuition & Fees page links to a PDF for the $19,120 tuition, six payment plans and eight kinds of fees. Autodraft plans cost less than monthly billing.",
        impact: "On a phone, families open a separate file to compare plans and fees, and the cheaper autodraft option is easy to miss.",
        source: "Mirus Academy, Tuition & Fees and the 2026–27 tuition sheet",
        url: "https://www.mirus-academy.org/tuition-fees",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "parent-plan-choice", "website-service"],
          text: "All six plans shown on the page and set up once, so families pick one when they enroll and see exactly what each costs.",
        },
      },
      {
        area: "apply",
        gap: "The application is four separate pages behind a shared password",
        saw: "The Application for Admissions is split into Parts 1–4 on separate pages, opened with a shared password printed on the start page. Families upload photos, three years of report cards and test scores, and name two recommenders.",
        impact: "Families keep track of four parts themselves, and anyone reading the start page has the password.",
        source: "Mirus Academy, Application Start Page",
        url: "https://www.mirus-academy.org/application-start-page",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "One application each family saves as they go, with uploads and recommendations tracked in one admin inbox.",
        },
      },
      {
        area: "tour",
        gap: "The admissions meeting is arranged by call, text or email",
        saw: "Every family must first attend an admissions meeting (10:30, Monday–Thursday), scheduled in advance by phone, text or email. The Contact page warns that emails can get lost among spam.",
        impact: "A family who emails may not hear back, and has to call before they can get a meeting on the calendar.",
        source: "Mirus Academy, Contact Us and Apply for Admission",
        url: "https://www.mirus-academy.org/contactus",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a 10:30 admissions meeting slot online, with a confirmation, no email needed.",
        },
      },
      {
        area: "updates",
        gap: "Announcements and the calendar are out of date",
        saw: "The Announcements page lists COVID-era letters to families from 2020–21, as Google Docs. The calendar page shows \"2024-2025\" and \"This service is not available.\"",
        impact: "A family looking for current news or school dates doesn't find them on the site.",
        source: "Mirus Academy, Announcements and Calendar",
        url: "https://www.mirus-academy.org/announcements",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["bulletin", "calendar", "parent-portal"],
          text: "Current announcements and the school calendar in each family's login, with old posts archived.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 66 out of 100 on mobile. The main content takes about 9 seconds to appear, and the page is about 3.9 MB.",
        impact: "A parent or student opening the site on a phone waits several seconds before seeing anything.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://www.mirus-academy.org/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with photos sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Mirus",
    founder: {
      fullName: "Laura Hogan and Scott Hogan",
      firstName: "Laura and Scott",
      role: "School Founders",
      source: "Mirus Academy, Contact Us",
      url: "https://www.mirus-academy.org/contactus",
    },
    mailTo: {
      lines: ["Laura and Scott Hogan", "Mirus Academy", "5506 3rd Street", "Katy, TX 77493"],
      source: "Mirus Academy Contact Us page (\"SCHOOL ADDRESS: 5506 3rd Street Katy, TX 77493\")",
      url: "https://www.mirus-academy.org/contactus",
    },
    founderFacts: [
      {
        fact: "Mirus's Microschools page says the school was established in 2006 as something between homeschooling and traditional school, and that \"at the time, we had never heard the term 'micro-school'.\"",
        source: "Mirus Academy, Microschools",
        url: "https://www.mirus-academy.org/copy-of-about",
        readOn: "2026-11-23",
      },
      {
        fact: "Mirus has stayed at around 25–30 students for over a decade, with no plans to become a large school.",
        source: "Mirus Academy, FAQ",
        url: "https://www.mirus-academy.org/faq",
        readOn: "2026-11-23",
      },
    ],
    hook: "Mirus's Microschools page says the school was established in 2006 as something between homeschooling and traditional school, and that \"at the time, we had never heard the term 'micro-school'.\"",
    body: `Hi Laura and Scott,

I read your page on microschools. You started Mirus in 2006, before you'd ever heard the word "micro-school," and twenty years later it's still 25 to 30 students on purpose.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Mirus.

I'd like to hear how you've kept it that small for twenty years.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your admissions.",
    stickyNote: "Laura and Scott, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "mirus-q2x6",
    checkBeforeMailing: [
      "The address is the school's own, from the Contact Us page.",
      "No podcast or press about the Hogans turned up, so the letter opens on the school's Microschools page.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the May email, the TEFA two-payer detail, one proof number, offer the snapshot",
      subject: "TEFA families at Mirus",
      body: `Hi Laura and Scott,

I mailed you a handwritten note last week with a card for Mirus. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in May) and a one-page snapshot of what a family sees on your site today.

One thing stood out: at $19,120 tuition and $10,474 from TEFA, a TEFA family still owes about $8,646, across six payment plans that are only in a PDF.

I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Laura and Scott,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Mirus version: an admissions meeting request landing in your admin inbox, the enrollment checklist, and the billing page a TEFA family would see.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Mirus is, with no pitch",
      where: "Facebook or Instagram (linked from the Social Media page)",
      body: "Hi, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Twenty years of a small high school in Old Town Katy is something to be proud of.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Laura and Scott,

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
      body: `Hi Laura and Scott,

I'll leave it here so I'm not cluttering your inbox. The Mirus version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Happy 20th year.

Julius`,
    },
  ],
};
