import type { OutreachPlan } from "./types";

export const southOcHybridHomeschoolOutreach: OutreachPlan = {
  slug: "south-oc-hybrid-homeschool",
  schoolName: "South OC Hybrid Homeschool (SOCHH)",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Natalie",
    role: "Founder and Program Director (Natalie Hustad)",
    source: "SOCHH About page (\"Written by Founder and Director of SOCHH, Natalie Hustad\") and Contact Us page (\"Natalie Hustad, Program Director\")",
  },
  priorContact: {
    when: "May",
    what: "A hand-sent first email with a link to the SOCHH MudKitchen demo",
  },
  angle:
    "Re-contact with the Family experience snapshot. Proof + their process: a family can't see 2026–27 programs or class fees without signing up for emails and texts, then goes through a tour form, four orientation videos, an Intent to Enroll and an interview.",
  facts: [
    {
      fact: "SOCHH is a secular 501(c)(3) hybrid homeschool learning center in Mission Viejo, founded in 2017, with TK/K, CORE 1st–5th, CORE Middle School, Arts & Innovations (Mondays) and L.E.A.P.S. (Fridays); it is not a school of record",
      source: "SOCHH, About, Programs and TK/Kindergarten pages",
      url: "https://southochybridhomeschool.com/about/",
      readOn: "2026-11-23",
    },
    {
      fact: "The home and Admissions pages ask families to enter their details (with consent to SMS) in a MailerLite form to be sent 2026–27 program offerings; the admissions steps are the information packet, a campus tour or Virtual Tour & Orientation, an Application for Intent to Enroll, a family interview, then acceptance and an enroll link",
      source: "SOCHH, Home and Admissions",
      url: "https://southochybridhomeschool.com/admissions-2/",
      readOn: "2026-11-23",
    },
    {
      fact: "The tour sign-up is a Jotform with fixed dates; the Virtual Tour & Orientation is a separate Jotform with four videos to confirm; the tour form says waitlisted grades need the form to join the waitlist, and that the campus address differs from the mailing address",
      source: "Jotform, SOCHH TOURS and Virtual SOCHH Tour & Orientation",
      url: "https://form.jotform.com/240125915255149",
      readOn: "2026-11-23",
    },
    {
      fact: "The Volunteer & Fundraising FAQ is still written for 2023–24: an $1,800 per-student obligation for CORE students, due $900 on 12/1/2023 and $900 on 5/1/2024, tracked on statements in the family's Parent Portal; class fees rise 3% a year",
      source: "SOCHH, Volunteer & Fundraising Information and FAQ",
      url: "https://southochybridhomeschool.com/volunteer-fundraising-information-and-faq/",
      readOn: "2026-11-23",
    },
    {
      fact: "Natalie Hustad's history of SOCHH on the About page says she started a co-op with like-minded families, and a public kindergarten teacher of 30 years asked \"if you can homeschool them both through these little years why wouldn't you?\"",
      source: "SOCHH, About",
      url: "https://southochybridhomeschool.com/about/",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in May (the first email says so).",
    "We'd build: An ordered waitlist with automatic offers.",
    "SOCHH already gives families a Parent Portal with statements; the site doesn't name the tool. Ask what they use before pitching billing as new.",
    "SOCHH has its own HR/Finance Director and Billing Coordinator (Contact Us page); Natalie is still the right first contact as founder and director.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "p2CHoaPI6-23XG_PymcjvQ",
    preparedOn: "2026-11-23",
    summary:
      "We read 60 pages of southochybridhomeschool.com on Nov 23, 2026, plus the tour and Virtual Tour & Orientation forms.",
    pageSpeed: { mobileScore: 59, url: "https://southochybridhomeschool.com/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "MailerLite",
        usedFor: "Sign-up to receive 2026–27 program offerings",
        url: "https://southochybridhomeschool.com/admissions-2/",
      },
      {
        name: "Jotform",
        usedFor: "Campus tour sign-up and the Virtual Tour & Orientation",
        url: "https://form.jotform.com/240125915255149",
      },
    ],
    observations: [
      {
        area: "find",
        gap: "Programs and class fees are only sent by email",
        saw: "The home and Admissions pages ask families to enter their details, with consent to text messages, to be sent 2026–27 program offerings. Program pages give days and hours but no class fees.",
        impact: "A family comparing options can't see what SOCHH costs without joining an email and text list first.",
        source: "SOCHH, Home, Admissions and Programs",
        url: "https://southochybridhomeschool.com/admissions-2/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "Every 2026–27 program on the site with its days, hours and fees, so families read it before they reach out.",
        },
      },
      {
        area: "apply",
        gap: "Joining takes four separate forms",
        saw: "Families fill in the information sign-up, then a tour form (or a second form for four orientation videos), then the Application for Intent to Enroll, before an interview and an enroll link.",
        impact: "A family moves through four forms and several emails, and can't see where they are in the process between steps.",
        source: "SOCHH, Admissions; Jotform tour and Virtual Tour & Orientation forms",
        url: "https://southochybridhomeschool.com/admissions-2/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline", "enrollment-checklist"],
          text: "One application that saves as families go, every family's step in one admin inbox, and the enrollment checklist sent when they're accepted.",
        },
      },
      {
        area: "enroll",
        gap: "Which grades have space isn't on the site",
        saw: "The tour form says some grades are waitlisted and asks families to fill it in to join the waitlist. Enrollment can only be offered to students who finished admissions and registered for it.",
        impact: "A family doesn't know whether their child's grade is open until they've signed up for a tour.",
        source: "Jotform, SOCHH TOURS",
        url: "https://form.jotform.com/240125915255149",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "waitlist-queue"],
          text: "Each grade marked Open, Waitlist or Full on the site, and an ordered waitlist we'd set up with you that offers spots in turn.",
        },
      },
      {
        area: "pay",
        gap: "The campus contribution FAQ is from 2023–24",
        saw: "The Volunteer & Fundraising FAQ explains the $1,800 per CORE student obligation with due dates of December 1, 2023 and May 1, 2024, and says class fees rise 3% a year.",
        impact: "A new family can't tell whether the $1,800 and its due dates still apply for 2026–27.",
        source: "SOCHH, Volunteer & Fundraising Information and FAQ",
        url: "https://southochybridhomeschool.com/volunteer-fundraising-information-and-faq/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["parent-billing", "committees", "autopay"],
          text: "Class fees and the campus contribution on one family billing page for the current year, with volunteer sign-ups in the same login.",
        },
      },
      {
        area: "website",
        gap: "Several pages still show past years",
        saw: "The Summer Camp page says \"Registration for Summer 2025 at SOCHH is NOW OPEN!\" The CORE page lists curriculum \"for the 2023/24 school year\", and a 2019 \"Registration payment installment\" page still has a Pay Now button.",
        impact: "A family landing on these pages sees last year's camp dates and an old payment button.",
        source: "SOCHH, Summer Camp, CORE and Registration payment installment pages",
        url: "https://southochybridhomeschool.com/programs/summer-camp/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and keep the site current for you, with payments only inside each family's login.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 59 out of 100 on mobile. The main content takes about 11 seconds to appear, and the page is about 4.8 MB.",
        impact: "A parent opening the site on a phone waits a long time before seeing anything.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://southochybridhomeschool.com/",
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
    shortSchoolName: "SOCHH",
    founder: {
      fullName: "Natalie Hustad",
      firstName: "Natalie",
      role: "Founder and Program Director",
      source: "SOCHH, About and Contact Us",
      url: "https://southochybridhomeschool.com/about/",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "On episode 078 of the Learning to Glow podcast (July 10, 2024), Natalie, introduced as Founder and Director of SOCHH, talked about alternative schooling and what type of child could benefit from it.",
        source: "Learning to Glow podcast, 078: Parenting and Educational Choices: Benefits of Alternative Schooling with Natalie Hustad",
        url: "https://podcasts.apple.com/us/podcast/078-parenting-and-educational-choices-benefits/id1667729251?i=1000661771571",
        readOn: "2026-11-23",
      },
      {
        fact: "Natalie's history of SOCHH says she started a co-op with like-minded families, and that a public kindergarten teacher of 30 years asked \"if you can homeschool them both through these little years why wouldn't you?\"",
        source: "SOCHH, About (\"The History of SOCHH, written by Founder and Director of SOCHH, Natalie Hustad\")",
        url: "https://southochybridhomeschool.com/about/",
        readOn: "2026-11-23",
      },
      {
        fact: "SOCHH has run since 2017 and now offers TK/K, CORE 1st–5th, CORE Middle School, Arts & Innovations and L.E.A.P.S.",
        source: "SOCHH, Programs",
        url: "https://southochybridhomeschool.com/programs/",
        readOn: "2026-11-23",
      },
    ],
    hook: "On episode 078 of the Learning to Glow podcast (July 10, 2024), Natalie, introduced as Founder and Director of SOCHH, talked about alternative schooling and what type of child could benefit from it.",
    body: `Hi Natalie,

On the Learning to Glow podcast you talked about what kind of child could benefit from alternative schooling. I loved that SOCHH's own history answers it: a co-op of "accidental homeschoolers" that became a campus with programs from TK to 8th grade.

Stories like that are why I wanted to write. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for SOCHH.

I'd love to hear how the co-op became a campus.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your admissions.",
    stickyNote: "Natalie, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "sochh-w4k8",
    checkBeforeMailing: [
      "Find a mailing address: the site publishes none, and the tour form says the campus address is sent only to tour registrants and differs from the mailing address. A nonprofit directory lists a Laguna Hills suite (23016 Lake Forest Dr, Ste A166), likely the mailing address; confirm it before using.",
      "The hook is the July 2024 Learning to Glow episode (1h 8m); the description names her as SOCHH's founder and director. It's two years old, so skim it before copying the letter out. The host, Jess Iturzaeta, appears to be a SOCHH parent (the site has an Iturzaeta family testimonial); don't mention that.",
      "\"Accidental homeschoolers\" is Natalie's phrase from her history of SOCHH on the About page.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the May email, the program-info gate and four-form admissions, one proof number, offer the snapshot",
      subject: "Program fees at SOCHH",
      body: `Hi Natalie,

I mailed you a handwritten note last week with a card for SOCHH. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in May) and a one-page snapshot of what a family sees on your site today.

One thing stood out: to see 2026–27 programs and fees, a family signs up for emails and texts first, then a tour form, four orientation videos and the Intent to Enroll.

I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Natalie,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the SOCHH version: a tour request landing in your admin inbox, the enrollment checklist, and the statement page a CORE family would see.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where SOCHH is, with no pitch",
      where: "Instagram (@wearesochh)",
      body: "Hi, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Love seeing a co-op grow into a whole campus. The holiday marketplace looks great.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Natalie,

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
      body: `Hi Natalie,

I'll leave it here so I'm not cluttering your inbox. The SOCHH version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
