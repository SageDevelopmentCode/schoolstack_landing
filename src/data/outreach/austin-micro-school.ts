import type { OutreachPlan } from "./types";

export const austinMicroSchoolOutreach: OutreachPlan = {
  slug: "austin-micro-school",
  schoolName: "Austin Micro School",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Matthew",
    role: "Co-founder",
    source: "Austin Micro School Our Team page (Matthew McCrea, Co-founder)",
  },
  angle: "Re-contact with a snapshot: TEFA families pay tuition from two places, the state account and their own monthly auto-draft",
  priorContact: {
    when: "August",
    what: "A hand-sent first email with a link to the Austin Micro School MudKitchen demo",
  },
  facts: [
    {
      fact: "Accepts Texas Education Freedom Accounts (TEFA) funds toward tuition; TEFA funds can't be used with the 30-Day Guarantee",
      source: "Austin Micro School Tuition & Fees",
      url: "https://www.austinmicroschool.org/tuition-fees",
      readOn: "2026-11-22",
    },
    {
      fact: "Full-Time is $18,000 a year (10 payments of $1,800, auto-drafted on the 1st, or pay in full by August 1 and save 10%); Hybrid runs $5,000 to $12,000 for 1 to 3 days; a $500 non-refundable enrollment fee holds the spot; a $50 late fee after the 5th, plus $50 for each further five days; 5% sibling discount",
      source: "Austin Micro School Tuition & Fees",
      url: "https://www.austinmicroschool.org/tuition-fees",
      readOn: "2026-11-22",
    },
    {
      fact: "Admissions run in three steps: a 20-minute family tour (booked on Acuity Scheduling), a free Young Leader Day Pass, then a Learning Profile and 30-day plan within 24 hours; if it's a fit, the family picks a start date",
      source: "Austin Micro School Admissions Process",
      url: "https://www.austinmicroschool.org/process",
      readOn: "2026-11-22",
    },
    {
      fact: "Day Pass families bring the completed intake form and medical/allergy information",
      source: "Austin Micro School Young Leader Day Pass",
      url: "https://www.austinmicroschool.org/day-pass",
      readOn: "2026-11-22",
    },
    {
      fact: "Hiring four roles: Elementary Lead, Elementary Guide, Adolescent Lead and Mentor",
      source: "Austin Micro School Careers",
      url: "https://www.austinmicroschool.org/careers",
      readOn: "2026-11-22",
    },
    {
      fact: "Alt Ed Austin lists rolling admissions for 2026–2027, K–12, with a ratio of no more than 12:1",
      source: "Alt Ed Austin directory",
      url: "https://www.altedaustin.com/alternative-school-directory/austin-micro-school",
      readOn: "2026-11-22",
    },
    {
      fact: "Middle school rocket launch with SystemsGo set for Apr 28–30, 2027",
      source: "Austin Micro School Calendar & Events",
      url: "https://www.austinmicroschool.org/calendar-events",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in August 2026",
    "Matthew McCrea is the only co-founder named on the Our Team page; confirm he's the right person to write to.",
    "The demo shows three parent testimonials (Sarah M., David & Priya K., Jennifer L.) that aren't on the school's site, whose only quote is from Juliet, a current parent. Swap or remove them before recording the Loom.",
    "The demo lists the Remote Program as offered; the site says \"Coming for 26/27\", delivered with The Talent School. Update the demo before recording the Loom.",
    "Matthew's team built their own Math Coach Chrome extension (privacy page, Oct 25, 2026), so expect a technical reader; keep claims plain.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "We'd build: Calendar that syncs to Google or Apple calendars",
  ],
  snapshot: {
    token: "aKB6n1c9zqe_NPrJ186sKQ",
    preparedOn: "2026-11-22",
    summary:
      "We read 28 pages of austinmicroschool.org on Nov 22, 2026, from Tuition & Fees and the Day Pass to the 2026–27 calendar, plus the Acuity tour booking page.",
    pageSpeed: { mobileScore: 99, url: "https://www.austinmicroschool.org/", checkedOn: "2026-11-22" },
    observations: [
      {
        area: "tour",
        gap: "Two different first steps",
        saw: "Every page has a Book a Tour button that opens a 20-minute Campus Tour on Acuity. The FAQ answers \"Can I schedule a tour?\" by asking families to schedule a call first, with touring as a later step.",
        impact: "A family reading the FAQ may book a call when they could have booked the tour, and you get some families through each route.",
        source: "Austin Micro School FAQs",
        url: "https://www.austinmicroschool.org/faqs",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families book the tour or the call from your open time slots on your own site, and both land under the same family in one admin inbox.",
        },
      },
      {
        area: "tour",
        gap: "The Day Pass intake form isn't on the site",
        saw: "Day Pass families are asked to bring the completed intake form and medical/allergy information. The site doesn't link the form or say how families get it.",
        impact: "Each family needs the form sent to them before their child's day, and you check it on paper at drop-off.",
        source: "Austin Micro School Young Leader Day Pass",
        url: "https://www.austinmicroschool.org/day-pass",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["forms-documents", "student-records"],
          text: "We'd set up the intake and allergy form to fill in and sign online once the Day Pass is booked, so it's on the child's record before they arrive.",
        },
      },
      {
        area: "enroll",
        gap: "After \"pick a start date\", the next steps aren't on the site",
        saw: "The process ends with the Learning Profile: \"If it's a fit, pick a start date.\" The $500 enrollment fee is due on enrollment, but the site doesn't say what families fill in, sign or how they pay it.",
        impact: "Families ask how to finish, and you send and track the paperwork and fee for each new student yourself.",
        source: "Austin Micro School Admissions Process",
        url: "https://www.austinmicroschool.org/process",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "After the Learning Profile, you send one checklist: the enrollment agreement signed online and the $500 fee paid in the same place, with reminders.",
        },
      },
      {
        area: "pay",
        gap: "TEFA families pay from two places",
        saw: "Tuition & Fees says you accept TEFA funds toward tuition, and Full-Time is $18,000 in 10 payments of $1,800. The site doesn't say how a TEFA family's remaining share is billed.",
        impact: "A TEFA family can't see what they still owe each month, and you match state payments against each family's auto-draft by hand.",
        source: "Austin Micro School Tuition & Fees",
        url: "https://www.austinmicroschool.org/tuition-fees",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing so the TEFA portion is recorded against each family, and they see and pay only what's left.",
        },
      },
      {
        area: "pay",
        gap: "Payment rules are on a page, not in a family's account",
        saw: "Families choose pay in full by August 1 (save 10%) or 10 auto-drafted payments on the 1st, with a $50 late fee after the 5th and $50 more every five days. The site doesn't say how a family sets up the auto-draft.",
        impact: "Families ask how to sign up for the draft, and a missed setup turns into a late fee you have to explain.",
        source: "Austin Micro School Tuition & Fees",
        url: "https://www.austinmicroschool.org/tuition-fees",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "autopay", "parent-billing"],
          text: "Families pick pay-in-full or 10 payments and turn on autopay in their own login, and see every invoice and what's due next.",
        },
      },
      {
        area: "pay",
        gap: "No stated way to apply for financial assistance",
        saw: "Accepted families, and families already enrolled, are invited to apply for financial assistance. The page doesn't link an application or say how to send one.",
        impact: "Families who need help have to ask for the form, and some may not ask.",
        source: "Austin Micro School Tuition & Fees",
        url: "https://www.austinmicroschool.org/tuition-fees",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["forms-documents", "parent-portal"],
          text: "We'd set up the assistance application as a form families fill in from their own login once they're accepted.",
        },
      },
      {
        area: "updates",
        gap: "The calendar is a web page and a printable PDF",
        saw: "The 2026–27 calendar lists 26 key dates, from half days to the NCI Leadership Retreat, on a page and in a printable PDF. Families copy each date into their own calendar.",
        impact: "When a date changes, families with the printout don't see it, and you send the change separately.",
        source: "Austin Micro School Calendar & Events",
        url: "https://www.austinmicroschool.org/calendar-events",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "calendar-sync"],
          text: "We'd set up a school calendar in each family's login that syncs to Google or Apple calendars, so changes reach every phone.",
        },
      },
      {
        area: "website",
        gap: "The Remote Program still says \"Coming for 26/27\"",
        saw: "The 2026–27 year started August 18, and the Remote Program page still reads \"Coming for 26/27\" and \"We are excited to share more about this soon.\" The home page scores 99 out of 100 for speed on a phone.",
        impact: "A Texas family looking for remote school can't tell whether they can enroll this year.",
        source: "Austin Micro School Remote Program",
        url: "https://www.austinmicroschool.org/programs-remote",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity"],
          text: "Each program is marked Open, Waitlist, Full or Closed in one place, so families see where they stand before they book.",
        },
      },
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro: acknowledge the August email, give a new reason (the snapshot), one proof number",
      subject: "TEFA families at Austin Micro",
      body: `Hi Matthew,

I wrote in August about a version of MudKitchen I set up for Austin Micro. Since then I put together a one-page snapshot of what a family sees on your site today, from booking a tour to paying tuition.

One thing stood out: you accept TEFA funds, and with Full-Time at 10 auto-drafted payments of $1,800, a TEFA family pays from two places, the state account and their own.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Matthew,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Austin Micro version: a tour inquiry landing in your admin, the enrollment checklist and the billing page a parent sees.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school is, with no pitch",
      where: "Instagram (austinmicro) or Facebook (austinmicroschool)",
      body: "Hi Matthew, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. A SystemsGo rocket launch for your middle schoolers sounds like a great way to end the year.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Matthew,

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
      body: `Hi Matthew,

I'll leave it here so I'm not cluttering your inbox. The Austin Micro version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck filling those four open roles.

Julius`,
    },
  ],
};
