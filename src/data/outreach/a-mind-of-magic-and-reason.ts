import type { OutreachPlan } from "./types";

export const aMindOfMagicAndReasonOutreach: OutreachPlan = {
  slug: "a-mind-of-magic-and-reason",
  schoolName: "A Mind of Magic and Reason Learning Center",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "April",
    role: "Founder and Lead Sage (April Simmons)",
    source: "AMOMAR Our Story page (\"Hi, I'm April Simmons, the founder of A Mind of Magic and Reason in Tucson, AZ\")",
  },
  angle:
    "One real question: ESA families pay through ClassWallet and put any shortfall on a card, session by session. How does April keep each family's two payments straight across five sessions?",
  facts: [
    {
      fact: "AMOMAR is a secular, multi-age microschool on Tucson's Eastside, inside Second Sky: Science Garden and Social Club; it opened in Fall 2025 for grades 3–8 and expanded to K–8 for Fall 2026. It is a partner of the KaiPod Learning microschool network",
      source: "AMOMAR, Home and Our Story",
      url: "https://amindofmagicandreason.com/about",
      readOn: "2026-11-23",
    },
    {
      fact: "The year is five 7-week sessions (August 2026–June 2027), each paid before it starts; tuition isn't listed (\"Call to discuss tuition pricing and plan options\"), and enrolling takes a $250 non-refundable deposit",
      source: "AMOMAR, Admissions",
      url: "https://amindofmagicandreason.com/pricing",
      readOn: "2026-11-23",
    },
    {
      fact: "AMOMAR is an approved Arizona ESA vendor and takes direct pay through the ClassWallet vendor marketplace; if a family's ClassWallet balance doesn't cover the tuition payment, the difference is paid by credit card",
      source: "AMOMAR, Admissions (Do you accept ESA?)",
      url: "https://amindofmagicandreason.com/pricing",
      readOn: "2026-11-23",
    },
    {
      fact: "The Get Started page's \"interest form HERE\" link opens a Google Form titled \"RSVP for the AMOMAR Open House Event 5/2\"; the other pages embed KaiPod's interest form (Jotform)",
      source: "AMOMAR, Get Started and Calendar; Google Forms",
      url: "https://amindofmagicandreason.com/get-started",
      readOn: "2026-11-23",
    },
    {
      fact: "April spent 10 years as a public educator; parents of former students jokingly suggested she homeschool their children, and KaiPod Catalyst gave her the tools to launch AMOMAR",
      source: "AMOMAR, Our Story",
      url: "https://amindofmagicandreason.com/about",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). ESA payments go through ClassWallet; MudKitchen works alongside it.",
    "Uses KaiPod's Jotform: decide whether to pitch replacing it. AMOMAR is a KaiPod partner and KaiPod Catalyst graduate; it may use other KaiPod tools.",
    "Tuition isn't published; the demo shows session days and the $250 deposit but no tuition figure.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "E2um_CM94YhwZLaSmVtcUw",
    preparedOn: "2026-11-23",
    summary:
      "We read all 6 pages of amindofmagicandreason.com on Nov 23, 2026, plus both interest forms and the discovery call booking page.",
    pageSpeed: { mobileScore: 47, url: "https://amindofmagicandreason.com/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Jotform",
        usedFor: "Interest form",
        url: "https://amindofmagicandreason.com/calendar",
        network: "KaiPod",
      },
      {
        name: "Google Forms",
        usedFor: "Open house RSVP (also linked as the interest form)",
        url: "https://amindofmagicandreason.com/get-started",
      },
      {
        name: "Google Calendar booking",
        usedFor: "Discovery calls",
        url: "https://amindofmagicandreason.com/get-started",
      },
    ],
    observations: [
      {
        area: "pay",
        gap: "ESA families can pay from two places each session",
        saw: "Tuition is paid before each of five 7-week sessions. ESA families pay through ClassWallet, and if their balance is short, the difference goes on a credit card.",
        impact: "An ESA family can't see, before a session starts, how much will come from ClassWallet and how much from their card.",
        source: "AMOMAR, Admissions",
        url: "https://amindofmagicandreason.com/pricing",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "card-and-ach"],
          text: "We'd set up each family's session invoice to show the ESA share and their own, with card payment for the rest.",
        },
      },
      {
        area: "find",
        gap: "Tuition isn't on the site",
        saw: "Admissions lists the session days for kindergarten, 1st–2nd and 3rd–8th, the $250 deposit and $30 tutoring, then says \"Call to discuss tuition pricing and plan options.\"",
        impact: "A family checking whether their ESA covers AMOMAR has to book a call to find out.",
        source: "AMOMAR, Admissions",
        url: "https://amindofmagicandreason.com/pricing",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "tuition-rate-plans"],
          text: "Session tuition on the site for each grade band, set up once so the website and invoices match.",
        },
      },
      {
        area: "apply",
        gap: "The Get Started interest form is the open house RSVP",
        saw: "Get Started says \"Fill out our interest form HERE\". That link opens a Google Form titled \"RSVP for the AMOMAR Open House Event 5/2\". Every other page uses KaiPod's interest form.",
        impact: "A family who signs up from Get Started is RSVPing to a past open house, and may never reach your inquiry list.",
        source: "AMOMAR, Get Started; Google Forms",
        url: "https://amindofmagicandreason.com/get-started",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["admissions-pipeline", "online-application"],
          text: "One interest form on every page, landing in one admin inbox with the family's grade and ESA status.",
        },
      },
      {
        area: "find",
        gap: "Admissions still reads as before the year began",
        saw: "Admissions says first-session invoices go out in July, payment is due August 1, 2026 and ESA funds must be in ClassWallet by July 31. The FAQ says the location will be updated \"as we prepare to open\", and gives center hours of 9–5, Monday to Wednesday.",
        impact: "A family joining mid-year can't tell when the next session starts or what's due before it.",
        source: "AMOMAR, Admissions",
        url: "https://amindofmagicandreason.com/pricing",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "website-service"],
          text: "Each session shown with its start date, payment date and open spots, updated as the year goes.",
        },
      },
      {
        area: "updates",
        gap: "School calendars are images",
        saw: "The Calendar page shows the 2025–26 and 2026–27 calendars as colour-coded images, under the May 2 open house announcement.",
        impact: "A family checking the next break or outing day zooms into an image on their phone.",
        source: "AMOMAR, Calendar",
        url: "https://amindofmagicandreason.com/calendar",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal", "mobile-app"],
          text: "The school calendar in each family's login and on their phone, with sessions, breaks and Thursday outings added once.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 47 out of 100 on mobile. The main content takes about 16 seconds to appear.",
        impact: "A parent opening the site on a phone waits a long time before seeing anything.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://amindofmagicandreason.com/",
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
    shortSchoolName: "AMOMAR",
    founder: {
      fullName: "April Simmons",
      firstName: "April",
      role: "Founder and Lead Sage",
      source: "AMOMAR, Our Story",
      url: "https://amindofmagicandreason.com/about",
    },
    mailTo: {
      lines: ["April Simmons", "A Mind of Magic and Reason", "c/o Second Sky, 4141 East Irvington Road, Bldg A", "Tucson, AZ 85714"],
      source: "AMOMAR site footer (\"A learning community located inside of Second Sky: Science Garden and Social Club, 4141 East Irvington Road Tucson, AZ 85714\") and Calendar page (\"Bldg A\")",
      url: "https://amindofmagicandreason.com/calendar",
    },
    founderFacts: [
      {
        fact: "April's Our Story says that after 10 years as a public educator, parents of former students jokingly suggested she homeschool their children, which led her through KaiPod Catalyst to open AMOMAR in Fall 2025.",
        source: "AMOMAR, Our Story",
        url: "https://amindofmagicandreason.com/about",
        readOn: "2026-11-23",
      },
      {
        fact: "AMOMAR opened for grades 3–8 and expanded to K–8 for Fall 2026, adding a K–2 Sage.",
        source: "AMOMAR, Home and Our Story",
        url: "https://amindofmagicandreason.com/",
        readOn: "2026-11-23",
      },
    ],
    hook: "April's Our Story says that after 10 years as a public educator, parents of former students jokingly suggested she homeschool their children, which led her through KaiPod Catalyst to open AMOMAR in Fall 2025.",
    body: `Hi April,

Your Our Story page says AMOMAR started when parents of former students jokingly suggested you homeschool their kids. A year after opening, you've grown from grades 3–8 to K–8.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for AMOMAR.

I'd like to hear what made you add the younger grades in year two.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "April, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "amomar-j3v7",
    checkBeforeMailing: [
      "The address is Second Sky, the venue AMOMAR operates inside (site footer; \"Bldg A\" from the Calendar page). Mail goes c/o Second Sky; confirm they accept it for AMOMAR.",
      "No podcast or press about April turned up; the hook is her founding story on the school's Our Story page.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about ESA families paying from ClassWallet and a card each session, then who's asking and one proof number",
      subject: "ESA families at AMOMAR",
      body: `Hi April,

I mailed you a handwritten note last week with a card for AMOMAR.

Your Admissions page says ESA families pay through ClassWallet and put any shortfall on a card, before each of the five sessions.

How do you keep track of which part each family still owes when a session is about to start?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi April,

In case it's easier to see than describe, I set up a version of MudKitchen for AMOMAR and recorded a 60-second walkthrough: a discovery call request landing in your admin inbox, the enrollment checklist with the $250 deposit, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where AMOMAR is, with no pitch",
      where: "Instagram or Facebook (search for A Mind of Magic and Reason Tucson)",
      body: "Hi April, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Seekers and Sages, with a dragon on the logo, is a wonderful way to frame a school.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi April,

I also put together a one-page snapshot of what a family sees on your site today, from finding a price to paying with ESA. It also flags one link that goes to an old form. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi April,

I'll leave it here so I'm not cluttering your inbox. The AMOMAR version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with your first K–8 year.

Julius`,
    },
  ],
};
