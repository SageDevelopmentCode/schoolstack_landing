import type { OutreachPlan } from "./types";

export const desertSunRanchAcademyOutreach: OutreachPlan = {
  slug: "desert-sun-ranch-academy",
  schoolName: "Desert Sun Ranch Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Julie and Jaclyn",
    role: "Co-founders (Julie Philips; Jaclyn Wahlberg, occupational therapist)",
    source: "Desert Sun Ranch, About (Our Story)",
  },
  angle:
    "One real question: the About page says Julie wants to eliminate frustrating bureaucracy for families and keep communication transparent, and tuition is billed quarterly with a $500 enrollment fee and a $300 technology fee. How do families see what they owe and what's paid?",
  facts: [
    {
      fact: "Desert Sun Ranch Academy is an in-person K–8 learning center in Queen Creek, Arizona with a focus on special needs: nature-based learning, animal care, a 1:4 staff ratio, Orton-Gillingham, and occupational therapy built into the school day",
      source: "Desert Sun Ranch, Home",
      url: "https://desertsunranchacademy.org/",
      readOn: "2026-11-23",
    },
    {
      fact: "2026–27 tuition is $18,500 (2 days), $23,250 (3 days), $28,000 (4 days) or $32,500 (5 days), billed quarterly, plus a $500 enrollment fee to secure a spot, a $250 re-enrollment fee for returning students and a $300 yearly technology/curriculum fee",
      source: "Desert Sun Ranch, Tuition and Calendar",
      url: "https://desertsunranchacademy.org/tuition-details",
      readOn: "2026-11-23",
    },
    {
      fact: "The About page says Julie Philips co-founded the school with occupational therapist Jaclyn Wahlberg, and that Julie is determined to treat families as integral to their child's education, eliminating frustrating bureaucracy while facilitating effective communication and transparency",
      source: "Desert Sun Ranch, About",
      url: "https://desertsunranchacademy.org/about",
      readOn: "2026-11-23",
    },
    {
      fact: "The 2026–27 academic calendar is a one-page PDF linked from the tuition page; it marks summer enrichment camps as extra cost",
      source: "Desert Sun Ranch, Academic Calendar 2026–2027 (PDF)",
      url: "https://www.desertsunranchacademy.org/s/Academic-Calendar-2026-2027-2-1.pdf",
      readOn: "2026-11-23",
    },
    {
      fact: "The only way to reach the school on the site is the Contact page form; it says the school strives to reply within 2–3 business days",
      source: "Desert Sun Ranch, Contact",
      url: "https://desertsunranchacademy.org/contact",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Two co-founders: the email greets both (\"Hi Julie and Jaclyn,\"). Send it to the school's admin address on the site.",
    "The site doesn't mention ESA or any funding program; the plan doesn't raise it.",
    "KaiPod Learning posted Desert Sun Ranch's teaching jobs (2025–26), so it's likely a KaiPod partner school and KaiPod may supply some tools. No KaiPod form is on the site.",
    "GreatSchools lists the school as K–5; the school's own site says K–8. The plan follows the site.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "OXMYcG-c7KTr8XwaYNCSKw",
    preparedOn: "2026-11-23",
    summary:
      "We read all 4 pages of desertsunranchacademy.org on Nov 23, 2026, plus the 2026–27 calendar PDF.",
    pageSpeed: { mobileScore: 62, url: "https://desertsunranchacademy.org/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "apply",
        gap: "There's no application on the site",
        saw: "Every \"Inquire Now\" and \"Contact Us\" button leads to one contact form. The page says the school strives to reply within 2–3 business days.",
        impact: "A family ready to apply sends a message and waits days to learn what comes next.",
        source: "Desert Sun Ranch, Contact",
        url: "https://desertsunranchacademy.org/contact",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "An online application families can save and finish later, landing in one admin inbox with every inquiry.",
        },
      },
      {
        area: "tour",
        gap: "The site doesn't mention visits",
        saw: "None of the four pages says whether families can visit the ranch or meet the team before enrolling.",
        impact: "A family choosing a school for a child with special needs can't see how to come and look first.",
        source: "Desert Sun Ranch, Home, About, Tuition and Contact",
        url: "https://desertsunranchacademy.org/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick an open visit time on the site, and each visit shows up in your admin inbox.",
        },
      },
      {
        area: "enroll",
        gap: "The $500 enrollment fee can't be paid online",
        saw: "The tuition page says a $500 enrollment fee secures a spot and lists a $300 technology/curriculum fee. It doesn't say how to pay them or what forms follow.",
        impact: "A family ready to hold a spot has to ask how to pay before they can secure it.",
        source: "Desert Sun Ranch, Tuition and Calendar",
        url: "https://desertsunranchacademy.org/tuition-details",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "One enrollment checklist: the agreement signed online and the $500 fee paid to secure the spot.",
        },
      },
      {
        area: "pay",
        gap: "Quarterly tuition, with no payment details",
        saw: "Tuition is billed quarterly; for 5 days that's $8,125 a quarter. The site doesn't say how families pay or whether smaller payments are possible.",
        impact: "A family can't see how they'll pay a bill that size, or plan for it, before enrolling.",
        source: "Desert Sun Ranch, Tuition and Calendar",
        url: "https://desertsunranchacademy.org/tuition-details",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "autopay", "card-and-ach"],
          text: "Each quarterly bill in the family's billing page, paid by card or bank, with autopay if they want it.",
        },
      },
      {
        area: "updates",
        gap: "The school calendar is a PDF",
        saw: "The 2026–27 calendar is a one-page PDF linked from the tuition page. It marks closed days, half days with 11:30 release and summer camps at extra cost.",
        impact: "Families download the PDF again to check a half day, and a change means sending a new file.",
        source: "Desert Sun Ranch, Academic Calendar 2026–2027 (PDF)",
        url: "https://www.desertsunranchacademy.org/s/Academic-Calendar-2026-2027-2-1.pdf",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal"],
          text: "A live school calendar each family sees in their own login and in the app.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 62 out of 100 on mobile. The main content takes about 15 seconds to appear.",
        impact: "A parent opening the site on a phone waits a long time before seeing anything.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://desertsunranchacademy.org/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with images sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Desert Sun Ranch",
    founder: {
      fullName: "Julie Philips and Jaclyn Wahlberg",
      firstName: "Julie and Jaclyn",
      role: "Co-founders",
      source: "Desert Sun Ranch, About (Our Story)",
      url: "https://desertsunranchacademy.org/about",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Julie Philips co-founded Desert Sun Ranch with occupational therapist Jaclyn Wahlberg, and the school's OT works in the classroom all day alongside the lead instructor.",
        source: "Desert Sun Ranch, About and Home",
        url: "https://desertsunranchacademy.org/about",
        readOn: "2026-11-23",
      },
      {
        fact: "The About page says Julie is determined to treat families as integral to their child's education, eliminating frustrating bureaucracy while facilitating effective communication and transparency.",
        source: "Desert Sun Ranch, About",
        url: "https://desertsunranchacademy.org/about",
        readOn: "2026-11-23",
      },
    ],
    hook: "Julie Philips co-founded Desert Sun Ranch with occupational therapist Jaclyn Wahlberg, and the school's OT works in the classroom all day alongside the lead instructor.",
    body: `Hi Julie and Jaclyn,

A school started by a parent and an occupational therapist, with the OT in the classroom all day, is a rare thing. So is a founding promise to cut the bureaucracy families usually wade through.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Desert Sun Ranch.

I'd like to hear how the animals and the therapy fit into a typical day.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Julie and Jaclyn, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "desertsun-5wv4",
    checkBeforeMailing: [
      "Find a mailing address: the site lists only \"Queen Creek, AZ 85142\" (no street), the Contact page has only a form and email, and GreatSchools and KaiPod's job posts give no street address either. Ask by email, or check the Facebook page's About tab. It's a ranch, so it may be a home: don't use a home address.",
      "No podcast or press about Julie or Jaclyn turned up; the hook is from the About and Home pages.",
      "Julie's bio mentions her own children; the letter leaves that out on purpose.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about quarterly bills and fees, tied to their own words on transparency, then who's asking and one proof number",
      subject: "Quarterly tuition at Desert Sun Ranch",
      body: `Hi Julie and Jaclyn,

I mailed you a handwritten note last week with a card for Desert Sun Ranch.

Your About page says you want less bureaucracy and clear communication for families. Tuition is billed quarterly, with a $500 enrollment fee and a $300 technology fee on top.

How do families see what they owe each quarter and what's already paid?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Julie and Jaclyn,

In case it's easier to see than describe, I set up a version of MudKitchen for Desert Sun Ranch and recorded a 60-second walkthrough: an inquiry landing in your admin inbox, the enrollment checklist with the $500 fee, and a family's quarterly bill paid by card or bank.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Desert Sun Ranch is, with no pitch",
      where: "Instagram (desert_sun_ranch_academy)",
      body: "Hi Julie and Jaclyn, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. An OT in the classroom all day, plus animals to care for, is a lovely combination.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Julie and Jaclyn,

I also put together a one-page snapshot of what a family sees on your site today, from finding a price to paying tuition. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Julie and Jaclyn,

I'll leave it here so I'm not cluttering your inbox. The Desert Sun Ranch version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
