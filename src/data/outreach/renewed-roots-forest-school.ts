import type { OutreachPlan } from "./types";

export const renewedRootsForestSchoolOutreach: OutreachPlan = {
  slug: "renewed-roots-forest-school",
  schoolName: "Renewed Roots Forest School",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Danielle",
    role: "Founder (Danielle Knosalla)",
    source: "Renewed Roots Team page (\"Danielle Knosalla, Founder + Summer Camp Wanderer Guide\")",
  },
  angle:
    "One real question: the camp form asks families to pay their deposit by Venmo, a mailed check or a check dropbox in Fargo, and a spot isn't held until it arrives. With summer 2027 sign-ups coming, how does Danielle match each deposit to the right family and week?",
  facts: [
    {
      fact: "Renewed Roots is a nature-based microschool at Red River Acres, a 70-acre farmstead in south Moorhead, MN, with Forest Preschool (Wanderers, 3–5), Forest Microschool (Trailblazers 6–11, Stewards 12–16) and Summer Forest Camp",
      source: "Renewed Roots home and Forest School pages",
      url: "https://www.renewedrootsschool.org/forest-school",
      readOn: "2026-11-23",
    },
    {
      fact: "Our Story: a local pastor who didn't know they were looking asked if they might be interested in purchasing his 70-acre property, a farmstead in Moorhead along the Red River",
      source: "Renewed Roots, Our Story",
      url: "https://www.renewedrootsschool.org/our-story",
      readOn: "2026-11-23",
    },
    {
      fact: "The camp enrollment form's Deposit Method lists Venmo, mailing a check, or a check dropbox on a post at Oxford Realty's office in Fargo, and says the spot isn't held until the deposit is received",
      source: "Renewed Roots, Summer Camp Enrollment form",
      url: "https://www.renewedrootsschool.org/camp-enrollment",
      readOn: "2026-11-23",
    },
    {
      fact: "Before camp enrollment, families review three Google Drive files: the Summer Camp Parent Handbook, a 3-page Child Profile (with a medical action plan and signature line) and a 5-page New Family Enrollment form (initials, water and tool-use consents, signatures)",
      source: "Renewed Roots, Summer Camp Enrollment; the linked Drive PDFs",
      url: "https://www.renewedrootsschool.org/camp-enrollment",
      readOn: "2026-11-23",
    },
    {
      fact: "Forest School runs 8:00–4:30, September–May, 175 days, billed bi-weekly: yearly (5% pay-in-full discount), weekly ($255 Trailblazers, $225 Stewards) or daily part-time ($63/$53) on two-day tracks with an optional Friday add-on; sibling discounts on full-time only; payment by card, ACH or invoice",
      source: "Renewed Roots, Tuition Guide",
      url: "https://www.renewedrootsschool.org/tuition-guide",
      readOn: "2026-11-23",
    },
    {
      fact: "Forest School and Preschool require an online application and a director call before official enrollment paperwork; for the founding year, parent inquiry calls are scheduled in lieu of tours",
      source: "Renewed Roots, FAQs",
      url: "https://www.renewedrootsschool.org/faqs",
      readOn: "2026-11-23",
    },
    {
      fact: "The camp form still shows summer 2026: \"Sibling and Early Bird Discounts ended 3/1/26\", Monthly and Full Summer marked FULL, and several June–August weeks \"FULL, join waitlist\"",
      source: "Renewed Roots, Summer Camp Enrollment form",
      url: "https://www.renewedrootsschool.org/camp-enrollment",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "We'd build: An ordered waitlist with automatic offers. Confirm before sending the snapshot.",
    "The CRM row has no city; the school is in Moorhead, MN (Fargo-Moorhead), and serves North Dakota families too. Minnesota has no ESA, so the plan leaves funding out.",
    "2026–27 is the school's founding year, so keep the tone to a first-year school.",
    "Camp deposits go partly to a personal Venmo account. The snapshot describes it as Venmo without naming the account.",
    "No Instagram or Facebook is linked from the site; find their page before the social step, or skip it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "s-mixu4jgXukt3vjkd33Fw",
    preparedOn: "2026-11-23",
    summary:
      "We read all 16 pages of renewedrootsschool.org on Nov 23, 2026, plus the inquiry, application and camp forms and the camp PDFs.",
    pageSpeed: { mobileScore: 56, url: "https://www.renewedrootsschool.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Website forms",
        usedFor: "Inquiry, Forest School application and camp registration",
        url: "https://www.renewedrootsschool.org/enroll-now",
      },
      {
        name: "Venmo",
        usedFor: "Camp deposits",
        url: "https://www.renewedrootsschool.org/camp-enrollment",
      },
      {
        name: "Mailed checks and a check dropbox",
        usedFor: "Camp deposits",
        url: "https://www.renewedrootsschool.org/camp-enrollment",
      },
      {
        name: "Google Drive PDFs",
        usedFor: "Camp enrollment forms, child profile and handbook",
        url: "https://www.renewedrootsschool.org/documents",
      },
    ],
    observations: [
      {
        area: "pay",
        gap: "Camp deposits go three different ways",
        saw: "The camp form asks families to choose how they'll pay their deposit: Venmo, a check in the mail, or a check left in a dropbox on a post at a realty office in Fargo. It says the spot isn't held until the deposit is received.",
        impact: "A family who mails a check or uses the dropbox can't see when it arrives, or whether their camp week is now held.",
        source: "Renewed Roots, Summer Camp Enrollment form",
        url: "https://www.renewedrootsschool.org/camp-enrollment",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-fees", "card-and-ach", "parent-billing"],
          text: "Families pay the deposit by card or bank as they register, and their billing page shows it paid and the week held.",
        },
      },
      {
        area: "enroll",
        gap: "Camp paperwork is eight pages of PDFs",
        saw: "Before registering, families review a 5-page New Family Enrollment form (initials, water and tool-use consents, signatures) and a 3-page Child Profile with a medical action plan, both Google Drive PDFs. The online form only asks them to confirm they've reviewed the forms.",
        impact: "After registering online, families still have two PDFs to fill in and sign, and the site doesn't say how to send them back.",
        source: "Renewed Roots, Summer Camp Enrollment and the linked Drive PDFs",
        url: "https://www.renewedrootsschool.org/camp-enrollment",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["forms-documents", "enrollment-checklist", "student-records"],
          text: "The family form, child profile and consents become online forms families fill in and sign in one checklist, saved to each child's record.",
        },
      },
      {
        area: "pay",
        gap: "Families work out their own bi-weekly bill",
        saw: "The Tuition Guide lists three options per age group (yearly at a 5% discount, weekly, or daily part-time), two-day tracks with a Friday add-on, and sibling discounts on full-time only, all billed bi-weekly.",
        impact: "A family on a two-day track with a Friday add-on, or with children in two programs, has to do the math to know what each bill will be.",
        source: "Renewed Roots, Tuition Guide",
        url: "https://www.renewedrootsschool.org/tuition-guide",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "parent-plan-choice", "discounts", "autopay"],
          text: "Each option is set up once. Families pick theirs, see the exact bi-weekly amount with any sibling discount, and can turn on autopay.",
        },
      },
      {
        area: "tour",
        gap: "The director call is arranged by message",
        saw: "Forest School and Preschool need an application and a director call, and this year inquiry calls replace tours. Schedule an Info Call opens the inquiry form, which asks for a \"preferred contact method and time of day\".",
        impact: "A family describes when they're free and waits to hear back before their call is set.",
        source: "Renewed Roots, FAQs and Registration Inquiry",
        url: "https://www.renewedrootsschool.org/faqs",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick an info call or director call from your open times, and each one shows up with their inquiry in one admin inbox.",
        },
      },
      {
        area: "website",
        gap: "Camp registration still shows summer 2026",
        saw: "The Summer Camp Registration form says \"Sibling and Early Bird Discounts ended 3/1/26\", marks Monthly and Full Summer FULL, and lists June–August 2026 weeks, several \"FULL, join waitlist\".",
        impact: "A family planning next summer sees last summer's weeks, mostly full, and can't tell whether 2027 registration is open.",
        source: "Renewed Roots, Summer Camp Enrollment form",
        url: "https://www.renewedrootsschool.org/camp-enrollment",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "waitlist-queue"],
          text: "Each camp week shows Open, Waitlist or Full on its own, and we'd set up a waitlist that offers a freed spot to the next family.",
        },
      },
      {
        area: "website",
        gap: "Several pages are titled \"General 2\" or \"About 4\"",
        saw: "The Programs page's title is \"General 2\", Forest School is \"About 4\", Campus is \"Reviews 1\", Preschool is \"General 3\", Camps is \"General 6\" and the application is \"Appointments 2\".",
        impact: "Families see those names in their browser tab and in search results instead of Programs, Campus or Apply.",
        source: "Renewed Roots, page titles across the site",
        url: "https://www.renewedrootsschool.org/programs",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with each page named for what it is.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 56 out of 100 on mobile. The main content takes about 7 seconds to appear, and the page is about 2.9 MB.",
        impact: "A parent opening the site on a phone waits several seconds before they see anything about the school.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://www.renewedrootsschool.org/",
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
    shortSchoolName: "Renewed Roots",
    founder: {
      fullName: "Danielle Knosalla",
      firstName: "Danielle",
      role: "Founder + Summer Camp Wanderer Guide",
      source: "Renewed Roots, Team",
      url: "https://www.renewedrootsschool.org/team",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Renewed Roots' Our Story says a local pastor, who didn't know they were looking for land, reached out and asked if they might be interested in purchasing his 70-acre property in Moorhead along the Red River.",
        source: "Renewed Roots, Our Story",
        url: "https://www.renewedrootsschool.org/our-story",
        readOn: "2026-11-23",
      },
      {
        fact: "Danielle Knosalla, the founder, has over 15 years of experience in childcare and guides the youngest learners, the Wanderers.",
        source: "Renewed Roots, Team",
        url: "https://www.renewedrootsschool.org/team",
        readOn: "2026-11-23",
      },
      {
        fact: "2026–27 is Renewed Roots' founding school year; the first day of Forest School was September 8, 2026.",
        source: "Renewed Roots, FAQs and Forest School Enrollment Application",
        url: "https://www.renewedrootsschool.org/faqs",
        readOn: "2026-11-23",
      },
    ],
    hook: "Renewed Roots' Our Story says a local pastor, who didn't know they were looking for land, reached out and asked if they might be interested in purchasing his 70-acre property in Moorhead along the Red River.",
    body: `Hi Danielle,

I loved the part on your Our Story page where a local pastor, not knowing you were looking, asked if you'd buy his 70 acres along the Red River. Now there's a barn classroom, goats and a first year of forest school.

What a gift. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Renewed Roots.

I'd love to hear how your first winter on the land is going.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Danielle, a note from an outdoor microschool in Round Rock, Texas. J",
    shortCode: "renewedroots-m4q9",
    checkBeforeMailing: [
      "Find a mailing address: the site gives only \"Red River Acres, Moorhead, MN\" with no street address. The camp form's mail-a-check address is a residential street in West Fargo under Danielle's name, which looks like a home, so it isn't stored. The other option, a check dropbox at Oxford Realty's office in Fargo, isn't a mailing address. Leads: the farmstead's address, or ask by email.",
      "No podcast, interview or press about Danielle or Renewed Roots turned up, so the letter opens on the founding story from Our Story.",
      "The story mentions their faith (\"Godwinks\"); the letter keeps to the land and the pastor, the way the page tells it.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about camp deposits arriving three ways, then who's asking and one proof number",
      subject: "camp deposits at Renewed Roots",
      body: `Hi Danielle,

I mailed you a handwritten note last week with a card for Renewed Roots.

Your camp form asks families to send their deposit by Venmo, a mailed check or the check dropbox in Fargo, and a spot isn't held until it arrives.

With summer 2027 sign-ups coming, how do you match each deposit to the right family and week?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Danielle,

In case it's easier to see than describe, I set up a version of MudKitchen for Renewed Roots and recorded a 60-second walkthrough: an inquiry landing in your admin inbox, the deposit and registration in one checklist, and the bi-weekly billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Renewed Roots is, with no pitch",
      where: "Facebook or Instagram (none are linked from the site; search for Renewed Roots Forest School Moorhead first)",
      body: "Hi Danielle, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. I liked meeting Gloves the goat on your Team page.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Danielle,

I also put together a one-page snapshot of what a family sees on your site today, from the first inquiry to the camp deposit. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Danielle,

I'll leave it here so I'm not cluttering your inbox. The Renewed Roots version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with your first winter at Red River Acres.

Julius`,
    },
  ],
};
