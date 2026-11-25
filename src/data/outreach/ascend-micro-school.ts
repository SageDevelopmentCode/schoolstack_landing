import type { OutreachPlan } from "./types";

export const ascendMicroSchoolOutreach: OutreachPlan = {
  slug: "ascend-micro-school",
  schoolName: "Ascend Micro School",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Elizabeth",
    role: "Director",
    source: "Ascend Our Team page (Elizabeth Watkins, Director); the Employment page calls her executive director",
  },
  angle: "Re-contact with a snapshot: the application runs on two Google Forms and a checklist families can't open",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the Ascend Micro School MudKitchen demo",
  },
  facts: [
    {
      fact: "Enrolling for 2026–27. Steps: phone call or info meeting, the application and a reference form (two Google Forms), school tour, family interview, then a decision",
      source: "Ascend Admissions",
      url: "https://ascendmicroschool.com/admissions/",
      readOn: "2026-11-22",
    },
    {
      fact: "The \"application checklist\" link on the Admissions page opens a Google Doc that asks for a Google sign-in",
      source: "Ascend Admissions",
      url: "https://ascendmicroschool.com/admissions/",
      readOn: "2026-11-22",
    },
    {
      fact: "After acceptance, families have 1 week to submit a deposit equal to the last month's tuition plus enrollment paperwork, or the spot is released",
      source: "Ascend Admissions",
      url: "https://ascendmicroschool.com/admissions/",
      readOn: "2026-11-22",
    },
    {
      fact: "No tuition amount on the site; tuition help comes from the school, Parents Challenge and a partnership with ACE Scholarships; sibling discount; about 3% increase a year",
      source: "Ascend Admissions",
      url: "https://ascendmicroschool.com/admissions/",
      readOn: "2026-11-22",
    },
    {
      fact: "Faith-based K–6 homeschool hybrid in southwest Black Forest, 2 days a week (Mondays and Wednesdays, 9:00–3:00), 8:1 ratio; part of the Scholé Communities network",
      source: "Ascend FAQs",
      url: "https://ascendmicroschool.com/faqs/",
      readOn: "2026-11-22",
    },
    {
      fact: "Google Classroom carries skills, home ideas, photos and videos for families",
      source: "Ascend FAQs",
      url: "https://ascendmicroschool.com/faqs/",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June (the first email says so).",
    "Open the Admissions page's application checklist link in a private window and confirm it still asks for a Google sign-in (the first email quotes it).",
    "The demo still shows K–8, Tuesdays and Thursdays and $3,575/yr; the site now says K–6 on Mondays and Wednesdays and shows no price. Update the demo before recording the Loom.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "We'd build: Weekly learning plans for home days",
  ],
  snapshot: {
    token: "Wae8WdLjDxp4WroO_S5DGw",
    preparedOn: "2026-12-01",
    summary: "We read every main page of ascendmicroschool.com on Dec 1, 2026, from Admissions and the FAQs to Our Team, plus both application forms.",
    pageSpeed: { mobileScore: 95, url: "https://ascendmicroschool.com/", checkedOn: "2026-12-01" },
    toolStack: [
      { name: "Google Forms", usedFor: "Application and reference form", url: "https://ascendmicroschool.com/admissions/" },
      { name: "Google Docs", usedFor: "Application checklist", url: "https://ascendmicroschool.com/admissions/" },
      { name: "Google Classroom", usedFor: "Skills, home ideas, photos and videos", url: "https://ascendmicroschool.com/faqs/" },
    ],
    observations: [
      {
        area: "find",
        gap: "Tuition isn't on the site",
        saw: "The Tuition section explains why costs stay low, a yearly increase of about 3% and a sibling discount, but gives no amount. The deposit is the last month's tuition, so families can't work that out either.",
        impact: "Every family has to email before they know whether Ascend fits their budget, and some won't ask.",
        source: "Ascend Admissions",
        url: "https://ascendmicroschool.com/admissions/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "tuition-rate-plans", "discounts"],
          text: "The site we build shows tuition and the sibling discount as text, from the same plans families are billed on.",
        },
      },
      {
        area: "tour",
        gap: "Step 1 has no way to book",
        saw: "The first step is \"Schedule a phone call or attend/watch an info meeting\", with no booking link, meeting dates or recording. The home page's only way in is an email link.",
        impact: "Families start with an email and wait for a reply before they can take the first step.",
        source: "Ascend Admissions",
        url: "https://ascendmicroschool.com/admissions/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a call or info meeting time from slots you open, and get a reminder before it.",
        },
      },
      {
        area: "apply",
        gap: "The application checklist asks families to sign in",
        saw: "The Admissions page offers an application checklist to \"view and print\". The link opens a Google Doc that asks for a Google sign-in first.",
        impact: "Families without access can't see the full list of steps, so they piece it together from the page or email to ask.",
        source: "Ascend Admissions",
        url: "https://ascendmicroschool.com/admissions/",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "The application lives on your site with saved drafts, and every application lands in one admin inbox, so there's no separate checklist to share.",
        },
      },
      {
        area: "apply",
        gap: "Applying takes two separate Google Forms",
        saw: "Families fill in the application form, then pass a separate reference form to a teacher or another adult. The application also asks families to agree to the semester withdrawal policy with a yes or no.",
        impact: "Answers arrive in two places, and you match each reference to its family by hand before a decision.",
        source: "AMS Application (Google Forms)",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSenc38RS43m61Y1XoN3bVuYy4gcoIAOEU7Kv5npo6QIaAUvvA/viewform",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Each family's application sits in one admin inbox with their record, so you see every applicant and where they are in one list.",
        },
      },
      {
        area: "enroll",
        gap: "A one-week deadline with no stated way to meet it",
        saw: "Accepted families have 1 week to send a deposit and enrollment paperwork, or the spot is released. The site doesn't say how the paperwork is sent or signed, or how to pay the deposit.",
        impact: "Families can miss the week while they ask how, and you track each deposit and form yourself.",
        source: "Ascend Admissions",
        url: "https://ascendmicroschool.com/admissions/",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: the agreement with your withdrawal policy signed online and the deposit paid, with reminders before the week is up.",
        },
      },
      {
        area: "pay",
        gap: "Three sources of tuition help, and no word on paying",
        saw: "Families can get help from the school, Parents Challenge or Ascend's ACE Scholarships partnership. The site doesn't say how tuition is paid or how a scholarship is applied.",
        impact: "A family with a scholarship can't see what they still owe, and the office reconciles each payer by hand.",
        source: "Ascend Admissions",
        url: "https://ascendmicroschool.com/admissions/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "autopay"],
          text: "We'd set up billing so scholarship amounts are recorded against each family, and they see and pay only their share, with autopay if they want it.",
        },
      },
      {
        area: "updates",
        gap: "The FAQ promises four tools and names one",
        saw: "The FAQ says Ascend uses \"four primary tools\" to support home days, then describes only Google Classroom, for skills, home ideas, photos and videos.",
        impact: "New families don't know where else to look for what they need on home days.",
        source: "Ascend FAQs",
        url: "https://ascendmicroschool.com/faqs/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["learning-plans", "photos", "parent-portal"],
          text: "We'd set up weekly plans for home days next to a private photo gallery, in one login for each family.",
        },
      },
      {
        area: "website",
        gap: "The home page's newest post is from 2019",
        saw: "Recent Posts on the home page lists five posts, the newest from February 2019. The FAQ's link to an article on mixed-age classes returns a 404.",
        impact: "A family landing on the home page can wonder whether the school is still running.",
        source: "Ascend home page",
        url: "https://ascendmicroschool.com/",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you leads with this year's programs and enrollment, and we keep it current.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Ascend",
    founder: {
      fullName: "Elizabeth Watkins",
      firstName: "Elizabeth",
      role: "Director",
      source: "Ascend Our Team page (\"Elizabeth Watkins, Director\"); the Employment page calls her executive director",
      url: "https://ascendmicroschool.com/our-staff/",
    },
    mailTo: {
      lines: ["Elizabeth Watkins", "Ascend Micro School", "6145 Shoup Road", "Colorado Springs, CO 80908"],
      source: "Address Julius found (2026-11-23); ascendmicroschool.com doesn't publish a street address, only \"southwest Black Forest\" on the FAQ page",
      url: "https://ascendmicroschool.com/faqs/",
    },
    founderFacts: [
      {
        fact: "Ascend's homepage describes a faith-based K–6 hybrid school in northern Colorado Springs with two days a week of attendance, small mixed-age classes at a student-to-instructor ratio of 8:1 or less, and a personalized learning plan for each student.",
        source: "Ascend Micro School homepage",
        url: "https://ascendmicroschool.com/",
        readOn: "2026-11-22",
      },
      {
        fact: "Elizabeth Watkins, Ascend's Director, has been part of the Ascend community since 2020.",
        source: "Ascend Our Team page",
        url: "https://ascendmicroschool.com/our-staff/",
        readOn: "2026-11-22",
      },
      {
        fact: "Elizabeth Watkins's bio on Ascend's Our Team page says she was raised in the woods of Northern Maine and grew up in a homeschooling family; she has been part of Ascend since 2020 and is its Director.",
        source: "Ascend Our Team page (Elizabeth Watkins's bio)",
        url: "https://ascendmicroschool.com/our-staff/",
        readOn: "2026-11-23",
      },
    ],
    hook: "Elizabeth Watkins's bio on Ascend's Our Team page says she was raised in the woods of Northern Maine and grew up in a homeschooling family; she has been part of Ascend since 2020 and is its Director.",
    body: `Hi Elizabeth,

I loved your bio on the Ascend site. You were raised in the woods of Northern Maine in a homeschooling family, and now you lead a school where kids learn part of the week at home and part on campus.

Time outside is a big part of our days too. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Ascend.

I'd love to hear how families split the week between home and campus.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Elizabeth, a note from a microschool in Round Rock, Texas. J",
    shortCode: "ascend-2xyp",
    checkBeforeMailing: [
      "Mailing address is 6145 Shoup Road, Colorado Springs, CO 80908 (Black Forest area), which Julius found; the school's site lists no street address and a web search found no page naming it. Before mailing, make sure this is the school's site and not someone's home.",
      "Written to Elizabeth Watkins, the Director (also the plan's email recipient), and it opens on her own bio from the Our Team page (raised in the woods of Northern Maine, homeschooled). The Our Story page is written by an earlier founder, Sarah, who isn't on the Our Team page, so the letter doesn't mention her.",
      "Worth a look: the Cato Institute Friday Feature on Ascend (https://www.cato.org/blog/friday-feature-ascend-micro-school, July 2026) reportedly names Elizabeth as director; it blocked our reader. Open it for anything newer about Elizabeth or the school before mailing.",
      "The homepage says K–6; a search summary of the Cato piece mentions K–6 \"starting this fall\", narrowed from K–8. The letter doesn't mention grades, so nothing to change.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro: acknowledge the June email, give a new reason (the snapshot), one proof number",
      subject: "Ascend's application checklist",
      body: `Hi Elizabeth,

I mailed you a handwritten note last week with a card for Ascend. I first wrote in June about a version of MudKitchen I set up for you. Since then I put together a one-page snapshot of what a family sees on your site today, from the first call to the deposit.

One thing stood out: the application checklist on your Admissions page asks families to sign in to Google before it opens.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to email the snapshot too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Elizabeth,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Ascend version: the homepage, the enrollment checklist a family gets after acceptance, and your admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school is, with no pitch",
      where: "Instagram or Facebook (ascendmicroschool)",
      body: "Hi Elizabeth, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Loved reading that your students wrote a musical to raise money for Casa Angelina.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Elizabeth,

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
      body: `Hi Elizabeth,

I'll leave it here so I'm not cluttering your inbox. The Ascend version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the year.

Julius`,
    },
  ],
};
