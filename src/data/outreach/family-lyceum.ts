import type { OutreachPlan } from "./types";

export const familyLyceumOutreach: OutreachPlan = {
  slug: "family-lyceum",
  schoolName: "Family Lyceum",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Renae",
    role: "Founder and director",
    source: "Family Lyceum Family page (Renae Zentz, founder & director) and Contact Us page (Renae Zentz: Founder & Director)",
  },
  angle: "Re-contact with a snapshot: tuition can come from Utah Fits All, Children's First and online-school credits as well as the family",
  priorContact: {
    when: "September",
    what: "A hand-sent first email with a link to the Family Lyceum MudKitchen demo",
  },
  facts: [
    {
      fact: "Hybrid private school in Clearfield, Utah: in-person classes on a Monday/Wednesday/Friday or Tuesday/Thursday/Friday track, live online and self-paced learning on the other days, average class size 15–18",
      source: "Family Lyceum home page",
      url: "https://www.familylyceum.com/",
      readOn: "2026-11-22",
    },
    {
      fact: "Tuition is $3,700 a year part-time (2 days) and $5,200 full-time (3 days), plus a $100 registration fee per student and a $75 family application fee; monthly or quarterly plans are available on request with fees of 3%–10%",
      source: "Family Lyceum Tuition and Fees",
      url: "https://www.familylyceum.com/tuition-and-fees.html",
      readOn: "2026-11-22",
    },
    {
      fact: "Approved vendor for Children's First Education Fund and an approved vendor and private school for the Utah Fits All Scholarship; tuition credits up to $2,225 a year by enrolling with a third-party online school",
      source: "Family Lyceum Tuition and Fees",
      url: "https://www.familylyceum.com/tuition-and-fees.html",
      readOn: "2026-11-22",
    },
    {
      fact: "The Core Class Application is a Jotform; after it is submitted an interview is scheduled and the $75 application fee is required",
      source: "Family Lyceum Core Class Application",
      url: "https://www.familylyceum.com/core-class-application.html",
      readOn: "2026-11-22",
    },
    {
      fact: "FIREFLY Montessori preschool meets Tuesdays and Thursdays 9:00–12:00, $900 a semester, limited to 8 students; its Register Now button opens a Jotform that shows \"This form is currently unavailable\"",
      source: "Family Lyceum FIREFLY (Age 4)",
      url: "https://www.familylyceum.com/firefly-age-4.html",
      readOn: "2026-11-22",
    },
    {
      fact: "Parents contribute at least 20 volunteer hours to the school",
      source: "Family Lyceum Elementary",
      url: "https://www.familylyceum.com/elementary.html",
      readOn: "2026-11-22",
    },
    {
      fact: "The live Google Calendar has the 2026–27 year (school started Aug 24, 2026); the Calendar pdf page still links the 2025–2026 calendar",
      source: "Family Lyceum Calendars, Calendar pdf and Google Calendar pages",
      url: "https://www.familylyceum.com/calendars.html",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in September 2026 (the first email says so).",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "The FIREFLY Register Now form shows \"currently unavailable\". It may be closed on purpose (8 spots); the snapshot card only says what a family sees and doesn't guess why.",
    "The first email says tuition can come from several places; the site doesn't say how they bill today, so don't claim it in a reply.",
    "The demo's FIREFLY card says \"Tue/Thu or Mon/Wed\"; the site says Tuesdays and Thursdays only. Fix the demo before recording the Loom.",
    "Dropped from the tool stack: Venmo (a 2019 class supply fee paid to one teacher) and SignUpGenius (2023 summer camps). Both pages are still live but neither looks current.",
  ],
  snapshot: {
    token: "NmiwmorioL6FvIunq-VHmQ",
    preparedOn: "2026-11-22",
    summary: "We read 59 pages of familylyceum.com on Nov 22, 2026, plus the application and contact forms, the school-year calendar PDF and your live Google Calendar.",
    pageSpeed: { mobileScore: 38, url: "https://www.familylyceum.com/", checkedOn: "2026-11-22" },
    toolStack: [
      { name: "Jotform", usedFor: "Core Class Application, contact form and FIREFLY registration", url: "https://www.familylyceum.com/core-class-application.html" },
      { name: "Google Calendar", usedFor: "Live school calendar", url: "https://www.familylyceum.com/google-calendar.html" },
    ],
    observations: [
      {
        area: "apply",
        gap: "The $75 fee and the interview are arranged after the application",
        saw: "The Core Class Application (a Jotform) says that after it's submitted, an interview will be scheduled and the $75 application fee will be required. The form itself doesn't take the fee or offer interview times.",
        impact: "Each new family means a separate round of messages to set the interview and collect the fee, and the family waits to hear what happens next.",
        source: "Family Lyceum Core Class Application",
        url: "https://www.familylyceum.com/core-class-application.html",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["online-application", "application-fee", "admissions-pipeline"],
          text: "The application lives on your site with saved drafts, takes the $75 fee when it's submitted, and lands in one admin inbox where you move each family to the interview.",
        },
      },
      {
        area: "enroll",
        gap: "FIREFLY's Register Now opens a form that says it's unavailable",
        saw: "The FIREFLY (Age 4) page lists Tuesdays and Thursdays, $900 a semester and 8 spots. Register Now goes to the Registration, Liability & Consent Form, which shows \"This form is currently unavailable\".",
        impact: "A preschool family can't register or tell whether FIREFLY is full, so they have to write in to find out.",
        source: "Family Lyceum FIREFLY (Age 4)",
        url: "https://www.familylyceum.com/firefly-age-4.html",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "forms-documents"],
          text: "FIREFLY shows Open, Waitlist or Full on the site, and the liability and consent form is filled in and signed online once a family has a spot.",
        },
      },
      {
        area: "pay",
        gap: "Three funding routes, and no word on how they meet the bill",
        saw: "The tuition page lists Utah Fits All, Children's First Education Fund and tuition credits of up to $2,225 through a third-party online school, next to $3,700 and $5,200 tuition. It doesn't say how those amounts are applied.",
        impact: "A family using one of these can't see what they still owe, and you match each payment to each family's balance yourself.",
        source: "Family Lyceum Tuition and Fees",
        url: "https://www.familylyceum.com/tuition-and-fees.html",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing so the scholarship or credit portion is recorded against each family, and they see and pay only what's left.",
        },
      },
      {
        area: "pay",
        gap: "Payment plans are by request, and the site doesn't say how families pay",
        saw: "Monthly or quarterly plans are \"available upon request\" with fees of 3%–10% (for example $636 a month for 3 days). The page doesn't say how a family pays or sets up a plan.",
        impact: "Every family who wants a plan has to ask, and you set up and follow each schedule by hand.",
        source: "Family Lyceum Tuition and Fees",
        url: "https://www.familylyceum.com/tuition-and-fees.html",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families pick annual, quarterly or monthly in their own billing page and pay by card or bank, with autopay if they want it.",
        },
      },
      {
        area: "updates",
        gap: "The printable calendar is still 2025–2026",
        saw: "Calendars links to a live Google Calendar, which has this year (school started Aug 24). The Calendar pdf page, the one to download and print, still shows the 2025–2026 calendar.",
        impact: "A family who prints the calendar plans around last year's breaks and field trips.",
        source: "Family Lyceum Calendar pdf",
        url: "https://www.familylyceum.com/calendar-pdf.html",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal"],
          text: "One school calendar in each family's login, so there's no separate PDF to keep in step with it.",
        },
      },
      {
        area: "updates",
        gap: "20 volunteer hours, with no place to see the options",
        saw: "Parents contribute at least 20 hours to the school, and the application says many volunteer options are available through the year. The site doesn't show where families see them or sign up.",
        impact: "Families can't pick up hours when they have time, and you track who has given how many.",
        source: "Family Lyceum Elementary",
        url: "https://www.familylyceum.com/elementary.html",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["committees", "parent-portal"],
          text: "Families see the open committees and roles and ask to join from their own login, and you see who's on each one and which tasks are done.",
        },
      },
      {
        area: "website",
        gap: "The Jr. High Apply Now button doesn't open anything",
        saw: "The Jr. High page for FLARE and TORCH ends with an Apply Now! button that isn't linked to a page, so nothing happens when a family taps it.",
        impact: "A junior high family ready to apply stops on that page unless they find the application in the menu.",
        source: "Family Lyceum Jr. High",
        url: "https://www.familylyceum.com/jr-high.html",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service", "online-application"],
          text: "The site we build for you sends every Apply button to the online application, and we check it for dead links.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone, and past-year forms are still live",
        saw: "The home page scores 38 out of 100 for speed on a phone and weighs about 8 MB. Pages like the 2018-19 Intent to Re-Enroll form, 2022-23 FIREFLY Registration and 2023 Summer Camps are still up.",
        impact: "A parent on a phone waits for the first page, and one who lands on an old form from a search can't tell which sign-up is current.",
        source: "Family Lyceum Intent to Re-enroll/ Priority Registration",
        url: "https://www.familylyceum.com/intent-to-re-enroll-priority-registration.html",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you is kept fast on a phone, and past-year pages come down when the year turns over.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Family Lyceum",
    founder: {
      fullName: "Renae Zentz",
      firstName: "Renae",
      role: "Founder and Director",
      source: "Family Lyceum Contact Us page (\"Renae Zentz: Founder & Director\") and Faculty & Staff page",
      url: "https://www.familylyceum.com/contact-us.html",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "On the Dimond Education Podcast (episode 22, \"Family Centered Education\", February 14, 2023), Renae Zentz talked about Family Lyceum, the part-time private school she founded and directs, and its mission to ignite the FIRE (Freedom, Individuals, Respect, Excellence) in each student while respecting the family's role in a child's education.",
        source: "Dimond Education Podcast, Family Centered Education - Renae Zentz - Episode 22 (Apple Podcasts)",
        url: "https://podcasts.apple.com/us/podcast/family-centered-education-renae-zentz-episode-22/id1643610685?i=1000599546742",
        readOn: "2026-11-22",
      },
      {
        fact: "Family Lyceum is a hybrid private school in Clearfield, Utah, with an elementary building for K–5 and a junior high building for grades 6–9 next to each other.",
        source: "Family Lyceum homepage",
        url: "https://www.familylyceum.com/",
        readOn: "2026-11-22",
      },
      {
        fact: "Family Lyceum's Our Name page says the school supports parents as the primary mentors in their families, and that families learn together because every class follows Leadership Education and a parallel study of chronological history.",
        source: "Family Lyceum, Our Name",
        url: "https://www.familylyceum.com/our-name.html",
        readOn: "2026-11-22",
      },
    ],
    hook: "On the Dimond Education Podcast (episode 22, \"Family Centered Education\", February 14, 2023), Renae Zentz talked about Family Lyceum, the part-time private school she founded and directs, and its mission to ignite the FIRE (Freedom, Individuals, Respect, Excellence) in each student while respecting the family's role in a child's education.",
    body: `Hi Renae,

I listened to your Dimond Education Podcast episode and loved how you set Family Lyceum's goal, to ignite the FIRE in each student, right next to respect for the family's role in a child's education.

Hearing from founders like you is my favorite part of this work. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Family Lyceum.

I'd love to hear how families take to the campus days and the home days.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Renae, a note from a microschool in Round Rock, Texas. J",
    shortCode: "lyceum-gmtj",
    checkBeforeMailing: [
      "Find a mailing address: familylyceum.com publishes none (homepage, Contact Us and Our Name pages and the footer give only Clearfield, Utah and two neighboring buildings with I-15 access). Lead: 295 E 200 S, Clearfield, UT is in the CRM and shows in third-party records as a commercial private-school parcel; confirm it's the school's building (not a home) before using it, and address it to Renae Zentz, Family Lyceum.",
      "Listen to the Dimond Education episode (Feb 14, 2023, about 29 minutes) before mailing: the hook is from the episode description, so make sure it matches what she says.",
      "Possible second source: an Epoch Times piece on Family Lyceum's founding (\"A Hybrid Homeschool That Gives Control to Parents…\", April 2024). Not read (likely paywalled), so not used.",
      "The Faculty & Staff bio includes family details; none of it is used. Keep it that way.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro: acknowledge the September email, give a new reason (the snapshot), one proof number",
      subject: "Utah Fits All at Family Lyceum",
      body: `Hi Renae,

I mailed you a handwritten note last week with a card for Family Lyceum. I first wrote in September about a version of MudKitchen I set up for you. Since then I put together a one-page snapshot of what a family sees on your site today, from applying to paying tuition.

One thing stood out: your tuition page lists Utah Fits All, Children's First and up to $2,225 in online-school credits, so one family's $5,200 can come from several places.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to email the snapshot too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Renae,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Family Lyceum version: the homepage, the enrollment checklist and tuition page a parent sees, and your admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school is, with no pitch",
      where: "Facebook (familylyceum)",
      body: "Hi Renae, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Teaching history in order, Ancients to Modern, with a book of the month at home sounds wonderful.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Renae,

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
      body: `Hi Renae,

I'll leave it here so I'm not cluttering your inbox. The Family Lyceum version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the school year.

Julius`,
    },
  ],
};
