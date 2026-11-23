import type { OutreachPlan } from "./types";

export const innerFireAcademyOutreach: OutreachPlan = {
  slug: "inner-fire-academy",
  schoolName: "Inner Fire Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Sebastian",
    role: "Founder and Head Teacher (Sebastian Predescu)",
    source: "Inner Fire \"Who are you? Why did you start a school?\" and Our Teachers pages; the summer camp page calls him \"the head teacher at Inner Fire\"",
  },
  priorContact: {
    when: "May",
    what: "A hand-sent first email with a link to the Inner Fire MudKitchen demo",
  },
  angle:
    "Re-contact with the Family experience snapshot: the Apply to Enroll form still quotes 2025–26 tuition, and visits, applications, the enrollment overview and camps each live in a different Google or third-party tool.",
  facts: [
    {
      fact: "Inner Fire is San Francisco's school for gifted and twice-exceptional 5–12 year olds, with 8 students per lead teacher plus a TA; 2026–27 openings: 2 full-time, 1 part-time",
      source: "Inner Fire Academy home page",
      url: "https://innerfiresf.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "2026–27 full-time tuition is $39,500; part-time is prorated at $220 per day; tuition is billed monthly at the start of each month; need-based scholarships available",
      source: "Inner Fire Academy, Tuition",
      url: "https://innerfiresf.com/tuition",
      readOn: "2026-11-23",
    },
    {
      fact: "The home page's Apply to Enroll and Get in Touch buttons open the same Google Form, \"Inner Fire Academy -- Application Intake\", which says \"Our full tuition for the 2025-26 school year is $39,500\"",
      source: "Inner Fire Academy home page and its Application Intake form",
      url: "https://innerfiresf.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "Schedule a Visit is a separate Google Form; in-person visits are offered 2:00–3:30 any day, video intros Tuesday 4–5 or Monday/Wednesday 7–8, followed by a free trial day; the 2026–27 Overview & Enrollment is a Google Slides deck",
      source: "Inner Fire Academy home page",
      url: "https://innerfiresf.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "Sebastian left a corporate VP of Operations role in 2022 to teach full time, started as a substitute teacher, and found microschooling",
      source: "Inner Fire, \"Who are you? Why did you start a school?\" and Our Teachers",
      url: "https://innerfiresf.com/who-are-you",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in May (the first email says so).",
    "We'd build: Monthly billing for clubs, after-care or add-on classes. Their summer camps register on Omella.",
    "The Teachers page says Sebastian is a teenage cancer survivor; the plan and letter leave that out.",
    "No Instagram or Facebook is linked from the site; find their page before the social step, or skip it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "V9hBm59t-9Ef178A8w9Yvw",
    preparedOn: "2026-11-23",
    summary:
      "We read 43 pages of innerfiresf.com on Nov 23, 2026, plus the visit and application forms, the enrollment overview and the camp registration page.",
    pageSpeed: { mobileScore: 61, url: "https://innerfiresf.com/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Google Forms",
        usedFor: "Visit requests and the application intake",
        url: "https://innerfiresf.com/",
      },
      {
        name: "Google Slides",
        usedFor: "2026–27 Overview & Enrollment",
        url: "https://innerfiresf.com/",
      },
      {
        name: "Omella",
        usedFor: "Summer camp registration",
        url: "https://innerfiresf.com/summer-camps",
      },
    ],
    observations: [
      {
        area: "apply",
        gap: "The application form still says 2025–26",
        saw: "Apply to Enroll opens a Google Form, \"Application Intake\", which says \"Our full tuition for the 2025-26 school year is $39,500.\" The Tuition page gives the same price for 2026–27. Get in Touch opens the same form.",
        impact: "A family applying for this year sees last year's school year, and a family with a quick question lands in the full application.",
        source: "Inner Fire Academy home page and its Application Intake form",
        url: "https://innerfiresf.com/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "A short inquiry and a separate application that saves as families go, both landing in one admin inbox with the current year's details.",
        },
      },
      {
        area: "tour",
        gap: "Visits are requested, not booked",
        saw: "Schedule a Visit is a separate Google Form. The home page lists visit windows (2:00–3:30 any weekday, or evening video intros), then a free trial day.",
        impact: "A family describes when they'd like to come and waits to hear back before the visit is set.",
        source: "Inner Fire Academy home page",
        url: "https://innerfiresf.com/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "observation-booking"],
          text: "Families pick an open visit or video-intro slot, then book their trial day from the same place.",
        },
      },
      {
        area: "find",
        gap: "The enrollment overview is a slide deck",
        saw: "The home page's main button, \"2026-27 Overview & Enrollment\", opens a Google Slides presentation.",
        impact: "On a phone, families page through slides in Google's viewer to find details that aren't on the site itself.",
        source: "Inner Fire Academy home page",
        url: "https://innerfiresf.com/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We put the overview on the site itself, written and looked after for you.",
        },
      },
      {
        area: "pay",
        gap: "How families pay monthly tuition isn't stated",
        saw: "Tuition is $39,500 full time or $220 a day part time, billed monthly at the start of each month. The site doesn't say how families pay.",
        impact: "A part-time family can't see what each month's bill will be, or how to pay it, until they're enrolled.",
        source: "Inner Fire Academy, Tuition",
        url: "https://innerfiresf.com/tuition",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "parent-billing", "autopay"],
          text: "Full-time and per-day plans set up once, with each month's invoice on the family's billing page and autopay.",
        },
      },
      {
        area: "updates",
        gap: "Camps register on a separate site",
        saw: "Summer Math & Games Camp registration opens Omella, separate from everything else families use with Inner Fire.",
        impact: "Families who already enroll with Inner Fire create another account and pay again in a different place for camp.",
        source: "Inner Fire Academy, Summer Camps",
        url: "https://innerfiresf.com/summer-camps",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "parent-portal"],
          text: "Camp weeks offered in each family's login, charged on the same billing page as tuition.",
        },
      },
      {
        area: "website",
        gap: "The Teachers page has a \"To be announced\" spot",
        saw: "Between Sebastian and Sofia, the Our Teachers page shows an entry that just says \"TO BE ANNOUNCED.\"",
        impact: "A parent reading about who will teach their child sees an empty spot on the team.",
        source: "Inner Fire Academy, Our Teachers",
        url: "https://innerfiresf.com/teachers",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We look after the site for you, so pages stay current as the team changes.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 61 out of 100 on mobile, and the main content takes about 17 seconds to appear.",
        impact: "A parent opening the site on a phone may leave before they see anything about the school.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://innerfiresf.com/",
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
    shortSchoolName: "Inner Fire",
    founder: {
      fullName: "Sebastian Predescu",
      firstName: "Sebastian",
      role: "Founder and Head Teacher",
      source: "Inner Fire, Who are you? Why did you start a school?",
      url: "https://innerfiresf.com/who-are-you",
    },
    mailTo: {
      lines: ["Sebastian Predescu", "Inner Fire Academy", "2130 Harrison St, Unit B", "San Francisco, CA 94110"],
      source: "Inner Fire Contact Us page (\"2130 Harrison B, San Francisco CA, 94110\") and Summer Camps page (\"2130B Harrison St\")",
      url: "https://innerfiresf.com/contact-us",
    },
    founderFacts: [
      {
        fact: "Sebastian's page says he left a corporate VP of Operations role in 2022, started as a substitute teacher, and found microschooling, which \"felt right.\"",
        source: "Inner Fire, Who are you? Why did you start a school? and Our Teachers",
        url: "https://innerfiresf.com/who-are-you",
        readOn: "2026-11-23",
      },
      {
        fact: "Inner Fire takes only 8 students per class and accelerates by subject rather than grade level.",
        source: "Inner Fire Academy home page",
        url: "https://innerfiresf.com/",
        readOn: "2026-11-23",
      },
    ],
    hook: "Sebastian's page says he left a corporate VP of Operations role in 2022, started as a substitute teacher, and found microschooling, which \"felt right.\"",
    body: `Hi Sebastian,

I read your page on why you started a school. You left a VP of Operations job in 2022, started out as a substitute teacher, and now teach classes of eight in the Mission, accelerating by subject instead of grade.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Inner Fire.

I'd like to hear what's been harder than you expected.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Sebastian, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "innerfire-n6t3",
    checkBeforeMailing: [
      "The address is the school's own (Contact Us and Summer Camps pages).",
      "No podcast or press about Sebastian or Inner Fire turned up, so the letter opens on his own page.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the May email, the stale tuition year on the intake form, one proof number, offer the snapshot",
      subject: "Inner Fire's intake form",
      body: `Hi Sebastian,

I mailed you a handwritten note last week with a card for Inner Fire. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in May) and a one-page snapshot of what a family sees on your site today.

One thing stood out: the Apply to Enroll form still says "Our full tuition for the 2025-26 school year is $39,500," while your Tuition page is already on 2026–27.

I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Sebastian,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Inner Fire version: a visit request landing in your admin inbox, the enrollment checklist, and the monthly billing page a part-time family would see.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Inner Fire is, with no pitch",
      where: "LinkedIn (Sebastian) or Instagram (search for Inner Fire Academy SF first)",
      body: "Hi Sebastian, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. A chess and math camp with park recess sounds like a great week.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Sebastian,

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
      body: `Hi Sebastian,

I'll leave it here so I'm not cluttering your inbox. The Inner Fire version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck filling those last openings.

Julius`,
    },
  ],
};
