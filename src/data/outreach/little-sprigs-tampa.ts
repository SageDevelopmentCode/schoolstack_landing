import type { OutreachPlan } from "./types";

export const littleSprigsTampaOutreach: OutreachPlan = {
  slug: "little-sprigs-tampa",
  schoolName: "Little Sprigs of Tampa",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Charlene",
    role: "Founder and lead teacher",
    source:
      "The Homeschool Village Team page (Charlene Favorite, Iyawo Esu: founder and lead teacher, The Homeschool Village & Little Sprigs of Tampa); the Microschool Florida directory also names her as school leader",
  },
  angle:
    "One real question: the school now accepts Step Up for Students, and families pay $850 monthly tuition and fees through a Donorbox page. How is a Step Up family's share tracked?",
  facts: [
    {
      fact: "The Homeschool Village is enrolling ages 7–14 for 2026–2027: $850 monthly tuition, an $850 deposit, a $400 registration fee for new students, plus a $325 Learning Enrichment Fee and a $75 Facility Fee each semester; it says \"We now accept Step Up for Students! Ask us how this works.\"",
      source: "The Homeschool Village Admissions page",
      url: "https://littlesprigsoftampa.org/admissions/",
      readOn: "2026-11-22",
    },
    {
      fact: "The Payments page sends families to a Donorbox page (\"Little Sprigs of Tampa Homeschool Village\", with a Donate button) to make monthly payments and pay registration fees",
      source: "The Homeschool Village Payments page",
      url: "https://littlesprigsoftampa.org/payments/",
      readOn: "2026-11-22",
    },
    {
      fact: "Step 1 of the application is an Omella inquiry form whose address families copy and paste into the browser; the form's required Enrollment Year question offers only \"2024-25 School Year\"",
      source: "The Homeschool Village Admissions page and Omella inquiry form",
      url: "https://littlesprigsoftampa.org/admissions/",
      readOn: "2026-11-22",
    },
    {
      fact: "The Homeschool Village calls itself Florida's first African-centered microschool, with small learning pods of 12–15 students, garden-to-table learning and forest-school-inspired outdoor labs",
      source: "The Homeschool Village About page",
      url: "https://littlesprigsoftampa.org/about/",
      readOn: "2026-11-22",
    },
    {
      fact: "Children garden through the year, bake bread from scratch and eat meals family style; the home page shows a sample weekly menu",
      source: "The Homeschool Village home page",
      url: "https://littlesprigsoftampa.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "Ancestral Echoes Session Two ran July 6 to August 7, 2026 for ages 7–14 at $50 a week per child; families registered on a Google Form and Omella emailed them for payment",
      source: "Ancestral Echoes Summer Program 2026 Google Form (linked from the home page)",
      url: "https://littlesprigsoftampa.org/",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "The school on the site is The Homeschool Village; Little Sprigs of Tampa is its twice-monthly family meetup group. The emails say The Homeschool Village. The demo is framed around Little Sprigs meetups (hero, form and CTAs): decide whether to reframe it around the microschool before recording the Loom.",
    "The demo says the microschool serves ages 5–11 (from the 2024 Location page); the Admissions page now says ages 7–14 for 2026–27. Check the demo before recording the Loom.",
    "The demo's admin and parent views use generic data; check the tuition shown matches $850 a month before recording the Loom.",
    "Charlene Favorite is the only person named as running the school (Team page). Confirm the CRM address reaches her.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "HOgf5pmnp0kJzObWKPCjdg",
    preparedOn: "2026-11-22",
    summary:
      "We read 24 pages of littlesprigsoftampa.org on Nov 22, 2026, plus the Omella inquiry form, the Donorbox payment page and the Ancestral Echoes summer form.",
    pageSpeed: { mobileScore: 85, url: "https://littlesprigsoftampa.org/", checkedOn: "2026-11-22" },
    toolStack: [
      { name: "Omella", usedFor: "Microschool inquiry form and summer program payments", url: "https://littlesprigsoftampa.org/admissions/" },
      { name: "Donorbox", usedFor: "Monthly tuition and registration fees", url: "https://littlesprigsoftampa.org/payments/" },
      { name: "Google Forms", usedFor: "Ancestral Echoes summer program sign-up", url: "https://littlesprigsoftampa.org/" },
    ],
    observations: [
      {
        area: "find",
        gap: "The Tuition page says \"Email us for current prices\"",
        saw: "The Admissions page lists $850 a month, the $400 registration fee and the semester fees for 2026–27. The separate Tuition page shows each option with \"Email us for current prices\" and \"Add a description here\", and its dates have no year: a first day of 9/5, where Admissions says Tuesday, September 8, 2026.",
        impact: "A family that lands on the Tuition page first emails to ask a price that's already on the site, and sees two different first days.",
        source: "The Homeschool Village Tuition page",
        url: "https://littlesprigsoftampa.org/tuition/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "tuition-rate-plans"],
          text: "The site we build shows tuition, fees and the school year's dates in one place, from the same plans families are billed with, so there's one set of numbers to keep current.",
        },
      },
      {
        area: "apply",
        gap: "The Apply Now button opens an empty tab",
        saw: "Every page has an Apply Now button in the header. It points to \"page:1633818507777\" rather than a page, and clicking it opens a blank tab. The way in is the Admissions menu item instead.",
        impact: "A family ready to apply from the home page hits a dead end and has to find the Admissions page on their own.",
        source: "The Homeschool Village home page",
        url: "https://littlesprigsoftampa.org/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service", "online-application"],
          text: "Every button on the site we build leads to your inquiry form, which sits on the page itself.",
        },
      },
      {
        area: "apply",
        gap: "The inquiry form is a link to copy, and only offers 2024-25",
        saw: "Step 1 on the Admissions page asks families to copy and paste an Omella address into their browser; it isn't a link. On the form, Enrollment Year is required and its only choice is \"2024-25 School Year\", while the page says you're enrolling for 2026–2027.",
        impact: "Families applying for this year have to pick a year two years back, and the team has to work out which year each inquiry is really for.",
        source: "The Homeschool Village Admissions page and Omella inquiry form",
        url: "https://littlesprigsoftampa.org/admissions/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "The inquiry form lives on your site with this year's options and lands in your admin inbox the moment it's sent, with each family's stage from interview to shadow day.",
        },
      },
      {
        area: "enroll",
        gap: "The enrollment steps don't say how the contract and forms come back",
        saw: "The Admissions page goes from step 3 to step 5. After approval you send an enrollment contract, with the registration fee and $850 deposit due then, and step 7 says school forms are \"Due in August 2025 to begin in September\". It doesn't say how the contract or forms are returned.",
        impact: "Each new family asks how to send the contract, forms and fees, and someone tracks who's done what before the first day.",
        source: "The Homeschool Village Admissions page",
        url: "https://littlesprigsoftampa.org/admissions/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Approved families get one checklist: the contract signed online, the $400 registration fee and deposit paid, and the school forms filled in, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "Tuition is paid on a Donorbox donation page",
        saw: "The Payments page sends families to a Donorbox page titled \"Little Sprigs of Tampa Homeschool Village\" with a Donate button, for monthly payments and registration fees. It shows no amounts, due dates or student names.",
        impact: "Families work out what's due each month ($850, plus $325 and $75 at each semester), and the office matches each donation to a student and a month.",
        source: "The Homeschool Village Payments page",
        url: "https://littlesprigsoftampa.org/payments/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "card-and-ach", "autopay"],
          text: "Each family sees what's due and what's paid in their portal, pays tuition and semester fees by card or bank, and can turn on autopay.",
        },
      },
      {
        area: "pay",
        gap: "Step Up is \"Ask us how this works\"",
        saw: "The Admissions page says \"We now accept Step Up for Students! Ask us how this works.\" It doesn't say what the scholarship covers or how a family's share is paid.",
        impact: "Every scholarship family needs a conversation to learn what they'll owe, and their payments sit on the same donation page as everyone else's.",
        source: "The Homeschool Village Admissions page",
        url: "https://littlesprigsoftampa.org/admissions/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing that shows what Step Up covers and what the family owes on each bill, so you see at a glance which families are fully paid.",
        },
      },
      {
        area: "updates",
        gap: "The Events page is empty; meetups live on Facebook",
        saw: "Events is in the main menu but the page has no events. The Little Sprigs page says the group meets twice a month and to follow the Facebook page for meetups; the Tuition page's important dates have no year.",
        impact: "Families who aren't on Facebook can't see what's coming up, and enrolled families have no single place for the school's dates.",
        source: "The Homeschool Village Events page",
        url: "https://littlesprigsoftampa.org/events-2/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "bulletin", "parent-portal"],
          text: "One school calendar and announcements feed in each family's login, with meetups, festivals and weeks off in one place.",
        },
      },
      {
        area: "website",
        gap: "Template pages from the site builder are still live",
        saw: "A second Contact Us page lists \"123 Main Street, New York\" and a placeholder email, and Our Story and Our Services still hold the builder's sample text. The Location page says ages 5–11 while Admissions says 7–14, and Semester 2 fees are listed as due January 1, 2026.",
        impact: "A family who finds one of these pages in a search sees sample text, and the ages and dates disagree from page to page.",
        source: "The Homeschool Village Contact Us page (template)",
        url: "https://littlesprigsoftampa.org/contact-us-2/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build has only the pages you use, and we keep ages, dates and prices current. Yours scores 85 on Google PageSpeed on a phone; we'd keep it quick.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Homeschool Village",
    founder: {
      fullName: "Charlene Favorite",
      firstName: "Charlene",
      role: "Founder and lead teacher",
      source: "The Homeschool Village Team page (\"Founder and lead teacher, The Homeschool Village & Little Sprigs of Tampa\")",
      url: "https://littlesprigsoftampa.org/team/",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "On the Team page, Charlene Favorite, founder and lead teacher, writes that she is honored to be the founder of Florida's first and only African-centered microschool, a milestone she cherishes every day.",
        source: "The Homeschool Village Team page",
        url: "https://littlesprigsoftampa.org/team/",
        readOn: "2026-11-22",
      },
      {
        fact: "The Homeschool Village calls itself Florida's first African-centered microschool, with small learning pods of 12–15 students, garden-to-table exploration and forest-school-inspired outdoor learning labs.",
        source: "The Homeschool Village About page",
        url: "https://littlesprigsoftampa.org/about/",
        readOn: "2026-11-22",
      },
      {
        fact: "Classes meet in the woods of Scout Park in Temple Terrace.",
        source: "The Homeschool Village Location page",
        url: "https://littlesprigsoftampa.org/location/",
        readOn: "2026-11-22",
      },
    ],
    hook: "On the Team page, Charlene Favorite, founder and lead teacher, writes that she is honored to be the founder of Florida's first and only African-centered microschool, a milestone she cherishes every day.",
    body: `Hi Charlene,

I read on your Team page that you founded Florida's first and only African-centered microschool, and that you're its lead teacher too.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our enrollment and tuition, and it's a big part of how we grew. Now we offer it to other microschools too.

I'd like to hear how this school year is going out in the woods at Scout Park. A text is plenty.

Julius`,
    postscript: "The card inside has a version of The Homeschool Village I set up, plus a parent's-eye look at your enrollment.",
    stickyNote: "Charlene, a note from a small school in Round Rock, Texas. J",
    shortCode: "village-nz2j",
    checkBeforeMailing: [
      "Find a mailing address: littlesprigsoftampa.org (home, About, Team, Location, Admissions, Payments, Contact) has no business mailing address. The street address in the footer and Location contact block looks like a home; don't use it. The Contact page's New York address is template placeholder text. Classes meet in the woods of Scout Park, Temple Terrace, which can't take mail. Non-home leads: ask Charlene for a mailing address or PO box, or check the school's Step Up for Students listing.",
      "The Location page may date from 2024 (it says ages 5–11; Admissions now says 7–14). Confirm classes still meet at Scout Park, or drop \"out in the woods at Scout Park\" from the ask.",
      "The letter and card say The Homeschool Village; Little Sprigs of Tampa is its family meetup group. The demo the card opens is framed around Little Sprigs meetups: check it before mailing.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about how Step Up families pay, then who's asking and why",
      subject: "Step Up at The Homeschool Village",
      body: `Hi Charlene,

I mailed you a handwritten note last week with a card for The Homeschool Village.

Your admissions page lists $850 a month for 2026–27, plus $325 and $75 each semester, and says you now accept Step Up for Students. The payments page sends families to a Donorbox page for tuition and registration fees.

Do Step Up families pay through that same page, or is their share tracked some other way?

I ask because I run Sage Field, a microschool in Round Rock, TX, and billing like that is why I built MudKitchen, the software we run it on.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Charlene,

I set up a version of MudKitchen for The Homeschool Village and recorded a 60-second walkthrough: a family's inquiry landing in your admin, the enrollment checklist with the contract and registration fee, and the page where they pay tuition.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Facebook (the Little Sprigs of Tampa page, named on the Little Sprigs page of their site)",
      body: "Hi Charlene, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Loved reading that your kids bake bread from scratch and eat family style.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Sage Field and Rooted Meadows proof",
      body: `Hi Charlene,

I also put together a one-page snapshot of what a family sees on your site today, from the inquiry form to paying tuition. No reply needed:

{snapshot link}

For context, Sage Field went from 0 to 35 students in under 3 months on MudKitchen, and Rooted Meadows, a K–8 school in Idaho, opened on it this August.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Charlene,

I'll leave it here so I'm not cluttering your inbox. The Homeschool Village version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the 2026–27 year in the garden.

Julius`,
    },
  ],
};
