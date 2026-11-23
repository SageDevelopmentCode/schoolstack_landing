import type { OutreachPlan } from "./types";

export const springRiverSchoolOutreach: OutreachPlan = {
  slug: "spring-river-school",
  schoolName: "Spring River School",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Carrie",
    role: "Program Development Director",
    source:
      "Spring River Meet Our Staff page (Carrie Zarka Dooley, Program Development Director, leads the High School, Two-Day and Summer Camp programs); also Vice President on the Board of Directors page",
  },
  angle: "Re-contact with a snapshot: one enrichment class billed two ways (FACTS and QuickBooks), plus Step Up",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the Spring River MudKitchen demo",
  },
  facts: [
    {
      fact: "Kitchen to Market (Grades 6–8, $150 per three-week session) registers through a Google Form. Current Spring River families can be billed through FACTS; homeschool-community families are invoiced through QuickBooks; Step Up funds may be used",
      source: "Spring River Middle School Enrichment",
      url: "https://www.springriverschool.org/enrichment",
      readOn: "2026-11-22",
    },
    {
      fact: "FACTS manages tuition payments, enrollment and financial assistance. Spring River is a Step Up For Students direct provider; a 5% deposit and a $160 per-family registration fee apply",
      source: "Spring River 2026-27 K-12 Tuition & Fees",
      url: "https://www.springriverschool.org/tuitionandfees2026-27",
      readOn: "2026-11-22",
    },
    {
      fact: "Five admissions steps: inquiry, a required tour or Open House, application with a $50 fee in the FACTS Family Portal, a student trial visit, then an emailed enrollment invitation with the $160 fee",
      source: "Spring River Admissions",
      url: "https://www.springriverschool.org/copy-of-admissions-process",
      readOn: "2026-11-22",
    },
    {
      fact: "Summer camp is $325 a week for new families, $295 for enrolled families and $275 for staff families, with a $10 weekly sibling discount; Step Up can be used",
      source: "Spring River Summer Camp 2026",
      url: "https://www.springriverschool.org/summercamp2026",
      readOn: "2026-11-22",
    },
    {
      fact: "A School Tour booking page offers open times (a 10:00 am slot on Nov 24, 2026)",
      source: "Spring River School Tour booking",
      url: "https://www.springriverschool.org/booking-calendar/school-tour",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June (the first email says so), and who it went to.",
    "Confirm Carrie is the right person: she leads program development; Tammy Gordon (Administrative Coordinator) runs scheduling and communication systems.",
    "Uses FACTS for applications, tuition payments and financial aid: decide whether to pitch replacing it or working alongside it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Monthly billing for clubs, after-care or add-on classes",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
  ],
  snapshot: {
    token: "dguhHruvW7Mk5lHzy8jW-Q",
    preparedOn: "2026-12-01",
    summary:
      "We read 60 pages of springriverschool.org on Dec 1, 2026, from Admissions and Tuition & Fees to the camp, enrichment and Open House pages.",
    toolStack: [
      { name: "FACTS", usedFor: "Inquiry, application, fees and tuition payments", url: "https://www.springriverschool.org/copy-of-admissions-process" },
      { name: "Wix Bookings", usedFor: "School tour booking", url: "https://www.springriverschool.org/booking-calendar/school-tour" },
      { name: "SignUpGenius", usedFor: "Open House sign-up", url: "https://www.springriverschool.org/open-house-registration" },
      { name: "Google Forms", usedFor: "Camp and enrichment registration", url: "https://www.springriverschool.org/summercamp2026" },
      { name: "QuickBooks invoices", usedFor: "Enrichment invoices for homeschool-community families", url: "https://www.springriverschool.org/enrichment" },
    ],
    observations: [
      {
        area: "find",
        gap: "Tuition sits in a table you scroll sideways on a phone",
        saw: "The Tuition & Fees page says phone users need to scroll through the table to see all rates. The rates are in an embedded table, not the page text, and it lists the 2-Day program for Grades 1–6 while its own page says Grades 1–5.",
        impact: "A parent on a phone can miss a column of prices, and a search for the 2-Day price won't find it.",
        source: "Spring River 2026-27 K-12 Tuition & Fees",
        url: "https://www.springriverschool.org/tuitionandfees2026-27",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you puts each program's grades, days and tuition on its own page as text that reads on a phone, so every page agrees.",
        },
      },
      {
        area: "tour",
        gap: "The tour booking page isn't linked from Admissions",
        saw: "Admissions says a tour is required and invites families to schedule a weekday morning tour, but it links only to the inquiry and application. A School Tour page with open times exists; we couldn't find a link to it from Admissions or the home page.",
        impact: "Families who could pick a time themselves email or call instead, and wait for a reply.",
        source: "Spring River Admissions",
        url: "https://www.springriverschool.org/copy-of-admissions-process",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Admissions links straight to your open tour times, families get a reminder, and each booking lands next to their inquiry.",
        },
      },
      {
        area: "apply",
        gap: "Camp and enrichment sign-ups ask for a Google sign-in",
        saw: "The Register buttons for Summer Camp, Winter Camp and Kitchen to Market open Google Forms that send you to a Google sign-in page first. Camp has three weekly prices plus a $10 sibling discount, and the page doesn't say how payment is taken after the form.",
        impact: "A family without a Google account stops at the sign-in, and you work out each family's price and discount by hand.",
        source: "Spring River Summer Camp 2026",
        url: "https://www.springriverschool.org/summercamp2026",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "discounts", "card-and-ach"],
          text: "We'd set up camp and class sign-up on your site with no account needed, the right weekly price and sibling discount applied, and payment by card or bank.",
        },
      },
      {
        area: "pay",
        gap: "One enrichment class is billed two different ways",
        saw: "Kitchen to Market is $150 per session. Spring River families can be billed through FACTS, homeschool-community families get a QuickBooks invoice, and Step Up funds may be used. A spot is confirmed once payment arrangements are received.",
        impact: "Payments for one class sit in two systems plus Step Up, and families outside the school wait on an invoice before their child's spot is confirmed.",
        source: "Spring River Middle School Enrichment",
        url: "https://www.springriverschool.org/enrichment",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "parent-billing", "card-and-ach"],
          text: "We'd set up enrichment billing so every family, enrolled or not, pays in one place when they sign up, and you see one list of who has paid.",
        },
      },
      {
        area: "pay",
        gap: "Step Up families can't see what they still owe",
        saw: "Spring River is a Step Up For Students direct provider and FACTS runs tuition payments and plans. The site doesn't say how a Step Up payment is applied to a family's FACTS balance, or what the family pays on top.",
        impact: "A Step Up family can't see their own share, and you match scholarship payments to each family's plan by hand.",
        source: "Spring River 2026-27 K-12 Tuition & Fees",
        url: "https://www.springriverschool.org/tuitionandfees2026-27",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing"],
          text: "We'd set up billing so the Step Up portion is recorded against each family and they only see and pay what's left.",
        },
      },
      {
        area: "website",
        gap: "Several pages still show last year's dates",
        saw: "Open House lists January dates and says new applications open February 20, 2026. Camp Offerings lists Winter Break Camp on Dec 18–23, 2025. The 2-Day page offers spots for spring 2026, \"Current Year\".",
        impact: "A family planning for next year can't tell when the next Open House is, or whether winter camp runs this December.",
        source: "Spring River Open House Registration",
        url: "https://www.springriverschool.org/open-house-registration",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "We keep your site current for you, and each program and camp shows Open, Waitlist, Full or Closed from one place.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Spring River",
    founder: {
      fullName: "Carrie Zarka Dooley",
      firstName: "Carrie",
      role: "Program Development Director (JEC), named among Spring River's founding parents, teachers and supporters",
      source: "Spring River, K-8 Staff and Faculty and History of Spring River",
      url: "https://www.springriverschool.org/meet-our-teachers",
    },
    mailTo: {
      lines: ["51 Pine Street", "Atlantic Beach, FL 32233"],
      source: "Spring River, About High School (\"Location: 51 Pine Street, Atlantic Beach\"; the home page calls Pine Street the administrative home and high school campus)",
      url: "https://www.springriverschool.org/abouthighschool",
    },
    founderFacts: [
      {
        fact: "Spring River's History page lists Carrie Zarka Dooley among the founding parents, teachers and supporters, and says the school began in 2014 as a circle of friends gathering in local parks and now serves over 180 students.",
        source: "History of Spring River",
        url: "https://www.springriverschool.org/about-spring-river",
        readOn: "2026-11-22",
      },
      {
        fact: "Spring River's History page says that after a decade of growing in borrowed spaces, the school is ready to take root, with a Root Down, Rise Up campaign to secure land for a permanent home (details \"coming soon\").",
        source: "History of Spring River",
        url: "https://www.springriverschool.org/about-spring-river",
        readOn: "2026-11-22",
      },
      {
        fact: "Carrie joined Spring River's leadership team in 2021 and, as Program Development Director, leads the High School, Two-Day and Summer Camp programs; she also teaches Culinary Arts in the High School.",
        source: "Spring River, K-8 Staff and Faculty",
        url: "https://www.springriverschool.org/meet-our-teachers",
        readOn: "2026-11-22",
      },
      {
        fact: "Spring River moved all its classes outdoors in 2020, when rental space became severely limited.",
        source: "Voyage Jacksonville, Exploring Life & Business with Spring River School (December 21, 2021)",
        url: "https://voyagejacksonville.com/interview/exploring-life-business-with-spring-river-school-of-spring-river-school/",
        readOn: "2026-11-22",
      },
    ],
    hook: "Spring River's History page lists Carrie Zarka Dooley among the founding parents, teachers and supporters, and says the school began in 2014 as a circle of friends gathering in local parks and now serves over 180 students.",
    body: `Hi Carrie,

I read the history of Spring River on your site. I liked that it began in 2014 as friends meeting in local parks, with you among the founding parents, and that after a decade in borrowed spaces you're looking for land of your own.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Spring River.

I'd like to hear how the search for land is going.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your admissions and camp sign-ups.",
    stickyNote: "Carrie, a note from an outdoor microschool in Texas. J",
    shortCode: "springriver-neno",
    checkBeforeMailing: [
      "The site gives 51 Pine Street, Atlantic Beach with no ZIP; 32233 comes from the Duval County record for 51 Pine St (LoopNet). Confirm it with the USPS lookup.",
      "The \"Help Us with Our New Home\" appeal says the administrative hub is moving to Sonrise Community Church on Levy Road in West Atlantic Beach, while the home page still says Pine Street. Check which is current before mailing.",
      "Carrie is one of a dozen founding parents and teachers and now Program Development Director, not the sole founder; the letter says \"among the founding parents\".",
      "Check whether the Root Down, Rise Up land campaign has launched (the History page says details are coming soon).",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the June email, one detail from the snapshot, one proof number",
      subject: "Kitchen to Market billing",
      body: `Hi Carrie,

I mailed you a handwritten note last week with a card for Spring River. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in June) and a one-page snapshot of what a family sees on your site today, from the tuition table to camp sign-ups.

One thing stood out: for Kitchen to Market, Spring River families are billed through FACTS and other homeschool families get a QuickBooks invoice, with Step Up on top.

I run Sage Field, a microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Carrie,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Spring River version: your 4-Day, 2-Day and Forest School pathways, the application, and what a parent sees for tuition.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Instagram or Facebook (springriverjax)",
      body: "Hi Carrie, I'm Julius. I run Sage Field, a microschool in Round Rock, TX. Kitchen to Market ending at a real Sunday market is a lovely idea.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Carrie,

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
      body: `Hi Carrie,

I'll leave it here so I'm not cluttering your inbox. The Spring River version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the school year.

Julius`,
    },
  ],
};
