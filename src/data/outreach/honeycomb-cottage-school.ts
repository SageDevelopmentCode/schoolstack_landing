import type { OutreachPlan } from "./types";

export const honeycombCottageSchoolOutreach: OutreachPlan = {
  slug: "honeycomb-cottage-school",
  schoolName: "Honeycomb Cottage School",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Honeycomb team",
    role: "School leadership (no director is named on the site)",
    source:
      "Honeycomb Cottage School About page: the school was \"handed over to a number of us in 2022\" and is governed by a Board, teachers and parent volunteers; no name is given",
  },
  angle:
    "Why now: Honeycomb is becoming a UFA and Carson Smith vendor in 2026/27, while families today pay $320 a month directly and get reimbursed through OpenEd or Utah Fits All. Will some families' tuition come from the program and others' from the family?",
  facts: [
    {
      fact: "Tuition is $320 a month per child, due on the 1st, September 2026 through May 2027; a $125 registration and t-shirt fee holds a roster spot and a $225 supply and materials fee is due before September 1",
      source: "Honeycomb Cottage School Classes page (\"Our Class Offerings & Costs for 26/27\")",
      url: "https://www.honeycombcottageschool.com/classes",
      readOn: "2026-11-22",
    },
    {
      fact: "\"Tuition and fees (except registration/t-shirt fee) may be reimbursed with OpenEd and Utah Fits all Scholarship Funds after families pay the school directly. We are becoming a UFA and Carston Smith Vendor in the 2026/27 school year.\"",
      source: "Honeycomb Cottage School Classes page",
      url: "https://www.honeycombcottageschool.com/classes",
      readOn: "2026-11-22",
    },
    {
      fact: "The site's Plans & Pricing and Book Online pages still sell \"Monthly Tuition $240, Valid for 9 months\" labelled \"September 2024-May 2025 Tuition\"",
      source: "Honeycomb Cottage School Plans & Pricing page",
      url: "https://www.honeycombcottageschool.com/plans-pricing",
      readOn: "2026-11-22",
    },
    {
      fact: "Enrollment starts with a Google Forms Registration Questionnaire; most classes are full (8–14 children), there's a waiting list, and families \"may not receive a response right away if all classes are full\"",
      source: "Honeycomb Cottage School Enrollment page",
      url: "https://www.honeycombcottageschool.com/enrollment",
      readOn: "2026-11-22",
    },
    {
      fact: "Honeycomb is the successor to Abella Cottage School, which Julene Humes started and ran in Utah Valley for over 21 years before handing it to a group in 2022",
      source: "Honeycomb Cottage School About page",
      url: "https://www.honeycombcottageschool.com/about",
      readOn: "2026-11-22",
    },
    {
      fact: "The 2026/27 school year runs Tuesday to Thursday, Preschool through 7th grade, with a weekly Home Lesson folder for grades families; the 7th grade meets at a separate Traverse Mountain location",
      source: "Honeycomb Cottage School Philosophy and Classes pages",
      url: "https://www.honeycombcottageschool.com/philosophy",
      readOn: "2026-11-22",
    },
    {
      fact: "Google PageSpeed gave the home page a mobile score of 75, with the main image taking about 7.3 seconds to appear",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.honeycombcottageschool.com%2F",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Find a name before sending: the site names no director, only \"Mrs. McDonald\" (7th grade teacher) and Julene Humes (founder of Abella, who still guides them). A CFE Fund listing reportedly names a Susan Merle McDonald for a \"Honeycomb Cottage Homeschooling Cooperative\", but the page wouldn't load, so it's unconfirmed. Swap \"Honeycomb team\" in every step for a first name once you have one.",
    "The site lists only a contact form and a phone number; there's no email address. Use the contact form or find an address on their social pages.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). Confirm we'd set up UFA and Carson Smith billing per family before sending the snapshot.",
    "We'd build: An ordered waitlist with automatic offers. Confirm before sending the snapshot.",
    "The site spells it \"Carston Smith\"; the emails use the program's real name, Carson Smith.",
    "No Instagram or Facebook is linked from the site; find their page before the social step, or skip it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "OUuUxbELp1H-CdkiYtENWg",
    preparedOn: "2026-11-22",
    summary:
      "We read the 22 pages of honeycombcottageschool.com on Nov 22, 2026, plus the Registration Questionnaire and the 2026–2027 school calendar.",
    pageSpeed: { mobileScore: 75, url: "https://www.honeycombcottageschool.com/", checkedOn: "2026-11-22" },
    toolStack: [
      {
        name: "Google Forms",
        usedFor: "Registration Questionnaire",
        url: "https://www.honeycombcottageschool.com/enrollment",
      },
      {
        name: "Wix Pricing Plans",
        usedFor: "Monthly tuition checkout (still 2024–25)",
        url: "https://www.honeycombcottageschool.com/plans-pricing",
      },
      {
        name: "Wix Events",
        usedFor: "Festival RSVPs",
        url: "https://www.honeycombcottageschool.com/festivals-events",
      },
      {
        name: "Calendar image",
        usedFor: "2026–2027 school calendar",
        url: "https://www.honeycombcottageschool.com/calendar",
      },
      {
        name: "Contact form",
        usedFor: "Questions before enrolling",
        url: "https://www.honeycombcottageschool.com/contact-8",
      },
    ],
    observations: [
      {
        area: "pay",
        gap: "The online tuition checkout still sells last year's price",
        saw: "The Plans & Pricing page offers \"Monthly Tuition $240, Every month, Valid for 9 months\" with a Buy Now button, labelled \"September 2024-May 2025 Tuition\". The Book Online page shows the same $240 service. The Classes page says 2026/27 tuition is $320 a month.",
        impact: "A family who lands on the checkout sees two different prices, and could sign up for a plan that no longer matches what they owe.",
        source: "Honeycomb Cottage School Plans & Pricing and Classes pages",
        url: "https://www.honeycombcottageschool.com/plans-pricing",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "autopay", "card-and-ach"],
          text: "Each family gets a billing page with this year's $320 tuition due on the 1st, autopay by card or bank, and every past payment in one list.",
        },
      },
      {
        area: "pay",
        gap: "Families pay first and claim UFA or OpenEd money back later",
        saw: "The Classes page says tuition and fees \"may be reimbursed with OpenEd and Utah Fits all Scholarship Funds after families pay the school directly\", and that Honeycomb is \"becoming a UFA and Carston Smith Vendor in the 2026/27 school year.\"",
        impact: "Families front $320 a month plus fees and file for reimbursement themselves. Once Honeycomb is a vendor, some families' tuition may come from the program and some from the family, and each share has to be tracked.",
        source: "Honeycomb Cottage School Classes page",
        url: "https://www.honeycombcottageschool.com/classes",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing that records which families pay through UFA or Carson Smith and what each covers, so families only see and pay their own share.",
        },
      },
      {
        area: "apply",
        gap: "Families on the waiting list don't know where they stand",
        saw: "The Enrollment page says most classes are full and asks families to fill in a Google Forms Registration Questionnaire. It warns: \"you may not receive a response right away if all classes are full.\" The form asks for each child's name, birth date and grade in one text box.",
        impact: "A family can wait months without knowing whether they're first or fifth in line, and someone at the school keeps the order by hand.",
        source: "Honeycomb Cottage School Enrollment page and Registration Questionnaire",
        url: "https://www.honeycombcottageschool.com/enrollment",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["online-application", "admissions-pipeline", "waitlist-queue"],
          text: "Each questionnaire would land in one admin inbox by class, with an ordered waiting list per class and the next family offered a spot when one opens.",
        },
      },
      {
        area: "enroll",
        gap: "The site doesn't say how the one-year commitment and fees are handled",
        saw: "The Classes page says enrollment is a one-year commitment with a six-week trial, a $125 registration and t-shirt fee holds a roster spot, a $225 supply and materials fee is due before September 1, and a yearbook fee is requested in May. No page says where families sign or pay these.",
        impact: "Families learn the rules from a long page and then wait to be told how to commit and pay each fee.",
        source: "Honeycomb Cottage School Classes page",
        url: "https://www.honeycombcottageschool.com/classes",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families sign the one-year commitment and pay the registration and materials fees in one online checklist, with reminders until it's done.",
        },
      },
      {
        area: "updates",
        gap: "The school calendar is one picture",
        saw: "The Calendar page shows the 2026–2027 School Calendar as a single image, with festivals, breaks and parent education nights listed down the side.",
        impact: "Families can't tap a date into their own calendar, and any change means making and uploading a new image.",
        source: "Honeycomb Cottage School Calendar page",
        url: "https://www.honeycombcottageschool.com/calendar",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal", "mobile-app"],
          text: "School days, festivals and parent nights live on one calendar in each family's login on the web and the iPhone app, updated in one place.",
        },
      },
      {
        area: "updates",
        gap: "The festival pages still show 2024–25 dates",
        saw: "Festivals & Events lists Martinmas on Thu, Nov 07 at Highland Glen Park, and its page shows Nov 07, 2024 with \"Registration is Closed\". The 2026–2027 calendar puts Martinmas on November 11.",
        impact: "A new family reading the festivals page sees last year's dates and closed sign-ups.",
        source: "Honeycomb Cottage School Festivals & Events page",
        url: "https://www.honeycombcottageschool.com/festivals-events",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with each year's festival dates in place before the school year starts.",
        },
      },
      {
        area: "website",
        gap: "The home page has only a welcome line and four links",
        saw: "The home page shows \"Welcome to Honeycomb Cottage School\", four buttons (Our Story & Team, Our Philosophy, Our Classes & Cost, How to Enroll), the town and a phone number, about 48 words in all. The footer reads Copyright 2024.",
        impact: "A parent arriving from a search has to click through before learning it's a Waldorf-inspired hybrid homeschool, Tuesday to Thursday, for Preschool to 7th grade.",
        source: "Honeycomb Cottage School home page",
        url: "https://www.honeycombcottageschool.com/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build opens with what Honeycomb is, the three-day week, each class and this year's tuition on the first screen.",
        },
      },
      {
        area: "website",
        gap: "The main image is slow to appear on a phone",
        saw: "Google PageSpeed gave the home page a mobile score of 75, with the main image taking about 7.3 seconds to show.",
        impact: "A parent opening the site from a phone waits several seconds before seeing anything.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.honeycombcottageschool.com%2F",
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
    shortSchoolName: "Honeycomb",
    founder: {
      fullName: "Honeycomb Cottage School team",
      firstName: "Honeycomb team",
      role: "School leadership (Board, teachers and parent volunteers)",
      source: "Honeycomb Cottage School About page",
      url: "https://www.honeycombcottageschool.com/about",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Honeycomb's About page says the school is the daughters of Abella Cottage School, which Julene Humes started and cultivated in Utah Valley for over 21 years before handing it to a group in 2022 who continue its legacy.",
        source: "Honeycomb Cottage School About page",
        url: "https://www.honeycombcottageschool.com/about",
        readOn: "2026-11-22",
      },
      {
        fact: "Honeycomb describes its governance as three-fold: the Board as the head, teachers and assistants as the heart, and parent volunteers as the hands.",
        source: "Honeycomb Cottage School About page",
        url: "https://www.honeycombcottageschool.com/about",
        readOn: "2026-11-22",
      },
    ],
    hook: "Honeycomb's About page says the school is the daughters of Abella Cottage School, which Julene Humes started and cultivated in Utah Valley for over 21 years before handing it to a group in 2022 who continue its legacy.",
    body: `Hi Honeycomb team,

Rachael Sparhawk, who founded Rooted Meadows in Rigby, Idaho, mentioned Honeycomb to me. I read your About page and liked that you call yourselves the daughters of Abella Cottage School, keeping Julene's school going since 2022.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our enrollment and tuition, and it's a big part of how we grew. Now we offer it to other microschools too.

I'd like to hear what it was like taking over a school with 21 years behind it. A text is plenty.

Julius`,
    postscript: "The card inside has a version of Honeycomb I set up, plus a parent's-eye look at your enrollment.",
    stickyNote: "Honeycomb team, a note from an outdoor microschool in Round Rock, Texas. J",
    shortCode: "honeycomb-k4m8",
    checkBeforeMailing: [
      "Opens with Rachael Sparhawk's referral (Rooted Meadows); confirm she's happy to be named.",
      "Find a mailing address: the site lists only \"Lehi/Traverse Mtn, UT\" and says the school runs from a private residence; the only street address given is the 7th grade's Traverse Mountain location, which looks like a home, so nothing is stored. Leads: ask through the contact form, or check their UFA vendor listing once it's published.",
      "No director or founder is named on the site, so the letter is addressed to the team and opens on the school's founding story from the About page. Swap the greeting for a first name if you find one.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then why now: becoming a UFA and Carson Smith vendor while families pay first and get reimbursed",
      subject: "UFA vendor status at Honeycomb",
      body: `Hi Honeycomb team,

I mailed you a handwritten note last week with a card for Honeycomb.

Your Classes page says families pay the $320 monthly tuition to you and get reimbursed through OpenEd or Utah Fits All, and that Honeycomb is becoming a UFA and Carson Smith vendor this year.

Once that goes through, will some families' tuition come from the program while others still pay you directly?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the enrollment and tuition system I built for it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they can see it without clicking around",
      body: `Hi Honeycomb team,

In case it's easier to see than describe, I set up a version of MudKitchen for Honeycomb and recorded a 60-second walkthrough: a registration questionnaire landing in your admin inbox, the one-year commitment and fees in one checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Honeycomb is, with no pitch",
      where: "Facebook or Instagram (none linked from the site; find their page first)",
      body: "Hi, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Love that Honeycomb opens each year with a Sunflower Bridge Ceremony.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Honeycomb team,

I also put together a one-page snapshot of what a family sees on your site today, from the questionnaire and waiting list to paying tuition. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Honeycomb team,

I'll leave it here so I'm not cluttering your inbox. The Honeycomb version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Enjoy the festivals this winter.

Julius`,
    },
  ],
};
