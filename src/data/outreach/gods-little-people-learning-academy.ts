import type { OutreachPlan } from "./types";

export const godsLittlePeopleLearningAcademyOutreach: OutreachPlan = {
  slug: "gods-little-people-learning-academy",
  schoolName: "God's Little People Learning Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Mar'Keda",
    role: "Co-founder (Mar'Keda P. Gould), with her mother Jacqueline Gould",
    source: "God's Little People Learning Academy, About (\"Meet our Founders: Mar'Keda P. Gould and Jacqueline Gould\")",
  },
  angle:
    "Why now: the About page says they accept TEFA and offer monthly billing. At $12,500 tuition, a TEFA family still owes about $2,026 on top of the $10,474 the state pays, so one student can mean two payers. How is the family's share being handled?",
  facts: [
    {
      fact: "Five-Day Plan: $12,500 per school year, Monday through Thursday in person with an online whole-group morning meeting every Friday; monthly billing is available (\"Please contact for details\"); 10% family discount for a third student",
      source: "God's Little People Learning Academy, About (Enrollment Options)",
      url: "https://www.godslittlepeoplemicroschool.com/about",
      readOn: "2026-11-23",
    },
    {
      fact: "\"We proudly accept ESA/scholarship funding through ESA and TEFA\"",
      source: "God's Little People Learning Academy, About",
      url: "https://www.godslittlepeoplemicroschool.com/about",
      readOn: "2026-11-23",
    },
    {
      fact: "TEA set the 2026–27 TEFA amount at $10,474 per child at an approved private school",
      source: "Texas Education Freedom Accounts, For Schools",
      url: "https://educationfreedom.texas.gov/schools/",
      readOn: "2026-11-23",
    },
    {
      fact: "Founded by Mar'Keda P. Gould and Jacqueline Gould, a mother-daughter duo with over four decades combined in early childhood education; they left public school, opened an in-home childcare that ran like a private preschool, and four months later launched the microschool",
      source: "God's Little People Learning Academy, About (Meet our Founders)",
      url: "https://www.godslittlepeoplemicroschool.com/about",
      readOn: "2026-11-23",
    },
    {
      fact: "The Contact page form is a Jotform on kaipodlearning.jotform.com; the footer links to KaiPod Learning",
      source: "God's Little People Learning Academy, Contact",
      url: "https://www.godslittlepeoplemicroschool.com/contact",
      readOn: "2026-11-23",
    },
    {
      fact: "Google PageSpeed gave the home page a mobile score of 61; the main content took about 5.7 seconds to appear",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.godslittlepeoplemicroschool.com%2F",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Uses KaiPod's Jotform: decide whether to pitch replacing it (the inquiry form runs on kaipodlearning.jotform.com and the footer links to KaiPod).",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "TEFA payments go through the state's program (Odyssey). MudKitchen works alongside it; don't pitch replacing it.",
    "The TEFA math assumes a TEFA family pays full tuition and TEFA pays $10,474; confirm they aren't discounting tuition for TEFA families.",
    "Instagram (@godslittlepeoplemicroschool) and Facebook are linked from the site but weren't opened; check one is active before the social step.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "sUsNsOjE22KNDC8jB284dQ",
    preparedOn: "2026-11-23",
    summary: "We read all 4 pages of godslittlepeoplemicroschool.com on Nov 23, 2026, plus the inquiry form.",
    pageSpeed: { mobileScore: 61, url: "https://www.godslittlepeoplemicroschool.com/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "find",
        gap: "The site doesn't give hours or a location",
        saw: "The plan runs Monday through Thursday in person with an online Friday meeting, but the site doesn't list start and end times or where in Houston the school is. The footer says only \"Houston, Texas\".",
        impact: "A parent can't tell whether the drive or the day works for their family until they reach out.",
        source: "God's Little People Learning Academy, home page and About",
        url: "https://www.godslittlepeoplemicroschool.com/about",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build the site for you with the daily schedule and the area you're in, so families know before they ask.",
        },
      },
      {
        area: "tour",
        gap: "There's no way to book a visit",
        saw: "The About page has a \"Speak to our founders\" heading, and the Contact page has one form. Nothing on the site describes a visit or lets a family pick a time.",
        impact: "Every parent who wants to see the classroom has to write in and wait for a reply first.",
        source: "God's Little People Learning Academy, About and Contact",
        url: "https://www.godslittlepeoplemicroschool.com/contact",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick a visit time from the slots you open, right after their inquiry, and it shows on that family's record.",
        },
      },
      {
        area: "apply",
        gap: "The site doesn't say how to apply",
        saw: "The Contact page form, a Jotform on kaipodlearning.jotform.com, is the only way in. The site doesn't describe an application, its steps, or how long a family waits to hear back.",
        impact: "A parent ready to enroll sends a general message and waits to learn what comes next.",
        source: "God's Little People Learning Academy, Contact",
        url: "https://www.godslittlepeoplemicroschool.com/contact",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families apply on the site and can save and come back, and every inquiry and application sits in one admin inbox with its status.",
        },
      },
      {
        area: "pay",
        gap: "TEFA families pay from two places",
        saw: "Tuition is $12,500 and the school accepts TEFA, which pays $10,474 per child in 2026–27. That leaves about $2,026 for the family. Monthly billing is offered, but the site says to \"contact for details\".",
        impact: "Each TEFA student has two payers, and parents can't see their own share until they ask.",
        source: "God's Little People Learning Academy, About; Texas Education Freedom Accounts",
        url: "https://www.godslittlepeoplemicroschool.com/about",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "tuition-rate-plans", "parent-billing", "autopay"],
          text: "We'd set up each family's billing page to show the TEFA share and their own share, with a monthly plan and autopay for their part.",
        },
      },
      {
        area: "pay",
        gap: "The monthly plan isn't spelled out",
        saw: "\"Monthly billing options are available. Please contact for details regarding tuition and payment options.\" The site doesn't say how many payments, when they're due or how to pay.",
        impact: "Families budgeting for a $12,500 year have to ask before they can plan.",
        source: "God's Little People Learning Academy, About",
        url: "https://www.godslittlepeoplemicroschool.com/about",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "card-and-ach"],
          text: "Families choose monthly or pay-in-full when they enroll and pay by card or bank from their own billing page.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow to appear on a phone",
        saw: "Google PageSpeed gave the home page a mobile score of 61. The main content took about 5.7 seconds to appear.",
        impact: "A parent checking the site from a phone waits before seeing what the school offers.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.godslittlepeoplemicroschool.com%2F",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with images sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "God's Little People",
    founder: {
      fullName: "Mar'Keda P. Gould",
      firstName: "Mar'Keda",
      role: "Co-founder",
      source: "God's Little People Learning Academy, About",
      url: "https://www.godslittlepeoplemicroschool.com/about",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "The About page says Mar'Keda and Jacqueline left their public school positions, opened an in-home childcare that ran more like a private preschool, and four months later found the opportunity to launch God's Little People.",
        source: "God's Little People Learning Academy, About",
        url: "https://www.godslittlepeoplemicroschool.com/about",
        readOn: "2026-11-23",
      },
      {
        fact: "Mar'Keda has over ten years as a special education and general education teacher in public schools and private preschools; Jacqueline is a licensed childcare director with over 30 years in early childhood education.",
        source: "God's Little People Learning Academy, About",
        url: "https://www.godslittlepeoplemicroschool.com/about",
        readOn: "2026-11-23",
      },
    ],
    hook: "The About page says Mar'Keda and Jacqueline left their public school positions, opened an in-home childcare that ran more like a private preschool, and four months later found the opportunity to launch God's Little People.",
    body: `Hi Mar'Keda,

I read your founding story on the God's Little People site. You and Jacqueline left public school, opened an in-home childcare that ran more like a little school, and four months later had the chance to start a microschool.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for God's Little People.

I'd like to hear how the first stretch has gone for you both.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Mar'Keda, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "littlepeople-t6v9",
    checkBeforeMailing: [
      "Find a mailing address: the site gives only \"Houston, Texas\", with no street or mailing address. The school began as an in-home childcare, so any address you find may be a home; don't use one. Check the Texas childcare licensing search or ask KaiPod.",
      "No podcast, interview or press about the founders turned up, so the letter opens on the founding story from the About page.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then the TEFA math as a why-now question, then who's asking and one proof number",
      subject: "TEFA at God's Little People",
      body: `Hi Mar'Keda,

I mailed you a handwritten note last week with a card for God's Little People.

Your About page says you accept TEFA and offer monthly billing. At $12,500 tuition, a TEFA family still owes about $2,026 on top of the $10,474 the state pays, so one student can mean two payers.

How are you handling the family's share?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so Mar'Keda can see it without clicking around",
      body: `Hi Mar'Keda,

In case it's easier to see than describe, I set up a version of MudKitchen for God's Little People and recorded a 60-second walkthrough: an inquiry landing in your admin inbox, enrollment in one checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where God's Little People is, with no pitch",
      where: "Instagram (@godslittlepeoplemicroschool, linked from the site) or Facebook",
      body: "Hi Mar'Keda, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. I like how much you focus on early reading.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Mar'Keda,

I also put together a one-page snapshot of what a family sees on your site today, from the first inquiry to paying tuition. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Mar'Keda,

I'll leave it here so I'm not cluttering your inbox. The God's Little People version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Merry Christmas to you and Jacqueline.

Julius`,
    },
  ],
};
