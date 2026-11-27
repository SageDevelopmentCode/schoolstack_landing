import type { OutreachPlan } from "./types";

export const gardenSchoolMariettaOutreach: OutreachPlan = {
  slug: "garden-school-marietta",
  schoolName: "The Garden School of Marietta",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Ashley",
    role: "Head of School (Ashley Orio)",
    source: "The Garden School Faculty page, Administration (\"Ashley Orio, Head of School\")",
  },
  angle:
    "One real question: Grades applicants send up to six PDF forms by email or upload alongside the TADS application, and the email link for those forms misspells the school's domain. With 2027–28 applications opening soon, how does admissions keep track of which forms each family still owes?",
  facts: [
    {
      fact: "The Garden School is a Waldorf-inspired forest school with outdoor classrooms across a 14-acre campus of wetlands, farm and garden, serving Joyful Beginnings (ages 2–3), Forest Kindergarten (4–6) and Grades 1–8",
      source: "The Garden School home page",
      url: "https://thegardenmarietta.org/",
      readOn: "2026-11-23",
    },
    {
      fact: "Grades applicants apply on TADS ($100 fee, photo, birth certificate) and send teacher evaluation, records release and work-sample forms as PDFs by email or upload (three for Grades 1–5, six for Grades 6–8), then a one-on-one assessment, three observation days and a parent interview; the email link for those forms spells the domain \"marieta\" with one t",
      source: "The Garden School, Apply Now",
      url: "https://thegardenmarietta.org/apply-now",
      readOn: "2026-11-23",
    },
    {
      fact: "The Apply page says \"Applications for the 2027-2028 school year will open soon!\" and the TADS page offers only the Fall 2026 – Spring 2027 session",
      source: "The Garden School, Apply Now; TADS online admissions",
      url: "https://mytads.com/a/gardenschoolmarietta",
      readOn: "2026-11-23",
    },
    {
      fact: "2026–27 tuition: Joyful Beginnings $5,150–$9,475, Kindergarten $8,750–$13,285, Grades 1–4 and Grades 5–7 $14,995, plus materials fees and $750 enrollment fees ($250 registration and a $500 work bond); most families pay over 10 months, 5% off a single payment; tuition assistance through TADS",
      source: "The Garden School, Tuition",
      url: "https://thegardenmarietta.org/tuition",
      readOn: "2026-11-23",
    },
    {
      fact: "The \"open house\" link on the Apply page returns page not found, and Summer Camp (linked from the home, tour and apply pages) opens a password-protected page",
      source: "The Garden School, Apply Now and home page",
      url: "https://thegardenmarietta.org/apply-now",
      readOn: "2026-11-23",
    },
    {
      fact: "The founder, Jas Darland, is an Austin Waldorf School alumna (East Cobber, August 2018)",
      source: "East Cobber, \"The Garden School Provides Nature-Based Education to Students\"",
      url: "https://eastcobber.com/the-garden-school-provides-nature-based-education-to-students/",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "The Garden School is an established independent school (toddler through 8th grade, Board of Trustees, AAAIS member, a five-person administration) and uses TADS for applications and tuition assistance. Like Peninsular Prep, decide whether it's worth pitching.",
    "The first email points out the misspelled email link. Keep it as a helpful aside; don't lead with it if you rewrite.",
    "Georgia GOAL scholarships and TADS tuition assistance are things MudKitchen works alongside; the plan doesn't pitch replacing them.",
    "Jas Darland founded the school but isn't on today's staff list, so the plan writes to Ashley Orio, the Head of School.",
    "Facebook and Instagram are linked in the site header.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "y9mDbZ_RIHZd9MWsVW5_tw",
    preparedOn: "2026-11-23",
    summary:
      "We read all 19 pages of thegardenmarietta.org on Nov 23, 2026, plus the TADS application, the admissions PDFs and the school calendar.",
    pageSpeed: { mobileScore: 45, url: "https://thegardenmarietta.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "TADS",
        usedFor: "Application and tuition assistance",
        url: "https://thegardenmarietta.org/apply-now",
      },
      {
        name: "Calendly",
        usedFor: "Campus tours",
        url: "https://thegardenmarietta.org/schedule-a-tour",
      },
      {
        name: "PDF forms by email or upload",
        usedFor: "Teacher evaluations, records release and work samples",
        url: "https://thegardenmarietta.org/apply-now",
      },
      {
        name: "Google Sheets and PDF",
        usedFor: "School calendar",
        url: "https://thegardenmarietta.org/calendar",
      },
    ],
    observations: [
      {
        area: "apply",
        gap: "Grades applicants juggle up to six PDF forms",
        saw: "After the TADS application, Grades 1–5 families send three PDFs and Grades 6–8 families six (teacher evaluations, records release, work samples), by email or the upload box on the Apply page.",
        impact: "Families track down forms from several teachers and send each back separately, and can't see which ones the school has received.",
        source: "The Garden School, Apply Now",
        url: "https://thegardenmarietta.org/apply-now",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["online-application", "forms-documents", "admissions-pipeline"],
          text: "One online application with each required form as its own item, so families and admissions see what's in and what's still missing.",
        },
      },
      {
        area: "website",
        gap: "The Grades forms email link has a typo",
        saw: "Under Grades 1–5 and Grades 6–8, the link for emailing completed forms spells the school's domain \"marieta\", with one t.",
        impact: "A family emailing evaluation forms to that link may have them bounce, without knowing the school never got them.",
        source: "The Garden School, Apply Now",
        url: "https://thegardenmarietta.org/apply-now",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with every link checked.",
        },
      },
      {
        area: "tour",
        gap: "The open house link is a dead end",
        saw: "The Apply page invites families to \"attend an open house\", but the link returns \"We couldn't find the page you were looking for.\"",
        impact: "A family who'd rather see the school at an open house than book a tour can't find when one is.",
        source: "The Garden School, Apply Now",
        url: "https://thegardenmarietta.org/apply-now",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "calendar"],
          text: "Tours and open houses show together on the site, and families book either one from open times.",
        },
      },
      {
        area: "apply",
        gap: "2027–28 applications aren't open yet",
        saw: "The Apply page, headed \"2026-2027 Admissions\", says 2027–28 applications \"will open soon\", and TADS offers only the Fall 2026 – Spring 2027 session. The Tuition page says the deposit was due in April 2026.",
        impact: "A family planning for next fall can't start an application or see when they'll be able to.",
        source: "The Garden School, Apply Now and Tuition; TADS",
        url: "https://thegardenmarietta.org/apply-now",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "online-application"],
          text: "Each program and year shows Open, Waitlist or Full, and families can start next year's application or join the list as soon as you're ready.",
        },
      },
      {
        area: "pay",
        gap: "The tuition table has no 8th grade",
        saw: "The Grades table lists Grades 1–4 and Grades 5–7 at $14,995, with materials fees of $635 and $835. The school runs through 8th grade. Due dates are in a separate new-family PDF.",
        impact: "An 8th grade family can't find their price, and every family opens a second file to see when each payment is due.",
        source: "The Garden School, Tuition",
        url: "https://thegardenmarietta.org/tuition",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "parent-plan-choice", "parent-billing"],
          text: "Each program's tuition, fees and the 10-payment or pay-in-full options set up once, with every due date on the family's billing page.",
        },
      },
      {
        area: "website",
        gap: "Summer Camp opens a password page",
        saw: "The home, tour and apply pages link to Summer Camp, which opens a password-protected page.",
        impact: "A family looking for summer options hits a locked page with no dates or prices.",
        source: "The Garden School, home page",
        url: "https://thegardenmarietta.org/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, so a page that isn't ready stays out of the menu.",
        },
      },
      {
        area: "updates",
        gap: "The school calendar is a spreadsheet and a PDF",
        saw: "The School Calendar page embeds a Google Sheet and offers a \"Download 2026-2027 Calendar\" PDF.",
        impact: "Families can't add dates to their phone calendar or see changes without downloading the file again.",
        source: "The Garden School, School Calendar",
        url: "https://thegardenmarietta.org/calendar",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "parent-portal", "mobile-app"],
          text: "School dates and festivals live on one calendar in each family's login, on the web and the iPhone app.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 45 out of 100 on mobile. The main content takes about 20 seconds to appear, and the page is about 4.2 MB.",
        impact: "A parent opening the site on a phone may give up before they see anything about the school.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://thegardenmarietta.org/",
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
    shortSchoolName: "The Garden School",
    founder: {
      fullName: "Ashley Orio",
      firstName: "Ashley",
      role: "Head of School",
      source: "The Garden School, Faculty (Administration)",
      url: "https://thegardenmarietta.org/faculty",
    },
    mailTo: {
      lines: ["Ashley Orio", "The Garden School of Marietta", "4010 Canton Road", "Marietta, GA 30066"],
      source: "The Garden School, Schedule a Tour (\"4010 Canton Road, Marietta, GA 30066\")",
      url: "https://thegardenmarietta.org/schedule-a-tour",
    },
    founderFacts: [
      {
        fact: "East Cobber (August 2018) reported that The Garden School's founder, Jas Darland, is an alumna of the Austin Waldorf School.",
        source: "East Cobber, \"The Garden School Provides Nature-Based Education to Students\"",
        url: "https://eastcobber.com/the-garden-school-provides-nature-based-education-to-students/",
        readOn: "2026-11-23",
      },
      {
        fact: "The Garden School holds its school days in outdoor classrooms across a 14-acre campus of wetlands, farm and garden, rain or shine, from toddlers through 8th grade.",
        source: "The Garden School home page",
        url: "https://thegardenmarietta.org/",
        readOn: "2026-11-23",
      },
    ],
    hook: "East Cobber (August 2018) reported that The Garden School's founder, Jas Darland, is an alumna of the Austin Waldorf School.",
    body: `Hi Ashley,

East Cobber says the Garden School's founder went to the Austin Waldorf School, just down the road from us. I loved that it now runs from toddlers through 8th grade on 14 acres of wetlands, farm and garden, rain or shine.

Time outside is a big part of our days too. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for The Garden School.

I'd love to hear how the Grades program has grown.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your admissions.",
    stickyNote: "Ashley, a note from an outdoor microschool near Austin. J",
    shortCode: "gardenschool-b3v6",
    checkBeforeMailing: [
      "The letter goes to Ashley Orio, the current Head of School. The hook is about the founder, Jas Darland, from a 2018 article; if you'd rather keep it about Ashley, swap the first paragraph for the campus line.",
      "The address is the campus on Canton Road, from the tour page and the CRM.",
      "No podcast or interview with Ashley turned up.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about tracking Grades admissions forms (with the misspelled link as a helpful aside), then who's asking and one proof number",
      subject: "Grades admissions forms",
      body: `Hi Ashley,

I mailed you a handwritten note last week with a card for The Garden School.

Your Apply page asks Grades families to send up to six PDF forms by email or upload, alongside the TADS application. One small thing: the email link under Grades 1–5 and 6–8 spells Marietta with one t.

With 2027–28 applications opening soon, how do you keep track of which forms each family still owes?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Ashley,

In case it's easier to see than describe, I set up a version of MudKitchen for The Garden School and recorded a 60-second walkthrough: an inquiry landing in your admin inbox, the enrollment checklist with the work bond, and the billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where The Garden School is, with no pitch",
      where: "Facebook or Instagram, both linked in the site header",
      body: "Hi Ashley, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Weekly creek and farm visits for kindergartners is a lovely rhythm.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Ashley,

I also put together a one-page snapshot of what a family sees on your site today, from booking a tour to paying tuition. It also lists a couple of links that lead nowhere. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Ashley,

I'll leave it here so I'm not cluttering your inbox. The Garden School version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with 2027–28 admissions.

Julius`,
    },
  ],
};
