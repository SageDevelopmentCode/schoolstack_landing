import type { OutreachPlan } from "./types";

export const kineoSchoolOutreach: OutreachPlan = {
  slug: "kineo-school",
  schoolName: "The Kineo School",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Elizabeth",
    role: "Director (since 2023; Kineo parent and Board of Trustees member 2019–2023)",
    source:
      "Elizabeth Kent, signed as Director on the 'Introduction/letter from our Director' page and listed first as Director on Staff & Employment",
  },
  angle:
    "Re-contact with a snapshot: Kineo's six admissions steps run across a website form, two Calendly bookings and a FACTS application, and the application fee reads $172 on the site but $170 in FACTS",
  priorContact: {
    when: "August",
    what: "A hand-sent first email with a link to The Kineo School MudKitchen demo",
  },
  facts: [
    {
      fact: "Accredited, small-by-design K–5 independent school in Kirkland, WA, built for a diverse mix of students including neurodivergent learners (ADHD, autism)",
      source: "The Kineo School homepage",
      url: "https://www.kineoschool.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "2026–27 fees for new families: $24,800 tuition, $172 application fee, $2,000 one-time enrollment fee, $300 field trip fee, $400 materials fee and a $2,000 non-refundable deposit applied to the final tuition fees due in April and May (total $27,672); 5% sibling discount; the full 2025–26 fee table is still listed below it",
      source: "Tuition fees — The Kineo School",
      url: "https://www.kineoschool.org/tuition",
      readOn: "2026-11-22",
    },
    {
      fact: "Six admissions steps: open house, tour with the Director, application with a teacher evaluation and the $172 fee, a student visit morning, admission notice, then the Tuition and Enrollment contract plus enrollment fee and deposit; the page says the next open house is Saturday 1st November 2025",
      source: "Application process — The Kineo School",
      url: "https://www.kineoschool.org/application-process",
      readOn: "2026-11-22",
    },
    {
      fact: "The 'Apply now' button opens FACTS SIS Admissions Online, which asks families to create an account and verify their email first, then says to pay the $170 application fee on submit; its required-documents list is empty",
      source: "FACTS SIS Admissions Online (The Kineo School)",
      url: "https://tks-wa.client.renweb.com/oa/?memberid=16820",
      readOn: "2026-11-22",
    },
    {
      fact: "Tours (45 min) and a 30-minute admissions call with the Director are booked through two Calendly event types; tour slots were open for Nov 23, 24 and 30, 2026",
      source: "Book a tour — The Kineo School (Calendly)",
      url: "https://www.kineoschool.org/book-a-tour",
      readOn: "2026-11-22",
    },
    {
      fact: "Elizabeth Kent became Director in 2023 after joining Kineo as a parent and serving on the Board of Trustees from 2019 to 2023",
      source: "Introduction/letter from our Director — The Kineo School",
      url: "https://www.kineoschool.org/introduction",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in August 2026 (the first email says August).",
    "Find Elizabeth Kent's email; the CRM row has no contact and the site only lists the general info inbox.",
    "Re-check both fees before sending: $172 on the Tuition and Application process pages, $170 on the FACTS application (Nov 22). The first email names them.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "Kineo runs admissions in FACTS SIS, which may also hold their student records and tuition billing: decide how hard to pitch replacing it.",
  ],
  snapshot: {
    token: "6VlmkCUpvCb6JOR1BxXEvw",
    preparedOn: "2026-11-22",
    summary:
      "We read 25 pages of kineoschool.org on Nov 22, 2026, plus the FACTS application page and both Calendly booking pages.",
    pageSpeed: { mobileScore: 53, url: "https://www.kineoschool.org/", checkedOn: "2026-11-22" },
    toolStack: [
      { name: "Squarespace forms", usedFor: "Open house sign-up and contact form", url: "https://www.kineoschool.org/openhouse" },
      { name: "Calendly", usedFor: "Tours and admissions calls with the Director", url: "https://www.kineoschool.org/book-a-tour" },
      { name: "FACTS SIS", usedFor: "Online application and application fee", url: "https://tks-wa.client.renweb.com/oa/?memberid=16820" },
    ],
    observations: [
      {
        area: "find",
        gap: "Last year's fees still sit under this year's",
        saw: "The Tuition page shows 2026–27 fees, then the full 2025–26 table below it, each with its own Apply now button. New-family totals are $27,672 and $26,972.",
        impact: "A parent scrolling on a phone can land on last year's table and plan around a total that's $700 too low.",
        source: "Tuition fees — The Kineo School",
        url: "https://www.kineoschool.org/tuition",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We run the site for you and keep only the current year's fees on it, updated when you set next year's.",
        },
      },
      {
        area: "tour",
        gap: "The admissions page points to an open house from last year",
        saw: "Step 1 on Application process says the next open house is Saturday 1st November 2025. The Open House page itself lists Saturday 30th January, with no year.",
        impact: "Families reading the steps in order may think they've missed the open house, or can't tell which date is real.",
        source: "Application process — The Kineo School",
        url: "https://www.kineoschool.org/application-process",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "Open house dates live in one place on the site we run for you, so every page shows the same next date.",
        },
      },
      {
        area: "tour",
        gap: "Three ways to visit, booked in two different tools",
        saw: "Open house sign-ups go through a website form. Tours and the 30-minute admissions call are booked on two separate Calendly pages. Tour booking itself works well, with slots open this month.",
        impact: "One family's open house, call and tour sit in different places, so seeing where each family is takes piecing together.",
        source: "Visit Kineo — The Kineo School",
        url: "https://www.kineoschool.org/visit-kineo",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families book tours and calls from the times you open, and each booking lands on that family's record in one admissions inbox.",
        },
      },
      {
        area: "apply",
        gap: "The application fee reads $172 on the site and $170 in FACTS",
        saw: "The Tuition and Application process pages list a $172 non-refundable application fee. The FACTS application page says families pay a $170 fee when they submit, and asks them to create an account and verify their email before they start.",
        impact: "A family notices the two numbers and has to ask which is right, after setting up a new login just to see the form.",
        source: "FACTS SIS Admissions Online",
        url: "https://tks-wa.client.renweb.com/oa/?memberid=16820",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["online-application", "application-fee"],
          text: "The application sits on your own site, saves drafts, and takes the fee you set by card or bank on submit, so the amount matches everywhere.",
        },
      },
      {
        area: "apply",
        gap: "Step 3 doesn't link to the application or list the documents",
        saw: "Step 3 asks for the application, a teacher evaluation and the fee, but has no link. The Apply now button is only on the Tuition page, and the FACTS page's list of required documents is blank.",
        impact: "A family ready to apply has to hunt for the form, then email to ask how the teacher evaluation should reach you.",
        source: "Application process — The Kineo School",
        url: "https://www.kineoschool.org/application-process",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Your demo puts the application on your own site, one click from the admissions steps, and every application lands in one admin inbox.",
        },
      },
      {
        area: "enroll",
        gap: "The contract, $2,000 fee and $2,000 deposit have no online path",
        saw: "Step 6 says to sign the Tuition and Enrollment contract and pay the enrollment fee and deposit before a spot is held. The site doesn't say how the contract is signed or how the $4,000 is paid.",
        impact: "Each accepted family's spot waits on a signature and two payments that someone at Kineo has to chase and confirm.",
        source: "Application process — The Kineo School",
        url: "https://www.kineoschool.org/application-process",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: the contract signed online, then the enrollment fee and deposit paid, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say how or when $24,800 tuition is paid",
        saw: "The Tuition page gives an annual total and says the deposit goes toward tuition fees due in April and May, but no payment schedule, plan options or way to pay.",
        impact: "Families budgeting for a $27,672 first year can't see what's due each month until they ask.",
        source: "Tuition fees — The Kineo School",
        url: "https://www.kineoschool.org/tuition",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families pick a payment plan in their portal, pay by card or bank, can turn on autopay, and see every balance and invoice.",
        },
      },
      {
        area: "website",
        gap: "A homepage Learn more link leads to a missing page",
        saw: "Under 'Caring, lasting friendships' on the homepage, Learn more goes to /the-kineo-difference, which returns a page-not-found error. Google PageSpeed scores the homepage 53 out of 100 on mobile.",
        impact: "A parent curious about how Kineo builds friendships hits a dead end on the first page they read.",
        source: "The Kineo School homepage",
        url: "https://www.kineoschool.org/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, check its links, and make it fast on phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Kineo",
    founder: {
      fullName: "Elizabeth Kent",
      firstName: "Elizabeth",
      role: "Director",
      source: "The Kineo School, Meet the Team (Staff & Employment) and Introduction/letter from our Director",
      url: "https://www.kineoschool.org/staff",
    },
    mailTo: {
      lines: ["7525 132nd Ave NE", "Kirkland, WA 98033"],
      source: "The Kineo School site footer (shown on the Story page); the building is Lake Washington United Methodist Church",
      url: "https://www.kineoschool.org/story",
    },
    founderFacts: [
      {
        fact: "In her Introduction letter on Kineo's site, Elizabeth Kent says she began with Kineo as a parent, served on the Board of Trustees from 2019 to 2023, and took on the role of Director in 2023, combining her teaching background with her experience as a Kineo parent.",
        source: "Introduction/letter from our Director — The Kineo School",
        url: "https://www.kineoschool.org/introduction",
        readOn: "2026-11-22",
      },
      {
        fact: "Kineo was founded in 2016 by two former public school teachers, and the site says it is small by design.",
        source: "Story — The Kineo School",
        url: "https://www.kineoschool.org/story",
        readOn: "2026-11-22",
      },
      {
        fact: "Elizabeth Kent is listed first on Kineo's Meet the Team page, as Director.",
        source: "Staff & Employment — The Kineo School",
        url: "https://www.kineoschool.org/staff",
        readOn: "2026-11-22",
      },
    ],
    hook: "In her Introduction letter on Kineo's site, Elizabeth Kent says she began with Kineo as a parent, served on the Board of Trustees from 2019 to 2023, and took on the role of Director in 2023, combining her teaching background with her experience as a Kineo parent.",
    body: `Hi Elizabeth,

I read your letter on the Kineo site. I liked that you came to Kineo as a parent first and served on the board before becoming Director in 2023.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Kineo.

I'd like to hear how the move from parent to Director has gone.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your admissions steps.",
    stickyNote: "Elizabeth, a short note from a microschool in Texas. J",
    shortCode: "kineo-ea9n",
    checkBeforeMailing: [
      "The address is the school's campus inside Lake Washington United Methodist Church (the site footer lists no separate mailing address): address it to Elizabeth Kent, The Kineo School, so it reaches the school and not the church office.",
      "Elizabeth is Director, not a founder (Kineo was founded in 2016 by two former teachers): the letter only says she came as a parent and served on the board, which is what her letter on the site says.",
      "No podcast or interview found; the hook is her own letter on the site. Re-read it before mailing.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the August email, one detail from the snapshot, one proof number",
      subject: "the Kineo application fee",
      body: `Hi Elizabeth,

I mailed you a handwritten note last week with a card for Kineo. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in August) and a one-page snapshot of what a family sees on your site today, from booking a tour to the enrollment contract.

One thing stood out: your Tuition page lists a $172 application fee, but the FACTS application asks for $170.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Elizabeth,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Kineo version: a family applying, signing the enrollment contract and paying, and what you'd see as Director.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school posts, with no pitch",
      where: "Instagram (kineo_school) or Facebook (thekineoschool)",
      body: "Hi Elizabeth, I'm Julius. I run Sage Field, a small microschool in Round Rock, TX. Loved reading how Kineo shapes the end-of-year performance so every student has a role.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Elizabeth,

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
      body: `Hi Elizabeth,

I'll leave it here so I'm not cluttering your inbox. The Kineo version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the January open house.

Julius`,
    },
  ],
};
