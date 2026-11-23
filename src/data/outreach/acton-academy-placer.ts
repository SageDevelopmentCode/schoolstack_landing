import type { OutreachPlan } from "./types";

export const actonAcademyPlacerOutreach: OutreachPlan = {
  slug: "acton-academy-placer",
  schoolName: "Acton Academy Placer",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Kelsy",
    role: "Co-founder / President",
    source: "Acton Placer The Story page (Kelsy Blyakherov, Co-founder / President); she also signs each campus contact form, and step 1 on the Enrollment page is a 15-minute call with the President",
  },
  angle: "Proof + their process: the three enrollment steps on their Enrollment page, across three campuses and four studios",
  facts: [
    {
      fact: "Enrollment is \"a Simple 3 Step Process\": learn more (Deep Dive page, an in-person or virtual Parent Info Session, a 15-min call with the President, connect with a current parent), schedule a Family Meetup on campus, then schedule shadow days or enrollment and lock in a spot",
      source: "Acton Placer Enrollment",
      url: "https://actonplacer.com/enrollment-5862-5166",
      readOn: "2026-11-22",
    },
    {
      fact: "Tuition is $11,500 for TK–8th and $13,500 for 9th–12th",
      source: "Acton Placer Enrollment and FAQ",
      url: "https://actonplacer.com/enrollment-5862-5166",
      readOn: "2026-11-22",
    },
    {
      fact: "Three campuses (Roseville, Sacramento near Arden Arcade/Carmichael, Old Town Rocklin) and four studios: Spark 4–8 (must be TK to enter), Threshold 7–11, Discovery 11–14, Launchpad 14–18; eleven-month calendar",
      source: "Acton Placer FAQ",
      url: "https://actonplacer.com/faq-5143-3496",
      readOn: "2026-11-22",
    },
    {
      fact: "No tours during school hours; Parent Info Sessions and campus tours are scheduled as part of an audition process that starts from Apply Now",
      source: "Acton Placer FAQ",
      url: "https://actonplacer.com/faq-5143-3496",
      readOn: "2026-11-22",
    },
    {
      fact: "Apply Now is a survey \"to join the waitlist or start the audition process\": parent contact, up to five children, then five questions about the family",
      source: "Acton Placer Apply Now",
      url: "https://actonplacer.com/apply-445902",
      readOn: "2026-11-22",
    },
    {
      fact: "The Academic Calendar page shows the 2025–26 calendar as an image (first day Sept 8, 2025, final day July 2, 2026)",
      source: "Acton Placer Academic Calendar",
      url: "https://actonplacer.com/academic-calendar-3039-3393",
      readOn: "2026-11-22",
    },
    {
      fact: "Children's Business Fair: children develop, price and sell a product with no coaching from adults during the fair",
      source: "Acton Placer Children's Business Fair",
      url: "https://actonplacer.com/childrens-business-fair-8174-9271",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm Kelsy is the right person to write to (the Heads of Program are listed on each campus page).",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "The FAQ tells families to click a message icon at the bottom right; none loaded when we checked on Nov 22. Open the FAQ on a phone and confirm before the snapshot goes out.",
    "Open the Academic Calendar page and confirm it still shows 2025–26 before the snapshot goes out.",
    "No school Instagram or Facebook account was found; send the social note on LinkedIn only if Kelsy has a profile there, otherwise skip it.",
  ],
  snapshot: {
    token: "cV_DRVgiEX1rGpckJiKj2w",
    preparedOn: "2026-11-22",
    summary: "We read 17 pages of actonplacer.com on Nov 22, 2026, from Enrollment, Apply Now and the FAQ to all three campus pages and the Academic Calendar.",
    pageSpeed: { mobileScore: 95, url: "https://actonplacer.com/", checkedOn: "2026-11-22" },
    observations: [
      {
        area: "find",
        gap: "The Hybrid Program has no days, hours or price",
        saw: "The home page still says the Hybrid Program is \"Starting in Fall 2025\". The Hybrid Program page says it has launched and is enrolling, then shows the application survey and the guide's bio, with no schedule, campus or price.",
        impact: "A family weighing hybrid against full-time can't compare them without applying or asking first.",
        source: "Acton Placer Hybrid Program",
        url: "https://actonplacer.com/the-hybrid-program-page",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "The site we build lists the Hybrid Program next to the four studios with its days, campus and price, each marked Open, Waitlist or Full.",
        },
      },
      {
        area: "tour",
        gap: "Step 1 has nothing to book",
        saw: "Step 1 on the Enrollment page lists an info session, a 15-minute call with the President and a chat with a current parent, as plain text with no dates or links. The FAQ says info sessions and tours come through Apply Now.",
        impact: "A family ready to take the first step has to apply or reach out and wait before they can pick a session or a call.",
        source: "Acton Placer Enrollment",
        url: "https://actonplacer.com/enrollment-5862-5166",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick an info session or a 15-minute call from times you open for each campus, and get a reminder before it.",
        },
      },
      {
        area: "apply",
        gap: "The application doesn't say what happens next",
        saw: "Apply Now is a survey \"to join the waitlist or start the audition process\": parent details, up to five children and five questions about the family. The page doesn't say which path a family is on or when they'll hear back.",
        impact: "After sending it, a family can't tell from the page whether they're on a waitlist or headed to a Family Meetup.",
        source: "Acton Placer Apply Now",
        url: "https://actonplacer.com/apply-445902",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Each application lands in one admin inbox with its campus and studio, so you see every family's stage, from waitlist to audition, in one list.",
        },
      },
      {
        area: "enroll",
        gap: "Locking in a spot has no stated steps",
        saw: "Step 3 is to \"schedule shadow days or enrollment and lock in a spot\". The site doesn't say what locking in involves: a deposit, an agreement or other forms.",
        impact: "Families can't see ahead what a spot takes, so the deposit and forms are explained family by family across three campuses.",
        source: "Acton Placer Enrollment",
        url: "https://actonplacer.com/enrollment-5862-5166",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "After the audition, families get one checklist: the enrollment agreement signed online and any deposit paid, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "Tuition is listed, but not how it's paid",
        saw: "The Enrollment page and FAQ give $11,500 for TK–8th and $13,500 for 9th–12th. The site doesn't say how tuition is paid, whether there's a monthly plan, or whether siblings get a discount.",
        impact: "Families working out a budget have to ask about the schedule before they can plan for the year.",
        source: "Acton Placer Enrollment",
        url: "https://actonplacer.com/enrollment-5862-5166",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay"],
          text: "Families choose a payment plan, see their balance and invoices in the parent portal, and can turn on autopay.",
        },
      },
      {
        area: "updates",
        gap: "The Academic Calendar shows last school year",
        saw: "The Academic Calendar page is an image of the 2025–26 calendar, which ended with the final day on July 2, 2026. Nothing for 2026–27 is posted.",
        impact: "Current families can't check this year's breaks and exhibitions online, and new families can't see when a start date would fall.",
        source: "Acton Placer Academic Calendar",
        url: "https://actonplacer.com/academic-calendar-3039-3393",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal"],
          text: "We'd set up a live school calendar in each family's login, with exhibitions and breaks you update in one place.",
        },
      },
      {
        area: "website",
        gap: "A few links go nowhere useful",
        saw: "On each campus page, the phone number links to an archived web page instead of dialing. The logo link opens a page that doesn't exist. The FAQ says to click a message icon at the bottom right, and none showed up when we checked.",
        impact: "A family tapping to call or message from a phone hits a dead end at the moment they want to talk.",
        source: "Acton Placer Roseville campus page",
        url: "https://actonplacer.com/roseville-9859",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you has tap-to-call and contact links that work on every page, and we keep them checked.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Acton Placer",
    founder: {
      fullName: "Kelsy Blyakherov",
      firstName: "Kelsy",
      role: "Co-founder and President",
      source: "Acton Placer The Story page (\"Kelsy Blyakherov, Co-founder / President\")",
      url: "https://actonplacer.com/the-story-page",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "On Acton Placer's Story page, Kelsy Blyakherov wrote that she has been part of Acton Academy since the fall of 2014 and that the Hero's Journey \"isn't just a philosophy—it is my life's work\".",
        source: "Acton Placer, The Story page",
        url: "https://actonplacer.com/the-story-page",
        readOn: "2026-11-22",
      },
      {
        fact: "As Co-Founder/President she works with the young heroes on campus and with their families, Heads of Program and Guides, and says she is committed to bringing this kind of education to as many families and communities as possible.",
        source: "Acton Placer, The Story page",
        url: "https://actonplacer.com/the-story-page",
        readOn: "2026-11-22",
      },
      {
        fact: "Acton Placer runs three campuses (Roseville, Sacramento near Arden Arcade/Carmichael, and Old Town Rocklin) and four studios, Spark, Threshold, Discovery and Launchpad.",
        source: "Acton Placer FAQ",
        url: "https://actonplacer.com/faq-5143-3496",
        readOn: "2026-11-22",
      },
    ],
    hook: "On Acton Placer's Story page, Kelsy Blyakherov wrote that she has been part of Acton Academy since the fall of 2014 and that the Hero's Journey \"isn't just a philosophy—it is my life's work\".",
    body: `Hi Kelsy,

I read your story on the Acton Placer site. You've been part of Acton since the fall of 2014, and you wrote that the Hero's Journey isn't just a philosophy for you. It's your life's work.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Acton Placer.

I'd like to hear how you keep three campuses feeling like one school.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Kelsy, a note from a microschool in Round Rock, Texas. J",
    shortCode: "actonplacer-2emk",
    checkBeforeMailing: [
      "Find a mailing address: actonplacer.com publishes none (the Story, FAQ, Enrollment and campus pages say to contact the school for the exact location, and the footer lists only Journey-Suite LLC). Lead: the Acton Academy network directory lists Acton Academy Placer County at 725 Vernon Street, Roseville, CA (https://actonacademy.org/campuses/acton-academy-placer-county/), reportedly the Rock of Roseville church that hosts the Roseville campus. Confirm the school takes mail there before using it, and address it to Kelsy Blyakherov, Acton Academy Placer.",
      "The hook is from her own Story page, not an interview. No podcast or press piece of hers turned up (the Acton Placer podcasts on Apple are with Matt Beaudreau, a different founder of the school, so they aren't used).",
      "The three campuses are Roseville, Sacramento and Rocklin per the FAQ; if one has closed, change the ask to \"how the campuses are going\".",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Their own three enrollment steps, the Sage Field proof number and a permission ask",
      subject: "Acton Placer's three enrollment steps",
      body: `Hi Kelsy,

I mailed you a handwritten note last week with a card for Acton Placer.

Your Enrollment page lays out three steps: learn more, including a 15-minute call with you, then a Family Meetup on campus, then shadow days or enrollment to lock in a spot.

I run Sage Field, a microschool in Round Rock, TX, and built MudKitchen to track every family through steps like that in one place. We grew from 0 to 35 students in under 3 months on it.

I set up a version for Acton Placer with your four studios and three campuses in it; the card opens it too. Want me to send the link?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Kelsy,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Acton Placer version: a Parent Guide request landing in your admin, the enrollment checklist a family gets after their audition, and tuition in the parent portal.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello with no pitch",
      where: "LinkedIn (Kelsy Blyakherov), if she's there; no school Instagram or Facebook found",
      body: "Hi Kelsy, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Loved reading that your Business Fair kids sell with no coaching from adults on the day.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "A new angle: a one-page snapshot of what a family sees on their site today, plus the Rooted Meadows proof",
      body: `Hi Kelsy,

I also put together a one-page snapshot of what a family sees on actonplacer.com today, from Apply Now to the Academic Calendar. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Kelsy,

I'll leave it here so I'm not cluttering your inbox. The Acton Placer version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the year.

Julius`,
    },
  ],
};
