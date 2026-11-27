import type { OutreachPlan } from "./types";

export const rootsAndWingsMicroschoolOutreach: OutreachPlan = {
  slug: "roots-and-wings-microschool",
  schoolName: "Roots and Wings Microschool",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Julie",
    role: "Founder and teacher",
    source:
      "Roots and Wings home page (\"Hi, my name is Julie.\", the state-certified teacher who started the microschool) and the FAQ, written by her in the first person; the header links \"Julie on LinkedIn\"",
  },
  angle:
    "One real question: tuition runs on an emailed invoice each quarter that families pay from their ESA in ClassWallet. How does she keep track of whose payment has come through?",
  facts: [
    {
      fact: "Once a child is accepted, Julie emails the family an invoice; in ClassWallet they choose RAWM as the school. Tuition is $1,375 per quarter, paid in advance, and partial quarters are prorated",
      source: "Roots and Wings FAQs",
      url: "https://rootsandwingsmicroschool.com/faq",
      readOn: "2026-11-22",
    },
    {
      fact: "Tuition is described as covered by the Arizona Empowerment Scholarship Account (ESA); the How We Work page asks families to sign up for ESA, connect it to RAWM and pay tuition each quarter through their ESA funds",
      source: "Roots and Wings How We Work Together page",
      url: "https://rootsandwingsmicroschool.com/summary",
      readOn: "2026-11-22",
    },
    {
      fact: "A class of no more than ten students in North Mesa, taught by a teacher Arizona certified as a \"Highly Qualified Teacher\"; school runs Monday through Thursday, 7:45 AM to 1:45 PM",
      source: "Roots and Wings FAQs and home page",
      url: "https://rootsandwingsmicroschool.com/faq",
      readOn: "2026-11-22",
    },
    {
      fact: "By the end of the microschool's first year, the whole group had moved forward an average of three grades in reading and math",
      source: "Roots and Wings home page",
      url: "https://rootsandwingsmicroschool.com/",
      readOn: "2026-11-22",
    },
    {
      fact: "Four field trips a year: Julie covers student entry fees, families drive (carpooling encouraged) and the trips need at least one adult for every four children",
      source: "Roots and Wings FAQs",
      url: "https://rootsandwingsmicroschool.com/faq",
      readOn: "2026-11-22",
    },
    {
      fact: "A referral program pays a $100, $250 or $350 gift card (the last with a WorldMark weekend getaway) once tuition is received, and runs until the school is full",
      source: "Roots and Wings Referral Program",
      url: "https://rootsandwingsmicroschool.com/referral",
      readOn: "2026-11-22",
    },
    {
      fact: "The menu's Parent Login links to ClassDojo's home page; the Contact page has a form (name, email, subject, message) and the thank-you page says \"I'll be in touch soon\"",
      source: "Roots and Wings Contact page",
      url: "https://rootsandwingsmicroschool.com/contact",
      readOn: "2026-11-22",
    },
    {
      fact: "Listed in Raising Arizona Kids' microschool directory under North Mesa",
      source: "Raising Arizona Kids microschools directory",
      url: "https://www.raisingarizonakids.com/microschools/",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Julie is named on the home page as the founder and teacher; her last name appears only in the LinkedIn link, and the site shows no email address (contact form only). Find her address in the CRM or elsewhere before sending.",
    "The demo website shows older details than her site today: K–2 at 11:45 AM–3:45 PM and Grades 3–8 at 7:45–11:45 AM, \"K–2 slots currently available\" and K–8. The current FAQ gives one schedule (Mon–Thu 7:45 AM–1:45 PM) and names no grades. Decide whether to update the demo before recording the Loom.",
    "The demo's admin and parent views use generic data; check the tuition shown in the parent billing tab against $1,375 a quarter before recording the Loom.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). Confirm we'd set up quarterly invoices tracked against each family's ESA payment in ClassWallet. ClassWallet itself stays (it's how Arizona ESA pays schools); don't pitch replacing it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "BAwH57qjF3DJxoGKNwDVEA",
    preparedOn: "2026-11-22",
    summary:
      "We read every page of rootsandwingsmicroschool.com on Nov 22, 2026: the home page, How We Work, FAQs, Reviews, the Referral Program and the contact form.",
    pageSpeed: { mobileScore: 97, url: "https://rootsandwingsmicroschool.com/", checkedOn: "2026-11-22" },
    toolStack: [
      { name: "Contact form", usedFor: "First message about a child", url: "https://rootsandwingsmicroschool.com/contact" },
      { name: "Emailed invoice", usedFor: "Quarterly tuition invoice", url: "https://rootsandwingsmicroschool.com/faq" },
      { name: "ClassDojo", usedFor: "Parent Login and updates", url: "https://rootsandwingsmicroschool.com/" },
    ],
    observations: [
      {
        area: "pay",
        gap: "Each quarter's tuition starts with an emailed invoice",
        saw: "The FAQ says that once a child is accepted, Julie emails an invoice and the family chooses RAWM in ClassWallet. Tuition is $1,375 a quarter, paid in advance, with partial quarters prorated. The \"How much does it cost?\" answer says ESA covers tuition; the amount is in the next answer.",
        impact: "Every quarter means a new invoice per family to send and then see paid, and the referral gift cards wait on that tuition arriving.",
        source: "Roots and Wings FAQs",
        url: "https://rootsandwingsmicroschool.com/faq",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "late-fees-reminders"],
          text: "We'd set up quarterly invoices that go out on their own, with each family's ESA payment marked against them, and a billing page where families see what's paid and what's due.",
        },
      },
      {
        area: "find",
        gap: "The site doesn't say which grades or ages Julie teaches",
        saw: "The home page and FAQ describe a class of no more than ten in North Mesa, a certified teacher and a Monday–Thursday schedule. No page names the grades or ages the school takes, or how many of the ten seats are open; the banner says \"Now accepting inquiries\".",
        impact: "A parent has to write in to learn whether their child's grade fits and whether there's room.",
        source: "Roots and Wings FAQs",
        url: "https://rootsandwingsmicroschool.com/faq",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "The site we build names the grades you take and shows Open, Waitlist or Full from the same program families enroll into, so it stays current as seats fill.",
        },
      },
      {
        area: "tour",
        gap: "Meeting Julie starts with a general contact form",
        saw: "The home page ends with \"I'd love to meet your child and talk with you.\" The way to do that is the Contact form (name, email, subject, message), and the thank-you page says \"I'll be in touch soon.\" There's no way to pick a time to meet or visit.",
        impact: "Setting up the first conversation takes a few emails back and forth, and a family waits to hear back before anything is on the calendar.",
        source: "Roots and Wings Contact page",
        url: "https://rootsandwingsmicroschool.com/contact",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a time to meet you or visit from slots you open, with a reminder before it.",
        },
      },
      {
        area: "apply",
        gap: "\"Accepted\" has no steps a family can see",
        saw: "The FAQ says \"Once your child is accepted, I'll email you an invoice\", but no page says how a child is accepted: there's no application, assessment step or timeline.",
        impact: "Families don't know what follows their first message or how long a decision takes.",
        source: "Roots and Wings FAQs",
        url: "https://rootsandwingsmicroschool.com/faq",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families start from a form on your site, and each one lands in your admin inbox with its stage, from first message to accepted.",
        },
      },
      {
        area: "enroll",
        gap: "The site doesn't list what families fill in or sign",
        saw: "After acceptance the FAQ moves straight to the invoice. No page mentions an enrollment agreement, health or pickup details, or permission for the four field trips.",
        impact: "Families can't see ahead of time what they'll be asked to fill in and sign before their child starts.",
        source: "Roots and Wings How We Work Together page",
        url: "https://rootsandwingsmicroschool.com/summary",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements"],
          text: "Accepted families get one checklist with the agreement signed online and each form filled in, with reminders until it's done.",
        },
      },
      {
        area: "updates",
        gap: "Field trips need drivers and adults, with no dates or sign-up",
        saw: "The FAQ says there are four field trips a year, families handle transportation (carpooling encouraged) and each trip needs at least one adult for every four children. The site has no school calendar or trip dates.",
        impact: "Each trip needs enough drivers and adults lined up by message, and families can't plan around dates they can't see.",
        source: "Roots and Wings FAQs",
        url: "https://rootsandwingsmicroschool.com/faq",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "committees"],
          text: "Trip dates sit on a school calendar in each family's login, with a sign-up for drivers and chaperones so you can see the one-adult-per-four ratio is covered.",
        },
      },
      {
        area: "updates",
        gap: "Parent Login opens ClassDojo's front page",
        saw: "The Parent Login button in the menu links to home.classdojo.com, a separate app with its own login. Invoices come by email and tuition is paid in ClassWallet.",
        impact: "Families check three places: ClassDojo for updates, email for invoices and ClassWallet to pay.",
        source: "Roots and Wings home page",
        url: "https://rootsandwingsmicroschool.com/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["parent-portal", "messaging", "photos", "mobile-app"],
          text: "One login on the web and the iPhone app holds messages, class photos and each family's tuition, next to their enrollment forms.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Roots and Wings",
    founder: {
      fullName: "Julie",
      firstName: "Julie",
      role: "Founder and teacher",
      source: "Roots and Wings home page (\"Hi, my name is Julie.\", the certified teacher who started the microschool) and FAQ, written in the first person",
      url: "https://rootsandwingsmicroschool.com/",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "On the Roots and Wings home page, Julie writes that she kept pondering a small-class, or microschool, model: personalized tutoring when a child needs it, plus group instruction and conversation, \"just like the little red schoolhouse of old.\"",
        source: "Roots and Wings Microschool home page",
        url: "https://rootsandwingsmicroschool.com/",
        readOn: "2026-11-22",
      },
      {
        fact: "Julie writes that in the school's first year some kids were five grades behind, and by the end of that year the whole group had moved forward an average of three grades in reading and math.",
        source: "Roots and Wings Microschool home page",
        url: "https://rootsandwingsmicroschool.com/",
        readOn: "2026-11-22",
      },
      {
        fact: "The FAQ says Julie keeps the class to ten students, Monday through Thursday, 7:45 AM to 1:45 PM, with tuition paid through Arizona's ESA in ClassWallet.",
        source: "Roots and Wings Microschool FAQ",
        url: "https://rootsandwingsmicroschool.com/faq",
        readOn: "2026-11-22",
      },
    ],
    hook: "On the Roots and Wings home page, Julie writes that she kept pondering a small-class, or microschool, model: personalized tutoring when a child needs it, plus group instruction and conversation, \"just like the little red schoolhouse of old.\"",
    body: `Hi Julie,

I read your story on the Roots and Wings site and loved the way you describe the school, tutoring when a child needs it plus group conversation, like the little red schoolhouse of old.

That's the kind of school we love hearing about. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Roots and Wings.

I'd love to hear how you settled on keeping it to ten students.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Julie, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "roots-l040",
    checkBeforeMailing: [
      "Find a mailing address: the FAQ says the school is a small school in Julie's home in North Mesa, and the site publishes no address (the Contact page is a form only), so nothing is stored. No PO box or business address found. Lead: ask Julie for a mailing address.",
      "Julie's last name isn't on the site (only a LinkedIn link in the header), so the letter uses her first name and doesn't draw on LinkedIn. Address the envelope to Julie, Roots and Wings Microschool.",
      "No podcast or interview found; the hook is her own story on the home page.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about her quarterly ESA invoices, then who's asking and one proof number",
      subject: "ESA tuition at Roots and Wings",
      body: `Hi Julie,

I mailed you a handwritten note last week with a card for Roots and Wings.

I was reading your FAQ. Once a child is accepted, you email the family an invoice, they choose RAWM in ClassWallet, and tuition is $1,375 a quarter, paid in advance and prorated.

With up to ten families paying that way, how do you keep track of whose ESA payment has come through each quarter?

I ask because I run Sage Field, a microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so she can see it without clicking around",
      body: `Hi Julie,

In case it's easier to see than describe, I set up a version of MudKitchen for Roots and Wings and recorded a 60-second walkthrough: a family's first message landing in your admin inbox, the enrollment checklist after you accept them, and the page they'd pay each quarter from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Julie is, with no pitch",
      where: "LinkedIn (linked from the Roots and Wings header)",
      body: "Hi Julie, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Loved reading that your first group moved up an average of three grades in a year.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Julie,

I also put together a one-page snapshot of what a family sees on your site today, from the first message to paying each quarter. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Julie,

I'll leave it here so I'm not cluttering your inbox. The Roots and Wings version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the school year.

Julius`,
    },
  ],
};
