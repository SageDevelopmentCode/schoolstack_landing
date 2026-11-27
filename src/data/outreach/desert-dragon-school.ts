import type { OutreachPlan } from "./types";

export const desertDragonSchoolOutreach: OutreachPlan = {
  slug: "desert-dragon-school",
  schoolName: "Desert Dragon Learning Community",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Annie",
    role: "Founder/Director (Annie Holub)",
    source: "Desert Dragon, Who We Are",
  },
  angle:
    "One real question: families choose full-time or part-time, pay by the year, the quarter or monthly, and full-time families can pay with ESA through ClassWallet or apply for STO scholarships. How does Annie keep track of what each family owes?",
  facts: [
    {
      fact: "Desert Dragon Learning Community is a small, neuroaffirming, trauma-informed microschool for grades K–8 in Tucson, open Monday to Friday 9:30–3:00, and a registered 501(c)(3) nonprofit",
      source: "Desert Dragon, Home",
      url: "https://www.desertdragonlearning.org/",
      readOn: "2026-11-23",
    },
    {
      fact: "Enrollment for 2026–27 is open: full-time (4–5 days) is $12,000 a year or $3,000 a quarter, part-time (1–3 days) $8,000 a year or $2,000 a quarter, plus a $200 materials fee; monthly payment plans are available",
      source: "Desert Dragon, Enrollment Options",
      url: "https://www.desertdragonlearning.org/enrollment-options",
      readOn: "2026-11-23",
    },
    {
      fact: "Full-time students can pay with ESA funds (the school is an AZ ESA ClassWallet direct-pay vendor) or apply for STO scholarships from The Institute for Better Education or the Arizona Leadership Foundation, but not both",
      source: "Desert Dragon, Enrollment Options",
      url: "https://www.desertdragonlearning.org/enrollment-options",
      readOn: "2026-11-23",
    },
    {
      fact: "The \"Schedule a Tour!\" button opens a new email; the home page has a Request Information form hosted on KaiPod's Jotform, and the program page links to a SurveyMonkey screening questionnaire",
      source: "Desert Dragon, Enrollment Options, Home and Curriculum",
      url: "https://www.desertdragonlearning.org/enrollment-options",
      readOn: "2026-11-23",
    },
    {
      fact: "Annie Holub has taught in Tucson since 2003, taught English at City High School from 2013 to 2023, and was a member of the 2024 ASU Prep Microschool Fellowship",
      source: "Desert Dragon, Who We Are",
      url: "https://www.desertdragonlearning.org/who-we-are",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Uses KaiPod's Jotform: decide whether to pitch replacing it",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds).",
    "Desert Dragon is a KaiPod Partner School and Annie is in the KaiPod and VELA Founders Networks, so KaiPod may supply some tools. ESA (ClassWallet) and the STOs are work-alongside, not replaced.",
    "The CRM website is desertdragonlearning.com, which shows a Squarespace \"Coming Soon\" page; the live site is desertdragonlearning.org. If you want, add a \"One small thing\" aside about the .com.",
    "Desert Dragon's 2025 report on GuideStar (from its Form 990) says enrollment grew from 5 to 11 students but the school still struggles to keep up with costs, partly because some families' ESA funds arrived late. It's growth, not a closing notice, so the plan goes ahead; don't quote the report to Annie.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "bqHHA0BvW8kEDGWqm6-69Q",
    preparedOn: "2026-11-23",
    summary:
      "We read 11 pages of desertdragonlearning.org on Nov 23, 2026, plus the Request Information form and the screening questionnaire.",
    pageSpeed: { mobileScore: 82, url: "https://www.desertdragonlearning.org/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "enroll",
        gap: "There's no way to enroll on the site",
        saw: "Enrollment Options says Desert Dragon is accepting enrollments for 2026–27 and lists the plans. Its only button is \"Schedule a Tour!\", and the site doesn't say what happens after the tour.",
        impact: "A family ready to join doesn't know the next step, or how to pick their days, sign up and pay the materials fee.",
        source: "Desert Dragon, Enrollment Options",
        url: "https://www.desertdragonlearning.org/enrollment-options",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "One enrollment checklist: the application, the plan and days, the agreement signed online and the $200 materials fee paid.",
        },
      },
      {
        area: "tour",
        gap: "Tours are booked by email",
        saw: "\"Schedule a Tour!\" opens a new email with the subject \"I'd like to schedule a tour!\". No tour times are shown.",
        impact: "A family writes in and waits for a reply before they can find a time to visit.",
        source: "Desert Dragon, Enrollment Options",
        url: "https://www.desertdragonlearning.org/enrollment-options",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick an open tour time on the site, and every tour request lands in one admin inbox.",
        },
      },
      {
        area: "apply",
        gap: "Three separate places to get started",
        saw: "The home page has a Request Information form on KaiPod's Jotform, the program page links to a six-question screening survey on SurveyMonkey, and tours start with an email. Submitting the KaiPod form consents to marketing emails, calls and texts.",
        impact: "A family answers questions in three places, and none of them carries over to the next step.",
        source: "Desert Dragon, Home and Curriculum & Program Information",
        url: "https://www.desertdragonlearning.org/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["admissions-pipeline", "online-application"],
          text: "One inquiry form with your screening questions, saved to the family's record in one admin inbox.",
        },
      },
      {
        area: "pay",
        gap: "Monthly payment amounts aren't listed",
        saw: "Yearly and quarterly prices are listed, and the page says \"Monthly payment plans are available!\" without the monthly amount or how families pay.",
        impact: "A family can't see what they'd pay each month, or whether they can pay by card or bank.",
        source: "Desert Dragon, Enrollment Options",
        url: "https://www.desertdragonlearning.org/enrollment-options",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families pick yearly, quarterly or monthly, see each amount and pay by card or bank automatically.",
        },
      },
      {
        area: "pay",
        gap: "What ESA leaves a family to pay isn't shown",
        saw: "Full-time families can pay with ESA funds through ClassWallet direct pay. The site doesn't say how a family pays any part of tuition the ESA doesn't cover.",
        impact: "An ESA family can't see what the ESA has paid and what they still owe.",
        source: "Desert Dragon, Enrollment Options",
        url: "https://www.desertdragonlearning.org/enrollment-options",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing with you so the ESA share and the family's share show side by side, alongside ClassWallet.",
        },
      },
      {
        area: "updates",
        gap: "The school calendar isn't on the site",
        saw: "Enrollment Options mentions calendar holidays, professional development days and half-days, but no calendar is posted or linked.",
        impact: "A family can't see days off and half-days before planning work around them.",
        source: "Desert Dragon, Enrollment Options",
        url: "https://www.desertdragonlearning.org/enrollment-options",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal"],
          text: "A school calendar every family sees in their own login and in the app.",
        },
      },
    ],
    toolStack: [
      {
        name: "Jotform",
        usedFor: "Request information form",
        url: "https://www.desertdragonlearning.org/",
        network: "KaiPod",
      },
      {
        name: "SurveyMonkey",
        usedFor: "Screening questionnaire",
        url: "https://www.desertdragonlearning.org/curriculum",
      },
      {
        name: "Squarespace store",
        usedFor: "Social event sign-ups and payments",
        url: "https://www.desertdragonlearning.org/social-events",
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Desert Dragon",
    founder: {
      fullName: "Annie Holub",
      firstName: "Annie",
      role: "Founder/Director",
      source: "Desert Dragon, Who We Are",
      url: "https://www.desertdragonlearning.org/who-we-are",
    },
    mailTo: {
      lines: ["Annie Holub", "Desert Dragon Learning Community", "3054 N. 1st Ave #1", "Tucson, AZ 85719"],
      source: "Desert Dragon site footer, on every page (suite #1 in the Many Hands Courtyard per the school's 2025 report)",
      url: "https://www.desertdragonlearning.org/",
    },
    founderFacts: [
      {
        fact: "Annie taught English at City High School in downtown Tucson from 2013 to 2023 and writes that even in a progressive, alternative school like City High, she saw the need for a different way to do school.",
        source: "Desert Dragon, Who We Are",
        url: "https://www.desertdragonlearning.org/who-we-are",
        readOn: "2026-11-23",
      },
      {
        fact: "Desert Dragon is opening a few spots for its first group of elementary schoolers in 2026–27.",
        source: "Desert Dragon, Curriculum & Program Information",
        url: "https://www.desertdragonlearning.org/curriculum",
        readOn: "2026-11-23",
      },
      {
        fact: "Annie was a member of the 2024 ASU Prep Microschool Fellowship and is in the VELA and KaiPod Founders Networks.",
        source: "Desert Dragon, Who We Are",
        url: "https://www.desertdragonlearning.org/who-we-are",
        readOn: "2026-11-23",
      },
    ],
    hook: "Annie taught English at City High School in downtown Tucson from 2013 to 2023 and writes that even in a progressive, alternative school like City High, she saw the need for a different way to do school.",
    body: `Hi Annie,

You taught English at City High for ten years and still saw the need for a different way to do school. Desert Dragon is that different way, and I loved reading the parents' words on your site.

Stories like yours are why I wanted to write. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Desert Dragon.

I'd love to hear how your first elementary group is settling in.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Annie, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "desertdragon-h9u6",
    checkBeforeMailing: [
      "No podcast or press about Annie turned up (iTunes, web search); the hook is from her Who We Are page.",
      "Her bio also mentions her son; the letter leaves that out on purpose.",
      "Don't use the 1025 E Hampton St address from the nonprofit listings; mail to the school's published suite on N. 1st Ave.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about tracking plans, quarters and ESA, then who's asking and one proof number",
      subject: "ESA and plans at Desert Dragon",
      body: `Hi Annie,

I mailed you a handwritten note last week with a card for Desert Dragon.

Your enrollment page lists full-time and part-time plans, paid by the year, the quarter or monthly, with ESA through ClassWallet or STO scholarships for full-time students.

With that mix, how do you keep track of what each family still owes?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Annie,

In case it's easier to see than describe, I set up a version of MudKitchen for Desert Dragon and recorded a 60-second walkthrough: a tour request landing in your admin inbox, the enrollment checklist with the $200 materials fee, and the billing page with yearly, quarterly or monthly plans.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Desert Dragon is, with no pitch",
      where: "Instagram (desertdragonlearning)",
      body: "Hi Annie, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Passion projects presented every December and May is a lovely tradition.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Annie,

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
      body: `Hi Annie,

I'll leave it here so I'm not cluttering your inbox. The Desert Dragon version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
