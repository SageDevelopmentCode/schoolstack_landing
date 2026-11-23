import type { OutreachPlan } from "./types";

export const brightMindsFutureLeadersOutreach: OutreachPlan = {
  slug: "bright-minds-future-leaders",
  schoolName: "Bright Minds Future Leaders",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Angela",
    role: "Founder & Certified Teacher (Angela Gilmer)",
    source: "Bright Minds About page (\"Meet Founder Angela Gilmer\") and Home",
  },
  angle:
    "One real question: families can pay yearly, monthly over 12 months or every two weeks, in cash or by card with a fee, plus a separate curriculum fee and testing fee, while Angela teaches all day. How does she keep track of who's on which plan?",
  facts: [
    {
      fact: "Bright Minds Future Leaders is a K–5 private micro school in New Caney, Texas, with classes of 12 or fewer, ability-based learning and a year-round calendar, founded by certified teacher Angela Gilmer; it is now enrolling for Fall 2026 with a few seats per grade",
      source: "Bright Minds, Home and FAQ",
      url: "https://brightmindsfutureleaders.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "The FAQ asks families to contact the school for tuition; a separate curriculum fee and a testing fee for the placement session are charged on top. Payment can be yearly, monthly over 12 months or biweekly, in cash or by credit card with a processing fee",
      source: "Bright Minds, FAQ (Tuition & Fees)",
      url: "https://brightmindsfutureleaders.com/faq",
      readOn: "2026-11-23",
    },
    {
      fact: "Getting started is a tour (booked online or by phone, before or after school), then a separate one-on-one placement session with a testing fee, then the application",
      source: "Bright Minds, FAQ (Enrollment & Admissions)",
      url: "https://brightmindsfutureleaders.com/faq",
      readOn: "2026-11-23",
    },
    {
      fact: "The \"Download Parent Packet\" button opens a form asking for name, email and phone (with consent to SMS) before the packet can be viewed",
      source: "Bright Minds, Parent Packet intake page",
      url: "https://book.brightmindsfutureleaders.com/parent-packet-intake",
      readOn: "2026-11-23",
    },
    {
      fact: "Angela has 30+ years of teaching, an M.Ed. from the University of Houston, ESL and GT certification, and ended her public school career in New Caney ISD, the community she has called home her whole life",
      source: "Bright Minds, About",
      url: "https://brightmindsfutureleaders.com/about",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "We'd build: An ordered waitlist with automatic offers.",
    "Bright Minds is a one-teacher school (Angela is founder and teacher), so keep the pitch about saving her time.",
    "The site doesn't mention TEFA; the plan doesn't raise it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "1ld3lZJQdGyLQroQ7SOcMQ",
    preparedOn: "2026-11-23",
    summary:
      "We read 28 pages of brightmindsfutureleaders.com on Nov 23, 2026, plus the tour, application and parent packet pages.",
    pageSpeed: { mobileScore: 65, url: "https://brightmindsfutureleaders.com/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "find",
        gap: "Tuition and fees aren't on the site",
        saw: "The FAQ says \"Please contact us for current tuition rates\". It describes a separate curriculum fee and a testing fee for the placement session, without amounts.",
        impact: "A family comparing schools can't see what Bright Minds costs, or what the extra fees add, before a call.",
        source: "Bright Minds, FAQ",
        url: "https://brightmindsfutureleaders.com/faq",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "website-service"],
          text: "Tuition, the curriculum fee and the testing fee shown on the site and set up once, so bills always match.",
        },
      },
      {
        area: "pay",
        gap: "Families pay in cash or by card with a fee",
        saw: "Families choose yearly, monthly over 12 months or biweekly payments, and pay in cash or by credit card with a processing fee. The site doesn't mention bank transfer or autopay.",
        impact: "A biweekly family pays 26 times a year by cash or with a card fee each time, and has no balance to check.",
        source: "Bright Minds, FAQ (What payment options are available?)",
        url: "https://brightmindsfutureleaders.com/faq",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "card-and-ach", "autopay"],
          text: "Families pick a plan, see their balance, and pay by card or bank automatically on schedule.",
        },
      },
      {
        area: "find",
        gap: "The Parent Packet asks for details first",
        saw: "\"Download Parent Packet\" opens a form asking for name, email and phone, with consent to text messages, before the packet can be viewed.",
        impact: "A family that just wants to read the basics has to sign up for texts first.",
        source: "Bright Minds, Parent Packet intake page",
        url: "https://book.brightmindsfutureleaders.com/parent-packet-intake",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The packet's key details on the site itself, with sign-ups saved for families who want to talk.",
        },
      },
      {
        area: "enroll",
        gap: "Which grades have seats isn't shown",
        saw: "The home page says there are only a few seats per grade for Fall 2026, and the FAQ says families are contacted in order from a waitlist when spots open.",
        impact: "A family can't see whether their child's grade is open, or where they are on the waitlist.",
        source: "Bright Minds, Home and FAQ",
        url: "https://brightmindsfutureleaders.com/faq",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "waitlist-queue"],
          text: "Each grade marked Open, Waitlist or Full, and an ordered waitlist we'd set up with you that offers seats in turn.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 65 out of 100 on mobile. The main content takes about 15 seconds to appear.",
        impact: "A parent opening the site on a phone waits a long time before seeing anything.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://brightmindsfutureleaders.com/",
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
    shortSchoolName: "Bright Minds",
    founder: {
      fullName: "Angela Gilmer",
      firstName: "Angela",
      role: "Founder & Certified Teacher",
      source: "Bright Minds, About",
      url: "https://brightmindsfutureleaders.com/about",
    },
    mailTo: {
      lines: ["Angela Gilmer", "Bright Minds Future Leaders", "22893 Antique Ln", "New Caney, TX 77357"],
      source: "Bright Minds Contact page and FAQ (\"We're at 22893 Antique Ln, New Caney, TX 77357\")",
      url: "https://brightmindsfutureleaders.com/contact",
    },
    founderFacts: [
      {
        fact: "Angela taught for 30+ years across several districts, ending her public school career in New Caney ISD, then founded Bright Minds in the same community.",
        source: "Bright Minds, About",
        url: "https://brightmindsfutureleaders.com/about",
        readOn: "2026-11-23",
      },
      {
        fact: "Angela says she founded Bright Minds after watching talented teachers struggle to meet individual needs with 25–30 students at once.",
        source: "Bright Minds, About (Why I Started This School)",
        url: "https://brightmindsfutureleaders.com/about",
        readOn: "2026-11-23",
      },
    ],
    hook: "Angela taught for 30+ years across several districts, ending her public school career in New Caney ISD, then founded Bright Minds in the same community.",
    body: `Hi Angela,

After more than 30 years of teaching, finishing in New Caney ISD, you opened Bright Minds in the same community, with classes of 12 instead of 30. That's a lot of trust from local families.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Bright Minds.

I'd like to hear what's surprised you most about running the school and teaching in it.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Angela, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "brightminds-q8d3",
    checkBeforeMailing: [
      "The address is the one the school publishes for visits (Contact and FAQ). It's on a quiet street; a LoopNet property record exists for it, but confirm it isn't a home before mailing.",
      "No podcast or press about Angela turned up; the hook is from her About page.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about tracking three payment plans plus separate fees, then who's asking and one proof number",
      subject: "Payment plans at Bright Minds",
      body: `Hi Angela,

I mailed you a handwritten note last week with a card for Bright Minds.

Your FAQ says families can pay yearly, monthly or every two weeks, in cash or by card, with a separate curriculum fee and testing fee on top.

With you teaching all day, how do you keep track of who's on which plan and what each family still owes?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Angela,

In case it's easier to see than describe, I set up a version of MudKitchen for Bright Minds and recorded a 60-second walkthrough: a tour request landing in your admin inbox, the enrollment checklist with the curriculum fee, and the billing page with yearly, monthly or biweekly plans.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Bright Minds is, with no pitch",
      where: "Facebook (brightmindsfutureleaders)",
      body: "Hi Angela, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. A classroom of 12 where kids work at their real level is a gift to New Caney.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Angela,

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
      body: `Hi Angela,

I'll leave it here so I'm not cluttering your inbox. The Bright Minds version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
