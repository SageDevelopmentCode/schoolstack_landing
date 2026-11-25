import type { OutreachPlan } from "./types";

export const morganPrepAcademyOutreach: OutreachPlan = {
  slug: "morgan-prep-academy",
  schoolName: "Morgan Preparatory Academy for Boys",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Consuelo",
    role: "Founder & Head of School (Dr. Consuelo Boykins)",
    source: "Morgan Prep About and Meet the Founder pages (\"Dr. Consuelo Boykins, Founder & Head of School\")",
  },
  angle:
    "Why now: Murphy Preparatory Academy for Girls, Morgan's sister school, opens pre-enrollment in December 2026, and its Begin Enrollment button goes to the same KaiPod Jotform as Morgan's, tagged \"Morgan Preparatory Academy for Boys\". How will they tell girls' families from Morgan families once sign-ups start?",
  facts: [
    {
      fact: "Murphy Preparatory Academy for Girls \"has not opened yet\", will welcome families for 2027–2028, and \"Pre-enrollment begins December 2026\"; its Begin Enrollment and Contact links go to kaipodlearning.jotform.com/250545028762962 with microschool=Morgan+Preparatory+Academy+for+Boys",
      source: "Murphy Preparatory Academy for Girls home page",
      url: "https://murphyprepacademy.org",
      readOn: "2026-11-23",
    },
    {
      fact: "Morgan Prep's header Inquire and Admissions Enroll Now buttons go to the same KaiPod Jotform, while the Contact page has its own inquiry form",
      source: "Morgan Prep home, Admissions and Contact pages",
      url: "https://morganprepacademy.org/contact",
      readOn: "2026-11-23",
    },
    {
      fact: "2026–27 tuition is $15,500 including a $500 non-refundable reservation deposit, plus a $150 application fee; a 10-month payment plan is \"available to eligible enrolled families\"; TEFA families select Morgan Prep in the Odyssey Portal and work with the school to verify funding",
      source: "Morgan Prep, Admissions & Tuition",
      url: "https://morganprepacademy.org/admissions",
      readOn: "2026-11-23",
    },
    {
      fact: "TEA set the 2026–27 TEFA amount at $10,474 per child at an approved private school",
      source: "Texas Education Freedom Accounts, For Schools",
      url: "https://educationfreedom.texas.gov/schools/",
      readOn: "2026-11-23",
    },
    {
      fact: "Admissions: initial inquiry, family consultation, student observation or visit \"when appropriate\", then an official enrollment offer; school runs Monday–Thursday 8:15–3:30 with a monthly Brilliant Chaos Enrichment Day",
      source: "Morgan Prep, Admissions and School Day",
      url: "https://morganprepacademy.org/admissions",
      readOn: "2026-11-23",
    },
    {
      fact: "The \"View the 2026–27 school calendar\" link opens a PNG image",
      source: "Morgan Prep, School Day",
      url: "https://morganprepacademy.org/school-day",
      readOn: "2026-11-23",
    },
    {
      fact: "Anderson Academy, a coed Pre-K feeding Morgan Prep and Murphy Prep, is \"launching soon\"",
      source: "Morgan Prep, Anderson Academy for Pre-K",
      url: "https://morganprepacademy.org/anderson-academy",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Uses KaiPod's Jotform: decide whether to pitch replacing it (Morgan and Murphy both send enrollment to kaipodlearning.jotform.com, so they're likely in KaiPod's network).",
    "We'd build: Several locations in one account",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "TEFA payments go through Odyssey. MudKitchen works alongside it; don't pitch replacing it.",
    "The site (built on theo.site) is fast and recent, with a mobile PageSpeed of 99. Don't pitch a website rebuild; lead with enrollment across the three schools and billing.",
    "The Murphy form tag may be deliberate if KaiPod routes all three schools through one form; ask rather than assume it's a mistake.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "Qa_PYZA2nS-56w8BZnRsPw",
    preparedOn: "2026-11-23",
    summary:
      "We read all 11 pages of morganprepacademy.org on Nov 23, 2026, plus the Murphy Prep site, the inquiry forms and the school calendar.",
    pageSpeed: { mobileScore: 99, url: "https://morganprepacademy.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Jotform",
        usedFor: "Inquiry and enrollment for Morgan and Murphy Prep",
        url: "https://morganprepacademy.org/admissions",
        network: "KaiPod",
      },
      {
        name: "Website contact form",
        usedFor: "A second inquiry form on the Contact page",
        url: "https://morganprepacademy.org/contact",
      },
      {
        name: "Calendar image",
        usedFor: "2026–27 school calendar",
        url: "https://morganprepacademy.org/school-day",
      },
    ],
    observations: [
      {
        area: "apply",
        gap: "Murphy Prep's enrollment goes to Morgan's form",
        saw: "Murphy Prep says \"Pre-enrollment begins December 2026.\" Its Begin Enrollment and Contact buttons open the same KaiPod Jotform as Morgan Prep, with the link tagged microschool=Morgan+Preparatory+Academy+for+Boys.",
        impact: "When girls' families start pre-enrolling next month, their forms arrive labelled as Morgan Prep for Boys, mixed in with boys' inquiries.",
        source: "Murphy Preparatory Academy for Girls home page",
        url: "https://murphyprepacademy.org",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["multi-location", "admissions-pipeline", "online-application"],
          text: "We'd set up Morgan, Murphy and Anderson as separate schools under one account, each with its own application, so every family lands in the right school's inbox.",
        },
      },
      {
        area: "apply",
        gap: "There are two different inquiry forms",
        saw: "The header's Inquire button and Admissions' Enroll Now open a KaiPod Jotform. The Contact page has its own form (name, email, phone, entering grade, a note about your son), which says \"An inquiry is the best place to begin.\"",
        impact: "Inquiries arrive in two places, and a family may fill in both.",
        source: "Morgan Prep, home, Admissions and Contact pages",
        url: "https://morganprepacademy.org/contact",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "One inquiry and application on every page, all landing in one admin inbox with each family's stage.",
        },
      },
      {
        area: "tour",
        gap: "Consultations and observation days are set up by hand",
        saw: "After the inquiry comes a family consultation, then \"when appropriate\" an observation day or short visit. Neither can be booked on the site.",
        impact: "Each family has two meetings to arrange before an offer can go out.",
        source: "Morgan Prep, Admissions",
        url: "https://morganprepacademy.org/admissions",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "observation-booking"],
          text: "Families pick a consultation time after their inquiry, and you send an observation-day link when it's the right next step.",
        },
      },
      {
        area: "enroll",
        gap: "What follows the enrollment offer isn't described",
        saw: "Families who are a fit \"receive an official enrollment offer.\" The site lists a $500 reservation deposit and a $150 application fee, but not what families sign or how they pay.",
        impact: "A family with an offer doesn't know what's needed to hold the spot until they hear back.",
        source: "Morgan Prep, Admissions & Tuition",
        url: "https://morganprepacademy.org/admissions",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: sign the enrollment agreement and pay the $500 deposit online, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "TEFA families pay from two places",
        saw: "Tuition is $15,500. TEFA families select Morgan Prep in Odyssey and \"work with the school to verify funding.\" At $10,474 from TEFA, a family still owes about $5,026. The 10-month plan is \"available to eligible enrolled families\" without saying who's eligible.",
        impact: "Families can't see their own share or whether they qualify for monthly payments until they ask.",
        source: "Morgan Prep, Admissions & Tuition; Texas Education Freedom Accounts",
        url: "https://morganprepacademy.org/admissions",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "tuition-rate-plans", "parent-billing", "autopay"],
          text: "We'd set up each family's billing page to show the TEFA share and their own, with the 10-month plan and autopay for their part.",
        },
      },
      {
        area: "updates",
        gap: "The school calendar is a picture",
        saw: "\"View the 2026–27 school calendar\" opens a PNG image.",
        impact: "Families can't add dates to their phone calendar, search it, or see changes without a new image.",
        source: "Morgan Prep, School Day",
        url: "https://morganprepacademy.org/school-day",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal", "mobile-app"],
          text: "School dates and Enrichment Days live on one calendar in each family's login, on the web and the iPhone app.",
        },
      },
      {
        area: "website",
        gap: "Some pages describe the school in the third person",
        saw: "The Admissions page says \"Morgan Prep says it will accept TEFA funds for the 2026–27 school year,\" and the About page says \"Morgan Prep states that it is accredited through the Middle States Association.\"",
        impact: "A parent reading about funding and accreditation may wonder why the school sounds unsure of its own facts.",
        source: "Morgan Prep, Admissions and About",
        url: "https://morganprepacademy.org/about",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We write and look after the site's copy for you, in the school's own voice.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Morgan Prep",
    founder: {
      fullName: "Dr. Consuelo Boykins",
      firstName: "Consuelo",
      role: "Founder & Head of School",
      source: "Morgan Prep, Meet the Founder",
      url: "https://morganprepacademy.org/founder",
    },
    mailTo: {
      lines: ["Dr. Consuelo Boykins", "Morgan Preparatory Academy for Boys", "5509 Pleasant Valley Dr, Suite 100", "Plano, TX 75023"],
      source: "Morgan Prep footer and Contact page (\"5509 Pleasant Valley Dr, Suite 100, Plano, TX 75023\")",
      url: "https://morganprepacademy.org/contact",
    },
    founderFacts: [
      {
        fact: "Dr. Boykins' founder page says her belief is simple: behavior is a skill that can be taught without sacrificing academic growth.",
        source: "Morgan Prep, Meet the Founder",
        url: "https://morganprepacademy.org/founder",
        readOn: "2026-11-23",
      },
      {
        fact: "Morgan Prep's sister school, Murphy Preparatory Academy for Girls, opens pre-enrollment in December 2026 for 2027–28, and Anderson Academy for Pre-K is launching soon.",
        source: "Murphy Preparatory Academy for Girls; Morgan Prep, Anderson Academy",
        url: "https://murphyprepacademy.org",
        readOn: "2026-11-23",
      },
    ],
    hook: "Dr. Boykins' founder page says her belief is simple: behavior is a skill that can be taught without sacrificing academic growth.",
    body: `Hi Consuelo,

I loved your page on the Morgan Prep site, that behavior is a skill that can be taught without sacrificing academic growth. You built a whole school day around it, and now Murphy Prep and Anderson Academy are on the way.

Running a small school ourselves, I know how much that takes. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Morgan Prep.

I'd love to hear how you're planning for three schools.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Consuelo, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "morganprep-k2w8",
    checkBeforeMailing: [
      "Dr. Boykins signs as \"Dr. Consuelo Boykins\" everywhere on the site; consider \"Hi Dr. Boykins,\" if first names feel too familiar.",
      "The address is the published suite in Plano from the footer and Contact page.",
      "No podcast, interview or press about Dr. Boykins turned up, so the letter opens on her founder page.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then the Murphy Prep pre-enrollment form as a why-now question, then who's asking and one proof number",
      subject: "Murphy Prep pre-enrollment",
      body: `Hi Consuelo,

I mailed you a handwritten note last week with a card for Morgan Prep.

I noticed Murphy Prep's pre-enrollment opens in December. Its Begin Enrollment button goes to the same KaiPod form as Morgan Prep's, tagged "Morgan Preparatory Academy for Boys."

When girls' families start signing up next month, how will you tell them apart from Morgan families?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so Consuelo can see it without clicking around",
      body: `Hi Consuelo,

In case it's easier to see than describe, I set up a version of MudKitchen for Morgan Prep and recorded a 60-second walkthrough: an inquiry landing in your admin inbox, the enrollment offer and deposit in one checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Morgan Prep is, with no pitch",
      where: "Facebook, Instagram or LinkedIn (none are linked from the site; search for Morgan Prep or Dr. Boykins first)",
      body: "Hi Consuelo, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. I like that movement breaks are part of Morgan Prep's plan, not time away from it.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Consuelo,

I also put together a one-page snapshot of what a family sees on your site today, from the first inquiry to paying tuition. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Consuelo,

I'll leave it here so I'm not cluttering your inbox. The Morgan Prep version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with Murphy Prep's first families.

Julius`,
    },
  ],
};
