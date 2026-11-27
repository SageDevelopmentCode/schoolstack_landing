import type { OutreachPlan } from "./types";

export const asheboroHybridAcademyOutreach: OutreachPlan = {
  slug: "asheboro-hybrid-academy",
  schoolName: "Asheboro Hybrid Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Rachel",
    role: "Admissions Director",
    source: "AHA Our AHA Team page (Rachel Callicutt, Admissions Director); no head of school is listed, and the FAQ calls AHA parent-governed",
  },
  angle: "Proof + their process: the Enroll HERE page links to a 2026–27 application form that no longer accepts responses, with grades near capacity",
  facts: [
    {
      fact: "The Enroll HERE page says \"Enroll for the 2026-2027 School Year\" and notes that, being at capacity this year, most grades will have limited space and some none",
      source: "AHA Enroll HERE!",
      url: "https://asheborohybridacademy.com/enroll-here",
      readOn: "2026-11-22",
    },
    {
      fact: "The page's only link opens a Google Form, \"2026-2027 AHA New Student Application\", which says \"This form is no longer accepting responses.\"",
      source: "2026-2027 AHA New Student Application (Google Forms)",
      url: "https://docs.google.com/forms/d/e/1FAIpQLSdT5WdOdEB66R0dMAjHXUwgf5DG5imRQXN9Q4OduHWsQ21lkg/viewform",
      readOn: "2026-11-22",
    },
    {
      fact: "A non-refundable $125 enrollment fee secures a spot, asked for only once there is an opening; the first student pays standard tuition and siblings get a discount, with rates by contacting the school",
      source: "AHA FAQ",
      url: "https://asheborohybridacademy.com/faq-1",
      readOn: "2026-11-22",
    },
    {
      fact: "Christian, interdenominational, parent-governed hybrid school: elementary and middle on campus Mondays and Thursdays 8:30–2:40, high school Monday, Tuesday and Thursday 8:30–2:55; parents act as tutor, then guide",
      source: "AHA FAQ",
      url: "https://asheborohybridacademy.com/faq-1",
      readOn: "2026-11-22",
    },
    {
      fact: "The Elementary, Middle School and High School pages (linked from The Hybrid Model's \"Learn more\" buttons) each read only \"Coming Soon…\"",
      source: "AHA Elementary School",
      url: "https://asheborohybridacademy.com/elementary",
      readOn: "2026-11-22",
    },
    {
      fact: "The 2026–27 calendar is a one-page PDF embedded from Google Drive (Open House August 11, first day August 13, graduation May 20); supply lists are three more Drive files and the athletics weekly schedule is an embedded Canva design",
      source: "AHA 26-27 School Calendar",
      url: "https://asheborohybridacademy.com/2627-school-calendar",
      readOn: "2026-11-22",
    },
    {
      fact: "Google PageSpeed scores the home page 61/100 on mobile, with the largest element taking about 15 seconds to appear",
      source: "Google PageSpeed Insights (mobile)",
      url: "https://pagespeed.web.dev/analysis?url=https://asheborohybridacademy.com/",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Open the Enroll HERE page's application link in a private window and confirm the Google Form still says it's no longer accepting responses (the first email quotes it).",
    "Rachel Callicutt is the Admissions Director on the Our AHA Team page; no head of school is listed. Confirm she's the right person to write to.",
    "The demo shows 8:30–3:00 for every level; the FAQ says 8:30–2:40 for elementary and middle and 8:30–2:55 for high school. Update the demo before recording the Loom.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Calendar that syncs to Google or Apple calendars",
  ],
  snapshot: {
    token: "FI-l456JMLp4hMXHQwy2AA",
    preparedOn: "2026-11-22",
    summary: "We read all 17 pages of asheborohybridacademy.com on Nov 22, 2026, plus the 2026–27 calendar, the supply lists and the new student application form.",
    pageSpeed: { mobileScore: 61, url: "https://asheborohybridacademy.com/", checkedOn: "2026-11-22" },
    toolStack: [
      { name: "Google Forms", usedFor: "New student application", url: "https://asheborohybridacademy.com/enroll-here" },
      { name: "Google Drive", usedFor: "School calendar and supply lists", url: "https://asheborohybridacademy.com/2627-school-calendar" },
      { name: "Canva", usedFor: "Athletics weekly schedule", url: "https://asheborohybridacademy.com/athletics-weekly-schedule" },
    ],
    observations: [
      {
        area: "find",
        gap: "The three school-level pages say Coming Soon",
        saw: "The Hybrid Model page has a \"Learn more\" button for Elementary, Middle School and High School. Each opens a page that reads only \"Coming Soon…\".",
        impact: "A family comparing grades has only the FAQ's schedule to go on, and has to email to learn what a level covers or whether it has room.",
        source: "AHA Elementary School",
        url: "https://asheborohybridacademy.com/elementary",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "The site we build gives each level its own page with its days, hours and specials, marked Open, Waitlist or Full from your admin.",
        },
      },
      {
        area: "find",
        gap: "Tuition isn't on the site",
        saw: "The FAQ says the first student pays the standard annual rate and siblings get a discount, then asks families to contact the school for rates.",
        impact: "Every family emails before they know whether AHA fits their budget, and some won't ask.",
        source: "AHA FAQ",
        url: "https://asheborohybridacademy.com/faq-1",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "tuition-rate-plans", "discounts"],
          text: "The site shows tuition and the sibling discount as text, from the same plans families are billed on, so the two never disagree.",
        },
      },
      {
        area: "tour",
        gap: "There's no way to book a visit",
        saw: "The site has no tour or visit page. The only visit date on the 2026–27 calendar is the August 11 Open House, and the Contact menu item opens an email.",
        impact: "A family who finds AHA after August emails to ask about a visit and waits for a reply before they can see the school.",
        source: "AHA 26-27 School Calendar",
        url: "https://asheborohybridacademy.com/2627-school-calendar",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a visit time from slots you open, and get a reminder before they come.",
        },
      },
      {
        area: "apply",
        gap: "The Enroll HERE link opens a form that's closed",
        saw: "The Enroll HERE page invites families to enroll for 2026–2027. Its only link opens the Google Form \"2026-2027 AHA New Student Application\", which says it is no longer accepting responses. The page doesn't say what to do instead.",
        impact: "A family ready to apply hits a dead end, and you don't hear from families who could fill next year's openings.",
        source: "2026-2027 AHA New Student Application (Google Forms)",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSdT5WdOdEB66R0dMAjHXUwgf5DG5imRQXN9Q4OduHWsQ21lkg/viewform",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "The inquiry and application live on your site and stay open, and every family lands in one admin inbox, so interest keeps coming in while a grade is full.",
        },
      },
      {
        area: "enroll",
        gap: "The $125 fee has no stated way to pay",
        saw: "The FAQ says a non-refundable $125 enrollment fee secures a spot once there's an opening. The site doesn't say how to pay it or what paperwork comes next.",
        impact: "Each new family asks how to pay, and the office tracks who has paid before holding their spot.",
        source: "AHA FAQ",
        url: "https://asheborohybridacademy.com/faq-1",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-fees", "enrollment-agreements"],
          text: "Accepted families get one checklist: the enrollment agreement signed online and the $125 fee paid in the same place, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say how tuition is paid",
        saw: "Beyond the enrollment fee and the sibling discount, the site doesn't say how families pay tuition, whether there are monthly plans, or where to see a balance.",
        impact: "Families ask the office about payments one by one, and the office answers the same questions each year.",
        source: "AHA FAQ",
        url: "https://asheborohybridacademy.com/faq-1",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "parent-plan-choice", "autopay", "card-and-ach"],
          text: "Each family picks a payment plan, sees their balance and invoices, and can pay by card or bank with autopay.",
        },
      },
      {
        area: "updates",
        gap: "The school calendar is a PDF in a Google Drive frame",
        saw: "The 26-27 School Calendar page shows a one-page PDF from Google Drive. Supply lists are three more Drive files, and the athletics weekly schedule is an embedded Canva design.",
        impact: "Families can't add Fall Break or testing days to their own calendar, and every change means making and uploading a new file.",
        source: "AHA 26-27 School Calendar",
        url: "https://asheborohybridacademy.com/2627-school-calendar",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "calendar-sync"],
          text: "We'd set up a school calendar families see in their login, and connect it to Google or Apple calendars so dates land on their phones.",
        },
      },
      {
        area: "website",
        gap: "The home page takes about 15 seconds to fill in on a phone",
        saw: "Google PageSpeed scores the home page 61 out of 100 on mobile. The largest part of the page takes about 15 seconds to appear, and the page weighs about 2.4 MB.",
        impact: "Parents tapping through from Facebook or Instagram on a phone may leave before the page loads.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://pagespeed.web.dev/analysis?url=https://asheborohybridacademy.com/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you is made to load fast on a phone, and we keep it current.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "AHA",
    founder: {
      fullName: "Rachel Callicutt",
      firstName: "Rachel",
      role: "Admissions Director",
      source: "AHA Our AHA Team page (Rachel Callicutt, Admissions Director); no founder or head of school is named",
      url: "https://asheborohybridacademy.com/our-aha-team",
    },
    mailTo: {
      lines: ["Rachel Callicutt", "Asheboro Hybrid Academy", "4751 Dunbar Bridge Rd.", "Asheboro, NC 27205"],
      source: "AHA Contact page and the site footer on every page; the FAQ says students meet at \"our school building\"",
      url: "https://asheborohybridacademy.com/contact",
    },
    founderFacts: [
      {
        fact: "The AHA About page says elementary and middle school students meet two days a week and high school three, for 32 weeks a year, with lessons at home led by a parent as co-teacher: \"At AHA, education happens together.\"",
        source: "AHA About page",
        url: "https://asheborohybridacademy.com/about",
        readOn: "2026-11-22",
      },
      {
        fact: "The FAQ calls AHA a parent-governed organization that welcomes families from many Christian traditions.",
        source: "AHA FAQ",
        url: "https://asheborohybridacademy.com/faq-1",
        readOn: "2026-11-22",
      },
    ],
    hook: "The AHA About page says elementary and middle school students meet two days a week and high school three, for 32 weeks a year, with lessons at home led by a parent as co-teacher: \"At AHA, education happens together.\"",
    body: `Hi Rachel,

I read the About page on the AHA site and loved the line "education happens together," with teachers in class two or three days a week and a parent as co-teacher at home the rest.

It's a lovely way to share a child's week. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for AHA.

I'd love to hear how admissions works at a parent-governed school.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Rachel, a note for AHA admissions from a microschool in Round Rock. J",
    shortCode: "aha-s5lq",
    checkBeforeMailing: [
      "No founder or head of school is named: the FAQ calls AHA parent-governed, and the Our AHA Team page lists grade-level directors plus Rachel Callicutt as Admissions Director. The letter goes to Rachel (who the emails greet) and opens on a school fact from the About page, not a founder hook.",
      "Address it to Rachel Callicutt, Asheboro Hybrid Academy, at the Dunbar Bridge Rd. address from the Contact page and footer. The Student Life page mentions \"our sanctuary\", so the building may be a church campus; that's fine for mail.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "First contact: one sourced fact from their Enroll page, one proof number, offer the snapshot",
      subject: "AHA's 2026–27 application form",
      body: `Hi Rachel,

I mailed you a handwritten note last week with a card for AHA.

The Enroll HERE page on the AHA site links to the 2026–2027 New Student Application, but the Google Form now says it's no longer accepting responses. With some grades full, the page doesn't say where a family should go next.

I run Sage Field, a microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

I put together a one-page snapshot of what a family sees on your site today, from the program pages to the $125 enrollment fee. Want me to send it?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Rachel,

I also set up a version of MudKitchen for AHA, with your elementary, middle and high school programs in it. Here's a 60-second walkthrough: an inquiry landing in your admin, the enrollment checklist a family gets, and their billing page.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where the school is, with no pitch",
      where: "Facebook (asheborohybridacademy) or Instagram (asheborohybrid)",
      body: "Hi Rachel, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Enjoyed reading how AHA parents start as tutors and grow into guides.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Rachel,

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
      body: `Hi Rachel,

I'll leave it here so I'm not cluttering your inbox. The AHA version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the year.

Julius`,
    },
  ],
};
