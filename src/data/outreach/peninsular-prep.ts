import type { OutreachPlan } from "./types";

export const peninsularPrepOutreach: OutreachPlan = {
  slug: "peninsular-prep",
  schoolName: "Peninsular Prep",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Angela",
    role: "Founder & Director (Angela Kral)",
    source: "Peninsular Prep Leadership Team page (\"Angela Kral, Founder & Director\") and the history on Mission, Vision & Values",
  },
  angle:
    "One real question: Pen Prep takes FES-EO as direct pay but UA and PEP as reimbursement, with tuition in 10 monthly installments. How do UA and PEP families get what they need to claim their payments back from Step Up?",
  facts: [
    {
      fact: "Founder Angela Kral opened her home to a small learning pod during the pandemic; it became South Tampa Microschool and, with the Middle Division, Peninsular Prep",
      source: "Peninsular Prep, Mission, Vision, & Values (Peninsular Prep's History)",
      url: "https://www.peninsularprep.com/mission-vision-values",
      readOn: "2026-11-23",
    },
    {
      fact: "Pen Prep accepts the EO, UA and PEP scholarships: EO as direct pay, UA and PEP as reimbursement; tuition payment plans are divided into 10 monthly installments",
      source: "Peninsular Prep, FAQs and Financial Aid",
      url: "https://www.peninsularprep.com/faqs",
      readOn: "2026-11-23",
    },
    {
      fact: "2026–27 tuition is $12,500 for K–5 and $14,000 for grades 6–8, plus a $900 new-student or $635 returning enrollment fee and an annual FACTS fee of $35 per sibling",
      source: "Peninsular Prep, Tuition & Fees",
      url: "https://www.peninsularprep.com/tuition-fees",
      readOn: "2026-11-23",
    },
    {
      fact: "Application process: inquiry form (FACTS), then a link to the Tour and Open House calendar, then the online application with a $175 fee (open through January 31, 2027 for 2027–28), an interview and mini shadow, and admission notifications by the end of February with an enrollment packet",
      source: "Peninsular Prep, Apply",
      url: "https://www.peninsularprep.com/apply",
      readOn: "2026-11-23",
    },
    {
      fact: "After School Enrichments, break camps, game nights and immersions for non-Pen Prep students are registered on Homeroom; the header's Family Portal goes to FACTS",
      source: "Peninsular Prep home page and its Homeroom site",
      url: "https://www.homeroom.com/sites/peninsular-prep-tampa/camp",
      readOn: "2026-11-23",
    },
    {
      fact: "The FAQ's links to the ethics and teacher hiring policies (stmicroschool.com PDFs) redirect to the Peninsular Prep home page, and the Financial Aid page's Foundation button opens stm-foundation.org, which says \"This site is currently private\"",
      source: "Peninsular Prep, FAQs and Financial Aid",
      url: "https://www.peninsularprep.com/financial-aid",
      readOn: "2026-11-23",
    },
    {
      fact: "The Elementary page says \"For the 2025-2026 school year, we have just 90 students enrolled\" and the Middle page says \"less than 50 Middle Division students enrolled for the 2025-2026 school year\"",
      source: "Peninsular Prep, Elementary Division and Middle Division",
      url: "https://www.peninsularprep.com/elementary",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Pen Prep is larger than our usual school (about 140 students, K–8, 15+ teachers) and already runs FACTS for inquiries, applications, the family portal and billing, plus Homeroom for camps and after-school. MudKitchen would be replacing an SIS here; decide whether that's worth pitching before sending.",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). Here it's Step Up (FES-EO direct pay, UA and PEP reimbursement); MudKitchen works alongside Step Up and doesn't replace it.",
    "We'd build: Monthly billing for clubs, after-care or add-on classes. Homeroom handles this well for them today; only pitch it as part of one login.",
    "Instagram (peninsular_prep) and Facebook (peninsularprep) are linked from the site footer.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "qCvsozYQE463zNeiFAc4jg",
    preparedOn: "2026-11-23",
    summary:
      "We read all 17 pages of peninsularprep.com on Nov 23, 2026, plus the inquiry form, the Homeroom camp and enrichment pages and every linked policy file.",
    pageSpeed: { mobileScore: 68, url: "https://www.peninsularprep.com/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "FACTS (RenWeb)",
        usedFor: "Inquiry form, application and Family Portal",
        url: "https://www.peninsularprep.com/apply",
      },
      {
        name: "Homeroom",
        usedFor: "After School Enrichments, camps, game nights and immersions",
        url: "https://www.peninsularprep.com/summercamp",
      },
    ],
    observations: [
      {
        area: "pay",
        gap: "UA and PEP families pay first, then claim it back",
        saw: "The FAQ says Pen Prep accepts EO as direct pay but UA and PEP as reimbursement. Tuition is $12,500 or $14,000 in 10 monthly installments.",
        impact: "A UA or PEP family pays each installment themselves, and the site doesn't say how they get the paperwork to claim it back from Step Up.",
        source: "Peninsular Prep, FAQs and Financial Aid",
        url: "https://www.peninsularprep.com/faqs",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "tuition-rate-plans"],
          text: "We'd set up each family's billing to show what Step Up pays directly and what they pay, with an invoice and receipt for every installment they can submit for reimbursement.",
        },
      },
      {
        area: "tour",
        gap: "Tour dates arrive only after an inquiry",
        saw: "Step 2 says that after submitting the inquiry form, \"you will receive a link to our Tour and Open House calendar.\" No tour or open house dates are on the site.",
        impact: "A family deciding whether to visit can't see when tours or open houses happen until they inquire and wait for the link.",
        source: "Peninsular Prep, Apply",
        url: "https://www.peninsularprep.com/apply",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "calendar"],
          text: "School-day tours and evening open houses show on the site, and families book a slot straight from the page.",
        },
      },
      {
        area: "website",
        gap: "The policy links lead back to the home page",
        saw: "The FAQ links \"here\" for the ethics, misconduct and child abuse reporting policies and for teacher hiring practices. Both links go to stmicroschool.com files that now redirect to the Peninsular Prep home page.",
        impact: "A parent looking for those policies lands on the home page instead of the document.",
        source: "Peninsular Prep, FAQs",
        url: "https://www.peninsularprep.com/faqs",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with policies hosted on it and every link checked.",
        },
      },
      {
        area: "find",
        gap: "The foundation's scholarship site is private",
        saw: "The Financial Aid page's Pen Prep Foundation button opens stm-foundation.org, which says \"This site is currently private.\" The Foundation page says the 2027–28 scholarship application opens in January.",
        impact: "A family looking for help bridging tuition and the state scholarship reaches a locked page.",
        source: "Peninsular Prep, Financial Aid and Foundation",
        url: "https://www.peninsularprep.com/financial-aid",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "forms-documents"],
          text: "We'd put the scholarship details and application on your own site, as an online form families fill in when it opens.",
        },
      },
      {
        area: "updates",
        gap: "School and activities use two logins",
        saw: "The header's Family Portal goes to FACTS. After School Enrichments, break camps, game nights and immersions are registered and paid for on Homeroom, with its own cart and login.",
        impact: "Families keep two accounts, one for school and one for activities, each with its own payments.",
        source: "Peninsular Prep home page and its Homeroom site",
        url: "https://www.homeroom.com/sites/peninsular-prep-tampa/camp",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["parent-portal", "class-billing", "parent-billing"],
          text: "One family login for tuition, after-school blocks and camps, with every charge on the same billing page.",
        },
      },
      {
        area: "website",
        gap: "Fast facts still describe last year",
        saw: "The Elementary page says \"For the 2025-2026 school year, we have just 90 students enrolled,\" and the Middle page says \"less than 50 Middle Division students enrolled for the 2025-2026 school year.\"",
        impact: "Parents comparing schools for 2027–28 see last year's numbers.",
        source: "Peninsular Prep, Elementary Division and Middle Division",
        url: "https://www.peninsularprep.com/elementary",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We keep the site's copy current for you each school year.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 68 out of 100 on mobile, and the main content takes about 11 seconds to appear.",
        impact: "A parent opening the site on a phone waits several seconds before seeing anything about the school.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://www.peninsularprep.com/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with photos sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Pen Prep",
    founder: {
      fullName: "Angela Kral",
      firstName: "Angela",
      role: "Founder & Director",
      source: "Peninsular Prep, Leadership Team",
      url: "https://www.peninsularprep.com/leadership",
    },
    mailTo: {
      lines: ["Angela Kral", "Peninsular Prep", "4002 S Coolidge Avenue", "Tampa, FL 33611"],
      source: "Peninsular Prep footer and Contact page (\"4002 S. Coolidge Avenue, Tampa, FL 33611\")",
      url: "https://www.peninsularprep.com/contact",
    },
    founderFacts: [
      {
        fact: "On Conversations with GIPR (January 16, 2025), Angela talked about launching a learning pod in 2020 that became South Tampa Microschool by 2021 and Peninsular Prep @ STM by 2024, and the challenges of her new role as a tenant of a fairly large space in Tampa.",
        source: "Conversations with GIPR, \"Angela Kral, Owner & Director\" (Apple Podcasts episode description)",
        url: "https://podcasts.apple.com/us/podcast/conversations-with-gipr-angela-kral-owner-director/id1676375094?i=1000684283889",
        readOn: "2026-11-23",
      },
      {
        fact: "Peninsular Prep's history says Angela opened her home to a small group of friends as a learning pod during the pandemic, and that pod became South Tampa Microschool and then Peninsular Prep.",
        source: "Peninsular Prep, Mission, Vision, & Values",
        url: "https://www.peninsularprep.com/mission-vision-values",
        readOn: "2026-11-23",
      },
      {
        fact: "Peninsular Prep's Elementary Division reported 90 students for 2025–26, and the Middle Division just under 50.",
        source: "Peninsular Prep, Elementary Division and Middle Division",
        url: "https://www.peninsularprep.com/elementary",
        readOn: "2026-11-23",
      },
    ],
    hook: "On Conversations with GIPR (January 16, 2025), Angela talked about launching a learning pod in 2020 that became South Tampa Microschool by 2021 and Peninsular Prep @ STM by 2024, and the challenges of her new role as a tenant of a fairly large space in Tampa.",
    body: `Hi Angela,

I found your Conversations with GIPR episode. You went from a learning pod in 2020 to South Tampa Microschool in 2021, and now Peninsular Prep runs K–8 from a much bigger space on Coolidge Avenue.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Pen Prep.

I'd like to hear how the move into a bigger space has gone.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Angela, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "penprep-r5d8",
    checkBeforeMailing: [
      "The address is the school's campus from the footer and Contact page.",
      "Listen to the Conversations with GIPR episode (January 16, 2025) before mailing. The letter uses only the episode description; it leaves out the part about her daughter.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about Step Up reimbursement on monthly installments, then who's asking and one proof number",
      subject: "UA reimbursement at Pen Prep",
      body: `Hi Angela,

I mailed you a handwritten note last week with a card for Pen Prep.

Your FAQ says Pen Prep takes FES-EO as direct pay but UA and PEP as reimbursement, and tuition runs in 10 monthly installments.

How do those UA and PEP families get the receipts they need to claim each payment back from Step Up?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Angela,

In case it's easier to see than describe, I set up a version of MudKitchen for Pen Prep and recorded a 60-second walkthrough: an inquiry landing in your admin inbox, the enrollment checklist, and the billing page a scholarship family would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Pen Prep is, with no pitch",
      where: "Instagram (@peninsular_prep) or Facebook (peninsularprep), both linked from the site",
      body: "Hi Angela, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. I like that archery and agriculture are part of the Mariner week.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Angela,

I also put together a one-page snapshot of what a family sees on your site today, from the first inquiry to paying tuition. A couple of the FAQ's policy links now land on the home page. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Angela,

I'll leave it here so I'm not cluttering your inbox. The Pen Prep version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with 2027–28 admissions.

Julius`,
    },
  ],
};
