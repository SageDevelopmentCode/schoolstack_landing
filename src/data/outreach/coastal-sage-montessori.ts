import type { OutreachPlan } from "./types";

export const coastalSageMontessoriOutreach: OutreachPlan = {
  slug: "coastal-sage-montessori",
  schoolName: "Coastal Sage Montessori",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Signe",
    role: "Founder and Head of School (Signe Castañeda), also the admissions contact",
    source: "Coastal Sage Montessori Faculty & Staff page (\"Signe Castañeda, Head of School & Lead Elementary Guide\") and How to Apply (Director of Admissions contact)",
  },
  angle:
    "One real question: families can book a Tuesday or Thursday tour online, but tuition only comes after filling in a form, and the application waits until after the tour. Do most families ask about tuition before they visit, or at the tour?",
  facts: [
    {
      fact: "The Tuition and Fees page says \"Tuition varies by program. Complete this form to receive instant access to tuition rates for your child\"; no prices are on the page",
      source: "Coastal Sage Montessori, Tuition and Fees",
      url: "https://www.coastalsage.org/admission/montessori-school-tuition-fees",
      readOn: "2026-11-22",
    },
    {
      fact: "How to Apply: contact the Director of Admissions by phone or email, schedule a tour (Tuesday and Thursday mornings, adults only), then \"After your tour, you'll be invited to complete a short application\" and an interview",
      source: "Coastal Sage Montessori, How to Apply",
      url: "https://www.coastalsage.org/admission/how-to-apply",
      readOn: "2026-11-22",
    },
    {
      fact: "The school held a Ribbon Cutting Ceremony & Open House on Thursday, August 20th to \"officially open the doors to our brand-new school building\" at the St. Michael's By-the-Sea campus, 2775 Carlsbad Blvd.",
      source: "Coastal Sage Montessori, Ribbon Cutting Ceremony & Open House",
      url: "https://www.coastalsage.org/ribbon-cutting-ceremony-open-house",
      readOn: "2026-11-22",
    },
    {
      fact: "Coastal Sage is a Christian Montessori school for ages 3 to 15 with a high school program; Primary runs five days a week with an optional three-day program for 3-year-olds; there is a 5% sibling discount",
      source: "Coastal Sage Montessori home page, Primary page and Admission FAQs",
      url: "https://www.coastalsage.org/admission/faqs",
      readOn: "2026-11-22",
    },
    {
      fact: "On every page the header shows a \"Get in touch\" phone number, but the call link behind it dials a different number; the Info Session page lists a third",
      source: "Coastal Sage Montessori site header (page HTML)",
      url: "https://www.coastalsage.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "The CSM Family Events page is password-protected; the 2026–2027 school calendar is a downloadable PDF",
      source: "Coastal Sage Montessori, CSM Family Events and Calendar",
      url: "https://www.coastalsage.org/calendar",
      readOn: "2026-11-22",
    },
    {
      fact: "Google PageSpeed gave the home page a mobile score of 48; the page loads about 19.5 MB",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.coastalsage.org%2F",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "The CRM row is named \"Carlsbad Coastal Learning\" but its website is coastalsage.org (Coastal Sage Montessori). Confirm it's the same school, and consider renaming the CRM row.",
    "The site is built by Nido Marketing (\"Powered by Nido Marketing\") and its forms and tour booking run on LeadConnector (GoHighLevel). Their agency may own the website and lead follow-up, so lead with enrollment, tuition and the parent side, with the website as optional.",
    "Coastal Sage offers need-based financial aid with an annual application. MudKitchen doesn't assess financial need, so don't pitch replacing that part.",
    "Instagram (@coastalsagemontessori) and Facebook are linked from the site but weren't opened; check one is active before the social step.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "gZsvysb5uWOssOJNpt9vPw",
    preparedOn: "2026-11-22",
    summary:
      "We read 60 pages of coastalsage.org on Nov 22, 2026, plus the tour booking, tuition and event forms.",
    pageSpeed: { mobileScore: 48, url: "https://www.coastalsage.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "LeadConnector booking",
        usedFor: "Booking a school tour",
        url: "https://www.coastalsage.org/admission/schedule-tour",
      },
      {
        name: "LeadConnector forms",
        usedFor: "Tuition request, interest list and contact form",
        url: "https://www.coastalsage.org/admission/montessori-school-tuition-fees",
      },
      {
        name: "Google Forms",
        usedFor: "RSVPs for info sessions, the ribbon cutting and family events",
        url: "https://www.coastalsage.org/open-housed47ae108",
      },
      {
        name: "Zelle",
        usedFor: "Harvest Gathering Dinner payment",
        url: "https://www.coastalsage.org/harvest-dinner",
      },
      {
        name: "PDF calendar",
        usedFor: "2026–2027 school calendar",
        url: "https://www.coastalsage.org/calendar",
      },
    ],
    observations: [
      {
        area: "find",
        gap: "Tuition is only sent after a form",
        saw: "The Tuition and Fees page says \"Tuition varies by program. Complete this form to receive instant access to tuition rates for your child.\" No prices are on the page or the program pages.",
        impact: "A parent comparing schools has to hand over their details before they can see whether Coastal Sage fits their budget, and some will move on instead.",
        source: "Coastal Sage Montessori, Tuition and Fees",
        url: "https://www.coastalsage.org/admission/montessori-school-tuition-fees",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service", "admissions-pipeline"],
          text: "We'd show each program's tuition on the site, and families who still have questions land in the same admin inbox as tours and applications.",
        },
      },
      {
        area: "apply",
        gap: "Applying starts with a call or email",
        saw: "How to Apply says step one is to contact the Director of Admissions by phone or email, then tour. \"After your tour, you'll be invited to complete a short application,\" followed by an interview.",
        impact: "A family who's ready after the tour waits for the application to reach them before they can take the next step.",
        source: "Coastal Sage Montessori, How to Apply",
        url: "https://www.coastalsage.org/admission/how-to-apply",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families start the short application from the site when they're ready, and each family moves from inquiry to tour, interview and decision in one admin inbox.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say how tuition is paid",
        saw: "The Admission FAQs mention a 5% sibling discount, and Financial Aid explains need-based grants. Nothing on the site says when tuition is due, whether it can be paid monthly, or how.",
        impact: "Families can't plan the year's payments until they ask.",
        source: "Coastal Sage Montessori, Admission FAQs and Financial Aid",
        url: "https://www.coastalsage.org/admission/faqs",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families choose a payment plan, set up autopay by card or bank, and see every invoice on their own billing page.",
        },
      },
      {
        area: "updates",
        gap: "Family events sit behind a shared password",
        saw: "The CSM Family Events page asks for a password. The 2026–2027 school calendar is a PDF to download from the Calendar page.",
        impact: "Parents need the password to hand and a fresh copy of the PDF each time dates change.",
        source: "Coastal Sage Montessori, CSM Family Events and Calendar",
        url: "https://www.coastalsage.org/csm-family-events",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal", "mobile-app"],
          text: "School dates and family events live on one calendar in each family's own login, on the web and the iPhone app.",
        },
      },
      {
        area: "updates",
        gap: "Event RSVPs and payments use three different tools",
        saw: "Info sessions, Grandparent's Day, Back to School Surf Night and the ribbon cutting each ask families to register on a Google Form. The Harvest Gathering Dinner uses a separate form, with a Zelle QR code as another way to pay.",
        impact: "Families fill in a new form for each event, and pay for some in a different place again.",
        source: "Coastal Sage Montessori event pages and Harvest Dinner",
        url: "https://www.coastalsage.org/harvest-dinner",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-billing", "card-and-ach"],
          text: "Events go on the calendar in each family's login, and a charge like the Harvest Dinner goes on their billing page to pay by card or bank.",
        },
      },
      {
        area: "website",
        gap: "The call link dials a different number",
        saw: "The header on every page shows a \"Get in touch\" number, but tapping it dials a different number (the link and the text don't match). The Info Session page lists a third number again.",
        impact: "A parent who taps to call from a phone may reach the wrong line, or no one.",
        source: "Coastal Sage Montessori site header and Info Session page",
        url: "https://www.coastalsage.org/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with one contact number that works everywhere.",
        },
      },
      {
        area: "website",
        gap: "Some pages still describe the move as upcoming",
        saw: "Schedule a Tour still says \"We will be relocating to a new campus beginning in the 2026–2027 academic year\", after the August ribbon cutting. The Open House page says \"Open House dates: COMING SOON\".",
        impact: "A family reading about tours can't tell whether they'd visit the old campus or the new one.",
        source: "Coastal Sage Montessori, Schedule a Tour and Open House",
        url: "https://www.coastalsage.org/admission/schedule-tour",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We keep campus details and event dates current for you.",
        },
      },
      {
        area: "website",
        gap: "The home page is heavy on a phone",
        saw: "Google PageSpeed gave the home page a mobile score of 48. The page loads about 19.5 MB.",
        impact: "On a phone connection a parent waits, and uses a lot of data, before seeing the school.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.coastalsage.org%2F",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with photos and video sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Coastal Sage",
    founder: {
      fullName: "Signe Castañeda",
      firstName: "Signe",
      role: "Founder and Head of School",
      source: "Coastal Sage Montessori, Signe Castañeda staff page",
      url: "https://www.coastalsage.org/faculty-staff/signe-castaneda",
    },
    mailTo: {
      lines: ["Signe Castañeda, Head of School", "Coastal Sage Montessori", "2775 Carlsbad Blvd.", "Carlsbad, CA 92008"],
      source: "Coastal Sage Montessori, Contact page (\"2775 Carlsbad Blvd. Carlsbad, CA 92008\")",
      url: "https://www.coastalsage.org/contact",
    },
    founderFacts: [
      {
        fact: "Coastal Sage held a Ribbon Cutting Ceremony & Open House on Thursday, August 20th to officially open its brand-new school building at the St. Michael's By-the-Sea campus in Carlsbad.",
        source: "Coastal Sage Montessori, Ribbon Cutting Ceremony & Open House",
        url: "https://www.coastalsage.org/ribbon-cutting-ceremony-open-house",
        readOn: "2026-11-22",
      },
      {
        fact: "Signe's staff page says that, looking for a school that would meet the educational and spiritual needs of families in North County San Diego, she decided to start Coastal Sage Montessori.",
        source: "Coastal Sage Montessori, Signe Castañeda staff page",
        url: "https://www.coastalsage.org/faculty-staff/signe-castaneda",
        readOn: "2026-11-22",
      },
    ],
    hook: "Coastal Sage held a Ribbon Cutting Ceremony & Open House on Thursday, August 20th to officially open its brand-new school building at the St. Michael's By-the-Sea campus in Carlsbad.",
    body: `Hi Signe,

Congratulations on Coastal Sage's new building at St. Michael's By-the-Sea. I loved that you started the school for North County families who wanted Montessori and faith together, and now it runs from age three to high school.

Running a small school ourselves, I know how much that takes. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Coastal Sage.

I'd love to hear how the first fall in the new building has gone.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Signe, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "coastalsage-h4t8",
    checkBeforeMailing: [
      "The ribbon cutting page gives \"Thursday, August 20th\" without a year; the Schedule a Tour page says the move was for 2026–2027, so it's August 2026.",
      "The address is the school's published campus address on the St. Michael's By-the-Sea grounds.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about when families ask about tuition, then who's asking and one proof number",
      subject: "tuition at Coastal Sage",
      body: `Hi Signe,

I mailed you a handwritten note last week with a card for Coastal Sage.

I was reading your admission pages. Families can book a Tuesday or Thursday tour online, but tuition comes through a form, and the short application waits until after the tour.

Do most families ask about tuition before they visit, or at the tour?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so Signe can see it without clicking around",
      body: `Hi Signe,

In case it's easier to see than describe, I set up a version of MudKitchen for Coastal Sage and recorded a 60-second walkthrough: an inquiry landing in your admin inbox, the application and enrollment checklist, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Coastal Sage is, with no pitch",
      where: "Instagram (@coastalsagemontessori, linked from the site) or Facebook",
      body: "Hi Signe, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Congratulations on the new campus at St. Michael's By-the-Sea.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Signe,

I also put together a one-page snapshot of what a family sees on your site today, from finding tuition to booking a tour and paying. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Signe,

I'll leave it here so I'm not cluttering your inbox. The Coastal Sage version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Enjoy the first Christmas in the new building.

Julius`,
    },
  ],
};
