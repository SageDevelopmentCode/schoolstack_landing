import type { OutreachPlan } from "./types";

export const choiceActonAcademyOutreach: OutreachPlan = {
  slug: "choice-acton-academy",
  schoolName: "CHOICE: An Acton Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "JeVonne and Paul",
    role: "Head of School (JeVonne Tanner) and Facilities/Art Experiences/Finances (Paul Tanner)",
    source: "CHOICE About Us team cards (\"DELTA Studio Core Skills Guide & Head of School\"; \"Facilities/Art Experiences/Finances\") and the Financial Agreement (payment changes go to Paul)",
  },
  angle:
    "One real question: Utah Fits All families pay $8,000 through Odyssey plus $2,350 themselves by April 30, while other families pay ten installments by check, card or bank invoice, across six versions of the Financial Agreement. How do they keep track of who's on which path? Plus a helpful aside: raw page-builder code shows on the Enrollment page.",
  facts: [
    {
      fact: "CHOICE: An Acton Academy is a learner-driven school in Woods Cross, Utah, for ages 4–14 in three studios (Spark 4–7, Fire 7–11, DELTA 11–14), Monday to Thursday 8:30 to 3:00; 2026/27 tuition is $11,500, paid as a $1,150 deposit and nine monthly payments",
      source: "CHOICE, Home and Enrollment",
      url: "https://choice-education.org/enrollment/",
      readOn: "2026-11-23",
    },
    {
      fact: "The Financial Agreement offers deposit payment by mailed check (preferred), credit card (+2.5% fee) or bank transfer (online invoice), and lets families pay monthly, in full, or via Utah Fits All: $8,000 through Odyssey plus $2,350 due by April 30",
      source: "CHOICE, 3. Financial Agreement 2026/2027",
      url: "https://choice-education.org/4-financial-agreement/",
      readOn: "2026-11-23",
    },
    {
      fact: "The site has separate 2026/2027 Financial Agreement pages for new families, re-enrollment, Year 1, Year 2, Years 3–4 and Clouds, two Parent Contract pages (Spark; Fire/DELTA) and a New Enrollment Form",
      source: "CHOICE, Financial Agreement, Parent Contract and New Enrollment Form pages",
      url: "https://choice-education.org/new-enrollment-form/",
      readOn: "2026-11-23",
    },
    {
      fact: "On the Enrollment page, the Admissions Process section shows raw page-builder code (\"[ba_skill_bar _builder_version=…]\") between its steps; the About page's core beliefs and team section show the same kind of code",
      source: "CHOICE, Enrollment and About Us",
      url: "https://choice-education.org/enrollment/",
      readOn: "2026-11-23",
    },
    {
      fact: "The Hero's Chronicle post \"Who is your Frodo?\" (December 2024) describes the whole school's Session 3 joint quest: heroes acting as helpers in someone else's journey and planning activities for care center residents",
      source: "CHOICE, The Hero's Chronicle: \"Who is your Frodo?\"",
      url: "https://choice-education.org/who-is-your-frodo/",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). Utah Fits All payments go through Odyssey; MudKitchen works alongside it.",
    "JeVonne and Paul Tanner founded CHOICE in 2020 (LiberatED and Dimond Education podcasts). The email greets both; Paul handles payment changes.",
    "CHOICE is an Acton Academy affiliate; Acton network tools may already be in use.",
    "The CRM row listed two addresses; the school's site maps 1423 West 500 South, Woods Cross, so the letter uses that.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "ji5QyLE8DpzNO4mHF5T7Ag",
    preparedOn: "2026-11-23",
    summary:
      "We read 60 pages of choice-education.org on Nov 23, 2026, including the enrollment, financial agreement, tour and FAQ pages.",
    pageSpeed: { mobileScore: 30, url: "https://choice-education.org/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "website",
        gap: "Page-builder code shows on the Enrollment page",
        saw: "In the Admissions Process section, families see lines of raw code like \"[ba_skill_bar _builder_version=…]\" between the steps. The About page's core beliefs and team cards show the same kind of code.",
        impact: "A family reading how to join, or who the Guides are, has to read around code to find the steps and names.",
        source: "CHOICE, Enrollment and About Us",
        url: "https://choice-education.org/enrollment/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and keep the site for you, so admissions steps and your team show cleanly on every page.",
        },
      },
      {
        area: "enroll",
        gap: "Enrollment spans many separate agreement pages",
        saw: "There are separate 2026/2027 Financial Agreement pages for new families, re-enrollment, Year 1, Year 2, Years 3–4 and Clouds, two Parent Contract pages by studio, and a long New Enrollment Form.",
        impact: "A family has to find the right agreement and contract for their child's year and studio, and can't see which ones they've finished.",
        source: "CHOICE, Financial Agreement, Parent Contract and New Enrollment Form pages",
        url: "https://choice-education.org/new-enrollment-form/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "One checklist per family that shows only their child's contract and agreement, signed online with the deposit.",
        },
      },
      {
        area: "pay",
        gap: "Utah Fits All families pay from two places",
        saw: "The Financial Agreement lets families pay through Utah Fits All: $8,000 through Odyssey plus $2,350 due by April 30. Others pay a deposit by mailed check, card (+2.5%) or bank invoice, then nine monthly payments.",
        impact: "A Utah Fits All family can't see in one place what Odyssey has paid and what they still owe before April 30.",
        source: "CHOICE, 3. Financial Agreement 2026/2027",
        url: "https://choice-education.org/4-financial-agreement/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "card-and-ach", "autopay"],
          text: "We'd set up each family's billing page to show the scholarship's share and their own, paid by card or bank with autopay.",
        },
      },
      {
        area: "tour",
        gap: "The tour form shows one time",
        saw: "Tour Signup has a dropdown whose first option is a trap for bots (\"AI Spammers choose the 1st option\") and one tour time: Monday, November 23, 3:15–4:00.",
        impact: "A family who can't make that one slot has nothing else to pick, and may read the first option as a real choice.",
        source: "CHOICE, Tour Signup",
        url: "https://choice-education.org/tour-signup/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick from your open tour slots, with confirmations and reminders sent automatically.",
        },
      },
      {
        area: "website",
        gap: "The home page is very slow on a phone",
        saw: "Google PageSpeed scores the home page 30 out of 100 on mobile. The main content takes about 21 seconds to appear, and the page is about 7.7 MB.",
        impact: "A parent opening the site on a phone may give up before anything appears.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://choice-education.org/",
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
    shortSchoolName: "CHOICE",
    founder: {
      fullName: "JeVonne Tanner and Paul Tanner",
      firstName: "JeVonne and Paul",
      role: "Head of School; Facilities/Art Experiences/Finances",
      source: "CHOICE, About Us (team cards)",
      url: "https://choice-education.org/about-us/",
    },
    mailTo: {
      lines: ["JeVonne and Paul Tanner", "CHOICE: An Acton Academy", "1423 West 500 South", "Woods Cross, UT 84087"],
      source: "CHOICE home page map (\"CHOICE Academy 1423 West 500 South, Woods Cross, UT 84087\"), matching the Acton Academy campus listing",
      url: "https://choice-education.org/",
    },
    founderFacts: [
      {
        fact: "On the LiberatED Podcast (\"Mom, we need to start one!\", January 17, 2023), JeVonne, a former public high school biology teacher, described how she and Paul launched CHOICE Acton Academy in Utah in 2020 at the urging of their children.",
        source: "LiberatED Podcast, \"Mom, we need to start one!\" Why one former public school teacher listened to her daughter and created a microschool",
        url: "https://podcasts.apple.com/us/podcast/mom-we-need-to-start-one-why-one-former-public-school/id1608978473?i=1000594945361",
        readOn: "2026-11-23",
      },
      {
        fact: "The Hero's Chronicle post \"Who is your Frodo?\" (December 2024) describes the whole school's Session 3 joint quest: heroes acting as helpers in someone else's journey and planning activities for care center residents.",
        source: "CHOICE, The Hero's Chronicle: \"Who is your Frodo?\"",
        url: "https://choice-education.org/who-is-your-frodo/",
        readOn: "2026-11-23",
      },
      {
        fact: "CHOICE runs three mixed-age studios: Spark (4–7, Montessori and Reggio Emilia), Fire (7–11) and DELTA (11–14).",
        source: "CHOICE, Home",
        url: "https://choice-education.org/",
        readOn: "2026-11-23",
      },
    ],
    hook: "On the LiberatED Podcast (\"Mom, we need to start one!\", January 17, 2023), JeVonne, a former public high school biology teacher, described how she and Paul launched CHOICE Acton Academy in Utah in 2020 at the urging of their children.",
    body: `Hi JeVonne and Paul,

On the LiberatED podcast, JeVonne told how CHOICE began: a high school biology teacher whose kids said "we need to start one," and she did. Six years on, there are three studios, from Spark to DELTA.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for CHOICE.

I'd like to hear what your heroes are taking on this year.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "JeVonne and Paul, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "choice-v6b9",
    checkBeforeMailing: [
      "The address is the campus mapped on CHOICE's home page and listed by Acton Academy. Payment checks go to a separate Bountiful address in the Financial Agreement; the letter uses the campus.",
      "The hook is the January 2023 LiberatED episode (47m), told in JeVonne's own words; the letter mentions their children only through the episode's title.",
      "A second podcast (Dimond Education, October 2022) also features Paul and JeVonne.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about tracking Utah Fits All and installment families across agreement versions (with the visible page-builder code as a helpful aside), then who's asking and one proof number",
      subject: "Utah Fits All at CHOICE",
      body: `Hi JeVonne and Paul,

I mailed you a handwritten note last week with a card for CHOICE.

Your Financial Agreement has Utah Fits All families pay $8,000 through Odyssey and $2,350 themselves, while others pay ten installments by check, card or invoice. One small thing: the admissions steps on your Enrollment page show raw page-builder code.

With six versions of the agreement, how do you keep track of which family is on which path?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi JeVonne and Paul,

In case it's easier to see than describe, I set up a version of MudKitchen for CHOICE and recorded a 60-second walkthrough: a tour request landing in your admin inbox, one enrollment checklist with the contract and $1,150 deposit, and the billing page a Utah Fits All family would see.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where CHOICE is, with no pitch",
      where: "Facebook or Instagram (search for CHOICE An Acton Academy)",
      body: "Hi JeVonne and Paul, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Spark, Fire and DELTA is a great way to name a journey.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi JeVonne and Paul,

I also put together a one-page snapshot of what a family sees on your site today, from booking a tour to signing the Financial Agreement. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi JeVonne and Paul,

I'll leave it here so I'm not cluttering your inbox. The CHOICE version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
