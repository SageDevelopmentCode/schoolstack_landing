import type { OutreachPlan } from "./types";

export const tapestryAcademyOutreach: OutreachPlan = {
  slug: "tapestry-academy",
  schoolName: "Tapestry Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Candace",
    role: "Owner and Director",
    source:
      "Tapestry Staff page (Candace Lehenbauer, Owner / Director); the Microschool Enrollment page lists \"Ms. Candi, Director/Owner\"; the Homeschool Commons page sends partner inquiries to Candace Lehenbauer",
  },
  angle:
    "One real question: Step Up families register on the site with a coupon code, send EMA funds in pieces, and the team matches funds to registrations",
  facts: [
    {
      fact: "Step Up families register on the website with coupon code sufs26 and check out, then send funds through the EMA marketplace at least 48 hours before class, picking amounts ($2,000, $1,000, $500 down to $5) that add up to the price; registering on the site lets the school compare scholarship funds to registrations, supplies and tuition",
      source: "Tapestry Scholarships page",
      url: "https://www.tapestryacademy.com/scholarships",
      readOn: "2026-11-22",
    },
    {
      fact: "The FAQ's preferred Step Up option has families pay tuition on the first of each month and get reimbursed by Step Up after submitting an invoice from Tapestry",
      source: "Tapestry FAQ",
      url: "https://www.tapestryacademy.com/faq",
      readOn: "2026-11-22",
    },
    {
      fact: "Microschool enrollment for 2026–2027 has seven steps: interest form, observation tour, family conversation, student conversation, handbook and application with a $250 registration fee, shadow day, then the learning agreement, two recommendation letters and a $600 supply fee within five business days",
      source: "Tapestry Microschool Enrollment page",
      url: "https://www.tapestryacademy.com/enrollment",
      readOn: "2026-11-22",
    },
    {
      fact: "The 2026–2027 tuition sheet lists K–8 at $19,500 a year for four days and $10,000 for two days, with a 5% sibling discount and 2% off for paying in full by check or ACH",
      source: "Tapestry tuition sheet (Google Sheet linked from the Tuition page)",
      url: "https://www.tapestryacademy.com/tuition",
      readOn: "2026-11-22",
    },
    {
      fact: "Tapestry Homeschool Commons is new this fall 2026: a Wednesday drop-off enrichment day for ages 5–16 at the Boys & Girls Club of Boca Raton, registered through Sawyer",
      source: "Tapestry Homeschool Commons page",
      url: "https://www.tapestryacademy.com/homeschool-commons",
      readOn: "2026-11-22",
    },
    {
      fact: "Boca Buddies students have competed at the Florida Elementary Science Olympiad at FAU since 2015",
      source: "Boca Buddies Science Club page",
      url: "https://www.tapestryacademy.com/scienceclub",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Candace is listed as Owner / Director on the Staff page and as \"Ms. Candi\" on the Enrollment page; Bear Lehenbauer is co-owner. Confirm Candace is the right recipient and that the CRM address reaches her.",
    "Candace also mentors other microschool founders on Step Up for Students and runs Microschool Florida (Consulting page). Decide whether that changes the pitch (she may be a referral partner more than a customer).",
    "K–8 academics run on Prenda (FAQ, Online Hybrid page). We work alongside it; don't pitch replacing it.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "We'd build: Monthly billing for clubs, after-care or add-on classes",
    "The demo says Homeschool Commons is for ages 5–18; their site says 5–16. Check the demo before recording the Loom.",
    "The demo's admin and parent views use generic data; check the tuition shown matches the $19,500 / $10,000 sheet before recording the Loom.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "DpDyDE1JFtNa1xJi4tCmdw",
    preparedOn: "2026-11-22",
    summary:
      "We read 43 pages of tapestryacademy.com on Nov 22, 2026, plus the tuition sheet, the 2026–27 calendar and the microschool interest form.",
    pageSpeed: { mobileScore: 99, url: "https://www.tapestryacademy.com/", checkedOn: "2026-11-22" },
    toolStack: [
      { name: "Google Forms", usedFor: "Microschool interest form", url: "https://www.tapestryacademy.com/enrollment" },
      { name: "Calendly", usedFor: "Virtual call and observation tour", url: "https://www.tapestryacademy.com/contact" },
      { name: "Sawyer", usedFor: "Homeschool Commons, Learning Pod and Science Club sign-ups", url: "https://www.tapestryacademy.com/homeschool-commons" },
      { name: "Wix store", usedFor: "Step Up registration checkout with a coupon code", url: "https://www.tapestryacademy.com/scholarships" },
      { name: "Zelle, PayPal and Omella", usedFor: "Monthly tuition payments", url: "https://www.tapestryacademy.com/tuition" },
      { name: "Google Sheets and Docs", usedFor: "Tuition sheet, yearly calendar and handbook", url: "https://www.tapestryacademy.com/calendar-1" },
    ],
    observations: [
      {
        area: "find",
        gap: "Microschool tuition is in a Google Sheet on a page outside the menu",
        saw: "The Microschool Enrollment page explains 10 monthly payments but gives no price. The Tuition page, which no menu links to, opens a Google Sheet: $19,500 a year for four days (K–8), $10,000 for two, plus the $250 and $600 fees.",
        impact: "Families comparing schools can't see what Tapestry costs without finding the sheet or booking a call.",
        source: "Tapestry Tuition page",
        url: "https://www.tapestryacademy.com/tuition",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "tuition-rate-plans", "discounts"],
          text: "The site we build shows each schedule's tuition, fees and the sibling discount as plain text, from the same plans families are billed with.",
        },
      },
      {
        area: "apply",
        gap: "The interest form ends by asking families to email you too",
        saw: "The 2026–27 interest form is a Google Form, one per student, with about 25 questions. Its last note asks families to send a brief email saying they filled it out; then the team gets in touch if a seat is open.",
        impact: "A family who skips that email may wait without knowing it, and a second child means the whole form again.",
        source: "Tapestry Microschool interest form (linked from the Enrollment page)",
        url: "https://www.tapestryacademy.com/enrollment",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "The interest form lives on your site and lands in your admin inbox the moment it's sent, with each family's stage from the call to the shadow day.",
        },
      },
      {
        area: "apply",
        gap: "Classes sign up in Sawyer, the microschool in Google Forms",
        saw: "Homeschool Commons has four separate Sawyer links by age group, and Learning Pods and Science Club each have their own. The microschool starts with a Google Form, and Step Up families get a coupon code by email to register.",
        impact: "A family with a microschool child and a Commons sibling keeps two accounts and two sets of receipts.",
        source: "Tapestry Homeschool Commons page",
        url: "https://www.tapestryacademy.com/homeschool-commons",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "parent-portal"],
          text: "We'd set up classes and clubs in the same family login as the microschool, with monthly class billing next to tuition.",
        },
      },
      {
        area: "enroll",
        gap: "Seven steps, and the site doesn't say where the paperwork goes",
        saw: "The Enrollment page lists seven steps, ending with the learning agreement, two recommendation letters and a $600 supply fee due within five business days. It doesn't say how the application, agreement or letters are sent in.",
        impact: "Families ask how to send each piece, and the office tracks who has finished what against a five-day deadline.",
        source: "Tapestry Microschool Enrollment page",
        url: "https://www.tapestryacademy.com/enrollment",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: the learning agreement signed online and the supply fee paid, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "Step Up funds are matched to registrations by hand",
        saw: "Step Up families register on the site with coupon code sufs26, then send EMA funds in pieces ($2,000, $1,000, $500 down to $5) that add up to the price, 48 hours before class. The page says registering lets the school compare funds to registrations, supplies and tuition. The FAQ's preferred option is to pay first and be reimbursed with a Tapestry invoice.",
        impact: "Each family's payment is pieced together in two systems, and someone checks it against the roster before class.",
        source: "Tapestry Scholarships page",
        url: "https://www.tapestryacademy.com/scholarships",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing that shows what Step Up covers and what the family owes on each bill, so the office sees which funds have arrived next to each registration.",
        },
      },
      {
        area: "pay",
        gap: "Tuition comes in by Zelle, PayPal, Omella or check",
        saw: "The Tuition page asks families to pay by Omella bank transfer, PayPal, Zelle or check, naming their guide and student in the comments. The Enrollment page says 10 payments from July to April; the tuition sheet says August to May.",
        impact: "Every month the office matches payments from four places by the note, and families see two different payment schedules.",
        source: "Tapestry Tuition page",
        url: "https://www.tapestryacademy.com/tuition",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "card-and-ach", "autopay"],
          text: "Each family sees what's due and what's paid in their portal, pays by card or bank, and can turn on autopay.",
        },
      },
      {
        area: "updates",
        gap: "The year's calendar is spread across three Google files",
        saw: "The Calendar page links a 2026–27 Google Doc (updated Aug 30). The footer's Yearly Calendar opens a separate spreadsheet, and a Calendar page outside the menu still links the 2025–26 sheet. Enrolled families RSVP for free events with a coupon code.",
        impact: "Families check a document for changes rather than hearing about them, and may open last year's dates.",
        source: "Tapestry Calendar page",
        url: "https://www.tapestryacademy.com/calendar-1",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal"],
          text: "One school calendar in each family's login, kept in one place, next to their tuition and forms.",
        },
      },
      {
        area: "website",
        gap: "The site's store holds one $100 fee and template text",
        saw: "The Scholarships page tells Step Up families to choose their program on the site and check out. The store's only product is a $100 Registration and Supply Fee, and its category still shows the \"This is your category description\" placeholder. The microschool's fees are $250 and $600. An Events page from 2020 is still live.",
        impact: "A family following the checkout step can't find the microschool fees in the store.",
        source: "Tapestry store (All Products)",
        url: "https://www.tapestryacademy.com/category/all-products",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build lists every program and fee families can pay, and we keep it current. Yours already loads fast on a phone (99 on Google PageSpeed); we'd keep it that way.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Tapestry",
    founder: {
      fullName: "Candace Lehenbauer",
      firstName: "Candace",
      role: "Owner and Director",
      source: "Tapestry Academy Staff page (\"Ms. Candace Lehenbauer, Owner / Director / Choir Instructor\")",
      url: "https://www.tapestryacademy.com/staff",
    },
    mailTo: {
      lines: ["1699 S. Federal Hwy, Suite 100", "Boca Raton, FL 33432"],
      source: "Tapestry Academy Contact page (listed under Location and in the footer)",
      url: "https://www.tapestryacademy.com/contact",
    },
    founderFacts: [
      {
        fact: "On the Living Boca podcast (September 4, 2025), Candace Lehenbauer talked with host Paige Kornblue about microschooling as a hybrid of homeschooling and private school, and about how Florida's scholarships, now open to all families, make microschools more accessible.",
        source: "Living Boca, Ep. 33 - Empowering Students Through Alternative Education in Boca Raton (Apple Podcasts)",
        url: "https://podcasts.apple.com/us/podcast/ep-33-empowering-students-through-alternative-education/id1581343473?i=1000724971396",
        readOn: "2026-11-22",
      },
      {
        fact: "Tapestry Homeschool Commons is new this fall 2026: a Wednesday enrichment day for ages 5–16 with the Boys & Girls Club of Boca Raton, running August 2026 to May 2027, with Candace Lehenbauer as the contact.",
        source: "Tapestry Homeschool Commons page",
        url: "https://www.tapestryacademy.com/homeschool-commons",
        readOn: "2026-11-22",
      },
      {
        fact: "Candace told Shoutout Miami (June 8, 2022) that Tapestry was founded in 2018 to blend homeschooling and day school, with project-based, student-led learning and students mastering a subject before moving on.",
        source: "Shoutout Miami, Meet Candace Lehenbauer | Tapestry Academy Microschool Owner/Director",
        url: "https://shoutoutmiami.com/?p=81587",
        readOn: "2026-11-22",
      },
      {
        fact: "Candace founded Microschool Florida, a group connecting families with non-traditional education options; she told Tampa Bay 28 her list of Florida microschools had passed 200.",
        source: "Tampa Bay 28, Inside Florida's growing movement of non-traditional micro-schools",
        url: "https://www.tampabay28.com/news/local-news/inside-floridas-growing-movement-of-non-traditional-micro-schools",
        readOn: "2026-11-22",
      },
    ],
    hook: "On the Living Boca podcast (September 4, 2025), Candace Lehenbauer talked with host Paige Kornblue about microschooling as a hybrid of homeschooling and private school, and about how Florida's scholarships, now open to all families, make microschools more accessible.",
    body: `Hi Candace,

I listened to your Living Boca episode. I liked how you described microschooling as a mix of homeschool and private school, and how Florida's scholarships now put it within reach of any family.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Tapestry.

I'd like to hear how the first months of Homeschool Commons are going.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Candace, a note from a microschool in Round Rock, Texas. J",
    shortCode: "tapestry-rc34",
    checkBeforeMailing: [
      "Listen to the Living Boca episode (Sept 4, 2025, about 40 minutes) before mailing: the hook is from the episode description, so make sure it matches what she says.",
      "She is \"Candace\" on the Staff page and \"Ms. Candi\" on the Enrollment page and in some podcasts (Living Boca's listing spells it \"Candice\"). The letter uses Candace; switch the greeting and sticky note to Candi if you'd rather.",
      "1699 S. Federal Hwy, Suite 100 is the only address the site lists (Contact and About pages); there's no separate mailing address. Address it to Candace Lehenbauer, Tapestry Academy.",
      "Bear Lehenbauer is listed as co-owner; the letter goes to Candace only.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about how Step Up funds get matched to registrations, then who's asking and why",
      subject: "Step Up funds at Tapestry",
      body: `Hi Candace,

I mailed you a handwritten note last week with a card for Tapestry.

Your scholarships page asks Step Up families to register on your site with a coupon code, then send EMA funds in pieces like $2,000 and $500 until they match the price, so your team can compare funds to registrations.

Does that matching happen by hand each month, across the microschool, Commons and Science Club?

I ask because I run Sage Field, a microschool in Round Rock, TX, and billing like that is why I built MudKitchen, the software we run it on.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Candace,

I set up a version of MudKitchen for Tapestry and recorded a 60-second walkthrough: a family reaching out from your homepage, the enrollment checklist they get after your yes, and the page where they pay tuition.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "LinkedIn (Candace Lehenbauer, linked from the Enrollment page)",
      body: "Hi Candace, I'm Julius. I run Sage Field, a small microschool in Round Rock, TX. Loved reading that Boca Buddies has sent kids to Science Olympiad at FAU since 2015.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Sage Field and Rooted Meadows proof",
      body: `Hi Candace,

I also put together a one-page snapshot of what a family sees on your site today, from the interest form to tuition and Step Up. No reply needed:

{snapshot link}

For context, Sage Field went from 0 to 35 students in under 3 months on MudKitchen, and Rooted Meadows, a K–8 school in Idaho, opened on it this August.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Candace,

I'll leave it here so I'm not cluttering your inbox. The Tapestry version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the first year of Homeschool Commons at the Boys & Girls Club.

Julius`,
    },
  ],
};
