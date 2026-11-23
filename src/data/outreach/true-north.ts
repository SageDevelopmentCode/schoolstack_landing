import type { OutreachPlan } from "./types";

export const trueNorthOutreach: OutreachPlan = {
  slug: "true-north",
  schoolName: "True North",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Lisa",
    role: "Founder and Executive Director",
    source:
      "True North Staff page (\"Lisa Palmer- Founder and Executive Director\"); Jayme Dicker is listed as Co-Founder and Director of Education",
  },
  angle:
    "One real question: tuition is $417 a month per child ($367 for each additional child) and the About page says the school has over 150 students. How do families pay each month? The site doesn't say.",
  facts: [
    {
      fact: "Base tuition is $417 a month for both days ($3,753 a year); second and additional students pay $367 a month ($3,303 a year). Only the full two-day program is offered; books, uniforms and athletics (per season) cost extra",
      source: "True North Classes/Tuition page",
      url: "https://truenortheducation.weebly.com/classestuition.html",
      readOn: "2026-11-22",
    },
    {
      fact: "Opened in fall 2017 with 14 teachers and admins and 62 students; the page says the school now has over 150 students. School days are Tuesday and Thursday, 9:00–2:50, with three days of assignments at home",
      source: "True North About page",
      url: "https://truenortheducation.weebly.com/about.html",
      readOn: "2026-11-22",
    },
    {
      fact: "A 501(c)(3) partnered with Lone Star College for dual credit; Thursdays add dual credit, foreign language and enrichment classes",
      source: "True North About page",
      url: "https://truenortheducation.weebly.com/about.html",
      readOn: "2026-11-22",
    },
    {
      fact: "Store pages list Monthly Tuition Per Child at $352, Per Additional Child at $308 and an annual $75 Family Registration Fee, each marked Unavailable with an Add to Cart button; the store isn't in the site menu",
      source: "True North store pages",
      url: "https://truenortheducation.weebly.com/store/p2/Monthly_Tuition_Per_Child.html",
      readOn: "2026-11-22",
    },
    {
      fact: "The Resources page has a FORMS heading and a line asking families to send completed forms to the school's email address, with no forms linked",
      source: "True North Resources page",
      url: "https://truenortheducation.weebly.com/resources.html",
      readOn: "2026-11-22",
    },
    {
      fact: "The Info Videos page holds a five-part Virtual Information Meeting on YouTube (\"Please be sure to watch them all\"); the only form on the site is the Contact form (name, email, comment)",
      source: "True North Info Videos and Contact pages",
      url: "https://truenortheducation.weebly.com/info-videos.html",
      readOn: "2026-11-22",
    },
    {
      fact: "Hiring for the 2026–2027 school year: Jr. High/High School Geometry and Science",
      source: "True North Employment Opportunities page",
      url: "https://truenortheducation.weebly.com/employment-opportunities.html",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Lisa Palmer is named on the Staff page as Founder and Executive Director, but the site shows no address for her (a contact form and a general school address only). Find her email in the CRM or elsewhere; Jayme Dicker (Co-Founder, Director of Education, who posted the info videos) is the alternative.",
    "\"Over 150 students\" is from the About page, which isn't dated. Keep the email's wording as \"the About page says\".",
    "The store pages ($352 and $308 monthly tuition, $75 registration fee) are marked Unavailable and aren't in the menu. We don't know how families pay today; the email asks rather than assumes.",
    "The demo says The Woodlands, TX; the Contact page gives a Montgomery, TX address. The demo also leaves out dual credit with Lone Star College and foreign language. Decide whether to update the demo before recording the Loom.",
    "We'd build: Monthly billing for clubs, after-care or add-on classes. Confirm we'd set up per-season athletics fees billed alongside tuition.",
    "No social accounts are linked from the site and none turned up in a search. Find Lisa on Facebook or LinkedIn before the social step, or skip it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "l1KweCX5PQtXZpaGf6P0rQ",
    preparedOn: "2026-11-22",
    summary:
      "We read all 14 pages of truenortheducation.weebly.com on Nov 22, 2026, including Classes/Tuition, About, Staff, Resources, Info Videos, Contact and the three store pages.",
    pageSpeed: { mobileScore: 55, url: "https://truenortheducation.weebly.com/", checkedOn: "2026-11-22" },
    toolStack: [
      { name: "YouTube", usedFor: "Five-part virtual information meeting", url: "https://truenortheducation.weebly.com/info-videos.html" },
      { name: "Weebly contact form", usedFor: "Questions to the school", url: "https://truenortheducation.weebly.com/contact.html" },
      { name: "Square Online store", usedFor: "Tuition and registration fee items", url: "https://truenortheducation.weebly.com/store/p1/Family_Registration_Fee.html" },
      { name: "Email", usedFor: "Sending in completed forms", url: "https://truenortheducation.weebly.com/resources.html" },
    ],
    observations: [
      {
        area: "pay",
        gap: "The site doesn't say how families pay monthly tuition",
        saw: "Classes/Tuition gives $417 a month for both days and $367 for each additional child, with books, uniforms and per-season athletics extra. No page says how or when families pay, or whether autopay is an option.",
        impact: "With over 150 students, that's well over a hundred tuition payments every month for families to remember and for the office to match up.",
        source: "True North Classes/Tuition page",
        url: "https://truenortheducation.weebly.com/classestuition.html",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "autopay", "card-and-ach"],
          text: "Each family gets a billing page with their balance and invoices, and can turn on autopay by card or bank so the monthly payment happens on its own.",
        },
      },
      {
        area: "find",
        gap: "Store pages show a different tuition price",
        saw: "The store pages list Monthly Tuition Per Child at $352 and Per Additional Child at $308, each marked Unavailable with an Add to Cart button. The Classes/Tuition page says $417 and $367.",
        impact: "A parent who lands on a store page from a search sees a price that doesn't match the tuition page, and has to write in to ask which is right.",
        source: "True North store page (Monthly Tuition Per Child)",
        url: "https://truenortheducation.weebly.com/store/p2/Monthly_Tuition_Per_Child.html",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "tuition-rate-plans", "discounts"],
          text: "Tuition lives in one place: the rate and the additional-child discount are set once and the same numbers show on the site and on each family's bill.",
        },
      },
      {
        area: "apply",
        gap: "There's no way to apply on the site",
        saw: "No page covers admissions or how to apply. Families are asked to watch the five-part information meeting, and the only form on the site is the Contact form (name, email, comment).",
        impact: "A family ready to enroll has to send a general message and wait to hear what comes next, and the office sorts applications out of the inbox.",
        source: "True North Contact page",
        url: "https://truenortheducation.weebly.com/contact.html",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families apply from a form on your site with their child's grade, and each one lands in your admin inbox with its stage, from inquiry to enrolled.",
        },
      },
      {
        area: "tour",
        gap: "Meeting the school starts with five videos and a form",
        saw: "The Info Videos page holds a Virtual Information Meeting in five YouTube parts with \"Please be sure to watch them all\". There's no way to book a visit, a call or a live info session.",
        impact: "A family with questions after the videos writes in and waits for a reply before they can see a classroom on a Tuesday or Thursday.",
        source: "True North Info Videos page",
        url: "https://truenortheducation.weebly.com/info-videos.html",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a visit time on a Tuesday or Thursday from slots you open, with a reminder before they come.",
        },
      },
      {
        area: "enroll",
        gap: "The Forms section has no forms in it",
        saw: "The Resources page has a FORMS heading and asks families to send completed forms to the school's email address, but no forms are linked. The $75 annual Family Registration Fee is a store item marked Unavailable.",
        impact: "Families have to ask for the forms, fill them in, and email them back, and the office tracks which of 150-plus families have sent theirs and paid the fee.",
        source: "True North Resources page",
        url: "https://truenortheducation.weebly.com/resources.html",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: forms filled in online, the agreement signed, and the $75 registration fee paid in the same place, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "Athletics is a separate cost with no price or sign-up",
        saw: "Classes/Tuition says \"Athletics programs are a separate cost per season.\" The site gives no amount, season dates or way to sign up.",
        impact: "Each season, families learn the cost and pay it separately from tuition, and the school collects it on its own.",
        source: "True North Classes/Tuition page",
        url: "https://truenortheducation.weebly.com/classestuition.html",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "parent-billing"],
          text: "We'd set up each season's athletics fee as an add-on families sign up for, billed on the same page as tuition.",
        },
      },
      {
        area: "updates",
        gap: "No calendar or family login on the site",
        saw: "The site gives school days (Tuesday and Thursday, 9:00–2:50) but has no school calendar, family page or login. Info is the public pages and the Contact form.",
        impact: "Dates, reminders and messages for 150-plus families go out by email, and there's no one place a parent can check.",
        source: "True North About page",
        url: "https://truenortheducation.weebly.com/about.html",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["parent-portal", "calendar", "messaging", "mobile-app"],
          text: "Each family gets one login on the web and the iPhone app with the school calendar, messages from teachers and the office, and their billing.",
        },
      },
      {
        area: "website",
        gap: "Three pages are a heading with nothing under it",
        saw: "Exceptional Accomplishments shows only \"Accomplishments and Recognition\", Giving only \"Contribute to True North\" with no way to give, and Resources a FORMS heading with no forms. The home page scored 55 out of 100 for speed on a phone.",
        impact: "A visiting parent or donor clicks through to empty pages, and the site is slow to load on a phone, where most families first look.",
        source: "True North Giving page",
        url: "https://truenortheducation.weebly.com/giving.html",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service"],
          text: "We'd build and look after a fast site with your programs, tuition and staff, so every page has something on it and the details stay current.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "True North",
    founder: {
      fullName: "Lisa Palmer",
      firstName: "Lisa",
      role: "Founder and Executive Director",
      source: "True North Staff page (\"Lisa Palmer- Founder and Executive Director\")",
      url: "https://truenortheducation.weebly.com/staff.html",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "True North's About page says it launched its first year in fall 2017 with a team of 14 teachers and admins and 62 students, now has over 150 students, and teaches two days a week in person with three days of assignments at home.",
        source: "True North About page",
        url: "https://truenortheducation.weebly.com/about.html",
        readOn: "2026-11-22",
      },
      {
        fact: "On the Staff page, Lisa Palmer writes that she served on the school board for Buckalew Elementary in The Woodlands during its founding year.",
        source: "True North Staff page",
        url: "https://truenortheducation.weebly.com/staff.html",
        readOn: "2026-11-22",
      },
    ],
    hook: "True North's About page says it launched its first year in fall 2017 with a team of 14 teachers and admins and 62 students, now has over 150 students, and teaches two days a week in person with three days of assignments at home.",
    body: `Hi Lisa,

I read on your About page that True North opened in fall 2017 with 62 students and a team of 14. It's over 150 students now, still together in person two days a week with three days of work at home.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for True North.

I'd like to hear how you've kept the two-day model as the school grew.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Lisa, a note from a microschool in Round Rock, Texas. J",
    shortCode: "truenorth-21od",
    checkBeforeMailing: [
      "Find a mailing address: the Contact page lists a street address in Montgomery, TX, on a road of homes on acreage; nothing on the site or in a search shows it's a school building or church rather than a home, so it isn't stored. No PO box. If you confirm it's where classes meet, address the envelope to Lisa Palmer, True North.",
      "The \"Take Back the Next Generation\" founding story on the Staff page is Jayme Dicker's (Co-Founder, Director of Education), not Lisa's, so the letter doesn't use it.",
      "The first email and the social note also mention 62 students growing to over 150; the letter opens on the same About page, so keep the email's own angle (how families pay) when it goes out.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about how families pay monthly tuition, then who's asking and one proof number",
      subject: "monthly tuition at True North",
      body: `Hi Lisa,

I mailed you a handwritten note last week with a card for True North.

I was reading the True North site. Tuition is $417 a month for both days, $367 for each additional child, and the About page says you now have over 150 students.

That's a lot of payments every month. How do families pay tuition today? I couldn't tell from the site.

I ask because I run Sage Field, a microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so she can see it without clicking around",
      body: `Hi Lisa,

In case it's easier to see than describe, I set up a version of MudKitchen for True North and recorded a 60-second walkthrough: a family's inquiry landing in your admin inbox, the enrollment checklist after you accept them, and the page where they'd pay $417 a month.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Facebook or LinkedIn (Lisa Palmer), if she's there; the site links no social accounts",
      body: "Hi Lisa, I'm Julius. I run Sage Field, a small microschool in Round Rock, TX. Loved reading how True North grew from 62 students in 2017 to over 150.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Lisa,

I also put together a one-page snapshot of what a family sees on your site today, from the info videos to paying each month. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Lisa,

I'll leave it here so I'm not cluttering your inbox. The True North version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the school year.

Julius`,
    },
  ],
};
