import type { OutreachPlan } from "./types";

export const lighthouseHomeschoolOutreach: OutreachPlan = {
  slug: "lighthouse-homeschool",
  schoolName: "Lighthouse Homeschool Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Robyn",
    role: "Contact for Lighthouse Homeschool Academy (title unknown)",
    source:
      "UNCONFIRMED: a web search summary of Lighthouse's Alignable listing names Robyn Pinkowski as the contact; the listing itself refused automated reads (HTTP 429). lighthousehomeschool.com and the Facebook page name no staff.",
  },
  angle: "Re-contact with a snapshot: applying starts with setting up a co-op member account, and fees are invoiced by email",
  priorContact: {
    when: "July",
    what: "A hand-sent first email with a link to the Lighthouse MudKitchen demo",
  },
  facts: [
    {
      fact: "Hybrid program: 2 days on campus (drop-off 8:20, pickup 2:20 in Fairview Park) and 3 days at home, with monthly lesson plans from the teachers",
      source: "How Hybrid Homeschooling Works at Lighthouse",
      url: "https://www.lighthousehomeschool.com/custom/93067",
      readOn: "2026-11-22",
    },
    {
      fact: "Tuition is $2,350 a year, paid as 10 monthly payments of $235 from August to May, plus a $150 enrollment fee once the application is approved",
      source: "Admissions for Lighthouse Homeschool Academy",
      url: "https://www.lighthousehomeschool.com/custom/93072",
      readOn: "2026-11-22",
    },
    {
      fact: "The Family Application (Homeschool-Life) has a $40 per-family fee, invoiced by email, and starts by creating a family username and password",
      source: "Lighthouse Homeschool Academy - Family Application",
      url: "https://www.lighthousehomeschool.com/application",
      readOn: "2026-11-22",
    },
    {
      fact: "The site's sitemap also lists a Google Forms Admission Application under the name Lighthouse Christian Cooperative Academy",
      source: "Lighthouse sitemap and Google Forms Admission Application",
      url: "https://www.lighthousehomeschool.com/sitemap.xml",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the recipient's first name: the site and Facebook name no staff; a search summary of the Alignable listing gave Robyn Pinkowski, but we couldn't open it. Change firstName (and every greeting) if Julius wrote to someone else in July.",
    "Confirm the earlier email went out in July (the first email says so); the CRM row was last updated 2026-07-31.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "Lighthouse runs on Homeschool-Life (member logins, directory, conversations): decide whether to pitch replacing it.",
  ],
  snapshot: {
    token: "qYbOOGVpH2f2SNk6oXHEnw",
    preparedOn: "2026-12-01",
    summary:
      "We read every public page of lighthousehomeschool.com on Dec 1, 2026, including the Family Application and the Admission Application form listed in its sitemap.",
    toolStack: [
      { name: "Homeschool-Life", usedFor: "Family Application and member account", url: "https://www.lighthousehomeschool.com/application" },
      { name: "Google Forms", usedFor: "Admission Application (listed in the site's sitemap)", url: "https://www.lighthousehomeschool.com/sitemap.xml" },
    ],
    observations: [
      {
        area: "find",
        gap: "The site doesn't say which grades Lighthouse teaches",
        saw: "Who We Are, How It Works, Admissions and the FAQ describe the 2-day hybrid model and tuition, and mention a curriculum list for \"your child's grade\". None of them says which grades or ages Lighthouse takes.",
        impact: "A parent of a middle schooler has to call or email just to find out whether to keep reading.",
        source: "Lighthouse Homeschool Hybrid Program",
        url: "https://www.lighthousehomeschool.com/custom/93028",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build for you puts your grades, days, hours and tuition on the first page a family sees.",
        },
      },
      {
        area: "tour",
        gap: "Tours and information meetings are booked by email or phone",
        saw: "Who We Are asks families to email to request a tour, the home page asks them to inquire about Information Meetings, and Admissions suggests calling to chat.",
        impact: "Each visit takes a few messages to set up, and a family reading the site at night waits until someone answers.",
        source: "Admissions for Lighthouse Homeschool Academy",
        url: "https://www.lighthousehomeschool.com/custom/93072",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a tour or information meeting time from the slots you open, and get a reminder before they come.",
        },
      },
      {
        area: "apply",
        gap: "Two application forms, one under an older name",
        saw: "The Application menu opens a Homeschool-Life Family Application that starts with a family username and password, directory privacy and email notification settings. The sitemap also lists a Google Forms Admission Application titled for Lighthouse Christian Cooperative Academy.",
        impact: "Applications can arrive in two places, and a new family sets up a co-op member account before they know they're accepted.",
        source: "Lighthouse Homeschool Academy - Family Application",
        url: "https://www.lighthousehomeschool.com/application",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "One application about the family and children, saved as they go, with every application in one admin inbox. Accounts come after you accept them.",
        },
      },
      {
        area: "apply",
        gap: "The $40 application fee is invoiced by email",
        saw: "The Family Application says there's a $40 fee per family, it must be paid before enrollment is approved, and an invoice will be emailed.",
        impact: "You send and chase an invoice for each new family before you can move them forward.",
        source: "Lighthouse Homeschool Academy - Family Application",
        url: "https://www.lighthousehomeschool.com/application",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["application-fee"],
          text: "The application takes the $40 fee by card or bank when it's submitted, and the receipt goes out on its own.",
        },
      },
      {
        area: "enroll",
        gap: "After approval, the next steps aren't written down",
        saw: "A $150 enrollment fee secures the spot once the application is approved, and a curriculum list for the child's grade comes after registering. The site doesn't say how the fee is paid or what else enrollment involves.",
        impact: "Each approved family asks what to do next, and you track who has paid and who has the book list yourself.",
        source: "Admissions for Lighthouse Homeschool Academy",
        url: "https://www.lighthousehomeschool.com/custom/93072",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-fees", "enrollment-agreements"],
          text: "Approved families get one checklist: the agreement signed online, the $150 fee paid inside it, and the curriculum list, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "The site doesn't say how monthly tuition is paid",
        saw: "Tuition is $2,350 a year in 10 payments of $235 from August to May. The site doesn't say how families pay each month or whether payments can be automatic.",
        impact: "Ten times a year you check which families have paid, and families keep track of the due date themselves.",
        source: "How Hybrid Homeschooling Works at Lighthouse",
        url: "https://www.lighthousehomeschool.com/custom/93067",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "autopay", "card-and-ach"],
          text: "Each family sees their $235 monthly bill in their portal and can turn on autopay by card or bank.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Lighthouse",
    founder: {
      fullName: "Robyn (last name unconfirmed)",
      firstName: "Robyn",
      role: "Contact for Lighthouse Homeschool Academy (title unknown, unconfirmed)",
      source:
        "UNCONFIRMED: not named on this site. Robyn is the plan's existing email greeting, from a web search summary of Lighthouse's Alignable listing (Robyn Pinkowski) that we couldn't open. lighthousehomeschool.com, its FAQ and TheHomeSchoolMom listing name no staff.",
      url: "https://www.lighthousehomeschool.com/",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Each month Lighthouse's teachers for each grade create lesson plans for use both at home and on campus, so parents teaching the 3 home days have the tools and direction to be confident.",
        source: "How Hybrid Homeschooling Works at Lighthouse",
        url: "https://www.lighthousehomeschool.com/custom/93067",
        readOn: "2026-11-22",
      },
      {
        fact: "Lighthouse is a Christ-centered hybrid program that meets in Fairview Park, Ohio twice a week for six hours a day: 2 days on campus, drop-off, and 3 days at home.",
        source: "Lighthouse Homeschool Academy, Who We Are",
        url: "https://www.lighthousehomeschool.com/custom/93028",
        readOn: "2026-11-22",
      },
    ],
    hook: "Each month Lighthouse's teachers for each grade create lesson plans for use both at home and on campus, so parents teaching the 3 home days have the tools and direction to be confident.",
    body: `Hi Robyn,

I read how Lighthouse works on your site and loved that your teachers write lesson plans for each grade every month, used both on campus and on the three days at home.

Running a small school ourselves, I know how much that takes. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Lighthouse.

I'd love to hear how new families settle into the home days in their first year.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Robyn, a note from a small school in Round Rock, Texas. J",
    shortCode: "lighthouse-vg8b",
    checkBeforeMailing: [
      "Find a mailing address: lighthousehomeschool.com (home, Who We Are, How It Works, Admissions, FAQ, Donate) and the TheHomeSchoolMom listing give only \"Fairview Park, Ohio\"; the FAQ says tuition covers building rental but doesn't name the building. Non-home lead: ask at an Information Meeting, or through the inquiry contact on the home page, which church or building hosts the campus days and whether it takes mail for Lighthouse.",
      "No founder or leader is named anywhere we could open, so the letter opens on a school fact (the monthly lesson plans) instead of a founder story. \"Robyn\" is the plan's email greeting, from an unconfirmed search summary of the Alignable listing (Robyn Pinkowski); a search for that name with Lighthouse found nothing. Confirm who leads Lighthouse and change the greeting, sticky note and founder fields if it's someone else.",
      "The first email still says Julius wrote in July; confirm that email went out.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the July email, one detail from the snapshot, one proof number",
      subject: "Lighthouse's family application",
      body: `Hi Robyn,

I mailed you a handwritten note last week with a card for Lighthouse. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in July) and a one-page snapshot of what a family sees on your site today, from finding a tour to paying tuition.

One thing stood out: the Family Application asks a new family to create a username and password and choose directory settings before they tell you about their children.

I run Sage Field, a microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Robyn,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Lighthouse version: the homepage with your 2-day hybrid model, the application, and what a parent sees for monthly tuition.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Instagram (Lighthouse_homeschoolacademy) or Facebook (LighthouseHomeschoolAcademy)",
      body: "Hi Robyn, I'm Julius. I run Sage Field, a microschool in Round Rock, TX. Monthly lesson plans for the home days is a thoughtful way to back up parents.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Robyn,

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
      body: `Hi Robyn,

I'll leave it here so I'm not cluttering your inbox. The Lighthouse version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the school year.

Julius`,
    },
  ],
};
