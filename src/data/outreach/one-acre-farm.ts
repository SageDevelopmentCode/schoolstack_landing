import type { OutreachPlan } from "./types";

export const oneAcreFarmOutreach: OutreachPlan = {
  slug: "one-acre-farm",
  schoolName: "One Acre Farm Farm School Learning Pod",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Catherine",
    role: "Owner; heads the Elementary Farm School and the Strides autism program",
    source:
      "Catherine Ward, named as owner of One Acre Farm on the Teaching Staff image of the Farm School Learning Pods page and as Elementary contact on the Elementary Farm School page",
  },
  angle:
    "Re-contact with a snapshot: Farm School families go from a 29-question tour form to a hand-scheduled tour, an unlinked application with a fee, then a deposit and paperwork",
  priorContact: {
    when: "July",
    what: "A hand-sent first email with a link to the One Acre Farm MudKitchen demo",
  },
  facts: [
    {
      fact: "Two Farm School Learning Pods: Early Childhood (ages 4–7, led by Nicole Jones) and Elementary (ages 7–10, led by Catherine Ward), Wednesdays and Thursdays 8am–2pm; both marked CLASS FULL for summer and the 2026–27 year",
      source: "One Acre Farm Elementary and Early Childhood Farm School pages (Canva)",
      url: "https://oneacrefarmtx.my.canva.site/elementaryfarmschool",
      readOn: "2026-11-22",
    },
    {
      fact: "2026–27 Elementary tuition is $3,250 ($3,185 if paid in full by August 11, or $395 monthly installments), plus a $100 refundable security deposit and a $100 supply fee",
      source: "One Acre Farm Elementary Farm School page (Canva)",
      url: "https://oneacrefarmtx.my.canva.site/elementaryfarmschool",
      readOn: "2026-11-22",
    },
    {
      fact: "Five-step enrollment: online tour application, tour with the child, online enrollment application with an application fee, acceptance call from staff, then the security deposit and paperwork due date",
      source: "One Acre Farm Elementary Farm School page (Canva)",
      url: "https://oneacrefarmtx.my.canva.site/elementaryfarmschool",
      readOn: "2026-11-22",
    },
    {
      fact: "The tour application is a Google Form with 29 required questions, one form per child; tours happen Monday–Thursday 1:00–2:30pm and the farm reaches out to schedule them only when spaces are open",
      source: "Farm School Learning Pod Tour Application (Google Form)",
      url: "https://docs.google.com/forms/d/e/1FAIpQLSdwzd9GFVvjfAHphg1z6tQj_y2D7Im2i2afQyMHSj3MPuca2A/viewform",
      readOn: "2026-11-22",
    },
    {
      fact: "Monthly activities (Storytime, Kids Art & Play, Sensory Saturday) are paid in advance through PayPal buttons, e.g. $10 for Kids Art & Play on Sat Nov 21",
      source: "One Acre Farm homepage and Kids Art & Play",
      url: "https://oneacrefarmtx.com/kids-art--play.html",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in July (the first email says so).",
    "Find Catherine Ward's email on her site's Contact page; the CRM has no contact.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "Re-count the tour form's required questions before sending (29 on Nov 22; the first email names the number).",
  ],
  snapshot: {
    token: "byyA7tyVpnof-wdsqtC62g",
    preparedOn: "2026-12-01",
    summary:
      "We read 19 pages of oneacrefarmtx.com on Dec 1, 2026, plus both Farm School pages, the tour application and the activity sign-ups.",
    pageSpeed: { mobileScore: 58, url: "https://oneacrefarmtx.com/", checkedOn: "2026-12-01" },
    toolStack: [
      { name: "Canva websites", usedFor: "Farm School tuition and enrollment steps", url: "https://oneacrefarmtx.my.canva.site/elementaryfarmschool" },
      { name: "Google Forms", usedFor: "Farm School tour application", url: "https://oneacrefarmtx.com/farm-school-learning-pods.html" },
      { name: "PayPal", usedFor: "Paying for monthly activities", url: "https://oneacrefarmtx.com/kids-art--play.html" },
    ],
    observations: [
      {
        area: "find",
        gap: "Farm School tuition lives on two separate Canva sites",
        saw: "The Farm School Learning Pods page is made of pictures with no text. Schedules, tuition and the enrollment steps are on two Canva pages, reached by clicking an image.",
        impact: "Families searching for farm school prices in Porter won't find them, and a phone shows each picture shrunk to fit.",
        source: "One Acre Farm Farm School Learning Pods",
        url: "https://oneacrefarmtx.com/farm-school-learning-pods.html",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "Your demo puts both pods, their days and tuition on your own site as text, one click from the homepage.",
        },
      },
      {
        area: "tour",
        gap: "Asking for a tour takes 29 questions, then a wait for a slot",
        saw: "The tour application is a Google Form with 29 required questions, including both parents' occupations, and one form per child. After that, the farm reaches out to set a time between 1:00 and 2:30, Monday to Thursday.",
        impact: "A family with two children fills in the form twice, and each tour still needs a round of calls or emails during your teaching day.",
        source: "Farm School Learning Pod Tour Application",
        url: "https://docs.google.com/forms/d/e/1FAIpQLSdwzd9GFVvjfAHphg1z6tQj_y2D7Im2i2afQyMHSj3MPuca2A/viewform",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick a tour from the 1:00–2:30 slots you open, and the longer questions move to the application after the visit.",
        },
      },
      {
        area: "apply",
        gap: "The enrollment application and its fee aren't linked",
        saw: "Step 3 says to turn in an online application for enrollment with an application fee. Neither Farm School page links to that application or says what the fee is.",
        impact: "Families who toured have to ask how to apply and how to pay the fee, and you send it out by hand each time.",
        source: "One Acre Farm Elementary Farm School page",
        url: "https://oneacrefarmtx.my.canva.site/elementaryfarmschool",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["online-application", "application-fee"],
          text: "An online application families can save and come back to, with the fee paid by card or bank when they submit.",
        },
      },
      {
        area: "enroll",
        gap: "Deposit and paperwork come after a phone call",
        saw: "Step 5 says accepted families are told the security deposit and paperwork due date. The site doesn't say what the paperwork is or how it's signed and returned.",
        impact: "You track by hand who has paid the $100 deposit and $100 supply fee and who still owes forms.",
        source: "One Acre Farm Early Childhood Farm School page",
        url: "https://oneacrefarmtx.my.canva.site/early-childhood",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: the enrollment agreement and farm waiver signed online, then the deposit and supply fee paid, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say how $395 monthly payments are made",
        saw: "Tuition is $3,250 for the year, or $395 a month. Monthly activities each have their own PayPal button, but there's no way to pay tuition on the site.",
        impact: "Each month you collect 10 installments per family by hand, and families can't see what they've paid.",
        source: "One Acre Farm Elementary Farm School page",
        url: "https://oneacrefarmtx.my.canva.site/elementaryfarmschool",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay", "card-and-ach"],
          text: "Families choose paid-in-full or monthly in their portal and turn on autopay, and you see every balance in one place.",
        },
      },
      {
        area: "website",
        gap: "About Us and the homepage disagree on autism program costs",
        saw: "About Us opens with a June 2020 notice that autism services can no longer be offered for free. The homepage and FAQ say these programs are offered free of charge through donations.",
        impact: "A family of a child with autism can't tell whether Strides costs anything until they ask.",
        source: "One Acre Farm About Us",
        url: "https://oneacrefarmtx.com/about-us.html",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We write and keep up the site for you, so program costs read the same on every page.",
        },
      },
      {
        area: "website",
        gap: "Pages aren't set up for phones",
        saw: "The site's pages have no mobile viewport setting, so a phone shows the desktop layout shrunk down. Google PageSpeed scores the homepage 58 out of 100 on mobile.",
        impact: "Parents reading on a phone have to pinch and zoom to see dates, prices and the PayPal buttons.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://oneacrefarmtx.com/",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you is made for phones first.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "One Acre Farm",
    founder: {
      fullName: "Catherine Ward",
      firstName: "Catherine",
      role: "Owner of One Acre Farm and founder of One Acre Farm Educational Foundation",
      source: "One Acre Farm, About Us",
      url: "https://oneacrefarmtx.com/about-us.html",
    },
    mailTo: {
      lines: ["3410 Magnolia Dr.", "Porter, TX 77365"],
      source: "One Acre Farm Contact Us page (listed as the mailing address; 3416 Magnolia Dr. is marked GPS only, do not mail)",
      url: "https://oneacrefarmtx.com/contact-us.html",
    },
    founderFacts: [
      {
        fact: "On Equine Assisted World with Rupert Isaacson (Ep 30, June 12, 2025), Catherine Ward and Nicole Jones talked about how One Acre Farm started small, with a first class on raising backyard chickens, and about mentoring others toward a thousand One Acre Farms.",
        source: "Equine Assisted World, One Acre Wonders – Outdoor Schooling, Autism Support, and Equine Wisdom with Catherine Ward & Nicole Jones | Ep 30",
        url: "https://podcasts.apple.com/us/podcast/one-acre-wonders-outdoor-schooling-autism-support-and/id1684703456?i=1000712525823",
        readOn: "2026-11-22",
      },
      {
        fact: "Catherine owns One Acre Farm, founded One Acre Farm Educational Foundation and co-founded the Strides autism program; she is a certified Texas elementary teacher and taught in public school.",
        source: "One Acre Farm, About Us",
        url: "https://oneacrefarmtx.com/about-us.html",
        readOn: "2026-11-22",
      },
      {
        fact: "One Acre Farm was established in Porter in 1998, has offered educational workshops since 1999, and in Summer 2016 was certified by The Horse Boy to train and provide the Horse Boy Method and Movement Method.",
        source: "One Acre Farm, About Us",
        url: "https://oneacrefarmtx.com/about-us.html",
        readOn: "2026-11-22",
      },
      {
        fact: "Community Impact (May 2, 2022) reported that Catherine opened One Acre Farm as an outdoor, hands-on learning space for homeschooled children, quoting her: \"let's not think that everything has to be done at a table or in a chair.\"",
        source: "Community Impact, Porter nonprofit One Acre Farm offers outdoor learning for individuals of all abilities",
        url: "https://communityimpact.com/lake-houston-humble-kingwood/nonprofit/porter-nonprofit-one-acre-farm-offers-outdoor-learning-for-individuals-of-all-abilities/",
        readOn: "2026-11-22",
      },
    ],
    hook: "On Equine Assisted World with Rupert Isaacson (Ep 30, June 12, 2025), Catherine Ward and Nicole Jones talked about how One Acre Farm started small, with a first class on raising backyard chickens, and about mentoring others toward a thousand One Acre Farms.",
    body: `Hi Catherine,

I listened to your Equine Assisted World episode with Nicole. I liked hearing that One Acre Farm's first class was on raising backyard chickens, and that you'd like to see a thousand One Acre Farms.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for One Acre Farm.

I'd like to hear how you mentor people who want to start one.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at Farm School enrollment.",
    stickyNote: "Catherine, a note from an outdoor microschool in Round Rock. J",
    shortCode: "oneacre-4j0r",
    checkBeforeMailing: [
      "3410 Magnolia Dr. is the mailing address the Contact page lists for One Acre Farm, but the About page calls the farm a small family homestead. Decide you're comfortable mailing there; if not, skip the letter.",
      "Address it to Catherine Ward at One Acre Farm. The About page bio also says Catherine Griffin and Community Impact used Griffin in 2022; the Contact page and the podcast use Ward.",
      "Listen to the episode's \"Starting Small\" and \"Mentorship\" chapters before mailing so you can talk about them if she calls.",
      "The episode is from June 2025; check her public pages for anything newer before mailing.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the July email, one detail from the snapshot, one proof number",
      subject: "Farm School tour applications",
      body: `Hi Catherine,

I mailed you a handwritten note last week with a card for One Acre Farm. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in July) and a one-page snapshot of what a family sees on your site today, from the tour form to the $395 monthly payments.

One thing stood out: before a tour, families fill in a Google Form with 29 required questions, one per child, then wait for you to find a slot.

I run Sage Field, an outdoor microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Catherine,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the One Acre Farm version: both Farm School pods, what a parent sees for tuition, and your admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Facebook (OneAcreFarmTX)",
      body: "Hi Catherine, I'm Julius. I run Sage Field, an outdoor microschool up in Round Rock. Loved reading about the farm jobs and nature journaling in your Elementary pod.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Catherine,

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
      body: `Hi Catherine,

I'll leave it here so I'm not cluttering your inbox. The One Acre Farm version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the spring tours.

Julius`,
    },
  ],
};
