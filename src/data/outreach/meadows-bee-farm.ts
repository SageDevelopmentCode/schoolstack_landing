import type { OutreachPlan } from "./types";

export const meadowsBeeFarmOutreach: OutreachPlan = {
  slug: "meadows-bee-farm",
  schoolName: "Meadows Bee Farm",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Leigh",
    role: "Owner and operator (Leigh Merinoff, with Charlie)",
    source:
      "Liberty Food Fest speaker page (\"Leigh Merinoff, Owner, Meadows Bee Farm\") and the Meadows Bee Farm crew page (\"Leigh & Charlie\")",
  },
  angle:
    "One real question: Wednesday Young Farmers sessions are $40 each, sold month by month as store products, with scholarships on request. How does she keep track of who's coming each Wednesday and who's on a scholarship?",
  facts: [
    {
      fact: "Wednesday programming for ages 5–10 runs 10am–2pm at the main farm; it's \"$40 a session per Young Farmer, offered per month including 2-3 sessions, 4 hours each, and 2 farm meals each day\", and \"Scholarships are available upon request\"",
      source: "Meadows Bee Farm, YFP: Spring 2026 Wednesday Farm Education Programming",
      url: "https://www.meadowsbee.com/education-1-JfThH/p/yfpspring2026",
      readOn: "2026-11-22",
    },
    {
      fact: "Sessions are sold as store products with Add To Cart: Fall Semester 2025 Homeschool Wednesdays (sold out), Winter Semester 2026 (\"from $0.00\"), March & April 2026 and Spring 2026 ($120 each), and a September 2026 Family Farm Fair Day ($25 a person)",
      source: "Meadows Bee Farm education store",
      url: "https://www.meadowsbee.com/education-1-JfThH",
      readOn: "2026-11-22",
    },
    {
      fact: "The Education page's \"Current Educational Events\" lists only the Young Farmer Starts Family Farm Fair Day on Saturday, September 26",
      source: "Meadows Bee Farm Education page",
      url: "https://www.meadowsbee.com/education-1",
      readOn: "2026-11-22",
    },
    {
      fact: "Since the first program in 2012, the farm hosts over 750 Young Farmers and awards over 400 badges a year, at three levels in over 30 subjects",
      source: "Meadows Bee Farm Education and About pages",
      url: "https://www.meadowsbee.com/education-1",
      readOn: "2026-11-22",
    },
    {
      fact: "Leigh Merinoff trained as a sculptor before turning from art to farming; she runs the children's badge program plus a homeschool, summer camp and public school program, and speaks at Liberty Food Fest on December 12, 2026",
      source: "Liberty Food Fest speaker page, Leigh Merinoff",
      url: "https://www.libertyfoodfest.com/speakers/leigh-merinoff/",
      readOn: "2026-11-22",
    },
    {
      fact: "Google PageSpeed gave the home page a mobile score of 64, with the main image taking about 13.6 seconds to appear",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.meadowsbee.com%2F",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Meadows Bee Farm is a farm education program (Young Farmers badges, Wednesday sessions, family days), not a full-time school. The demo frames it that way; keep the email about sign-ups and payments, not tuition or enrollment years.",
    "Writing to Leigh as owner. Raquel is on the crew list and the About page gives her address for the library; switch to her if she runs sign-ups.",
    "We'd build: Monthly billing for clubs, after-care or add-on classes. Confirm we'd set up month-by-month session billing before sending the snapshot.",
    "No Instagram or Facebook is linked from the site (only YouTube, @meadowsbeefarm); find their page before the social step or use YouTube.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "d_6MYFcUqNTeWFq76ItxGQ",
    preparedOn: "2026-11-22",
    summary:
      "We read 60 pages of meadowsbee.com on Nov 22, 2026, including every program page in the education store, plus youngfarmerstarts.com.",
    pageSpeed: { mobileScore: 64, url: "https://www.meadowsbee.com/", checkedOn: "2026-11-22" },
    toolStack: [
      {
        name: "Squarespace store",
        usedFor: "Wednesday sessions and family days, bought month by month",
        url: "https://www.meadowsbee.com/education-1-JfThH",
      },
      {
        name: "Email",
        usedFor: "Scholarship requests and program questions",
        url: "https://www.meadowsbee.com/education-1",
      },
      {
        name: "Newsletter sign-up",
        usedFor: "News, updates and events",
        url: "https://www.meadowsbee.com/",
      },
    ],
    observations: [
      {
        area: "find",
        gap: "The only event listed is from September",
        saw: "On November 22 the Education page's \"Current Educational Events\" showed one event, the Young Farmer Starts Family Farm Fair Day on Saturday, September 26. The education store lists Fall 2025, Winter 2026, March & April 2026 and Spring 2026 Wednesdays, with nothing after September 2026.",
        impact: "A family looking for winter Wednesdays can't tell whether sessions are coming or how to get on the list.",
        source: "Meadows Bee Farm Education page and education store",
        url: "https://www.meadowsbee.com/education-1",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "The site we build lists each upcoming program with its dates and price, marked Open, Waitlist or Full from the same list families sign up from.",
        },
      },
      {
        area: "pay",
        gap: "Wednesdays are bought one month at a time in a store cart",
        saw: "Each month of Wednesday sessions is its own store product: \"$40 a session per Young Farmer, offered per month including 2-3 sessions.\" Spring 2026 is $120; the Winter Semester 2026 listing shows \"from $0.00\" with a session picker.",
        impact: "Families come back and check out again every month, and the listed price doesn't always match the $40 a session the page describes.",
        source: "Meadows Bee Farm, YFP: Winter Semester 2026 Wednesdays",
        url: "https://www.meadowsbee.com/education-1-JfThH/p/yfpwintersemester2026",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "parent-billing", "autopay"],
          text: "We'd set up monthly session billing: families sign up once and are billed for each month's Wednesdays automatically, with every invoice on their own billing page.",
        },
      },
      {
        area: "pay",
        gap: "Scholarships are by request only",
        saw: "Each program page says \"Scholarships are available upon request!\" There's no form or amount; the Education page gives an email address for program questions.",
        impact: "A family has to ask by email before signing up, and someone has to remember which families get a reduced price each month.",
        source: "Meadows Bee Farm, YFP: Spring 2026 Wednesday Farm Education Programming",
        url: "https://www.meadowsbee.com/education-1-JfThH/p/yfpspring2026",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["discounts", "parent-billing"],
          text: "A scholarship would be set once on the family's account and applied to every month's bill automatically.",
        },
      },
      {
        area: "enroll",
        gap: "The site doesn't say how families share allergies, pickup or a release",
        saw: "Program pages ask that \"Picky & food sensitive/allergic children should bring their own food\" and to label all items. No page says where families share allergies, who's picking up, or sign a release for farm work with animals and tools.",
        impact: "Staff may not know about an allergy or a new pickup person until the morning of, and there's no record of a signed release on file.",
        source: "Meadows Bee Farm, YFP: Spring 2026 Wednesday Farm Education Programming",
        url: "https://www.meadowsbee.com/education-1-JfThH/p/yfpspring2026",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements"],
          text: "Families fill in one checklist once a year with the farm release signed online next to allergies and pickup contacts, which staff see on the day.",
        },
      },
      {
        area: "updates",
        gap: "Session dates live only inside each store listing",
        saw: "The dates for each month of Wednesdays (for example \"January: 1/14 + 1/21 + 1/28\") and the February 4th potluck appear only on that month's store page. There's no calendar page.",
        impact: "Families keep track of farm days by revisiting store pages, and a date change has to reach every family some other way.",
        source: "Meadows Bee Farm, YFP: Winter Semester 2026 Wednesdays",
        url: "https://www.meadowsbee.com/education-1-JfThH/p/yfpwintersemester2026",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal", "mobile-app"],
          text: "Every Wednesday, family day and potluck would sit on one calendar in each family's login on the web and the iPhone app.",
        },
      },
      {
        area: "website",
        gap: "Some page names still show the setup labels",
        saw: "The Education page's browser tab reads \"General 1 – Meadows Bee Farm\", the Contact page reads \"Contact 1\", and the store is titled \"Store 2\". The Get Involved link opens the donate page on lime-clementine-ecgy.squarespace.com rather than meadowsbee.com.",
        impact: "Search results and shared links show \"General 1\" instead of the Young Farmers Program, so families searching for it are less likely to find it.",
        source: "Meadows Bee Farm Education page",
        url: "https://www.meadowsbee.com/education-1",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with each program on its own named page so families can find it in search.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow to appear on a phone",
        saw: "Google PageSpeed gave the home page a mobile score of 64, with the main image taking about 13.6 seconds to show.",
        impact: "A parent opening the site from a phone waits a long time before seeing the farm.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.meadowsbee.com%2F",
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
    shortSchoolName: "Meadows Bee",
    founder: {
      fullName: "Leigh Merinoff",
      firstName: "Leigh",
      role: "Owner and operator",
      source: "Liberty Food Fest speaker page, Leigh Merinoff",
      url: "https://www.libertyfoodfest.com/speakers/leigh-merinoff/",
    },
    mailTo: {
      lines: ["Leigh Merinoff", "Meadows Bee Farm", "4980 Windham Hill Rd", "Windham, VT 05359"],
      source: "Meadows Bee Farm Contact page (also the \"Main Farm\" address on every program page)",
      url: "https://www.meadowsbee.com/contact-us",
    },
    founderFacts: [
      {
        fact: "Leigh Merinoff's Liberty Food Fest speaker bio says she trained as a sculptor before turning from art to farming, and now runs a children's program awarding badges as they learn farming and science fundamentals across 30 subjects.",
        source: "Liberty Food Fest speaker page, Leigh Merinoff",
        url: "https://www.libertyfoodfest.com/speakers/leigh-merinoff/",
        readOn: "2026-11-22",
      },
      {
        fact: "Meadows Bee Farm launched its first Young Farmers program in 2012 and now hosts over 750 Young Farmers and awards over 400 badges a year.",
        source: "Meadows Bee Farm Education page",
        url: "https://www.meadowsbee.com/education-1",
        readOn: "2026-11-22",
      },
    ],
    hook: "Leigh Merinoff's Liberty Food Fest speaker bio says she trained as a sculptor before turning from art to farming, and now runs a children's program awarding badges as they learn farming and science fundamentals across 30 subjects.",
    body: `Hi Leigh,

Rachael Sparhawk, who founded Rooted Meadows in Rigby, Idaho, mentioned Meadows Bee to me. I read your Liberty Food Fest bio and liked that you trained as a sculptor before turning to farming, and that Young Farmers now earn badges in 30 subjects.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our enrollment and tuition, and it's a big part of how we grew. Now we offer it to other schools and farm programs too.

I'd like to hear how the badge program started. A text is plenty.

Julius`,
    postscript: "The card inside has a version of Meadows Bee I set up, plus a parent's-eye look at your sign-ups.",
    stickyNote: "Leigh, a note from an outdoor microschool in Round Rock, Texas. J",
    shortCode: "meadowsbee-w3n9",
    checkBeforeMailing: [
      "Opens with Rachael Sparhawk's referral (Rooted Meadows); confirm she's happy to be named.",
      "The address is the farm's published Contact page address and the \"Main Farm\" on every program page; it's a working farm and may also be the owners' home. Confirm you're comfortable mailing there (it's listed as the business address).",
      "Leigh's bio says she speaks at Liberty Food Fest on December 12, 2026; the letter doesn't mention it, so it reads the same before or after.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about month-by-month session sign-ups and scholarships, then who's asking and one proof number",
      subject: "Wednesday sign-ups at Meadows Bee",
      body: `Hi Leigh,

I mailed you a handwritten note last week with a card for Meadows Bee.

I was reading the Young Farmers pages. Wednesdays are $40 a session, families buy each month's sessions from the store, and scholarships are available on request.

With families signing up month by month, how do you keep track of who's coming each Wednesday and who's on a scholarship?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the enrollment and tuition system I built for it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so Leigh can see it without clicking around",
      body: `Hi Leigh,

In case it's easier to see than describe, I set up a version of MudKitchen for Meadows Bee and recorded a 60-second walkthrough: a Young Farmer sign-up landing in your admin inbox, the release and allergies in one checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Meadows Bee is, with no pitch",
      where: "YouTube (@meadowsbeefarm, linked from the About page), or Instagram if you find it",
      body: "Hi Leigh, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Love that Young Farmers keep a Homestead Binder of their own drawings and notes.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Leigh,

I also put together a one-page snapshot of what a family sees on your site today, from finding a program to signing up and paying. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Leigh,

I'll leave it here so I'm not cluttering your inbox. The Meadows Bee version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Enjoy the winter on the farm.

Julius`,
    },
  ],
};
