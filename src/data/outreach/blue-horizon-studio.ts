import type { OutreachPlan } from "./types";

export const blueHorizonStudioOutreach: OutreachPlan = {
  slug: "blue-horizon-studio",
  schoolName: "Blue Horizon Studio",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Danielle",
    role: "Founder & Director (Danielle Kendle)",
    source: "Blue Horizon About page (\"Meet Danielle | Founder & Director\") and her public CV linked there",
  },
  angle:
    "One real question: Blue Horizon opens in August 2027 with a 14-student cohort, and many families will use California charter funds for part or all of tuition. How will they track what each charter pays and what each family owes? Plus a helpful aside about a Studio Guide link that opens a page not found.",
  facts: [
    {
      fact: "Blue Horizon Studio is a boutique, expert-led workspace for grades 3–8 in Lathrop/Manteca, open 7am to 6pm with a 14-student cohort; it is accepting applications for an August 2027 inaugural cohort and is still finalizing its physical location",
      source: "Blue Horizon, Home, Tuition and The Founders Club",
      url: "https://www.bluehorizonstudio.org/the-founders-club",
      readOn: "2026-11-23",
    },
    {
      fact: "Founders Club rates are $1,900 a month (Standard Horizon) and $2,250 (Extended Horizon) on a 10-month plan, locked for life, with deposits of $3,800 and $4,500 applied to the first and final month; the Tuition FAQ says a $750 tuition prepayment secures a seat, applied to the final installment in May",
      source: "Blue Horizon, The Founders Club and Tuition; 2027 Tuition and Studio Guide (PDF)",
      url: "https://www.bluehorizonstudio.org/tuition",
      readOn: "2026-11-23",
    },
    {
      fact: "Families enroll legally as homeschoolers, and many use California charter school funds to cover tuition and curriculum completely or partially",
      source: "Blue Horizon, Tuition and FAQ",
      url: "https://www.bluehorizonstudio.org/tuition",
      readOn: "2026-11-23",
    },
    {
      fact: "The Tuition FAQ's \"You can download our full Studio Guide here\" link opens a page not found; the \"2027 Tuition and Studio Guide\" link higher on the page works",
      source: "Blue Horizon, Tuition",
      url: "https://www.bluehorizonstudio.org/tuition",
      readOn: "2026-11-23",
    },
    {
      fact: "On May 20, 2026, Blue Horizon held an Outdoor Science Pop-Up at Champions Park where students in grades 3–8 engineered and tested foam projectile launchers",
      source: "Blue Horizon, Calendar (Outdoor Science Pop-Up)",
      url: "https://www.bluehorizonstudio.org/calendar",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds).",
    "Blue Horizon hasn't opened yet (August 2027) and is still securing a location; the pitch is setting up before launch.",
    "Founders Club enrollment runs through Spark Your School (application and payments). Ask what they use for billing before pitching it as new.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "JueVAl4NYlBaD6WQx8EKsw",
    preparedOn: "2026-11-23",
    summary:
      "We read all 19 pages of bluehorizonstudio.org on Nov 23, 2026, plus the 2027 Tuition and Studio Guide.",
    pageSpeed: { mobileScore: 58, url: "https://www.bluehorizonstudio.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Spark Your School",
        usedFor: "Founders Club enrollment",
        url: "https://www.bluehorizonstudio.org/the-founders-club",
      },
      {
        name: "Calendly",
        usedFor: "Info session and Q&A RSVPs",
        url: "https://www.bluehorizonstudio.org/calendar",
      },
    ],
    observations: [
      {
        area: "pay",
        gap: "The site gives two different seat deposits",
        saw: "The Tuition FAQ says a $750 prepayment secures a seat, applied to the May installment. The Founders Club page says the deposit is $3,800 (Standard) or $4,500 (Extended), applied to the first and final months.",
        impact: "A family ready to commit can't tell how much it takes to hold their child's spot.",
        source: "Blue Horizon, Tuition and The Founders Club",
        url: "https://www.bluehorizonstudio.org/the-founders-club",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-fees", "enrollment-checklist"],
          text: "One deposit amount per horizon, paid in the enrollment checklist and credited automatically to the right months.",
        },
      },
      {
        area: "pay",
        gap: "Charter families will pay from two places",
        saw: "Families enroll as homeschoolers, and many use California charter school funds to cover tuition completely or partially. The site doesn't say how a family's own share is billed.",
        impact: "A charter family can't see what their charter covers each month and what they'll still owe.",
        source: "Blue Horizon, Tuition and FAQ",
        url: "https://www.bluehorizonstudio.org/tuition",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "autopay"],
          text: "We'd set up each family's billing page to show the charter's share and their own, with autopay for their part.",
        },
      },
      {
        area: "find",
        gap: "One Studio Guide link opens a page not found",
        saw: "In the Tuition FAQ, \"You can download our full Studio Guide here\" opens a page not found. The \"2027 Tuition and Studio Guide\" link higher on the page opens the current guide.",
        impact: "A family who scrolls to the FAQ for the full breakdown hits a dead end.",
        source: "Blue Horizon, Tuition",
        url: "https://www.bluehorizonstudio.org/tuition",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "Monthly rates and what's included shown on the page itself, so there's one place to look.",
        },
      },
      {
        area: "updates",
        gap: "Past events still lead the calendar",
        saw: "The Calendar lists the December and January info sessions, then the November session, June's Watermelon Street Faire and two May Q&As that have already happened.",
        impact: "A family scanning for the next info session reads past dates mixed in with upcoming ones.",
        source: "Blue Horizon, Calendar",
        url: "https://www.bluehorizonstudio.org/calendar",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "tour-self-booking"],
          text: "Upcoming sessions only, with families picking a seat from open slots and getting a reminder.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 58 out of 100 on mobile, and the page is about 3.8 MB.",
        impact: "A parent opening the site on a phone, say on a Bay Area commute, waits before it settles.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://www.bluehorizonstudio.org/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with images sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Blue Horizon",
    founder: {
      fullName: "Danielle Kendle",
      firstName: "Danielle",
      role: "Founder & Director",
      source: "Blue Horizon, About (and the linked public CV)",
      url: "https://www.bluehorizonstudio.org/about",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "On May 20, 2026, Blue Horizon held an Outdoor Science Pop-Up at Champions Park where students in grades 3–8 engineered and tested foam projectile launchers.",
        source: "Blue Horizon, Calendar (Outdoor Science Pop-Up)",
        url: "https://www.bluehorizonstudio.org/calendar",
        readOn: "2026-11-23",
      },
      {
        fact: "Danielle has 19 years of classroom experience specializing in middle school science, with a degree in Biology and a Master's in School Administration.",
        source: "Blue Horizon, About",
        url: "https://www.bluehorizonstudio.org/about",
        readOn: "2026-11-23",
      },
    ],
    hook: "On May 20, 2026, Blue Horizon held an Outdoor Science Pop-Up at Champions Park where students in grades 3–8 engineered and tested foam projectile launchers.",
    body: `Hi Danielle,

Your calendar from May had kids engineering foam launchers at Champions Park, more than a year before Blue Horizon opens. That's a good way to show families what your afternoons will feel like.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Blue Horizon.

I'd like to hear how the Founders Club is coming together ahead of August.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Danielle, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "bluehorizon-f5n2",
    checkBeforeMailing: [
      "Find a mailing address: Blue Horizon has no physical location yet (the Founders Club page says deposits help finalize it), and the site lists only email and phone. Ask by email, or wait until a location is announced. Don't use a home address.",
      "No podcast or press about Danielle turned up; the hook is the school's own May pop-up event.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about charter-funded billing before launch (with the not-found Studio Guide link as a helpful aside), then who's asking and one proof number",
      subject: "Charter funds at Blue Horizon",
      body: `Hi Danielle,

I mailed you a handwritten note last week with a card for Blue Horizon.

Your Tuition page says many families will use California charter funds to cover part or all of tuition. One small thing: the "full Studio Guide here" link in that FAQ opens a page not found.

With a 14-student cohort opening next August, how are you planning to track what each charter pays and what each family still owes?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Danielle,

In case it's easier to see than describe, I set up a version of MudKitchen for Blue Horizon and recorded a 60-second walkthrough: an info session RSVP landing in your admin inbox, the Founders Club checklist with the deposit, and the monthly billing page.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Blue Horizon is, with no pitch",
      where: "Facebook (Blue Horizon Studio community, linked on the Contact page)",
      body: "Hi Danielle, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. No homework and a studio open until 6 is a great promise to working families.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Danielle,

I also put together a one-page snapshot of what a family sees on your site today, from the Founders Club to paying with charter funds. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Danielle,

I'll leave it here so I'm not cluttering your inbox. The Blue Horizon version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the launch.

Julius`,
    },
  ],
};
