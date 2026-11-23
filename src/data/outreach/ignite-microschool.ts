import type { OutreachPlan } from "./types";

export const igniteMicroschoolOutreach: OutreachPlan = {
  slug: "ignite-microschool",
  schoolName: "Ignite Microschool",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Beth",
    role: "Founder, Director and Lead Teacher (Beth Kinzer)",
    source: "Ignite Microschool and About pages (\"Beth Kinzer, Our Founder\"; \"our director and lead teacher Beth Kinzer\")",
  },
  priorContact: {
    when: "May",
    what: "A hand-sent first email with a link to the Ignite MudKitchen demo",
  },
  angle:
    "Re-contact with the Family experience snapshot: four pages describe the microschool four different ways (days, hours, ages and school year), and tuition is paid by check or cash in six payments.",
  facts: [
    {
      fact: "Ignite is Greenville's first microschool, a hybrid homeschool where families register as SC Option 3 homeschoolers; WYFF 4 covered it before it opened in fall 2020",
      source: "Ignite Microschool page and the \"Ignite Microschool On TV!\" blog post",
      url: "https://www.igniteingenuity.org/post/ignite-microschool-on-tv",
      readOn: "2026-11-23",
    },
    {
      fact: "The 2026–27 page describes a Wednesday microschool for ages 6–8 (9:30–11:30) and 9–12 (1:30–3:30), a 12-week fall and 16-week winter/spring semester, and $1,260 tuition paid by check or cash in full or in six $210 payments",
      source: "Ignite, 2026–2027 Microschool (page titled \"2024 - 2025 Microschool\")",
      url: "https://www.igniteingenuity.org/school-life",
      readOn: "2026-11-23",
    },
    {
      fact: "The interest form page says Ignite is \"enrolling 9 - 12 year - olds for the Wednesday & Thursday Microschool for the 2025 - 2026 school year\"; the 2026–2027 application page says it's accepting students \"for the 2025 - 2026 school year\" for a cohort of 8–10 year-olds",
      source: "Ignite, Microschool Interest Form and Microschool Application pages",
      url: "https://www.igniteingenuity.org/microschool-multi-step-application",
      readOn: "2026-11-23",
    },
    {
      fact: "The FAQ says school meets 9:30–1:00 and cohorts meet 2 days a week; tuition is paid in full each semester or monthly, check or cash preferred, with a 3% fee for credit cards",
      source: "Ignite, Microschool FAQs",
      url: "https://www.igniteingenuity.org/microschool-faqs",
      readOn: "2026-11-23",
    },
    {
      fact: "Admissions: interest form, a call with Beth, an application per child with a $50 fee and Reference Forms from two adults, then an admissions committee decision",
      source: "Ignite, Microschool FAQs and 2026–2027 Microschool",
      url: "https://www.igniteingenuity.org/microschool-faqs",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in May (the first email says so).",
    "Ignite is very small: a one-day-a-week microschool for homeschoolers at $1,260 a year, run from Beth's home with at most 6 children at a time. Decide whether it's worth pursuing.",
    "The Location page says Ignite is registered with DSS as a Family Home Child Care Center, while the waiver page calls it \"not a licensed childcare or daycare facility.\" The plan doesn't raise this; don't bring it up.",
    "Ignite runs from Beth's home, so no address is stored; see the letter's mailing note.",
    "Batch note: pulled forward from batch 5 because The Wild School was skipped (it's a multi-site nature school, not a microschool).",
    "No Instagram or Facebook link was found on the microschool pages; find their page before the social step, or skip it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "Q5MpmTllkzzGkmX8o_WpJQ",
    preparedOn: "2026-11-23",
    summary:
      "We read 55 pages of igniteingenuity.org on Nov 23, 2026, including the microschool pages, the FAQ, the interest form and the application.",
    pageSpeed: { mobileScore: 66, url: "https://www.igniteingenuity.org/ignite-microschool", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Wix forms",
        usedFor: "Microschool interest form and application",
        url: "https://www.igniteingenuity.org/microschool-multi-step-application",
      },
      {
        name: "Wix Bookings",
        usedFor: "Camps and after-school classes",
        url: "https://www.igniteingenuity.org/book-online",
      },
      {
        name: "Check or cash",
        usedFor: "Microschool tuition",
        url: "https://www.igniteingenuity.org/school-life",
      },
    ],
    observations: [
      {
        area: "find",
        gap: "Four pages describe four different schedules",
        saw: "The 2026–27 page says Wednesdays, 9:30–11:30 for ages 6–8 and 1:30–3:30 for 9–12. The interest form page says \"Wednesday & Thursday\" for 9–12 year-olds in 2025–26. The application page mentions a cohort of 8–10 year-olds for 2025–26. The FAQ says 9:30–1:00, two days a week.",
        impact: "A family can't tell which days, hours or ages apply this year without asking.",
        source: "Ignite, 2026–2027 Microschool, Interest Form, Application and FAQs",
        url: "https://www.igniteingenuity.org/school-life",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We write and look after the site for you, with one up-to-date schedule on every page.",
        },
      },
      {
        area: "pay",
        gap: "Tuition is paid by check or cash",
        saw: "The $1,260 tuition is paid in full or in six $210 payments, by check or cash. The FAQ adds a 3% fee for credit cards.",
        impact: "Families hand over a check or cash six times a year, can't see what they've paid, and pay more to use a card.",
        source: "Ignite, 2026–2027 Microschool and FAQs",
        url: "https://www.igniteingenuity.org/school-life",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "card-and-ach", "autopay", "parent-billing"],
          text: "The six payments set up once, paid by bank transfer or card with autopay, and every payment on the family's billing page.",
        },
      },
      {
        area: "apply",
        gap: "Applying takes two forms, two references and a fee",
        saw: "Families fill in the interest form, have a call with Beth, then complete a multi-step application per child, a $50 fee and Reference Forms from two adults. The site doesn't say how to pay the fee.",
        impact: "A family can't see which steps they've finished or how to pay the application fee.",
        source: "Ignite, Microschool FAQs and 2026–2027 Microschool",
        url: "https://www.igniteingenuity.org/microschool-faqs",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["online-application", "application-fee", "admissions-pipeline"],
          text: "One application per child that saves as they go, takes the $50 fee online, and shows each family which references are still to come.",
        },
      },
      {
        area: "tour",
        gap: "The interest call is set up by message",
        saw: "After the interest form, \"Beth Kinzer will contact you to schedule a follow-up phone call.\"",
        impact: "A family waits to hear back before they can pick a time to talk.",
        source: "Ignite, Microschool Interest Form",
        url: "https://www.igniteingenuity.org/microschool-application",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a call time from your open slots right after sending the interest form.",
        },
      },
      {
        area: "enroll",
        gap: "The waiver and photo release are a page to read",
        saw: "The Waivers and Release page sets out the participation waiver and photo release in full. Families commit to the whole year's tuition. The site doesn't say where families sign either.",
        impact: "A family can't see what they're agreeing to sign, or where, until they're enrolled.",
        source: "Ignite, Waivers and Release Form; 2026–2027 Microschool",
        url: "https://www.igniteingenuity.org/new-pageignite-waivers-and-release",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["enrollment-agreements", "forms-documents", "photos"],
          text: "The year's commitment, waiver and photo release signed online in one checklist, with photo consent respected in a private family gallery.",
        },
      },
      {
        area: "website",
        gap: "The microschool page is slow on a phone",
        saw: "Google PageSpeed scores the microschool page 66 out of 100 on mobile, and the main content takes about 7 seconds to appear.",
        impact: "A parent opening the page on a phone waits several seconds before seeing anything about the microschool.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://www.igniteingenuity.org/ignite-microschool",
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
    shortSchoolName: "Ignite",
    founder: {
      fullName: "Beth Kinzer",
      firstName: "Beth",
      role: "Founder, Director and Lead Teacher",
      source: "Ignite, About",
      url: "https://www.igniteingenuity.org/about-ignite",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Ignite's blog post \"Ignite Microschool On TV!\" says WYFF 4 visited before the microschool opened in fall 2020 as Greenville's first microschool.",
        source: "Ignite, \"Ignite Microschool On TV!\"",
        url: "https://www.igniteingenuity.org/post/ignite-microschool-on-tv",
        readOn: "2026-11-23",
      },
      {
        fact: "Beth's About page says her heart has a special place for divergent learners, and that Ignite was born from that place.",
        source: "Ignite, About",
        url: "https://www.igniteingenuity.org/about-ignite",
        readOn: "2026-11-23",
      },
    ],
    hook: "Ignite's blog post \"Ignite Microschool On TV!\" says WYFF 4 visited before the microschool opened in fall 2020 as Greenville's first microschool.",
    body: `Hi Beth,

I read your post about WYFF 4 visiting before Ignite's first fall in 2020, when it opened as Greenville's first microschool. Six years on, kids are still building rockets and robots with you every Wednesday.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Ignite.

I'd like to hear how the microschool has changed since that first fall.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Beth, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "ignite-p8j4",
    checkBeforeMailing: [
      "Find a mailing address: Ignite's Location page says it runs from Beth's home, and the CRM's street address is that home, so nothing is stored. Ask for a mailing address or PO box by email, or skip the letter for this school.",
      "The hook comes from Ignite's own blog post about the 2020 WYFF 4 visit; no podcast turned up.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the May email, one detail from the snapshot, one proof number, offer the snapshot",
      subject: "Ignite's schedule pages",
      body: `Hi Beth,

I mailed you a handwritten note last week with a card for Ignite. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in May) and a one-page snapshot of what a family sees on your site today.

One thing stood out: four pages describe the microschool four ways, from Wednesdays 9:30 to 11:30 for 2026–27 to "Wednesday & Thursday" for 2025–26 and 9:30 to 1:00 in the FAQ.

I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Beth,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Ignite version: an interest form landing in your admin inbox, the waiver signed online, and the six tuition payments on a family's billing page.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Ignite is, with no pitch",
      where: "Facebook or Instagram (search for Ignite Learning Center Greenville first)",
      body: "Hi Beth, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. The motorized boats from your summer camps look like a great week.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Beth,

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
      body: `Hi Beth,

I'll leave it here so I'm not cluttering your inbox. The Ignite version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the spring semester.

Julius`,
    },
  ],
};
