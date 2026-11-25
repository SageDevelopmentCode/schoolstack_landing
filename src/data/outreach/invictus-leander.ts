import type { OutreachPlan } from "./types";

export const invictusLeanderOutreach: OutreachPlan = {
  slug: "invictus-leander",
  schoolName: "Invictus: An Acton Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Sarah",
    role: "Founder and Community Champion (Sarah Max)",
    source: "Invictus About page, Our Team (\"Sarah Max, Founder and Community Champion\")",
  },
  angle:
    "Why now: Invictus now accepts TEFA and its tuition page says families get \"up to $10,000\"; TEA set $10,474 for private schools in 2026–27. On $14,685 tuition paid $1,335 a month, a TEFA family still owes about $4,211. How are the monthly payments split when part of the year comes through Odyssey?",
  facts: [
    {
      fact: "2026–2027 tuition is $14,685, paid as $1,335 a month September–July, with a $1,335 non-refundable enrollment fee for new learners and a $725 materials fee (August, returning families); sibling discounts on request",
      source: "Invictus, Tuition and Apply pages",
      url: "https://www.invictusleander.org/tuition",
      readOn: "2026-11-23",
    },
    {
      fact: "The tuition page says eligible families \"may receive up to $10,000 per child, per year\", that Odyssey manages TEFA applications and payments, and lists \"Applications Open: February 2026\" with eligibility \"expected\" as \"final program guidelines are released\"",
      source: "Invictus, Tuition and TEFA",
      url: "https://www.invictusleander.org/tuition",
      readOn: "2026-11-23",
    },
    {
      fact: "TEA set the 2026–27 TEFA amount at $10,474 per child at an approved private school",
      source: "Texas Education Freedom Accounts, For Schools",
      url: "https://educationfreedom.texas.gov/schools/",
      readOn: "2026-11-23",
    },
    {
      fact: "Applying: a 44-field audition form (family questionnaire and essay questions), then a Family Meet-Up, then an invitation to enroll or a place in the \"waiting pool\"; tours and calls are booked on Calendly",
      source: "Invictus, Apply and Audition Form",
      url: "https://www.invictusleander.org/apply",
      readOn: "2026-11-23",
    },
    {
      fact: "The Parent Portal links to a public Google Site whose home page lists August and September 2026 events; volunteer weekend sign-ups use a shared Google Sheet",
      source: "Invictus Parent Portal (Google Sites)",
      url: "https://www.invictusleander.org/parent-portal",
      readOn: "2026-11-23",
    },
    {
      fact: "Sarah Max spent over ten years in Texas elementary schools and was Director of Education at a Huntington Learning Center; after watching her nephew flourish at an Acton Academy she knew she wanted that for her children and her community",
      source: "Invictus, About",
      url: "https://www.invictusleander.org/about",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "TEFA payments go through Odyssey. MudKitchen works alongside it; don't pitch replacing it.",
    "Invictus is an Acton Academy. Many Actons use Acton-network tools (e.g. Journey Tracker) for learner progress; we only pitch enrollment, billing and family communication.",
    "The TEFA math assumes a TEFA family pays the full $14,685; confirm Invictus doesn't adjust tuition for TEFA families.",
    "Instagram (@invictusleander) and Facebook are linked from the site but weren't opened; check one is active before the social step.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "p8ipTwHyZFZ61ZaYGZHSvA",
    preparedOn: "2026-11-23",
    summary:
      "We read 46 pages of invictusleander.org on Nov 23, 2026, plus the audition form and the Google Sites parent portal.",
    pageSpeed: { mobileScore: 65, url: "https://www.invictusleander.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Calendly",
        usedFor: "Booking tours and calls",
        url: "https://www.invictusleander.org/apply",
      },
      {
        name: "Google Sites",
        usedFor: "Parent portal and event dates",
        url: "https://www.invictusleander.org/parent-portal",
      },
      {
        name: "Google Sheets",
        usedFor: "Volunteer weekend sign-ups",
        url: "https://www.invictusleander.org/parent-portal",
      },
    ],
    observations: [
      {
        area: "find",
        gap: "The TEFA page was written before the program launched",
        saw: "The tuition page says families \"may receive up to $10,000 per child\", lists \"Applications Open: February 2026\", and says eligibility is \"expected\" as \"final program guidelines are released.\" TEA has since set the 2026–27 amount at $10,474 for private schools.",
        impact: "A TEFA family works out their share from the wrong number, and can't tell whether it's too late to apply.",
        source: "Invictus, Tuition and TEFA; Texas Education Freedom Accounts",
        url: "https://www.invictusleander.org/tuition",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We keep the tuition and TEFA page current for you, with this year's amount and what a family's own share would be.",
        },
      },
      {
        area: "apply",
        gap: "The audition form is one long page",
        saw: "The audition form has 44 fields on one page: parent and child details, multiple-choice questions about Acton, and several open questions such as \"What are the top three reasons you believe Invictus is right for your family?\"",
        impact: "A parent has to finish all 44 fields in one sitting, often on a phone.",
        source: "Invictus, Audition Form",
        url: "https://www.invictusleander.org/audition",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families fill in the audition in steps and can save and come back, and each one lands in one admin inbox with its stage, from Meet-Up to invitation or waiting pool.",
        },
      },
      {
        area: "enroll",
        gap: "The steps after an invitation aren't described",
        saw: "Apply ends at \"Invitation to enroll or Waiting Pool\". The $1,335 enrollment fee \"secures your child's place once accepted\", but the site doesn't say what families sign or how they pay it.",
        impact: "An invited family doesn't know what's needed to hold the spot until they hear back.",
        source: "Invictus, Apply and Tuition",
        url: "https://www.invictusleander.org/apply",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Invited families get one checklist: sign the enrollment contract and pay the $1,335 fee online, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "TEFA and the monthly plan don't line up",
        saw: "Tuition is $14,685 paid as $1,335 a month from September to July, and the school accepts TEFA through Odyssey. At $10,474 from TEFA, a family still owes about $4,211. Sibling discounts are \"reach out to us.\"",
        impact: "For a TEFA family the monthly amount isn't $1,335 any more, and each family's split and discount has to be worked out on its own.",
        source: "Invictus, Tuition and Apply; Texas Education Freedom Accounts",
        url: "https://www.invictusleander.org/tuition",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "tuition-rate-plans", "discounts", "parent-billing", "autopay"],
          text: "We'd set up each family's billing page to show what TEFA covers and their own monthly share, with the sibling discount applied and autopay for their part.",
        },
      },
      {
        area: "updates",
        gap: "The parent portal is a public Google Site",
        saw: "Parent Portal opens a Google Site anyone can view. Its home page still lists August and September events (Volunteer Weekend, Parents Bootcamp, the first day of school), and volunteer sign-ups go to a shared Google Sheet.",
        impact: "Families check a page that may be months old, anyone with the link can see school dates, and sign-ups live in a spreadsheet.",
        source: "Invictus Parent Portal (Google Sites)",
        url: "https://www.invictusleander.org/parent-portal",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["parent-portal", "calendar", "committees", "mobile-app"],
          text: "Each family gets their own login on the web and the iPhone app, with the school calendar and volunteer sign-ups in one place.",
        },
      },
      {
        area: "website",
        gap: "The home page is heavy on a phone",
        saw: "Google PageSpeed gave the home page a mobile score of 65. The main content took about 6.7 seconds to appear, and the page loads about 5.8 MB.",
        impact: "A parent opening the site from a phone waits before seeing anything about Invictus.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.invictusleander.org%2F",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with images and video sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Invictus",
    founder: {
      fullName: "Sarah Max",
      firstName: "Sarah",
      role: "Founder and Community Champion",
      source: "Invictus, About (Our Team)",
      url: "https://www.invictusleander.org/about",
    },
    mailTo: {
      lines: ["Sarah Max", "Invictus: An Acton Academy", "10000 West State Hwy 29", "Georgetown, TX"],
      source: "Invictus FAQ and About (\"10000 West State Hwy 29, Georgetown\")",
      url: "https://www.invictusleander.org/faq",
    },
    founderFacts: [
      {
        fact: "On the About page, Sarah writes that while searching for school options for her nephew she found an Acton Academy, and watching him flourish there told her she wanted that for her children and other children in her community.",
        source: "Invictus, About",
        url: "https://www.invictusleander.org/about",
        readOn: "2026-11-23",
      },
      {
        fact: "Sarah spent over ten years in elementary schools across Texas after graduating from Texas A&M in 2001, and served as Director of Education for a Huntington Learning Center.",
        source: "Invictus, About (Our Team)",
        url: "https://www.invictusleander.org/about",
        readOn: "2026-11-23",
      },
    ],
    hook: "On the About page, Sarah writes that while searching for school options for her nephew she found an Acton Academy, and watching him flourish there told her she wanted that for her children and other children in her community.",
    body: `Hi Sarah,

I loved reading your story on the Invictus site. After years in Texas classrooms, you watched your nephew flourish at an Acton and decided to bring that to families around Leander. Now Invictus has its own place on Highway 29.

Congratulations on the new home. My fiancée and I run Sage Field, an outdoor microschool up the road in Round Rock. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Invictus.

If you're ever up for coffee, I'd love to hear how the move has gone.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Sarah, a note from a microschool up the road in Round Rock. J",
    shortCode: "invictus-m3x7",
    checkBeforeMailing: [
      "The site gives the street address without a ZIP code (\"10000 West State Hwy 29, Georgetown\"). Look up the ZIP before mailing.",
      "The FAQ calls Highway 29 \"our new location\" without a date; confirm they've moved in before the letter mentions it.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then the TEFA math as a why-now question, then who's asking and one proof number",
      subject: "TEFA at Invictus",
      body: `Hi Sarah,

I mailed you a handwritten note last week with a card for Invictus.

Your tuition page says TEFA families can put up to $10,000 toward tuition. TEA set it at $10,474 for private schools this year, so on $14,685 a TEFA family still owes about $4,211, next to your $1,335 monthly plan.

How do you split the monthly payments when part of the year comes through Odyssey?

I ask because I run Sage Field, a small outdoor microschool up the road in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so Sarah can see it without clicking around",
      body: `Hi Sarah,

In case it's easier to see than describe, I set up a version of MudKitchen for Invictus and recorded a 60-second walkthrough: an audition landing in your admin inbox, the enrollment fee in one checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Invictus is, with no pitch",
      where: "Instagram (@invictusleander, linked from the site) or Facebook",
      body: "Hi Sarah, I'm Julius. I run Sage Field, a small outdoor microschool up the road in Round Rock. I like the Spark Studio session recaps on your blog.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Sarah,

I also put together a one-page snapshot of what a family sees on your site today, from the audition form to paying each month. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Sarah,

I'll leave it here so I'm not cluttering your inbox. The Invictus version of MudKitchen and the snapshot stay up if you ever want them, and the coffee offer stands.

Enjoy the break between sessions.

Julius`,
    },
  ],
};
