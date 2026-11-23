import type { OutreachPlan } from "./types";

export const freedomPrepAcademyOutreach: OutreachPlan = {
  slug: "freedom-prep-academy",
  schoolName: "Freedom Prep Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Sterling",
    role: "Founder and Principal",
    source:
      "Sterling Kellis signs the 2025–26 Student Handbook as Principal, the About page quotes him as Founder, and the Board page lists him as Chairman of both governing boards; no other director is named on the site",
  },
  angle:
    "Proof + their process: their enrollment Typeform describes a two-step process (the form, then registration documents by emailed instructions), across 29 microschools and two learning centers",
  facts: [
    {
      fact: "The Enroll Now Typeform (\"Freedom Prep New Student Enrollment Form\") says enrollment and registration is a 2-step process: Step 1 Enroll (10 mins), this form with a required residency upload; Step 2 Register (15 mins), submit registration documents. Its thank-you screen says to check your email for instructions on how to complete registration",
      source: "Freedom Prep New Student Enrollment Form (Typeform)",
      url: "https://freedomk12.typeform.com/Enroll-Now",
      readOn: "2026-11-22",
    },
    {
      fact: "The Find A Microschool map lists 29 microschools and learning centers across Arizona; 10 listings show 09:30 AM–06:30 PM, Mon through Sun, and the rest show no hours",
      source: "Freedom Prep Microschools (rendered in a browser)",
      url: "https://freedomk12.org/microschools/",
      readOn: "2026-11-22",
    },
    {
      fact: "The Mesa Learning Center's Enroll Now button opens \"Freedom Prep Enrollment Form 23/24\", which asks for the student's grade for the 23/24 school year and offers start dates from Summer School (June/July 2023) to Second Semester (January–May 2024)",
      source: "Freedom Prep Learning Center page and Enrollment Form 23/24 (Typeform)",
      url: "https://freedomk12.org/learning-center",
      readOn: "2026-11-22",
    },
    {
      fact: "The Gilbert Learning Center has a Schedule a Tour link to a Google Calendar appointment page; the Mesa Learning Center and the microschools have no booking link",
      source: "Freedom Prep Learning Center",
      url: "https://freedomk12.org/learning-center",
      readOn: "2026-11-22",
    },
    {
      fact: "Freedom Prep is a public Arizona charter (Arizona Online Instruction); in-person microschools, learning centers and Student Support Guides are provided by independent third parties, and the Microschools page names Liberty as the microschool partner",
      source: "Freedom Prep Microschools",
      url: "https://freedomk12.org/microschools/",
      readOn: "2026-11-22",
    },
    {
      fact: "The 2026–27 calendar is a one-page PDF download; Monday Quick Connects are joined online via Google Calendar, and the Returning Student confirmation page links the 2025–26 calendar",
      source: "Freedom Prep Calendar",
      url: "https://freedomk12.org/calendar",
      readOn: "2026-11-22",
    },
    {
      fact: "Activities & Events still lists the 2024 Back-To-School events (Guide Expo July 24, ESA Day July 25, Open House July 24, 25 and 29, Summer Camp July 30–Aug 1)",
      source: "Freedom Prep Activities & Events",
      url: "https://freedomk12.org/events",
      readOn: "2026-11-22",
    },
    {
      fact: "Google PageSpeed scores the home page 56/100 on mobile, with the largest element taking about 16.5 seconds and the page weighing about 4.2 MB",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://pagespeed.web.dev/analysis?url=https://freedomk12.org/",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Sterling Kellis signs the 2025–26 Student Handbook as Principal and chairs both boards; the site names no other director or enrollment lead. Confirm he's the right person to write to.",
    "Freedom Prep is a tuition-free public charter, and its microschools and learning centers are run by independent third parties (Liberty). Confirm an enrollment-first pitch fits a statewide charter, and leave billing out of the Loom.",
    "The demo walkthrough has a \"Families manage tuition\" step and shows two parent testimonials (David R., Jennifer L.) that aren't on their site; only Miriam H.'s quote is theirs. Fix the demo before recording the Loom.",
    "Open the Mesa Learning Center's Enroll Now in a private window and confirm it still opens the 23/24 form (the snapshot quotes it).",
    "The microschool map only loads in a browser: confirm it still shows 29 listings, 10 of them at 9:30–6:30 seven days a week.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Several locations in one account",
    "We'd build: Calendar that syncs to Google or Apple calendars",
  ],
  snapshot: {
    token: "v_xpbhTf2r-6zGoniFXA1w",
    preparedOn: "2026-11-22",
    summary:
      "We read 60 pages of freedomk12.org on Nov 22, 2026, plus the enrollment Typeforms, the 2026–27 calendar, the 2025–26 Student Handbook and the microschool map.",
    pageSpeed: { mobileScore: 56, url: "https://freedomk12.org/", checkedOn: "2026-11-22" },
    toolStack: [
      {
        name: "Typeform",
        usedFor: "Enrollment form, summer camp and event sign-ups",
        url: "https://freedomk12.org/",
      },
      {
        name: "Google Calendar",
        usedFor: "Gilbert Learning Center tour booking",
        url: "https://freedomk12.org/learning-center",
      },
    ],
    observations: [
      {
        area: "find",
        gap: "Ten microschools list 9:30 to 6:30, seven days a week",
        saw: "The Find A Microschool map lists 29 microschools and learning centers. Ten show 09:30 AM–06:30 PM, Mon through Sun; the other nineteen show no days or hours.",
        impact: "A family comparing microschools near them can't tell which days each one meets, so they write in to ask before they can choose.",
        source: "Freedom Prep Microschools",
        url: "https://freedomk12.org/microschools/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity", "multi-location"],
          text: "We'd set up each microschool and learning center as its own location with its real days, grades and whether it has room, marked Open, Waitlist or Full from your admin and shown on the site we build.",
        },
      },
      {
        area: "tour",
        gap: "Only the Gilbert Learning Center has a tour booking link",
        saw: "Gilbert's section has a Schedule a Tour button that opens a Google Calendar appointment page. The Mesa Learning Center has only Enroll Now, and the microschool pages offer a Virtual Tour video and an interest form.",
        impact: "A family near Mesa or a microschool sends a message and waits for a reply before they can see where their child would learn.",
        source: "Freedom Prep Learning Center",
        url: "https://freedomk12.org/learning-center",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a visit time from slots each location opens, and get a reminder before they come.",
        },
      },
      {
        area: "apply",
        gap: "The Mesa Learning Center's Enroll button opens the 2023/24 form",
        saw: "Mesa's Enroll Now opens \"Freedom Prep Enrollment Form 23/24\". It asks for the student's grade for the 23/24 school year and offers start dates from Summer School (June/July 2023) to Second Semester (January–May 2024).",
        impact: "A Mesa family fills in a form with start dates that have passed and can't pick the term they want, so they may not be sure it reached anyone.",
        source: "Freedom Prep Enrollment Form 23/24 (Typeform)",
        url: "https://freedomk12.typeform.com/enroll23-24",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "One enrollment form on your site, kept to the current year, and every family lands in one admin inbox whichever page they started from.",
        },
      },
      {
        area: "apply",
        gap: "Families can start in three different forms",
        saw: "The site has a Contact an Enrollment Specialist pop-up (name, email, phone, zip, age, format), an \"Interested in a Microschool?\" form on the microschool pages, and the Enroll Now Typeform, each asking for the family's details again.",
        impact: "A family who asks a question in one form types the same details into the next, and their answers arrive in separate places.",
        source: "Freedom Prep Microschools",
        url: "https://freedomk12.org/microschools/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["admissions-pipeline", "online-application"],
          text: "Questions, microschool interest and applications all land in one admin inbox, and the family's details carry from their first message into their application.",
        },
      },
      {
        area: "enroll",
        gap: "Registration is a second step that starts from an email",
        saw: "The enrollment Typeform calls joining a 2-step process: Step 1 is the form with a residency upload, Step 2 is registration documents such as a birth certificate and immunization records. The thank-you screen says to check your email for how to complete registration.",
        impact: "Families wait for an email to learn what to gather next, and someone has to track which families have finished Step 2.",
        source: "Freedom Prep New Student Enrollment Form (Typeform)",
        url: "https://freedomk12.typeform.com/Enroll-Now",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["enrollment-checklist", "forms-documents"],
          text: "Step 2 becomes a checklist in the family's login: each registration document uploaded or signed online, with reminders until it's done and a view of who's finished.",
        },
      },
      {
        area: "updates",
        gap: "The school calendar is a PDF download",
        saw: "The Calendar page links a one-page 2026–27 PDF and says microschools may follow modified schedules, so check with your Guide. The Returning Student confirmation page still links the 2025–26 calendar.",
        impact: "Families can't add benchmark weeks or breaks to their own calendar, and a returning family who confirms gets last year's dates.",
        source: "Freedom Prep Calendar",
        url: "https://freedomk12.org/calendar",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "calendar-sync"],
          text: "We'd set up a school calendar families see in their login, with each microschool's own dates, and connect it to Google or Apple calendars so dates land on their phones.",
        },
      },
      {
        area: "website",
        gap: "The events page still shows the 2024 back-to-school week",
        saw: "Activities & Events lists the July 2024 Guide Expo, ESA Day, Open House and Summer Camp under \"2024 Back-To-School Events\". The Day in the Life page, linked from the home page, shows three videos marked Coming Soon.",
        impact: "A family checking what's coming up sees dates from two years ago and may not know whether events are still running.",
        source: "Freedom Prep Activities & Events",
        url: "https://freedomk12.org/events",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you stays current: we update events and pages for you, so nothing on it is from an earlier year.",
        },
      },
      {
        area: "website",
        gap: "The home page takes about 16 seconds to fill in on a phone",
        saw: "Google PageSpeed scores the home page 56 out of 100 on mobile. The largest part of the page takes about 16.5 seconds to appear, and the page weighs about 4.2 MB.",
        impact: "Parents tapping through from a Facebook ad on a phone may leave before the page loads.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https://freedomk12.org/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you is made to load fast on a phone, and we keep it current.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Freedom Prep",
    founder: {
      fullName: "Sterling Kellis",
      firstName: "Sterling",
      role: "Founder, Principal and board chairman",
      source: "Freedom Prep About page (quote signed \"Sterling Kellis, Founder\"); the Board of Directors page lists him as Chairman of both governing boards, and he signs the 2025–26 Student Handbook as Principal",
      url: "https://freedomk12.org/about",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Freedom Prep's About page quotes its founder, Sterling Kellis: \"Students need more freedom in their learning, more spark to pursue their passion, and more guidance and encouragement along the way.\"",
        source: "Freedom Prep Academy, About",
        url: "https://freedomk12.org/about",
        readOn: "2026-11-22",
      },
      {
        fact: "Freedom Prep's Find A Microschool map lists 29 microschools and learning centers across Arizona; the in-person microschools are run by independent partners such as Liberty.",
        source: "Freedom Prep Academy, Microschools",
        url: "https://freedomk12.org/microschools/",
        readOn: "2026-11-22",
      },
    ],
    hook: "Freedom Prep's About page quotes its founder, Sterling Kellis: \"Students need more freedom in their learning, more spark to pursue their passion, and more guidance and encouragement along the way.\"",
    body: `Hi Sterling,

I read your line on Freedom Prep's About page, that students need more freedom in their learning, more spark to pursue their passion, and more guidance and encouragement along the way.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our enrollment and tuition, and it's a big part of how we grew. Now we offer it to other microschools too.

I'd like to hear how you keep that guidance going across so many microschools. A text is plenty.

Julius`,
    postscript: "The card inside has a version of Freedom Prep I set up, plus a parent's-eye look at your enrollment.",
    stickyNote: "Sterling, a note from a microschool in Round Rock, Texas. J",
    shortCode: "freedomprep-gzdk",
    checkBeforeMailing: [
      "Find a mailing address: freedomk12.org publishes no office or mailing address (About, Microschools and Learning Center pages and the footer list only phone, fax and a records email; /contact is a 404). Non-home leads: the Gilbert Learning Center (Power & Elliot) and Mesa Learning Center (Ellsworth & Pecos), given as cross streets only; the charter's address of record in the Arizona Department of Education or State Board for Charter Schools directory. The microschool partner sites (e.g. Mission Community Church, Gilbert) are \"not owned or operated by Freedom Prep Academy\", so don't mail there. A guide's Payson microschool page carries an address in its page data; it's a guide's site and may be a home, so it isn't used.",
      "The hook is a quote on the About page, not an interview; no podcast or press piece turned up for him.",
      "Freedom Prep is a tuition-free public charter with partner-run microschools, so \"enrollment and tuition\" in the us line is our story, not a claim about them. Fine as is, but confirm the card's snapshot fits a charter before mailing.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "First contact: their own two-step enrollment process, one proof number, offer the snapshot",
      subject: "Freedom Prep's two-step enrollment",
      body: `Hi Sterling,

I mailed you a handwritten note last week with a card for Freedom Prep.

Your Enroll Now Typeform describes joining Freedom Prep as two steps: the form with the residency upload, then registration documents, with instructions sent by email afterwards.

I run Sage Field, a microschool in Round Rock, TX, and built MudKitchen to keep steps like that in one place for each family. We went from 0 to 35 students in under 3 months on it.

I put together a one-page snapshot of what a family sees on your site today, from the microschool map to the Mesa Learning Center's enroll button; the card opens it. Want me to email it too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Sterling,

I also set up a version of MudKitchen for Freedom Prep, with your online, learning center and microschool options in it. Here's a 60-second walkthrough: an enrollment inquiry landing in your admin, then the checklist a family gets next.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school is, with no pitch",
      where: "Facebook (freedomprepacademy.az)",
      body: "Hi Sterling, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Enjoyed reading the I Can FOCUS values on the Freedom Prep site.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Sterling,

Here's the snapshot, no reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Sterling,

I'll leave it here so I'm not cluttering your inbox. The Freedom Prep version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the year.

Julius`,
    },
  ],
};
