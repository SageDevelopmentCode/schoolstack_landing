import type { OutreachPlan } from "./types";

export const innovationAcademyLasVegasOutreach: OutreachPlan = {
  slug: "innovation-academy-las-vegas",
  schoolName: "Innovation Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Mary",
    role: "Headmaster (Headmaster Bray; a nonprofit filing lists Mary M. Bray as the organization's contact)",
    source: "Innovation Academy About page (\"HEADMASTER BRAY\") and the nonprofit's IRS filing record (\"In Care Of: Mary M Bray\")",
  },
  priorContact: {
    when: "May",
    what: "A hand-sent first email with a link to the Innovation Academy MudKitchen demo",
  },
  angle:
    "Re-contact with the Family experience snapshot: the Tuition page has no prices, its CALL TODAY button opens a page-not-found error, and registration is a PDF packet to download.",
  facts: [
    {
      fact: "Innovation Academy is a non-profit, Montessori-based K–8 school in Las Vegas with a STEAM curriculum, a peanut and tree-nut free campus, and a Purple Star School designation",
      source: "Innovation Academy home page and Pricing",
      url: "https://innovationacademylv.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "The home page's \"Questions about Tuition costs? Go HERE!\" leads to the Pricing page, which lists no prices; its \"including the following:\" list and heading are white text on a white background, and its CALL TODAY button links to a page that returns not found",
      source: "Innovation Academy, Pricing",
      url: "https://innovationacademylv.com/pages/pricing/",
      readOn: "2026-11-23",
    },
    {
      fact: "Registration is a downloadable PDF packet (\"Ready to Register? Download our packet here\"), and tours are booked by phone (\"CALL US today to learn more and to schedule your visit!\")",
      source: "Innovation Academy, home page and Contact",
      url: "https://innovationacademylv.com/contact/",
      readOn: "2026-11-23",
    },
    {
      fact: "The About page explains the nut-free campus: most schools' idea of accommodating a severe food allergy is isolation, so Innovation Academy is a peanut and tree-nut free campus",
      source: "Innovation Academy, About Us",
      url: "https://innovationacademylv.com/about/",
      readOn: "2026-11-23",
    },
    {
      fact: "The school says it works closely with Nevada on scholarships and grants to subsidize tuition, without naming the programs",
      source: "Innovation Academy home page and Pricing",
      url: "https://innovationacademylv.com/pages/pricing/",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in May (the first email says so).",
    "Find a name before sending: the site only says \"Headmaster Bray\". A nonprofit filing lists Mary M. Bray as the organization's contact, but nothing confirms she's the headmaster. If you can't confirm it, greet \"Hi Innovation Academy team,\" in every step.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). Here it's whichever Nevada scholarships they use, which we'd work alongside.",
    "The site blocks automated downloads, so the registration packet PDF wasn't read; the snapshot only says it's a download.",
    "No Instagram or Facebook is linked from the site; find their page before the social step, or skip it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "065q8aJiLi5nAzUU0lhQDw",
    preparedOn: "2026-11-23",
    summary:
      "We read all 5 pages of innovationacademylv.com on Nov 23, 2026, including the Pricing and Contact pages and every link on them.",
    pageSpeed: { mobileScore: 94, url: "https://innovationacademylv.com/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "find",
        gap: "The Pricing page has no prices",
        saw: "\"Questions about Tuition costs? Go HERE!\" leads to the Pricing page, which talks about value and scholarships but lists no tuition. Its \"including the following:\" list and heading are white text on a white background.",
        impact: "A family comparing schools can't see what Innovation Academy costs, or what tuition includes, without calling.",
        source: "Innovation Academy, Pricing",
        url: "https://innovationacademylv.com/pages/pricing/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "tuition-rate-plans"],
          text: "We'd build the tuition page with your rates and what's included as readable text, from the same plans families are billed on.",
        },
      },
      {
        area: "website",
        gap: "The Pricing page's call button goes nowhere",
        saw: "The CALL TODAY button on the Pricing page links to a web page instead of the phone, and that page returns \"not found.\"",
        impact: "A family ready to ask about tuition taps the button and lands on an error page.",
        source: "Innovation Academy, Pricing",
        url: "https://innovationacademylv.com/pages/pricing/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with every button checked on a phone.",
        },
      },
      {
        area: "tour",
        gap: "Tours are booked by phone",
        saw: "The home page says the best way to see the school is a tour, and to \"CALL US today to learn more and to schedule your visit!\"",
        impact: "A parent browsing in the evening can't book a visit until the office is open to answer.",
        source: "Innovation Academy home page",
        url: "https://innovationacademylv.com/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick a tour time online, any time of day, and each request lands in one admin inbox.",
        },
      },
      {
        area: "enroll",
        gap: "Registration is a PDF packet",
        saw: "\"Ready to Register?\" downloads a PDF registration packet. The site doesn't say how to return it.",
        impact: "Families download, fill in and send back a file, and can't see whether it arrived.",
        source: "Innovation Academy, Contact and home page",
        url: "https://innovationacademylv.com/contact/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["forms-documents", "enrollment-checklist", "enrollment-agreements"],
          text: "Registration as an online checklist families fill in and sign, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "Which scholarships apply isn't named",
        saw: "The school says it works closely with Nevada on scholarships and grants to subsidize tuition, but doesn't name the programs or how they're applied to a bill.",
        impact: "A family can't tell whether they qualify, or what they'd pay themselves after a scholarship.",
        source: "Innovation Academy home page and Pricing",
        url: "https://innovationacademylv.com/pages/pricing/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up each family's billing page to show the scholarship's share and their own.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Innovation Academy",
    founder: {
      fullName: "Mary M. Bray",
      firstName: "Mary",
      role: "Headmaster",
      source: "Innovation Academy, About Us (\"HEADMASTER BRAY\")",
      url: "https://innovationacademylv.com/about/",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Innovation Academy's About page says most schools' idea of accommodating a severe food allergy is isolation, so the school made its whole campus peanut and tree-nut free.",
        source: "Innovation Academy, About Us",
        url: "https://innovationacademylv.com/about/",
        readOn: "2026-11-23",
      },
      {
        fact: "Innovation Academy was awarded a Purple Star School designation by the Military Child Education Coalition.",
        source: "Innovation Academy home page",
        url: "https://innovationacademylv.com/",
        readOn: "2026-11-23",
      },
    ],
    hook: "Innovation Academy's About page says most schools' idea of accommodating a severe food allergy is isolation, so the school made its whole campus peanut and tree-nut free.",
    body: `Hi Mary,

I read your page on why Innovation Academy is a peanut and tree-nut free campus. Most schools handle a severe allergy by seating a child apart, so you made the whole campus safe and every student eats together. I loved that.

That kind of care is why I wanted to write. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Innovation Academy.

I'd love to hear how families with allergies usually find you.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "A note from a small microschool in Round Rock, Texas. J",
    shortCode: "innovationlv-k8d2",
    checkBeforeMailing: [
      "Find a mailing address: the site prints no street address, only a Google Maps link to \"Innovation Academy Private School\". The CRM and school directories list a commercial address on N Rainbow Blvd in Las Vegas; confirm it on the map before using it.",
      "Confirm the headmaster is Mary M. Bray (see Before sending); if not, greet the team and drop the name from the envelope.",
      "No podcast or press about the headmaster turned up, so the letter opens on the school's About page.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the May email, the Pricing page detail from the snapshot, one proof number, offer the snapshot",
      subject: "Innovation Academy's pricing page",
      body: `Hi Mary,

I mailed you a handwritten note last week with a card for Innovation Academy. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in May) and a one-page snapshot of what a family sees on your site today.

One thing stood out: the Pricing page lists no prices, and its CALL TODAY button opens a page-not-found error.

I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Mary,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Innovation Academy version: a tour request landing in your admin inbox, registration as an online checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Innovation Academy is, with no pitch",
      where: "Facebook (search for Innovation Academy Las Vegas first)",
      body: "Hi, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. A fully nut-free campus so every child can eat together is a thoughtful choice.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Mary,

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
      body: `Hi Mary,

I'll leave it here so I'm not cluttering your inbox. The Innovation Academy version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the year.

Julius`,
    },
  ],
};
