import type { OutreachPlan } from "./types";

export const adelphiaClassicalChristianAcademyOutreach: OutreachPlan = {
  slug: "adelphia-classical-christian-academy",
  schoolName: "Adelphia Classical Christian Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Tiffany",
    role: "Admissions Director and Board Member (Tiffany Bettenhausen)",
    source: "Adelphia Admissions page (\"The Academy's new family liaison is Mrs. Tiffany Bettenhausen (Admissions Director)\") and Our Founders page",
  },
  angle:
    "One real question: most 2026–27 grades show a waitlist, new families request the registration packet through the contact form and mail it back, and the waitlist costs $50. When a seat opens, how does the Admissions Director track which family is next?",
  facts: [
    {
      fact: "Adelphia is a K–12 classical Christian Private School Program (PSP) in Orange, CA, established in 2014, on the Bridge Community Church campus; on-campus, teacher-led classes Monday, Tuesday and Thursday; accredited by CLSA (K–12) and WASC (9–12) with UC A–G and NCAA-approved courses",
      source: "Adelphia, Home and About Us",
      url: "https://www.adelphiaclassical.com/about-us-1",
      readOn: "2026-11-23",
    },
    {
      fact: "The home page lists 2026–2027 openings with kindergarten and 2nd–7th grade on a waitlist and 8th–10th limited; the FAQ says the waitlist fee is $50 per family, credited to the application fee when a seat opens",
      source: "Adelphia, Home and FAQ",
      url: "https://www.adelphiaclassical.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "To apply, families request a New Student Registration Packet through the Contact Us form; the Academy schedules an assessment once the completed, mailed application arrives. The Admissions Office is open intermittently June 1 to August 15",
      source: "Adelphia, Admissions and Contact Us",
      url: "https://www.adelphiaclassical.com/admissions",
      readOn: "2026-11-23",
    },
    {
      fact: "The Program Fee Schedule page shows the 2025–2026 schedule as an image: registration fees that rise from February to August, tuition by grade and sibling position (from $6,687 for K–4th), a Tuition Reduction Program, church, military and pastor discounts, and a nine-month plan with a convenience fee",
      source: "Adelphia, Program Fee Schedule (2025-2026 image)",
      url: "https://www.adelphiaclassical.com/tuition-fees",
      readOn: "2026-11-23",
    },
    {
      fact: "Adelphia Latin students have earned 15 perfect National Latin Exam scores over the past eight years, including two on the Spring 2026 exam",
      source: "Adelphia, Home (Latin in The News)",
      url: "https://www.adelphiaclassical.com/",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "We'd build: An ordered waitlist with automatic offers.",
    "Adelphia is larger than most of our schools: K–12, grade-level classes up to 16, a board, an admissions director and several staff. No school software showed on the site.",
    "The Founders page lists the principal's term as 2020–2026 and names no current principal. Tiffany (Admissions Director, board member) owns the waitlist question; the Board President could be an alternative.",
    "Adelphia doesn't take charter funds or state funding (FAQ), so the plan doesn't mention funding programs.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "Jj95SDEMzQcNsIwvpfYTtw",
    preparedOn: "2026-11-23",
    summary:
      "We read 42 pages of adelphiaclassical.com on Nov 23, 2026, plus the program fee schedule.",
    pageSpeed: { mobileScore: 66, url: "https://www.adelphiaclassical.com/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "apply",
        gap: "The application is a packet you request and mail back",
        saw: "Families request a New Student Registration Packet through the Contact Us form. The Academy schedules the assessment once the completed, mailed application arrives, and the Admissions Office is open intermittently June to mid-August.",
        impact: "A family ready to apply waits for a packet, mails it, and can't see when it arrived or what comes next.",
        source: "Adelphia, Admissions and Contact Us",
        url: "https://www.adelphiaclassical.com/admissions",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "The registration packet as one online application families save as they go, landing in one admin inbox.",
        },
      },
      {
        area: "enroll",
        gap: "Most grades are waitlisted, with no way to see your place",
        saw: "The home page shows kindergarten and 2nd–7th grade on a waitlist for 2026–27. Joining costs $50 per family, and the FAQ says families are informed when a seat opens.",
        impact: "A waitlisted family can't see where they stand or when to expect news.",
        source: "Adelphia, Home and FAQ",
        url: "https://www.adelphiaclassical.com/faq",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "waitlist-queue", "application-fee"],
          text: "Each grade marked Open, Waitlist or Full, the $50 paid online, and an ordered waitlist we'd set up with you that offers seats in turn.",
        },
      },
      {
        area: "find",
        gap: "The fee schedule on the site is last year's, as an image",
        saw: "The Program Fee Schedule page shows the 2025–2026 schedule as an image, including \"K-8 first program day is August 26, 2024\". The home page is already offering 2026–2027 tours.",
        impact: "A family touring for 2026–27 can't see this year's prices, and can't search or zoom the image on a phone.",
        source: "Adelphia, Program Fee Schedule and Home",
        url: "https://www.adelphiaclassical.com/tuition-fees",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "tuition-rate-plans"],
          text: "Current tuition and fees as text on the site, set up once so the site and family bills match.",
        },
      },
      {
        area: "pay",
        gap: "A family's total takes several tables to work out",
        saw: "Tuition depends on grade and sibling position, then the Tuition Reduction Program, church, military or pastor discounts, a registration fee that rises by month, and a nine-month plan with a convenience fee.",
        impact: "A family with two or three children adds it up by hand before they know what they'll pay.",
        source: "Adelphia, Program Fee Schedule (2025-2026)",
        url: "https://www.adelphiaclassical.com/tuition-fees",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["discounts", "tuition-rate-plans", "parent-billing", "autopay"],
          text: "Sibling pricing and discounts applied automatically, so each family sees one total and picks full payment or the nine-month plan.",
        },
      },
      {
        area: "tour",
        gap: "Tours are requested through the contact form",
        saw: "The home page says \"2026-2027 TOURS AVAILABLE NOW!\" Admissions invites families to schedule a personal tour by contacting the Academy, through the Contact Us form.",
        impact: "A family can't see open tour times, so booking one takes messages back and forth.",
        source: "Adelphia, Home, Admissions and Contact Us",
        url: "https://www.adelphiaclassical.com/admissions",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a tour from open time slots, with a confirmation sent automatically.",
        },
      },
      {
        area: "website",
        gap: "Several pages still show past years",
        saw: "The High School Schedule page is titled 2020-2021, Returning Students says early-bird pricing ends March 1, 2021, and High School Single Subjects lists courses for September 2021 to May 2022.",
        impact: "A returning or high school family looking for current details finds dates from several years ago.",
        source: "Adelphia, High School Schedule, Returning Students and H.S. Single Subjects",
        url: "https://www.adelphiaclassical.com/high-school-schedule",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and keep the site current for you, with each year's schedule and prices in one place.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Adelphia",
    founder: {
      fullName: "Tiffany Bettenhausen",
      firstName: "Tiffany",
      role: "Admissions Director and Board Member",
      source: "Adelphia, Admissions and Our Founders",
      url: "https://www.adelphiaclassical.com/our-founders",
    },
    mailTo: {
      lines: ["Tiffany Bettenhausen, Admissions Director", "Adelphia Classical Christian Academy", "710 S. Cambridge Street", "Orange, CA 92866"],
      source: "Adelphia Home and Contact Us pages (\"710 S. Cambridge St. Orange, CA 92866\", on the Bridge Community Church campus)",
      url: "https://www.adelphiaclassical.com/contact-us",
    },
    founderFacts: [
      {
        fact: "Adelphia's home page says its Latin students have earned 15 perfect National Latin Exam scores over the past eight years, including two on the Spring 2026 exam.",
        source: "Adelphia, Home (Latin in The News)",
        url: "https://www.adelphiaclassical.com/",
        readOn: "2026-11-23",
      },
      {
        fact: "Adelphia was established in 2014 by a group of families and has grown since 2020 into a K–12 program accredited by CLSA and WASC.",
        source: "Adelphia, Our Founders and About Us",
        url: "https://www.adelphiaclassical.com/our-founders",
        readOn: "2026-11-23",
      },
    ],
    hook: "Adelphia's home page says its Latin students have earned 15 perfect National Latin Exam scores over the past eight years, including two on the Spring 2026 exam.",
    body: `Hi Tiffany,

Your home page says Adelphia's Latin students have earned 15 perfect scores on the National Latin Exam in eight years, two of them this spring. That's wonderful for a three-day program.

Congratulations to your students and teachers. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Adelphia.

I'd love to hear how families usually find you, with so many grades already on a waitlist.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your admissions.",
    stickyNote: "Tiffany, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "adelphia-c8w4",
    checkBeforeMailing: [
      "The address is the school's own, on the Bridge Community Church campus (Home and Contact Us pages).",
      "Adelphia has no single founder (\"a group of Protestant believers\", 2014), so the letter goes to the Admissions Director and opens on a school fact from the home page.",
      "No podcast or press about Adelphia's leaders turned up.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about tracking a waitlist fed by mailed registration packets, then who's asking and one proof number",
      subject: "Adelphia's 2026–27 waitlist",
      body: `Hi Tiffany,

I mailed you a handwritten note last week with a card for Adelphia.

Your home page shows most 2026–27 grades on a waitlist, and new families request the registration packet through the contact form, then mail it back.

When a seat opens, how do you keep track of which waitlisted family is next for that grade?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Tiffany,

In case it's easier to see than describe, I set up a version of MudKitchen for Adelphia and recorded a 60-second walkthrough: a tour request landing in your admin inbox, the enrollment checklist with the Statement of Faith, and the billing page with sibling pricing.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Adelphia is, with no pitch",
      where: "Facebook or LinkedIn (search for Adelphia Classical Christian Academy)",
      body: "Hi Tiffany, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Fifteen perfect National Latin Exam scores is something to be proud of.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Tiffany,

I also put together a one-page snapshot of what a family sees on your site today, from booking a tour to working out tuition. It also lists a few pages still showing past years. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Tiffany,

I'll leave it here so I'm not cluttering your inbox. The Adelphia version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the Year of the Hebrews.

Julius`,
    },
  ],
};
