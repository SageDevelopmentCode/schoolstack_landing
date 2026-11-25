import type { OutreachPlan } from "./types";

export const riverOakAcademyOutreach: OutreachPlan = {
  slug: "river-oak-academy",
  schoolName: "River Oak Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Vince",
    role: "Administrator",
    source: "River Oak home page, Our Team (Vincent Wesson, Admin: \"an Administrator who supports Guides, learners, and daily school operations\"); no founder or head of school is named on the site",
  },
  angle: "Proof + their process: the home page's four apply steps, where the intro call has no open times and the tour and application buttons don't open anything",
  facts: [
    {
      fact: "The home page section \"Are you Ready to Apply?\" asks families to click four buttons in order: Schedule a Phone Call, Schedule a Tour, Online Application, Learner for a Week",
      source: "River Oak Academy home page",
      url: "https://www.riveroakacademy.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "Schedule a Phone Call opens an Appointlet page (River Oak Academy's Meetings) that says \"All available times are taken\"; the Schedule a Tour and Online Application buttons have no link and don't open anything; Learner for a Week opens an email",
      source: "River Oak Academy home page and Appointlet scheduler",
      url: "https://appt.link/river-oak-academys-meetings-upmjlvqo/inquiry",
      readOn: "2026-11-22",
    },
    {
      fact: "The Initial Tour booking page (45 min) says the service has no availability in the next 6 months",
      source: "Initial Tour - ROA (booking calendar)",
      url: "https://www.riveroakacademy.org/booking-calendar/initial-tour",
      readOn: "2026-11-22",
    },
    {
      fact: "The Admissions page says tours are arranged by email after the phone call, the application password is sent by email, a 1–2 week (up to a full session) trial follows, and \"Our enrollment for the 2022-2023 school year is now closed.\"",
      source: "Admissions | River Oak Academy",
      url: "https://www.riveroakacademy.org/copy-of-our-difference",
      readOn: "2026-11-22",
    },
    {
      fact: "The Tuition page lists Spark half day $700 and full day $1,400, Explorer Studio $1,400/month, Middle School Studio $1,400/month, Future Launch Pad $1,300; a $200 application fee, $400 annual registration, $400 trial week and a $700 tuition deposit; 10% sibling discount for the 2nd child; and says the school is now accepting Florida Tax Credit, Family Empowerment and Hope scholarships",
      source: "Tuition | ROA",
      url: "https://www.riveroakacademy.org/tuition",
      readOn: "2026-11-22",
    },
    {
      fact: "The FAQ says tuition is $1,300 per month over an eleven-month year (September–July), that the school is \"in the process of applying for certification to accept scholarships\", links \"our current school calendar\" to a 2022–2023 calendar PDF, and says progress is shared with families through Journey Tracker",
      source: "River Oak Academy FAQ",
      url: "https://www.riveroakacademy.org/copy-of-more",
      readOn: "2026-11-22",
    },
    {
      fact: "The Parents page in the menu is a Wix \"Guest Area\" that asks for a password",
      source: "River Oak Academy Parents page",
      url: "https://www.riveroakacademy.org/copy-of-enroll",
      readOn: "2026-11-22",
    },
    {
      fact: "The school's Instagram posted on Nov 2, 2026 (active, not paused)",
      source: "River Oak Academy Instagram",
      url: "https://www.instagram.com/riveroakacademy/",
      readOn: "2026-11-22",
    },
    {
      fact: "Google PageSpeed scores the home page 39/100 on mobile, with the largest element taking about 6 seconds to appear and the page weighing about 9 MB",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://pagespeed.web.dev/analysis?url=https://www.riveroakacademy.org/",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Open the home page's Apply steps in a private window: confirm Schedule a Phone Call still shows Appointlet's \"All available times are taken\" and that Schedule a Tour and Online Application still don't open anything (the first email says so).",
    "Vince Wesson is listed as Admin on the Our Team section; the site names no founder or head of school. The misconduct-reporting PDF linked from the FAQ names Mary Shaeffer as the person to report to, so she may lead the school. Confirm who to write to.",
    "The demo calls the 7–11 studio \"Elementary Studio\" and Spark ages 4–6; the Tuition page says Explorer Studio (7–11), Spark (5–7) and Middle School (11–14). Update the demo before recording the Loom.",
    "Families see progress in Journey Tracker, the Acton network's portfolio tool. We don't pitch replacing it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
  ],
  snapshot: {
    token: "yEVB9BcVkNk6_fRJzEECGQ",
    preparedOn: "2026-11-22",
    summary: "We read 60 pages of riveroakacademy.org on Nov 22, 2026, including every admissions, tuition and studio page, plus the linked calendar PDF and both booking pages.",
    pageSpeed: { mobileScore: 39, url: "https://www.riveroakacademy.org/", checkedOn: "2026-11-22" },
    toolStack: [
      { name: "Appointlet", usedFor: "Introductory phone call booking", url: "https://www.riveroakacademy.org/" },
      { name: "Wix Bookings", usedFor: "Initial tour booking", url: "https://www.riveroakacademy.org/service-page/initial-tour" },
    ],
    observations: [
      {
        area: "find",
        gap: "The Admissions page still says 2022–2023 enrollment is closed",
        saw: "Below the six admissions steps, the Admissions page reads \"Our enrollment for the 2022-2023 school year is now closed. Check back if we have opened enrollment.\"",
        impact: "A family reading it today can't tell whether River Oak is enrolling for 2026–27, and some will stop there rather than ask.",
        source: "Admissions | River Oak Academy",
        url: "https://www.riveroakacademy.org/copy-of-our-difference",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "The site we build shows each studio as Open, Waitlist or Full, set from your admin, so the status is always this year's.",
        },
      },
      {
        area: "find",
        gap: "Two pages give different monthly tuition",
        saw: "The FAQ says tuition is $1,300 per month over the eleven-month year. The Tuition page lists $1,400 a month for Explorer and Middle School Studio and $1,300 for Future Launch Pad.",
        impact: "Families budgeting from the FAQ are $100 a month short, about $1,100 over the year, and the office explains the difference one family at a time.",
        source: "River Oak Academy FAQ",
        url: "https://www.riveroakacademy.org/copy-of-more",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "tuition-rate-plans", "discounts"],
          text: "Tuition and the sibling discount show on the site from the same plans families are billed on, so every page gives the same number.",
        },
      },
      {
        area: "tour",
        gap: "Neither booking page has an open time",
        saw: "Step 1, Schedule a Phone Call, opens an Appointlet page that says \"All available times are taken.\" The Initial Tour booking page says it has no availability in the next 6 months, and the home page's Schedule a Tour button doesn't open anything. The Admissions page asks families to email for a tour instead, and the address as typed there has a typo.",
        impact: "A family ready to take the first step can't book one online, and has to email and wait before they can even talk to you.",
        source: "Appointlet scheduler (River Oak Academy's Meetings)",
        url: "https://appt.link/river-oak-academys-meetings-upmjlvqo/inquiry",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick an intro call or tour from slots you open on your own site, get a reminder, and land in one admissions inbox with their notes.",
        },
      },
      {
        area: "apply",
        gap: "The application is behind a password sent by email",
        saw: "The home page's Online Application button doesn't open anything. The Admissions page says to email admissions to be sent a password for the online application page.",
        impact: "Every applicant waits on a reply before they can start, and the office sends passwords by hand.",
        source: "Admissions | River Oak Academy",
        url: "https://www.riveroakacademy.org/copy-of-our-difference",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "The inquiry and application live on your site, open to any family, and each one lands in a single admin inbox you can move from call to trial to decision.",
        },
      },
      {
        area: "enroll",
        gap: "Four fees come before the first month, with no stated way to pay",
        saw: "The Tuition page lists a $200 application fee, $400 annual registration, a $400 trial week and a $700 tuition deposit. The site doesn't say how or when each is paid.",
        impact: "Each new family asks how to pay four separate amounts, and the office tracks who has paid what before the trial week starts.",
        source: "Tuition | ROA",
        url: "https://www.riveroakacademy.org/tuition",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-fees", "enrollment-agreements"],
          text: "Accepted families get one checklist: the enrollment agreement signed online and the registration and deposit paid in the same place, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "The site gives two answers on scholarships",
        saw: "The Tuition page says River Oak is now accepting Florida Tax Credit, Family Empowerment and Hope scholarships. The FAQ says the school is still applying for certification to accept scholarships and asks families to call.",
        impact: "Scholarship families can't tell whether they can use their funds here, and the ones who enroll need someone to track what the scholarship covers and what they still owe.",
        source: "Tuition | ROA",
        url: "https://www.riveroakacademy.org/tuition",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing that records the scholarship's share and bills the family only the rest, with each family's balance on their billing page.",
        },
      },
      {
        area: "updates",
        gap: "The \"current school calendar\" is the 2022–2023 PDF",
        saw: "The FAQ's link to \"our current school calendar\" opens a PDF titled 2022-2023 River Oak Academy Calendar. The Parents page in the menu is a Guest Area that asks for a password.",
        impact: "Families can't check this year's session breaks online, and a shared password has to be handed out and changed when families leave.",
        source: "River Oak Academy FAQ",
        url: "https://www.riveroakacademy.org/copy-of-more",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal"],
          text: "Each family gets their own login with the school calendar in it, so session breaks and the July summer session are always current.",
        },
      },
      {
        area: "website",
        gap: "The home page takes about 6 seconds to fill in on a phone",
        saw: "Google PageSpeed scores the home page 39 out of 100 on mobile. The largest part of the page takes about 6 seconds to appear, and the page weighs about 9 MB with its two videos.",
        impact: "Parents tapping through from Instagram or Facebook on a phone may leave before the page loads.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https://www.riveroakacademy.org/",
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
    shortSchoolName: "River Oak",
    founder: {
      fullName: "Vincent Wesson",
      firstName: "Vince",
      role: "Administrator",
      source: "River Oak Academy home page, Our Team (Vincent Wesson, Admin: \"an Administrator who supports Guides, learners, and daily school operations\")",
      url: "https://www.riveroakacademy.org/",
    },
    mailTo: {
      lines: ["Vincent Wesson", "River Oak Academy", "3355 State Road 13", "St Johns, FL 32259"],
      source: "River Oak Academy site footer (home, FAQ and Admissions pages)",
      url: "https://www.riveroakacademy.org/",
    },
    founderFacts: [
      {
        fact: "River Oak's Our Team section says Vince's role has grown into serving as an Administrator who supports Guides, learners and daily school operations, and that one of his greatest joys at ROA is sharing woodworking and hands-on creation, giving learners real tools to make something themselves.",
        source: "River Oak Academy home page, Our Team",
        url: "https://www.riveroakacademy.org/",
        readOn: "2026-11-22",
      },
      {
        fact: "River Oak runs 11 months a year in 5- to 6-week sessions with a week off between, and Fun Fridays bring each session's project into music, art or field trips.",
        source: "River Oak Academy FAQ",
        url: "https://www.riveroakacademy.org/copy-of-admissions-1",
        readOn: "2026-11-22",
      },
      {
        fact: "River Oak is an Acton Academy affiliate, accredited by the International Association of Learner Driven Schools, and its learners earn badges and present work at public exhibitions instead of taking tests.",
        source: "River Oak Academy FAQ",
        url: "https://www.riveroakacademy.org/copy-of-admissions-1",
        readOn: "2026-11-22",
      },
      {
        fact: "Vincent Shaeffer, River Oak's MS/LP Guide, was one of the school's founding learners.",
        source: "River Oak Academy home page, Our Team",
        url: "https://www.riveroakacademy.org/",
        readOn: "2026-11-22",
      },
    ],
    hook: "River Oak's Our Team section says Vince's role has grown into serving as an Administrator who supports Guides, learners and daily school operations, and that one of his greatest joys at ROA is sharing woodworking and hands-on creation, giving learners real tools to make something themselves.",
    body: `Hi Vince,

I was reading the River Oak team page and loved that your role there includes woodworking with the learners, and that they get to use real tools and make things themselves.

That's the kind of school we love hearing about. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for River Oak.

I'd love to hear what the learners have built this year.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Vince, a note from a microschool in Round Rock, Texas. J",
    shortCode: "riveroak-06lg",
    checkBeforeMailing: [
      "Vince Wesson is not a confirmed founder: the site names no founder or head of school, and Our Team lists him as Admin (\"an Administrator who supports Guides, learners, and daily school operations\"), so the letter goes to him. His bio also has family and career details; none of it is used.",
      "Not used: a Ponte Vedra Recorder article (about Acton Academy Ponte Vedra, a different school) and an unconfirmed founder lead from a search result.",
      "3355 State Road 13 is in the footer of every page and on directory listings for the school; some real-estate indexes list the parcel as 3355 State Road 13 N. It's the school's published address, but that stretch of SR 13 also has homes: glance at Street View to confirm it's the campus before mailing.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then their own four apply steps, one proof number, offer the snapshot link",
      subject: "River Oak's four apply steps",
      body: `Hi Vince,

I mailed you a handwritten note last week with a card for River Oak.

The River Oak home page asks families to click four steps in order. Today the phone call link opens an Appointlet page saying all available times are taken, and the tour and application buttons don't open anything, so email is the only way in.

I run Sage Field, a microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

The card has a one-page snapshot of what a family sees on your site today, from the studios to the $700 deposit. Want me to send the link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Vince,

I also set up a version of MudKitchen for River Oak, with your Spark, elementary, middle school and Future Launch Pad studios in it. Here's a 60-second walkthrough: an inquiry landing in your admin, the enrollment checklist a family gets, and their billing page.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school is, with no pitch",
      where: "Instagram (riveroakacademy) or Facebook (riveroakacademy)",
      body: "Hi Vince, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Loved reading about the Children's Business Fair and the woodworking at ROA.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Vince,

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
      body: `Hi Vince,

I'll leave it here so I'm not cluttering your inbox. The River Oak version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the session.

Julius`,
    },
  ],
};
