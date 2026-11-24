import type { OutreachPlan } from "./types";

export const foothillChristianAcademyOutreach: OutreachPlan = {
  slug: "foothill-christian-academy",
  schoolName: "Foothill Christian Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Alicia",
    role: "Principal (Alicia Gonzalez)",
    source: "Foothill Christian Academy, Leadership (Our Staff)",
  },
  angle:
    "One real question: admissions has families sign up for Info Night on a Google Form, book a tour and family interview on Google Calendar, then send an inquiry and apply in FACTS. How does Alicia keep track of each family from Info Night to their application?",
  facts: [
    {
      fact: "Foothill Christian Academy is a hybrid school and Private School Satellite Program in Upland, CA, a ministry of Foothill Bible Church, established 2023; students are on campus Tuesday and Wednesday 9:00–2:30 and Thursday 9:00–12:00, and learn at home Monday and Friday",
      source: "Foothill Christian Academy, What is a Hybrid School? and Parent-Student Handbook 2026–2027",
      url: "https://www.foothillchristianacademy.com/what-is-a-hybrid-homeschool",
      readOn: "2026-11-23",
    },
    {
      fact: "2026–27 tuition is $4,995 per student with a $50 application fee and no multi-student discounts; aid goes through FACTS Grant & Aid, which charges $45",
      source: "Foothill Christian Academy, Financial Aid",
      url: "https://www.foothillchristianacademy.com/financial-aid",
      readOn: "2026-11-23",
    },
    {
      fact: "Admissions has three steps (info night and tour/family interview, application, enrollment): Info Night sign-up is a Google Form (four nights, Jan 19 to Apr 13, 2027), the tour and interview is a Google Calendar booking page, and the inquiry and application are on FACTS",
      source: "Foothill Christian Academy, Admissions and Enrollment; 2026–2027 FCA Information Night Sign-up form",
      url: "https://www.foothillchristianacademy.com/admissions-enrollment",
      readOn: "2026-11-23",
    },
    {
      fact: "The handbook says monthly tuition is due to FACTS Tuition by the 25th, with a $20 late fee after a 10-day grace period, and asks families to pay early so FACTS receives it in time",
      source: "Foothill Christian Academy, Parent-Student Handbook 2026–2027 (Financial Policies)",
      url: "https://docs.google.com/document/d/1fZ5OEuOL1UXDoqe1J3eLyfInKqbPfH-FmAwLG1or9Do/edit?usp=sharing",
      readOn: "2026-11-23",
    },
    {
      fact: "The School Calendar page is headed \"2026-2027 School Calendar\" but its events are from the 2024–25 year (last day of school May 29, 2025; spring break March 24–28, 2025)",
      source: "Foothill Christian Academy, School Calendar",
      url: "https://www.foothillchristianacademy.com/school-calendar",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Existing platform: FCA runs on FACTS (SIS and ParentsWeb, online inquiry and application, FACTS Tuition payment plans, FACTS Grant & Aid). Pitching MudKitchen means replacing FACTS; decide whether it's worth it.",
    "Church school: a ministry of Foothill Bible Church under its elders, with about 12 teachers from Pre-K to 9th grade. Admission is for FBC families and like-minded churches, with elder approval.",
    "The \"One small thing\" aside points out the calendar page still shows 2024–25 dates; keep or cut it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "ylCRpobLBj9b49xnmgmAaA",
    preparedOn: "2026-11-23",
    summary:
      "We read 41 pages of foothillchristianacademy.com on Nov 23, 2026, plus the 2026–2027 handbook and the Info Night sign-up form.",
    pageSpeed: { mobileScore: 59, url: "https://www.foothillchristianacademy.com/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "updates",
        gap: "The 2026–27 calendar page lists last year's dates",
        saw: "The page is headed \"2026-2027 School Calendar\", but the events shown are from 2024–25: the last day of school on May 29, 2025 and spring break March 24–28, 2025.",
        impact: "A family planning this year can't find this year's breaks or quarter dates on the site.",
        source: "Foothill Christian Academy, School Calendar",
        url: "https://www.foothillchristianacademy.com/school-calendar",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal"],
          text: "A live school calendar families see in their login and in the app, updated once for everyone.",
        },
      },
      {
        area: "apply",
        gap: "Four separate forms to get started",
        saw: "Info Night is a Google Form, the tour and family interview is a Google Calendar booking page, and the \"more information\" inquiry and \"Apply Now\" are two FACTS pages.",
        impact: "A family enters the same names and grades up to four times before their application is in.",
        source: "Foothill Christian Academy, Admissions and Enrollment",
        url: "https://www.foothillchristianacademy.com/admissions-enrollment",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["admissions-pipeline", "online-application"],
          text: "One inquiry that carries into the application, with every Info Night, tour and application in one admin inbox.",
        },
      },
      {
        area: "pay",
        gap: "A payment can be late while it's still processing",
        saw: "Monthly tuition is due to FACTS Tuition by the 25th, with a $20 late fee after a 10-day grace period. The handbook asks families to pay early so FACTS receives it in time.",
        impact: "A family that pays near the due date can still be charged a late fee.",
        source: "Foothill Christian Academy, Parent-Student Handbook 2026–2027",
        url: "https://docs.google.com/document/d/1fZ5OEuOL1UXDoqe1J3eLyfInKqbPfH-FmAwLG1or9Do/edit?usp=sharing",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "autopay", "card-and-ach"],
          text: "Autopay by card or bank on the due date, with the balance and history on each family's billing page.",
        },
      },
      {
        area: "enroll",
        gap: "Agreements and forms sit in the handbook appendix",
        saw: "The Family Agreement, Volunteer Agreement and Medication Form are in the appendix of the handbook, a Google Doc. The handbook says to ask the front office for a hard copy.",
        impact: "A family finds each form inside a long document and may need a paper copy to fill in.",
        source: "Foothill Christian Academy, Parent-Student Handbook 2026–2027",
        url: "https://docs.google.com/document/d/1fZ5OEuOL1UXDoqe1J3eLyfInKqbPfH-FmAwLG1or9Do/edit?usp=sharing",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["enrollment-agreements", "forms-documents"],
          text: "The family, volunteer and medication forms filled in and signed online, saved to each family's record.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 59 out of 100 on mobile. The main content takes about 12 seconds to appear.",
        impact: "A parent opening the site on a phone waits a long time before seeing anything.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://www.foothillchristianacademy.com/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with images sized for phones.",
        },
      },
    ],
    toolStack: [
      {
        name: "Google Forms",
        usedFor: "Info Night sign-up",
        url: "https://www.foothillchristianacademy.com/admissions-enrollment",
      },
      {
        name: "Google Calendar booking",
        usedFor: "Tour and family interview",
        url: "https://www.foothillchristianacademy.com/admissions-enrollment",
      },
      {
        name: "FACTS",
        usedFor: "Inquiry, application, ParentsWeb and tuition",
        url: "https://www.foothillchristianacademy.com/admissions-enrollment",
      },
      {
        name: "Google Docs",
        usedFor: "Parent-Student Handbook and forms",
        url: "https://www.foothillchristianacademy.com/parentstudent-handbook",
      },
      {
        name: "Mailchimp",
        usedFor: "Email updates",
        url: "https://www.foothillchristianacademy.com/email-updates",
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Foothill Christian",
    founder: {
      fullName: "Alicia Gonzalez",
      firstName: "Alicia",
      role: "Principal",
      source: "Foothill Christian Academy, Leadership (Our Staff)",
      url: "https://www.foothillchristianacademy.com/partners-impact",
    },
    mailTo: {
      lines: ["Alicia Gonzalez", "Foothill Christian Academy", "1330 W 15th St", "Upland, CA 91786"],
      source: "Foothill Christian Academy site footer and Admissions page",
      url: "https://www.foothillchristianacademy.com/admissions-enrollment",
    },
    founderFacts: [
      {
        fact: "Alicia Gonzalez grew up in Upland and has taught elementary, middle and high school over the last 22 years; she now leads Foothill Christian Academy in Upland.",
        source: "Foothill Christian Academy, Leadership (Our Staff)",
        url: "https://www.foothillchristianacademy.com/partners-impact",
        readOn: "2026-11-23",
      },
      {
        fact: "FCA's hybrid week puts students on campus Tuesday, Wednesday and Thursday morning, and at home with their parents Monday and Friday.",
        source: "Foothill Christian Academy, Parent-Student Handbook 2026–2027",
        url: "https://docs.google.com/document/d/1fZ5OEuOL1UXDoqe1J3eLyfInKqbPfH-FmAwLG1or9Do/edit?usp=sharing",
        readOn: "2026-11-23",
      },
    ],
    hook: "Alicia Gonzalez grew up in Upland and has taught elementary, middle and high school over the last 22 years; she now leads Foothill Christian Academy in Upland.",
    body: `Hi Alicia,

You grew up in Upland, taught every level from elementary to high school over 22 years, and now lead a school in your hometown. That's a rare path.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Foothill Christian.

I'd like to hear how families take to the hybrid week, with two and a half days on campus.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your admissions.",
    stickyNote: "Alicia, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "foothill-g9jr",
    checkBeforeMailing: [
      "The podcast hits for Alicia Gonzalez were other people (a Spanish-language show and unrelated interviews); the hook is from her bio on the Leadership page.",
      "The address is the church campus the school publishes (Foothill Bible Church); it's a business address.",
      "Her bio mentions her husband and daughter; the letter leaves them out on purpose.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about tracking families across Info Night, tour and FACTS application, then who's asking and one proof number, plus the stale calendar aside",
      subject: "Info Night to application at FCA",
      body: `Hi Alicia,

I mailed you a handwritten note last week with a card for Foothill Christian.

Your admissions page has families sign up for Info Night on a Google Form, book a tour and interview on Google Calendar, then apply in FACTS.

How do you keep track of each family from Info Night to their application?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

One small thing: the 2026–2027 School Calendar page still lists 2024–25 dates.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Alicia,

In case it's easier to see than describe, I set up a version of MudKitchen for FCA and recorded a 60-second walkthrough: an Info Night or tour request landing in your admin inbox, the enrollment checklist with the family agreement, and monthly tuition paid on autopay.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello with no pitch",
      where: "Facebook (Foothill Christian Academy)",
      body: "Hi Alicia, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Two and a half days on campus with parents teaching the rest is a model I admire.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Alicia,

I also put together a one-page snapshot of what a family sees on your site today, from Info Night to paying tuition. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Alicia,

I'll leave it here so I'm not cluttering your inbox. The FCA version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
