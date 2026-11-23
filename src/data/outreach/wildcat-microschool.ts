import type { OutreachPlan } from "./types";

export const wildcatMicroschoolOutreach: OutreachPlan = {
  slug: "wildcat-microschool",
  schoolName: "Wildcat Microschool",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Heather",
    role: "Founder and guide",
    source:
      "Josiah Bartlett Center profile, Dec 8, 2023 (Heather Long started Wildcat in her North Haverhill home); the Wildcat home page lists her first of three educators",
  },
  angle:
    "Re-contact with a snapshot: the waitlist is a Google Form filled in once per child, next to a separate contact form, and nothing on the site says what happens after",
  priorContact: {
    when: "May",
    what: "A hand-sent first email with a link to the Wildcat Microschool MudKitchen demo",
  },
  facts: [
    {
      fact: "The contact page has a general contact form and, below it, a Google Forms waitlist: \"If you have multiple children, please fill out a new form for each child. We will keep this information and contact you if there is an opening\"",
      source: "Wildcat Microschool Contact page and its waitlist Google Form",
      url: "https://wildcatmicroschool.weebly.com/contact.html",
      readOn: "2026-11-22",
    },
    {
      fact: "The waitlist form asks for name, contact information, child's name, birthdate, grade (Kindergarten to 8th grade) and why the family is interested",
      source: "Wildcat Microschool Waitlist (Google Form)",
      url: "https://docs.google.com/forms/d/e/1FAIpQLSdE7EJ43o0WXJu-vb7GTBY0QGhEOQy7QRReGYZhTT_CkvY2Jw/viewform",
      readOn: "2026-11-22",
    },
    {
      fact: "The menu links a \"2025-2026 Calendar\", a PDF: first day of school Thursday, September 11, 2025, last day Friday, May 29, 2026",
      source: "Wildcat Microschool 2025-2026 Calendar (PDF)",
      url: "https://wildcatmicroschool.weebly.com/2025-2026-calendar.html",
      readOn: "2026-11-22",
    },
    {
      fact: "The latest blog post is \"Wildcat Times: Spring, 2025\" (April 18, 2025), an 8-page PDF newsletter with a Canva link, covering the forest classroom, Pumaville and the NHRL robotics team",
      source: "Wildcat Microschool Blog",
      url: "https://wildcatmicroschool.weebly.com/blog/wildcat-times-spring-2025",
      readOn: "2026-11-22",
    },
    {
      fact: "A High School Planning Form page (a 4-year plan generator for 9th to 12th grade) is in the sitemap but not in the menu, and shows an EmailJS setup panel to every visitor",
      source: "Wildcat Microschool High School Planning Form",
      url: "https://wildcatmicroschool.weebly.com/high-school-planning-form.html",
      readOn: "2026-11-22",
    },
    {
      fact: "The home page describes a homeschool learning pod in the guides' homes, a few miles apart, with transportation between them and forest land for nature-based learning; it names three educators and lists no ages, schedule or tuition",
      source: "Wildcat Microschool Home",
      url: "https://wildcatmicroschool.weebly.com/",
      readOn: "2026-11-22",
    },
    {
      fact: "Heather Long started Wildcat in December 2021 with four children; by 2023–24 it had 22 learners registered as homeschoolers, a waitlist, Bobcats (K–4) and Pumas (5–8), Tuesday to Friday 8 to 2, tuition-free as a Prenda pod through Prenda's Bright Futures Grant",
      source: "Josiah Bartlett Center, Education entrepreneur spotlight (Dec 8, 2023)",
      url: "https://jbartlett.org/?p=53976",
      readOn: "2026-11-22",
    },
    {
      fact: "Home page mobile PageSpeed score 55 out of 100, largest content at about 11.4 seconds, page weight about 7.5 MB",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://wildcatmicroschool.weebly.com/",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in May 2026",
    "Heather Long is named as the founder only in the Josiah Bartlett Center profile (Dec 2023); the site lists her as one of three educators. Confirm she's still the right person to write to.",
    "Nothing on the site is newer than the 2025-2026 calendar (last day May 29, 2026) and the April 2025 newsletter, though the waitlist form still takes responses. Confirm Wildcat is running in 2026–27 before sending.",
    "Wildcat was a tuition-free Prenda pod in 2023–24 (Bartlett Center). Families may use Prenda's tools for enrollment and school days, so decide how hard to pitch enrollment and billing.",
    "The site publishes no tuition, ages or schedule, so the demo's billing step is a product preview; keep the Loom honest about that.",
    "The High School Planning Form page calls an AI API from the browser with no key, so it likely can't build a plan (not tested, and left out of the snapshot). Mention it only if Heather asks.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "jIAgZxfuzBOjL1-3Nd_psQ",
    preparedOn: "2026-11-22",
    summary:
      "We read all 13 pages of wildcatmicroschool.weebly.com on Nov 22, 2026, plus the 2025-2026 calendar PDF, the Spring 2025 Wildcat Times and the waitlist form.",
    pageSpeed: { mobileScore: 55, url: "https://wildcatmicroschool.weebly.com/", checkedOn: "2026-11-22" },
    toolStack: [
      {
        name: "Weebly contact form",
        usedFor: "General questions",
        url: "https://wildcatmicroschool.weebly.com/contact.html",
      },
      {
        name: "Google Forms",
        usedFor: "Waitlist, one form per child",
        url: "https://wildcatmicroschool.weebly.com/contact.html",
      },
      {
        name: "Canva and a PDF",
        usedFor: "Wildcat Times newsletter",
        url: "https://wildcatmicroschool.weebly.com/blog/wildcat-times-spring-2025",
      },
    ],
    observations: [
      {
        area: "find",
        gap: "No ages, days or cost on the site",
        saw: "The home page describes the learning pod, the three educators and the forest, but not which ages you take, which days school runs or what it costs. The waitlist form is the only place grades appear (Kindergarten to 8th).",
        impact: "A family has to join the waitlist or write in to learn the basics, and you answer the same questions for each one.",
        source: "Wildcat Microschool Home",
        url: "https://wildcatmicroschool.weebly.com/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "We'd put your groups, ages, days and cost on the site, each marked Open, Waitlist, Full or Closed, so families know where they stand before they write.",
        },
      },
      {
        area: "tour",
        gap: "No way to ask for a visit",
        saw: "The site doesn't mention a tour or a visit. The contact page offers a message form and the waitlist.",
        impact: "A family that wants to see the guides' homes and the forest classroom first has to ask, and you trade messages to find a time.",
        source: "Wildcat Microschool Contact",
        url: "https://wildcatmicroschool.weebly.com/contact.html",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick a visit from the times you open, and the booking lands with their inquiry in one admin inbox.",
        },
      },
      {
        area: "apply",
        gap: "A new waitlist form for each child, next to a separate contact form",
        saw: "The contact page has a general contact form, then a Google Form for the waitlist that says \"If you have multiple children, please fill out a new form for each child.\" Each form asks for the parent's name and contact details again.",
        impact: "Families with siblings type the same details more than once, and messages and waitlist entries arrive in two different places for you to match up.",
        source: "Wildcat Microschool Contact page and waitlist Google Form",
        url: "https://wildcatmicroschool.weebly.com/contact.html",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "One form on your site takes a question or a waitlist request, and every inquiry and application lands in one admin inbox under the family.",
        },
      },
      {
        area: "enroll",
        gap: "After the waitlist, the next steps aren't on the site",
        saw: "The waitlist form says you'll contact the family if there's an opening. The site doesn't say what they fill in or sign after that, or how they pay.",
        impact: "Each new family needs the paperwork sent to them, and you track who has returned what.",
        source: "Wildcat Microschool Waitlist (Google Form)",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSdE7EJ43o0WXJu-vb7GTBY0QGhEOQy7QRReGYZhTT_CkvY2Jw/viewform",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees", "parent-billing"],
          text: "When a spot opens, you send one checklist: forms and the agreement signed online, any fee paid in the same place, and a billing page the family keeps.",
        },
      },
      {
        area: "updates",
        gap: "The calendar on the site is 2025–2026",
        saw: "The menu links a \"2025-2026 Calendar\", a PDF that runs from September 11, 2025 to May 29, 2026. There's no calendar for this school year on the site.",
        impact: "A family looking at Wildcat now can't see when this year started or when the breaks are.",
        source: "Wildcat Microschool 2025-2026 Calendar",
        url: "https://wildcatmicroschool.weebly.com/2025-2026-calendar.html",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal"],
          text: "A school calendar in each family's login, updated in one place, so a changed date reaches everyone.",
        },
      },
      {
        area: "updates",
        gap: "The newsletter is a PDF, last posted April 2025",
        saw: "Wildcat Times: Spring, 2025 is an 8-page PDF with a Canva link, posted April 18, 2025. It's the latest post on the blog.",
        impact: "Reading eight pages of PDF on a phone is slow, and the forest classroom and robotics stories stop at spring 2025 for anyone visiting today.",
        source: "Wildcat Microschool Blog",
        url: "https://wildcatmicroschool.weebly.com/blog/wildcat-times-spring-2025",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["newsletters", "bulletin"],
          text: "Newsletters families read on the web and in the app, plus a short announcements feed for news between issues.",
        },
      },
      {
        area: "website",
        gap: "The High School Planning Form isn't in the menu",
        saw: "A page builds a 4-year high school plan for 9th to 12th graders, but the menu only shows Home, Blog, Contact and the calendar. Below the form, every visitor sees a setup panel asking for EmailJS credentials.",
        impact: "A family with a teenager is unlikely to find the page, the waitlist form stops at 8th grade, and the page doesn't say whether a finished plan reaches you.",
        source: "Wildcat Microschool High School Planning Form",
        url: "https://wildcatmicroschool.weebly.com/high-school-planning-form.html",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service", "admissions-pipeline"],
          text: "We build and run your site, so a new page goes in the menu, and what families send from it lands in your admin inbox.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed gives the home page 55 out of 100 on a phone. The main content takes about 11 seconds to appear, and the page weighs about 7.5 MB with two embedded videos.",
        impact: "A parent checking you out on a phone waits several seconds before seeing anything, and some leave first.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://wildcatmicroschool.weebly.com/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build your site to load fast on a phone and keep it current for you.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Wildcat",
    founder: {
      fullName: "Heather Long",
      firstName: "Heather",
      role: "Founder and guide",
      source: "Josiah Bartlett Center, \"Education entrepreneur spotlight: Heather Long of Wildcat Microschool\" (Dec 8, 2023); the Wildcat home page lists her first of three educators",
      url: "https://jbartlett.org/?p=53976",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Heather Long told the Josiah Bartlett Center (December 8, 2023) that she started Wildcat in December 2021 with four learners, that it had 22 by the 2023–24 school year, and that more than anything she wants to see kids who are independent learners.",
        source: "Josiah Bartlett Center, Education entrepreneur spotlight: Heather Long of Wildcat Microschool",
        url: "https://jbartlett.org/?p=53976",
        readOn: "2026-11-22",
      },
      {
        fact: "Heather Long has worked in education for 15 years, as a preschool teacher, behavior specialist and school counselor.",
        source: "Wildcat Microschool home page (educator bios)",
        url: "https://wildcatmicroschool.weebly.com/",
        readOn: "2026-11-22",
      },
      {
        fact: "Wildcat is a homeschool learning pod in Haverhill, New Hampshire, run in its guides' homes a few miles apart, with transportation between them and many acres of forest for nature-based learning.",
        source: "Wildcat Microschool home page",
        url: "https://wildcatmicroschool.weebly.com/",
        readOn: "2026-11-22",
      },
    ],
    hook: "Heather Long told the Josiah Bartlett Center (December 8, 2023) that she started Wildcat in December 2021 with four learners, that it had 22 by the 2023–24 school year, and that more than anything she wants to see kids who are independent learners.",
    body: `Hi Heather,

I read the Josiah Bartlett Center's piece on Wildcat, and what you said there about wanting, more than anything, to see kids who are independent learners.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Wildcat.

I'd like to hear how Wildcat has changed since you started it with four learners.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Heather, a note from a small school in Round Rock, Texas. J",
    shortCode: "wildcat-nvle",
    checkBeforeMailing: [
      "Find a mailing address: wildcatmicroschool.weebly.com (home, contact, blog, calendar) and the Bartlett Center piece list no address or PO box. The home page says the school runs in the guides' homes, so any street address you find for Wildcat is likely a home; don't use it. Non-home leads: ask Heather through the site's contact form for a mailing address or PO box, or ask Prenda (Wildcat's network in 2023–24) whether it has a school mailing address.",
      "The hook is from a December 2023 profile, and nothing on the site is newer than the 2025–26 calendar. Confirm Wildcat is running in 2026–27 and that Heather still leads it before mailing.",
      "The first email still says Julius wrote in May; confirm that email went out.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the May email, one detail from the snapshot, one proof number",
      subject: "Wildcat's waitlist form",
      body: `Hi Heather,

I mailed you a handwritten note last week with a card for Wildcat. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in May) and a one-page snapshot of what a family sees on your site today, from the contact page to the calendar.

One thing stood out: the waitlist is a Google Form that asks families to fill out a new form for each child, next to a separate contact form.

I run Sage Field, a microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Heather,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Wildcat version: a waitlist question landing in your admin, the enrollment checklist and the page a parent sees.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school is, with no pitch",
      where: "Facebook or LinkedIn (Heather Long; the site links no social accounts)",
      body: "Hi Heather, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Pumaville in your forest classroom, with acorns for currency, is a lovely bit of civics.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Heather,

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
      body: `Hi Heather,

I'll leave it here so I'm not cluttering your inbox. The Wildcat version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Enjoy the forest classroom this winter.

Julius`,
    },
  ],
};
