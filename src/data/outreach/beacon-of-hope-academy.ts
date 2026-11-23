import type { OutreachPlan } from "./types";

export const beaconOfHopeAcademyOutreach: OutreachPlan = {
  slug: "beacon-of-hope-academy",
  schoolName: "Beacon of Hope Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Cassandra",
    role: "Founder and ESE Teacher (Cassandra Orozco)",
    source: "Beacon of Hope Academy Welcome Message, signed \"Cassandra Orozco, Founder and ESE Teacher\"",
  },
  angle:
    "One real question: the Enroll Now page's Apply Now button opens a Google Forms interest form (diagnosis, IEP, therapies), while the same page lists a $200 application fee and a $300 curriculum fee. How does a family get from that form to paying the fees?",
  facts: [
    {
      fact: "Now enrolling for 2026–2027: part-time (2–3 days a week) tuition is $9,350 and full-time (4–5 days) is $14,300, each with a non-refundable $200 application fee and $300 curriculum & technology fee",
      source: "Beacon of Hope Academy, Enroll Now",
      url: "https://www.beaconofhopeacademy.org/enroll-now",
      readOn: "2026-11-22",
    },
    {
      fact: "The Enroll Now page says to \"click the button below to access our interest form and secure your child's spot\"; Apply Now opens a Google Form titled \"BHA Microschool Interest Form\" that asks for the child's diagnosis, IEP, 504 or psychoeducational evaluation, and current therapies",
      source: "Beacon of Hope Academy, Enroll Now, and the BHA Microschool Interest Form (Google Forms)",
      url: "https://www.beaconofhopeacademy.org/enroll-now",
      readOn: "2026-11-22",
    },
    {
      fact: "Beacon of Hope is a faith-based special education center for students in K–5th grade in Greenacres, FL; the daily schedule runs 8:30 to 3:00 with a 10:15–11:15 block for occupational, speech-language or behavioral therapy, in person or by telehealth",
      source: "Beacon of Hope Academy, About Us and Our Daily Schedule",
      url: "https://www.beaconofhopeacademy.org/our-daily-schedule",
      readOn: "2026-11-22",
    },
    {
      fact: "Speech & language therapy and occupational therapy are offered through Presence, a teletherapy provider for PreK-12 schools",
      source: "Beacon of Hope Academy, Our Therapy Services",
      url: "https://www.beaconofhopeacademy.org/our-therapy-services",
      readOn: "2026-11-22",
    },
    {
      fact: "The Events page lists five events (Thanksgiving, Columbus Day, Online STEM Week, October Fall Fest, PTA Online Conferences) all dated Jul 12, 2035 at Ridgeview Middle School, San Francisco, with the description \"I'm an event description. Click here to open up the Event Editor\"",
      source: "Beacon of Hope Academy, Events",
      url: "https://www.beaconofhopeacademy.org/events",
      readOn: "2026-11-22",
    },
    {
      fact: "The home page says the K-5th grade learning center \"will be open in Greenacres, FL for the 2025-2026 school year\"",
      source: "Beacon of Hope Academy home page",
      url: "https://www.beaconofhopeacademy.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "Google PageSpeed gave the home page a mobile score of 72; the main content took about 11.6 seconds to appear and the page loads about 2.3 MB",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.beaconofhopeacademy.org%2F",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "The CRM lists Beacon of Hope as a KaiPod partner, and the home page shows a KaiPod Catalyst logo. KaiPod may give them tools; check before pitching replacements.",
    "The Enroll Now page has an invisible link to beaconofhopeacademy.classreach.com/Apply (it was behind a Cloudflare check, so we couldn't read it). They may already take applications in ClassReach; if so, adjust the apply gap and the first email's question.",
    "Florida families of children with special needs often pay with Step Up's FES-UA scholarship, but the site doesn't mention it. Don't raise scholarships unless Cassandra does.",
    "Instagram (@beaconhopeacademy) and Facebook are linked from the site but weren't opened; check one is active before the social step.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "2Wn5UO-24DFRaO5Lg6SxUw",
    preparedOn: "2026-11-22",
    summary:
      "We read all 19 pages of beaconofhopeacademy.org on Nov 22, 2026, plus the Apply Now interest form.",
    pageSpeed: { mobileScore: 72, url: "https://www.beaconofhopeacademy.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Google Forms",
        usedFor: "Microschool interest form (the Apply Now button)",
        url: "https://www.beaconofhopeacademy.org/enroll-now",
      },
      {
        name: "Wix contact form",
        usedFor: "Questions about programs and admissions",
        url: "https://www.beaconofhopeacademy.org/contact-us",
      },
    ],
    observations: [
      {
        area: "apply",
        gap: "Apply Now opens an interest form, not an application",
        saw: "The Enroll Now page says to \"click the button below to access our interest form and secure your child's spot\". Apply Now opens a Google Form, the \"BHA Microschool Interest Form\", which asks about the child's diagnosis, IEP or 504, therapies and goals. The page lists a $200 application fee but doesn't say when or how it's paid.",
        impact: "A family can send the form believing their spot is held, without seeing what comes next or when the $200 fee is due.",
        source: "Beacon of Hope Academy, Enroll Now, and the BHA Microschool Interest Form",
        url: "https://www.beaconofhopeacademy.org/enroll-now",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families apply on the site with the same questions about IEPs and therapies, can save and come back, and every application lands in one admin inbox with its status.",
        },
      },
      {
        area: "tour",
        gap: "There's no way to book a visit",
        saw: "The Book Online page says \"Nothing to book right now. Check back soon.\" The Contact page offers a form and an email address, and the Learning Center page asks families to contact the school for more information.",
        impact: "A parent who wants to see the learning center has to write in and wait for a reply before anything is on the calendar.",
        source: "Beacon of Hope Academy, Book Online and Contact Us",
        url: "https://www.beaconofhopeacademy.org/book-online",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick a visit time from the slots you open, right after their inquiry, and the visit shows up on that family's record.",
        },
      },
      {
        area: "pay",
        gap: "Tuition is listed, but not how families pay it",
        saw: "The Enroll Now page lists part-time tuition at $9,350 and full-time at $14,300, plus non-refundable $200 application and $300 curriculum & technology fees. It doesn't say when tuition is due, whether it can be paid monthly, or how to pay.",
        impact: "Families weighing a $14,300 year have to ask before they can plan for it.",
        source: "Beacon of Hope Academy, Enroll Now",
        url: "https://www.beaconofhopeacademy.org/enroll-now",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families choose pay-in-full or monthly, set up autopay by card or bank, and see every invoice and payment on their own billing page.",
        },
      },
      {
        area: "enroll",
        gap: "The site doesn't say what enrollment involves",
        saw: "After the interest form, the site doesn't describe the next steps: no enrollment agreement, forms or checklist are mentioned, and the fees are listed without a due date.",
        impact: "Families can't see ahead of time what they'll be asked to sign or pay to hold a spot.",
        source: "Beacon of Hope Academy, Enroll Now",
        url: "https://www.beaconofhopeacademy.org/enroll-now",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: sign the enrollment agreement and pay the application and curriculum fees online, with reminders until it's done.",
        },
      },
      {
        area: "updates",
        gap: "The Events page still shows sample events",
        saw: "The Events page lists Thanksgiving, Columbus Day, Online STEM Week, October Fall Fest and PTA Online Conferences, all on Jul 12, 2035 at Ridgeview Middle School in San Francisco, each with the text \"I'm an event description. Click here to open up the Event Editor\".",
        impact: "A parent looking for school dates finds placeholders instead, so real dates have to reach them some other way.",
        source: "Beacon of Hope Academy, Events",
        url: "https://www.beaconofhopeacademy.org/events",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal", "mobile-app"],
          text: "School dates live on one calendar in each family's login, on the web and the iPhone app, updated in one place.",
        },
      },
      {
        area: "website",
        gap: "The home page still talks about 2025–2026",
        saw: "The home page says the learning center \"will be open in Greenacres, FL for the 2025-2026 school year\", while the Enroll Now page is enrolling for 2026–2027.",
        impact: "A family landing on the home page may wonder whether the center has opened yet.",
        source: "Beacon of Hope Academy home page",
        url: "https://www.beaconofhopeacademy.org/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with the school year and dates kept current.",
        },
      },
      {
        area: "website",
        gap: "The home page takes about 11 seconds to fill in on a phone",
        saw: "Google PageSpeed gave the home page a mobile score of 72. The main content took about 11.6 seconds to appear, and the page loads about 2.3 MB.",
        impact: "A parent opening the site from a phone waits before seeing what the school offers.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.beaconofhopeacademy.org%2F",
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
    shortSchoolName: "Beacon of Hope",
    founder: {
      fullName: "Cassandra Orozco",
      firstName: "Cassandra",
      role: "Founder and ESE Teacher",
      source: "Beacon of Hope Academy, Welcome Message",
      url: "https://www.beaconofhopeacademy.org/welcome-message",
    },
    mailTo: {
      lines: ["Cassandra Orozco", "Beacon of Hope Academy", "6383 10th Ave. N., Suite A", "Greenacres, FL 33463"],
      source: "Beacon of Hope Academy, Contact Us (\"Visit us: 6383 10th Ave. N, Suite A, Greenacres FL, 33463\")",
      url: "https://www.beaconofhopeacademy.org/contact-us",
    },
    founderFacts: [
      {
        fact: "On the LiberatED Podcast (episode 322, \"Pre-launch plans: A former special education teacher prepares to open a new school\", June 17, 2025), Cassandra talked about opening Beacon of Hope, a faith-based microschool for K–5 students with special needs, before its first fall.",
        source: "LiberatED Podcast, Apple Podcasts episode page",
        url: "https://podcasts.apple.com/us/podcast/pre-launch-plans-a-former-special-education-teacher/id1608978473?i=1000713243528",
        readOn: "2026-11-22",
      },
      {
        fact: "In her Welcome Message, Cassandra writes that she has dedicated her career to serving students with special needs, and that Beacon of Hope is a place where students can feel safe, supported and encouraged to reach their full potential.",
        source: "Beacon of Hope Academy, Welcome Message",
        url: "https://www.beaconofhopeacademy.org/welcome-message",
        readOn: "2026-11-22",
      },
      {
        fact: "Beacon of Hope's daily schedule sets aside 10:15 to 11:15 each morning for occupational, speech-language or behavioral therapy, in person or by telehealth.",
        source: "Beacon of Hope Academy, Our Daily Schedule",
        url: "https://www.beaconofhopeacademy.org/our-daily-schedule",
        readOn: "2026-11-22",
      },
    ],
    hook: "On the LiberatED Podcast (episode 322, \"Pre-launch plans: A former special education teacher prepares to open a new school\", June 17, 2025), Cassandra talked about opening Beacon of Hope, a faith-based microschool for K–5 students with special needs, before its first fall.",
    body: `Hi Cassandra,

I saw your LiberatED interview from June 2025, recorded before Beacon of Hope's first fall, about building a faith-based school for K–5 students with special needs. I liked that therapy sits right in the middle of your school day.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our enrollment and tuition, and it's a big part of how we grew. Now we offer it to other microschools too.

I'd like to hear how opening compared with your plans. A text is plenty.

Julius`,
    postscript: "The card inside has a version of Beacon of Hope I set up, plus a parent's-eye look at your enrollment.",
    stickyNote: "Cassandra, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "beacon-q7m3",
    checkBeforeMailing: [
      "Listen to the LiberatED episode (24 min) before mailing: the letter is written from the episode page's description, which says the school was set to open in fall 2025 in Lake Worth.",
      "Confirm the learning center opened: the home page still says it \"will be open\" for 2025-2026, while Enroll Now is enrolling for 2026-2027. If it hasn't opened yet, change the ask to how the plans are going.",
      "The address is the learning center's published suite address from the Contact page.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about how families get from the interest form to paying the fees, then who's asking and one proof number",
      subject: "Beacon of Hope's interest form",
      body: `Hi Cassandra,

I mailed you a handwritten note last week with a card for Beacon of Hope.

I was reading your Enroll Now page. Apply Now opens the interest form, which asks about a child's diagnosis, IEP and therapies, and the page lists the $200 application fee and $300 curriculum fee.

How does a family get from that form to paying the fees?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the enrollment and tuition system I built for it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so Cassandra can see it without clicking around",
      body: `Hi Cassandra,

In case it's easier to see than describe, I set up a version of MudKitchen for Beacon of Hope and recorded a 60-second walkthrough: an interest form landing in your admin inbox, the enrollment agreement and fees in one checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Beacon of Hope is, with no pitch",
      where: "Instagram (@beaconhopeacademy, linked from the site) or Facebook",
      body: "Hi Cassandra, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. I like that each day at Beacon of Hope starts with a morning gathering.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Cassandra,

I also put together a one-page snapshot of what a family sees on your site today, from the interest form to paying tuition. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Cassandra,

I'll leave it here so I'm not cluttering your inbox. The Beacon of Hope version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Have a good Christmas break.

Julius`,
    },
  ],
};
