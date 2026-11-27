import type { OutreachPlan } from "./types";

export const exodusAcademyOutreach: OutreachPlan = {
  slug: "exodus-academy",
  schoolName: "Exodus Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Meg and Jakeb",
    role: "Founder & Principal (Meg Perry) and Founder (Jakeb Perry, manages the books for parents and staff)",
    source: "Exodus Academy, Exodus Team and Our Story",
  },
  angle:
    "One real question: the handbook has tuition paid weekly, after-school billed by the week, lunch ordered on the website by each Sunday, and late fees from the first week. Do families see all of that in one place, or several?",
  facts: [
    {
      fact: "Exodus Academy is a Christian microschool and SCISA member school at 301 Gallman Rd, Inman, SC, with full-time 5K–12, a 2- or 3-day homeschool hybrid and Genesis Kids for 2K–4K; it opened in 2023 and welcomes new students throughout the year as space allows",
      source: "Exodus Academy, Home, Exodus Team and Genesis Kids Registration",
      url: "https://www.educationwithexodus.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "The Parent/Student Handbook says tuition is paid weekly under the Tuition Agreement, with a $25 late fee after one week (up to $100), after-school care 2:30–5:15 for a weekly fee, and special ($6) and daily ($4) lunches ordered on the website by the Sunday before each week",
      source: "Exodus Academy, Parent/Student Handbook 2025–2026 (PDF)",
      url: "https://www.educationwithexodus.com/_files/ugd/02c056_ec67b62bad3b4afc84c7fc13868849a9.pdf",
      readOn: "2026-11-23",
    },
    {
      fact: "The handbook names Classe365 as the parent portal; the website's Parent Portal Login and School Lunch Ordering buttons open QuickSchools",
      source: "Exodus Academy, For Parents and Parent/Student Handbook",
      url: "https://www.educationwithexodus.com/for-parents",
      readOn: "2026-11-23",
    },
    {
      fact: "Registration pages say tuition is about half the cost of many nearby private schools and that tuition and after-school agreements go out through the online portal once a family is approved; the Plans & Pricing page says \"No plans available\"",
      source: "Exodus Academy, Exodus Academy Registration and Plans & Pricing",
      url: "https://www.educationwithexodus.com/exodusacademyregistration",
      readOn: "2026-11-23",
    },
    {
      fact: "Exodus is running a 1–200 Envelope Challenge (posted Nov 12) to build an outdoor campus: swings, hammocks, volleyball and soccer space, a toddler play area and a covered spot to eat lunch outside",
      source: "Exodus Academy blog, Praying Over Every Envelope",
      url: "https://www.educationwithexodus.com/post/praying-over-every-envelope-the-exodus-academy-1-200-envelope-challenge",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Existing platform: Exodus uses QuickSchools for its parent portal (agreements, and the lunch button), and the handbook names Classe365. Pitching MudKitchen means replacing it; decide whether to lead with that.",
    "Bigger than most: SCISA lists enrollment of 47 (K5–12), plus Genesis Kids; about 10 staff on the team page.",
    "The home page says Exodus is \"fully accredited\" by SCISA, but SCISA's member listing says \"Currently Working on Accreditation\" and \"Not Yet Accredited\". The demo says \"SCISA member\". Don't raise it in the email; mention it privately only if it comes up.",
    "Britney is a third founder (administrative director); her surname isn't on the site. Jakeb manages the books, so the email goes to Meg and Jakeb.",
    "We'd build: Monthly billing for clubs, after-care or add-on classes.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds).",
    "The home page shows an Education Scholarship Trust Fund approved-provider badge (South Carolina); ESTF is work-alongside.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "2Iw2B7g89JFEhpcLobVSaA",
    preparedOn: "2026-11-23",
    summary:
      "We read 60 pages of educationwithexodus.com on Nov 23, 2026, plus the Parent/Student Handbook and the 2026–27 calendar.",
    pageSpeed: { mobileScore: 63, url: "https://www.educationwithexodus.com/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "find",
        gap: "Tuition isn't on the site",
        saw: "The registration pages say tuition is about half the cost of many nearby private schools. The Plans & Pricing page says \"No plans available\", and no program lists a price.",
        impact: "A family comparing schools can't see what Exodus costs, or what the hybrid or Genesis Kids rate is, before calling.",
        source: "Exodus Academy, Registration and Plans & Pricing",
        url: "https://www.educationwithexodus.com/plans-pricing",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "website-service"],
          text: "Full-time, hybrid and Genesis Kids rates set up once and shown on the site, so bills always match.",
        },
      },
      {
        area: "pay",
        gap: "Weekly tuition, after-school and lunch are paid separately",
        saw: "The handbook has tuition paid weekly, after-school care charged by the week, and lunches ordered and paid on the website by each Sunday.",
        impact: "A family using after-school and lunch has several weekly charges, in different places, to keep up with.",
        source: "Exodus Academy, Parent/Student Handbook 2025–2026",
        url: "https://www.educationwithexodus.com/_files/ugd/02c056_ec67b62bad3b4afc84c7fc13868849a9.pdf",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "parent-billing", "autopay"],
          text: "We'd set up after-school to bill with tuition on one statement, paid automatically each week.",
        },
      },
      {
        area: "pay",
        gap: "A late fee comes after one missed week",
        saw: "A weekly payment one week late adds a $25 fee, and $25 more each week up to $100. The handbook doesn't mention reminders before a due date.",
        impact: "A family that forgets one weekly payment finds out through a fee.",
        source: "Exodus Academy, Parent/Student Handbook 2025–2026 (Financial Obligations)",
        url: "https://www.educationwithexodus.com/_files/ugd/02c056_ec67b62bad3b4afc84c7fc13868849a9.pdf",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["late-fees-reminders", "autopay"],
          text: "Reminders before each due date and autopay from a card or bank, with the late fee applied only if it's still missed.",
        },
      },
      {
        area: "updates",
        gap: "The handbook and the site name different portals",
        saw: "The handbook tells families to check Classe365 weekly for grades and updates. The website's Parent Portal Login opens QuickSchools.",
        impact: "A new family following the handbook goes looking for the wrong login.",
        source: "Exodus Academy, For Parents and Parent/Student Handbook",
        url: "https://www.educationwithexodus.com/for-parents",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["parent-portal", "mobile-app"],
          text: "One family login on the web and in the app, the same name everywhere.",
        },
      },
      {
        area: "enroll",
        gap: "The handbook on the site is last year's, signed on paper",
        saw: "For Parents links the \"2025-2026 Handbook\". Its last page is an acknowledgement each family prints and signs every year.",
        impact: "A family enrolling for 2026–27 reads last year's rules and signs a printed page.",
        source: "Exodus Academy, For Parents",
        url: "https://www.educationwithexodus.com/for-parents",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements"],
          text: "The current handbook and the financial agreement signed online in each family's enrollment checklist.",
        },
      },
      {
        area: "pay",
        gap: "The scholarship fund appears only as a badge",
        saw: "The home page shows an Education Scholarship Trust Fund \"Approved Provider\" badge. No page says how ESTF families use it or what they'd still pay.",
        impact: "A family with ESTF funds can't see how they'd use them at Exodus.",
        source: "Exodus Academy, Home",
        url: "https://www.educationwithexodus.com/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "website-service"],
          text: "A plain ESTF section on the site, and billing we'd set up with you that shows the fund's share next to the family's.",
        },
      },
      {
        area: "updates",
        gap: "The school calendar is a PDF",
        saw: "The 2026–2027 Academic Calendar is a PDF linked from every page.",
        impact: "Families download it again to check a day off, and a change means sending a new file.",
        source: "Exodus Academy, 2026–2027 Academic Calendar (PDF)",
        url: "https://www.educationwithexodus.com/_files/ugd/02c056_3388a9b52cac4e219ef437007616893a.pdf",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["calendar"],
          text: "A live school calendar each family sees in their login and in the app.",
        },
      },
    ],
    toolStack: [
      {
        name: "QuickSchools",
        usedFor: "Parent portal and agreements",
        url: "https://www.educationwithexodus.com/for-parents",
      },
      {
        name: "Website lunch ordering",
        usedFor: "Weekly lunch orders and payment",
        url: "https://www.educationwithexodus.com/school-lunch-ordering",
      },
      {
        name: "Wix Bookings",
        usedFor: "Tour requests",
        url: "https://www.educationwithexodus.com/service-page/book-a-tour-1",
      },
      {
        name: "WhatsApp",
        usedFor: "School phone line (per the handbook)",
        url: "https://www.educationwithexodus.com/_files/ugd/02c056_ec67b62bad3b4afc84c7fc13868849a9.pdf",
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Exodus",
    founder: {
      fullName: "Meg and Jakeb Perry",
      firstName: "Meg and Jakeb",
      role: "Founders (Meg: Founder & Principal)",
      source: "Exodus Academy, Exodus Team",
      url: "https://www.educationwithexodus.com/exodus-team",
    },
    mailTo: {
      lines: ["Meg and Jakeb Perry", "Exodus Academy", "301 Gallman Rd", "Inman, SC 29349"],
      source: "Exodus Academy site footer on every page, and SCISA's member listing",
      url: "https://www.educationwithexodus.com/",
    },
    founderFacts: [
      {
        fact: "Meg Perry posted on Nov 12 that Exodus's 1–200 Envelope Challenge is raising money for an outdoor campus: new swings, hammocks, volleyball and soccer space, a toddler play area and a covered spot to eat lunch outside.",
        source: "Exodus Academy blog, Praying Over Every Envelope",
        url: "https://www.educationwithexodus.com/post/praying-over-every-envelope-the-exodus-academy-1-200-envelope-challenge",
        readOn: "2026-11-23",
      },
      {
        fact: "Jakeb writes that he and his wife opened Exodus in 2023; SCISA lists enrollment of 47 across K5–12.",
        source: "Exodus Academy, Exodus Team; SCISA member listing",
        url: "https://scisa.org/schools/member-listing/183-exodus-academy.html",
        readOn: "2026-11-23",
      },
    ],
    hook: "Meg Perry posted on Nov 12 that Exodus's 1–200 Envelope Challenge is raising money for an outdoor campus: new swings, hammocks, volleyball and soccer space, a toddler play area and a covered spot to eat lunch outside.",
    body: `Hi Meg and Jakeb,

You opened Exodus in 2023, and now the 1–200 Envelope Challenge is raising money for swings, hammocks and a covered spot to eat lunch outside. It's a lot of growth in three years.

Time outside is a big part of our days too. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Exodus.

I'd love to hear what the students are most excited about for the outdoor campus.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Meg and Jakeb, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "exodus-scdk",
    checkBeforeMailing: [
      "No podcast or press about Meg or Jakeb turned up; the hook is Meg's own blog post from Nov 12.",
      "Meg's founding story mentions a hard season before Exodus; the letter leaves it out on purpose.",
      "The campus is \"the school in the white house\" on Gallman Rd; it's the address the school and SCISA publish, so it's fine to mail.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about weekly tuition, after-school and lunch being paid in different places, then who's asking and one proof number",
      subject: "Weekly payments at Exodus",
      body: `Hi Meg and Jakeb,

I mailed you a handwritten note last week with a card for Exodus.

Your handbook has tuition paid weekly, after-school billed by the week, and lunch ordered on the website by each Sunday, with a late fee after one missed week.

Do families see all of that in one place, or does it come from a few?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Meg and Jakeb,

In case it's easier to see than describe, I set up a version of MudKitchen for Exodus and recorded a 60-second walkthrough: a tour request landing in your admin inbox, the enrollment checklist with the financial agreement and handbook, and a family paying by card or bank on autopay.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Exodus is, with no pitch",
      where: "Facebook (exodusacademy24)",
      body: "Hi Meg and Jakeb, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Hammocks and a covered lunch spot sound like a wonderful outdoor campus.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Meg and Jakeb,

I also put together a one-page snapshot of what a family sees on your site today, from finding a price to paying tuition. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Meg and Jakeb,

I'll leave it here so I'm not cluttering your inbox. The Exodus version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
