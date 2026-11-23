import type { OutreachPlan } from "./types";

export const journeyAcademyOutreach: OutreachPlan = {
  slug: "journey-academy",
  schoolName: "Journey Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Andie",
    role: "School contact (the home page's \"Send us an email\" goes to Andie; Journey Life Center names Andie Davidson as a leader)",
    source: "Journey Academy home page (\"Send us an email\" link) and Journey Life Center home page (\"Under the leadership of Andie Davidson\")",
  },
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the Journey Academy MudKitchen demo",
  },
  angle:
    "Re-contact with the Family experience snapshot: the Enrollment Fee button opens a Journey Life Center giving form titled for 2026–27, while the Apply page is already enrolling for fall 2027, and applying takes several separate forms and documents.",
  facts: [
    {
      fact: "Journey Academy is an Acton Academy affiliate in Littleton with five multi-age studios (Sparks 4–7 through Launch Pad 14–18), open 8:30–3:30 Monday–Wednesday, September to May, meeting at Journey Life Center",
      source: "Journey Academy home page and FAQ",
      url: "https://journeyacademycolorado.com/faq/",
      readOn: "2026-11-23",
    },
    {
      fact: "Tuition is $7,000 a year per learner, or 10 payments of $700, plus a $500 non-refundable registration fee; all studios are currently full and applying joins the waitlist",
      source: "Journey Academy, FAQ",
      url: "https://journeyacademycolorado.com/faq/",
      readOn: "2026-11-23",
    },
    {
      fact: "The application asks families to watch Jeff Sandefer's TED talk and the virtual tour, read the info kit, the contracts document and Courage to Grow, schedule a visit, complete the Hero Application, respond to the Parent-Owner Contract on a separate form, schedule parent and hero interviews, then pay the enrollment fee; it mentions \"limited spots for fall of 2027\"",
      source: "Journey Academy, Apply",
      url: "https://journeyacademycolorado.com/apply/",
      readOn: "2026-11-23",
    },
    {
      fact: "The site's Enrollment Fee link opens a GivingTools page headed \"Journey Life Center - Giving Form\" for the \"Journey Academy Enrollment & Supply Fee 2026-27\" ($500 per learner)",
      source: "Journey Academy home page and the GivingTools form",
      url: "https://givingtools.com/give/3546/5827",
      readOn: "2026-11-23",
    },
    {
      fact: "A page titled \"Form Test\" is public on the site",
      source: "Journey Academy, Form Test",
      url: "https://journeyacademycolorado.com/form-test/",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June (the first email says so).",
    "Andie's exact role at Journey Academy isn't stated (the site's email link goes to Andie, and Journey Life Center names Andie Davidson as a leader). Confirm before sending, or ask who handles enrollment.",
    "Worth telling them privately, outside the snapshot: dozens of \"/family/<surname>-family/\" pages from the parent directory are in the public sitemap and open without logging in (they show only the family surname). The plan doesn't mention it.",
    "We'd build: An ordered waitlist with automatic offers. All studios are full and applying joins the waitlist.",
    "Colorado has no state ESA, so the plan leaves funding out.",
    "Instagram and Facebook are linked from the site footer.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "AdU7B9MFOPGgoHjVFDKyLQ",
    preparedOn: "2026-11-23",
    summary:
      "We read 60 pages of journeyacademycolorado.com on Nov 23, 2026, plus the application steps, the FAQ and the enrollment fee form.",
    pageSpeed: { mobileScore: 65, url: "https://journeyacademycolorado.com/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Website forms",
        usedFor: "Hero Application and Parent-Owner Contract",
        url: "https://journeyacademycolorado.com/apply/",
      },
      {
        name: "GivingTools",
        usedFor: "Enrollment and supply fee",
        url: "https://givingtools.com/give/3546/5827",
      },
      {
        name: "Downloads (info kit, contracts document)",
        usedFor: "Required reading before applying",
        url: "https://journeyacademycolorado.com/apply/",
      },
    ],
    observations: [
      {
        area: "apply",
        gap: "Applying takes many separate steps and forms",
        saw: "Families watch two videos, read the info kit, the contracts document and a book, schedule a visit, complete the Hero Application, then respond to the Parent-Owner Contract on a separate form and schedule two interviews.",
        impact: "A family works through the list on their own and can't see which steps the school has already received.",
        source: "Journey Academy, Apply",
        url: "https://journeyacademycolorado.com/apply/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["online-application", "forms-documents", "admissions-pipeline"],
          text: "One application with each step as a checklist item (reading confirmed, contract answered, interviews booked), and every family's progress in one admin inbox.",
        },
      },
      {
        area: "pay",
        gap: "The enrollment fee is paid on a giving form",
        saw: "The Enrollment Fee button opens a GivingTools page headed \"Journey Life Center - Giving Form\", for the \"Enrollment & Supply Fee 2026-27\". The Apply page is enrolling for fall 2027.",
        impact: "A family paying to secure a spot does it on a donation form under another name, labelled for last year.",
        source: "Journey Academy home page and the GivingTools form",
        url: "https://givingtools.com/give/3546/5827",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-fees", "enrollment-checklist"],
          text: "The $500 fee paid inside the family's enrollment checklist, for the right school year, with a receipt.",
        },
      },
      {
        area: "find",
        gap: "Whether there's space isn't clear",
        saw: "The FAQ says all studios are currently full and applying joins the waitlist. The Apply page says there are \"limited spots for fall of 2027.\"",
        impact: "A family can't tell whether they're applying for a spot or for the waitlist, or which studio has room.",
        source: "Journey Academy, FAQ and Apply",
        url: "https://journeyacademycolorado.com/faq/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "waitlist-queue"],
          text: "Each studio shows Open, Waitlist or Full, and we'd set up a waitlist that offers a freed spot to the next family in order.",
        },
      },
      {
        area: "website",
        gap: "A test page is public",
        saw: "A page titled \"Form Test\", with a test version of a form, is public on the site.",
        impact: "A family who lands on it from a search sees a half-built form.",
        source: "Journey Academy, Form Test",
        url: "https://journeyacademycolorado.com/form-test/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, so test pages stay private.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 65 out of 100 on mobile. The main content takes about 13 seconds to appear, and the page is about 4.5 MB.",
        impact: "A parent opening the site on a phone may leave before they see anything about Journey.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://journeyacademycolorado.com/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with photos and video sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Journey",
    founder: {
      fullName: "Andie Davidson",
      firstName: "Andie",
      role: "School contact",
      source: "Journey Academy home page (\"Send us an email\") and Journey Life Center",
      url: "https://journeyacademycolorado.com/",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Journey Academy's FAQ says it runs five Acton studios, from Sparks (4–7) to Launch Pad (14–18), at $7,000 a year, and its Apply page asks families to watch the TED talk and read Courage to Grow before applying.",
        source: "Journey Academy, FAQ and Apply",
        url: "https://journeyacademycolorado.com/faq/",
        readOn: "2026-11-23",
      },
    ],
    hook: "Journey Academy's FAQ says it runs five Acton studios, from Sparks (4–7) to Launch Pad (14–18), at $7,000 a year, and its Apply page asks families to watch the TED talk and read Courage to Grow before applying.",
    body: `Hi Andie,

I read your FAQ and Apply pages. Journey runs five Acton studios, from Sparks to Launch Pad, at $7,000 a year, and asks families to watch the TED talk and read Courage to Grow before they apply.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Journey.

I'd like to hear how you keep tuition that affordable.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Andie, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "journey-v5m1",
    checkBeforeMailing: [
      "Find a mailing address: the site lists none; it says the school meets at Journey Life Center in Littleton. Acton Academy's campus listing gives S Carr Ct, Littleton; confirm on a map that it's Journey Life Center's building, not a home, before using it.",
      "Andie's title at Journey isn't on the site; no founder is named. The letter opens on the school's own FAQ and Apply pages.",
      "Possible better hook: Apple Podcasts lists \"Journey Academy Adventures\" (episodes from Sept 2025, e.g. \"Colorado Historical Heroes\"), which looks like the school's learner podcast. Listen to confirm it's theirs before using it.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the June email, the enrollment fee form detail, one proof number, offer the snapshot",
      subject: "Journey's enrollment fee form",
      body: `Hi Andie,

I mailed you a handwritten note last week with a card for Journey. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in June) and a one-page snapshot of what a family sees on your site today.

One thing stood out: the Enrollment Fee button opens a Journey Life Center giving form for 2026–27, while the Apply page is already enrolling for fall 2027.

I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Andie,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Journey version: an application landing in your admin inbox, the contracts and fee in one checklist, and the 10-payment billing page.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Journey is, with no pitch",
      where: "Instagram (journeyacademycolorado) or Facebook, both linked from the site footer",
      body: "Hi Andie, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. No evening homework so family time stays free is a rule I like.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Andie,

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
      body: `Hi Andie,

I'll leave it here so I'm not cluttering your inbox. The Journey version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the next Exhibition.

Julius`,
    },
  ],
};
