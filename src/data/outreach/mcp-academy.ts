import type { OutreachPlan } from "./types";

export const mcpAcademyOutreach: OutreachPlan = {
  slug: "mcp-academy",
  schoolName: "MCP Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Cammy",
    role: "Founder (Cammy Herrera)",
    source:
      "The 74, \"How New Microschool Accreditation Pathways Are Opening Doors for Founders and Families\" (June 18, 2025), and Voyage Dallas, \"Life & Work with Cammy Herrera of Mansfield\"",
  },
  priorContact: {
    when: "May",
    what: "A hand-sent first email with a link to the MCP Academy MudKitchen demo",
  },
  angle:
    "Re-contact with the Family experience snapshot: the K–8 page lists four payment plans but no tuition amount, TEFA's Monday–Friday rule lives only in the handbook, and Wix template posts are still published.",
  facts: [
    {
      fact: "MCP Academy offers full-time and part-time microschool and homeschool hybrid options for PreK through 8th grade in Mansfield, Texas, plus camps, a Monday homeschool co-op and adult classes",
      source: "MCP Academy home page",
      url: "https://www.mcpacademy.org/",
      readOn: "2026-11-23",
    },
    {
      fact: "The PreK3–8th page lists payment plans (annual by July 1, two installments, 11 or 10 monthly payments, weekly from July 31) but no tuition amounts; Pre K 3–5 lists weekly tuition of $110, $165 or $255",
      source: "MCP Academy, Pre K3-8th and Prek 3-5",
      url: "https://www.mcpacademy.org/classes",
      readOn: "2026-11-23",
    },
    {
      fact: "The handbook says TEFA students must enroll in the Monday–Friday program, with tuition based on full-time enrollment and due regardless of days attended; attendance and parent messages run through Brightwheel",
      source: "MCP Academy, Handbook",
      url: "https://www.mcpacademy.org/handbook",
      readOn: "2026-11-23",
    },
    {
      fact: "Blog posts such as \"New Auditorium Launched in Luanda\" and \"Spring 2023 High School Curriculum\" are published with Wix's template placeholder text",
      source: "MCP Academy, news and updates",
      url: "https://www.mcpacademy.org/news-and-updates/new-auditorium-launched-in-luanda",
      readOn: "2026-11-23",
    },
    {
      fact: "The 74 (June 18, 2025): Cammy Herrera, a former public school teacher, ran a licensed in-home preschool for more than a decade before adding a Montessori-inspired school-age program in 2021; she created the Texas Microschools Facebook group and applied to MSA's Next Generation Accreditation pilot",
      source: "The 74, Kerry McDonald",
      url: "https://www.the74million.org/article/how-new-microschool-accreditation-pathways-are-opening-doors-for-founders-and-families/",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in May (the first email says so).",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). TEFA payments go through Odyssey; MudKitchen works alongside it.",
    "We'd build: Monthly billing for clubs, after-care or add-on classes. For their Saturday classes, camps and extended care.",
    "Cammy created the Texas Microschools Facebook group. If you're a member, don't imply you know her from it unless you've actually talked there.",
    "Attendance and parent messages run through Brightwheel, per the handbook; it may also handle billing. Ask rather than assume.",
    "Instagram (mcpacademytx) is listed in her Voyage Dallas profile.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "0LQ-3TBXyGhHyeM1Clu2bA",
    preparedOn: "2026-11-23",
    summary:
      "We read 29 pages of mcpacademy.org on Nov 23, 2026, including the programs, pricing, calendar and the full family handbook.",
    pageSpeed: { mobileScore: 76, url: "https://www.mcpacademy.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Jotform",
        usedFor: "Inquiry form",
        url: "https://www.mcpacademy.org/",
      },
      {
        name: "Brightwheel",
        usedFor: "Attendance and parent messages",
        url: "https://www.mcpacademy.org/handbook",
      },
      {
        name: "Wix pricing plans",
        usedFor: "Saturday classes",
        url: "https://www.mcpacademy.org/pricing-plans/plans-pricing",
      },
    ],
    observations: [
      {
        area: "find",
        gap: "K–8 tuition isn't on the site",
        saw: "The PreK3–8th page lists four payment plans (annual, two installments, 10 or 11 monthly, weekly) but no tuition amount. Only Pre K 3–5 lists prices.",
        impact: "A K–8 family can see how they could pay, but not what they'd pay, without asking.",
        source: "MCP Academy, Pre K3-8th",
        url: "https://www.mcpacademy.org/classes",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "parent-plan-choice", "website-service"],
          text: "Each schedule's tuition shown on the site and set up once, with the payment plans families pick from.",
        },
      },
      {
        area: "pay",
        gap: "TEFA's rules are only in the handbook",
        saw: "The handbook says TEFA students must enroll Monday–Friday, with tuition based on full-time enrollment and due regardless of days attended. The program pages don't mention TEFA.",
        impact: "A TEFA family planning a 2- or 3-day hybrid finds out it doesn't apply to them only after reading the handbook.",
        source: "MCP Academy, Handbook",
        url: "https://www.mcpacademy.org/handbook",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up TEFA as its own plan, so families see the rules when they choose it and their billing page shows what TEFA covers.",
        },
      },
      {
        area: "website",
        gap: "Template posts are still published",
        saw: "News posts such as \"New Auditorium Launched in Luanda\" and \"Spring 2023 High School Curriculum\" show Wix's placeholder text (\"This item is connected to a text field in your content collection\").",
        impact: "A parent browsing updates finds posts that aren't about MCPA at all.",
        source: "MCP Academy, news and updates",
        url: "https://www.mcpacademy.org/news-and-updates/new-auditorium-launched-in-luanda",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with only your real news on it.",
        },
      },
      {
        area: "website",
        gap: "The pricing page shows an old, garbled price",
        saw: "Plans & Pricing lists a \"FALL SESSION\" at \"$5050$ Every month\" for Saturday morning classes, Sept 30 to Dec 19.",
        impact: "A family looking at Saturday classes can't tell what they cost or whether the session is current.",
        source: "MCP Academy, Plans & Pricing",
        url: "https://www.mcpacademy.org/pricing-plans/plans-pricing",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "programs-capacity"],
          text: "Saturday classes and camps listed with their real price and dates, and marked Open, Waitlist or Full.",
        },
      },
      {
        area: "updates",
        gap: "The Calendar page is empty",
        saw: "The Calendar page in the menu shows no dates or events.",
        impact: "Families can't check breaks, events or camp dates on the site.",
        source: "MCP Academy, Calendar",
        url: "https://www.mcpacademy.org/calendar",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal", "mobile-app"],
          text: "School dates, events and camps on one calendar, on the site and in each family's app.",
        },
      },
      {
        area: "apply",
        gap: "How to apply isn't described",
        saw: "The site has an inquiry form (a Jotform) but no application steps; the handbook says program information is \"provided to parents upon request.\"",
        impact: "A family can't see what comes after the inquiry, or what's needed to enroll, until they hear back.",
        source: "MCP Academy, home page and Handbook",
        url: "https://www.mcpacademy.org/handbook",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline", "enrollment-checklist"],
          text: "An online application and enrollment checklist families can see from the start, all landing in one admin inbox.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "MCPA",
    founder: {
      fullName: "Cammy Herrera",
      firstName: "Cammy",
      role: "Founder",
      source: "Voyage Dallas, \"Life & Work with Cammy Herrera of Mansfield\"",
      url: "https://voyagedallas.com/?p=483563",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Kerry McDonald's June 2025 piece in The 74 says Cammy ran a licensed in-home preschool for more than a decade, added a Montessori-inspired school-age program in 2021, created the Texas Microschools Facebook group, and applied to a new accreditation pilot for microschools.",
        source: "The 74, \"How New Microschool Accreditation Pathways Are Opening Doors for Founders and Families\"",
        url: "https://www.the74million.org/article/how-new-microschool-accreditation-pathways-are-opening-doors-for-founders-and-families/",
        readOn: "2026-11-23",
      },
      {
        fact: "In her Voyage Dallas profile, Cammy says MCP Academy began with her search for the right preschool for her daughter.",
        source: "Voyage Dallas, \"Life & Work with Cammy Herrera of Mansfield\"",
        url: "https://voyagedallas.com/?p=483563",
        readOn: "2026-11-23",
      },
    ],
    hook: "Kerry McDonald's June 2025 piece in The 74 says Cammy ran a licensed in-home preschool for more than a decade, added a Montessori-inspired school-age program in 2021, created the Texas Microschools Facebook group, and applied to a new accreditation pilot for microschools.",
    body: `Hi Cammy,

I read Kerry McDonald's piece in The 74 about MCP Academy and the new accreditation pilot. You grew a home preschool into a PreK–8 microschool, and started the Texas Microschools Facebook group along the way.

Texas microschools are better off for it. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for MCPA.

I'd love to hear how your first year with TEFA families is going.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Cammy, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "mcpa-g7w3",
    checkBeforeMailing: [
      "Find a mailing address: the site and handbook don't list the school's street address in Mansfield (the handbook's only address is an emergency relocation site in Fort Worth). Cato notes the school has moved several times; ask by email, or check the TEFA school directory.",
      "The Cato Institute's Friday Feature on MCP Academy (May 2025) blocked automated reading, so it isn't used.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the May email, the K–8 tuition and TEFA detail, one proof number, offer the snapshot",
      subject: "K–8 tuition at MCPA",
      body: `Hi Cammy,

I mailed you a handwritten note last week with a card for MCPA. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in May) and a one-page snapshot of what a family sees on your site today.

One thing stood out: the K–8 page lists four payment plans but no tuition amount, and the TEFA rule (Monday–Friday only) is only in the handbook.

I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Cammy,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the MCPA version: an inquiry landing in your admin inbox, the enrollment checklist, and the billing page where families pick a weekly or monthly plan.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where MCPA is, with no pitch",
      where: "Instagram (@mcpacademytx)",
      body: "Hi Cammy, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Farm-to-table projects at MCPA look like a great way to learn.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Cammy,

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
      body: `Hi Cammy,

I'll leave it here so I'm not cluttering your inbox. The MCPA version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the high school pod.

Julius`,
    },
  ],
};
