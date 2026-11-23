import type { OutreachPlan } from "./types";

export const luffLearningOutreach: OutreachPlan = {
  slug: "luff-learning",
  schoolName: "Luff Learning Fine Arts Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Sarah",
    role: "Founder and teacher",
    source:
      "Parent testimonials on the lufflearning.org homepage name the teacher as Ms. Sarah / Miss Sarah, and the Stories posts are written by the founder. Her surname isn't on the site",
  },
  angle:
    "Re-contact with a snapshot: the homepage now leads with the Virtual Academy, but the menu pages families need (Tuition & Fees, FAQ, Contact) open \"page not found\"",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the Luff Learning MudKitchen demo",
  },
  facts: [
    {
      fact: "The homepage leads with Luff Learning Virtual Academy, a secular, inclusive virtual microschool for bright middle schoolers with ADHD (homepage last updated May 18, 2026)",
      source: "Luff Learning homepage",
      url: "https://lufflearning.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "The menu's About, Tuition & Fees, Calendar, FAQ and Contact links all return \"page not found\" (HTTP 404), as do the homepage cards for Artistic Evolution Program, Creative Cloudlets and Fine Arts Friday",
      source: "Luff Learning homepage menu",
      url: "https://lufflearning.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "Our Programs embeds a Sawyer class schedule (Luff Learning LLC) that showed no classes when opened; Sawyer's own Luff Learning schedule page redirects to Sawyer's general Explore page",
      source: "Luff Learning Our Programs",
      url: "https://lufflearning.org/programs/",
      readOn: "2026-11-22",
    },
    {
      fact: "The events calendar shows no upcoming events; the latest are the January 26, 2024 show (tickets $10 by Zelle or cash) and the January 30, 2024 open house",
      source: "Luff Learning Events",
      url: "https://lufflearning.org/events/list/",
      readOn: "2026-11-22",
    },
    {
      fact: "In-person classes meet at Plymouth United Church, 5927 Louetta Rd, Spring, TX",
      source: "Luff Learning open house event page",
      url: "https://lufflearning.org/event/luff-learnings-open-house-event/",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June (the first email says so).",
    "Confirm the founder's first name is Sarah (only \"Ms. Sarah\" in parent testimonials) and find her email; the CRM has no contact.",
    "Re-open lufflearning.org/programs/ in a normal browser: confirm the Sawyer class list is still empty and the menu pages still 404 before sending (the first email names both).",
    "Confirm Luff is still running classes: the homepage was updated in May 2026, but the calendar has nothing after January 2024 and the directory listing on thehomeschoolmom.com is gone (410).",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "LHwGrMS3hOV3tnp1amqu-g",
    preparedOn: "2026-12-01",
    summary:
      "We read lufflearning.org on Dec 1, 2026: the homepage, every link in its menu, Our Programs, the events calendar and the Stories posts.",
    pageSpeed: { mobileScore: 62, url: "https://lufflearning.org/", checkedOn: "2026-12-01" },
    toolStack: [
      { name: "Sawyer", usedFor: "Class schedule and registration", url: "https://lufflearning.org/programs/" },
      { name: "Zelle", usedFor: "Show tickets", url: "https://lufflearning.org/event/they-eat-sunshine-not-zebras/" },
    ],
    observations: [
      {
        area: "find",
        gap: "Tuition & Fees, FAQ and Contact open \"page not found\"",
        saw: "Five links in the menu (About, Tuition & Fees, Calendar, FAQ and Contact) and the Contact Us button all land on \"Oops! That page can't be found.\"",
        impact: "A family who likes the homepage can't see what Luff costs or how to reach you, except the email and phone in the footer.",
        source: "Luff Learning homepage menu",
        url: "https://lufflearning.org/",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build and keep up for you has every page in the menu live, with tuition, FAQ and contact written out.",
        },
      },
      {
        area: "find",
        gap: "The Virtual Academy has no page of its own",
        saw: "The homepage introduces Luff Learning Virtual Academy for middle schoolers with ADHD, but no page gives its schedule, price or how to join. The Our Programs button leads to an empty class list.",
        impact: "The program you lead with is the one families can learn the least about, so every interested parent has to write in first.",
        source: "Luff Learning homepage",
        url: "https://lufflearning.org/",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service", "online-application", "admissions-pipeline"],
          text: "Your demo lists the Virtual Academy with your other programs and an inquiry form, and every inquiry lands in one admin inbox for follow-up.",
        },
      },
      {
        area: "find",
        gap: "The class list on Our Programs comes up empty",
        saw: "Our Programs shows a Sawyer schedule frame with no classes in it, and the homepage cards for Artistic Evolution Program, Creative Cloudlets and Fine Arts Friday open \"page not found\".",
        impact: "Families can't see which classes run, on what days or for which ages, or sign up from the site.",
        source: "Luff Learning Our Programs",
        url: "https://lufflearning.org/programs/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity", "online-application"],
          text: "Each program gets its own page marked Open, Waitlist or Full, with sign-up on the same page.",
        },
      },
      {
        area: "tour",
        gap: "No way to book a visit",
        saw: "The last open house on the calendar was January 30, 2024, and its page says families who hadn't toured yet should come then. There's no tour booking anywhere else on the site.",
        impact: "A parent ready to visit has to email or call and wait for a reply before they can see the classroom.",
        source: "Luff Learning open house event",
        url: "https://lufflearning.org/event/luff-learnings-open-house-event/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a visit or a video call from the times you open, and get a reminder before it.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say what tuition is or how to pay it",
        saw: "With Tuition & Fees returning \"page not found\", the only prices on the site are $10 show tickets from January 2024, paid by Zelle or cash at the door.",
        impact: "Families can't plan for the cost before they write in, and payments that do happen arrive by hand, one family at a time.",
        source: "Luff Learning: They Eat Sunshine, Not Zebras",
        url: "https://lufflearning.org/event/they-eat-sunshine-not-zebras/",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "parent-plan-choice", "autopay", "card-and-ach"],
          text: "Families see tuition in their portal, choose monthly or upfront, and pay by card or bank with autopay.",
        },
      },
      {
        area: "updates",
        gap: "The events calendar stops in January 2024",
        saw: "Events says \"There are no upcoming events\" and lists shows and the open house from January 2024. The Calendar link in the menu opens \"page not found\".",
        impact: "Families can't tell whether Luff is running this year, and current parents have no one place to check dates.",
        source: "Luff Learning Events",
        url: "https://lufflearning.org/events/list/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "bulletin"],
          text: "A school calendar and announcements feed in the parent portal, so dates and news live in one place you update once.",
        },
      },
      {
        area: "website",
        gap: "The homepage takes over 6 seconds to load on a phone",
        saw: "Google PageSpeed scores the homepage 62 out of 100 on mobile, with the main content taking about 6.4 seconds to appear.",
        impact: "Parents searching on a phone may leave before the page finishes loading.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://lufflearning.org/",
        readOn: "2026-12-01",
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
    shortSchoolName: "Luff",
    founder: {
      fullName: "Sarah",
      firstName: "Sarah",
      role: "Founder and teacher",
      source: "Luff Learning homepage testimonials (\"Ms. Sarah\", \"Miss Sarah\"); her surname isn't published",
      url: "https://lufflearning.org/",
    },
    mailTo: {
      lines: ["Luff Learning", "c/o Plymouth United Church", "5927 Louetta Rd", "Spring, TX 77379"],
      source: "Luff Learning homepage footer; the open house event page names it as Plymouth United Church, where in-person classes met",
      url: "https://lufflearning.org/",
    },
    founderFacts: [
      {
        fact: "In her post \"Luxurious Learning: All Education Should Be Special Education\" (dated June 21, 2023), Luff's founder wrote that she left public-school teaching and started Luff believing all education should be special education, with never more than 10 students to one teacher.",
        source: "Luff Learning Stories, Luxurious Learning: All Education Should Be Special Education",
        url: "https://lufflearning.org/luxurious-learning-all-education-should-be-special-education/",
        readOn: "2026-11-22",
      },
      {
        fact: "The homepage now leads with Luff Learning Virtual Academy, a secular, inclusive virtual microschool for bright middle schoolers with ADHD.",
        source: "Luff Learning homepage",
        url: "https://lufflearning.org/",
        readOn: "2026-11-22",
      },
    ],
    hook: "In her post \"Luxurious Learning: All Education Should Be Special Education\" (dated June 21, 2023), Luff's founder wrote that she left public-school teaching and started Luff believing all education should be special education, with never more than 10 students to one teacher.",
    body: `Hi Sarah,

I read your post on why you started Luff. I liked the idea that all education should be special education, and your rule of never more than 10 students with one teacher.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock. We built MudKitchen from the start to run our enrollment and tuition, and it's a big part of how we grew. Now we offer it to other microschools too.

I'd like to hear how the Virtual Academy is going. A text is plenty.

Julius`,
    postscript: "The card inside has a version of Luff I set up, plus a parent's-eye look at your enrollment.",
    stickyNote: "Sarah, a note from a microschool in Round Rock. J",
    shortCode: "luff-byxe",
    checkBeforeMailing: [
      "Her surname isn't on the site: parents call her Ms. Sarah or Miss Sarah, and the Stories posts are signed \"admin\". The letter uses Sarah only; find her full name (Texas SOS filing for Luff Learning, LLC, the Facebook About tab or the Sawyer listing) before addressing the envelope.",
      "The hook post isn't signed by name; it's written by Luff's founder (\"I have started Luff\"). Confirm Sarah is the founder who wrote it.",
      "5927 Louetta Rd is Plymouth United Church, where in-person classes met. The program has moved online (the homepage leads with the Virtual Academy) and the events calendar stops in January 2024, so confirm Luff still gets mail there or find another address.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro: acknowledge the June email, give a new reason (the snapshot), one proof number",
      subject: "Luff's Tuition & Fees page",
      body: `Hi Sarah,

I mailed you a handwritten note last week with a card for Luff.

I wrote in June about a version of MudKitchen I set up for Luff. Since then I put together a one-page snapshot of what a family sees on your site today.

One thing stood out: the homepage now leads with the Virtual Academy, but Tuition & Fees, FAQ and Contact in the menu open "page not found", and the class list on Our Programs comes up empty.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Sarah,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Luff version: your programs with the Virtual Academy, what a parent sees for tuition, and your admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Facebook (LuffLearning) or Instagram (luff_learning, private account)",
      body: "Hi Sarah, I'm Julius. I run Sage Field, a microschool up in Round Rock. I enjoyed your Learning Curve posts on kids and boundaries.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Sarah,

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
      body: `Hi Sarah,

I'll leave it here so I'm not cluttering your inbox. The Luff version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the Virtual Academy.

Julius`,
    },
  ],
};
