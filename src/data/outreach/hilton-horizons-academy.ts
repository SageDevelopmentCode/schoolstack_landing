import type { OutreachPlan } from "./types";

export const hiltonHorizonsAcademyOutreach: OutreachPlan = {
  slug: "hilton-horizons-academy",
  schoolName: "Hilton Horizons Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Candice",
    role: "Founder and Lead Educator",
    source: "Hilton Horizons Meet Our Team page (Candice Hilton, founder of Hilton Horizons Academy)",
  },
  angle: "Re-contact with a snapshot: the Enrollment page still says 2025-26 while four campuses run 2026–27",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the Hilton Horizons Academy MudKitchen demo",
  },
  facts: [
    {
      fact: "The Enrollment page says \"Enrollment is now OPEN for the 2025-26 school year\"; the site banner says to stay tuned for 2026-2027 enrollment",
      source: "Hilton Horizons Enrollment",
      url: "https://www.hiltonhorizonsacademy.com/enrollment",
      readOn: "2026-11-22",
    },
    {
      fact: "Hybrid campuses in Kingsport, Johnson City, Elizabethton and Hawkins County each list 2026–27 start dates; hybrid plans are $3,600, $5,100 or $7,950 a year, in 10 payments or 2 (5% off)",
      source: "Hilton Horizons Kingsport Hybrid Microschool",
      url: "https://www.hiltonhorizonsacademy.com/kingsport-hybrid-microschool",
      readOn: "2026-11-22",
    },
    {
      fact: "The full-time Kingsport private school is $9,800 a year; as an approved provider, Hilton Horizons deducts the $7,500 TN Education Freedom Scholarship, leaving $230 a month",
      source: "Hilton Horizons Kingsport Private School",
      url: "https://www.hiltonhorizonsacademy.com/kingsport-private-school",
      readOn: "2026-11-22",
    },
    {
      fact: "Enrolling: a KaiPod Wufoo enrollment form, then Omella for the $150 fee (cards add 3.49% + $0.30, with an optional tip to Omella)",
      source: "Hilton Horizons Enrollment",
      url: "https://www.hiltonhorizonsacademy.com/enrollment",
      readOn: "2026-11-22",
    },
    {
      fact: "Tours and calls are booked on Calendly; the contact form is KaiPod's Jotform; Candice is a KaiPod Catalyst",
      source: "Hilton Horizons Contact and Meet Our Team pages",
      url: "https://www.hiltonhorizonsacademy.com/contact",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June (the first email says so).",
    "Check the Enrollment page still says 2025-26 before sending (the first email quotes it).",
    "Uses KaiPod's Jotform: decide whether to pitch replacing it (the contact form runs on KaiPod's account).",
    "Uses KaiPod's Wufoo: decide whether to pitch replacing it (the enrollment form runs on kaipodlearning.wufoo.com, and Candice is a KaiPod Catalyst).",
    "The demo shows \"Contact for tuition\" on both programs; the site now lists $9,800 for the private school and $3,600–$7,950 for the hybrid. Consider updating it before recording the Loom.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "We'd build: Several locations in one account",
  ],
  snapshot: {
    token: "G6Zs3wsPn-vdJBYQU51cCQ",
    preparedOn: "2026-12-01",
    summary: "We read all 16 pages of hiltonhorizonsacademy.com on Dec 1, 2026, from each campus page to Enrollment and the FAQ, plus the enrollment form.",
    pageSpeed: { mobileScore: 55, url: "https://www.hiltonhorizonsacademy.com/", checkedOn: "2026-12-01" },
    toolStack: [
      { name: "Calendly", usedFor: "Booking a tour or call", url: "https://www.hiltonhorizonsacademy.com/enrollment" },
      { name: "Jotform", usedFor: "Contact form", url: "https://www.hiltonhorizonsacademy.com/contact", network: "KaiPod" },
      { name: "Wufoo", usedFor: "Enrollment form", url: "https://www.hiltonhorizonsacademy.com/enrollment", network: "KaiPod" },
      { name: "Omella", usedFor: "$150 registration fee", url: "https://www.hiltonhorizonsacademy.com/enrollment" },
      { name: "Google Forms", usedFor: "Curriculum opt-in and MAP testing opt-out", url: "https://www.hiltonhorizonsacademy.com/program" },
      { name: "Google Sheets", usedFor: "School calendars", url: "https://www.hiltonhorizonsacademy.com/calendar" },
    ],
    observations: [
      {
        area: "find",
        gap: "The Enrollment page still says 2025-26",
        saw: "The Enrollment page says enrollment is open for the 2025-26 school year, and the banner on every page says to stay tuned for 2026-2027 enrollment. The campus pages already list 2026–27 start dates.",
        impact: "A family ready to join this year can't tell whether they can, or which year the form is for.",
        source: "Hilton Horizons Enrollment",
        url: "https://www.hiltonhorizonsacademy.com/enrollment",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build keeps programs, years and enrollment status in one place, so every page says the same thing, and we keep it current.",
        },
      },
      {
        area: "apply",
        gap: "Joining takes three tools in a row",
        saw: "Families book a tour on Calendly, fill in the enrollment form on Wufoo, then get sent to Omella to pay the $150 fee. Questions go through a separate Jotform.",
        impact: "Each step opens a new site, and you piece every family together from four places.",
        source: "Hilton Horizons Enrollment",
        url: "https://www.hiltonhorizonsacademy.com/enrollment",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Inquiries and applications come in on your own site with saved drafts, and every family lands in one admin inbox.",
        },
      },
      {
        area: "pay",
        gap: "Paying the $150 fee asks families for a tip",
        saw: "The Enrollment page explains that Omella adds 3.49% + $0.30 to card payments and shows a tip that doesn't go to Hilton Horizons, left on so the school can use Omella for free.",
        impact: "A family's first payment comes with a fee note and a tip prompt for another company, before their child has started.",
        source: "Hilton Horizons Enrollment",
        url: "https://www.hiltonhorizonsacademy.com/enrollment",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-fees", "card-and-ach"],
          text: "The registration fee is paid in the family's enrollment checklist by card or bank, with no tip prompt.",
        },
      },
      {
        area: "pay",
        gap: "Ten monthly payments, no stated way to pay them",
        saw: "Tuition is split into 10 payments due on the 1st from August to May, or 2 payments with 5% off. The site doesn't say how families make those payments.",
        impact: "Families ask how to pay each month, and you chase installments across four campuses.",
        source: "Hilton Horizons Kingsport Hybrid Microschool",
        url: "https://www.hiltonhorizonsacademy.com/kingsport-hybrid-microschool",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families pick 10 payments or 2 in their portal and turn on autopay by card or bank. Each installment is charged on the 1st.",
        },
      },
      {
        area: "pay",
        gap: "Private school families have two payers",
        saw: "The Kingsport private school is $9,800, and Hilton Horizons deducts the $7,500 Education Freedom Scholarship, leaving $230 a month. The page explains the math well but not where a family sees what EFS has covered.",
        impact: "Families can't check their own balance against the scholarship, so those questions come to you.",
        source: "Hilton Horizons Kingsport Private School",
        url: "https://www.hiltonhorizonsacademy.com/kingsport-private-school",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing so the EFS amount is recorded against each family, and they see what's covered and pay only their $230 a month.",
        },
      },
      {
        area: "enroll",
        gap: "Opt-ins and opt-outs are separate Google Forms",
        saw: "Our Program links a Curriculum Opt-In Form and a MAP Testing Opt-Out as two Google Forms, apart from the enrollment form.",
        impact: "Answers live outside each student's record, and you check several sheets to know who chose what.",
        source: "Hilton Horizons Our Program",
        url: "https://www.hiltonhorizonsacademy.com/program",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["forms-documents"],
          text: "Opt-in and opt-out forms go in each family's portal and are filled in online, so answers stay with the student.",
        },
      },
      {
        area: "updates",
        gap: "Calendars cover two of four campuses, for last year",
        saw: "The Calendar page links Kingsport and Johnson City calendars for 25-26 as Google Sheets. Elizabethton and Hawkins County have none.",
        impact: "Families at the newer campuses, and everyone this year, check each campus page or ask for dates.",
        source: "Hilton Horizons Calendar",
        url: "https://www.hiltonhorizonsacademy.com/calendar",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "multi-location"],
          text: "We'd set up one school calendar with each campus's dates, so families see only their own.",
        },
      },
      {
        area: "website",
        gap: "About Us in the footer returns a 404",
        saw: "Every page's footer links to About Us, which returns \"page not found\". The home page scores 55 out of 100 for speed on a phone.",
        impact: "A family looking for who runs the school hits a dead end from any page.",
        source: "Hilton Horizons About Us link",
        url: "https://www.hiltonhorizonsacademy.com/about",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you is checked for dead links and kept fast on a phone.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Hilton Horizons",
    founder: {
      fullName: "Candice Hilton",
      firstName: "Candice",
      role: "Founder and Lead Educator",
      source: "Hilton Horizons Academy, Our Team",
      url: "https://www.hiltonhorizonsacademy.com/ourteam",
    },
    mailTo: {
      lines: ["Candice Hilton", "Hilton Horizons Academy", "1526 Bridgewater Ln. Unit 200", "Kingsport, TN 37660"],
      source: "Hilton Horizons, Kingsport Private School page",
      url: "https://www.hiltonhorizonsacademy.com/kingsport-private-school",
    },
    founderFacts: [
      {
        fact: "Candice was on the LiberatED Podcast in August 2024, just after opening Hilton Horizons in Kingsport with 12 students in a three-day program, a year after leaving her public school teaching job.",
        source: "LiberatED Podcast, From Public School to Microschool: A Tennessee Teacher's Bold New Venture",
        url: "https://podcasts.apple.com/us/podcast/from-public-school-to-microschool-a-tennessee/id1608978473?i=1000666781424",
        readOn: "2026-11-22",
      },
      {
        fact: "On Johnson City Living (February 2025), Candice Hilton said of starting her hybrid microschool: \"if my daughter would love this, then the community would love this.\"",
        source: "Johnson City Living, Exploring Homeschooling with Hilton Horizons Academy's Candice Hilton",
        url: "https://podcasts.apple.com/us/podcast/217-exploring-homeschooling-with-hilton-horizons/id1676085306?i=1000689939341",
        readOn: "2026-11-22",
      },
      {
        fact: "Hilton Horizons now lists campuses in Kingsport, Johnson City, Elizabethton and Hawkins County, alongside an accredited Category III private school.",
        source: "Hilton Horizons Academy home page",
        url: "https://www.hiltonhorizonsacademy.com/",
        readOn: "2026-11-22",
      },
      {
        fact: "Candice is a KaiPod Catalyst partner and a VELA Founder, and a member of the National Microschooling Center and the National Hybrid Schools Society.",
        source: "Hilton Horizons Academy, Our Team",
        url: "https://www.hiltonhorizonsacademy.com/ourteam",
        readOn: "2026-11-22",
      },
    ],
    hook: "Candice was on the LiberatED Podcast in August 2024, just after opening Hilton Horizons in Kingsport with 12 students in a three-day program, a year after leaving her public school teaching job.",
    body: `Hi Candice,

I heard you on LiberatED back when you'd just opened in Kingsport with 12 students. Now there are four campuses. Congratulations on so much growth in two years.

Running a small school ourselves, I know how much that takes. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Hilton Horizons.

I'd love to hear how you're handling enrollment across four campuses.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment. I emailed once in June, but a note seemed better.",
    stickyNote: "Candice, a note from a microschool in Texas. J",
    shortCode: "hilton-w2k9",
    checkBeforeMailing: [
      "Unit 200 is the Kingsport private school and Unit 300 the hybrid microschool in the same building. Unit 200 is used; switch if you know she works from 300.",
      "The four campuses come from the home page. Check it still says so before mailing.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the June email, one detail from the snapshot, one proof number",
      subject: "Hilton Horizons enrollment page",
      body: `Hi Candice,

I mailed you a handwritten note last week, with a card for the version of MudKitchen I set up for Hilton Horizons (I first wrote about it in June) and a one-page snapshot of what a family sees on your site today.

One thing stood out: your Enrollment page still says enrollment is open for 2025-26, while the campus pages already list 2026–27 start dates.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Candice,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Hilton Horizons version: the homepage, enrollment and tuition from a parent's side, and your admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school posts, with no pitch",
      where: "Facebook (Hilton Horizons Academy) or Instagram",
      body: "Hi Candice, I'm Julius. I run Sage Field, a small microschool in Round Rock, TX. Great to see Hilton Horizons grow to four Tri-Cities campuses plus the Kingsport private school.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Candice,

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
      body: `Hi Candice,

I'll leave it here so I'm not cluttering your inbox. The Hilton Horizons version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the year across all four campuses.

Julius`,
    },
  ],
};
