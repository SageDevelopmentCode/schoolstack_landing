import type { OutreachPlan } from "./types";

export const bookHooksSchoolhouseOutreach: OutreachPlan = {
  slug: "book-hooks-schoolhouse",
  schoolName: "The Book Hooks Schoolhouse",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Lara",
    role: "Founder and Director (Lara Aston)",
    source: "Book Hooks Home page (\"About the Director\") and Curriculum Trak's Teacher's Lounge post (\"founder and leader of the Book Hooks Schoolhouse\")",
  },
  priorContact: {
    when: "May",
    what: "A hand-sent first email with a link to the Book Hooks MudKitchen demo",
  },
  angle:
    "Re-contact with the Family experience snapshot. One real detail: tuition isn't on the school's own site; the $5,500 and $500 registration fee only appear on the Spark Your School enrollment page, under different program names than Explorers and Adventurers.",
  facts: [
    {
      fact: "The Book Hooks Schoolhouse is a Christian 2-day hybrid microschool in northwest Houston, opened in fall 2023 by Director Lara Aston; 2026–27 programs are Explorers (1st–6th, Mon/Wed) and Adventurers (6th–12th, Tue/Thu), 9 to 3",
      source: "Book Hooks, Home and About Us",
      url: "https://bookhooklearning.com/about-us",
      readOn: "2026-11-23",
    },
    {
      fact: "Admissions is three steps: meet with the Director, complete the online Spark Your School application, and pay a registration fee. Book Hooks says it is a TEFA approved homeschool tutoring vendor, and Spark Your School is used for parent and student communication",
      source: "Book Hooks, Admissions",
      url: "https://bookhooklearning.com/admissions",
      readOn: "2026-11-23",
    },
    {
      fact: "The Spark Your School enrollment page lists $5,500 a year, a $500 registration fee per student \"due by May 1, 2026\", payment in full or monthly by card, check or ACH, and options named MW/TTH Hybrid Learning Pod and Partnership",
      source: "Spark Your School, 2026-2027 Book Hooks Schoolhouse Enrollment",
      url: "https://www.sparkyourschool.com/e/399f3a3e-239c-11f1-ab6b-0294ab9f285b?preview=true",
      readOn: "2026-11-23",
    },
    {
      fact: "The Terms and Conditions page is the website builder's template text (\"Your Terms and Conditions section is like a contract between you and your customers\")",
      source: "Book Hooks, Terms and Conditions",
      url: "https://bookhooklearning.com/terms-and-conditions",
      readOn: "2026-11-23",
    },
    {
      fact: "On the Teacher's Lounge podcast (Curriculum Trak, March 2024), Lara described her students building German Christmas pyramids, tying German immigrants to Texas to the convection currents they studied in science",
      source: "Curriculum Trak, \"Our Students Need to Belong\" (Teacher's Lounge transcript, March 7, 2024)",
      url: "https://curriculumtrak.com/blog/our-students-need-to-belong",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in May (the first email says so).",
    "Book Hooks already runs on Spark Your School: application, payment plans (card, check, ACH) and parent and student communication, plus home-day assignments (Lara described it on the podcast). It's a school platform like ours; pitch only if they want everything in one place.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). TEFA payments go through Odyssey; MudKitchen works alongside it.",
    "Book Hooks is a TEFA homeschool tutoring vendor, so its families use the homeschool TEFA amount, not the $10,474 private-school amount. The plan quotes no TEFA figure.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "hTMTISvwlAOdeBA4lZZzew",
    preparedOn: "2026-11-23",
    summary:
      "We read all 11 pages of bookhooklearning.com on Nov 23, 2026, plus the Spark Your School enrollment page.",
    toolStack: [
      {
        name: "Spark Your School",
        usedFor: "Application, payments, and parent and student communication",
        url: "https://bookhooklearning.com/admissions",
      },
      {
        name: "Calendly",
        usedFor: "Meeting with the Director",
        url: "https://bookhooklearning.com/",
      },
    ],
    observations: [
      {
        area: "find",
        gap: "Tuition isn't on the school's own site",
        saw: "About Us lists Explorers and Adventurers with their days and hours, but no price. The $5,500 tuition and $500 registration fee appear only on the Spark Your School enrollment page.",
        impact: "A family comparing options has to open the application site to learn what Book Hooks costs.",
        source: "Book Hooks, About Us; Spark Your School enrollment page",
        url: "https://bookhooklearning.com/about-us",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "Both programs on the site with their days, price, registration fee and what it covers.",
        },
      },
      {
        area: "apply",
        gap: "The application uses different program names",
        saw: "The site offers Explorers (1st–6th, Mon/Wed) and Adventurers (6th–12th, Tue/Thu). The application lists MW and TTH Hybrid Learning Pods and Partnerships, and still says the registration fee is due by May 1, 2026.",
        impact: "A family applying has to work out which option is their child's program, and may read the fee date as past.",
        source: "Book Hooks, About Us; Spark Your School enrollment page",
        url: "https://www.sparkyourschool.com/e/399f3a3e-239c-11f1-ab6b-0294ab9f285b?preview=true",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "One application with the same program names as the site, and every family's step in one admin inbox.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say how TEFA works with tuition",
        saw: "Admissions says Book Hooks is a TEFA approved homeschool tutoring vendor. The site doesn't say which costs TEFA can cover or how a family pays the rest.",
        impact: "A TEFA family can't see what they'd still owe each month until they ask.",
        source: "Book Hooks, Admissions",
        url: "https://bookhooklearning.com/admissions",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "autopay"],
          text: "We'd set up each family's billing page to show what TEFA covers and their own share, with autopay for their part.",
        },
      },
      {
        area: "website",
        gap: "Terms and Conditions is template text",
        saw: "The Terms and Conditions page linked in the footer reads \"Your Terms and Conditions section is like a contract between you and your customers\", the website builder's sample text.",
        impact: "A family looking for refund or withdrawal terms before they register finds placeholder text.",
        source: "Book Hooks, Terms and Conditions",
        url: "https://bookhooklearning.com/terms-and-conditions",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service", "enrollment-agreements"],
          text: "Your real enrollment terms on the site and in an agreement families sign online when they enroll.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Book Hooks",
    founder: {
      fullName: "Lara Aston",
      firstName: "Lara",
      role: "Founder and Director",
      source: "Book Hooks, Home (About the Director)",
      url: "https://bookhooklearning.com/",
    },
    mailTo: {
      lines: ["Lara Aston", "The Book Hooks Schoolhouse", "10609 Grant Road, Buildings G and E", "Houston, TX 77070"],
      source: "Book Hooks Contact Us page (\"10609 Grant Road, Buildings G and E, Houston, Texas 77070\")",
      url: "https://bookhooklearning.com/contact-us",
    },
    founderFacts: [
      {
        fact: "On the Teacher's Lounge podcast (Curriculum Trak, March 2024), Lara described her students building German Christmas pyramids, tying German immigrants to Texas to the convection currents they studied in science.",
        source: "Curriculum Trak, \"Our Students Need to Belong\" (Teacher's Lounge transcript, March 7, 2024)",
        url: "https://curriculumtrak.com/blog/our-students-need-to-belong",
        readOn: "2026-11-23",
      },
      {
        fact: "Lara has 37 years of multi-age teaching experience and opened The Book Hooks Schoolhouse in fall 2023; it had nine students at the time of the podcast.",
        source: "Book Hooks, Home; Curriculum Trak Teacher's Lounge transcript",
        url: "https://bookhooklearning.com/",
        readOn: "2026-11-23",
      },
    ],
    hook: "On the Teacher's Lounge podcast (Curriculum Trak, March 2024), Lara described her students building German Christmas pyramids, tying German immigrants to Texas to the convection currents they studied in science.",
    body: `Hi Lara,

On the Teacher's Lounge podcast you described your students building German Christmas pyramids, tying the German settlers in Texas to the convection currents from science. It's a good picture of what one mixed-age room can do.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Book Hooks.

I'd like to hear how the schoolhouse has grown since that first group of nine.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your admissions.",
    stickyNote: "Lara, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "bookhooks-r5p9",
    checkBeforeMailing: [
      "The address is the school's own, from the Contact Us page (Buildings G and E on Grant Road).",
      "The hook is from the published transcript of the March 2024 Teacher's Lounge episode. The same interview covers Lara's husband's death in 2022; the letter deliberately leaves that out.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the May email, the tuition-only-in-Spark detail, one proof number, offer the snapshot",
      subject: "Explorers and Adventurers tuition",
      body: `Hi Lara,

I mailed you a handwritten note last week with a card for Book Hooks. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in May) and a one-page snapshot of what a family sees on your site today.

One thing stood out: your site doesn't list tuition. The $5,500 and the $500 registration fee only show up in the Spark application, under different names than Explorers and Adventurers.

I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Lara,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Book Hooks version: a meeting request landing in your admin inbox, the enrollment checklist with the $500 registration fee, and the billing page a family would see.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Book Hooks is, with no pitch",
      where: "Facebook (linked in the site footer)",
      body: "Hi, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. A schoolhouse built around books and Power Hour thinking workshops is a lovely idea.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Lara,

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
      body: `Hi Lara,

I'll leave it here so I'm not cluttering your inbox. The Book Hooks version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
