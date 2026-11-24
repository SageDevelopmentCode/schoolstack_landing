import type { OutreachPlan } from "./types";

export const paradiseEarthAcademyOutreach: OutreachPlan = {
  slug: "paradise-earth-academy",
  schoolName: "Paradise Earth Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Melissa",
    role: "Founder & CEO",
    source: "paradiseearthacademy.com Who We Are and Melissa Alexander's bio (Founder & CEO, founded P.E.A. after 2020)",
  },
  angle: "Re-contact with a snapshot, why now: three new campuses, each with its own Omella waitlist, while Gilbert starts in School Cues",
  priorContact: {
    when: "July",
    what: "A hand-sent first email with a link to the Paradise Earth Academy MudKitchen demo",
  },
  facts: [
    {
      fact: "Melissa Alexander is Founder & CEO; Espi Ramirez is School Director",
      source: "Paradise Earth Academy, Who We Are",
      url: "https://paradiseearthacademy.com/who-we-are/",
      readOn: "2026-11-22",
    },
    {
      fact: "New Queen Creek, Glendale and Scottsdale locations are opening soon, with pre-enrollment open now",
      source: "Paradise Earth Academy home page",
      url: "https://paradiseearthacademy.com/",
      readOn: "2026-11-22",
    },
    {
      fact: "On Enroll Now, Gilbert links to a School Cues admission inquiry; Queen Creek, Scottsdale and Glendale each link to an Omella form",
      source: "Paradise Earth Academy, Enroll Now",
      url: "https://paradiseearthacademy.com/enrollment/",
      readOn: "2026-11-22",
    },
    {
      fact: "Academic program is $625 a quarter per weekly day (4 days $2,250); tuition is paid each quarter through the parent School Cues account by ClassWallet, card, cash or check, on a schedule aligned with ESA funding",
      source: "Paradise Earth Academy, Enroll Now and Rules & FAQs",
      url: "https://paradiseearthacademy.com/rules-faqs/",
      readOn: "2026-11-22",
    },
    {
      fact: "85 students in K–8 classrooms of about 10; part-time families get weekly emails with the lessons to cover at home",
      source: "Paradise Earth Academy, Rules & FAQs",
      url: "https://paradiseearthacademy.com/rules-faqs/",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in July (the first email says so).",
    "Confirm the recipient: Melissa Alexander is Founder & CEO; Espi Ramirez is School Director and may own admissions.",
    "Uses School Cues for inquiries and tuition: the snapshot pitches replacing it. ESA payments come through ClassWallet, which we work alongside, not replace.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Several locations in one account",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds)",
    "We'd build: Monthly billing for clubs, after-care or add-on classes",
    "We'd build: Weekly learning plans for home days",
  ],
  snapshot: {
    token: "J68y1Y38emxCMUQYr4gD9A",
    preparedOn: "2026-12-01",
    summary:
      "We read all 21 pages of paradiseearthacademy.com on Dec 1, 2026, from Enroll Now and Rules & FAQs to every staff page, plus the forms they link to.",
    toolStack: [
      { name: "School Cues", usedFor: "Gilbert admission inquiry and quarterly tuition", url: "https://paradiseearthacademy.com/enrollment/" },
      { name: "Omella", usedFor: "New-campus waitlists, Nature Day registration, school tee orders", url: "https://paradiseearthacademy.com/enrollment/" },
    ],
    observations: [
      {
        area: "apply",
        gap: "Each campus starts in a different place",
        saw: "On Enroll Now, Gilbert opens a School Cues admission inquiry, while Queen Creek, Scottsdale and Glendale each open their own Omella waitlist. The Queen Creek form says tours and the full enrollment process come later.",
        impact: "You keep four lists in two systems, and new-campus families are moved by hand once enrollment opens.",
        source: "Paradise Earth Academy, Enroll Now",
        url: "https://paradiseearthacademy.com/enrollment/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["online-application", "admissions-pipeline", "multi-location"],
          text: "One application where families pick a campus, and every inquiry lands in one admin inbox. We'd set up all four campuses in one account.",
        },
      },
      {
        area: "tour",
        gap: "Tours wait for a call back",
        saw: "The home page says \"Join Our Waitlist or Schedule A Tour\", but the FAQ explains families fill out the inquiry form and are contacted to schedule a tour if there's room in their grade.",
        impact: "Interested families wait to hear back before they can see the school, and each tour takes a round of messages to set.",
        source: "Paradise Earth Academy, Rules & FAQs",
        url: "https://paradiseearthacademy.com/rules-faqs/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a tour time from the slots you open for their campus, and get a reminder before they come.",
        },
      },
      {
        area: "pay",
        gap: "ESA families pay from two places",
        saw: "Tuition is paid each quarter through School Cues by ClassWallet, card, cash or check, on dates aligned with the ESA schedule. The site doesn't say how the ESA amount and the family's share are split when ESA doesn't cover it all.",
        impact: "A family can't see what ESA covered and what they still owe, and you reconcile ClassWallet payments against each account by hand.",
        source: "Paradise Earth Academy, Rules & FAQs",
        url: "https://paradiseearthacademy.com/rules-faqs/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing so the ESA portion is recorded against each family each quarter and they only see and pay what's left.",
        },
      },
      {
        area: "pay",
        gap: "Add-ons are paid in separate places",
        saw: "Nature Day registration and school tee orders go through Omella, the $300 curriculum fee is only in the FAQ, and Horsemanship is $250 a quarter on Enroll Now.",
        impact: "Families pay for one school year in several places, and you match each extra to the right student.",
        source: "Paradise Earth Academy, Programs",
        url: "https://paradiseearthacademy.com/classrooms/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["class-billing", "parent-billing"],
          text: "We'd set up Nature Day, Horsemanship and the curriculum fee as add-ons on each family's bill, so everything shows and is paid in one place.",
        },
      },
      {
        area: "updates",
        gap: "Home-day lessons arrive by weekly email",
        saw: "Part-time families get a weekly email with the classroom lessons and objectives, so they can cover the same skills at home.",
        impact: "Each week's plan sits in a parent's inbox, and it's hard to look back at what a child missed or still has to finish.",
        source: "Paradise Earth Academy, Rules & FAQs",
        url: "https://paradiseearthacademy.com/rules-faqs/",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["learning-plans", "newsletters"],
          text: "We'd set up weekly learning plans in each family's portal for their home days, alongside the newsletters you already send.",
        },
      },
      {
        area: "website",
        gap: "Teacher email buttons go to .con addresses",
        saw: "The Email buttons on 12 staff pages link to addresses ending in \".con\" instead of \".com\". On Who We Are, Tish Stewart appears twice and the second card opens another teacher's page.",
        impact: "A parent who emails a teacher from the site gets a bounce, and may think the message went through.",
        source: "Paradise Earth Academy, Mrs. Joanna White",
        url: "https://paradiseearthacademy.com/teacher-white/",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, so every staff page has a working contact and the team page stays current.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Paradise Earth",
    founder: {
      fullName: "Melissa Alexander",
      firstName: "Melissa",
      role: "Founder & CEO",
      source: "Paradise Earth Academy, Who We Are",
      url: "https://paradiseearthacademy.com/who-we-are/",
    },
    mailTo: {
      lines: ["235 E Guadalupe Rd", "Gilbert, AZ 85234"],
      source: "Paradise Earth Academy home page footer (the Gilbert campus; no separate mailing address listed)",
      url: "https://paradiseearthacademy.com/",
    },
    founderFacts: [
      {
        fact: "On the Harvesting Wisdom Podcast (October 8, 2026), Melissa Alexander told Dr. Joe Roselle how Paradise Earth Academy grew from a small homeschooling group into a school of about 80 students, and talked about the school garden and plans for orchards and outdoor classrooms.",
        source: "Harvesting Wisdom Podcast with Mike McMahon, Nature-Based Education & School Gardens | Paradise Earth Academy",
        url: "https://podcasts.apple.com/us/podcast/nature-based-education-school-gardens-paradise-earth/id1732568264?i=1000796381554",
        readOn: "2026-11-22",
      },
      {
        fact: "Melissa Alexander has worked in education for over 25 years, starting with a B.S. in Education from Illinois State University in 2000.",
        source: "Paradise Earth Academy, Who We Are",
        url: "https://paradiseearthacademy.com/who-we-are/",
        readOn: "2026-11-22",
      },
      {
        fact: "Paradise Earth Academy's home page says new Queen Creek, Glendale and Scottsdale locations are opening soon, with pre-enrollment open now.",
        source: "Paradise Earth Academy home page",
        url: "https://paradiseearthacademy.com/",
        readOn: "2026-11-22",
      },
    ],
    hook: "On the Harvesting Wisdom Podcast (October 8, 2026), Melissa Alexander told Dr. Joe Roselle how Paradise Earth Academy grew from a small homeschooling group into a school of about 80 students, and talked about the school garden and plans for orchards and outdoor classrooms.",
    body: `Hi Melissa,

I listened to your Harvesting Wisdom episode. I liked hearing how Paradise Earth grew from a small homeschool group to about 80 students, and your plans for orchards and outdoor classrooms around the garden.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Paradise Earth.

With Queen Creek, Glendale and Scottsdale coming, I'd like to hear how you're planning the new campuses.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at enrolling across your campuses.",
    stickyNote: "Melissa, a note from an outdoor microschool in Texas. J",
    shortCode: "paradise-1qnf",
    checkBeforeMailing: [
      "235 E Guadalupe Rd is the Gilbert campus in the site footer (the CRM notes it's Gilbert Presbyterian Church's educational center). Put Paradise Earth Academy on the envelope so it isn't taken for church mail.",
      "Listen to the 15-minute episode before mailing so you can talk about it if she calls.",
      "Check the home page still says Queen Creek, Glendale and Scottsdale are opening soon (the letter calls them coming).",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the July email, one detail from the snapshot, one proof number",
      subject: "three new P.E.A. campuses",
      body: `Hi Melissa,

I mailed you a handwritten note last week with a card for Paradise Earth Academy. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in July) and a one-page snapshot of what a family sees on your site today, from finding tuition to paying it.

One thing stood out: Gilbert families start with a School Cues inquiry, while the Queen Creek, Scottsdale and Glendale waitlists are separate Omella forms. That's four lists before anyone tours.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Melissa,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Paradise Earth version: the homepage, what a parent sees for enrollment and tuition, and your admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Instagram (paradiseearthacademy) or Facebook",
      body: "Hi Melissa, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. The 1,500 sq ft garden your students built is wonderful.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Melissa,

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
      body: `Hi Melissa,

I'll leave it here so I'm not cluttering your inbox. The Paradise Earth version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the new campuses.

Julius`,
    },
  ],
};
