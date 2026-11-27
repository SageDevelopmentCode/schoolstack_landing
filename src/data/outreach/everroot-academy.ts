import type { OutreachPlan } from "./types";

export const everrootAcademyOutreach: OutreachPlan = {
  slug: "everroot-academy",
  schoolName: "EverRoot Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Katelynn",
    role: "Founder and 6th–8th Teacher (Katelynn Stone)",
    source: "EverRoot Academy About page (\"Meet our Founder and 6th-8th Teacher: Katelynn Stone is the founder of EverRoot Academy\")",
  },
  angle:
    "One real question: EverRoot stacks founding-family, sibling and military discounts, prorates mid-year starts and accepts Step Up funding. For a military family with two kids starting in January and paying with Step Up, how is what they owe worked out?",
  facts: [
    {
      fact: "2026–2027 plans: All-Inclusive 4 Day Plan $11,000 (180 days over 12 months), 3 Day Plan $7,508 (117 days over 10 months, with tutoring, camps and workshops charged separately), Targeted Tutoring Plan $4,840 (39 weeks); mid-year starts are prorated",
      source: "EverRoot Academy, About (Enrollment and Tuition)",
      url: "https://www.everrootacademy.com/about",
      readOn: "2026-11-23",
    },
    {
      fact: "Discounts: founding families 10% off (first three) and 5% off (next three), 10% off for each additional sibling, one 10% discount per active duty military family; \"We proudly accept ESA/scholarship funding through Step Up\"",
      source: "EverRoot Academy, About (Discounts and ESA)",
      url: "https://www.everrootacademy.com/about",
      readOn: "2026-11-23",
    },
    {
      fact: "The Contact page form, used \"to request a call or a registration link\", is a Jotform on kaipodlearning.jotform.com; the home page links to KaiPod Learning",
      source: "EverRoot Academy, Contact and home page",
      url: "https://www.everrootacademy.com/contact",
      readOn: "2026-11-23",
    },
    {
      fact: "The Contact page lists three July Zoom sessions on Eventbrite, the last marked \"Last event before we open in August!\", next to the line \"No current events to display\"",
      source: "EverRoot Academy, Contact",
      url: "https://www.everrootacademy.com/contact",
      readOn: "2026-11-23",
    },
    {
      fact: "EverRoot serves grades 3–7 for 2026–2027 in Crestview, Florida and beyond, with a hybrid virtual and place-based model built for students who move frequently and neurodivergent learners",
      source: "EverRoot Academy home page",
      url: "https://www.everrootacademy.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "Google PageSpeed gave the home page a mobile score of 49; the main content took about 6.5 seconds to appear and the page loads about 3.2 MB",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.everrootacademy.com%2F",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Uses KaiPod's Jotform: decide whether to pitch replacing it (the contact form runs on kaipodlearning.jotform.com and the home page links to KaiPod; the CRM lists EverRoot as a partner microschool).",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "We'd build: Monthly billing for clubs, after-care or add-on classes",
    "Step Up funding runs through Step Up's own system. MudKitchen works alongside it; don't pitch replacing it.",
    "EverRoot opened in August 2026 and is small. Keep the pitch to enrollment, discounts and billing; it's early for a full website rebuild pitch.",
    "Instagram (@everrootacademy), Facebook and the founder's LinkedIn and YouTube are linked from the site but weren't opened; check one is active before the social step.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "5gAvPm2Zn31OPBli9IYtiw",
    preparedOn: "2026-11-23",
    summary: "We read all 4 pages of everrootacademy.com on Nov 23, 2026, plus the contact form and Eventbrite sessions.",
    pageSpeed: { mobileScore: 49, url: "https://www.everrootacademy.com/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Jotform",
        usedFor: "Requesting a call or a registration link",
        url: "https://www.everrootacademy.com/contact",
        network: "KaiPod",
      },
      {
        name: "Eventbrite",
        usedFor: "Zoom demo days and parent workshops",
        url: "https://www.everrootacademy.com/contact",
      },
    ],
    observations: [
      {
        area: "find",
        gap: "The site doesn't say which days each plan meets",
        saw: "The plans are described by days per year (180 or 117) and \"four days per week\" for tutoring. The site doesn't say which weekdays, what hours, or which parts are virtual and which happen in person in Crestview.",
        impact: "A family comparing the 3 Day and 4 Day plans can't picture their week until they get on a call.",
        source: "EverRoot Academy, home page and About",
        url: "https://www.everrootacademy.com/about",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build the site for you with a page per plan showing the weekly schedule, what's online and what's local.",
        },
      },
      {
        area: "apply",
        gap: "Registration links come by email",
        saw: "The Contact page says \"Use the form to request a call or a registration link.\" The form is a Jotform on kaipodlearning.jotform.com.",
        impact: "A family ready to sign up has to wait for a link to come back before they can.",
        source: "EverRoot Academy, Contact",
        url: "https://www.everrootacademy.com/contact",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families register on the site when they're ready, and every inquiry and registration sits in one admin inbox.",
        },
      },
      {
        area: "tour",
        gap: "Discovery calls are booked through a form",
        saw: "The site says to \"use the contact form to schedule your discovery call today.\" The About page has a \"Speak to our founder\" heading with nothing under it.",
        impact: "Setting up a first call takes a form, a reply and some back and forth before anything is on the calendar.",
        source: "EverRoot Academy, Contact and About",
        url: "https://www.everrootacademy.com/contact",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick a discovery call time from the slots you open, and the call shows up on their inquiry.",
        },
      },
      {
        area: "pay",
        gap: "Discounts, proration and Step Up all stack",
        saw: "Families can combine founding-family (10% or 5%), sibling (10% each) and military (10%) discounts, prorate tuition for a mid-year start, and pay with Step Up funding. The site doesn't say how payments are split or scheduled.",
        impact: "Working out one family's bill can mean stacking up to four adjustments, then tracking what Step Up paid and what the family still owes.",
        source: "EverRoot Academy, About (Tuition, Discounts and ESA)",
        url: "https://www.everrootacademy.com/about",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["discounts", "third-party-payer-billing", "parent-billing", "autopay"],
          text: "We'd set up the sibling and military discounts to apply on their own, and each family's billing page would show the Step Up share and the family's share, with autopay for their part.",
        },
      },
      {
        area: "pay",
        gap: "3 Day add-ons are charged separately",
        saw: "On the 3 Day Plan, \"Tutoring, camps, and workshops scheduled outside of your chosen plan are excluded and will be charged separately.\" The site doesn't say how families sign up or pay for them.",
        impact: "Families on the 3 Day Plan can't see ahead how extras will be billed.",
        source: "EverRoot Academy, About (Tuition)",
        url: "https://www.everrootacademy.com/about",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "parent-billing"],
          text: "We'd set up camps, workshops and extra tutoring as sign-ups that land on the same family billing page as tuition.",
        },
      },
      {
        area: "website",
        gap: "Event and team sections are still from before opening",
        saw: "The Contact page says \"No current events to display\" next to three July Zoom sessions, the last marked \"Last event before we open in August!\". The About page has \"Upcoming Events\" and \"Meet our 3rd-5th Teacher\" headings with no event or name under them.",
        impact: "A family visiting now sees summer sessions they can't join and can't tell who would teach a 3rd–5th grader.",
        source: "EverRoot Academy, Contact and About",
        url: "https://www.everrootacademy.com/contact",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We keep events, teachers and openings current for you.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow to appear on a phone",
        saw: "Google PageSpeed gave the home page a mobile score of 49. The main content took about 6.5 seconds to appear, and the page loads about 3.2 MB.",
        impact: "A parent checking the site from a phone, perhaps mid-move, waits before seeing what EverRoot offers.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.everrootacademy.com%2F",
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
    shortSchoolName: "EverRoot",
    founder: {
      fullName: "Katelynn Stone",
      firstName: "Katelynn",
      role: "Founder and 6th–8th Teacher",
      source: "EverRoot Academy, About",
      url: "https://www.everrootacademy.com/about",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Katelynn's About page says she started EverRoot to expand access to high-quality education for mobile learners and students underserved or excluded by traditional systems, with a consistent program accessible from anywhere.",
        source: "EverRoot Academy, About",
        url: "https://www.everrootacademy.com/about",
        readOn: "2026-11-23",
      },
      {
        fact: "EverRoot ran Zoom demo days and parent workshops in July 2026, the last billed as the \"Last event before we open in August!\"",
        source: "EverRoot Academy, Contact",
        url: "https://www.everrootacademy.com/contact",
        readOn: "2026-11-23",
      },
    ],
    hook: "Katelynn's About page says she started EverRoot to expand access to high-quality education for mobile learners and students underserved or excluded by traditional systems, with a consistent program accessible from anywhere.",
    body: `Hi Katelynn,

I read about EverRoot on your site and loved why you started it, so kids who move often, or who don't fit traditional schools, can keep one consistent program wherever they are. And you opened this August, with a twelve-month year.

Congratulations on getting it off the ground. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for EverRoot.

I'd love to hear how your first few months have gone.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Katelynn, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "everroot-p8c4",
    checkBeforeMailing: [
      "Find a mailing address: the site gives only \"Crestview, Florida\" and an email address, with no street or mailing address. Don't use a home address; ask KaiPod or check a business filing for a mailing address.",
      "No podcast, interview or press about Katelynn turned up, so the letter opens on her founding story from the About page. Don't mention her family or the Air Force (both are on the page, but personal).",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about stacking discounts, proration and Step Up, then who's asking and one proof number",
      subject: "discounts at EverRoot",
      body: `Hi Katelynn,

I mailed you a handwritten note last week with a card for EverRoot.

I was reading your enrollment page. A military family with two kids could have the sibling, military and founding-family discounts, a prorated January start and Step Up funding all on one bill.

How do you work out what a family like that owes?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so Katelynn can see it without clicking around",
      body: `Hi Katelynn,

In case it's easier to see than describe, I set up a version of MudKitchen for EverRoot and recorded a 60-second walkthrough: an inquiry landing in your admin inbox, enrollment in one checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where EverRoot is, with no pitch",
      where: "Instagram (@everrootacademy, linked from the site) or LinkedIn",
      body: "Hi Katelynn, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. I like that EverRoot travels with families when they move.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Katelynn,

I also put together a one-page snapshot of what a family sees on your site today, from the first call to paying tuition. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Katelynn,

I'll leave it here so I'm not cluttering your inbox. The EverRoot version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the January starts.

Julius`,
    },
  ],
};
