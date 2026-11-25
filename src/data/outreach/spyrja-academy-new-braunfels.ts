import type { OutreachPlan } from "./types";

export const spyrjaAcademyNewBraunfelsOutreach: OutreachPlan = {
  slug: "spyrja-academy-new-braunfels",
  schoolName: "Spyrja Academy of New Braunfels",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Jourdan",
    role: "Founder, Director and Lead Instructor (Jourdan Simmang)",
    source: "Spyrja Admissions page (\"our Founder and Director Jourdan Simmang\") and Meet the Team",
  },
  priorContact: {
    when: "May",
    what: "A hand-sent first email with a link to the Spyrja MudKitchen demo",
  },
  angle:
    "Re-contact with the Family experience snapshot. One real detail: the FAQ quotes $13,500 for full-time high school while the 2026–27 tuition sheet (an image) says $14,500, and the \"enrollment forms here\" link lands on a page with no forms.",
  facts: [
    {
      fact: "Spyrja is a year-round (9 weeks on, 3 off) microschool for 6th–12th grade in New Braunfels, founded in 2023 as a founding school of the KaiPod Catalyst program, a 501(c)(3), and fully accredited by WASC as of July 3, 2025",
      source: "Spyrja, Home, FAQs and About Us",
      url: "https://sanewbraunfels.org/about-us-1",
      readOn: "2026-11-23",
    },
    {
      fact: "The FAQ says tuition is $13,500 a year for full-time high school and $11,500 for middle grades; the 2026–27 tuition sheet on Enrollment & Tuition (an image) lists $14,500 full time, $13,050 military and first responder, $11,350 part time, $12,100 middle grades and a $250 registration & resource fee",
      source: "Spyrja, FAQs and Enrollment & Tuition",
      url: "https://sanewbraunfels.org/enrollment-%26-tuition",
      readOn: "2026-11-23",
    },
    {
      fact: "The Admissions page ends \"please fill out enrollment forms here\"; the link goes to Enrollment & Tuition, which has a Pay Now button for the registration fee, the tuition image and a calendar PDF, but no enrollment forms. An invoice for fees is sent once forms are received",
      source: "Spyrja, Admissions and Enrollment & Tuition",
      url: "https://sanewbraunfels.org/admissions",
      readOn: "2026-11-23",
    },
    {
      fact: "Tutoring is $60 per 50-minute session; the first session is booked online, later ones by contacting Jourdan, and payment is PayPal, Venmo or cash at the time of service",
      source: "Spyrja, Tutoring Services and Policies & Procedures",
      url: "https://sanewbraunfels.org/policies-%26-procedures-1",
      readOn: "2026-11-23",
    },
    {
      fact: "Spyrja held its 3rd Annual Pancake Breakfast on October 3, 2026, benefitting Operation Triage; students do a community service project every Friday",
      source: "Spyrja, Upcoming Events and Spyrja in the Community",
      url: "https://sanewbraunfels.org/upcoming-events",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in May (the first email says so).",
    "Spyrja serves 6th–12th grade with a high school diploma track; the demo uses middle grades and high school as its two programs.",
    "Spyrja started as a KaiPod Catalyst founding school (2023); it may still use KaiPod tools the site doesn't show.",
    "Spyrja is WASC-accredited and in its third year, so it may now qualify for TEFA, but the site doesn't mention TEFA. Don't raise it unless they do.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "V6zI8wWKmaNr80CIILbKzA",
    preparedOn: "2026-11-23",
    summary:
      "We read 32 pages of sanewbraunfels.org on Nov 23, 2026, plus the 2026–27 tuition sheet and the school calendar PDF.",
    pageSpeed: { mobileScore: 67, url: "https://sanewbraunfels.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "GoDaddy online appointments",
        usedFor: "Calls, campus visits and the first tutoring session",
        url: "https://sanewbraunfels.org/ola/services/meet-the-director-campus-tour",
      },
      {
        name: "PayPal and Venmo",
        usedFor: "Tutoring payments",
        url: "https://sanewbraunfels.org/policies-%26-procedures-1",
      },
      {
        name: "PDF calendar",
        usedFor: "2026–27 school calendar",
        url: "https://sanewbraunfels.org/enrollment-%26-tuition",
      },
    ],
    observations: [
      {
        area: "find",
        gap: "The site shows two different tuition prices",
        saw: "The FAQ says full-time high school is $13,500 and middle grades $11,500. The 2026–27 tuition sheet on Enrollment & Tuition, which is an image, says $14,500 and $12,100.",
        impact: "A family comparing schools may plan around the lower number, and can't search or zoom the image on a phone.",
        source: "Spyrja, FAQs and Enrollment & Tuition",
        url: "https://sanewbraunfels.org/enrollment-%26-tuition",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "tuition-rate-plans"],
          text: "Tuition set up once and shown as text on the site, so the FAQ, tuition page and family bills always match.",
        },
      },
      {
        area: "enroll",
        gap: "The enrollment forms link doesn't reach any forms",
        saw: "The Admissions page ends \"please fill out enrollment forms here\". The link opens Enrollment & Tuition, which has a Pay Now button, the tuition image and a calendar, but no forms. An invoice for fees follows once forms are received.",
        impact: "A family ready to enroll has to email or call to get the forms.",
        source: "Spyrja, Admissions and Enrollment & Tuition",
        url: "https://sanewbraunfels.org/admissions",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "One enrollment checklist families fill in and sign online, with the $250 registration fee paid in the same place.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say how tuition is paid",
        saw: "There's a Pay Now button for the registration fee and an invoice after enrollment. The site doesn't say whether tuition is paid monthly, per 9-week session or yearly, and the military and sibling discounts don't stack.",
        impact: "A family can't see what a month of Spyrja costs, or which discount they'd get, until they ask.",
        source: "Spyrja, Enrollment & Tuition, Admissions and FAQs",
        url: "https://sanewbraunfels.org/faqs",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "card-and-ach", "autopay"],
          text: "Families choose a payment plan, see their balance and invoices in one place, and pay by card or bank, with autopay if they want it.",
        },
      },
      {
        area: "pay",
        gap: "Tutoring is booked and paid in different places",
        saw: "Only the first $60 tutoring session books online. Later sessions are arranged by contacting Jourdan and paid by PayPal, Venmo or cash at the time of service.",
        impact: "A tutoring family books by message and pays through a separate app each week, with no record of sessions in one place.",
        source: "Spyrja, Tutoring Services and Policies & Procedures",
        url: "https://sanewbraunfels.org/tutoring-services",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["parent-billing", "card-and-ach"],
          text: "Tutoring sessions on the same family billing page as tuition, paid by card or bank.",
        },
      },
      {
        area: "updates",
        gap: "The school calendar is a PDF",
        saw: "The 2026–27 calendar is a two-page PDF: a colour-coded year on page 1 and the dates explained on page 2. The Upcoming Events page lists events only through November.",
        impact: "A family checking when the Q2/Q3 break starts downloads the file and matches colours to the key.",
        source: "Spyrja, Enrollment & Tuition (School Calendar 2026-27 PDF) and Upcoming Events",
        url: "https://sanewbraunfels.org/enrollment-%26-tuition",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal", "mobile-app"],
          text: "The school calendar in each family's login and on their phone, with breaks and Spirit Weeks added once.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Spyrja",
    founder: {
      fullName: "Jourdan Simmang",
      firstName: "Jourdan",
      role: "Founder, Director and Lead Instructor",
      source: "Spyrja, Admissions and Meet the Team",
      url: "https://sanewbraunfels.org/meet-the-team-1",
    },
    mailTo: {
      lines: ["Jourdan Simmang", "Spyrja Academy of New Braunfels", "816 West County Line Road", "New Braunfels, TX 78130"],
      source: "Spyrja Contact Us page (\"816 West County Line Road, New Braunfels, TX, USA\", under Visit Us) and site header",
      url: "https://sanewbraunfels.org/contact-us",
    },
    founderFacts: [
      {
        fact: "Spyrja's About page says that as of July 3, 2025 the school has been fully accredited by the Accrediting Commission for Schools, Western Association of Schools and Colleges (WASC).",
        source: "Spyrja, About Us (Our Accreditation)",
        url: "https://sanewbraunfels.org/about-us-1",
        readOn: "2026-11-23",
      },
      {
        fact: "Spyrja opened in September 2023 after Jourdan was selected for KaiPod's Catalyst program; a classroom teacher since 2009, he still teaches during the day.",
        source: "Community Impact, \"Spyrja Academy to open microschool this fall in New Braunfels\" (July 17, 2023), and Spyrja Admissions",
        url: "https://communityimpact.com/austin/new-braunfels/business/2023/07/17/spyrja-academy-to-open-microschool-this-fall-in-new-braunfels/",
        readOn: "2026-11-23",
      },
    ],
    hook: "Spyrja's About page says that as of July 3, 2025 the school has been fully accredited by the Accrediting Commission for Schools, Western Association of Schools and Colleges (WASC).",
    body: `Hi Jourdan,

Your About page says Spyrja was fully accredited by WASC in July 2025, two years after you opened. Congratulations. That's a lot of work for a new school, on top of teaching every day.

We know how full those first years are. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Spyrja.

I'd love to hear what the accreditation process was like in your second year.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Jourdan, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "spyrja-n6t2",
    checkBeforeMailing: [
      "The address is the campus Spyrja publishes on its Contact page and header (a renovated building with a front porch and ADA ramp, per the January 2026 announcement). The 2023 Community Impact article gave an earlier suite on Elliot Knox Blvd; use County Line Road.",
      "No podcast about Jourdan turned up; the hook is the WASC accreditation on the school's About page.",
      "New Braunfels is about an hour from Round Rock; the letter doesn't offer coffee. Add it if you count it as the Austin area.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the May email, the two tuition prices, one proof number, offer the snapshot",
      subject: "Spyrja's 2026–27 tuition",
      body: `Hi Jourdan,

I mailed you a handwritten note last week with a card for Spyrja. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in May) and a one-page snapshot of what a family sees on your site today.

One thing stood out: your FAQ says full-time high school is $13,500, while the 2026–27 tuition sheet says $14,500, and the sheet is only an image.

I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Jourdan,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Spyrja version: a visit request landing in your admin inbox, the enrollment checklist with the $250 fee, and the billing page a family would see.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Spyrja is, with no pitch",
      where: "Facebook or Instagram (@sanewbraunfels)",
      body: "Hi, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Three years of Pancake Breakfasts and Friday service projects is great to see.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Jourdan,

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
      body: `Hi Jourdan,

I'll leave it here so I'm not cluttering your inbox. The Spyrja version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
