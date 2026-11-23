import type { OutreachPlan } from "./types";

export const brazosValleyHonorAcademyOutreach: OutreachPlan = {
  slug: "brazos-valley-honor-academy",
  schoolName: "Brazos Valley Honor Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Amber",
    role: "Director",
    source: "KBTX, Mar 20, 2025 (\"A spring rodeo for the whole family to support the Brazos Valley Honor Academy\") quotes Amber Trapp as the academy's director; the school's own site names no staff",
  },
  angle: "One real question: the new tuition page sets a first-Tuesday due date, a $25 late fee and two discounts that can't be combined, but doesn't say how families pay, while the family portal is being introduced in stages",
  facts: [
    {
      fact: "K–8 core classes are $490 a month, September–May, due the first Tuesday of each month (September on the first day of school); $25 late fee after a three-day grace period",
      source: "BVHA Tuition & Fees",
      url: "https://www.mybvha.com/tuition",
      readOn: "2026-11-22",
    },
    {
      fact: "10% sibling discount per additional child, or 10% off for paying the full year in advance; the discounts can't be combined",
      source: "BVHA Tuition & Fees",
      url: "https://www.mybvha.com/tuition",
      readOn: "2026-11-22",
    },
    {
      fact: "Fees: $100 enrollment and assessment per student, $350 supplies per new student ($150 returning); a $50 late fee applies after \"the specified deadline\", which the site doesn't give",
      source: "BVHA Tuition & Fees",
      url: "https://www.mybvha.com/tuition",
      readOn: "2026-11-22",
    },
    {
      fact: "New-student enrollment and re-enrollment both open Microsoft Forms (titled 2026-2027); next steps are a conversation and student assessment, then placement. The new-student form says a director emails after it's submitted",
      source: "BVHA Enrollment and the Student Enrollment Form (Microsoft Forms)",
      url: "https://www.mybvha.com/enrollment",
      readOn: "2026-11-22",
    },
    {
      fact: "Every \"Schedule a visit\" button goes to the Contact page: a message form, a phone number and school hours. No visit times to book",
      source: "BVHA Contact & Visit",
      url: "https://www.mybvha.com/contact",
      readOn: "2026-11-22",
    },
    {
      fact: "The family portal \"is being introduced in stages\"; the privacy notice was last updated October 20, 2026. The site (\"Website by Nurds\") replaced an older one between August and October 2026",
      source: "BVHA Privacy",
      url: "https://www.mybvha.com/privacy",
      readOn: "2026-11-22",
    },
    {
      fact: "Campus campaign: an initial $150,000 goal toward a down payment on a prospective 50-acre property with classrooms, agricultural learning, a restored farmhouse and a small chapel; gifts go through PayPal",
      source: "BVHA Help BVHA Put Down Roots",
      url: "https://www.mybvha.com/support",
      readOn: "2026-11-22",
    },
    {
      fact: "Fundraisers: Christmas in the Country (Dec 9, 2023), Spring Rodeo (Mar 22, 2025) and an online silent auction on the school's own site, Nov 15–21, 2026",
      source: "BVHA Community & Events",
      url: "https://www.mybvha.com/events",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm Amber Trapp is still BVHA's director: the only source is KBTX (March 2025); the school's site names no staff.",
    "The demo still shows K–7 and $475/month; the site now says K–8 and $490/month. Update the demo before recording the Loom.",
    "BVHA relaunched its site this fall (\"Website by Nurds\") with its own family portal and auction. Re-read the first email's portal question with that in mind.",
    "Confirm MudKitchen can keep the sibling and pay-in-full discounts from stacking (snapshot card on discounts).",
    "Before follow-up 2, check that mybvha.com/events still returns Not Found (snapshot website card).",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "eU-pNn3ouAkJ5ItjImjATg",
    preparedOn: "2026-11-22",
    summary: "We read every page of mybvha.com on Nov 22, 2026, from Tuition and Enrollment to the auction pages, plus both Microsoft enrollment forms.",
    pageSpeed: { mobileScore: 81, url: "https://www.mybvha.com/", checkedOn: "2026-11-22" },
    observations: [
      {
        area: "tour",
        gap: "Booking a visit starts with a message or a call",
        saw: "Every \"Schedule a visit\" button leads to the Contact page, where families send a message or call during school hours, Tuesday to Thursday. There are no visit times to pick.",
        impact: "A family who finds BVHA in the evening waits for a reply before they can see the school, and each visit is arranged one message at a time.",
        source: "BVHA Contact & Visit",
        url: "https://www.mybvha.com/contact",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a visit time from slots you open, and get a reminder before they come.",
        },
      },
      {
        area: "apply",
        gap: "Enrollment starts on a Microsoft Form, then moves to email",
        saw: "Both enrollment buttons open Microsoft Forms. The new-student form asks for the student's details over several pages and says one of the directors will email after it's submitted. The conversation, assessment and placement follow from there.",
        impact: "Answers sit in Microsoft Forms while the next steps happen in email, so there's no single place to see where each family is.",
        source: "BVHA Enrollment",
        url: "https://www.mybvha.com/enrollment",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "The application lives on your site with saved drafts, and every inquiry and application lands in one admin inbox with the family's record.",
        },
      },
      {
        area: "enroll",
        gap: "Enrollment fees have a deadline the site doesn't give",
        saw: "The Tuition page lists a $100 enrollment and assessment fee and $350 for supplies per new student ($150 returning), with a $50 late fee after \"the specified deadline\". The site doesn't give the deadline or say how to pay these fees.",
        impact: "A family can't plan for a date they haven't seen, so someone at BVHA has to tell each family when and how to pay.",
        source: "BVHA Tuition & Fees",
        url: "https://www.mybvha.com/tuition",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-fees"],
          text: "Accepted families get one checklist with the fees paid online inside it, and reminders before the deadline.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say how families pay tuition",
        saw: "Tuition is $490 a month, September to May, due the first Tuesday, with a $25 late fee after a three-day grace period. The only payment link on the site is PayPal, for gifts to the campus campaign.",
        impact: "New families can't see how they'll pay before they enroll, and a reminder before the first Tuesday is the difference between paying on time and a late fee.",
        source: "BVHA Tuition & Fees",
        url: "https://www.mybvha.com/tuition",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "autopay", "card-and-ach"],
          text: "Families see their balance and pay by card or bank in their portal, and autopay takes tuition on the due date.",
        },
      },
      {
        area: "pay",
        gap: "Two discounts that can't be combined",
        saw: "Families get 10% off for each additional child, or 10% off for paying the full year in advance, but not both.",
        impact: "Each family's amount depends on which discount they take, and that choice has to be recorded and applied correctly on every bill.",
        source: "BVHA Tuition & Fees",
        url: "https://www.mybvha.com/tuition",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["parent-plan-choice", "tuition-rate-plans", "discounts"],
          text: "Families pick monthly or pay-in-full when they enroll, and the discount that applies is set on their plan, so each bill comes out right.",
        },
      },
      {
        area: "updates",
        gap: "There's no school calendar on the site",
        saw: "September tuition is due \"on the first day of school\", but the site doesn't give that date, holidays or the school-year calendar. The Events page covers fundraisers, and the family portal is \"being introduced in stages\".",
        impact: "Families ask for dates by email or phone, and any change has to reach each family some other way.",
        source: "BVHA Privacy",
        url: "https://www.mybvha.com/privacy",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "messaging", "parent-portal"],
          text: "The family portal in MudKitchen already includes a school calendar and two-way messages next to billing, in one login for each family.",
        },
      },
      {
        area: "website",
        gap: "Older mybvha.com links open a Not Found page",
        saw: "Addresses without \"www\", such as mybvha.com/events and the old About Us page that search results still list, return a page that says \"HTTP Status: 404 (not found)\".",
        impact: "A family who clicks through from a search result lands on an error instead of the new site.",
        source: "mybvha.com/events",
        url: "https://mybvha.com/events",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service"],
          text: "When we run a school's site, we point every old address at its new page. Here it's likely a quick redirect for whoever manages the domain.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "BVHA",
    founder: {
      fullName: "Amber Trapp",
      firstName: "Amber",
      role: "Director",
      source: "KBTX, A spring rodeo for the whole family to support the Brazos Valley honor academy (March 20, 2025)",
      url: "https://www.kbtx.com/2025/03/20/spring-rodeo-whole-family-support-brazos-valley-honor-academy/",
    },
    mailTo: {
      lines: ["Brazos Valley Honor Academy", "304 Frazier Street", "Navasota, TX 77868"],
      source: "BVHA Contact & Visit page (the visit address; also in the site footer and the schema.org School address)",
      url: "https://www.mybvha.com/contact",
    },
    founderFacts: [
      {
        fact: "BVHA's campus campaign page says the school is working toward a permanent campus, starting with a $150,000 goal toward a down payment on a prospective 50-acre property with room for classrooms, agricultural learning, a restored farmhouse and a small chapel.",
        source: "Help BVHA Put Down Roots | Campus Campaign",
        url: "https://www.mybvha.com/support",
        readOn: "2026-11-22",
      },
      {
        fact: "In a KBTX story (March 20, 2025), director Amber Trapp said BVHA's spring rodeo fit the school because many of its families live out in the country and have horses.",
        source: "KBTX, A spring rodeo for the whole family to support the Brazos Valley honor academy",
        url: "https://www.kbtx.com/2025/03/20/spring-rodeo-whole-family-support-brazos-valley-honor-academy/",
        readOn: "2026-11-22",
      },
      {
        fact: "BVHA's first fundraiser was Christmas in the Country (December 9, 2023), its second the Spring Rodeo (March 22, 2025), and its 2026 online silent auction ran November 15–21.",
        source: "Community & Events | Brazos Valley Honor Academy",
        url: "https://www.mybvha.com/events",
        readOn: "2026-11-22",
      },
    ],
    hook: "BVHA's campus campaign page says the school is working toward a permanent campus, starting with a $150,000 goal toward a down payment on a prospective 50-acre property with room for classrooms, agricultural learning, a restored farmhouse and a small chapel.",
    body: `Hi Amber,

I saw BVHA is raising money toward a permanent home, maybe a 50-acre property with room for gardens, animals and a restored farmhouse.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock. We built MudKitchen from the start to run our enrollment and tuition, and it's a big part of how we grew. Now we offer it to other microschools too.

I'd like to hear how the silent auction went and where the campaign stands. A text is plenty.

Julius`,
    postscript: "The card inside has a version of BVHA I set up, plus a parent's-eye look at your enrollment and tuition.",
    stickyNote: "Amber, a note from a microschool in Round Rock. J",
    shortCode: "bvha-zf1z",
    checkBeforeMailing: [
      "Confirm Amber Trapp is still BVHA's director, and whether she founded it: the only source is KBTX (March 2025) and the school's site names no staff.",
      "304 Frazier Street is the visit address with school hours on the Contact page, and the campaign page calls the current site rented. Glance at it on a map to make sure it's the school building, not a house.",
      "The 50-acre property is described as prospective. If the campaign page has changed (property secured or dropped), adjust the first line.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention the handwritten note, then one real question about how families pay tuition, from their own tuition page, plus one proof number",
      subject: "BVHA's first-Tuesday tuition",
      body: `Hi Amber,

I mailed you a handwritten note last week with a card for BVHA.

I was also reading the new BVHA tuition page. Tuition is $490 a month, due the first Tuesday, with a $25 late fee after three days, and the sibling and pay-in-full discounts can't be combined.

Is tuition part of the family portal you're rolling out, or do families pay another way today?

I ask because I run Sage Field, a microschool in Round Rock, and built MudKitchen to bill families like that. We went from 0 to 35 students in under 3 months on it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Amber,

In case it's useful, I recorded a 60-second walkthrough of a BVHA version of MudKitchen: a family requesting a visit, the enrollment checklist after acceptance, and monthly tuition in the parent portal.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school is, with no pitch",
      where: "Facebook (myBVHA)",
      body: "Hi Amber, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Loved reading the plans for a campus with gardens, animals and a chapel.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Amber,

I went through the BVHA site from a family's side, from booking a visit to monthly tuition, and wrote up what I noticed. No reply needed:

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

I'll leave it here so I'm not cluttering your inbox. The BVHA version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the campus campaign.

Julius`,
    },
  ],
};
