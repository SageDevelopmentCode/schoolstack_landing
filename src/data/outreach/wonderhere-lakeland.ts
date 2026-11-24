import type { OutreachPlan } from "./types";

export const wonderhereLakelandOutreach: OutreachPlan = {
  slug: "wonderhere-lakeland",
  schoolName: "WonderHere Lakeland",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Tiffany",
    role: "Co-Owner/Founder",
    source:
      "Meet the Lakeland Team page (Tiffany Thenor, co-owner and co-founder of WonderHere, leads the in-person programs); Amanda Thenor is listed there as Site Director",
  },
  angle: "Re-contact with a snapshot: Step Up families pay tuition first and claim it back from Step Up themselves",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the WonderHere Lakeland MudKitchen demo",
  },
  facts: [
    {
      fact: "The Schoolhouse application's Scholarship Agreement says tuition is due on the 15th with autopay through Brightwheel, Step Up disbursements may arrive late, and families pay out of pocket and seek reimbursement from Step Up themselves; overpayments stay with WonderHere as credit",
      source: "WonderHere Lakeland Schoolhouse Application 2026-27",
      url: "https://wonderhere.com/lakeland-schoolhouse-application-2026-27/",
      readOn: "2026-11-22",
    },
    {
      fact: "Schoolhouse tuition is $7,500 (half day), $9,500 (full day) or $12,000 (full day plus Fridays), in one sum or 10 monthly payments",
      source: "WonderHere Lakeland Schoolhouse",
      url: "https://wonderherelakeland.com/schoolhouse/",
      readOn: "2026-11-22",
    },
    {
      fact: "Friday School is $300 a month plus a $250 registration fee bought through Add to Cart; monthly payments are set up afterwards, and Step Up families email to register",
      source: "Friday School (South Lakeland) 2026-27 Registration Fee",
      url: "https://wonderherelakeland.com/product/friday-school-south-lakeland-2026-27-registration-fee/",
      readOn: "2026-11-22",
    },
    {
      fact: "WonderHere Lakeland sits on ten acres of farm land with animals and gardens",
      source: "WonderHere Lakeland, Florida",
      url: "https://wonderhere.com/lakeland-florida/",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June (the first email says so), and who it went to.",
    "Confirm Tiffany is the right person: she's co-founder across WonderHere's locations; Amanda Thenor is the Lakeland Site Director.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "Uses Brightwheel for tuition payments and autopay: decide whether to pitch replacing it.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
  ],
  snapshot: {
    token: "9q-RknNHkfySvBDC4K2--Q",
    preparedOn: "2026-12-01",
    summary:
      "We read wonderherelakeland.com on Dec 1, 2026, from the Schoolhouse and South Lakeland Programs pages to the class sign-ups, Contact page and the Schoolhouse application.",
    toolStack: [
      { name: "WooCommerce checkout", usedFor: "Friday School registration fee and event tickets", url: "https://wonderherelakeland.com/product/friday-school-south-lakeland-2026-27-registration-fee/" },
      { name: "Brightwheel", usedFor: "Monthly tuition payments and autopay", url: "https://wonderhere.com/lakeland-schoolhouse-application-2026-27/" },
    ],
    observations: [
      {
        area: "find",
        gap: "Schoolhouse payments list last year's months",
        saw: "Each Schoolhouse option ($7,500, $9,500 and $12,000) offers 10 monthly payments from July 15, 2025 to April 15, 2026.",
        impact: "A family planning for this year sees last year's schedule and has to ask which months they'll pay.",
        source: "WonderHere Lakeland Schoolhouse",
        url: "https://wonderherelakeland.com/schoolhouse/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "tuition-rate-plans"],
          text: "Your tuition plans live in one place, so the site and each family's bill show the same months and amounts every year.",
        },
      },
      {
        area: "apply",
        gap: "The 2026–27 application still talks about 2025–26",
        saw: "The application titled 2026-27 says the SchoolHouse is full for 25/26 and that 26/27 applications open in January 2026. The Schoolhouse page introduces it by thanking families for joining \"our WonderHere Sanford Family\".",
        impact: "A Lakeland family can't tell whether they're applying for this year or joining a waitlist for last year.",
        source: "WonderHere Lakeland Schoolhouse Application 2026-27",
        url: "https://wonderhere.com/lakeland-schoolhouse-application-2026-27/",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "A Lakeland application for the year families are applying to, with every application in one admin inbox.",
        },
      },
      {
        area: "enroll",
        gap: "Friday School sign-up starts in a cart, then moves to Brightwheel",
        saw: "The $250 Friday School registration fee is an Add to Cart product. After that, families are set up in a separate system for $300 a month from July, enrollment documents are a separate link, and Step Up families email to register instead.",
        impact: "One enrollment runs through three places, and Step Up families can't sign up online at all.",
        source: "Friday School (South Lakeland) 2026-27 Registration Fee",
        url: "https://wonderherelakeland.com/product/friday-school-south-lakeland-2026-27-registration-fee/",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-fees", "enrollment-agreements", "autopay"],
          text: "Families enroll in one checklist: documents signed online, the $250 fee paid inside it, and autopay set up for the monthly payments.",
        },
      },
      {
        area: "pay",
        gap: "Step Up families pay first and claim it back themselves",
        saw: "The application's Scholarship Agreement says tuition is due on the 15th with autopay, Step Up money may arrive late, and families pay out of pocket and seek reimbursement from Step Up themselves. Overpayments stay with WonderHere as credit.",
        impact: "A Step Up family can front up to $1,200 a month and track their own reimbursements, and credits are easy to lose sight of.",
        source: "WonderHere Lakeland Schoolhouse Application 2026-27",
        url: "https://wonderhere.com/lakeland-schoolhouse-application-2026-27/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing that records each family's Step Up amount next to what they've paid themselves, so families see their balance and any credit.",
        },
      },
      {
        area: "website",
        gap: "The Contact form has no Lakeland option",
        saw: "The Lakeland Contact page asks what you're interested in and offers Sanford, Anderson and Haines City programs, curriculum, events and funding. Lakeland isn't on the list.",
        impact: "A Lakeland family picks another location or skips the question, and their inquiry starts out in the wrong place.",
        source: "Contact WonderHere Lakeland",
        url: "https://wonderherelakeland.com/contact-2/",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service", "admissions-pipeline"],
          text: "The site we build for you asks Lakeland questions, and each inquiry lands in your admissions inbox under the right program.",
        },
      },
      {
        area: "website",
        gap: "The cancellation address is on a Sanford staging site",
        saw: "The Homeschool Program FAQ says cancellations must be emailed in writing to an address on a Sanford staging domain. The same FAQ calls the Thursday Co-Op \"Tuesday Co-Op\".",
        impact: "A written cancellation, which starts the 2-week notice before the next payment, may never reach Lakeland.",
        source: "WonderHere South Lakeland Programs",
        url: "https://wonderherelakeland.com/south-lakeland-programs/",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and keep your site for you, so every address, day and policy on it is Lakeland's.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "WonderHere",
    founder: {
      fullName: "Tiffany Thenor",
      firstName: "Tiffany",
      role: "Co-owner and co-founder",
      source: "WonderHere Lakeland Staff page (\"Tiffany Thenor is the co-owner and co-founder of WonderHere\")",
      url: "https://wonderherelakeland.com/staff/",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "On the Founder to Founder podcast (September 4, 2025), Tiffany Thenor told host Felicia Wright how she and her business partner started WonderHere as a small homeschool enrichment program that grew into a microschool on a 10-acre farm in Lakeland.",
        source: "Founder 2 Founder, How Wonder Here Microschool is Redefining Education with Play-Based Learning (Apple Podcasts)",
        url: "https://podcasts.apple.com/us/podcast/how-wonder-here-microschool-is-redefining-education/id1873325283?i=1000747361586",
        readOn: "2026-11-22",
      },
      {
        fact: "On the LiberatED podcast (November 8, 2024), Tiffany Thenor, cofounder and CEO, said she left public-school teaching in 2016 to launch the first WonderHere with a handful of children in Lakeland; it now serves over 100 learners a day, and new founders open WonderHere schools through a licensing model.",
        source: "LiberatED Podcast, How this founder is spreading play-based microschooling nationally (Apple Podcasts)",
        url: "https://podcasts.apple.com/us/podcast/how-this-founder-is-spreading-play-based-microschooling/id1608978473?i=1000676212163",
        readOn: "2026-11-22",
      },
      {
        fact: "Tiffany leads WonderHere's in-person programs; her co-founder Jessica Zivkovich leads the online community, curriculum and marketing.",
        source: "WonderHere Lakeland Staff page",
        url: "https://wonderherelakeland.com/staff/",
        readOn: "2026-11-22",
      },
    ],
    hook: "On the Founder to Founder podcast (September 4, 2025), Tiffany Thenor told host Felicia Wright how she and her business partner started WonderHere as a small homeschool enrichment program that grew into a microschool on a 10-acre farm in Lakeland.",
    body: `Hi Tiffany,

I listened to your Founder to Founder episode. I liked hearing how you and Jessica started WonderHere as a small homeschool enrichment program, and how it grew into a microschool on a farm.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for WonderHere.

I'd like to hear what changed when the enrichment days became a full school.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Tiffany, a note from a microschool in Round Rock, Texas. J",
    shortCode: "wonderhere-8xb8",
    checkBeforeMailing: [
      "Find a mailing address: the only Lakeland address on wonderherelakeland.com/contact and wonderhere.com/contact is the Colbert Road farm site, which looks like a home property, so it isn't stored here. The other addresses on wonderhere.com/contact are other WonderHere locations, not Lakeland. Check Florida Sunbiz for WonderHere's registered business or mailing address, or a PO box on its Facebook About tab.",
      "Listen to the Founder to Founder episode (Sept 4, 2025) before mailing: the hook comes from the episode description, and the description says \"her business partner\" while the letter names Jessica (the Staff page lists her as the other co-founder).",
      "Jessica Zivkovich is co-owner and co-founder too; the letter goes to Tiffany, who leads the in-person programs and who the emails greet. Amanda Thenor is the Lakeland Site Director.",
      "Sources differ on Tiffany's teaching years (7 at a Title 1 school on the Staff page, 15 on LiberatED); the letter doesn't mention either.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro: acknowledge the June email, give a new reason (the snapshot), one proof number",
      subject: "Step Up at WonderHere Lakeland",
      body: `Hi Tiffany,

I mailed you a handwritten note last week with a card for WonderHere Lakeland.

I wrote in June about a version of MudKitchen I set up for WonderHere Lakeland. Since then I put together a one-page snapshot of what a family sees on your site today, from the Schoolhouse page to paying tuition.

One thing stood out: your Scholarship Agreement asks Step Up families to pay on the 15th out of pocket and claim it back from Step Up themselves.

I run Sage Field, a microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Tiffany,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the WonderHere Lakeland version: the Schoolhouse, homeschool and farm programs, the application, and what a parent sees for tuition.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Instagram (wonderherelakeland) or Facebook (wonderhere.lakeland)",
      body: "Hi Tiffany, I'm Julius. I run Sage Field, a microschool in Round Rock, TX. Ten acres of farm for Friday School sounds like a wonderful place to learn.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Tiffany,

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
      body: `Hi Tiffany,

I'll leave it here so I'm not cluttering your inbox. The WonderHere Lakeland version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the school year.

Julius`,
    },
  ],
};
