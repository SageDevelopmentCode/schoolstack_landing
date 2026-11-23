import type { OutreachPlan } from "./types";

export const madronaSchoolOutreach: OutreachPlan = {
  slug: "madrona-school",
  schoolName: "Madrona School",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Toni",
    role: "Head of School (Toni Loiacano)",
    source: "Madrona School Connect page and Faculty & Staff list (\"Toni Loiacano, Head of School\")",
  },
  angle:
    "One real question: the tuition page says the enrollment fee goes in with a signed tuition contract returned to the office, while tuition runs monthly through Blackbaud Tuition Management with its own $56 yearly fee. Are contracts still signed and returned on paper?",
  facts: [
    {
      fact: "The enrollment fee \"must be paid in full and submitted with a signed tuition contract to ensure a student's space\"; tuition assistance families must return signed contracts \"to the office with applicable enrollment fees no later than two weeks after receipt\"",
      source: "Madrona School Tuition and Fees, 2026 - 2027 and Tuition Assistance pages",
      url: "https://www.madronaschool.org/tuition-and-fees",
      readOn: "2026-11-22",
    },
    {
      fact: "Tuition is paid monthly through Blackbaud Tuition Management on a 12-month basis from July 1, by auto withdrawal, card, cash or check; Blackbaud charges each family a $56 administration fee at the start of each school year",
      source: "Madrona School Tuition and Fees, 2026 - 2027",
      url: "https://www.madronaschool.org/tuition-and-fees",
      readOn: "2026-11-22",
    },
    {
      fact: "2026–2027 tuition runs from $375 per 8-week Parent-Child session to $18,500 a year for grades 1–6 (plus a $675 enrollment fee and a $325 activities fee); 2% off for paying in full by June 30 and 50% off for a third child",
      source: "Madrona School Tuition and Fees, 2026 - 2027",
      url: "https://www.madronaschool.org/tuition-and-fees",
      readOn: "2026-11-22",
    },
    {
      fact: "The application process is an inquiry form, then a tour, then an emailed link to the online application with a $75 fee; grades applicants forward a Transcript Release Form and Teacher Questionnaire (PDFs) to their current school, then have a family interview and one to three visiting days",
      source: "Madrona School Application Process",
      url: "https://www.madronaschool.org/application-process",
      readOn: "2026-11-22",
    },
    {
      fact: "Founded in 1999 by a group of committed parents and teachers, Madrona serves 72 children in Parent-Child, Preschool, Kindergarten and grades 1–6, and is the only school offering Waldorf education on Bainbridge Island and to the greater Kitsap community",
      source: "Madrona School About Us",
      url: "https://www.madronaschool.org/about-us",
      readOn: "2026-11-22",
    },
    {
      fact: "The Parent Guide says the calendar is \"available as a downloadable PDF (click on the calendar image below)\"; the image links to 2026-2027-Calendar.pdf, which returns 404, while a separate \"School Calendar 2026-2027\" link opens 2026-2027-Calendar-Updated-083126.pdf",
      source: "Madrona School Parent Guide",
      url: "https://www.madronaschool.org/parent-guide",
      readOn: "2026-11-22",
    },
    {
      fact: "Google PageSpeed gave the home page a mobile score of 58; the page loads about 4 MB",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.madronaschool.org%2F",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Madrona already runs Blackbaud (myschoolapp) for its inquiry form, online application, parent portal and Tuition Management. It's a 27-year-old Waldorf school, larger than our usual microschool; pitch it as fewer tools for families, not as a first system.",
    "Blackbaud also runs their tuition assistance assessment (Blackbaud Financial Aid Management). MudKitchen doesn't assess financial need, so don't pitch replacing that part.",
    "Don't promise families they'd avoid a processing fee: card payments through Stripe carry fees too, depending on how the school sets it up.",
    "Writing to Toni Loiacano, Head of School. Meredith Cartwright is listed as Administrative Assistant & Enrollment Coordinator; switch to her if admissions is hers.",
    "Instagram (@madronaschool) is linked from the home page but wasn't opened; check it's active before the social step.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "9tDZ5RkdWyIKLVq6hmpi4w",
    preparedOn: "2026-11-22",
    summary:
      "We read 60 pages of madronaschool.org on Nov 22, 2026, plus the 2026–27 calendar and family handbook PDFs and the tour booking page.",
    pageSpeed: { mobileScore: 58, url: "https://www.madronaschool.org/", checkedOn: "2026-11-22" },
    toolStack: [
      {
        name: "Google Calendar booking",
        usedFor: "Booking a school tour",
        url: "https://www.madronaschool.org/",
      },
      {
        name: "Blackbaud",
        usedFor: "Inquiry form, online application and parent portal",
        url: "https://www.madronaschool.org/inquiries",
      },
      {
        name: "Blackbaud Tuition Management",
        usedFor: "Monthly tuition payments ($56 yearly fee per family)",
        url: "https://www.madronaschool.org/tuition-and-fees",
      },
      {
        name: "PDF forms",
        usedFor: "Transcript release and teacher questionnaire",
        url: "https://www.madronaschool.org/application-process",
      },
      {
        name: "Mailchimp",
        usedFor: "Tuesday Newsday weekly newsletter",
        url: "https://www.madronaschool.org/parent-guide",
      },
      {
        name: "PDF calendar",
        usedFor: "2026–2027 school calendar",
        url: "https://www.madronaschool.org/parent-guide",
      },
    ],
    observations: [
      {
        area: "tour",
        gap: "There are three different ways to arrange a tour",
        saw: "The home page has a \"Book a Tour\" button that opens a Google Calendar booking page. The Admissions page says to fill out the inquiry form first, and \"we will contact you to schedule a tour\". The Connect page says to contact the office to arrange a tour.",
        impact: "Some families book a time without sending an inquiry and others wait for a call, so the office has to match tour bookings to inquiries by hand.",
        source: "Madrona School home page and Application Process",
        url: "https://www.madronaschool.org/application-process",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick a tour time from your open slots right after their inquiry, so every tour arrives attached to that family's inquiry in one admin inbox.",
        },
      },
      {
        area: "apply",
        gap: "The application link comes by email after the tour",
        saw: "Families fill out the inquiry form, wait to be contacted for a tour, and then \"When you are ready to apply we will send you a link to access our online application.\" Grades applicants also forward a Transcript Release Form and a Teacher Questionnaire, both PDFs, to their current school.",
        impact: "A family who is ready to apply after the tour waits on the office for the link, and the PDFs come back separately from the application.",
        source: "Madrona School Application Process",
        url: "https://www.madronaschool.org/application-process",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families start the application from the site when they're ready, and each family moves from inquiry to tour, interview and decision in one admin inbox.",
        },
      },
      {
        area: "enroll",
        gap: "The tuition contract goes back to the office to hold a seat",
        saw: "The tuition page says the enrollment fee \"must be paid in full and submitted with a signed tuition contract to ensure a student's space.\" Tuition assistance families are asked to return signed contracts \"to the office with applicable enrollment fees no later than two weeks after receipt.\"",
        impact: "A seat isn't held until both the signed contract and the fee reach the office, and someone has to track which families are still inside their two weeks.",
        source: "Madrona School Tuition and Fees, 2026 - 2027 and Tuition Assistance",
        url: "https://www.madronaschool.org/tuition-and-fees",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families sign the tuition contract and pay the enrollment fee in one online checklist, with reminders until it's done, and the seat shows as held the moment both are in.",
        },
      },
      {
        area: "pay",
        gap: "Each family pays a $56 yearly fee to the tuition processor",
        saw: "Tuition is paid monthly through Blackbaud Tuition Management on a 12-month basis from July 1, by auto withdrawal, credit card, cash or check. The page notes that Blackbaud \"charges a $56 administration fee at the beginning of each school year for processing payments.\" Paying in full by June 30 saves 2%.",
        impact: "On top of tuition, the enrollment fee and the activities fee, every family pays a separate yearly charge to a company they don't otherwise deal with.",
        source: "Madrona School Tuition and Fees, 2026 - 2027",
        url: "https://www.madronaschool.org/tuition-and-fees",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families choose monthly or pay-in-full, set up autopay by card or bank, and see every invoice and payment on their own billing page under the Madrona name.",
        },
      },
      {
        area: "updates",
        gap: "Two of the three calendar links lead to a missing page",
        saw: "The Parent Guide says the calendar is \"available as a downloadable PDF (click on the calendar image below)\". The image opens 2026-2027-Calendar.pdf, which returns 404, and so does the blog's \"Keep track of school events on our calendar!\" link. Only the separate \"School Calendar 2026-2027\" link opens the updated PDF.",
        impact: "A parent who taps the calendar image or the blog link finds nothing, and anyone who saved a copy has to look again each time it's updated.",
        source: "Madrona School Parent Guide and Blog",
        url: "https://www.madronaschool.org/parent-guide",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal", "mobile-app"],
          text: "School dates and festivals live on one calendar in each family's login on the web and the iPhone app, updated in one place.",
        },
      },
      {
        area: "updates",
        gap: "News reaches families through several channels",
        saw: "The Parent Guide lists Tuesday Newsday emailed weekly through Mailchimp, articles in the Blackbaud Parent Portal, a monthly teacher letter, and voice, text and email alerts from School Messenger for closures.",
        impact: "Parents check an inbox, a portal and their phone to keep up, and a missed Tuesday email can mean a missed festival or meeting.",
        source: "Madrona School Parent Guide",
        url: "https://www.madronaschool.org/parent-guide",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["newsletters", "bulletin", "messaging", "mobile-app"],
          text: "Tuesday Newsday, class letters and announcements would sit in one feed families read on the web and in the app, with messages to the office in the same place.",
        },
      },
      {
        area: "website",
        gap: "The age guidelines link goes to a missing page",
        saw: "On the Grade School page, \"Detailed age guidelines are available here\" links to /application-forms, which returns 404. The About page still says Madrona \"is celebrating its 25th school year\" (it opened in 1999).",
        impact: "A family checking which grade their child would enter hits a dead end on the page that explains the mixed-age grades.",
        source: "Madrona School Grade School and About Us pages",
        url: "https://www.madronaschool.org/grade-school",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with age guidelines and dates kept current each school year.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow to appear on a phone",
        saw: "Google PageSpeed gave the home page a mobile score of 58. The page loads about 4 MB.",
        impact: "A parent opening the site from a phone waits before seeing anything about the school.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.madronaschool.org%2F",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with photos sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Madrona",
    founder: {
      fullName: "Toni Loiacano",
      firstName: "Toni",
      role: "Head of School and Handwork Teacher",
      source: "Madrona School faculty & staff page, Toni Loiacano",
      url: "https://www.madronaschool.org/toni-loiacano",
    },
    mailTo: {
      lines: ["Toni Loiacano, Head of School", "Madrona School", "PO Box 11371", "Bainbridge Island, WA 98110"],
      source: "Madrona School Connect page (\"Mailing Address: PO Box 11371, Bainbridge Island, WA 98110\")",
      url: "https://www.madronaschool.org/connect",
    },
    founderFacts: [
      {
        fact: "On her Madrona staff page, Toni writes that she loves being a handwork teacher and watching students overcome boredom and frustration on long-term projects that take months to complete.",
        source: "Madrona School faculty & staff page, Toni Loiacano",
        url: "https://www.madronaschool.org/toni-loiacano",
        readOn: "2026-11-22",
      },
      {
        fact: "Before Madrona, Toni spent a 20+ year architectural career designing educational environments in higher education; she has served Madrona as board chair, board member and handwork assistant since 2020 and is now Head of School.",
        source: "Madrona School faculty & staff page, Toni Loiacano",
        url: "https://www.madronaschool.org/toni-loiacano",
        readOn: "2026-11-22",
      },
    ],
    hook: "On her Madrona staff page, Toni writes that she loves being a handwork teacher and watching students overcome boredom and frustration on long-term projects that take months to complete.",
    body: `Hi Toni,

Rachael Sparhawk, who founded Rooted Meadows in Rigby, Idaho, mentioned Madrona to me. I read your page on the Madrona site and liked what you wrote about handwork: students working through boredom and frustration on projects that take months.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Madrona.

I'd like to hear how you went from designing school buildings to running a school.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Toni, a note from an outdoor microschool in Round Rock, Texas. J",
    shortCode: "madrona-1573",
    checkBeforeMailing: [
      "Opens with Rachael Sparhawk's referral (Rooted Meadows); confirm she's happy to be named.",
      "The address is the school's published PO Box from the Connect page; the street address (105 Winslow Way West) is the Eagle Harbor Congregational Church building the school is housed in.",
      "Toni's page says \"This year she is the Head of School\"; the 2026–2027 staff list still names her as Head of School and Handwork Teacher.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about the signed tuition contract, then who's asking and one proof number",
      subject: "tuition contracts at Madrona",
      body: `Hi Toni,

I mailed you a handwritten note last week with a card for Madrona.

I was reading your tuition page. The enrollment fee goes in with a signed tuition contract to hold a seat, and tuition runs monthly through Blackbaud Tuition Management, which adds its own $56 fee each year.

Are those contracts still signed and returned to the office, or do families sign them online now?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so Toni can see it without clicking around",
      body: `Hi Toni,

In case it's easier to see than describe, I set up a version of MudKitchen for Madrona and recorded a 60-second walkthrough: an inquiry landing in your admin inbox, the contract and enrollment fee in one checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Madrona is, with no pitch",
      where: "Instagram (@madronaschool, linked from the home page)",
      body: "Hi Toni, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Love that the Lantern Walk goes around the pond at Battle Point Park.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Toni,

I also put together a one-page snapshot of what a family sees on your site today, from booking a tour to signing the contract and paying. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Toni,

I'll leave it here so I'm not cluttering your inbox. The Madrona version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Enjoy the festivals this winter.

Julius`,
    },
  ],
};
