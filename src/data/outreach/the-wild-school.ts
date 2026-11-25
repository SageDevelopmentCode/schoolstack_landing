import type { OutreachPlan } from "./types";

export const theWildSchoolOutreach: OutreachPlan = {
  slug: "the-wild-school",
  schoolName: "The Wild School",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Lindsay",
    role: "Founder and CEO (Lindsay Gkolomeev)",
    source: "The Wild School Our Team page (\"Lindsay Gkolomeev, Founder and CEO\") and Founder's Story",
  },
  angle:
    "One real question: Wild Preschool families apply through one Airtable form behind all seven location buttons, enroll and pay in Sawyer, and get updates in ClassDojo. How does the team follow one family from application to first day across the three?",
  facts: [
    {
      fact: "The Wild School calls itself \"the largest private nature school in Texas\", with fully outdoor programs from infancy through adolescence and Wild Preschool at seven Houston-area locations",
      source: "The Wild School home page and How to Apply",
      url: "https://www.thewildschool.org/",
      readOn: "2026-11-23",
    },
    {
      fact: "Wild Preschool admissions: an online application with a $50 fee (the West Houston, Central Houston, Mont Belvieu, The Woodlands, Cypress/Tomball, East Houston and Sugar Land buttons all open the same Airtable form), review, a play date and group site tour, decisions on March 27, then a $250 registration and supply fee; the page still says \"Applications for 2026-2027 Open February 11th\"",
      source: "The Wild School, How to Apply",
      url: "https://www.thewildschool.org/how-to-apply",
      readOn: "2026-11-23",
    },
    {
      fact: "Location pages say tuition depends on the number of days and to see current rates \"visit our booking system on HiSawyer\"; the Pricing page shows \"PRICE VARIES\" for semester, monthly and drop-in, with \"book now\" buttons that link back to the home page",
      source: "The Wild School, Cypress preschool page and Pricing",
      url: "https://www.thewildschool.org/pricing-1",
      readOn: "2026-11-23",
    },
    {
      fact: "Preschool families are notified of weather changes \"through ClassDojo and email\", and each location's policies are in a site addendum in the Parent Handbook, a Google Doc",
      source: "The Wild School, Cypress preschool page",
      url: "https://www.thewildschool.org/cypresspreschool",
      readOn: "2026-11-23",
    },
    {
      fact: "Lindsay trained as a nature-based educator in 2023 and became a Texas Master Naturalist the following year; her story names \"securing ideal locations across Houston\" as one of the challenges",
      source: "The Wild School, Founder's Story",
      url: "https://www.thewildschool.org/founder-s-story",
      readOn: "2026-11-23",
    },
    {
      fact: "The Registration page still says \"2025-2026 Preschool enrollment open\", and the How to Enroll page is headed \"For 2025-2026 Year\"",
      source: "The Wild School, Registration and How to Enroll",
      url: "https://www.thewildschool.org/registration",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "The Wild School is much larger than our usual school (seven locations, 25+ staff, a COO and a family experience manager) and runs on Sawyer for registration and payments across all its programs. You asked to build it anyway; decide whether to pitch replacing Sawyer or lead with admissions and families' updates.",
    "We'd build: Several locations in one account",
    "We'd build: Monthly billing for clubs, after-care or add-on classes. Their drop-ins and class packs would need this.",
    "Donna Morrow (COO and Operations Director) may own the tools; the plan writes to Lindsay as founder.",
    "Instagram and Facebook aren't linked in the page text we read; find their page before the social step, or skip it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "U2np76JYlpMpIoEu7l9EpA",
    preparedOn: "2026-11-23",
    summary:
      "We read 60 pages of thewildschool.org on Nov 23, 2026, including every preschool location page, the application process and the pricing page.",
    pageSpeed: { mobileScore: 66, url: "https://www.thewildschool.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Airtable",
        usedFor: "Wild Preschool application",
        url: "https://www.thewildschool.org/how-to-apply",
      },
      {
        name: "Sawyer",
        usedFor: "Enrollment, tuition and class bookings",
        url: "https://www.thewildschool.org/pricing-1",
      },
      {
        name: "ClassDojo",
        usedFor: "Preschool updates and weather notices",
        url: "https://www.thewildschool.org/cypresspreschool",
      },
      {
        name: "HubSpot form",
        usedFor: "\"More info\" requests",
        url: "https://www.thewildschool.org/",
      },
      {
        name: "Google Docs",
        usedFor: "Parent Handbook and site addendums",
        url: "https://www.thewildschool.org/cypresspreschool",
      },
      {
        name: "Calendly",
        usedFor: "Birthday party bookings",
        url: "https://www.thewildschool.org/birthday-parties",
      },
    ],
    observations: [
      {
        area: "apply",
        gap: "Applying, paying and updates use three different tools",
        saw: "Families apply on an Airtable form, enroll and pay in Sawyer, and get weather notices and updates in ClassDojo. All seven location buttons on How to Apply open the same Airtable form.",
        impact: "A family creates accounts in several places and can't see their application, payments and updates together.",
        source: "The Wild School, How to Apply and preschool location pages",
        url: "https://www.thewildschool.org/how-to-apply",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["online-application", "application-fee", "admissions-pipeline", "parent-portal"],
          text: "One application per location with the $50 fee taken online, every family in one admin inbox, then the same login for enrollment, tuition and updates.",
        },
      },
      {
        area: "find",
        gap: "Prices are only inside Sawyer",
        saw: "Location pages say tuition depends on the number of days and to check HiSawyer for current rates. The Pricing page lists semester, monthly and drop-in as \"PRICE VARIES\", and their \"book now\" buttons link back to the home page.",
        impact: "A family can't see what a 3-day preschool week costs without opening Sawyer and picking days, and two of the pricing buttons go nowhere new.",
        source: "The Wild School, Pricing and Cypress preschool page",
        url: "https://www.thewildschool.org/pricing-1",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "parent-plan-choice", "class-billing", "website-service"],
          text: "Each schedule's price shown on the site and set up once, with semester, monthly and drop-in options families choose from.",
        },
      },
      {
        area: "website",
        gap: "Enrollment pages still say 2025–26",
        saw: "The Registration page says \"2025-2026 Preschool enrollment open\", How to Enroll is headed \"For 2025-2026 Year\", and How to Apply still says \"Applications for 2026-2027 Open February 11th\".",
        impact: "A family planning for next fall can't tell which page is current or when the next round opens.",
        source: "The Wild School, Registration, How to Enroll and How to Apply",
        url: "https://www.thewildschool.org/registration",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We write and look after the site for you, with one current enrollment page.",
        },
      },
      {
        area: "tour",
        gap: "Two answers on whether you can tour",
        saw: "A Book a Preschool Tour form asks for a preferred location and date, while How to Apply says \"We do not offer private tours or individual trial days\" once applications open; tours happen at the group play date.",
        impact: "A family doesn't know whether to book a tour or wait to apply.",
        source: "The Wild School, Book a Preschool Tour and How to Apply",
        url: "https://www.thewildschool.org/how-to-apply",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "observation-booking"],
          text: "Families book an open tour slot before applying, or a play date afterwards, from the same page.",
        },
      },
      {
        area: "updates",
        gap: "Each location's details live in a Google Doc",
        saw: "Every location page sends families to a site addendum in the Parent Handbook, a Google Doc, for that location's policies, weather plans and safety information.",
        impact: "A family at one site reads through a shared document to find the part that applies to them.",
        source: "The Wild School, preschool location pages",
        url: "https://www.thewildschool.org/cypresspreschool",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["multi-location", "forms-documents", "bulletin"],
          text: "We'd set up each location in one account, so families see only their site's handbook, notices and calendar.",
        },
      },
      {
        area: "updates",
        gap: "Weather notices go through ClassDojo and email",
        saw: "Preschool families are told they'll be notified of postponements \"through ClassDojo and email at least one hour before class starts.\"",
        impact: "Families watch two places for a same-morning change.",
        source: "The Wild School, Cypress preschool page",
        url: "https://www.thewildschool.org/cypresspreschool",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["messaging", "mobile-app"],
          text: "One message to a location's families reaches them in the iPhone app and by email at once.",
        },
      },
      {
        area: "website",
        gap: "The home page is heavy on a phone",
        saw: "Google PageSpeed scores the home page 66 out of 100 on mobile. The page is about 9.3 MB, and the main content takes about 6 seconds to appear.",
        impact: "A parent on a phone with a weak signal waits a long time for the first screen.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://www.thewildschool.org/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with photos and video sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "The Wild School",
    founder: {
      fullName: "Lindsay Gkolomeev",
      firstName: "Lindsay",
      role: "Founder and CEO",
      source: "The Wild School, Our Team",
      url: "https://www.thewildschool.org/our-team",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Doug Pike interviewed Lindsay, as CEO, about The Wild School on the Fifty Plus podcast (September 23, 2025).",
        source: "Fifty Plus, \"The Wild School\" (Apple Podcasts episode listing)",
        url: "https://podcasts.apple.com/us/podcast/the-wild-school/id1614871329?i=1000728110264",
        readOn: "2026-11-23",
      },
      {
        fact: "Lindsay's Founder's Story says she trained as a nature-based educator in 2023, became a Texas Master Naturalist the following year, and counts securing ideal locations across Houston among the challenges of starting.",
        source: "The Wild School, Founder's Story",
        url: "https://www.thewildschool.org/founder-s-story",
        readOn: "2026-11-23",
      },
      {
        fact: "The Wild School now runs Wild Preschool at seven locations across Houston and describes itself as the largest private nature school in Texas.",
        source: "The Wild School home page and How to Apply",
        url: "https://www.thewildschool.org/",
        readOn: "2026-11-23",
      },
    ],
    hook: "Lindsay's Founder's Story says she trained as a nature-based educator in 2023, became a Texas Master Naturalist the following year, and counts securing ideal locations across Houston among the challenges of starting.",
    body: `Hi Lindsay,

I loved your Fifty Plus interview and your founder's story. You trained as a nature-based educator in 2023, became a Texas Master Naturalist the next year, and now Wild Preschool runs at seven locations across Houston.

Time outside is a big part of our days too. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for The Wild School.

I'd love to hear how you find the land for each new location.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Lindsay, a note from an outdoor microschool in Round Rock, Texas. J",
    shortCode: "wildschool-f2r7",
    checkBeforeMailing: [
      "Find a mailing address: the site lists no office, only host sites (farms and parks, such as the Cypress/Tomball farm on Cypress Rose Hill Rd), which aren't the school's own address. Ask by email, or look for a business address in its Texas filing.",
      "Listen to the Fifty Plus interview (September 2025) before mailing; the letter mentions it, and the detail comes from her Founder's Story.",
      "The story also mentions her son; the letter leaves that out.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about following a family across Airtable, Sawyer and ClassDojo, then who's asking and one proof number",
      subject: "Wild Preschool applications",
      body: `Hi Lindsay,

I mailed you a handwritten note last week with a card for The Wild School.

On your site, Wild Preschool families apply through one Airtable form behind all seven location buttons, enroll and pay in Sawyer, and get updates in ClassDojo.

With the next round of applications coming, how does your team follow one family from application to first day across those three?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Lindsay,

In case it's easier to see than describe, I set up a version of MudKitchen for The Wild School and recorded a 60-second walkthrough: an application landing in one admin inbox tagged by location, the registration checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where The Wild School is, with no pitch",
      where: "Instagram or Facebook (search for The Wild School Houston first)",
      body: "Hi Lindsay, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Seven fully outdoor preschool sites across Houston is a lot of wild.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Lindsay,

I also put together a one-page snapshot of what a family sees on your site today, from finding a price to applying and getting updates. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Lindsay,

I'll leave it here so I'm not cluttering your inbox. The Wild School version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with next year's play dates.

Julius`,
    },
  ],
};
