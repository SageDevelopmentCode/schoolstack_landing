import type { OutreachPlan } from "./types";

export const downToEarthHomeschoolOutreach: OutreachPlan = {
  slug: "down-to-earth-homeschool",
  schoolName: "Down to Earth Co-op (Down to Earth Homeschool)",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Elena",
    role: "Director & Lead Instructor (Elena Mazzella), co-director with Kelsey Morosini",
    source: "Down to Earth Homeschool home page, Meet Our Team (\"Elena Mazzella: Director & Lead Instructor\")",
  },
  angle:
    "One real question: 2026/27 tuition is $3,500 per child in three payments, paid by check, cash or Step Up direct pay in the EMA, and families who pay the co-op directly get an invoice for Step Up only after the final payment. How do they keep track of who's paid through the EMA and who's waiting on an invoice?",
  facts: [
    {
      fact: "2026/2027 tuition is $3,500 per child: a $1,000 enrollment fee due on acceptance (by April 15, 2026), $1,500 due August 15, 2026 and $1,000 due November 15, 2026; late fees up to $50 a week",
      source: "Down to Earth Homeschool, 2026/2027 K-8 Program",
      url: "https://downtoearthhomeschool.org/2026%2F2027-k-8-program-1",
      readOn: "2026-11-22",
    },
    {
      fact: "Families pay by cash or check, by Step Up direct pay in the EMA marketplace, or by card or Zelle with a convenience fee of up to $125; families who pay the co-op directly get an invoice for Step Up reimbursement after the final payment",
      source: "Down to Earth Homeschool, 2026/2027 K-8 Program and FAQ",
      url: "https://downtoearthhomeschool.org/2026%2F2027-k-8-program-1",
      readOn: "2026-11-22",
    },
    {
      fact: "The program runs 9:00 to 3:00 on 28 Mondays at the John Trudel Community Center in Dan Witt Park, Lighthouse Point; moms meet every Friday for park days and field trips, including through the summer, and monthly participation in Friday gatherings is required",
      source: "Down to Earth Homeschool home page and 2026/2027 K-8 Program",
      url: "https://downtoearthhomeschool.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "The membership application is a Jotform; families who seem a good fit are contacted by email or text for an interview at a local park; after acceptance they sign a liability waiver, a photo/video release and the program policies",
      source: "Down to Earth Homeschool, 2026/2027 K-8 Program and the Membership Application 2026-27 (Jotform)",
      url: "https://downtoearthhomeschool.org/2026%2F2027-k-8-program-1",
      readOn: "2026-11-22",
    },
    {
      fact: "The 2026/2027 page says the program runs \"28 Mondays beginning September 14th, 2026 and ending May 17th, 2026\"; the 2025/2026 page ($2,800 per child) is still in the menu",
      source: "Down to Earth Homeschool, 2026/2027 K-8 Program and 2025/2026 Program",
      url: "https://downtoearthhomeschool.org/2026%2F2027-k-8-program-1",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "Step Up direct pay runs through Step Up's EMA marketplace. MudKitchen works alongside it; don't pitch replacing it.",
    "Down to Earth is a one-day-a-week homeschool co-op (not a school), run by two directors. Keep the pitch small: applications, the three payments and family messages.",
    "Don't promise families they'd avoid a card fee: card payments through Stripe carry fees too, depending on how the co-op sets it up.",
    "Writing to Elena Mazzella; Kelsey Morosini is the other director. The FAQ spells Elena's surname \"Mazzelladibosco\".",
    "Instagram (@downtoearthhomeschool) and Facebook (downtoearthcoop) are linked from the site but weren't opened; check one is active before the social step.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "_gIZKjXP0cMp9cywnpxBTA",
    preparedOn: "2026-11-22",
    summary:
      "We read all 9 pages of downtoearthhomeschool.org on Nov 22, 2026, plus the 2026-27 membership application.",
    pageSpeed: { mobileScore: 83, url: "https://downtoearthhomeschool.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Jotform",
        usedFor: "Membership application",
        url: "https://downtoearthhomeschool.org/2026%2F2027-k-8-program-1",
      },
      {
        name: "Zelle",
        usedFor: "Digital tuition payments (with a convenience fee)",
        url: "https://downtoearthhomeschool.org/2026%2F2027-k-8-program-1",
      },
      {
        name: "Square",
        usedFor: "Uniform shirt purchases",
        url: "https://downtoearthhomeschool.org/shop",
      },
      {
        name: "WhatsApp",
        usedFor: "Questions to the directors",
        url: "https://downtoearthhomeschool.org/connect-1",
      },
    ],
    observations: [
      {
        area: "find",
        gap: "Last year's tuition page is still in the menu",
        saw: "The menu lists both \"2026/2027 K-8 Program\" ($3,500 per child) and \"2025/2026 Program\" ($2,800 per child, with payments due April 1, May 1 and July 1, 2025).",
        impact: "A new family can land on last year's page and plan around the wrong price and dates.",
        source: "Down to Earth Homeschool, 2025/2026 Program",
        url: "https://downtoearthhomeschool.org/2025%2F2026-program",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with only the current year's program and tuition in the menu.",
        },
      },
      {
        area: "tour",
        gap: "Interviews are arranged by email or text",
        saw: "Families who \"appear to be a good fit will be contacted by email or text to schedule a brief, informal interview\" at a local park. Applications aren't approved until the interview happens.",
        impact: "Each acceptance waits on a few messages back and forth to find a time that works for two directors and a family.",
        source: "Down to Earth Homeschool, 2026/2027 K-8 Program",
        url: "https://downtoearthhomeschool.org/2026%2F2027-k-8-program-1",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families you invite pick an interview time from the slots you open, and it shows on their application.",
        },
      },
      {
        area: "enroll",
        gap: "Three documents to sign after acceptance",
        saw: "The application says that upon acceptance, parents \"will be asked to review and sign a liability waiver, photo/video release form, and our program policies,\" and the $1,000 enrollment fee is due on acceptance.",
        impact: "Each accepted family has three forms and a $1,000 payment to finish before their spot is held.",
        source: "Down to Earth Co-op Membership Application 2026-27 (Jotform)",
        url: "https://downtoearthhomeschool.org/2026%2F2027-k-8-program-1",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: sign the waiver, photo release and policies and pay the enrollment fee online, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "Step Up families get their invoice only after the last payment",
        saw: "Families can pay by check, cash, Step Up direct pay in the EMA, or card or Zelle with a convenience fee of up to $125. Families who pay the co-op directly get \"an invoice … after final payment is received\" to submit to Step Up.",
        impact: "A family paying directly can't claim Step Up reimbursement until after their last payment in November.",
        source: "Down to Earth Homeschool, 2026/2027 K-8 Program and FAQ",
        url: "https://downtoearthhomeschool.org/2026%2F2027-k-8-program-1",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "late-fees-reminders", "card-and-ach"],
          text: "Each family's billing page would show the three installments with due-date reminders and a paid invoice after every payment, ready for Step Up. We'd mark which installments Step Up paid through the EMA.",
        },
      },
      {
        area: "updates",
        gap: "Questions go to WhatsApp or a Gmail address",
        saw: "The Connect page offers \"Message us on WhatsApp\" and a Gmail address. The program page mentions an online co-op communication space with an event calendar, but doesn't say where it is.",
        impact: "Messages to the directors land in personal apps alongside everything else, and new families don't know where the calendar lives until they join.",
        source: "Down to Earth Homeschool, Connect and 2026/2027 K-8 Program",
        url: "https://downtoearthhomeschool.org/connect-1",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["messaging", "calendar", "parent-portal", "mobile-app"],
          text: "Families message the directors, see Monday and Friday plans on one calendar, and get announcements in their own login on the web and the iPhone app.",
        },
      },
      {
        area: "website",
        gap: "This year's end date reads May 2026",
        saw: "The 2026/2027 page says the program runs \"28 Mondays beginning September 14th, 2026 and ending May 17th, 2026\". The banner on every page still says \"Applications for 2026/2027 are now open!\", and the Opportunities page recruits assistants for 2025/26.",
        impact: "A family planning the year sees an end date before the start date, and can't tell whether 2026/27 applications are still open.",
        source: "Down to Earth Homeschool, 2026/2027 K-8 Program and Opportunities",
        url: "https://downtoearthhomeschool.org/2026%2F2027-k-8-program-1",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We keep dates, banners and openings current for you each year.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Down to Earth",
    founder: {
      fullName: "Elena Mazzella",
      firstName: "Elena",
      role: "Director & Lead Instructor",
      source: "Down to Earth Homeschool home page, Meet Our Team",
      url: "https://downtoearthhomeschool.org/",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Down to Earth's home page says the program is built on community: alongside the Monday program, moms meet every Friday for park days and field trips, including through the summer when the Monday program is on break.",
        source: "Down to Earth Homeschool home page",
        url: "https://downtoearthhomeschool.org/",
        readOn: "2026-11-22",
      },
      {
        fact: "Elena's bio says her teaching style emphasizes curiosity, thoughtful questioning and a deep love for learning, and that she believes homeschooling is a calling from God.",
        source: "Down to Earth Homeschool home page, Meet Our Team",
        url: "https://downtoearthhomeschool.org/",
        readOn: "2026-11-22",
      },
    ],
    hook: "Down to Earth's home page says the program is built on community: alongside the Monday program, moms meet every Friday for park days and field trips, including through the summer when the Monday program is on break.",
    body: `Hi Elena,

I read about Down to Earth on your site. I liked that the Monday program is only half of it, and that moms meet every Friday for park days and field trips, even through the summer when Mondays are on break.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our enrollment and tuition, and it's a big part of how we grew. Now we offer it to other microschools too.

I'd like to hear how you and Kelsey keep a co-op that close. A text is plenty.

Julius`,
    postscript: "The card inside has a version of Down to Earth I set up, plus a parent's-eye look at your enrollment.",
    stickyNote: "Elena, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "downtoearth-w5n2",
    checkBeforeMailing: [
      "Find a mailing address: the site lists only the Monday program location (the John Trudel Community Center in Dan Witt Park, a city facility), a Gmail address and WhatsApp. No business mailing address is published, and the directors' homes must not be used.",
      "No podcast, interview or press about the directors turned up, so the letter opens on the co-op's Friday park days from the home page.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about tracking Step Up and direct payments, then who's asking and one proof number",
      subject: "Step Up at Down to Earth",
      body: `Hi Elena,

I mailed you a handwritten note last week with a card for Down to Earth.

I was reading your 2026/2027 program page. Families pay $3,500 in three installments by check, cash or Step Up direct pay, and anyone who pays you directly gets an invoice for Step Up after the final payment.

How do you keep track of who's paid through the EMA and who's waiting on an invoice?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the enrollment and tuition system I built for it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so Elena can see it without clicking around",
      body: `Hi Elena,

In case it's easier to see than describe, I set up a version of MudKitchen for Down to Earth and recorded a 60-second walkthrough: an application landing in your admin inbox, the waiver and enrollment fee in one checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Down to Earth is, with no pitch",
      where: "Instagram (@downtoearthhomeschool, linked from the site) or Facebook (downtoearthcoop)",
      body: "Hi Elena, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. I like that your Friday park days keep going all summer.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Elena,

I also put together a one-page snapshot of what a family sees on your site today, from applying to paying each installment. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Elena,

I'll leave it here so I'm not cluttering your inbox. The Down to Earth version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Enjoy the Christmas break.

Julius`,
    },
  ],
};
