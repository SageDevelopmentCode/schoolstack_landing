import type { OutreachPlan } from "./types";

export const athenaMicroacademyOutreach: OutreachPlan = {
  slug: "athena-microacademy",
  schoolName: "Athena Micro-academy of Austin",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Mily",
    role: "Founder",
    source: "microschool.directory listing (Mily Pérez, Founder); confirm on amaustin.org Meet the Founder",
  },
  angle: "Re-contact with a snapshot: TEFA families pay from two places, Odyssey and the family",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the Athena MudKitchen demo",
  },
  facts: [
    {
      fact: "Approved TEFA vendor; families can find Athena on Odyssey",
      source: "Athena FAQ",
      url: "https://www.amaustin.org/faqs.html",
      readOn: "2026-11-22",
    },
    {
      fact: "Full-time tuition is $17,000 a year; part-time is $10,200",
      source: "Athena Tuition/Pricing",
      url: "https://www.amaustin.org/tuitionpricing.html",
      readOn: "2026-11-22",
    },
    {
      fact: "Three payment plans: 12 monthly installments, 2 payments (3% off) or 1 payment (5% off); 10% sibling discount",
      source: "Athena Tuition/Pricing",
      url: "https://www.amaustin.org/tuitionpricing.html",
      readOn: "2026-11-22",
    },
    {
      fact: "Five steps to apply: inquiry form, phone call, family visit, Registration Form with a $150 fee, then a deposit and payment schedule. Once registered, school communication goes through Newton (KaiPod's app)",
      source: "Athena Admissions and Parents pages",
      url: "https://www.amaustin.org/admissions.html",
      readOn: "2026-11-22",
    },
    {
      fact: "TEFA pays $10,474 per child at an approved private school for 2026–27",
      source: "Texas Education Freedom Accounts",
      url: "https://educationfreedom.texas.gov/schools/",
      readOn: "2026-11-19",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June (the first email says so).",
    "Confirm the founder's first name (Mily) on Athena's Meet the Founder page.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "Uses KaiPod's Jotform: decide whether to pitch replacing it (Athena's inquiry form runs on KaiPod's account).",
    "Uses KaiPod's Newton: decide whether to pitch replacing it. Families already get school messages there, so messaging isn't pitched as a gap.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "We'd build: Monthly billing for clubs, after-care or add-on classes",
  ],
  snapshot: {
    token: "_4S10rn8WeKBduMSheKCcg",
    preparedOn: "2026-12-01",
    summary: "We read 49 pages of amaustin.org on Dec 1, 2026, from Admissions and Tuition to the Parents and Summer Camps pages.",
    toolStack: [
      { name: "Google Calendar booking", usedFor: "Booking a discovery call", url: "https://www.amaustin.org/contact-us.html" },
      { name: "Jotform", usedFor: "Inquiry form", url: "https://www.amaustin.org/admissions.html", network: "KaiPod" },
      { name: "Square Online store", usedFor: "Tuition listed as a store item", url: "https://www.amaustin.org/store/p1/Full-time_Program.html" },
      { name: "Google Calendar", usedFor: "School calendar", url: "https://www.amaustin.org/school-calendar.html" },
      { name: "Newton", usedFor: "School messages after registering", url: "https://www.amaustin.org/parents.html", network: "KaiPod" },
    ],
    observations: [
      {
        area: "find",
        gap: "Two different grade ranges for 2026–27",
        saw: "The FAQ says 2026–27 is for 6th–11th grade, while the Admissions page and the footer say grades 6–12.",
        impact: "A family with a rising 12th grader can't tell whether to apply, and has to email to find out.",
        source: "Athena FAQs",
        url: "https://www.amaustin.org/faqs.html",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you keeps programs, grades and prices in one place, so every page says the same thing.",
        },
      },
      {
        area: "tour",
        gap: "Families can't book a visit themselves",
        saw: "The in-person family visit is scheduled by Athena after a phone call. Only the discovery call has an online booking link.",
        impact: "Each visit takes a round of calls or emails, and interested families wait on you to find a time.",
        source: "Athena Admissions",
        url: "https://www.amaustin.org/admissions.html",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a visit time from the slots you open, and get a reminder before they come.",
        },
      },
      {
        area: "apply",
        gap: "The $150 fee and the deposit have no way to pay",
        saw: "Step 4 asks for a Registration Form and a nonrefundable $150 fee, and step 5 a deposit. The site doesn't say how to pay either, or how much the deposit is.",
        impact: "Families stop to ask how to pay, and you chase fees by hand before a spot is held.",
        source: "Athena Admissions",
        url: "https://www.amaustin.org/admissions.html",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["online-application", "application-fee"],
          text: "The application takes the $150 fee by card or bank when it's submitted, and the receipt goes out on its own.",
        },
      },
      {
        area: "enroll",
        gap: "Registration paperwork isn't described",
        saw: "A Registration Form is the only paperwork named. The site doesn't say how it's sent, filled in or signed.",
        impact: "Every family gets their forms a different way, and you track who has finished what yourself.",
        source: "Athena Admissions",
        url: "https://www.amaustin.org/admissions.html",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: the registration form, the agreement signed online, and the deposit, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "Tuition is listed in a store at $17,000 \"per item\"",
        saw: "The online store lists the Full-time Program at $17,000 per item with an Add to Cart button, marked Unavailable. The three payment plans don't say how monthly payments are collected.",
        impact: "A family choosing the 12-month plan can't see how they'll pay each month, or set it up themselves.",
        source: "Athena store: Full-time Program",
        url: "https://www.amaustin.org/store/p1/Full-time_Program.html",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families pick monthly, two-pay or annual in their portal and turn on autopay by card or bank. Each installment is charged on the 1st.",
        },
      },
      {
        area: "pay",
        gap: "TEFA families pay from two places",
        saw: "Athena is an approved TEFA vendor on Odyssey and tuition is $17,000. The site doesn't say how the TEFA amount is applied or what the family still owes.",
        impact: "A TEFA family can't see their own share, and you reconcile Odyssey payments against each family by hand.",
        source: "Athena Tuition/Pricing",
        url: "https://www.amaustin.org/tuitionpricing.html",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing"],
          text: "We'd set up billing so the TEFA portion is recorded against each family and they only see and pay what's left.",
        },
      },
      {
        area: "website",
        gap: "Summer camp prices are only in an image",
        saw: "The Summer Camps page shows prices inside a picture, and Clubs lists ideas without a schedule or a way to sign up.",
        impact: "Prices can't be found by search or read on some phones, and sign-ups for camps and clubs happen outside the site.",
        source: "Athena Summer Camps",
        url: "https://www.amaustin.org/summer-camps.html",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "class-billing"],
          text: "Camp and club prices go on the page as text, and we'd set up sign-up with billing for each one.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Athena",
    founder: {
      fullName: "Mily Pérez",
      firstName: "Mily",
      role: "Founder and Head of School",
      source: "Athena Micro-academy of Austin, Meet the Founder",
      url: "https://www.amaustin.org/meet-the-founder.html",
    },
    mailTo: {
      lines: ["9901 Brodie Lane Ste 160 #1383", "Austin, TX 78748"],
      source: "Athena's Contact Us page (listed as the mailing address)",
      url: "https://www.amaustin.org/contact-us.html",
    },
    founderFacts: [
      {
        fact: "On the LiberatED Podcast (September 15, 2026), Mily Pérez talked about keeping Athena intentionally small and designing each student's curriculum backward from their college, career or post-high-school goals.",
        source: "LiberatED Podcast, Building the School Her Son Needed with Mily Pérez",
        url: "https://podcasts.apple.com/us/podcast/building-the-school-her-son-needed-with-mily-p%C3%A9rez/id1608978473?i=1000789785504",
        readOn: "2026-11-22",
      },
      {
        fact: "Mily told LiberatED that her son's experience of not thriving in traditional school inspired her to build Athena.",
        source: "LiberatED Podcast, Building the School Her Son Needed with Mily Pérez",
        url: "https://podcasts.apple.com/us/podcast/building-the-school-her-son-needed-with-mily-p%C3%A9rez/id1608978473?i=1000789785504",
        readOn: "2026-11-22",
      },
      {
        fact: "Mily launched Athena through the KaiPod Catalyst program, which she said gave her the confidence and practical knowledge to start.",
        source: "LiberatED Podcast, Building the School Her Son Needed with Mily Pérez",
        url: "https://podcasts.apple.com/us/podcast/building-the-school-her-son-needed-with-mily-p%C3%A9rez/id1608978473?i=1000789785504",
        readOn: "2026-11-22",
      },
      {
        fact: "Mily has served K-12 students for 22 years, holds an M.Ed. in Educational Leadership, is a certified teacher and principal in Texas, and was most recently Head of School at her alma mater in the Houston area.",
        source: "Athena, Meet the Founder",
        url: "https://www.amaustin.org/meet-the-founder.html",
        readOn: "2026-11-22",
      },
      {
        fact: "Athena announced its location in May 2026 and says it is accredited and TEFA approved.",
        source: "Athena blog, We have a location!",
        url: "https://www.amaustin.org/blog/we-have-a-location",
        readOn: "2026-11-22",
      },
    ],
    hook: "On the LiberatED Podcast (September 15, 2026), Mily Pérez talked about keeping Athena intentionally small and designing each student's curriculum backward from their college, career or post-high-school goals.",
    body: `Hi Mily,

I listened to your LiberatED episode. I liked how you're keeping Athena small on purpose and planning each student's work around where they want to go after high school.

My fiancée and I run Sage Field, an outdoor microschool up in Round Rock. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Athena.

If you're ever up for coffee, I'd like to hear how your first semester is going.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment. I emailed once in June, but a note seemed better.",
    stickyNote: "Mily, a note from a microschool up the road. J",
    shortCode: "athena-q7m4",
    checkBeforeMailing: [
      "Address it to the Brodie Lane mailing address, not the I-35 physical address: the contact page lists them separately.",
      "Listen to the episode before mailing so you can talk about it if she calls.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the June email, one detail from the snapshot, one proof number",
      subject: "TEFA families at Athena",
      body: `Hi Mily,

I mailed you a handwritten note last week with a card for Athena. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in June) and a one-page snapshot of what a family sees on your site today.

One thing stood out: with $17,000 tuition and TEFA paying $10,474, a TEFA family pays from two places, Odyssey and their own account.

I run Sage Field in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Mily,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Athena version: the homepage, what a parent sees for tuition, and your admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Instagram or Facebook (athenamicroacademy)",
      body: "Hi Mily, I'm Julius. I run Sage Field, a microschool up in Round Rock. Glad to see Athena open in South Austin this fall.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Mily,

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
      body: `Hi Mily,

I'll leave it here so I'm not cluttering your inbox. The Athena version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the first term.

Julius`,
    },
  ],
};
