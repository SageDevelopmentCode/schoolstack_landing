import type { OutreachPlan } from "./types";

export const gatheredOakFarmOutreach: OutreachPlan = {
  slug: "gathered-oak-farm",
  schoolName: "Gathered Oak Farm",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Mindy",
    role: "Co-owner (with Nick Kinnier)",
    source:
      "Gathered Oak Farm home page, signed \"Mindy and Nick Kinnier, Gathered Oak Farm Owners\" under the welcome letter",
  },
  angle:
    "One real question: the Fall 2026 registration form asks each family whether they'll pay with charter funds and which charter, while electives are picked class by class. How does she keep track of what each charter has covered?",
  facts: [
    {
      fact: "The Fall 2026 Registration Google Form (the site's \"Enroll Now\" button) asks \"Is your child enrolled in a charter school?\", which charter, and \"Will you be using charter funds to pay for classes?\"",
      source: "Gathered Oak Farm Fall 2026 Registration (Google Form)",
      url: "https://docs.google.com/forms/d/16Qg7rmzA-ptID8SlhSJalwxoTvYpwHh_W9Vci3QElvw/viewform",
      readOn: "2026-11-22",
    },
    {
      fact: "The form asks families to fill out a separate form for each child and says emails with placements go out the first week of May; each section asks for a second choice and whether to join a waitlist",
      source: "Gathered Oak Farm Fall 2026 Registration (Google Form)",
      url: "https://docs.google.com/forms/d/16Qg7rmzA-ptID8SlhSJalwxoTvYpwHh_W9Vci3QElvw/viewform",
      readOn: "2026-11-22",
    },
    {
      fact: "Electives are picked class by class Monday to Thursday (Tiny Worlds, Herbalism, Bug Biographers, Theater and more); several options are marked \"FULL\" in the form, and families are asked to make sure times don't overlap",
      source: "Gathered Oak Farm Fall 2026 Registration (Google Form) and the linked Fall 2026 Elective Schedule & Descriptions Google Doc",
      url: "https://docs.google.com/forms/d/16Qg7rmzA-ptID8SlhSJalwxoTvYpwHh_W9Vci3QElvw/viewform",
      readOn: "2026-11-22",
    },
    {
      fact: "The programs page describes Monday Farm School, 3 Day Farm School, a 6th–8th grade program, Electives and Junior Farm School with no days, times or prices; its \"elective class descriptions HERE\" link opens a password-protected Guest Area",
      source: "Gathered Oak Farm Our Farm School Programs page",
      url: "https://www.gatheredoakfarm.com/ourprograms",
      readOn: "2026-11-22",
    },
    {
      fact: "A 2,000-square-foot barn is the indoor classroom and the 2.5-acre farm (garden, oak grove, chickens, goats, pigs) is the outdoor classroom, for Kindergarten through 8th grade",
      source: "Gathered Oak Farm home page",
      url: "https://www.gatheredoakfarm.com/",
      readOn: "2026-11-22",
    },
    {
      fact: "The 2026-2027 calendar is posted as one image: classes start August 24, the first semester ends December 17, last day of classes May 27",
      source: "Gathered Oak Farm Calendar page",
      url: "https://www.gatheredoakfarm.com/calendar",
      readOn: "2026-11-22",
    },
    {
      fact: "The 2026 Summer Camp Registration Google Form asks families to sign a separate Jotform titled \"2024-2025 Gathered Oak Farm Release Form\" and tick that they have",
      source: "Gathered Oak Farm Summer Camp page and its 2026 Summer Camp Registration form",
      url: "https://www.gatheredoakfarm.com/about-4",
      readOn: "2026-11-22",
    },
    {
      fact: "Google PageSpeed gave the home page a mobile score of 69, with the largest image taking about 7.4 seconds to appear",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.gatheredoakfarm.com%2F",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Mindy and Nick Kinnier both sign the home page as owners; the site doesn't say who handles registration and billing. Writing to Mindy; switch to Nick if you know he runs it. The site shows only a shared hello@ address.",
    "No tuition or payment method appears anywhere on the site or in the registration form. The demo's \"Programs from $490/semester\" line and its program times (Monday Farm School 9:00–1:00, middle school on Wednesdays) don't match the current form (Monday 8:30–12:15, middle school as a 3-day track). Check the demo before recording the Loom.",
    "The 6th–8th grade program meets off site; the elective list names a \"Reche Schoolhouse Campus\" alongside the Farm Campus. Don't pitch Several locations in one account unless you confirm two campuses.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). Confirm we'd set up charter-fund billing per family (which charter, what it covers, what the family owes). Charter vendor portals stay; don't pitch replacing them.",
    "We'd build: An ordered waitlist with automatic offers. Confirm before sending the snapshot.",
    "Instagram (@gatheredoakfarm) is linked from the site but wasn't opened (login wall); check it's active before the social step.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "3DE2ZALGb8eGJbcIfb8dUA",
    preparedOn: "2026-11-22",
    summary:
      "We read the 22 pages of gatheredoakfarm.com on Nov 22, 2026, plus the Fall 2026 registration form, the elective schedule it links and the summer camp forms.",
    pageSpeed: { mobileScore: 69, url: "https://www.gatheredoakfarm.com/", checkedOn: "2026-11-22" },
    toolStack: [
      {
        name: "Google Forms",
        usedFor: "Fall 2026 registration, one form per child",
        url: "https://docs.google.com/forms/d/16Qg7rmzA-ptID8SlhSJalwxoTvYpwHh_W9Vci3QElvw/viewform",
      },
      {
        name: "Google Docs",
        usedFor: "Elective schedule and descriptions",
        url: "https://docs.google.com/forms/d/16Qg7rmzA-ptID8SlhSJalwxoTvYpwHh_W9Vci3QElvw/viewform",
      },
      {
        name: "Jotform",
        usedFor: "Summer camp release form",
        url: "https://www.gatheredoakfarm.com/about-4",
      },
      {
        name: "Wix store checkout",
        usedFor: "Reading Roots parent workshop ($60)",
        url: "https://www.gatheredoakfarm.com/product-page/reading-roots-parent-workshop",
      },
      {
        name: "Contact form",
        usedFor: "Questions before registering",
        url: "https://www.gatheredoakfarm.com/contact",
      },
    ],
    observations: [
      {
        area: "pay",
        gap: "The site doesn't say what programs cost or how families pay",
        saw: "No page lists tuition, and the registration form doesn't either. The form asks whether the child is in a charter school, which one, and \"Will you be using charter funds to pay for classes?\" The elective schedule adds a $25 material fee for some classes.",
        impact: "Families register before they know the price, and each family's mix of charter funds, electives and material fees has to be worked out one by one afterwards.",
        source: "Gathered Oak Farm Fall 2026 Registration (Google Form)",
        url: "https://docs.google.com/forms/d/16Qg7rmzA-ptID8SlhSJalwxoTvYpwHh_W9Vci3QElvw/viewform",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing that records which charter each family uses and what it covers, with a billing page where families see what's paid and anything they owe themselves.",
        },
      },
      {
        area: "find",
        gap: "Program days and times are only in the registration form",
        saw: "The programs page describes Monday Farm School, 3 Day Farm School, the 6th–8th grade program, Electives and Junior Farm School, but gives no days, hours or grades per class. Those appear as answer options inside the Google Form, such as \"Three Day Academic Track and Farm School T-Th 8:15-1:15\".",
        impact: "A parent has to open the registration form to learn whether a program fits their week.",
        source: "Gathered Oak Farm Our Farm School Programs page",
        url: "https://www.gatheredoakfarm.com/ourprograms",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "The site we build lists each program with its days, hours, grades and price, and shows Open, Waitlist or Full from the same program families register into.",
        },
      },
      {
        area: "find",
        gap: "The elective descriptions link asks for a password",
        saw: "The programs page says \"Check elective class descriptions HERE\". The link opens a Guest Area that asks for a password. The descriptions families can read are in a Google Doc linked from inside the registration form.",
        impact: "A family browsing the site can't see what the electives are until they start registering.",
        source: "Gathered Oak Farm Our Farm School Programs page",
        url: "https://www.gatheredoakfarm.com/ourprograms",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build gives each elective its own entry with grades, time and any material fee, open to every visitor.",
        },
      },
      {
        area: "apply",
        gap: "Each child needs a separate registration form",
        saw: "The Fall 2026 form says to fill out a separate form for each child. Each one asks again for both parents' names, emails and phones, the home address, charter details, emergency contacts and the pickup list. Placements are emailed the first week of May.",
        impact: "A family with two or three children types the same family details two or three times, then waits for an email to learn where each child landed.",
        source: "Gathered Oak Farm Fall 2026 Registration (Google Form)",
        url: "https://docs.google.com/forms/d/16Qg7rmzA-ptID8SlhSJalwxoTvYpwHh_W9Vci3QElvw/viewform",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families apply once with every child on one application, and each child lands in your admin inbox with their program choices and stage.",
        },
      },
      {
        area: "apply",
        gap: "Full electives are marked by hand in the form",
        saw: "Several elective options read \"FULL - Bug Biographers … - FULL\". Families may still pick a full class to join its waitlist, add a second choice, and are asked to make sure none of their times overlap.",
        impact: "Each full class has to be edited into the form by hand, and families sort out time clashes and waitlists themselves.",
        source: "Gathered Oak Farm Fall 2026 Registration (Google Form)",
        url: "https://docs.google.com/forms/d/16Qg7rmzA-ptID8SlhSJalwxoTvYpwHh_W9Vci3QElvw/viewform",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "waitlist-queue"],
          text: "Each elective would have a set number of seats that shows Full on its own, with a waitlist in order and a seat offered to the next family when one opens.",
        },
      },
      {
        area: "enroll",
        gap: "Nothing is signed during fall registration",
        saw: "The Fall 2026 form collects emergency contacts, the pickup list, allergies and medication, but has no agreement or signature, and no page says what follows placement. For summer camp, the form sends families to a separate Jotform titled \"2024-2025 Gathered Oak Farm Release Form\" and asks them to tick that they signed it.",
        impact: "Any agreement or release has to be sent separately, and families can't see ahead of time what they'll be asked to sign.",
        source: "Gathered Oak Farm Summer Camp page and its 2026 Summer Camp Registration form",
        url: "https://www.gatheredoakfarm.com/about-4",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements"],
          text: "Placed families get one checklist with the agreement and release signed online next to their health and pickup details, with reminders until it's done.",
        },
      },
      {
        area: "updates",
        gap: "The school calendar is one picture",
        saw: "The Calendar page shows the 2026-2027 calendar as a single image: classes start August 24, Thanksgiving break November 23–27, the semester ends December 17. Updates otherwise come through Instagram and a newsletter sign-up.",
        impact: "Families can't tap a date into their own calendar, and any change means making and uploading a new image.",
        source: "Gathered Oak Farm Calendar page",
        url: "https://www.gatheredoakfarm.com/calendar",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal", "mobile-app"],
          text: "School dates live on a calendar in each family's login on the web and the iPhone app, updated in one place.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow to appear on a phone",
        saw: "Google PageSpeed gave the home page a mobile score of 69, with the main image taking about 7.4 seconds to show.",
        impact: "A parent opening the site from a phone waits several seconds before seeing the farm.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.gatheredoakfarm.com%2F",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with images sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Gathered Oak",
    founder: {
      fullName: "Mindy Kinnier",
      firstName: "Mindy",
      role: "Co-owner",
      source: "Gathered Oak Farm home page (welcome letter signed \"Mindy and Nick Kinnier, Gathered Oak Farm Owners\")",
      url: "https://www.gatheredoakfarm.com/",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "On the Gathered Oak Farm home page, Mindy and Nick Kinnier write that the 2,000-square-foot barn is the indoor classroom and the 2.5-acre farm around it, with a garden, an oak grove, chickens, goats and pigs, is the outdoor classroom.",
        source: "Gathered Oak Farm home page (welcome letter)",
        url: "https://www.gatheredoakfarm.com/",
        readOn: "2026-11-22",
      },
      {
        fact: "Programs include Monday Farm School, a 3 Day Farm School, Junior Farm School for TK–1st, and a 3-day 6th–8th grade program that meets off site within 10 minutes of the farm, plus afternoon electives Monday through Thursday.",
        source: "Gathered Oak Farm, Our Farm School Programs",
        url: "https://www.gatheredoakfarm.com/ourprograms",
        readOn: "2026-11-22",
      },
    ],
    hook: "On the Gathered Oak Farm home page, Mindy and Nick Kinnier write that the 2,000-square-foot barn is the indoor classroom and the 2.5-acre farm around it, with a garden, an oak grove, chickens, goats and pigs, is the outdoor classroom.",
    body: `Hi Mindy,

I read the welcome letter on your site. I liked that the barn is the indoor classroom and the 2.5 acres around it, with the oak grove, the goats and the pigs, are the outdoor one.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Gathered Oak.

I'd like to hear how the farm school got started.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Mindy, a note from an outdoor microschool in Round Rock, Texas. J",
    shortCode: "gatheredoak-v44e",
    checkBeforeMailing: [
      "Find a mailing address: the home and Contact pages give only a road name in Fallbrook, CA 92028 (no street number), and the school runs on the owners' farm, so it may be a home; nothing is stored. No PO box or separate mailing address is published. Leads: ask by email, or check California's Private School Affidavit directory for a filed address.",
      "No founding story, podcast or interview found (there's no About page; /about returns 404), so the letter opens on a school fact from the home page welcome letter that Mindy and Nick wrote.",
      "The letter goes to Mindy (the plan's recipient). Nick Kinnier co-signed the welcome letter as co-owner; address it to both if you'd rather.",
      "The CRM calls the school Fallbrook Farm School; the site and the letter use Gathered Oak Farm.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about charter funds alongside class-by-class electives, then who's asking and one proof number",
      subject: "charter funds at Gathered Oak",
      body: `Hi Mindy,

I mailed you a handwritten note last week with a card for Gathered Oak.

I was reading your Fall 2026 registration form. Families fill in one form per child, pick electives class by class, from Herbalism to Bug Biographers, and say whether they'll pay with charter funds and through which charter.

With families coming through different charters, how do you keep track of what each one has covered alongside the electives each child picked?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so she can see it without clicking around",
      body: `Hi Mindy,

In case it's easier to see than describe, I set up a version of MudKitchen for Gathered Oak and recorded a 60-second walkthrough: a family's registration landing in your admin inbox, the enrollment checklist after placement, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Gathered Oak is, with no pitch",
      where: "Instagram (@gatheredoakfarm, linked from the site)",
      body: "Hi Mindy and Nick, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Love that the barn is the classroom and the oak grove is part of the day.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Mindy,

I also put together a one-page snapshot of what a family sees on your site today, from finding a program to registering and paying. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Mindy,

I'll leave it here so I'm not cluttering your inbox. The Gathered Oak version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Enjoy the rest of the semester on the farm.

Julius`,
    },
  ],
};
