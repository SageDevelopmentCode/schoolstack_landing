import type { OutreachPlan } from "./types";

export const creationAcresOutreach: OutreachPlan = {
  slug: "creation-acres",
  schoolName: "Creation Acres Montessori",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Jasmine",
    role: "Head of School and founder",
    source: "Creation Acres Meet the Team page (Jasmine W., Head of School & Adolescent Guide, founded Creation Acres)",
  },
  angle: "Re-contact with a snapshot: Opportunity Scholarship families pay from two places, NCSEAA and the family",
  priorContact: {
    when: "July",
    what: "A hand-sent first email with a link to the Creation Acres MudKitchen demo",
  },
  facts: [
    {
      fact: "Registered NCSEAA Direct Payment School: families can use the NC Opportunity Scholarship for the microschool and the hybrid; the scholarship may not cover full tuition",
      source: "Creation Acres Opportunity Scholarship page",
      url: "https://www.creationacres.com/admissions/opportunity-scholarship",
      readOn: "2026-11-22",
    },
    {
      fact: "2027–28 full-time tuition runs from $11,190 (ages 3–6, 4 days) to $15,200 (ages 12–18, 5 days)",
      source: "Creation Acres Tuition & Financial Aid",
      url: "https://www.creationacres.com/admissions/tuition-financial-aid",
      readOn: "2026-11-22",
    },
    {
      fact: "2027–28 applications are open (priority deadline Jan 1, 2027): information request and call, application with a $75 fee, parent interview, assessment, trial day, decision; accepted families have 10 days for a registration form, a $150 family fee and a $750 deposit per child",
      source: "Creation Acres Admissions",
      url: "https://www.creationacres.com/admissions",
      readOn: "2026-11-22",
    },
    {
      fact: "The information request form runs on Playground; the microschool and hybrid applications are Jotforms that take the fee by card",
      source: "Creation Acres Request Information and Admissions pages",
      url: "https://www.creationacres.com/admissions/request-information",
      readOn: "2026-11-22",
    },
    {
      fact: "ESA+ provider",
      source: "Creation Acres FAQs",
      url: "https://www.creationacres.com/about/faqs",
      readOn: "2026-11-22",
    },
    {
      fact: "Each family contributes service hours (20 during the school year and 5 in summer for full-time families); a list of opportunities is sent out periodically",
      source: "Creation Acres Family Commitment",
      url: "https://www.creationacres.com/admissions/family-commitment",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in July (the first email says so).",
    "Confirm the founder's first name (Jasmine); the Meet the Team page shows only \"Jasmine W.\".",
    "Their information request form runs on Playground, childcare software that can also bill families and message them. Check whether they already bill or message through it before sending; the pay and updates cards only describe what the website shows.",
    "The demo still says a $75 registration fee, \"Fall 2026 Launch\" for the hybrid and \"Spring 2026 Nanoschool\"; the site now says $150 per family and Spring 2027. Update the demo before recording the Loom.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "We'd build: Monthly billing for clubs, after-care or add-on classes",
  ],
  snapshot: {
    token: "0HHKqSRrnJ4Q3syL677ZvA",
    preparedOn: "2026-12-01",
    summary: "We read 36 pages of creationacres.com on Dec 1, 2026, from Admissions and Tuition to the Hybrid program, plus the information request form and both applications.",
    pageSpeed: { mobileScore: 66, url: "https://www.creationacres.com/", checkedOn: "2026-12-01" },
    toolStack: [
      { name: "Playground", usedFor: "Information request form", url: "https://www.creationacres.com/admissions/request-information" },
      { name: "Jotform", usedFor: "Microschool and hybrid applications, with the fee", url: "https://www.creationacres.com/admissions" },
    ],
    observations: [
      {
        area: "tour",
        gap: "Three steps before a family can book a tour",
        saw: "Tour times are set (Tuesdays at 4:00 or 4:30 for Primary and Elementary, for example), but a family first fills in the information request form, then has a phone call, then waits for an emailed link to book.",
        impact: "Every tour takes a form, a call and an email before it's on the calendar, and families wait between each one.",
        source: "Creation Acres Tours & Open House Events",
        url: "https://www.creationacres.com/admissions/tours-open-house-events",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "After the call, families pick one of the tour slots you've opened and get a reminder before they come, with no link to send by hand.",
        },
      },
      {
        area: "apply",
        gap: "Families describe their child twice, in two tools",
        saw: "The information request form (Playground) asks for the child's name, birthday and a description of their personality. The application (Jotform) asks for the name and the same personality description again.",
        impact: "Families repeat themselves, and you piece each family together from two tools before the interview.",
        source: "Creation Acres Request Information",
        url: "https://www.creationacres.com/admissions/request-information",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Inquiries and applications land in one admin inbox under the same family, and the application lives on your site with saved drafts.",
        },
      },
      {
        area: "enroll",
        gap: "Ten days for three items, with no stated way to send them",
        saw: "Accepted families have 10 days to submit a registration form, the $150 family fee and a $750 deposit per child. The site doesn't say how the form is sent or signed, or how the fees are paid.",
        impact: "Families ask how before they can finish, and you track each form and payment against the 10-day window yourself.",
        source: "Creation Acres Admissions",
        url: "https://www.creationacres.com/admissions",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: the registration form signed online, the family fee and the deposit paid, with reminders before the 10 days are up.",
        },
      },
      {
        area: "pay",
        gap: "Scholarship families pay from two places",
        saw: "Creation Acres is an NCSEAA Direct Payment School and an ESA+ provider, and the site says the scholarship may not cover full tuition ($11,190 to $15,200). It doesn't say how the family's share is billed.",
        impact: "A scholarship family can't see what they still owe, and you match NCSEAA payments to each family's balance by hand.",
        source: "Creation Acres Opportunity Scholarship page",
        url: "https://www.creationacres.com/admissions/opportunity-scholarship",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "autopay"],
          text: "We'd set up billing so the scholarship portion is recorded against each family, and they see and pay only what's left, with autopay if they want it.",
        },
      },
      {
        area: "pay",
        gap: "Before School Care is arranged by message",
        saw: "Before School Care is $45 a week as a full-week commitment, and families are asked to let the school know upon enrollment if they want it.",
        impact: "Add-ons are tracked apart from tuition, so each week's charge is one more thing to bill and remember.",
        source: "Creation Acres 2026-2027 Schedule",
        url: "https://www.creationacres.com/daily-life/2026-2027-schedule",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["class-billing"],
          text: "We'd set up Before School Care as an add-on families choose at enrollment, billed with tuition.",
        },
      },
      {
        area: "updates",
        gap: "Service hours with no place to sign up",
        saw: "Full-time families give 20 service hours in the school year and 5 in summer. The page says a list of opportunities is sent out periodically.",
        impact: "Families can't see open opportunities when they have time, and you match volunteers to needs by email.",
        source: "Creation Acres Family Commitment",
        url: "https://www.creationacres.com/admissions/family-commitment",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["committees", "parent-portal"],
          text: "Families see open volunteer spots and sign up in their own login, so the list doesn't go around by email.",
        },
      },
      {
        area: "website",
        gap: "\"Our Montessori Approach\" shows Access denied",
        saw: "The Homeschool Programs page links to Our Montessori Approach, and that page returns \"Access denied\". The home page scores 66 out of 100 for speed on a phone.",
        impact: "A family comparing Montessori schools hits a dead end on the page that explains your approach.",
        source: "Creation Acres Homeschool Programs",
        url: "https://www.creationacres.com/homeschool-classes",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you is checked for dead links and kept fast on a phone.",
        },
      },
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro: acknowledge the July email, give a new reason (the snapshot), one proof number",
      subject: "Scholarship families at Creation Acres",
      body: `Hi Jasmine,

I wrote in July about a version of MudKitchen I set up for Creation Acres. Since then I put together a one-page snapshot of what a family sees on your site today, from the first inquiry to paying tuition.

One thing stood out: you're an NCSEAA Direct Payment School, and with tuition from $11,190, a scholarship family can pay from two places, NCSEAA and their own account.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Jasmine,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Creation Acres version: the homepage, the enrollment checklist and billing a parent sees, and your admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school is, with no pitch",
      where: "Instagram or Facebook (creationacres)",
      body: "Hi Jasmine, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Gardens, chickens and 20 acres of farmland for the hybrid sounds wonderful.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Jasmine,

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
      body: `Hi Jasmine,

I'll leave it here so I'm not cluttering your inbox. The Creation Acres version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with 2027–28 admissions.

Julius`,
    },
  ],
};
