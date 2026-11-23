import type { OutreachPlan } from "./types";

export const coysCampsAndClassesOutreach: OutreachPlan = {
  slug: "coys-camps-and-classes",
  schoolName: "Coy's Camps And Classes (Prodigypreneurs Academy)",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Molly",
    role: "Founder, Owner & Operator (Molly Coy)",
    source: "Coy's Camps And Classes, Molly Coy page (\"Owner & Operator\") and blog byline (\"Molly Coy, Founder of Coy's Camps And Classes\")",
  },
  angle:
    "One real question: Prodigypreneurs tuition is paid quarterly, Coy's takes Arizona ESA funds through ClassWallet, and the FAQ says they try to keep tuition within what ESA covers. When a family's ESA doesn't cover the whole quarter, how is the rest collected?",
  facts: [
    {
      fact: "Prodigypreneurs tuition: $7,000 a year for five days, $5,000 for five half days, $3,000 for STEAM Fridays or Literacy Launchpad Wednesdays, $4,000 for Wednesday and Friday (ages 5–7), plus a $100 enrollment fee and a $350 tech/curriculum fee",
      source: "Coy's Camps And Classes, Prodigypreneurs FAQ",
      url: "https://coyscampsandclasses.net/prodigypreneurs-faq",
      readOn: "2026-11-22",
    },
    {
      fact: "The FAQ says \"We are a registered ESA vendor, so you may pay with ESA funds. We strive to keep our tuition in the range of what ESA covers\"; the home page says payments go through ClassWallet",
      source: "Coy's Camps And Classes, Prodigypreneurs FAQ and home page",
      url: "https://coyscampsandclasses.net/prodigypreneurs-faq",
      readOn: "2026-11-22",
    },
    {
      fact: "Enrollment has six steps: email or fill out the interest form, a Zoom call, a tour, the enrollment form with the $100 application fee, the $350 curriculum/tech/supply fee, then quarterly tuition",
      source: "Coy's Camps And Classes, Prodigypreneurs FAQ",
      url: "https://coyscampsandclasses.net/prodigypreneurs-faq",
      readOn: "2026-11-22",
    },
    {
      fact: "The microschool interest form on the Contact page is a Jotform hosted on kaipodlearning.jotform.com",
      source: "Coy's Camps And Classes, Contact page (embedded form)",
      url: "https://coyscampsandclasses.net/contact-us",
      readOn: "2026-11-22",
    },
    {
      fact: "Chess tournament registration goes to events4chess.com; class and Literacy Launchpad schedules are Google Drive flyers; the Events page lists \"Registration Information: TBD\"",
      source: "Coy's Camps And Classes, Tournaments and Events pages",
      url: "https://coyscampsandclasses.net/events",
      readOn: "2026-11-22",
    },
    {
      fact: "Google PageSpeed gave the home page a mobile score of 23; the main content took about 19.6 seconds to appear",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fcoyscampsandclasses.net%2F",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Uses KaiPod's Jotform: decide whether to pitch replacing it (the microschool interest form runs on kaipodlearning.jotform.com, so Coy's may be in KaiPod's network).",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "We'd build: Monthly billing for clubs, after-care or add-on classes",
    "Arizona ESA payments go through ClassWallet. MudKitchen works alongside ClassWallet; don't pitch replacing it.",
    "Coy's is also a chess club, shop and camp business; Prodigypreneurs is one part. Keep the emails about the microschool.",
    "Their podcast, \"Prodigypreneurs: A Microschool Journey\" (Spotify, embedded on the About page), wasn't listened to. An episode could make a better letter hook than the 2023 blog post.",
    "Instagram (@coyscamps) and Facebook (CampCoy) are linked from the site but weren't opened; check one is active before the social step.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "yyZbD-4Cgay-1AhysRiZBg",
    preparedOn: "2026-11-22",
    summary:
      "We read 60 pages of coyscampsandclasses.net on Nov 22, 2026, plus the interest form, tournament registration and class flyers.",
    pageSpeed: { mobileScore: 23, url: "https://coyscampsandclasses.net/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Jotform",
        usedFor: "Microschool interest form",
        url: "https://coyscampsandclasses.net/contact-us",
        network: "KaiPod",
      },
      {
        name: "Events4Chess",
        usedFor: "Chess tournament registration",
        url: "https://coyscampsandclasses.net/tournaments",
      },
      {
        name: "Google Drive",
        usedFor: "Chess class and Literacy Launchpad flyers",
        url: "https://coyscampsandclasses.net/events",
      },
      {
        name: "Mailchimp",
        usedFor: "Email sign-up",
        url: "https://coyscampsandclasses.net/",
      },
    ],
    observations: [
      {
        area: "apply",
        gap: "Enrolling takes six separate steps",
        saw: "The FAQ lists the steps: email or fill out the interest form, meet on Zoom, come in for a tour, fill out the enrollment form and pay the $100 application fee, pay the $350 curriculum/tech/supply fee, then pay quarterly tuition. The interest form is a Jotform on kaipodlearning.jotform.com.",
        impact: "A family moves from email to Zoom to a visit to forms to three payments, and can stall between any two steps.",
        source: "Coy's Camps And Classes, Prodigypreneurs FAQ and Contact page",
        url: "https://coyscampsandclasses.net/prodigypreneurs-faq",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families apply on the site, and each family moves from interest form to Zoom, tour and enrollment in one admin inbox, so you can see who's waiting on what.",
        },
      },
      {
        area: "tour",
        gap: "The Zoom and the tour are arranged by email",
        saw: "After the interest form, \"We will then schedule a Zoom,\" followed by a tour. The site's booking page has nothing to book, and drop-in hours are Monday, Tuesday and Thursday from 4 to 7.",
        impact: "Setting up two meetings for each family takes a few emails back and forth before anything is on the calendar.",
        source: "Coy's Camps And Classes, Prodigypreneurs FAQ and Contact page",
        url: "https://coyscampsandclasses.net/prodigypreneurs-faq",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick a Zoom or tour time from the slots you open, right after their interest form, and it shows on their record.",
        },
      },
      {
        area: "enroll",
        gap: "The two fees are paid at separate steps",
        saw: "Step 4 is the enrollment form with the $100 application fee; step 5 is the $350 curriculum/tech/supply fee. \"If starting mid-year, steps 4-6 will be combined.\"",
        impact: "Families make two separate payments before tuition starts.",
        source: "Coy's Camps And Classes, Prodigypreneurs FAQ",
        url: "https://coyscampsandclasses.net/prodigypreneurs-faq",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-fees"],
          text: "Accepted families get one checklist: the enrollment form and both fees in one place, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "ESA and family payments are tracked separately",
        saw: "Tuition is paid quarterly. Coy's is \"a registered ESA vendor\" taking payments through ClassWallet, and the FAQ says \"We strive to keep our tuition in the range of what ESA covers.\" The site doesn't say how a family pays any part ESA doesn't cover.",
        impact: "For each family, someone has to know what ClassWallet paid this quarter and what the family still owes.",
        source: "Coy's Camps And Classes, Prodigypreneurs FAQ and home page",
        url: "https://coyscampsandclasses.net/prodigypreneurs-faq",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "autopay"],
          text: "We'd set up each family's billing page to show the ESA share and their own share of every quarter, with autopay for the family's part. ClassWallet keeps paying the ESA part as it does now.",
        },
      },
      {
        area: "find",
        gap: "The FAQ still reads like a plan",
        saw: "The Prodigypreneurs FAQ says \"We plan the following tuition rates\" and \"We will offer the 4 core subjects,\" while the Events page lists Literacy Launchpad for the 2026–2027 school year and a staff page says Ryan Perry joined in 2025–2026.",
        impact: "A parent reading the FAQ may wonder whether the school has opened yet or whether the prices are final.",
        source: "Coy's Camps And Classes, Prodigypreneurs FAQ",
        url: "https://coyscampsandclasses.net/prodigypreneurs-faq",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with each option and its tuition stated plainly for the current year.",
        },
      },
      {
        area: "updates",
        gap: "Classes, camps and tournaments sign up in different places",
        saw: "Chess tournaments register on events4chess.com. Fall chess classes and Literacy Launchpad are Google Drive flyers. The Events page lists \"Registration Information: TBD\" and a CPR class as \"TBD\".",
        impact: "A family with a microschool student who also does chess camp keeps track of several sites and flyers.",
        source: "Coy's Camps And Classes, Events and Tournaments",
        url: "https://coyscampsandclasses.net/events",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "calendar", "parent-portal"],
          text: "We'd set up classes, camps and Kids Night Outs as sign-ups in the same family login, billed alongside tuition, with the dates on one calendar.",
        },
      },
      {
        area: "website",
        gap: "Some pages are empty or missing",
        saw: "The Facility And Classes and Previous Location pages under Our Space show only the contact form. Two blog posts link to a Fall 2024 chess schedule that returns 404.",
        impact: "A parent who wants to see the space before a tour finds nothing there.",
        source: "Coy's Camps And Classes, Our Space pages and blog",
        url: "https://coyscampsandclasses.net/our-space/facility-and-classes",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build the site for you with photos of the space and current schedules, and keep links working.",
        },
      },
      {
        area: "website",
        gap: "The home page takes about 20 seconds to fill in on a phone",
        saw: "Google PageSpeed gave the home page a mobile score of 23. The main content took about 19.6 seconds to appear.",
        impact: "A parent opening the site from a phone may leave before seeing the microschool.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fcoyscampsandclasses.net%2F",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, sized to load fast on phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Coy's",
    founder: {
      fullName: "Molly Coy",
      firstName: "Molly",
      role: "Founder, Owner & Operator",
      source: "Coy's Camps And Classes, Molly Coy page",
      url: "https://coyscampsandclasses.net/about/molly-coy",
    },
    mailTo: {
      lines: ["Molly Coy", "Coy's Camps And Classes", "1430 E. Fort Lowell Rd. #100", "Tucson, AZ 85719"],
      source: "Coy's Camps And Classes home page (\"Location: 1430 E. Fort Lowell Rd. #100, Tucson, Arizona, 85719\")",
      url: "https://coyscampsandclasses.net/",
    },
    founderFacts: [
      {
        fact: "In her blog post \"My Reflections on Empowering Students\" (October 2023), Molly wrote that when she taught kindergarten, some students could spell \"I can see a cat\" but couldn't think of a sentence about a cat, and that what students learn on their own stays with them the longest.",
        source: "Coy's Camps And Classes blog, My Reflections on Empowering Students",
        url: "https://coyscampsandclasses.net/blog/my-reflections-on-empowering-students",
        readOn: "2026-11-22",
      },
      {
        fact: "Molly is a certified elementary teacher with a Gifted Education endorsement and a Senior Level US Chess Tournament Director who runs her own tournaments.",
        source: "Coy's Camps And Classes, Molly Coy page",
        url: "https://coyscampsandclasses.net/about/molly-coy",
        readOn: "2026-11-22",
      },
    ],
    hook: "In her blog post \"My Reflections on Empowering Students\" (October 2023), Molly wrote that when she taught kindergarten, some students could spell \"I can see a cat\" but couldn't think of a sentence about a cat, and that what students learn on their own stays with them the longest.",
    body: `Hi Molly,

I read your post about teaching kindergarten. Some students could spell "I can see a cat" but couldn't come up with their own sentence about a cat, and you wrote that what kids learn on their own stays with them longest.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Coy's.

I'd like to hear how you run a microschool and a chess club under one roof.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Molly, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "coys-r2k9",
    checkBeforeMailing: [
      "The hook is a blog post from October 2023. If an episode of their podcast (\"Prodigypreneurs: A Microschool Journey\" on Spotify) is more recent, consider opening on that instead.",
      "The address is the published Fort Lowell Road suite from the site footer.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about collecting what ESA doesn't cover, then who's asking and one proof number",
      subject: "ESA families at Prodigypreneurs",
      body: `Hi Molly,

I mailed you a handwritten note last week with a card for Coy's.

I was reading your Prodigypreneurs FAQ. Tuition is paid quarterly, you take ESA funds through ClassWallet, and you try to keep tuition within what ESA covers.

When a family's ESA doesn't cover the whole quarter, how do you collect the rest?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so Molly can see it without clicking around",
      body: `Hi Molly,

In case it's easier to see than describe, I set up a version of MudKitchen for Prodigypreneurs and recorded a 60-second walkthrough: an interest form landing in your admin inbox, both enrollment fees in one checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Coy's is, with no pitch",
      where: "Instagram (@coyscamps, linked from the site) or Facebook (CampCoy)",
      body: "Hi Molly, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. I like that Prodigypreneurs keeps Fridays for STEAM projects.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Molly,

I also put together a one-page snapshot of what a family sees on your site today, from the interest form to paying each quarter. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Molly,

I'll leave it here so I'm not cluttering your inbox. The Prodigypreneurs version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the winter tournaments.

Julius`,
    },
  ],
};
