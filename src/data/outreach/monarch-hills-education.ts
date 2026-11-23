import type { OutreachPlan } from "./types";

export const monarchHillsEducationOutreach: OutreachPlan = {
  slug: "monarch-hills-education",
  schoolName: "Monarch Hills Education",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Cat",
    role: "Board President",
    source:
      "monarchhills.org Our Team (Board of Directors: Cat Placencia, President). The site names no founder or director; the board decides financial and policy issues (2024–25 Parent Handbook)",
  },
  angle: "Re-contact with a snapshot: joining the waitlist starts with creating a Brightwheel account, and the Tuition page still shows 2025–2026",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the Monarch Hills MudKitchen demo",
  },
  facts: [
    {
      fact: "Join Our Waitlist links to a Brightwheel form that asks families to sign in or create an account to start it",
      source: "Monarch Hills home page and the Brightwheel form it links to",
      url: "https://www.monarchhills.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "The Tuition page lists 2025–2026 tuition (program dates Aug 18, 2025 – May 29, 2026): 5-day full time $9,000 a year or $900 a month for 10 months; registration $100, materials $250; 10% sibling discount",
      source: "Monarch Hills Tuition",
      url: "https://www.monarchhills.org/new-page",
      readOn: "2026-11-22",
    },
    {
      fact: "The 2026–2027 program year runs August 17, 2026 – May 28, 2027, with Friday off-site days",
      source: "Monarch Hills 2026–2027 Program Calendar",
      url: "https://www.monarchhills.org/2026-2027-1",
      readOn: "2026-11-22",
    },
    {
      fact: "Enrollment: all forms and contracts go through the Brightwheel app, a registration fee saves the space, a materials fee is due before the first day, and full-time families have an enrollment meeting",
      source: "Monarch Hills Parent Handbook 2024–2025 (PDF)",
      url: "https://www.monarchhills.org/s/Parent-Handbook-2024-25-2.pdf",
      readOn: "2026-11-22",
    },
    {
      fact: "Board of Directors: Cat Placencia, President; the board has final legal and fiduciary responsibility",
      source: "Monarch Hills Our Team and Parent Handbook",
      url: "https://www.monarchhills.org/educators",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June (the first email says so).",
    "Confirm the recipient: the site names no founder or director. Cat Placencia is Board President; Hali Anaya is the first educator listed. Send to whoever got the June email.",
    "Uses Brightwheel (waitlist, enrollment forms and contracts): decide whether to pitch replacing it. It may also handle their billing and messages.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "h6nMN2hWEa-Fmv9BGhvkzw",
    preparedOn: "2026-12-01",
    summary:
      "We read all 14 pages of monarchhills.org and the 2024–25 Parent Handbook on Dec 1, 2026, from Programs and Tuition to the Calendar and Summer Camps.",
    toolStack: [
      { name: "Brightwheel", usedFor: "Waitlist, enrollment forms and contracts", url: "https://www.monarchhills.org/" },
      { name: "Google Doc", usedFor: "Gatherings and events", url: "https://www.monarchhills.org/s/Parent-Handbook-2024-25-2.pdf" },
    ],
    observations: [
      {
        area: "apply",
        gap: "The waitlist starts with creating an account",
        saw: "Join Our Waitlist on the home page and the Programs page opens a Brightwheel page that says to sign in or create an account to start the form. The summer camp waitlist works the same way.",
        impact: "A family who only wants to add their name has to make an account and a password first, and some will stop there.",
        source: "Monarch Hills home page",
        url: "https://www.monarchhills.org/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families join the waitlist or apply from your own site with no account needed, and every entry lands in one admin inbox.",
        },
      },
      {
        area: "find",
        gap: "Tuition still shows 2025–2026",
        saw: "The Tuition page lists 2025–2026 prices and program dates (August 18, 2025 – May 29, 2026), while the Calendar is already 2026–2027. The Full-Time and Enrichment pages still give August 19, 2024 – May 30, 2025.",
        impact: "A family planning for this year can't tell whether $9,000 for five days is still the price, so they write in to ask.",
        source: "Monarch Hills Tuition",
        url: "https://www.monarchhills.org/new-page",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["website-service"],
          text: "We build and keep the site up to date for you, so tuition, program dates and the calendar always show the same school year.",
        },
      },
      {
        area: "tour",
        gap: "The only visit on the site was in March",
        saw: "The Events page's open house was Saturday, March 7, 2026, and no later visit is listed. Families otherwise email the admin address.",
        impact: "A family who finds you now has no way to see the farm until the next open house is announced.",
        source: "Monarch Hills Open House",
        url: "https://www.monarchhills.org/events/open-house",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a visit time from the slots you open, any time of year, and get a reminder before they come.",
        },
      },
      {
        area: "enroll",
        gap: "Enrollment steps are only in a 2024–25 PDF",
        saw: "The site doesn't say what happens after the waitlist. The steps (forms and contracts in Brightwheel, a registration fee to save the space, a materials fee, an enrollment meeting) are in the 2024–25 Parent Handbook.",
        impact: "New families learn the steps one email at a time, and fees and forms are tracked in different places.",
        source: "Monarch Hills Parent Handbook 2024–2025 (PDF)",
        url: "https://www.monarchhills.org/s/Parent-Handbook-2024-25-2.pdf",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: the tuition agreement signed online, the registration and materials fees, and the forms, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say how to pay tuition",
        saw: "Tuition is set as 10 monthly payments ($900 a month for five days), plus registration and materials fees and a 10% sibling discount. The site doesn't say how families pay; the handbook lists a separate billing email, and tuition assistance is by email request.",
        impact: "Families ask how and when to pay, and monthly payments, fees and sibling discounts are worked out by hand.",
        source: "Monarch Hills Tuition",
        url: "https://www.monarchhills.org/new-page",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families pick monthly or annual in their portal and turn on autopay by card or bank. Each month's payment is charged on its own.",
        },
      },
      {
        area: "updates",
        gap: "Four inboxes, a Google Doc and texts",
        saw: "The handbook lists separate email addresses for the board, the educators and billing, the site uses an admin address, events live in a \"living google doc\", and emergency decisions go out by text.",
        impact: "Families have to know which inbox to write to and where to look for dates, and news is spread across several places.",
        source: "Monarch Hills Parent Handbook 2024–2025 (PDF)",
        url: "https://www.monarchhills.org/s/Parent-Handbook-2024-25-2.pdf",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["messaging", "bulletin", "calendar"],
          text: "Families message educators and the office in one place, see announcements in one feed, and find every gathering on the school calendar.",
        },
      },
      {
        area: "website",
        gap: "Two home page links lead to missing pages",
        saw: "Two links on the home page go to /about and /take-action, which both return \"page not found\". The handbook linked from Programs is the 2024–25 edition.",
        impact: "A family reading about the program hits a dead end halfway through.",
        source: "Monarch Hills home page",
        url: "https://www.monarchhills.org/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["website-service"],
          text: "The site we build and look after for you has every page linked and the current handbook in place.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Monarch Hills",
    founder: {
      fullName: "Cat Placencia",
      firstName: "Cat",
      role: "Board President",
      source: "Monarch Hills Our Team page (Board Of Directors: \"Cat Placencia: President\")",
      url: "https://www.monarchhills.org/educators",
    },
    mailTo: {
      lines: ["Monarch Hills Education", "PO Box 1136", "Boulder Creek, CA 95006"],
      source: "Monarch Hills Donate page (\"Mail to our Treasurer\")",
      url: "https://www.monarchhills.org/donate",
    },
    founderFacts: [
      {
        fact: "The 2026–2027 Program Calendar has Fridays off-site at rotating San Luis Obispo locations, announced the week of, and a Winter Solstice celebration hike on December 18.",
        source: "Monarch Hills 2026-2027 Program Calendar",
        url: "https://www.monarchhills.org/2026-2027-1",
        readOn: "2026-11-22",
      },
      {
        fact: "Monarch Hills describes itself as an outdoor enrichment program in San Luis Obispo for grades TK-6, and says time outside should be more than just recess: an integral and plentiful daily experience.",
        source: "Monarch Hills home page",
        url: "https://www.monarchhills.org/",
        readOn: "2026-11-22",
      },
      {
        fact: "Monarch Hills partners with the Cal Poly Child Development Department on an internship program: interns work alongside educators for 1-2 quarters so smaller groups of children can dive deeply into their work.",
        source: "Monarch Hills Our Team page",
        url: "https://www.monarchhills.org/educators",
        readOn: "2026-11-22",
      },
      {
        fact: "Cat Placencia is President of the Monarch Hills Board of Directors; board meetings are held monthly by Zoom, and the page asks anyone who wants to attend to contact the board president.",
        source: "Monarch Hills Our Team page",
        url: "https://www.monarchhills.org/educators",
        readOn: "2026-11-22",
      },
    ],
    hook: "The 2026–2027 Program Calendar has Fridays off-site at rotating San Luis Obispo locations, announced the week of, and a Winter Solstice celebration hike on December 18.",
    body: `Hi Cat,

I was looking at the Monarch Hills calendar for this year. I liked that Fridays are spent off-site at a different spot around San Luis Obispo each week, and that December has a Winter Solstice hike.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Monarch Hills.

I'd like to hear how the Friday days come together.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Cat, a note from an outdoor microschool in Round Rock, Texas. J",
    shortCode: "monarch-8mq5",
    checkBeforeMailing: [
      "Cat Placencia is not a confirmed founder: the site names no founder, director or head of school, and the board has final legal and fiduciary responsibility (2024–25 Parent Handbook), so the letter goes to her as Board President (Our Team page). A Cal Poly page for a Cat Placencia doesn't mention the school and wasn't used.",
      "The PO box is the mailing address the Donate page gives (\"Mail to our Treasurer\"), so it reaches the treasurer in Boulder Creek, about 200 miles from San Luis Obispo, not Cat directly. Write \"Attn: Cat Placencia\" on the envelope.",
      "The other published address, 1221 Calle Joaquin, San Luis Obispo, CA 93405 (every page footer), is City Farm SLO, a city farm reserve rather than a home; the Events page calls it \"the farm\". It's closer to the school, but it's unclear Monarch Hills gets mail there. Use it instead only if you confirm they do.",
      "The hook is from the 2026–27 calendar: if the letter goes out after December 18, change \"December has a Winter Solstice hike\" to \"you had a Winter Solstice hike in December\".",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note and the June email, one snapshot detail, one proof number",
      subject: "Monarch Hills waitlist sign-up",
      body: `Hi Cat,

I mailed you a handwritten note last week with a card for Monarch Hills. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in June) and a one-page snapshot of what a family sees on your site today, from finding tuition to paying it.

One thing stood out: Join Our Waitlist asks a new family to create a Brightwheel account before they can add their name, and the Tuition page still shows 2025–2026.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Cat,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Monarch Hills version: the homepage, what a parent sees for enrollment and tuition, and the admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school is, with no pitch",
      where: "Instagram (monarch_hills_slo) or Facebook (monarch.hills.slo)",
      body: "Hi, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Love the Friday adventure days on the SLO trails.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Cat,

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
      body: `Hi Cat,

I'll leave it here so I'm not cluttering your inbox. The Monarch Hills version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the program year.

Julius`,
    },
  ],
};
