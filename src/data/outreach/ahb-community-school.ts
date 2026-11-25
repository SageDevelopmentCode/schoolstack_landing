import type { OutreachPlan } from "./types";

export const ahbCommunitySchoolOutreach: OutreachPlan = {
  slug: "ahb-community-school",
  schoolName: "AHB Community School",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Shari",
    role: "Head of School (surname not published on the site)",
    source: "AHB Faculty page (Administrative Team: \"HEAD OF SCHOOL Ms. Shari\")",
  },
  angle:
    "One real question: applying runs through a Square store for the fee, a QuickSchools application and separate teacher evaluation links that must arrive before the student visit. With first-round applications due January 31, how does AHB track who's still missing a teacher evaluation?",
  facts: [
    {
      fact: "AHB is a non-religious, project-based K–8 micro school in Austin, offering non-traditional education since 2004; core program Monday to Thursday, 9:00 to 2:30, $15,500 a year ($1,292 a month), now on a new Crestview campus at 1509 Dartmouth Ave after moving from Hyde Park",
      source: "AHB, Home, Tuition and Fees, Contact Us and New Campus",
      url: "https://www.ahbcs.org/tuition-fees/",
      readOn: "2026-11-23",
    },
    {
      fact: "To apply, families pay the application fee online (a Square store) or by mail, complete the application form (QuickSchools), attach a report card, and send their child's current teachers a separate evaluation form link; the evaluation must arrive before the classroom day visit. First-round applications are due January 31 and acceptances go out March 5",
      source: "AHB, Apply and Admissions Process",
      url: "https://www.ahbcs.org/apply/",
      readOn: "2026-11-23",
    },
    {
      fact: "Tours are requested through a form, after which the Associate Director contacts the family; the Tour page says \"Group information sessions will resume in September\"",
      source: "AHB, Visit Us",
      url: "https://www.ahbcs.org/tour-the-school/",
      readOn: "2026-11-23",
    },
    {
      fact: "Parent Resources sends families to QuickSchools for progress, FACTS for tuition and aid, a Google Drive for the printable calendar, directory and handbook, and a Google Calendar with subscription instructions",
      source: "AHB, Parent Resources",
      url: "https://www.ahbcs.org/parent-resources/",
      readOn: "2026-11-23",
    },
    {
      fact: "AHB's Board decided not to participate in TEFA for 2026–2027",
      source: "AHB, Admissions Process",
      url: "https://www.ahbcs.org/application-process/",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "AHB already runs on QuickSchools (application, teacher evaluations, progress) and FACTS (tuition and aid). Pitch only as one place for families; don't present the tools as broken.",
    "AHB is larger than most of our schools: 80–105 students across K–8, with a Head of School, Associate Director and a parent-led board.",
    "Shari's surname isn't on the site; the email greets her by first name. Alexa (Associate Director) runs tours and admissions if you'd rather write to her.",
    "AHB is in Austin: the letter offers coffee.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "2MD9Afh6_6CwZ-4givMwKQ",
    preparedOn: "2026-11-23",
    summary:
      "We read the main pages of ahbcs.org on Nov 23, 2026: admissions, apply, tuition, aid, tours, parent resources, FAQ and the new campus.",
    pageSpeed: { mobileScore: 64, url: "https://www.ahbcs.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Square",
        usedFor: "Application fee",
        url: "https://www.ahbcs.org/apply/",
      },
      {
        name: "QuickSchools",
        usedFor: "Application, teacher evaluations and student progress",
        url: "https://www.ahbcs.org/apply/",
      },
      {
        name: "FACTS",
        usedFor: "Tuition payments and financial aid",
        url: "https://www.ahbcs.org/parent-resources/",
      },
      {
        name: "Google Drive and Calendar",
        usedFor: "Calendar, directory and handbook",
        url: "https://www.ahbcs.org/parent-resources/",
      },
    ],
    observations: [
      {
        area: "apply",
        gap: "Applying runs through three places",
        saw: "Families pay the fee in a Square store (or by mail), fill in the application on QuickSchools, attach a report card, and forward a separate evaluation link to their child's teachers. The evaluation must arrive before the student visit.",
        impact: "A family can't see whether the teacher evaluation arrived, so they don't know when the student visit can be scheduled.",
        source: "AHB, Apply",
        url: "https://www.ahbcs.org/apply/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "One application with the report card upload, and each applicant's fee, evaluation and visit tracked together in one admin inbox.",
        },
      },
      {
        area: "tour",
        gap: "Tours are requested, not booked",
        saw: "The Visit Us page asks families to fill in a form so the Associate Director can contact them about availability. It also says \"Group information sessions will resume in September\".",
        impact: "A family can't see open tour times, and in November reads that sessions resume in September.",
        source: "AHB, Visit Us",
        url: "https://www.ahbcs.org/tour-the-school/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a tour or info session from open slots, with a confirmation sent automatically.",
        },
      },
      {
        area: "updates",
        gap: "Families keep four places for school life",
        saw: "Parent Resources links QuickSchools for progress, FACTS for tuition, a Google Drive for the printable calendar, directory and handbook, and a Google Calendar with steps to subscribe in another app.",
        impact: "A parent looking for this week's event or the directory checks several places, each with its own link or login.",
        source: "AHB, Parent Resources",
        url: "https://www.ahbcs.org/parent-resources/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["parent-portal", "calendar", "student-records", "mobile-app"],
          text: "Calendar, directory, handbook and billing in one family login, on the web and the phone.",
        },
      },
      {
        area: "find",
        gap: "The site gives three different school sizes",
        saw: "The home page says the student limit is 105, the FAQ says AHB admits 80 to 90 students each year, and the community section says the school is limited to 90.",
        impact: "A family weighing how small AHB really is gets three answers.",
        source: "AHB, Home, FAQ and Parent Resources",
        url: "https://www.ahbcs.org/faq/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and keep the site current for you, so key numbers say the same thing on every page.",
        },
      },
      {
        area: "pay",
        gap: "The aid page still talks about 2025–26",
        saw: "Financial Aid says \"The deadline to apply for aid for the 2025-26 school year has passed\". Aid applications go through FACTS by February 15.",
        impact: "A family planning for next year can't tell whether aid is open for them or when to apply.",
        source: "AHB, Financial Aid",
        url: "https://www.ahbcs.org/financial-aid/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "discounts"],
          text: "Current aid dates on the site, and sibling discounts and aid awards applied on each family's bill.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 64 out of 100 on mobile. The main content takes about 9 seconds to appear.",
        impact: "A parent opening the site on a phone waits several seconds before seeing anything.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://www.ahbcs.org/",
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
    shortSchoolName: "AHB",
    founder: {
      fullName: "Shari",
      firstName: "Shari",
      role: "Head of School",
      source: "AHB, Faculty (Administrative Team)",
      url: "https://www.ahbcs.org/faculty/",
    },
    mailTo: {
      lines: ["Shari, Head of School", "AHB Community School", "1509 Dartmouth Ave", "Austin, TX 78757"],
      source: "AHB Contact Us and Apply pages (\"1509 Dartmouth Ave, Austin, TX 78757\")",
      url: "https://www.ahbcs.org/contact-us/",
    },
    founderFacts: [
      {
        fact: "AHB moved from its longtime Hyde Park home to a new campus in Crestview, with a gym, a commercial kitchen, and AHB's first teachers' lounge, shared with parents.",
        source: "AHB, New Campus (\"AHB is Moving to Crestview\")",
        url: "https://www.ahbcs.org/new-campus/",
        readOn: "2026-11-23",
      },
      {
        fact: "Shari first came to AHB as a parent in 2014, taught Humanities, and rejoined the administrative team in 2019; she is now Head of School.",
        source: "AHB, Faculty",
        url: "https://www.ahbcs.org/faculty/",
        readOn: "2026-11-23",
      },
    ],
    hook: "AHB moved from its longtime Hyde Park home to a new campus in Crestview, with a gym, a commercial kitchen, and AHB's first teachers' lounge, shared with parents.",
    body: `Hi Shari,

I read about AHB's move from Hyde Park to Crestview: a gym, a real kitchen, and a teachers' lounge you share with parents. I loved that last one.

It says a lot about the school you've built. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for AHB.

If you're ever up for coffee, I'd love to hear how the move to Crestview has gone.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your admissions.",
    stickyNote: "Shari, a note from a small microschool up the road in Round Rock. J",
    shortCode: "ahb-t9m4",
    checkBeforeMailing: [
      "The address is the school's own new campus (Contact Us; the Apply page uses it for mailed application fees).",
      "Shari's surname isn't published; find it (LinkedIn, TAAPS) for the envelope, or address it to the Head of School as written.",
      "No podcast or press about Shari turned up; the hook is the school's New Campus page.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about tracking teacher evaluations across Square and QuickSchools before January 31, then who's asking and one proof number",
      subject: "AHB teacher evaluations",
      body: `Hi Shari,

I mailed you a handwritten note last week with a card for AHB.

Your Apply page has families pay the fee in a Square store, apply on QuickSchools, and send their child's teachers a separate evaluation link that has to arrive before the student visit.

With first-round applications due January 31, how do you keep track of which families are still waiting on a teacher?

I ask because I run Sage Field, a small outdoor microschool up the road in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Shari,

In case it's easier to see than describe, I set up a version of MudKitchen for AHB and recorded a 60-second walkthrough: a tour request landing in your admin inbox, the enrollment checklist with the $1,200 fee, and the billing page with monthly or per-semester payment.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where AHB is, with no pitch",
      where: "Instagram (@ahbcs)",
      body: "Hi Shari, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock. Twenty years of project-based learning in Austin is something to celebrate.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Shari,

I also put together a one-page snapshot of what a family sees on your site today, from booking a tour to finding the calendar. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Shari,

I'll leave it here so I'm not cluttering your inbox. The AHB version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links. The coffee offer stands too.

Julius`,
    },
  ],
};
