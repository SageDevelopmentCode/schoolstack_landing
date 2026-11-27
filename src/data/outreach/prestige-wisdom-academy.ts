import type { OutreachPlan } from "./types";

export const prestigeWisdomAcademyOutreach: OutreachPlan = {
  slug: "prestige-wisdom-academy",
  schoolName: "Prestige Wisdom Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Prestige Wisdom team",
    role: "School leadership (no founder, director or staff member is named on the site)",
    source:
      "Prestige Wisdom Academy Home, About, Contact, Calendar and Careers pages: none names a founder, director or teacher; web searches found no other page about the school",
  },
  angle:
    "One real question: Schedule a Tour and Begin Enrollment both open the general contact form, and the events calendar for tours and family nights is empty. When a family asks for a tour, how does PWA find a time?",
  facts: [
    {
      fact: "The home page says \"Now enrolling · Houston, TX\" and calls PWA \"a luxurious, family-centered micro-school\"; its Schedule a Tour and Begin Enrollment buttons go to the Contact page",
      source: "Prestige Wisdom Academy home page",
      url: "https://www.prestigewisdomacademy.org/",
      readOn: "2026-11-23",
    },
    {
      fact: "The Contact page has one general form (full name, email, phone, subject, message), says \"We typically respond within one business day\", and lists the Houston campus at 5125 FM 1960 Rd W., Houston, TX 77069",
      source: "Prestige Wisdom Academy, Contact",
      url: "https://www.prestigewisdomacademy.org/contact",
      readOn: "2026-11-23",
    },
    {
      fact: "The Calendar page promises \"Tours, family nights, and community gatherings at PWA\" and shows \"No upcoming events. Check back soon.\"",
      source: "Prestige Wisdom Academy, Calendar",
      url: "https://www.prestigewisdomacademy.org/calendar",
      readOn: "2026-11-23",
    },
    {
      fact: "The Careers page lists four open roles in Houston: Lead Elementary Teacher, Middle School Math Instructor (grades 6–8), After-School Program Coordinator, and Campus Operations Assistant (\"family communications, and front-office hospitality\")",
      source: "Prestige Wisdom Academy, Careers",
      url: "https://www.prestigewisdomacademy.org/careers",
      readOn: "2026-11-23",
    },
    {
      fact: "Six pillars shape every day: Faith & Love, Academic Excellence, Zero Tolerance for Bullying, Family Partnership, Character Development, Personalized Learning",
      source: "Prestige Wisdom Academy home page",
      url: "https://www.prestigewisdomacademy.org/",
      readOn: "2026-11-23",
    },
    {
      fact: "No page lists grades served, tuition, school hours or an application",
      source: "Prestige Wisdom Academy, all five pages (Home, About, Calendar, Contact, Careers)",
      url: "https://www.prestigewisdomacademy.org/about",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Find a name before sending: no founder, director or teacher is named on the site, and web searches turned up nothing else about the school. Swap \"Prestige Wisdom team\" in every step for a first name once you have one.",
    "The CRM row (low-confidence research) calls PWA a special-ed microschool for PreK–12; the site says nothing about special education and its job posts cover elementary and grades 6–8. The plan follows the site.",
    "The site went up around May 2026 and there's no other trace of the school online (no directory, TEFA listing or social page). Consider calling or driving past to confirm it's open before mailing the letter.",
    "TEFA isn't mentioned on the site, and TEFA requires two years of operation, so the plan leaves funding out.",
    "We'd build: Monthly billing for clubs, after-care or add-on classes. Confirm before sending the snapshot.",
    "No Instagram or Facebook is linked from the site; find their page before the social step, or skip it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "66M8Xwuscp7z4DlKjCyEZA",
    preparedOn: "2026-11-23",
    summary: "We read all 5 pages of prestigewisdomacademy.org on Nov 23, 2026, including the contact form, events calendar and job posts.",
    pageSpeed: { mobileScore: 78, url: "https://www.prestigewisdomacademy.org/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "tour",
        gap: "Booking a tour starts with a message",
        saw: "Every Schedule a Tour button opens the Contact page's general form (name, email, phone, subject, message), which says \"We typically respond within one business day.\"",
        impact: "A family who wants to visit has to write in and wait for a reply before they can pick a time.",
        source: "Prestige Wisdom Academy, home and Contact pages",
        url: "https://www.prestigewisdomacademy.org/contact",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick a tour time from your open slots, and each request lands in one admin inbox with the child's grade.",
        },
      },
      {
        area: "apply",
        gap: "Begin Enrollment opens the same contact form",
        saw: "The home page says \"Now enrolling\", but Begin Enrollment leads to the general contact form. There's no application on the site.",
        impact: "A family that's ready to enroll can't start an application; they can only send a message and wait.",
        source: "Prestige Wisdom Academy home page",
        url: "https://www.prestigewisdomacademy.org/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "An online application families can save and finish later, landing in the same admin inbox as tour requests.",
        },
      },
      {
        area: "find",
        gap: "Grades, tuition and hours aren't on the site",
        saw: "The site describes PWA's faith, values and small classes, but no page lists which grades you serve, what tuition is, or the school day's hours.",
        impact: "A parent comparing schools can't tell whether their child's grade is offered or whether PWA fits their budget without writing in first.",
        source: "Prestige Wisdom Academy, Home and About",
        url: "https://www.prestigewisdomacademy.org/about",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We write and look after program pages with grades, hours and tuition, built for you.",
        },
      },
      {
        area: "enroll",
        gap: "What happens after the tour isn't described",
        saw: "The site doesn't say what families fill in, sign or pay to hold a spot.",
        impact: "A family deciding after a tour can't see what's needed or what's due before they commit.",
        source: "Prestige Wisdom Academy, all five pages",
        url: "https://www.prestigewisdomacademy.org/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: forms, the enrollment agreement and the registration fee, with reminders until it's done.",
        },
      },
      {
        area: "updates",
        gap: "The events calendar is empty",
        saw: "The Calendar page promises \"Tours, family nights, and community gatherings at PWA\" and shows \"No upcoming events. Check back soon.\"",
        impact: "A family looking for an open house or family night to attend finds nothing to sign up for.",
        source: "Prestige Wisdom Academy, Calendar",
        url: "https://www.prestigewisdomacademy.org/calendar",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "tour-self-booking"],
          text: "Tour times and family nights show on your site and in each family's calendar as soon as you add them.",
        },
      },
      {
        area: "find",
        gap: "The after-school program is only on the Careers page",
        saw: "PWA is hiring an After-School Program Coordinator to \"lead enriching after-school activities\", but no family-facing page mentions after-school.",
        impact: "Working parents who need care after the school day can't see that PWA offers it.",
        source: "Prestige Wisdom Academy, Careers",
        url: "https://www.prestigewisdomacademy.org/careers",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "website-service"],
          text: "We'd add an after-school page families can sign up from, with monthly after-school billing alongside tuition.",
        },
      },
      {
        area: "website",
        gap: "No one at the school is named",
        saw: "The About page tells PWA's mission and culture, but the site names no founder, director or teacher.",
        impact: "Parents choosing a small school often want to know who will teach their child, and they have no name to ask for when they write in.",
        source: "Prestige Wisdom Academy, About",
        url: "https://www.prestigewisdomacademy.org/about",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We write a short Our Story and team page with you, in the school's own voice.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "PWA",
    founder: {
      fullName: "Prestige Wisdom Academy team",
      firstName: "Prestige Wisdom team",
      role: "School leadership (no one is named on the site)",
      source: "Prestige Wisdom Academy, About",
      url: "https://www.prestigewisdomacademy.org/about",
    },
    mailTo: {
      lines: ["Prestige Wisdom Academy", "5125 FM 1960 Rd W.", "Houston, TX 77069"],
      source: "Prestige Wisdom Academy Contact page, Houston Campus (\"5125 FM 1960 Rd W., Houston, TX 77069\")",
      url: "https://www.prestigewisdomacademy.org/contact",
    },
    founderFacts: [
      {
        fact: "PWA's Careers page lists four open roles in Houston: Lead Elementary Teacher, Middle School Math Instructor, After-School Program Coordinator and Campus Operations Assistant.",
        source: "Prestige Wisdom Academy, Careers",
        url: "https://www.prestigewisdomacademy.org/careers",
        readOn: "2026-11-23",
      },
      {
        fact: "Zero Tolerance for Bullying is one of the six pillars that PWA says shape every day.",
        source: "Prestige Wisdom Academy home page",
        url: "https://www.prestigewisdomacademy.org/",
        readOn: "2026-11-23",
      },
    ],
    hook: "PWA's Careers page lists four open roles in Houston: Lead Elementary Teacher, Middle School Math Instructor, After-School Program Coordinator and Campus Operations Assistant.",
    body: `Hi Prestige Wisdom team,

I saw on your Careers page that you're hiring for four roles, from a lead elementary teacher to a middle school math instructor. I also loved that zero tolerance for bullying is one of your six pillars.

Running a small school ourselves, I know how much that takes. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for PWA.

I'd love to hear how enrollment is going this year.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "PWA team, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "pwa-h3t7",
    checkBeforeMailing: [
      "No founder or director is named on the site or anywhere online, so the letter is addressed to the team and opens on the Careers page. Swap the greeting for a first name if you find one.",
      "The address is the Houston Campus listed on the Contact page, on FM 1960 Rd W., a commercial road. Check on a map that it's a school or office building before mailing.",
      "There's no trace of the school outside its own site, which went up around May 2026. Confirm it's open (a call to the number on the Contact page is quickest) before mailing.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about booking tours from a contact form, then who's asking and one proof number",
      subject: "tours at Prestige Wisdom",
      body: `Hi Prestige Wisdom team,

I mailed you a handwritten note last week with a card for PWA.

On your site, Schedule a Tour and Begin Enrollment both open the same contact form, and the calendar for tours and family nights says "No upcoming events" right now.

When a family asks for a tour, how do you find a time that works?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Prestige Wisdom team,

In case it's easier to see than describe, I set up a version of MudKitchen for PWA and recorded a 60-second walkthrough: a tour request landing in your admin inbox, the enrollment checklist families finish online, and the billing page they'd pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where PWA is, with no pitch",
      where: "Facebook, Instagram or LinkedIn (none are linked from the site; search for Prestige Wisdom Academy Houston first)",
      body: "Hi, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. I like that family partnership is one of PWA's six pillars.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Prestige Wisdom team,

I also put together a one-page snapshot of what a family sees on your site today, from asking for a tour to enrolling. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Prestige Wisdom team,

I'll leave it here so I'm not cluttering your inbox. The PWA version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with your new hires.

Julius`,
    },
  ],
};
