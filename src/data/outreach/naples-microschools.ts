import type { OutreachPlan } from "./types";

export const naplesMicroschoolsOutreach: OutreachPlan = {
  slug: "naples-microschools",
  schoolName: "Naples MicroSchools",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Dr. Dee",
    role: "Founder and Head of Schools",
    source:
      "Naples MicroSchools Team page (Dayana Philippi, Ed.D., Founder | Director | Lead Learning Guide, \"known by her colleagues as Dr. Dee\"); the About page and the homepage team list call her Head of Schools; the discovery-call and tour Calendly pages are both in the name Dr. Dee Philippi",
  },
  angle:
    "One real question: quarterly invoices are paid within two days through Step Up's EMA or by card, with families paying any gap themselves, so one invoice can have two payers",
  facts: [
    {
      fact: "The financial policy in the NMS registration form says families get each quarterly invoice by email and must pay it or submit it for payment within 2 days, either by reserving state scholarship funds in EMA or by debit/credit card; an invoice isn't paid until NMS receives the funds, and families pay out of pocket whatever the scholarship doesn't cover",
      source: "NMS Day Camps Registration form (Cognito Forms, linked from the Programs page)",
      url: "https://www.cognitoforms.com/EchoED1/NMSDayCampsRegistration",
      readOn: "2026-11-22",
    },
    {
      fact: "SY 2026–2027 tuition: NatureQuest (4-day) $9,200 a year billed $2,300 quarterly; CoreQuest (2-day, K–5) $5,250 a year billed $1,312.50 quarterly; SkillsQuest $11,150 (4-day) or $7,050 (2-day); a $350 registration fee for each; Step Up PEP and UA scholarships and direct pay accepted",
      source: "Naples MicroSchools Tuition page",
      url: "https://www.naplesmicroschools.com/tuition",
      readOn: "2026-11-22",
    },
    {
      fact: "Enrollment has four steps: a discovery call (Calendly), a required in-person tour with parents and children (a second Calendly link), adding the child to the waitlist (a Cognito form), then the $350 registration fee to hold the spot and schedule orientation, followed by uniforms and supplies",
      source: "Naples MicroSchools Admissions page",
      url: "https://www.naplesmicroschools.com/admissions",
      readOn: "2026-11-22",
    },
    {
      fact: "The waitlist form opens with \"Open enrollment is officially closed for the 2025-26 school year\" and says enrollment is rolling, with starts on the 1st or 3rd Monday of the month; the homepage banner says Now Enrolling 2026-27",
      source: "Naples Microschools Waitlist (Cognito form embedded on the Admissions page)",
      url: "https://www.naplesmicroschools.com/admissions",
      readOn: "2026-11-22",
    },
    {
      fact: "NMS runs on Selah's Farmhouse, a 2.5-acre working farm in Golden Gate Estates, and NatureQuest keeps a bucket list of curricular field trips (Naples Zoo, Rookery Bay, Corkscrew Swamp and more)",
      source: "Naples MicroSchools homepage",
      url: "https://www.naplesmicroschools.com/",
      readOn: "2026-11-22",
    },
    {
      fact: "Verbal Gerbil is NMS's farm tutoring with pets: 45-minute sessions at $27 booked in Acuity, or monthly ($200) and quarterly ($540) subscriptions",
      source: "Verbal Gerbil page and its Acuity booking pages",
      url: "https://www.naplesmicroschools.com/vg-tutoring",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "The greeting uses \"Dr. Dee\", the name she uses on her own Calendly pages and the Team page. Confirm the CRM address reaches her (the site's general inbox may go to staff). Leyla is listed as Assistant Head of Schools on the homepage and takes camp registrations; she's the fallback for billing.",
    "The financial policy quoted in the first email sits inside the Day Camps registration form (still labelled 2025 Farm Summer Camp). It describes school-year quarterly invoices, so it reads as the school-wide policy, but confirm before sending.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "We'd build: Monthly billing for clubs, after-care or add-on classes",
    "No Facebook, Instagram or LinkedIn is linked from the site and none turned up in search. Find a profile for step 3 or skip it.",
    "The demo's admin and parent views use generic data; check the tuition shown matches $9,200 a year / $2,300 a quarter (NatureQuest) before recording the Loom.",
    "The school is openly Christian (faith acknowledgement on the waitlist form, Biblical Devotion course). Nothing in the sequence touches it; keep it that way.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "nT53duK4bA6Lp65eThDHxA",
    preparedOn: "2026-11-22",
    summary:
      "We read 13 pages of naplesmicroschools.com on Nov 22, 2026, plus the waitlist, day camp and summer learning forms, both Calendly pages, the Verbal Gerbil booking pages and the course descriptions PDF.",
    pageSpeed: { mobileScore: 62, url: "https://www.naplesmicroschools.com/", checkedOn: "2026-11-22" },
    toolStack: [
      { name: "Calendly", usedFor: "Discovery call and the required farm tour", url: "https://www.naplesmicroschools.com/admissions" },
      { name: "Cognito Forms", usedFor: "Waitlist, day camp and summer learning registration", url: "https://www.naplesmicroschools.com/admissions" },
      { name: "Acuity Scheduling", usedFor: "Verbal Gerbil tutoring bookings and subscriptions", url: "https://www.naplesmicroschools.com/vg-tutoring" },
      { name: "Remind", usedFor: "Texting the school about summer passport pickup", url: "https://www.naplesmicroschools.com/programs" },
    ],
    observations: [
      {
        area: "tour",
        gap: "The call, the tour and the waitlist are three separate sign-ups",
        saw: "The Admissions page sends families to one Calendly link for a 15-minute discovery call, a second Calendly link for the required one-hour farm tour, then a Cognito form for the waitlist. On Nov 22 the tour calendar showed no open times left in November.",
        impact: "A family books twice and fills in a form in a third place, and the team matches names across three tools to see who is at which step.",
        source: "Naples MicroSchools Admissions page",
        url: "https://www.naplesmicroschools.com/admissions",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick a tour time from your open slots on your own site, and the call, tour and waitlist all show on one family record in your admin inbox.",
        },
      },
      {
        area: "apply",
        gap: "The waitlist form still says enrollment closed for 2025–26",
        saw: "The waitlist form on the Admissions page opens with \"Open enrollment is officially closed for the 2025-26 school year\", while the homepage banner says Now Enrolling 2026-27. Below that, the form explains rolling starts on the 1st or 3rd Monday of the month.",
        impact: "A family applying in the 2026–27 year reads that enrollment is closed and may stop before they reach the part about rolling starts.",
        source: "Naples Microschools Waitlist (Cognito form on the Admissions page)",
        url: "https://www.naplesmicroschools.com/admissions",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "The waitlist form lives on your own site with the current year on it, and each entry lands in your admin inbox the moment it's sent.",
        },
      },
      {
        area: "apply",
        gap: "Summer camp sign-up still opens the 2025 form",
        saw: "The Programs page lists 2026 summer weeks (June 1, June 22, July 13, July 27). NMS students register on a 2026 form, but the Register for Farm Summer Camp button opens a form for 2025 Farm Summer Camp with 2025 weeks at $250, and non-NMS families are asked to email to register. Summer Learning Fridays are $50 a week, billed separately.",
        impact: "Outside families have no working way to sign up online, and camp weeks and Friday add-ons are billed apart from tuition.",
        source: "Naples MicroSchools Programs page",
        url: "https://www.naplesmicroschools.com/programs",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "parent-billing"],
          text: "We'd set up camp weeks and add-ons as sign-ups in each family's login, billed next to tuition, with a sign-up page for families new to NMS.",
        },
      },
      {
        area: "enroll",
        gap: "The $350 fee step doesn't say how to pay it",
        saw: "Step 4 on the Admissions page reads \"Submit the $350 registration fee to hold your child's spot\", then families buy uniforms and supplies. The page doesn't say where the fee is paid or what paperwork comes with it.",
        impact: "Families ask how to pay before their spot is held, and the team chases each fee and form by hand.",
        source: "Naples MicroSchools Admissions page",
        url: "https://www.naplesmicroschools.com/admissions",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-fees", "enrollment-agreements"],
          text: "When a spot opens, the family gets one checklist: the $350 fee paid online, the enrollment agreement signed, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "Each quarterly invoice can be split between EMA and a card",
        saw: "The financial policy in the registration form says families get quarterly invoices by email and have 2 days to pay or submit them, through Step Up's EMA or by card. An invoice isn't paid until NMS receives the funds, and families pay whatever the scholarship doesn't cover. NatureQuest is $2,300 a quarter.",
        impact: "One invoice can have two payers on a two-day clock, and someone checks EMA and card payments against every family's invoice.",
        source: "NMS Day Camps Registration form (financial policy)",
        url: "https://www.cognitoforms.com/EchoED1/NMSDayCampsRegistration",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "card-and-ach"],
          text: "We'd set up each invoice to show the Step Up share and the family's share separately, with the family's part payable by card or bank in their portal.",
        },
      },
      {
        area: "updates",
        gap: "Updates come through Remind, a text list and a password page",
        saw: "The Programs page asks families to text through the Remind app to pick up summer passports. The Contact page signs families up for texts with a keyword, and the footer's Parent Hub opens a password screen.",
        impact: "A new family needs an app, a text sign-up and a password before they see everything, and the team posts the same news in several places.",
        source: "Naples MicroSchools Contact page",
        url: "https://www.naplesmicroschools.com/contact",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["messaging", "bulletin", "parent-portal"],
          text: "Messages, announcements and the parent pages in one login per family, so nobody shares a password.",
        },
      },
      {
        area: "website",
        gap: "Several enroll buttons lead to a page-not-found",
        saw: "Join NMS on NatureQuest and Enroll Today on CoreQuest go to /registration, Join CoreQuest goes to /get-started, and Explore on the homepage's Verbal Gerbil card goes to /verbal-gerbil; all three pages return not found. The Tuition page still says \"Apply by April 30, 2025\", the course descriptions PDF is labelled SY24-25, and the homepage scored 62 for mobile speed on Google PageSpeed.",
        impact: "A family ready to enroll from a program page lands on a dead end, and older dates make them wonder what's current.",
        source: "Naples MicroSchools NatureQuest page",
        url: "https://www.naplesmicroschools.com/naturequest",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build sends every enroll button to the same form and we keep dates and documents current, built to load quickly on a phone.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Naples MicroSchools",
    founder: {
      fullName: "Dayana Philippi",
      firstName: "Dr. Dee",
      role: "Founder and Head of Schools",
      source: "Naples MicroSchools Team page (Dayana Philippi, Ed.D., \"known by her colleagues as Dr. Dee\", founder of NMS)",
      url: "https://www.naplesmicroschools.com/team",
    },
    mailTo: {
      lines: ["PO Box 990434", "Naples, FL 34116"],
      source: "Naples MicroSchools Contact page (\"Direct Mail to: Naples MicroSchools | PO Box #990434 | Naples, FL 34116\")",
      url: "https://www.naplesmicroschools.com/contact",
    },
    founderFacts: [
      {
        fact: "In Southwest Florida Family's story \"New, Innovative Educational Microschool Model in Naples\" (January 29, 2025), Dr. Dee Philippi said of Naples MicroSchools: \"This is for all kids – for kids that have the wiggles, for kids that like to be outside, for kids that want hands-on.\"",
        source: "Southwest Florida Family, New, Innovative Educational Microschool Model in Naples (Andrea Stetson)",
        url: "https://neafamily.com/innovative-educational-microschool-model-naples/",
        readOn: "2026-11-22",
      },
      {
        fact: "She told Southwest Florida Family her children were doing well in public school, \"but if you can do something better, then you should.\"",
        source: "Southwest Florida Family, New, Innovative Educational Microschool Model in Naples (Andrea Stetson)",
        url: "https://neafamily.com/innovative-educational-microschool-model-naples/",
        readOn: "2026-11-22",
      },
      {
        fact: "The same story describes students on a 2.5-acre farm in Golden Gate Estates who gather eggs or plant vegetables while working math or reading into it, with 31 students (some part time) in three groups: K–2, 3–4 and 5–8.",
        source: "Southwest Florida Family, New, Innovative Educational Microschool Model in Naples (Andrea Stetson)",
        url: "https://neafamily.com/innovative-educational-microschool-model-naples/",
        readOn: "2026-11-22",
      },
      {
        fact: "Dr. Dee believes engaging with animals and nature can enhance student motivation, learning, leadership and character building, and has trained a team of learning guides to spark joy through exploring the natural world.",
        source: "Naples MicroSchools Team page",
        url: "https://www.naplesmicroschools.com/team",
        readOn: "2026-11-22",
      },
      {
        fact: "Dr. Dee has 20+ years in education, holds master's and doctoral degrees in education, is a Florida certified educator and K-12 school leader, and was principal at BridgePrep Academy of Naples in its first years.",
        source: "Naples MicroSchools About page",
        url: "https://www.naplesmicroschools.com/about",
        readOn: "2026-11-22",
      },
    ],
    hook: "In Southwest Florida Family's story \"New, Innovative Educational Microschool Model in Naples\" (January 29, 2025), Dr. Dee Philippi said of Naples MicroSchools: \"This is for all kids – for kids that have the wiggles, for kids that like to be outside, for kids that want hands-on.\"",
    body: `Hi Dr. Dee,

I read the Southwest Florida Family story about Naples MicroSchools. I liked your line that the school is for kids who have the wiggles and kids who like to be outside.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Naples MicroSchools.

I'd like to hear how the farm fits into your school week.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Dr. Dee, a note from an outdoor microschool in Texas. J",
    shortCode: "naples-7e8m",
    checkBeforeMailing: [
      "Mail to the PO Box the Contact page lists under \"Direct Mail to\". The school itself meets on a farm in Golden Gate Estates; never mail there.",
      "Greeting uses \"Dr. Dee\", the name she uses on the Team page and her Calendly pages. Address the envelope to Dr. Dayana Philippi, Naples MicroSchools.",
      "The Southwest Florida Family story is from January 2025 (31 students then). Read it before mailing so you can talk about it if she texts, and don't quote the old student count.",
      "The school is openly Christian; the letter doesn't touch it. Keep it that way if you add anything by hand.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "One real question about how a quarterly invoice paid partly through EMA and partly by card is tracked, then who's asking and why",
      subject: "Step Up invoices at NMS",
      body: `Hi Dr. Dee,

I mailed you a handwritten note last week with a card for Naples MicroSchools.

The financial policy on your registration form says families get a quarterly invoice by email and have two days to pay it, through Step Up's EMA or by card, and pay out of pocket whatever the scholarship doesn't cover.

When a $2,300 NatureQuest invoice is part EMA and part card, how do you keep track of what's still owed?

I ask because I run Sage Field, a microschool in Round Rock, TX, and billing like that is why I built MudKitchen, the software we run it on.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Dr. Dee,

I set up a version of MudKitchen for Naples MicroSchools and recorded a 60-second walkthrough: a family requesting a discovery call from your homepage, the enrollment checklist they get after the farm tour, and the page where they pay quarterly tuition.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Facebook or Instagram (none linked from the site; find the Naples MicroSchools page first)",
      body: "Hi Dr. Dee, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Loved reading about Verbal Gerbil, tutoring with pets on the farm.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Sage Field and Rooted Meadows proof",
      body: `Hi Dr. Dee,

I also put together a one-page snapshot of what a family sees on your site today, from the discovery call to the waitlist and quarterly invoices. No reply needed:

{snapshot link}

For context, Sage Field went from 0 to 35 students in under 3 months on MudKitchen, and Rooted Meadows, a K–8 school in Idaho, opened on it this August.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Dr. Dee,

I'll leave it here so I'm not cluttering your inbox. The Naples MicroSchools version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the NatureQuest field trip bucket list this year.

Julius`,
    },
  ],
};
