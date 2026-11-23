import type { OutreachPlan } from "./types";

export const katsCommunityMicroschoolOutreach: OutreachPlan = {
  slug: "kats-community-microschool",
  schoolName: "Kat's Community Microschool",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Kathleen",
    role: "Founder and lead guide",
    source:
      "Kat's Community Microschool home page, \"Meet your guide\" section (\"Kathleen Graves, Founder & Lead Guide\", written in the first person), which also links her LinkedIn; matches the CRM contact K.L. Graves",
  },
  angle:
    "One real question: Enroll Now, Reserve a Seat and Schedule a Visit all lead to her email and phone, and she walks each family through AZ ESA enrollment herself. How does she keep track of where each family is?",
  facts: [
    {
      fact: "Kat's Community Microschool serves 3rd–6th graders in Phoenix, AZ (85015), with no more than 10 students at a time, powered by Prenda's curriculum and aligned to Arizona state standards",
      source: "Kat's Community Microschool home page (About Us)",
      url: "https://katscommunitymicroschool.com/",
      readOn: "2026-11-22",
    },
    {
      fact: "The site says the school is tuition-free for most Arizona families through the AZ ESA program; the FAQ says Prenda and the school help families sign up and walk through every step of enrolling in AZ ESA, and that Kathleen will personally walk families through it",
      source: "Kat's Community Microschool home page (hero and FAQ)",
      url: "https://katscommunitymicroschool.com/#faq",
      readOn: "2026-11-22",
    },
    {
      fact: "The Enroll Now, Reserve a Seat and Schedule a Visit buttons all jump to the Let's Talk section, which lists an email address, a phone/text number and the 85015 ZIP code; there is no form on the site",
      source: "Kat's Community Microschool home page (Let's Talk)",
      url: "https://katscommunitymicroschool.com/#contact",
      readOn: "2026-11-22",
    },
    {
      fact: "Kathleen Graves is founder and lead guide, with 15+ years teaching, an M.Ed. in Secondary Education and a B.A. in History; she has taught 3rd–5th grade reading and math and 10th grade world history",
      source: "Kat's Community Microschool home page (Meet your guide)",
      url: "https://katscommunitymicroschool.com/#owner",
      readOn: "2026-11-22",
    },
    {
      fact: "Four pillars (Conquer, Collaborate, Create, Connect); each day includes breakfast, lunch and snacks provided as families request with a monthly menu, and extracurriculars through Outschool chosen by families and kids",
      source: "Kat's Community Microschool home page (Our Approach)",
      url: "https://katscommunitymicroschool.com/#services",
      readOn: "2026-11-22",
    },
    {
      fact: "The school calendar opens on August 2026: First Day of School on Aug 3, daily menus for Aug 3–7, Family welcome night Aug 12, Garden planting day Aug 19, Labor Day Sep 7, then Thanksgiving Nov 26–27; December through February are empty",
      source: "Kat's Community Microschool home page (School Calendar)",
      url: "https://katscommunitymicroschool.com/#calendar",
      readOn: "2026-11-22",
    },
    {
      fact: "The footer's Prenda Page link opens Prenda's listing for the school, which says \"This microschool is not available for the selected school year\" with 2026–27 selected",
      source: "Prenda microschool page for Kat's Community Microschool",
      url: "https://microschools.prenda.com/ms/Kat",
      readOn: "2026-11-22",
    },
    {
      fact: "The site links a Facebook group named Kat's Community Microschool; the group page shows it as a public group with 11 members",
      source: "Kat's Community Microschool Facebook group",
      url: "https://www.facebook.com/groups/931511506428164",
      readOn: "2026-11-22",
    },
    {
      fact: "The site is a single WordPress page first published May 7, 2026; PageSpeed's mobile test scored it 62, with the main content appearing after about 8.5 seconds",
      source: "Kat's Community Microschool sitemap and Google PageSpeed Insights",
      url: "https://katscommunitymicroschool.com/page-sitemap.xml",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Prenda's listing for Kat's shows no 2026–27 term (\"not available for the selected school year\"), while her own site still says Enroll Now and the calendar starts Aug 3, 2026. Confirm the school is open and enrolling before sending; if it isn't, switch this plan to doNotEmail.",
    "Kathleen Graves is named on the site as Founder & Lead Guide; the CRM contact is K.L. Graves. Check the CRM address against the one in her site's Let's Talk section before sending.",
    "Prenda provides the curriculum and helps with AZ ESA enrollment, and may handle part of enrollment or ESA billing itself. We work alongside Prenda; don't pitch replacing it.",
    "Uses Prenda's Prenda microschool page: decide whether to pitch replacing it (it's Prenda's listing, so most likely keep it and only point families to her own site).",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). Confirm what we'd set up for an ESA-funded Prenda school before sending the snapshot.",
    "The demo's parent billing step is titled \"Families manage ESA enrollment\"; check what the parent billing tab shows before recording the Loom so it doesn't show tuition she doesn't charge.",
    "The site's testimonial and calendar menus read like starter content from her web builder (The Free Website Guys); none of it is used in the emails.",
    "Confirm Rooted Meadows opened on MudKitchen this August before sending step 4.",
  ],
  snapshot: {
    token: "UUBCePfqQsrqqQq_beaYSw",
    preparedOn: "2026-11-22",
    summary:
      "We read every section of katscommunitymicroschool.com (a single page) on Nov 22, 2026, opened each FAQ answer and calendar month, and followed its links to Prenda and the Facebook group.",
    pageSpeed: { mobileScore: 62, url: "https://katscommunitymicroschool.com/", checkedOn: "2026-11-22" },
    toolStack: [
      {
        name: "Email and phone",
        usedFor: "Enrolling, reserving a seat, visits and ESA questions",
        url: "https://katscommunitymicroschool.com/#contact",
      },
      {
        name: "Facebook group",
        usedFor: "Family community and classroom moments",
        url: "https://katscommunitymicroschool.com/#portfolio",
      },
      {
        name: "Prenda microschool page",
        usedFor: "School listing (the footer's Prenda Page)",
        url: "https://microschools.prenda.com/ms/Kat",
        network: "Prenda",
      },
    ],
    observations: [
      {
        area: "find",
        gap: "The linked Prenda page says the school isn't available this year",
        saw: "The footer's Prenda Page link opens Prenda's listing for Kat's, which says \"This microschool is not available for the selected school year\" with 2026–27 selected. Her own site says Enroll Now and seats are limited to 10.",
        impact: "A family checking the school on Prenda before reaching out may read it as closed for the year and stop there.",
        source: "Prenda microschool page for Kat's Community Microschool",
        url: "https://microschools.prenda.com/ms/Kat",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "The site we build shows grades 3–6 as Open, Waitlist or Full straight from your own program, so the answer families see doesn't depend on another listing.",
        },
      },
      {
        area: "tour",
        gap: "Schedule a Visit leads to an email address",
        saw: "The Schedule a Visit button under Meet Kathleen jumps to the Let's Talk section, which lists an email address, a phone/text number and a ZIP code. There's no way to pick a time.",
        impact: "Every visit starts with messages back and forth to find a time, and a family who reaches out after hours waits to hear back before anything is booked.",
        source: "Kat's Community Microschool home page (Let's Talk)",
        url: "https://katscommunitymicroschool.com/#contact",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a visit time from slots you open, and get a reminder before it.",
        },
      },
      {
        area: "apply",
        gap: "Enroll Now and Reserve a Seat open the same contact details",
        saw: "Enroll Now in the menu and Reserve a Seat in the hero both jump to Let's Talk (email and phone). There's no form, and no page says what happens after a family reaches out or how a seat is held.",
        impact: "Families can't see the steps to a seat, and each inquiry lands in a personal inbox or phone, where it's easy for one to slip.",
        source: "Kat's Community Microschool home page",
        url: "https://katscommunitymicroschool.com/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families start from a form on your site, and each one lands in your admin inbox with its stage, from first message to enrolled.",
        },
      },
      {
        area: "enroll",
        gap: "The AZ ESA steps aren't written down for families",
        saw: "The FAQ says Prenda and the school help families sign up and walk through every step of enrolling in AZ ESA, and that Kathleen will personally walk families through it. The site doesn't list those steps, what to have ready or how long approval takes.",
        impact: "Each family learns the ESA steps one conversation at a time, and Kathleen repeats the same walkthrough for every new family.",
        source: "Kat's Community Microschool home page (FAQ)",
        url: "https://katscommunitymicroschool.com/#faq",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements"],
          text: "Each accepted family gets one checklist with your ESA steps as items and the enrollment agreement signed online, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say what a seat costs or what ESA covers",
        saw: "\"How much does it cost?\" answers that the school can be tuition-free to qualifying students, and the next answer says most, if not all, costs can be covered by AZ ESA. No page gives the tuition or what a family might owe if ESA doesn't cover it all.",
        impact: "A family can't tell whether they'll owe anything until they ask, and families outside ESA have no number to plan around.",
        source: "Kat's Community Microschool home page (FAQ)",
        url: "https://katscommunitymicroschool.com/#faq",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "third-party-payer-billing"],
          text: "The site we build states tuition and what ESA covers, and we'd set up billing that marks each family's ESA payment against it, so any remainder is clear to them and to you.",
        },
      },
      {
        area: "updates",
        gap: "The school calendar stops after Thanksgiving",
        saw: "The calendar opens on August 2026. Daily menus cover Aug 3–7 only, though it says menus are updated monthly. The last entry is Thanksgiving break on Nov 26–27, and December through February are empty.",
        impact: "Families looking for winter break, upcoming events or this week's meals won't find them, and each change means editing the website.",
        source: "Kat's Community Microschool home page (School Calendar)",
        url: "https://katscommunitymicroschool.com/#calendar",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal"],
          text: "Breaks, events and menus go on a school calendar you update in a minute, and families see it in their own login.",
        },
      },
      {
        area: "updates",
        gap: "Classroom moments are shared in a public Facebook group",
        saw: "Inside the Classroom and the contact section both say \"Join our Facebook group\". The group page shows it as a public group with 11 members.",
        impact: "Anyone can see what's posted in a public group, so student photos need care, and families who don't use Facebook miss the updates.",
        source: "Kat's Community Microschool Facebook group",
        url: "https://www.facebook.com/groups/931511506428164",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["photos", "messaging", "parent-portal", "mobile-app"],
          text: "Class photos and messages go to a private gallery in each family's login, on the web and the iPhone app, with photo consent recorded per child.",
        },
      },
      {
        area: "website",
        gap: "The home page takes about 8 seconds to load on a phone",
        saw: "Google PageSpeed's mobile test scored the home page 62 out of 100, with the main content appearing after about 8.5 seconds. The whole site is that one page.",
        impact: "Most parents look on a phone first, and some leave before the page finishes loading.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://katscommunitymicroschool.com/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service"],
          text: "We build and run a site that loads fast on a phone, with the visit booking and inquiry form built in.",
        },
      },
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "One real question about how she tracks each family from first message through AZ ESA, then who's asking and one proof number",
      subject: "ESA enrollment at Kat's",
      body: `Hi Kathleen,

I was reading your site. Enroll Now, Reserve a Seat and Schedule a Visit all lead to your email and phone, and the FAQ says you'll personally walk each family through AZ ESA enrollment.

With up to ten families, how do you keep track of where each one is between that first message, their ESA approval and the first day?

I ask because I run Sage Field, a microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so she can see it without clicking around",
      body: `Hi Kathleen,

In case it's easier to see than describe, I set up a version of MudKitchen for Kat's and recorded a 60-second walkthrough: a family's visit request landing in your admin inbox, then the enrollment checklist they finish once you accept them.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Kathleen is, with no pitch",
      where: "LinkedIn (linked from Meet your guide on her site)",
      body: "Hi Kathleen, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Enjoyed reading about Kat's four pillars, especially Conquer and Create.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Kathleen,

I also put together a one-page snapshot of what a family sees on your site today, from Reserve a Seat to the school calendar. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Kathleen,

I'll leave it here so I'm not cluttering your inbox. The Kat's version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the school year.

Julius`,
    },
  ],
};
