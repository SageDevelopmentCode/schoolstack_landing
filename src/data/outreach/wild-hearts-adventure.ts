import type { OutreachPlan } from "./types";

export const wildHeartsAdventureOutreach: OutreachPlan = {
  slug: "wild-hearts-adventure",
  schoolName: "Wild Hearts Adventure Co.",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Cara",
    role: "Director of Operations",
    source: "Wild Hearts about page (Cara Weeks, Director of Operations)",
  },
  angle: "Re-contact with a snapshot: shop-checkout applications, charter funds and a shared Family Info password",
  priorContact: {
    when: "July",
    what: "A hand-sent first email with a link to the Wild Hearts MudKitchen demo",
  },
  facts: [
    {
      fact: "Main Program meets twice weekly, 9:30–2:30, at $350 a month, with a one-day option at $200 a month; applying is a shop product with Add to Cart and checkout",
      source: "Wild Hearts application",
      url: "https://wildheartsadventure.co/product/application/",
      readOn: "2026-11-22",
    },
    {
      fact: "Accepts charter school enrichment funds for tuition",
      source: "Wild Hearts homepage",
      url: "https://wildheartsadventure.co/",
      readOn: "2026-11-19",
    },
    {
      fact: "Application fee is $40 per student or $75 per family; core program meets twice weekly, late August to May",
      source: "Wild Hearts homepage",
      url: "https://wildheartsadventure.co/",
      readOn: "2026-11-19",
    },
    {
      fact: "Afternoon classes run weekly at $60 a month per class",
      source: "Wild Hearts afternoon class registration",
      url: "https://wildheartsadventure.co/product/afternoon-class-reg/",
      readOn: "2026-11-19",
    },
    {
      fact: "The Family Info page is password-protected",
      source: "Wild Hearts Family Info",
      url: "https://wildheartsadventure.co/family-info/",
      readOn: "2026-11-19",
    },
    {
      fact: "Projects include woodworking, cooking, mechanics and homesteading; Cara Weeks is Director of Operations",
      source: "Wild Hearts about page",
      url: "https://wildheartsadventure.co/about/",
      readOn: "2026-11-19",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in July (the first email says so).",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "We'd build: Monthly billing for clubs, after-care or add-on classes",
    "Confirm Rooted Meadows opened on MudKitchen before sending follow-up 2.",
    "If Cara replies, answer her yourself; logging her reply stops the sequence.",
  ],
  snapshot: {
    token: "VZhnWICb5flDSfQaDeziCQ",
    preparedOn: "2026-11-22",
    summary: "We read 60 pages of wildheartsadventure.co on Nov 22, 2026, including every enrollment and release form.",
    toolStack: [
      { name: "Shop checkout", usedFor: "Application fee, classes and other payments", url: "https://wildheartsadventure.co/product/application/" },
      { name: "Monthly invoices", usedFor: "Tuition, September to May", url: "https://wildheartsadventure.co/enrollment-form/" },
      { name: "Google Forms", usedFor: "Contact form", url: "https://wildheartsadventure.co/contact/" },
    ],
    observations: [
      {
        area: "find",
        gap: "Program options are a picture",
        saw: "The homepage and Program Options page show the programs as an image. Prices ($350 or $200 a month) only appear on the Application product page.",
        impact: "A parent on a phone, or searching for \"Visalia microschool price\", can't find what a program costs without starting an application.",
        source: "Wild Hearts Program Options",
        url: "https://wildheartsadventure.co/program-options/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "On the site we build for you, each program shows its days, hours and monthly price as text.",
        },
      },
      {
        area: "tour",
        gap: "No way to book a visit",
        saw: "There's no visit booking on the site. Families use the contact form, email or phone. The address also differs between pages (Avenue 296 and Ave 298).",
        impact: "Interested families have to wait for a reply to see the program, and may head to the wrong address.",
        source: "Wild Hearts Contact",
        url: "https://wildheartsadventure.co/contact/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families book a visit from the times you open, with the address and a reminder in their confirmation.",
        },
      },
      {
        area: "apply",
        gap: "Applying works like a shop checkout",
        saw: "Families fill in the application, add it to the cart for each child, use coupon codes for family pricing, then pay the $40 or $75 fee. Status comes by email within 2 weeks.",
        impact: "Families with two or more children repeat the steps and hunt for the right code, and you match payments to applications yourself.",
        source: "Wild Hearts Application",
        url: "https://wildheartsadventure.co/product/application/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["online-application", "application-fee", "admissions-pipeline"],
          text: "One application covers every child, takes the family fee automatically, and lands in your admin inbox with its status.",
        },
      },
      {
        area: "enroll",
        gap: "Up to five forms after applying, one link goes nowhere",
        saw: "After applying, families fill in the Enrollment form (5 steps) or the True North form, a Release form, a Cell Phone agreement and a Learner Details form. The Learner Details link returns a 404.",
        impact: "Families can't finish enrolling without emailing you, and you check five places to see who's done.",
        source: "Wild Hearts Registration Forms",
        url: "https://wildheartsadventure.co/registration-forms/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements"],
          text: "Every form, release and agreement sits in one checklist per child, signed online, with your view of who still has steps left.",
        },
      },
      {
        area: "pay",
        gap: "Monthly invoices with two different late-fee dates",
        saw: "Tuition is 8 monthly invoices (September to May, no December), due the last day of the month before. The late fee is $30 after the 15th on one form and after the 10th on the True North form.",
        impact: "Families aren't sure when a payment is late, and you send and chase eight invoices per family each year.",
        source: "Wild Hearts Enrollment Form",
        url: "https://wildheartsadventure.co/enrollment-form/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "autopay", "card-and-ach"],
          text: "Each month is charged by autopay from the family's card or bank, and they see every invoice and receipt in one place.",
        },
      },
      {
        area: "pay",
        gap: "Charter funds and family payments are tracked apart",
        saw: "Families can pay with Heartland, Monarch River, Yosemite Valley or ERCLC funds, and anything the charter doesn't cover is the family's to pay. The list of charters differs across pages.",
        impact: "Each family's bill is split between a charter and the family, and both sides are reconciled by hand.",
        source: "Wild Hearts Enrollment Form",
        url: "https://wildheartsadventure.co/enrollment-form/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing"],
          text: "We'd set up billing that records each charter's share per family, so families only see and pay their part.",
        },
      },
      {
        area: "updates",
        gap: "One shared password and last year's calendar",
        saw: "Family Info is behind one password for everyone, and the Calendar page shows four images of the 2025–2026 calendar.",
        impact: "Families can't look up 2026–27 dates, and the shared password can't be taken back from a family who leaves.",
        source: "Wild Hearts Calendar",
        url: "https://wildheartsadventure.co/calendar/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["parent-portal", "calendar", "mobile-app"],
          text: "Each family gets their own login to the parent portal and app, with this year's calendar inside.",
        },
      },
      {
        area: "website",
        gap: "Afternoon classes show a start date that's passed",
        saw: "The afternoon class page says \"Classes begin Thursday, Sept. 3rd!\" and lists $60 a month per class, while the product price shows $0.00.",
        impact: "Parents can't tell if they can still join or what they'll be charged, and each class is billed outside tuition.",
        source: "Wild Hearts Afternoon Classes",
        url: "https://wildheartsadventure.co/product/afternoon-class-reg/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "class-billing"],
          text: "Class pages stay current, and we'd set up monthly class billing on the same account as tuition.",
        },
      },
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro: acknowledge the July email, give a new reason (the snapshot), one proof number",
      subject: "Wild Hearts family snapshot",
      body: `Hi Cara,

I wrote in July about a version of MudKitchen I set up for Wild Hearts. Since then I put together a one-page snapshot of what a family sees on your site today: the application checkout, paying with charter funds, and the Family Info password.

I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Cara,

In case it's easier than clicking around, here's a 60-second look at the Wild Hearts version. Each family logs in to their own parent portal instead of sharing one password.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello on Facebook, with no pitch",
      where: "Facebook (facebook.com/WildHeartsAdventureCo)",
      body: "Hi Cara, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. The woodworking and homesteading projects at Wild Hearts look great.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Cara,

Here's the snapshot, no reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 farm school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo stays up",
      body: `Hi Cara,

I'll stop here so I'm not crowding your inbox. The Wild Hearts version and the snapshot stay up if they're ever useful. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
