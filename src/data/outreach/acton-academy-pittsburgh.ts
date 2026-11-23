import type { OutreachPlan } from "./types";

export const actonAcademyPittsburghOutreach: OutreachPlan = {
  slug: "acton-academy-pittsburgh",
  schoolName: "Acton Academy Pittsburgh",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Ronnie",
    role: "Founder",
    source:
      "Acton Pittsburgh Team page and home page (Ronnie and Meghan Esposito, founders); the Book a Call page offers a 1:1 call with \"the Founder\" and the FAQ video is \"our founder and his son\"",
  },
  angle: "Proof + their process: the five steps a family takes on the Book a Call page, then enrollment and tuition in one place",
  facts: [
    {
      fact: "The Book a Call page lists five steps: book a call, book a tour, the application form, a learner's visit, then the enrollment decision. The call is booked on a calendar on the page",
      source: "Acton Pittsburgh Book a Call page",
      url: "https://actonacademypittsburgh.com/application",
      readOn: "2026-11-22",
    },
    {
      fact: "Annual tuition is $11,500; scholarships take up to $6,000 off for eligible students, are limited, and families are told to contact the school about the application process",
      source: "Acton Pittsburgh FAQs",
      url: "https://actonacademypittsburgh.com/faqs",
      readOn: "2026-11-22",
    },
    {
      fact: "Four mixed-age studios: Spark (4–7), Elementary (8–11), Middle School (12–15) and Launchpad (16–18), the high school studio opening in 2027 at the same tuition",
      source: "Acton Pittsburgh Launchpad Studio",
      url: "https://actonacademypittsburgh.com/launchpad-studio",
      readOn: "2026-11-22",
    },
    {
      fact: "The Redirect Your PA Taxes page asks businesses and taxpayers to fund Acton scholarships through Pennsylvania's EITC program and BLOCS; it was updated after Oct 22, 2026",
      source: "Acton Pittsburgh EITC page",
      url: "https://actonacademypittsburgh.com/eitc",
      readOn: "2026-11-22",
    },
    {
      fact: "After acceptance, families pay a $300 non-refundable enrollment fee on a checkout page; the Enrollment Form then arrives by email",
      source: "Acton Pittsburgh Enrollment Payment and thank-you pages (not in the site menu)",
      url: "https://actonacademypittsburgh.com/enrollment-payment",
      readOn: "2026-11-22",
    },
    {
      fact: "Middle School learners begin real-world apprenticeships, spending one to three weeks inside a local business",
      source: "Acton Pittsburgh Business Giving",
      url: "https://actonacademypittsburgh.com/acton-business-fair-partner",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Ronnie and Meghan Esposito are both listed as founders; the site points families to a call with \"the Founder\" (him, per the FAQ video). Confirm Ronnie is the right recipient and find his address on the site or in the CRM.",
    "The snapshot cites public pages that aren't in the site menu (/application-9048, /tour-calendar, /enrollment-payment, /thankyou-enrollment, /tuition-calculator). Open them once more and decide whether to keep those cards.",
    "The demo's admin and parent views use generic data; check the tuition shown there matches $11,500 before recording the Loom.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "X_CUNW6KR1jye3p16BYPOA",
    preparedOn: "2026-11-22",
    summary:
      "We read more than 40 pages of actonacademypittsburgh.com on Nov 22, 2026, from the Information Kit and FAQs to the application and enrollment-fee pages, plus the inquiry form.",
    pageSpeed: { mobileScore: 48, url: "https://actonacademypittsburgh.com/", checkedOn: "2026-11-22" },
    toolStack: [
      { name: "HighLevel form", usedFor: "Tell Us About Your Family inquiry", url: "https://actonacademypittsburgh.com/faqs" },
      { name: "HighLevel calendar", usedFor: "Booking the call with the founder", url: "https://actonacademypittsburgh.com/application" },
      { name: "Checkout page", usedFor: "$300 enrollment fee", url: "https://actonacademypittsburgh.com/enrollment-payment" },
      { name: "Emailed enrollment form", usedFor: "Enrollment Form after the fee is paid", url: "https://actonacademypittsburgh.com/thankyou-enrollment" },
    ],
    observations: [
      {
        area: "find",
        gap: "Who qualifies for a scholarship takes a phone call to find out",
        saw: "The Spark, Elementary and Middle School pages say scholarships take up to $6,000 off the $11,500 tuition for eligible students, and the FAQ says to contact the school about applying. The income limits appear only on the EITC page, written for donors, and on a tuition calculator that isn't in the menu and is labelled 2025–2026.",
        impact: "A family who would qualify can't tell before they call, and some won't call.",
        source: "Acton Pittsburgh FAQs",
        url: "https://actonacademypittsburgh.com/faqs",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "discounts"],
          text: "The site we build shows tuition, the scholarship and who qualifies as plain text, from the same discounts families are billed with.",
        },
      },
      {
        area: "tour",
        gap: "Step 2, the campus tour, has no way to book it",
        saw: "The Book a Call page has a calendar for the call. Step 2 says \"Book a Tour\" with no link or times, and the site's Tour Calendar page isn't linked from any menu.",
        impact: "After the call, families wait to hear back before they can see the studio.",
        source: "Acton Pittsburgh Book a Call page",
        url: "https://actonacademypittsburgh.com/application",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "observation-booking"],
          text: "Families pick a tour time from slots you open, and after applying they book the learner's visit the same way, with reminders before each.",
        },
      },
      {
        area: "apply",
        gap: "Three pages describe three different paths in",
        saw: "The home page lists three steps (a short form, a reply, a visit). The Book a Call page and Information Kit list five (call, tour, application, learner's visit, decision). The page after the inquiry form lists four, including a three-day trial.",
        impact: "Families can't tell which steps they'll take or how long it takes, so they ask.",
        source: "Acton Pittsburgh Information Kit",
        url: "https://actonacademypittsburgh.com/infokit",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["admissions-pipeline", "online-application"],
          text: "Every inquiry and application lands in one admin inbox with the family's stage, and the site shows one set of steps that matches it.",
        },
      },
      {
        area: "apply",
        gap: "Step 3, the application, isn't linked from the site",
        saw: "Both step lists include an application form, but no menu page links to one. The application page we found asks more than 25 questions, from parenting approach to medical history and an emergency contact, with nothing saying families can save and come back.",
        impact: "A long form in one sitting is easy to abandon halfway, and families can't see it before they're sent the link.",
        source: "Acton Pittsburgh application page (not in the site menu)",
        url: "https://actonacademypittsburgh.com/application-9048",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "The application lives on your site with saved drafts, and each one lands in your admin inbox next to the family's call and visit.",
        },
      },
      {
        area: "enroll",
        gap: "Enrolling is a fee page, then a form sent by email",
        saw: "Accepted families pay a $300 non-refundable enrollment fee on a checkout page. The thank-you page then asks them to find an email with the Enrollment Form link, and to check spam if it doesn't arrive.",
        impact: "Paying and the paperwork happen in two places, and the office matches each fee to its form by hand.",
        source: "Acton Pittsburgh enrollment thank-you page (not in the site menu)",
        url: "https://actonacademypittsburgh.com/thankyou-enrollment",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-fees", "enrollment-agreements"],
          text: "Accepted families get one checklist: the fee paid, the enrollment form filled in and the agreement signed online, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "Payment plans and the sibling discount aren't on the main pages",
        saw: "The menu pages give $11,500 a year and nothing on how tuition is paid. A tuition calculator page outside the menu offers 1, 2, 4, 10 or 12 payments a year and a 10% sibling discount.",
        impact: "Families weigh the cost without knowing they can spread it out or that a second child costs less.",
        source: "Acton Pittsburgh Tuition Calculator (not in the site menu)",
        url: "https://actonacademypittsburgh.com/tuition-calculator",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "parent-plan-choice", "discounts", "autopay"],
          text: "Families choose annual, quarterly, 10 or 12 payments in their portal, the sibling discount applies itself, and autopay takes it from there.",
        },
      },
      {
        area: "updates",
        gap: "No school calendar on the site",
        saw: "The site says the year runs from early September to the end of May and follows public school breaks. There are no dates for the first day, breaks or exhibitions.",
        impact: "Families plan around exhibitions and breaks by asking or waiting for an email.",
        source: "Acton Pittsburgh FAQs",
        url: "https://actonacademypittsburgh.com/faqs",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal"],
          text: "A school calendar with breaks and exhibition dates sits in each family's login, next to their tuition and forms.",
        },
      },
      {
        area: "website",
        gap: "The main address shows an older home page",
        saw: "actonacademypittsburgh.com opens a different, older home page (it says \"K–12 Private School\") than the Home link in the menu. The Contact page's menu links to older copies of each page, and its Information Kit link returns \"page not found\". On a phone the home page scored 48 of 100 on Google PageSpeed.",
        impact: "Families who type the address or open Contact see older copy and dead ends, on a page that loads slowly on a phone.",
        source: "Acton Pittsburgh Contact page",
        url: "https://actonacademypittsburgh.com/contact-acton",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you has one home page and one menu, loads fast on a phone, and we keep it current.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Acton Pittsburgh",
    founder: {
      fullName: "Ronnie Esposito",
      firstName: "Ronnie",
      role: "Co-founder",
      source: "Acton Academy Pittsburgh, Team (Who We Are: Ronnie and Meghan Esposito, Founders)",
      url: "https://actonacademypittsburgh.com/career-old",
    },
    mailTo: {
      lines: ["Acton Academy Pittsburgh", "3500 Brooktree Road", "Wexford, PA 15090"],
      source: "Acton Pittsburgh Contact Us page (the same address is in the site footer)",
      url: "https://actonacademypittsburgh.com/contact-acton",
    },
    founderFacts: [
      {
        fact: "The founders' story on Acton Pittsburgh's Team page says Ronnie heard David Osborne on a podcast while driving to work, then kept listening to find out which school David's kids attended: Acton Academy.",
        source: "Acton Academy Pittsburgh, Team (Who We Are)",
        url: "https://actonacademypittsburgh.com/career-old",
        readOn: "2026-11-22",
      },
      {
        fact: "Ronnie Esposito was a guest on The Brian Hess Show (Episode 417, October 27, 2021), talking about Acton's student-led, self-paced model and learning by doing.",
        source: "The Brian Hess Show, Episode 417 | Powerful Perspectives | Ronnie Esposito of Acton Academy (Apple Podcasts)",
        url: "https://podcasts.apple.com/us/podcast/episode-417-powerful-perspectives-ronnie-esposito-of/id1477287951?i=1000539884714",
        readOn: "2026-11-22",
      },
      {
        fact: "Launchpad, Acton Pittsburgh's high school studio for ages 16 to 18, opens in 2027, with the school's own Middle School learners moving up first.",
        source: "Launchpad Studio (Ages 16–18) | Acton Academy Pittsburgh",
        url: "https://actonacademypittsburgh.com/launchpad-studio",
        readOn: "2026-11-22",
      },
    ],
    hook: "The founders' story on Acton Pittsburgh's Team page says Ronnie heard David Osborne on a podcast while driving to work, then kept listening to find out which school David's kids attended: Acton Academy.",
    body: `Hi Ronnie,

I read the story on your Team page about hearing David Osborne on a podcast on the drive to work, then listening to more episodes to find out which school his kids went to.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our enrollment and tuition, and it's a big part of how we grew. Now we offer it to other microschools too.

I'd like to hear how Launchpad is coming together for 2027. A text is plenty.

Julius`,
    postscript: "The card inside has a version of Acton Pittsburgh I set up, plus a parent's-eye look at your enrollment.",
    stickyNote: "Ronnie, a note from a microschool founder in Texas. J",
    shortCode: "actonpgh-25hw",
    checkBeforeMailing: [
      "3500 Brooktree Road is a multi-tenant office building in Brooktree Office Park and the site gives no suite number. Keep \"Acton Academy Pittsburgh\" on the envelope; add a suite if you find one.",
      "Ronnie and Meghan Esposito are both listed as founders. The letter goes to Ronnie because the Team page story is told by the husband (\"my wife and I\") and the FAQ video is \"our founder and his son\".",
      "The only podcast found is from October 2021 (The Brian Hess Show). Skim it before mailing in case he calls.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention the handwritten note, then their own five-step process, one proof number, and a permission ask to send their version",
      subject: "Acton Pittsburgh's five steps",
      body: `Hi Ronnie,

I mailed you a handwritten note last week with a card for Acton Pittsburgh.

Your Book a Call page lays out five steps for a family: a call, a campus tour, the application form, a learner's visit, then the enrollment decision.

I run Sage Field, a microschool in Round Rock, and built MudKitchen to track every family through steps like that, then through enrollment and tuition. We grew from 0 to 35 students in under 3 months on it.

The QR code on the card opens a version I set up for Acton Pittsburgh with your studios and the $11,500 tuition in it. Want me to send the link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Ronnie,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Acton Pittsburgh version: a family reaching out from your homepage, the enrollment checklist they get after your yes, and the tuition page they pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school is, with no pitch",
      where: "Facebook (ActonPittsburgh)",
      body: "Hi Ronnie, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Loved reading that your middle schoolers apprentice inside local businesses.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Ronnie,

I also put together a one-page snapshot of what a family sees on your site today, from the first call to enrollment. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Ronnie,

I'll leave it here so I'm not cluttering your inbox. The Acton Pittsburgh version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck getting Launchpad ready for 2027.

Julius`,
    },
  ],
};
