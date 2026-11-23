import type { OutreachPlan } from "./types";

export const heartsongCottageSchoolOutreach: OutreachPlan = {
  slug: "heartsong-cottage-school",
  schoolName: "Heartsong Cottage School",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Heartsong team",
    role: "School leadership (no teacher or director is named on the site)",
    source: "Heartsong Cottage School website (Home, About Us, Classes, Contact): no names are given; the About page signs as \"parents and teachers\"",
  },
  angle:
    "One real question: tuition is $250 a month, families may pay through Venmo, and they may use UFA or OpenEd for reimbursement. What do families send as proof of a Venmo payment when they claim it back?",
  facts: [
    {
      fact: "The monthly total for 2026/27 is $250, due by the first of each month, and includes tuition and a lunch fee; fees due before school are a $60 registration fee, a $15 t-shirt fee and a $140 materials fee ($215); \"Parents may pay through Venmo\"",
      source: "Heartsong Cottage School Classes page",
      url: "https://heartsongschool.wixsite.com/home/classes",
      readOn: "2026-11-22",
    },
    {
      fact: "\"Families may use the UFA scholarship or OpenEd for tuition reimbursement.\"",
      source: "Heartsong Cottage School Home and Classes pages",
      url: "https://heartsongschool.wixsite.com/home/classes",
      readOn: "2026-11-22",
    },
    {
      fact: "Classes run September 8, 2026 to May 27, 2027, Tuesdays to Thursdays, 8:45 a.m. to 12:45 p.m., in three groups: First/Second, Third/Fourth and Fifth/Sixth Grade",
      source: "Heartsong Cottage School Classes page",
      url: "https://heartsongschool.wixsite.com/home/classes",
      readOn: "2026-11-22",
    },
    {
      fact: "The Google Forms application asks families to fill out a separate form for each child and asks whether they'd enroll one child if there's no opening for the others; the Contact page says to use it \"if you'd like to apply or be added to the waitlist\"",
      source: "Heartsong Cottage School Application form (Google Forms) and Contact page",
      url: "https://heartsongschool.wixsite.com/home/contact",
      readOn: "2026-11-22",
    },
    {
      fact: "\"Each day a warm, nutritious meal is served to the children by candlelight.\"",
      source: "Heartsong Cottage School home page (The Shared Meal)",
      url: "https://heartsongschool.wixsite.com/home",
      readOn: "2026-11-22",
    },
    {
      fact: "Every page shows the free Wix banner \"This website was built on Wix. Create yours today.\" and the site lives at heartsongschool.wixsite.com/home",
      source: "Heartsong Cottage School home page",
      url: "https://heartsongschool.wixsite.com/home",
      readOn: "2026-11-22",
    },
    {
      fact: "Google PageSpeed gave the home page a mobile score of 65, with the main image taking about 8 seconds to appear",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fheartsongschool.wixsite.com%2Fhome",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Find a name before sending: the site names no teacher, director or founder. Swap \"Heartsong team\" in every step for a first name once you have one (ask by text or email, or check their social pages).",
    "Send to the school's Gmail address from the Contact page; type it in the send screen.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). Heartsong isn't a UFA vendor; confirm we'd keep each family's receipts ready for UFA and OpenEd claims before sending the snapshot.",
    "We'd build: An ordered waitlist with automatic offers. Confirm before sending the snapshot.",
    "No Instagram or Facebook is linked from the site; find their page before the social step, or skip it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "W0Hy9S7fTRr5lSMPjCy3xA",
    preparedOn: "2026-11-22",
    summary:
      "We read all 4 pages of heartsongschool.wixsite.com on Nov 22, 2026, plus the Google Forms application.",
    pageSpeed: { mobileScore: 65, url: "https://heartsongschool.wixsite.com/home", checkedOn: "2026-11-22" },
    toolStack: [
      {
        name: "Google Forms",
        usedFor: "Application and waitlist, one form per child",
        url: "https://heartsongschool.wixsite.com/home/contact",
      },
      {
        name: "Venmo",
        usedFor: "Monthly tuition and fees",
        url: "https://heartsongschool.wixsite.com/home/classes",
      },
      {
        name: "Contact form",
        usedFor: "Questions (\"Reach Out\")",
        url: "https://heartsongschool.wixsite.com/home/contact",
      },
      {
        name: "Gmail and text",
        usedFor: "Questions and replies to applications",
        url: "https://heartsongschool.wixsite.com/home/contact",
      },
    ],
    observations: [
      {
        area: "pay",
        gap: "Tuition is paid through Venmo",
        saw: "The Classes page lists a $250 monthly total due by the first (tuition and lunch), $215 in fees before school starts, and a yearbook charged at the end of the year. It says \"Parents may pay through Venmo.\" It doesn't mention invoices, receipts or autopay.",
        impact: "Each month someone has to match Venmo payments to families and chase the ones that haven't come in, and families have no statement of what they've paid.",
        source: "Heartsong Cottage School Classes page",
        url: "https://heartsongschool.wixsite.com/home/classes",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "autopay", "card-and-ach"],
          text: "Each family gets a billing page with the $250 due on the 1st, autopay by card or bank, and every past payment in one list.",
        },
      },
      {
        area: "pay",
        gap: "Families claim UFA or OpenEd money back on their own",
        saw: "The Home and Classes pages say \"Families may use the UFA scholarship or OpenEd for tuition reimbursement.\" Families pay Heartsong first, by Venmo, and then claim the money back.",
        impact: "A reimbursement claim needs proof of payment. A Venmo history isn't an invoice, so families may come back to the school for receipts month by month.",
        source: "Heartsong Cottage School Classes page",
        url: "https://heartsongschool.wixsite.com/home/classes",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing that marks which families use UFA or OpenEd, with an itemized invoice and receipt for every payment they can download for their claim.",
        },
      },
      {
        area: "apply",
        gap: "Siblings need a separate application each",
        saw: "The Google Forms application says to \"fill out this form for each child\" and asks each time for the parent's name, email and phone. It also asks whether you'd still enroll this child \"if there is not an opening for your other child(ren)\".",
        impact: "A family with two or three children types their details again for each one, and the school matches sibling forms by hand to see which can be placed together.",
        source: "Heartsong Cottage School Application form (Google Forms)",
        url: "https://heartsongschool.wixsite.com/home/contact",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families apply once with every child on one application, and each child lands in your admin inbox with their class and the family's sibling preference.",
        },
      },
      {
        area: "apply",
        gap: "Applying and joining the waitlist are the same form",
        saw: "The Contact page says \"Fill out this form if you'd like to apply or be added to the waitlist.\" The site doesn't say which classes have room, and the same page has a second \"Reach Out\" message form.",
        impact: "A family can't tell before applying whether their child's class is open, or afterwards whether they've applied or joined a waitlist.",
        source: "Heartsong Cottage School Contact page",
        url: "https://heartsongschool.wixsite.com/home/contact",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "waitlist-queue"],
          text: "Each class would show Open, Waitlist or Full on the site, with an ordered waitlist per class and the next family offered a spot when one opens.",
        },
      },
      {
        area: "enroll",
        gap: "The one-year commitment isn't signed anywhere online",
        saw: "Each class description ends: \"This is a one-year commitment. There are no discounts or refunds for vacations, illness, etc.\" No page says where families agree to it or pay the $215 in fees.",
        impact: "The commitment that matters most if a family leaves mid-year lives only in the page text, with no record that a family agreed to it.",
        source: "Heartsong Cottage School Classes page",
        url: "https://heartsongschool.wixsite.com/home/classes",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families sign the one-year commitment and pay the $215 in fees in one online checklist, with a signed copy kept for each family.",
        },
      },
      {
        area: "updates",
        gap: "There's no school calendar on the site",
        saw: "The Classes page gives the first and last day and says the schedule \"includes up to two, last minute cancellations due to illness or weather.\" No page lists breaks or events, or says how families hear about a cancellation.",
        impact: "Families plan the year around dates they have to ask for, and a last-minute cancellation has to reach every family some other way.",
        source: "Heartsong Cottage School Classes page",
        url: "https://heartsongschool.wixsite.com/home/classes",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "messaging", "mobile-app"],
          text: "Breaks and events would live on one calendar in each family's login, and a cancellation goes to every family at once in the iPhone app.",
        },
      },
      {
        area: "website",
        gap: "Every page opens with an ad for Wix",
        saw: "Each page starts with the banner \"This website was built on Wix. Create yours today. Get Started\", and the address is heartsongschool.wixsite.com/home.",
        impact: "The first thing a parent sees is an ad for someone else, and the address is hard to remember or share.",
        source: "Heartsong Cottage School home page",
        url: "https://heartsongschool.wixsite.com/home",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host a site for Heartsong on its own address, with no ads.",
        },
      },
      {
        area: "website",
        gap: "The main image is slow to appear on a phone",
        saw: "Google PageSpeed gave the home page a mobile score of 65, with the main image taking about 8 seconds to show.",
        impact: "A parent opening the site from a phone waits several seconds before seeing anything.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fheartsongschool.wixsite.com%2Fhome",
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
    shortSchoolName: "Heartsong",
    founder: {
      fullName: "Heartsong Cottage School team",
      firstName: "Heartsong team",
      role: "Parents and teachers who run the co-op",
      source: "Heartsong Cottage School About Us page",
      url: "https://heartsongschool.wixsite.com/home/about-us",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Heartsong's home page says that each day a warm, nutritious meal is served to the children by candlelight, a tradition meant to foster reverence and connection.",
        source: "Heartsong Cottage School home page (The Shared Meal)",
        url: "https://heartsongschool.wixsite.com/home",
        readOn: "2026-11-22",
      },
      {
        fact: "Heartsong describes itself as a co-op and supplement for homeschooling families, with cozy in-home classrooms, small classes and accessible tuition.",
        source: "Heartsong Cottage School home and About Us pages",
        url: "https://heartsongschool.wixsite.com/home/about-us",
        readOn: "2026-11-22",
      },
    ],
    hook: "Heartsong's home page says that each day a warm, nutritious meal is served to the children by candlelight, a tradition meant to foster reverence and connection.",
    body: `Hi Heartsong team,

Rachael Sparhawk, who founded Rooted Meadows in Rigby, Idaho, mentioned Heartsong to me. I liked reading about your shared meal, a warm lunch served to the children by candlelight every school day.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Heartsong.

I'd like to hear how the co-op got started and who's behind it.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Heartsong team, a note from an outdoor microschool in Round Rock, Texas. J",
    shortCode: "heartsong-r7c2",
    checkBeforeMailing: [
      "Opens with Rachael Sparhawk's referral (Rooted Meadows); confirm she's happy to be named.",
      "Find a mailing address: the site gives only \"Highland, Utah 84003\" and says classes are held in-home. A directory listing shows a Highland street address that looks like a home, so nothing is stored. Leads: ask by text or email for a mailing address.",
      "No teacher, director or founder is named on the site, so the letter is addressed to the team and opens on a school fact from the home page. Swap the greeting for a first name if you find one.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about Venmo payments and UFA or OpenEd reimbursement, then who's asking and one proof number",
      subject: "Venmo receipts at Heartsong",
      body: `Hi Heartsong team,

I mailed you a handwritten note last week with a card for Heartsong.

Your Classes page says the $250 monthly tuition, lunch included, can go through Venmo, and that families may use their UFA scholarship or OpenEd for reimbursement.

When a family claims that money back, what do they send as proof of a Venmo payment?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they can see it without clicking around",
      body: `Hi Heartsong team,

In case it's easier to see than describe, I set up a version of MudKitchen for Heartsong and recorded a 60-second walkthrough: an application landing in your admin inbox, the one-year commitment and fees in one checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Heartsong is, with no pitch",
      where: "Facebook or Instagram (none linked from the site; find their page first)",
      body: "Hi, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Love that Heartsong serves lunch by candlelight.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Heartsong team,

I also put together a one-page snapshot of what a family sees on your site today, from applying to paying each month. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Heartsong team,

I'll leave it here so I'm not cluttering your inbox. The Heartsong version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Enjoy the rest of the school year.

Julius`,
    },
  ],
};
