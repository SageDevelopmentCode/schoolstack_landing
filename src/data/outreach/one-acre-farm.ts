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
    preparedOn: "2026-11-22",
    summary:
      "We read 19 pages of oneacrefarmtx.com on Nov 22, 2026, plus both Farm School pages, the tour application and the activity sign-ups.",
    pageSpeed: { mobileScore: 58, url: "https://oneacrefarmtx.com/", checkedOn: "2026-11-22" },
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
        readOn: "2026-11-22",
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
        readOn: "2026-11-22",
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
        readOn: "2026-11-22",
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
        readOn: "2026-11-22",
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
        readOn: "2026-11-22",
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
        readOn: "2026-11-22",
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
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you is made for phones first.",
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
      subject: "Farm School tour applications",
      body: `Hi Catherine,

I wrote in July about a version of MudKitchen I set up for One Acre Farm. Since then I put together a one-page snapshot of what a family sees on your site today, from the tour form to the $395 monthly payments.

One thing stood out: before a tour, families fill in a Google Form with 29 required questions, one per child, then wait for you to find a slot.

I run Sage Field, an outdoor microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot?

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
