import type { OutreachPlan } from "./types";

export const zoeLearningHouseOutreach: OutreachPlan = {
  slug: "zoe-learning-house",
  schoolName: "Zoe Learning House",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Emily",
    role: "Founder, director and lead teacher",
    source: "Zoe about page (Emily Barnitz)",
  },
  angle: "Re-contact with a snapshot: their admissions steps and hybrid families' home days",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the Zoe MudKitchen demo",
  },
  facts: [
    {
      fact: "Launched fall 2024 as a K–5 hybrid Christian academy in New Orleans",
      source: "Zoe about page",
      url: "https://zoelearninghouse.com/about-us",
      readOn: "2026-11-19",
    },
    {
      fact: "Three steps to join: interest form, a visit with a literacy and math evaluation, then registration with a 2.5-hour Child Visit Day",
      source: "Zoe intro packet page",
      url: "https://zoelearninghouse.com/intro-packet",
      readOn: "2026-11-19",
    },
    {
      fact: "Program options from 1 to 5 days a week (1-Day Spark, 2-Day Hybrid Academy, 3-Day, 4-Day Living Academy, 5-Day)",
      source: "Zoe intro packet page",
      url: "https://zoelearninghouse.com/intro-packet",
      readOn: "2026-11-19",
    },
    {
      fact: "Camps cost $190 a week or $300 for two, with deposits and a $20 late fee, paid through Omella",
      source: "Zoe Camps",
      url: "https://zoelearninghouse.com/camps",
      readOn: "2026-11-22",
    },
    {
      fact: "Hybrid families use Weekly Learning Plans in literacy and math for home days",
      source: "Zoe about page",
      url: "https://zoelearninghouse.com/about-us",
      readOn: "2026-11-19",
    },
    {
      fact: "Daily outdoor learning, nature study and gardening",
      source: "Zoe nature page",
      url: "https://zoelearninghouse.com/nature",
      readOn: "2026-11-19",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June (the first email says so).",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Monthly billing for clubs, after-care or add-on classes",
    "We'd build: Weekly learning plans for home days",
    "The Zoe demo has their interest form and 1–5 day options, not the visit or Child Visit Day steps. Don't claim it does.",
  ],
  snapshot: {
    token: "DfesH8NjzQOQQW3tNPowOQ",
    preparedOn: "2026-12-01",
    summary: "We read 45 pages of zoelearninghouse.com on Dec 1, 2026, including every program page, Admissions, Camps and the intro packet.",
    toolStack: [
      { name: "Text messages", usedFor: "Setting up the call and Family Tour", url: "https://zoelearninghouse.com/interest-form" },
      { name: "Google Drive", usedFor: "Intro packet with program costs", url: "https://zoelearninghouse.com/intro-packet" },
      { name: "Omella", usedFor: "Camp registration and payments", url: "https://zoelearninghouse.com/camps" },
      { name: "Google Forms", usedFor: "Homeschool Expo and meet-up sign-ups", url: "https://zoelearninghouse.com/expo" },
    ],
    observations: [
      {
        area: "find",
        gap: "Tuition is only inside a flipbook",
        saw: "No program page shows a price. Tuition and sibling rates are in the 2026–2027 Program Overview flipbook, and the Intro Packet page still links a 2025–2026 packet.",
        impact: "A parent comparing schools on a phone has to open a flipbook to learn the cost, and may find last year's numbers first.",
        source: "Zoe 1-Day Spark Enrichment",
        url: "https://zoelearninghouse.com/spark",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "On the site we build for you, each program page shows its days, hours and price as text, with sibling rates beside them.",
        },
      },
      {
        area: "tour",
        gap: "Tours are arranged by text after the form",
        saw: "After the interest form, families wait for a text within 1–2 business days to set up a call, then the Family Tour and a 2.5-hour Child Visit Day.",
        impact: "Each new family takes a few back-and-forth texts before they can visit, and some cool off while they wait.",
        source: "Zoe interest form",
        url: "https://zoelearninghouse.com/interest-form",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "observation-booking"],
          text: "Families book the Family Tour from times you open, and you invite them to a Child Visit Day slot the same way.",
        },
      },
      {
        area: "enroll",
        gap: "\"Complete Registration\" has no steps behind it",
        saw: "Step 3 on every program page is \"Complete Registration (upon acceptance)\". The site doesn't say how registration happens, what it costs, or what families sign.",
        impact: "Accepted families wait to hear what's next, and you send forms, fees and the Welcome Packet one family at a time.",
        source: "Zoe Admissions",
        url: "https://zoelearninghouse.com/admissions",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist with the registration form, the agreement signed online and the fee, plus reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say how tuition is paid",
        saw: "No page mentions a payment method, payment plan or deposit for the school year. It notes Zoe is an approved LA GATOR provider and offers some needs-based help by email.",
        impact: "Families ask before they commit, and GATOR families can't see what they'll owe on their own.",
        source: "Zoe Admissions",
        url: "https://zoelearninghouse.com/admissions",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "parent-plan-choice", "autopay", "card-and-ach"],
          text: "Families see their balance, choose a plan and turn on autopay by card or bank in the parent portal.",
        },
      },
      {
        area: "pay",
        gap: "Camps are paid in a separate system",
        saw: "Camps are $190 a week or $300 for two, each with a deposit, a balance due 3 weeks before, and a $20 late fee, all paid through Omella links.",
        impact: "School families keep two logins and two sets of receipts, and you track camp balances apart from tuition.",
        source: "Zoe Camps",
        url: "https://zoelearninghouse.com/camps",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "late-fees-reminders"],
          text: "We'd set up camp sign-up and billing next to tuition, with the deposit, the balance reminder and the late fee handled for you.",
        },
      },
      {
        area: "updates",
        gap: "Plans and photos come through different places",
        saw: "Hybrid families get Weekly Learning Plans, photos are shared \"through a private platform\", and the Events page has no events listed.",
        impact: "Parents check several places for the week's plan, photos and dates, and the public Events page looks empty.",
        source: "Zoe Admissions",
        url: "https://zoelearninghouse.com/admissions",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["photos", "calendar", "learning-plans"],
          text: "Photos and the calendar sit in the parent portal and app today, and we'd add each week's learning plan next to them.",
        },
      },
      {
        area: "website",
        gap: "Test pages and template products are public",
        saw: "Pages like /test (Summer 2024 camps for ages 5–9, 9:00–2:00) and /old-form (\"Fall 2025\") are live, and a template shop item, \"Face Serum, $51\", is still online.",
        impact: "A parent who lands on one from a search sees old dates or a product that isn't Zoe's, which can make them unsure what's current.",
        source: "Zoe test page",
        url: "https://zoelearninghouse.com/test",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["website-service"],
          text: "We build and look after the site, so drafts and template pages never go live.",
        },
      },
      {
        area: "website",
        gap: "Registration dates that have passed",
        saw: "The homepage and program pages still say 2026–2027 registration \"opens January 30, 2026\".",
        impact: "A family reading it now can't tell if there's still room for this year.",
        source: "Zoe homepage",
        url: "https://zoelearninghouse.com/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "Each program shows Open, Waitlist or Full from your admin, so the site always says where things stand.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Zoe",
    founder: {
      fullName: "Emily Barnitz",
      firstName: "Emily",
      role: "Founder, director and lead teacher",
      source: "Zoe Learning House, About Us",
      url: "https://zoelearninghouse.com/about-us",
    },
    mailTo: {
      lines: ["5824 Berkley Drive", "New Orleans, LA 70131"],
      source: "Zoe Learning House, Contact (Our Location, and the footer address of Zoe Learning House LLC)",
      url: "https://zoelearninghouse.com/contact",
    },
    founderFacts: [
      {
        fact: "Zoe's About page says Emily Barnitz grew up K-12 as a homeschooler and spent 15 years as an educator in public, international and museum settings, so she understands both the non-traditional and traditional sides of education.",
        source: "Zoe Learning House, About Us",
        url: "https://zoelearninghouse.com/about-us",
        readOn: "2026-11-22",
      },
      {
        fact: "Zoe launched in fall 2024 as a K-5 hybrid academy; each family registers as a homeschool family in Louisiana, and Zoe lists HSLDA, VELA, CLAS (Child Light Schools), the Balance Project and the National Microschooling Center as networks it belongs to.",
        source: "Zoe Learning House, About Us",
        url: "https://zoelearninghouse.com/about-us",
        readOn: "2026-11-22",
      },
      {
        fact: "Zoe describes itself as the balance between the freedom of homeschool and the community and support of a private elementary school, and shares facility space at Woodland Presbyterian Church in Algiers, New Orleans.",
        source: "Zoe Learning House home page",
        url: "https://zoelearninghouse.com/",
        readOn: "2026-11-22",
      },
      {
        fact: "Emily has trained teachers and parents on child development, the power of play and building a learning community, and holds a master's in Educational Leadership from Teachers College, Columbia University.",
        source: "Zoe Learning House, About Us",
        url: "https://zoelearninghouse.com/about-us",
        readOn: "2026-11-22",
      },
    ],
    hook: "Zoe's About page says Emily Barnitz grew up K-12 as a homeschooler and spent 15 years as an educator in public, international and museum settings, so she understands both the non-traditional and traditional sides of education.",
    body: `Hi Emily,

I read on Zoe's About page that you were homeschooled all the way through, then taught for 15 years in public, international and museum settings. So you've seen both sides, and Zoe sits in between, with some days at home and some days with you.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Zoe.

I'd like to hear how your families handle the home days.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Emily, a note from a microschool in Texas. J",
    shortCode: "zoe-m4t8",
    checkBeforeMailing: [
      "5824 Berkley Drive is Woodland Presbyterian Church, where Zoe shares facility space; it's the only address Zoe publishes. Keep \"Zoe Learning House\" on the envelope so the church passes it on.",
      "Check Zoe's Contact page still lists 5824 Berkley Drive as Our Location before mailing.",
      "Zoe's home page says 16 years as an educator and the About page says 15. The letter uses 15 (the About page, where the homeschool line is).",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the June email, give a new reason (the snapshot), one proof number",
      subject: "Zoe's interest form, revisited",
      body: `Hi Emily,

I mailed you a handwritten note last week with a card for Zoe. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in June) and a one-page snapshot of what a family sees on your site today, from the interest form to the Child Visit Day to paying tuition.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Resource: a 60-second walkthrough",
      body: `Hi Emily,

In case it's easier than clicking around, here's a 60-second walkthrough of the Zoe version: the homepage, the interest form, and what a family sees after they join.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Instagram or Facebook",
      body: "Hi Emily, I'm Julius. I run Sage Field, a microschool in Round Rock, TX. I've enjoyed reading about the nature study and gardening at Zoe.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Emily,

Here's the snapshot, no reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo stays up",
      body: `Hi Emily,

I'll leave it here so I'm not cluttering your inbox. The Zoe version and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
