import type { OutreachPlan } from "./types";

export const inspiredLearningAcademyOutreach: OutreachPlan = {
  slug: "inspired-learning-academy",
  schoolName: "Inspired Learning Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Jill",
    role: "Co-Founder and Head of School / Director of Operations",
    source: "Inspired Learning Academy Meet the Team page (Jill Baumann, Co-Founder & Head of School / Director of Operations)",
  },
  angle: "Re-contact with a snapshot: Inspired now accepts TEFA funds next to $1,297 monthly installments, so a TEFA family may pay from two places",
  priorContact: {
    when: "October",
    what: "A hand-sent first email with a link to the Inspired Learning Academy MudKitchen demo",
  },
  facts: [
    {
      fact: "Inspired Learning Academy now accepts TEFA funds; the FAQ says it is authorized to accept Texas Education Freedom Account funds",
      source: "Inspired Learning Academy home page and FAQ",
      url: "https://www.inspiredlearningacademy.org/faq",
      readOn: "2026-11-22",
    },
    {
      fact: "2026–27 tuition is $12,970 a year, or 10 monthly installments of $1,297 (Aug 1 – May 1); $12,470 if paid in full by Aug 1; 10% sibling discount; $350 annual registration fee; TEFA families can direct their funds to Inspired to cover tuition",
      source: "Inspired Learning Academy Admissions",
      url: "https://www.inspiredlearningacademy.org/admissions",
      readOn: "2026-11-22",
    },
    {
      fact: "Admissions runs in four steps: schedule a tour, a pre-tour application, a student interview and full application if it's a mutual fit, then enrollment paperwork with the registration fee",
      source: "Inspired Learning Academy Admissions",
      url: "https://www.inspiredlearningacademy.org/admissions",
      readOn: "2026-11-22",
    },
    {
      fact: "Families book a tour on enroll.withsds.com and are then guided through a short parent application and a brief student application; a 15-minute call is booked on the same tool",
      source: "Schedule Your School Tour (enroll.withsds.com/ila)",
      url: "https://enroll.withsds.com/ila/book-a-tour",
      readOn: "2026-11-22",
    },
    {
      fact: "Now enrolling for 2026–27 with rolling admissions: middle school has limited spots, high school is full with a waiting list only; tours for 2027–28 are open",
      source: "Inspired Learning Academy home page",
      url: "https://www.inspiredlearningacademy.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "Hybrid grades 6–12 in Allen, TX: on campus Tuesday to Thursday, remote Monday and Friday; Passion Project Nights, Presentation of Learning and 60+ student-designed digital badges",
      source: "How It Works",
      url: "https://www.inspiredlearningacademy.org/how-it-works",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in October 2026 (the first email says so).",
    "Confirm who got the October email. This plan writes to Jill Baumann (Head of School / Director of Operations); Aya Parry is Co-Founder and Director of Finance and Administration and may own the TEFA billing question.",
    "Their tour booking, 15-minute call booking and pre-tour parent and student applications run on SDS (enroll.withsds.com/ila). SDS's own site only says \"Launching Soon\". Check whether it's a vendor they're tied to (or their own build) before pitching to replace it; the snapshot lists it in the tool stack.",
    "The first email says a TEFA family \"may\" pay from two places. The site doesn't state the TEFA amount, so it doesn't claim a family's share; confirm you're comfortable with that line.",
    "The PayPal button on every page is for donations only, so it's left out of the tool stack.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "We'd build: An ordered waitlist with automatic offers",
  ],
  snapshot: {
    token: "vtUJS_bWqds_EWiiXsujAQ",
    preparedOn: "2026-11-22",
    summary: "We read 22 pages of inspiredlearningacademy.org on Nov 22, 2026, plus the tour and call booking pages and the 2026–27 calendar PDF.",
    pageSpeed: { mobileScore: 70, url: "https://www.inspiredlearningacademy.org/", checkedOn: "2026-11-22" },
    toolStack: [
      { name: "SDS enrollment pages", usedFor: "Tour and call booking, pre-tour parent and student applications", url: "https://enroll.withsds.com/ila/book-a-tour" },
      { name: "Contact form", usedFor: "Questions before a tour", url: "https://www.inspiredlearningacademy.org/contact" },
      { name: "Calendar PDF", usedFor: "2026–27 school calendar", url: "https://www.inspiredlearningacademy.org/calendar" },
    ],
    observations: [
      {
        area: "pay",
        gap: "TEFA families may pay tuition from two places",
        saw: "The admissions page says families eligible for Texas Education Funds can direct them to Inspired to cover tuition of $12,970, or $1,297 a month. It doesn't say how any remaining share is billed to the family.",
        impact: "A TEFA family can't see what they still owe after the state pays, and you match TEFA payments to each family's balance by hand.",
        source: "Inspired Learning Academy Admissions",
        url: "https://www.inspiredlearningacademy.org/admissions",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "autopay"],
          text: "We'd set up billing so the TEFA portion is recorded against each family, and they see and pay only what's left, with autopay if they want it.",
        },
      },
      {
        area: "pay",
        gap: "Two payment plans, with no stated way to choose or pay",
        saw: "Families can pay $12,470 in full by Aug 1 or make 10 monthly payments of $1,297 from Aug 1 to May 1. The site doesn't say how a family picks a plan or how each payment is made.",
        impact: "Each family asks before the first payment, and you keep track of who chose which plan and who has paid each month.",
        source: "Inspired Learning Academy Admissions",
        url: "https://www.inspiredlearningacademy.org/admissions",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "autopay", "card-and-ach"],
          text: "Families pick pay-in-full or monthly in their own login, pay by card or bank, and can turn on autopay for the 10 installments.",
        },
      },
      {
        area: "enroll",
        gap: "Enrollment paperwork with no stated way to send it",
        saw: "Step 4 says families who get an offer submit the enrollment paperwork along with the $350 registration fee. The site doesn't say what the paperwork is, how it's signed or how the fee is paid.",
        impact: "Families ask how before they can finish enrolling, and you chase each form and fee yourself.",
        source: "Inspired Learning Academy Admissions",
        url: "https://www.inspiredlearningacademy.org/admissions",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Families who get an offer see one checklist: the enrollment agreement signed online and the $350 registration fee paid, with reminders until it's done.",
        },
      },
      {
        area: "apply",
        gap: "High school is waitlist-only, with no way to join the list",
        saw: "The home page says high school is full and waiting list only for 2026–27. The admissions page and tour booking don't say how a family joins the list or hears when a spot opens.",
        impact: "High school families can't tell whether booking a tour puts them on the list, and you track the list and its order yourself.",
        source: "Inspired Learning Academy home page",
        url: "https://www.inspiredlearningacademy.org/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "waitlist-queue"],
          text: "Middle school shows as open and high school as waitlist, families join the list online, and we'd set up an ordered waitlist that offers the next family a spot when one opens.",
        },
      },
      {
        area: "find",
        gap: "The April 15, 2026 registration price is still on the page",
        saw: "Under Tuition and Fees the annual registration fee is $350, followed by \"Regular Registration for 2026-2027: $250 if register by April 15, 2026\". Tours for 2027–28 are already open.",
        impact: "A family touring for 2027–28 sees two registration prices and a deadline that has passed, and asks which one applies.",
        source: "Inspired Learning Academy Admissions",
        url: "https://www.inspiredlearningacademy.org/admissions",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service", "enrollment-fees"],
          text: "The site we build for you shows the current year's fees, and the registration fee families pay in their checklist is the same one the page shows.",
        },
      },
      {
        area: "updates",
        gap: "The school calendar is a one-page PDF",
        saw: "The Calendar page shows the 2026–27 calendar as a PDF: Presentation Night on Dec 11, breaks, and the last day on May 26.",
        impact: "Families copy dates into their own calendars by hand, and any change means a new PDF and a message to every family.",
        source: "Inspired Learning Academy Calendar",
        url: "https://www.inspiredlearningacademy.org/calendar",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "mobile-app"],
          text: "Families see the school calendar in their login and on the iPhone app, and a changed date updates for everyone at once.",
        },
      },
      {
        area: "website",
        gap: "Template pages are still live and in your sitemap",
        saw: "The sitemap lists an Inquiry Services page about custom T-shirt design and screen printing, a Book Online page with a $19.99 Virtual Workshop, Remote Class and Online Course marked Ended, and an empty Google Search code page. The home page scores 70 out of 100 for speed on a phone.",
        impact: "A family searching for Inspired can land on a page about T-shirts or a $19.99 course, which isn't what the school offers.",
        source: "inspiredlearningacademy.org sitemap",
        url: "https://www.inspiredlearningacademy.org/pages-sitemap.xml",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you only has your school's pages, kept fast on a phone.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Inspired",
    founder: {
      fullName: "Jill Baumann",
      firstName: "Jill",
      role: "Co-Founder and Head of School",
      source: "Inspired Learning Academy, Meet the Team",
      url: "https://www.inspiredlearningacademy.org/meet-the-team",
    },
    mailTo: {
      lines: ["Jill Baumann", "Inspired Learning Academy", "601 S Greenville Ave", "Allen, TX 75002"],
      source: "Inspired Learning Academy Contact page and site footer",
      url: "https://www.inspiredlearningacademy.org/contact",
    },
    founderFacts: [
      {
        fact: "On This Golden Hour (episode 106, September 10, 2025), Jill Baumann, a Texas micro school co-founder, talked about micro-school homeschooling: she looked for alternative options when her children were young and built a micro school that served them and many other students.",
        source: "This Golden Hour, 106. Micro-school Homeschooling with Jill Baumann (Apple Podcasts; the show notes list Inspired Learning Academy)",
        url: "https://podcasts.apple.com/us/podcast/106-micro-school-homeschooling-with-jill-baumann/id1686673626?i=1000725810914",
        readOn: "2026-11-22",
      },
      {
        fact: "Jill writes that Inspired Learning Academy was born when she found no local school offering the kind of community she wanted for early adolescents; she describes it as a heart-centered community that builds self-efficacy and resilience.",
        source: "Inspired Learning Academy, Jill Baumann",
        url: "https://www.inspiredlearningacademy.org/jill-baumann",
        readOn: "2026-11-22",
      },
      {
        fact: "Jill has 8 years of facilitating classes and mentoring students in grades 6–12, and before that was a development manager at Nortel Networks with a B.S. in Electrical Engineering from Texas A&M.",
        source: "Inspired Learning Academy, Jill Baumann",
        url: "https://www.inspiredlearningacademy.org/jill-baumann",
        readOn: "2026-11-22",
      },
    ],
    hook: "On This Golden Hour (episode 106, September 10, 2025), Jill Baumann, a Texas micro school co-founder, talked about micro-school homeschooling: she looked for alternative options when her children were young and built a micro school that served them and many other students.",
    body: `Hi Jill,

I listened to your This Golden Hour episode on micro-school homeschooling and loved hearing how looking for the right fit for your own kids turned into Inspired, a school for a lot of other families too.

Hearing from founders like you is my favorite part of this work. My fiancée and I run Sage Field, an outdoor microschool down in Round Rock. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Inspired.

I'd love to hear what you've learned about running a school for young teens.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Jill, a note from a microschool down in Round Rock. J",
    shortCode: "inspired-rr77",
    checkBeforeMailing: [
      "Listen to the This Golden Hour episode before mailing so the first line is true and you can talk about it if she texts.",
      "601 S Greenville Ave is a church campus (First United Church of Allen per county records): add \"Inspired Learning Academy\" clearly on the envelope so the church office routes it.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the October email, one detail from the snapshot, one proof number",
      subject: "TEFA families at Inspired",
      body: `Hi Jill,

I mailed you a handwritten note last week with a card for Inspired. It has a QR code for the demo I set up for you (I first wrote about it in October) and a one-page snapshot of what a family sees on your site today, from booking a tour to paying tuition.

One thing stood out: Inspired now accepts TEFA funds, and tuition is $12,970 or $1,297 a month, so a TEFA family may pay from two places.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Jill,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Inspired version: the homepage, the enrollment checklist and billing a parent sees, and your admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school is, with no pitch",
      where: "Instagram (inspiredlearningacademy) or Facebook (InspiredLearningAcademy)",
      body: "Hi Jill, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Passion Project Nights and 60+ badges designed by students is a lovely idea.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Jill,

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
      body: `Hi Jill,

I'll leave it here so I'm not cluttering your inbox. The Inspired version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the 2027–28 tours.

Julius`,
    },
  ],
};
