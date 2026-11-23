import type { OutreachPlan } from "./types";

export const sageMontessoriNashvilleOutreach: OutreachPlan = {
  slug: "sage-montessori-nashville",
  schoolName: "Sage Montessori School of Nashville",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Stephanie and Margaret",
    role: "Founding Teacher Leaders (Stephanie Hull and Margaret Beagle)",
    source:
      "Sage Montessori About page (\"Founding Teacher Leader and Primary Guide\" for both) and their Nashville Voyager interview, Sept 30, 2024",
  },
  angle:
    "Why now: Sage's Tier 5 is \"Subsidy/Co-Pay\" and Tier 3–5 families are encouraged to apply for Tennessee's child care payment assistance, so one child's tuition can come from the state and the family. How do families see their own share?",
  facts: [
    {
      fact: "Sage is a Montessori school for 3–6 year-olds at 631 2nd Ave South in downtown Nashville, and the first Wildflower school in Tennessee",
      source: "Sage Montessori home page",
      url: "https://www.sagemontessoriofnashville.org/",
      readOn: "2026-11-23",
    },
    {
      fact: "Tuition is tiered by gross income and family size: Tier 1 $18,000, Tier 2 $15,000, Tier 3 $12,000, Tier 4 $9,000, Tier 5 \"Subsidy/Co-Pay\"; the chart is an image, and Tier 3–5 families are encouraged to apply for Tennessee's child care payment assistance",
      source: "Sage Montessori, Admissions (tuition chart image)",
      url: "https://www.sagemontessoriofnashville.org/admissions",
      readOn: "2026-11-23",
    },
    {
      fact: "Admissions says \"Now accepting applications for Fall 2026!\" and gives three steps: submit your application, schedule a family enrollment visit, receive admissions decision",
      source: "Sage Montessori, Admissions",
      url: "https://www.sagemontessoriofnashville.org/admissions",
      readOn: "2026-11-23",
    },
    {
      fact: "The Transparent Classroom application offers the 2026-27, Summer 2027 and 2027-2028 sessions, Primary (3-6y): Full Day (8-4), and Tiers 1–4 or State Subsidy",
      source: "Sage Montessori School of Nashville Application (Transparent Classroom)",
      url: "https://www.transparentclassroom.com/s/6276/online_applications/new?locale=en",
      readOn: "2026-11-23",
    },
    {
      fact: "Nashville Voyager interview (Sept 30, 2024): Margaret and Stephanie had worked together for five years; the biggest obstacle was real estate, since spaces are expensive and not everyone is willing to lease to a childcare facility; Sage also accepts CCAP",
      source: "Nashville Voyager, \"Meet Stephanie/Margaret Hull/Beagle of Downtown\"",
      url: "https://nashvillevoyager.com/?p=148334",
      readOn: "2026-11-23",
    },
    {
      fact: "The Hundred Board Fundraiser asks donors to pick tiles 1–100 and give that amount through PayPal on Giving Tuesday, December 1, with a $5,050 goal",
      source: "Sage Montessori, Give",
      url: "https://www.sagemontessoriofnashville.org/give",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Sage is a Wildflower school and its application runs on Transparent Classroom, which Wildflower schools use. Decide whether to pitch replacing it, or lead with billing and the website, which Transparent Classroom doesn't cover on their site today.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). Here it's Tennessee's child care payment assistance (CCAP), which pays the school directly; MudKitchen works alongside it.",
    "Two founding teacher leaders run Sage, so every step greets both. Switch to one name if you learn who handles billing (Stephanie mentions her business and administration background).",
    "The name overlap (Sage Field and Sage Montessori) is only used in the sticky note and the social hello. Keep it light. The Stephanie Hull podcast hits from the founder scan are the Girls Inc. CEO, a different person.",
    "Wildflower Schools - Bay Area is also on the P4 list (batch 18); don't reference this school there.",
    "Donations go through PayPal; that's a donation tool we work alongside, so it isn't in the snapshot.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "Ae6YOjwcgVZrUQAWdACRjQ",
    preparedOn: "2026-11-23",
    summary:
      "We read all 8 pages of sagemontessoriofnashville.org on Nov 23, 2026, plus the tuition chart and the online application.",
    pageSpeed: { mobileScore: 74, url: "https://www.sagemontessoriofnashville.org/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "pay",
        gap: "Subsidy families have two payers",
        saw: "Tier 5 on the tuition chart is \"Subsidy/Co-Pay\", and families in Tiers 3, 4 and 5 are encouraged to apply for Tennessee's child care payment assistance. The site doesn't say how the co-pay is billed or paid.",
        impact: "A family on the state subsidy can't see what they owe themselves each month, or what the state has covered.",
        source: "Sage Montessori, Admissions",
        url: "https://www.sagemontessoriofnashville.org/admissions",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "autopay"],
          text: "We'd set up each family's billing page to show the state's share and their own co-pay, with autopay for their part.",
        },
      },
      {
        area: "find",
        gap: "The tuition chart is a picture",
        saw: "The tiers, family sizes and income ranges are in one image on the Admissions page. The text says \"Below are the rates for the 2026/27 School Year\" but doesn't list them.",
        impact: "On a phone the chart's small print is hard to read, it can't be searched, and a screen reader can't read it out.",
        source: "Sage Montessori, Admissions",
        url: "https://www.sagemontessoriofnashville.org/admissions",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build the tuition page for you with the tiers as text, so families can find their tier on a phone.",
        },
      },
      {
        area: "apply",
        gap: "Admissions still says Fall 2026",
        saw: "The Admissions page says \"Now accepting applications for Fall 2026!\" and gives 2026/27 rates. The application itself already offers Summer 2027 and 2027–2028.",
        impact: "A family planning for next fall can't tell from the page that 2027–28 applications are open.",
        source: "Sage Montessori, Admissions; the online application",
        url: "https://www.sagemontessoriofnashville.org/admissions",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "online-application"],
          text: "Each session shows as Open, Waitlist or Full on your site, straight from the same place applications come in.",
        },
      },
      {
        area: "tour",
        gap: "The family enrollment visit isn't bookable",
        saw: "Step 2 of the application process is \"Schedule a family enrollment visit\", but there's no way to pick a time on the site.",
        impact: "After applying, a family waits to hear from you before their visit can be set.",
        source: "Sage Montessori, Admissions",
        url: "https://www.sagemontessoriofnashville.org/admissions",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["observation-booking", "admissions-pipeline"],
          text: "Families who've applied pick a visit time from your open slots, and it shows on their application in your admin inbox.",
        },
      },
      {
        area: "enroll",
        gap: "What happens after the decision isn't described",
        saw: "The process ends at \"Receive admissions decision.\" The site doesn't say what families sign or pay to hold their spot.",
        impact: "An accepted family can't see what's needed, or what's due, until they hear back.",
        source: "Sage Montessori, Admissions",
        url: "https://www.sagemontessoriofnashville.org/admissions",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: sign the enrollment agreement and pay any fee online, with reminders until it's done.",
        },
      },
      {
        area: "website",
        gap: "Two different start times",
        saw: "Admissions describes the full-day program as 8 am–4 pm, the Programs page says 7:45AM–4PM, and the application says Full Day (8-4).",
        impact: "A family planning drop-off sees two start times and has to ask which is right.",
        source: "Sage Montessori, Admissions and Programs",
        url: "https://www.sagemontessoriofnashville.org/programs",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We write and look after the site's copy for you, so hours and dates match on every page.",
        },
      },
      {
        area: "website",
        gap: "The icons under staff bios go to Wix",
        saw: "Under Margaret's and Stephanie's bios on the About page, the Facebook, Twitter and LinkedIn icons link to Wix's own pages, not to Sage's.",
        impact: "A parent who taps them to see more of the school lands on Wix's social pages instead.",
        source: "Sage Montessori, About",
        url: "https://www.sagemontessoriofnashville.org/about",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with every link checked.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Sage Montessori",
    founder: {
      fullName: "Stephanie Hull and Margaret Beagle",
      firstName: "Stephanie and Margaret",
      role: "Founding Teacher Leaders and Primary Guides",
      source: "Sage Montessori, About",
      url: "https://www.sagemontessoriofnashville.org/about",
    },
    mailTo: {
      lines: ["Stephanie Hull and Margaret Beagle", "Sage Montessori School of Nashville", "631 2nd Ave South", "Nashville, TN 37210"],
      source: "Sage Montessori Contact page (\"631 2nd Ave South, Nashville, TN 37210\") and home page",
      url: "https://www.sagemontessoriofnashville.org/contact",
    },
    founderFacts: [
      {
        fact: "In their Nashville Voyager interview, Stephanie and Margaret said the biggest obstacle had been real estate: Nashville spaces are expensive and not everyone is willing to lease to a childcare facility.",
        source: "Nashville Voyager, \"Meet Stephanie/Margaret Hull/Beagle of Downtown\" (Sept 30, 2024)",
        url: "https://nashvillevoyager.com/?p=148334",
        readOn: "2026-11-23",
      },
      {
        fact: "Their mission is to bring Montessori to all families, regardless of income, through a tiered tuition model, and Sage accepts CCAP.",
        source: "Nashville Voyager, \"Meet Stephanie/Margaret Hull/Beagle of Downtown\" (Sept 30, 2024)",
        url: "https://nashvillevoyager.com/?p=148334",
        readOn: "2026-11-23",
      },
      {
        fact: "Sage Montessori is located downtown at 631 2nd Ave South and is the first Wildflower school in Tennessee.",
        source: "Sage Montessori home page",
        url: "https://www.sagemontessoriofnashville.org/",
        readOn: "2026-11-23",
      },
    ],
    hook: "In their Nashville Voyager interview, Stephanie and Margaret said the biggest obstacle had been real estate: Nashville spaces are expensive and not everyone is willing to lease to a childcare facility.",
    body: `Hi Stephanie and Margaret,

I read your Nashville Voyager interview. You said real estate was the biggest obstacle, since not everyone will lease to a childcare program. Now Sage has a home on 2nd Ave South, with tuition tiered to what families earn.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Sage Montessori.

I'd like to hear how the tiered tuition is working out.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your admissions.",
    stickyNote: "Stephanie and Margaret, a note from the other Sage, down in Texas. J",
    shortCode: "sagemontessori-t7k3",
    checkBeforeMailing: [
      "The letter goes to both founding teacher leaders, since the school is run by the two of them and they gave the Voyager interview together.",
      "The address is the school's published downtown location from the Contact page.",
      "No podcast or other press turned up beyond the Nashville Voyager interview from September 2024.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then why now: Tier 5 subsidy and co-pay families have two payers, then who's asking and one proof number",
      subject: "CCAP families at Sage",
      body: `Hi Stephanie and Margaret,

I mailed you a handwritten note last week with a card for Sage Montessori.

Your tuition chart sets Tier 5 at "Subsidy/Co-Pay," and the Admissions page encourages Tier 3–5 families to apply for Tennessee's child care payment assistance. So one child's tuition can come from the state and the family.

How do those families see their own share each month?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Stephanie and Margaret,

In case it's easier to see than describe, I set up a version of MudKitchen for Sage and recorded a 60-second walkthrough: an application landing in your admin inbox, the enrollment checklist, and the billing page a family on a co-pay would see.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Sage is, with no pitch",
      where: "Instagram (@sagemontessorinashville) or Facebook, both linked from the Contact page",
      body: "Hi from the other Sage. I'm Julius, and I run Sage Field, a small outdoor microschool in Round Rock, TX. Good luck filling the Hundred Board on Giving Tuesday.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Stephanie and Margaret,

I also put together a one-page snapshot of what a family sees on your site today, from finding their tier to applying. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Stephanie and Margaret,

I'll leave it here so I'm not cluttering your inbox. The Sage version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with 2027–28 admissions.

Julius`,
    },
  ],
};
