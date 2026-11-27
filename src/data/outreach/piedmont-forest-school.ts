import type { OutreachPlan } from "./types";

export const piedmontForestSchoolOutreach: OutreachPlan = {
  slug: "piedmont-forest-school",
  schoolName: "Piedmont Forest School",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Sheri",
    role: "Founder and Director",
    source:
      "Piedmont Forest School Our Team page (Sheri Grace, PhD, Founder, Director) and Our Story page (founded the 501(c)3 in 2020); Tausha is listed as Enrollment and Billing Coordinator",
  },
  angle:
    "One real question: the new Agile Learning Center can take the Opportunity Scholarship as well as ESA+, and families set up a billing plan in Brightwheel, so who tracks the share a scholarship family still owes",
  facts: [
    {
      fact: "The Agile Learning Center launches in the 2026–2027 school year at Little Creek Park, licensed as a private school, for ages 5–12, Monday to Thursday 9:30 am–3:30 pm, with afternoons at the Little Creek Neighborhood Center",
      source: "Piedmont Forest School Agile Learning Center page",
      url: "https://piedmontforestschool.org/alc",
      readOn: "2026-11-22",
    },
    {
      fact: "The ALC page says PFS accepts the ESA+ Scholarship ($9,000 base annual award, for children with an IEP) and the Opportunity Scholarship (income-based, about $3,000 to $7,000)",
      source: "Piedmont Forest School Agile Learning Center page",
      url: "https://piedmontforestschool.org/alc",
      readOn: "2026-11-22",
    },
    {
      fact: "The FAQ's enrollment steps: the Enrollment Inquiry Google Form, a call from the coordinator within 72 business hours, a tour, then all paperwork in Brightwheel and a billing plan; families also check children in and out with the Brightwheel app",
      source: "Piedmont Forest School FAQs",
      url: "https://piedmontforestschool.org/about-us/faqs",
      readOn: "2026-11-22",
    },
    {
      fact: "Program registration is for a whole semester and fees are paid monthly in advance; Forest Kindergarten is $280 to $600 a month for two to five days, Nature Explorers $280 to $510 for two to four days",
      source: "Piedmont Forest School FAQs and Forest School Programs page",
      url: "https://piedmontforestschool.org/programs",
      readOn: "2026-11-22",
    },
    {
      fact: "The 2026–27 calendar (updated Jan 12, 2026) runs the fall semester from Aug 24 to Dec 18 and the spring semester from Jan 4; Bushcraft runs Thursdays Oct 15 to Dec 10, 2026",
      source: "Piedmont Forest School 2026–2027 Annual Calendar (PDF)",
      url: "https://piedmontforestschool.org/pdfs/2026-2027-pfs-annual-calendar.pdf",
      readOn: "2026-11-22",
    },
    {
      fact: "Little Creek Park was PFS's first home in 2020; the Location page describes its sandy creeksides, slow water and natural clay deposits",
      source: "Piedmont Forest School Our Location page",
      url: "https://piedmontforestschool.org/about-us/our-location",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "The site still describes the ALC and the move to Little Creek Park in the future tense. Their Instagram is active this fall (Bushcraft Oct 15–Dec 10, a Nov 14 Prism post), but confirm the ALC actually opened before sending; the first email only says what the ALC page says.",
    "Sheri Grace is Founder and Director; Tausha is the Enrollment and Billing Coordinator who answers inquiries. Confirm Sheri is the right recipient and that the CRM address reaches her (Tausha may be a better fit for billing).",
    "PFS runs enrollment paperwork, billing plans and daily check-in on Brightwheel. Replacing an all-in-one tool they already use is a bigger ask; decide whether to pitch replacing it or lead with the scholarship billing question only.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "The ALC uses Prism for learning portfolios and the site takes donations through Donorbox. We work alongside both; don't pitch replacing them.",
    "PFS is a 501(c)3 nonprofit with a Board of Directors, not a for-profit microschool. Keep the tone peer-to-peer, not founder-to-founder.",
    "The demo's testimonials are placeholders and the ALC card says \"Enrollment details TBD\"; check the demo before recording the Loom.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "NbfFQQNsF1Scb97jxOhI1g",
    preparedOn: "2026-11-22",
    summary:
      "We read all 12 pages of piedmontforestschool.org on Nov 22, 2026, plus both enrollment inquiry forms and the 2026–27 calendar.",
    pageSpeed: { mobileScore: 94, url: "https://piedmontforestschool.org/", checkedOn: "2026-11-22" },
    toolStack: [
      {
        name: "Google Forms",
        usedFor: "Forest school and ALC enrollment inquiries, tour day requests",
        url: "https://piedmontforestschool.org/contact-us/enrollment",
      },
      {
        name: "Brightwheel",
        usedFor: "Enrollment paperwork, billing plans and daily check-in and check-out",
        url: "https://piedmontforestschool.org/about-us/faqs",
      },
    ],
    observations: [
      {
        area: "pay",
        gap: "The site doesn't say how scholarship families are billed",
        saw: "PFS takes ESA+ ($9,000 base award) and, for the ALC, the Opportunity Scholarship ($3,000 to $7,000). Both inquiry forms ask whether a family plans to use ESA+ for \"a portion or all\" of fees. The FAQ says fees are paid monthly in advance on a billing plan set up in Brightwheel after enrollment.",
        impact: "A family using a scholarship for part of tuition can't see what they'll owe each month, and the office reconciles state payments against each family's plan.",
        source: "Piedmont Forest School Agile Learning Center page",
        url: "https://piedmontforestschool.org/alc",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing that shows what ESA+ or the Opportunity Scholarship covers and what the family owes on each bill, so the office sees which funds have arrived next to each family.",
        },
      },
      {
        area: "find",
        gap: "The Agile Learning Center has no price on the site",
        saw: "The ALC page gives ages 5–12, Monday to Thursday 9:30 am–3:30 pm, and the scholarship amounts, but no tuition. The ALC inquiry form also offers ALC After-School Care with a two-day minimum, which no page mentions.",
        impact: "Families weighing a $3,000 to $7,000 scholarship can't tell what's left to pay until the coordinator calls them back.",
        source: "Piedmont Forest School Agile Learning Center page",
        url: "https://piedmontforestschool.org/alc",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "tuition-rate-plans"],
          text: "The site we build shows the ALC and after-school tuition as plain text, from the same plans families are billed with.",
        },
      },
      {
        area: "tour",
        gap: "Families pick a tour day, then wait for a call",
        saw: "Both inquiry forms ask which weekday works for a 9:30 am tour (Playgroup tours Fridays only, Nature Explorers Tuesday to Thursday). The coordinator then gets in touch within 72 business hours.",
        impact: "A family learns their tour time up to three business days later, and the coordinator schedules each tour by hand.",
        source: "Forest School Enrollment Inquiry (Google Form, linked from the Enrollment page)",
        url: "https://piedmontforestschool.org/contact-us/enrollment",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families book a tour from your open slots on the right days for each program, and each booking lands in your admissions inbox.",
        },
      },
      {
        area: "apply",
        gap: "Two inquiry forms, and siblings share one text box",
        saw: "Forest school programs and the ALC each have their own Google Form with about 17 required questions. A second child's name, birth date, description and toilet-training status go into one free-text box.",
        impact: "A family with a preschooler and an ALC-age child fills in two forms, and sibling details arrive as a paragraph to copy out.",
        source: "Piedmont Forest School Enrollment page",
        url: "https://piedmontforestschool.org/contact-us/enrollment",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "One inquiry form on your site covers every program and each child, and lands in your admin inbox the moment it's sent.",
        },
      },
      {
        area: "enroll",
        gap: "Families start in Google Forms and finish in Brightwheel",
        saw: "The Programs page lists six steps: the Google Form, a call from the Enrollment and Billing coordinator, a tour, confirming a spot, then all paperwork in Brightwheel and a billing plan.",
        impact: "What a family wrote in the inquiry (program, days, ESA+ status) sits in one tool while their paperwork and billing sit in another.",
        source: "Piedmont Forest School Forest School Programs page",
        url: "https://piedmontforestschool.org/programs",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Once you confirm a spot, the family gets one checklist in the same place they inquired: forms signed online and fees paid, with reminders until it's done.",
        },
      },
      {
        area: "find",
        gap: "Course dates on the Programs page are last year's",
        saw: "The Programs page lists Bushcraft for Oct 16–Dec 18, 2025 and spring 2026, Nature Journaling for fall 2025 and spring 2026, and Forest Friends for spring 2026. This fall's dates (Bushcraft Oct 15–Dec 10, 2026) are only in the calendar PDF.",
        impact: "A family reading the Programs page sees courses that have already ended and has to open the PDF to find this semester's.",
        source: "Piedmont Forest School Forest School Programs page",
        url: "https://piedmontforestschool.org/programs",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "The site we build lists each course with this semester's dates and whether it's open, waitlisted or full, and we keep it current.",
        },
      },
      {
        area: "updates",
        gap: "The year's calendar is a one-page PDF",
        saw: "The footer links the 2026–27 calendar as a PDF (updated Jan 12, 2026), with two events still marked TBD, next to last year's PDF. Weather closures are announced by 8:00 am; the FAQ doesn't say where.",
        impact: "Families check a PDF for changes rather than hearing about them, and may open last year's dates.",
        source: "Piedmont Forest School 2026–2027 Annual Calendar (PDF)",
        url: "https://piedmontforestschool.org/pdfs/2026-2027-pfs-annual-calendar.pdf",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "bulletin", "parent-portal"],
          text: "One school calendar and announcements feed in each family's login, so a closure or a new date reaches everyone in one place.",
        },
      },
      {
        area: "website",
        gap: "Pages still describe the 2026–27 move as coming up",
        saw: "The Location page says programs are \"currently held at Salem Lake Park\" and will move to Little Creek Park for 2026–27. The Programs page says PFS is moving to a Learning Center starting August 2026, and the home page still promotes the June 6, 2026 Brunch Run.",
        impact: "A family finding PFS this fall can't tell from the site where programs meet today or whether the ALC has opened.",
        source: "Piedmont Forest School Our Location page",
        url: "https://piedmontforestschool.org/about-us/our-location",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build says where each program meets now, and we keep it current. Yours already loads fast on a phone (94 on Google PageSpeed); we'd keep it that way.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Piedmont Forest School",
    founder: {
      fullName: "Sheri Grace",
      firstName: "Sheri",
      role: "Founder and Director",
      source: "Piedmont Forest School Our Team page (\"Sheri Grace, PhD: Founder, Director\") and Our Story page (founded the 501(c)3 in 2020)",
      url: "https://piedmontforestschool.org/about-us/our-team",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "On the What We See podcast (June 11, 2026), in an episode titled \"The hardest thing is not making the fort, it's getting along.\", Sheri Grace talked about founding Piedmont Forest School in a Winston-Salem park, a morning in the woods, what four children learned from building a fort no one assigned, and plans to add an Agile Learning Center this fall.",
        source: "What We See, \"The hardest thing is not making the fort, it's getting along.\" A conversation with Sheri Grace from Piedmont Forest School (Apple Podcasts)",
        url: "https://podcasts.apple.com/us/podcast/the-hardest-thing-is-not-making-the-fort-its/id1896826040?i=1000772215155",
        readOn: "2026-11-22",
      },
      {
        fact: "Piedmont Forest School was founded as a 501(c)3 nonprofit in 2020 by Sheri Grace, PhD, who brings over 30 years of experience in early childhood special education; it began with summer camps at Little Creek Park and Greenway in Winston-Salem.",
        source: "Piedmont Forest School Our Story page",
        url: "https://piedmontforestschool.org/about-us/our-story",
        readOn: "2026-11-22",
      },
      {
        fact: "For the 2026–2027 school year PFS is moving its programs from Salem Lake Park back to Little Creek Park, its first home in 2020, and launching the Agile Learning Center at the Little Creek Neighborhood Center.",
        source: "Piedmont Forest School home page and Our Location page",
        url: "https://piedmontforestschool.org/",
        readOn: "2026-11-22",
      },
    ],
    hook: "On the What We See podcast (June 11, 2026), in an episode titled \"The hardest thing is not making the fort, it's getting along.\", Sheri Grace talked about founding Piedmont Forest School in a Winston-Salem park, a morning in the woods, what four children learned from building a fort no one assigned, and plans to add an Agile Learning Center this fall.",
    body: `Hi Sheri,

I listened to your What We See episode about the fort four children built, and loved the title line, that the hardest thing isn't making the fort, it's getting along.

Time outside is a big part of our days too. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Piedmont Forest School.

I'd love to hear how the Agile Learning Center's first fall is going.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Sheri, a note from an outdoor microschool in Round Rock, Texas. J",
    shortCode: "piedmont-np6r",
    checkBeforeMailing: [
      "Find a mailing address: piedmontforestschool.org (home, Our Story, Our Team, Our Location, FAQs, Enrollment, Donate) lists no street address or PO box; programs meet in city parks (Salem Lake Park, moving to Little Creek Park and the Little Creek Neighborhood Center for 2026–27), which won't take mail for PFS. GuideStar lists a Rural Hall address that looks like a home; don't use it. Non-home lead: ask Tausha, the Enrollment and Billing Coordinator, through the site's contact form for a mailing address or PO box.",
      "Listen to the What We See episode (June 11, 2026, about 27 minutes) before mailing: the hook is from the episode title and description, so make sure the fort story matches what she says.",
      "The ask assumes the Agile Learning Center opened this fall at Little Creek Park; the site still describes it in the future tense. If it hasn't opened, change the ask to \"I'd love to hear how this fall is going.\"",
      "PFS is a 501(c)3 with a board; Tausha handles enrollment and billing. The letter goes to Sheri only.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose:
        "Mention last week's handwritten note, then one real question about how the share a scholarship family still owes gets tracked, then who's asking and why",
      subject: "Scholarship families at the ALC",
      body: `Hi Sheri,

I mailed you a handwritten note last week with a card for Piedmont Forest School.

Your ALC page says the new full-day program can take the Opportunity Scholarship ($3,000 to $7,000) as well as ESA+, and your FAQ has families set up a billing plan in Brightwheel once they're enrolled.

When a scholarship covers part of tuition, how do you keep track of the share each family still owes?

I ask because I run Sage Field, a microschool in Round Rock, TX, and billing like that is why I built MudKitchen, the software we run it on.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Sheri,

I set up a version of MudKitchen for Piedmont Forest School and recorded a 60-second walkthrough: a family starting an inquiry from your homepage, the enrollment checklist they get after the tour, and the page where they pay tuition.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school is active, with no pitch",
      where: "Instagram (@piedmontforestschool, linked from the site footer)",
      body: "Hi from Sage Field, a small outdoor microschool in Round Rock, TX. The clay deposits and sandy creeksides at Little Creek sound like a dream for forest school.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Sage Field and Rooted Meadows proof",
      body: `Hi Sheri,

I also put together a one-page snapshot of what a family sees on your site today, from the inquiry form and tour to scholarships and billing. No reply needed:

{snapshot link}

For context, Sage Field went from 0 to 35 students in under 3 months on MudKitchen, and Rooted Meadows, a K–8 school in Idaho, opened on it this August.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Sheri,

I'll leave it here so I'm not cluttering your inbox. The Piedmont Forest School version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the spring semester at Little Creek.

Julius`,
    },
  ],
};
