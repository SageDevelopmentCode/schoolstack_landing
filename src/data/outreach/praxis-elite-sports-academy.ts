import type { OutreachPlan } from "./types";

export const praxisEliteSportsAcademyOutreach: OutreachPlan = {
  slug: "praxis-elite-sports-academy",
  schoolName: "Praxis Elite Sports Academy Junior Prep",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Amanda",
    role: "Executive Director and Founder (Amanda Barnett)",
    source: "Praxis Elite Our Story page (\"Praxis Elite Sports Academy is led by Director Amanda Barnett\") and Get Started page (\"Amanda Barnett, Praxis Elite Sports Academy Founder\")",
  },
  priorContact: {
    when: "May",
    what: "A hand-sent first email with a link to the Praxis Elite MudKitchen demo",
  },
  angle:
    "Re-contact with the Family experience snapshot. Proof + their process: 2027–28 applications are open, and an applicant goes through an Omella form plus three separate emails (Shadow Day request, essay, coach recommendation) before the March 1 deadline.",
  facts: [
    {
      fact: "Praxis Elite is a co-ed private middle school for student athletes in grades 6–8+ in San Diego, with two academic and two athletic periods a day and an 8th+ GAP year; it is a partner of the KaiPod Learning microschool network",
      source: "Praxis Elite, Home",
      url: "https://www.praxiselite.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "2027–28 applications opened November 15; early enrollment ends January 8 and the first window closes March 1, 2027. The 5 Day Program is $22,575 a year and the 3 Day Program $17,350, with a $1,000 nonrefundable deposit",
      source: "Praxis Elite, Admissions",
      url: "https://www.praxiselite.com/pricing",
      readOn: "2026-11-23",
    },
    {
      fact: "Applicants must do a Shadow Day (booked by emailing the Director) or a Zoom interview, email a 250–500 word essay, and have a coach or teacher email a recommendation; the application itself is an Omella form",
      source: "Praxis Elite, Admissions, and the Omella 2027–28 Admissions Application",
      url: "https://omella.com/zyfip",
      readOn: "2026-11-23",
    },
    {
      fact: "Nick Barnett, who leads athletics, was the Green Bay Packers' first-round pick in 2003, spent 11 years in the NFL, and won a CIF title in his first year as Del Norte High School's head football coach (2023)",
      source: "Praxis Elite, Our Story",
      url: "https://www.praxiselite.com/about",
      readOn: "2026-11-23",
    },
    {
      fact: "The Omella application thanks families for applying to Praxis Elite's \"Year 5 Class\" for fall 2027",
      source: "Omella, 2027–28 Admissions Application",
      url: "https://omella.com/zyfip",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in May (the first email says so).",
    "Uses KaiPod's Jotform: decide whether to pitch replacing it. The \"Schedule a Discovery Call\" contact form is KaiPod's network Jotform.",
    "Praxis is a KaiPod partner; KaiPod may supply other tools (billing, the Newton app) the site doesn't show.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "OI-Oz-nU_vfHa3-M4xQfCw",
    preparedOn: "2026-11-23",
    summary:
      "We read all 11 pages of praxiselite.com on Nov 23, 2026, plus both Omella application forms and the contact form.",
    pageSpeed: { mobileScore: 61, url: "https://www.praxiselite.com/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Omella",
        usedFor: "2026–27 and 2027–28 admissions applications",
        url: "https://www.praxiselite.com/pricing",
      },
      {
        name: "Jotform",
        usedFor: "\"Schedule a Discovery Call\" contact form",
        url: "https://www.praxiselite.com/get-started",
        network: "KaiPod",
      },
      {
        name: "Email",
        usedFor: "Shadow Day requests, essays and coach recommendations",
        url: "https://www.praxiselite.com/pricing",
      },
    ],
    observations: [
      {
        area: "apply",
        gap: "Applying takes one form and three separate emails",
        saw: "The application is an Omella form. The 250–500 word essay is emailed to the school, the coach or teacher emails the recommendation, and the Shadow Day is booked by emailing the Director, all before March 1 (January 8 for early decision).",
        impact: "A family tracks four pieces across two inboxes and can't see which ones arrived before the deadline.",
        source: "Praxis Elite, Admissions, and the Omella 2027–28 Admissions Application",
        url: "https://www.praxiselite.com/pricing",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "One application with the essay uploaded in it, saved as families go, and every applicant's pieces tracked in one admin inbox.",
        },
      },
      {
        area: "tour",
        gap: "Shadow Days are booked by email",
        saw: "Every applicant needs a Shadow Day or a Zoom interview, and 6th graders a pre-enrollment interview, each arranged by emailing the Director. \"Schedule a Discovery Call\" opens a contact form, and the Calendar page shows only \"Open House - Coming Soon\".",
        impact: "A family can't see open Shadow Days, so booking one takes a few emails back and forth before the January 8 early deadline.",
        source: "Praxis Elite, Admissions, Get Started and Calendar",
        url: "https://www.praxiselite.com/pricing",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a Shadow Day or interview from open slots, with a confirmation sent automatically.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say how tuition is paid",
        saw: "Admissions lists $22,575 for the 5 Day Program, $17,350 for the 3 Day and a $1,000 deposit. Upgraded curricula cost extra and vary. The site doesn't say whether tuition can be paid monthly or how families pay.",
        impact: "A family comparing schools can't see what a month of Praxis costs, or what curriculum upgrades add, until they ask.",
        source: "Praxis Elite, Admissions",
        url: "https://www.praxiselite.com/pricing",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay"],
          text: "Each family chooses a payment plan, sees curriculum upgrades on the same bill and pays online, with autopay if they want it.",
        },
      },
      {
        area: "find",
        gap: "Two school years share one Admissions page",
        saw: "The page opens on the 2027–28 window, then says 2026–27 is rolling with one full-time and four part-time spots. The FAQ still reads \"Applications will open on November 15th, 2026\", and the Flex day on the Student Experience page has no price.",
        impact: "A family has to work out which year and which link applies to them, and can't price the Flex option.",
        source: "Praxis Elite, Admissions and Student Experience",
        url: "https://www.praxiselite.com/pricing",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "website-service"],
          text: "Each program and year marked Open, Waitlist or Full in one place, with prices on the page, updated as spots fill.",
        },
      },
      {
        area: "updates",
        gap: "Families have no calendar of school dates",
        saw: "The Calendar page has one entry, \"Open House - Coming Soon\". Field Day Fridays, breaks and game days aren't listed, and the site has no family login.",
        impact: "A current family looking for this week's Field Day or next term's dates doesn't find them on the site.",
        source: "Praxis Elite, Calendar",
        url: "https://www.praxiselite.com/calendar",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "bulletin", "parent-portal"],
          text: "A school calendar and announcements in each family's login, with Field Days and events added once.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 61 out of 100 on mobile. The main content takes about 5.7 seconds to appear.",
        impact: "A parent opening the site on a phone, say at a game, waits several seconds before seeing anything.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://www.praxiselite.com/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with photos sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Praxis Elite",
    founder: {
      fullName: "Amanda Barnett",
      firstName: "Amanda",
      role: "Executive Director and Founder",
      source: "Praxis Elite, Our Story and Get Started",
      url: "https://www.praxiselite.com/about",
    },
    mailTo: {
      lines: ["Amanda Barnett", "Praxis Elite Sports Academy", "17065 Camino San Bernardo, Suite 150", "San Diego, CA 92127"],
      source: "Praxis Elite site footer and Admissions FAQ (\"17065 Camino San Bernardo, STE 150, CA 92127\")",
      url: "https://www.praxiselite.com/pricing",
    },
    founderFacts: [
      {
        fact: "Praxis Elite's 2027–28 application thanks families for applying to the school's \"Year 5 Class\".",
        source: "Omella, 2027–28 Admissions Application: Praxis Elite Sports Academy Junior Prep",
        url: "https://omella.com/zyfip",
        readOn: "2026-11-23",
      },
      {
        fact: "Praxis Elite gives students two academic and two athletic periods a day, and offers an 8th+ year for students who have finished 8th grade and want one more year before high school.",
        source: "Praxis Elite, Home",
        url: "https://www.praxiselite.com/",
        readOn: "2026-11-23",
      },
    ],
    hook: "Praxis Elite's 2027–28 application thanks families for applying to the school's \"Year 5 Class\".",
    body: `Hi Amanda,

Your 2027–28 application welcomes families to the Year 5 class. Congratulations on five years. I love the idea at the center of Praxis Elite: two periods of academics and two of training, every school day.

That's the kind of school we love hearing about. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Praxis Elite.

I'd love to hear how the 8th+ year has grown since you started it.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your admissions.",
    stickyNote: "Amanda, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "praxis-h7m3",
    checkBeforeMailing: [
      "The address is the school's own suite, from the site footer and the Admissions FAQ.",
      "Every \"Amanda Barnett\" podcast hit was someone else (an astrology show, Mormon Stories), and no press about the school turned up, so the letter opens on the school's own application.",
      "\"Year 5 Class\" comes from the Omella application; it implies Praxis opened in fall 2023. Swap the line if that reads wrong.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the May email, the application-in-pieces detail, one proof number, offer the snapshot",
      subject: "Shadow Days at Praxis Elite",
      body: `Hi Amanda,

I mailed you a handwritten note last week with a card for Praxis Elite. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in May) and a one-page snapshot of what a family sees on your site today.

One thing stood out: a 2027–28 applicant fills in the Omella form, then emails you for a Shadow Day, emails the essay, and has a coach email the recommendation.

I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Amanda,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Praxis Elite version: a Shadow Day request landing in your admin inbox, the enrollment checklist with the $1,000 deposit, and the billing page a family would see.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Praxis Elite is, with no pitch",
      where: "Instagram (@praxiselitesportsacademy) or Facebook",
      body: "Hi, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Two athletic periods a day for middle schoolers is a great idea.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Amanda,

Here's the snapshot, no reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Amanda,

I'll leave it here so I'm not cluttering your inbox. The Praxis Elite version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the Year 5 class.

Julius`,
    },
  ],
};
