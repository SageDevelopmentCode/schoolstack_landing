import type { OutreachPlan } from "./types";

export const esteamAcademyRoundRockOutreach: OutreachPlan = {
  slug: "esteam-academy-round-rock",
  schoolName: "ESTEAM Academy",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Nicholle",
    role: "Founder (Nicholle Walton-Durban)",
    source:
      "ESTEAM Our Team page (\"We, Nicholle Walton-Durban and JoAnn Nolte\") and Round the Rock's TEFA series (\"Nicholle Walton-Durban is the Founder of ESTEAM Academy\")",
  },
  priorContact: {
    when: "May",
    what: "A hand-sent first email with a link to the ESTEAM MudKitchen demo",
  },
  angle:
    "Re-contact with the Family experience snapshot. Why now: ESTEAM is a TEFA participating school, and at $14,900 for the 5-day program a TEFA family still owes about $4,426 on top of the $10,474 the state pays, so one learner has two payers.",
  facts: [
    {
      fact: "ESTEAM Academy is an Acton Academy affiliate, \"learner-driven in Round Rock since 2014\", and \"a TEFA participating school\"",
      source: "ESTEAM Academy home page",
      url: "https://esteamacademyrr.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "TEA set the 2026–27 TEFA amount at $10,474 per child at an approved private school",
      source: "Texas Education Freedom Accounts, For Schools",
      url: "https://educationfreedom.texas.gov/schools/",
      readOn: "2026-11-23",
    },
    {
      fact: "Programs page: 5-day $14,900/year ($500 + $1,200/month, August–July), 4-day $13,100, 3-day $10,500 ($1,000/month), 2-day hybrid $8,150 ($850/month); a $500 non-refundable enrollment fee; families commit to the full year",
      source: "ESTEAM Academy, Programs",
      url: "https://esteamacademyrr.com/programs/",
      readOn: "2026-11-23",
    },
    {
      fact: "The Tuition page lists different prices: 3-day $1,112/month for 9 months, 2-day $890/month, a Remote Learners program at $310/month and no 4-day option; the home page lists 3-day at $1,000 for 10 months and 2-day at $850; the Remote Learners program page returns a 404",
      source: "ESTEAM Academy, Tuition and home page",
      url: "https://esteamacademyrr.com/programs/tuition/",
      readOn: "2026-11-23",
    },
    {
      fact: "Nicholle wrote a four-part series for Round the Rock, \"Understanding Texas ESAs/TEFAs: What Round Rock Families Need to Know\", starting with \"Education Freedom Is Personal: Why Texas EFAs Matter to Families Like Mine\"",
      source: "Round the Rock, Understanding Texas ESAs/TEFAs",
      url: "https://roundtherocktx.com/?p=55740",
      readOn: "2026-11-23",
    },
    {
      fact: "Onboarding asks families to complete and return eight items by the start date, including enrollment forms and financial agreement, first month's tuition, an auto pay form, parent contracts, a Family Mission Statement badge quest, a volunteer form, a birth certificate and immunization records",
      source: "ESTEAM Academy, Apply Now",
      url: "https://esteamacademyrr.com/apply-now/",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in May (the first email says so).",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). TEFA payments go through Odyssey; MudKitchen works alongside it.",
    "ESTEAM is in Round Rock too, about as close as a school can be to Sage Field. The letter asks for coffee; keep the tone neighborly.",
    "Applications run through Enrollsy and visits through a LeadConnector booking page; both work for families today, so the snapshot doesn't call them broken.",
    "Nicholle also runs ESTEAM EDU (consulting) and ESTEAM Learning Labs (camps). The plan is only about the Academy.",
    "Instagram (esteam_academy), Facebook (esteamacademyrr) and LinkedIn are linked on the home page.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "LD7vS6QCHQBmEsRuF1iXzQ",
    preparedOn: "2026-11-23",
    summary:
      "We read 60 pages of esteamacademyrr.com on Nov 23, 2026, including Programs, Tuition, Apply Now, the FAQ and the Parent Portal.",
    pageSpeed: { mobileScore: 53, url: "https://esteamacademyrr.com/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Enrollsy",
        usedFor: "Application",
        url: "https://esteamacademyrr.com/apply-now/",
      },
      {
        name: "LeadConnector booking",
        usedFor: "Intro calls and facility tours",
        url: "https://esteamacademyrr.com/schedule_a_visit/",
      },
      {
        name: "Password-protected web page",
        usedFor: "Parent Portal",
        url: "https://esteamacademyrr.com/parent-portal/",
      },
      {
        name: "ESTEAM Learning Labs site",
        usedFor: "Summer camps",
        url: "https://esteamacademyrr.com/programs/",
      },
    ],
    observations: [
      {
        area: "pay",
        gap: "TEFA families pay from two places",
        saw: "ESTEAM is a TEFA participating school. The 5-day program is $14,900 a year, and TEFA pays $10,474 for 2026–27, so a full-time TEFA family still owes about $4,426. The site doesn't say how that share is billed.",
        impact: "A TEFA family can't see their own share, or how it's split across the year, until they ask.",
        source: "ESTEAM Academy, home page and Programs; Texas Education Freedom Accounts",
        url: "https://esteamacademyrr.com/programs/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "autopay"],
          text: "We'd set up each family's billing page to show the TEFA share and their own, with autopay for their part.",
        },
      },
      {
        area: "find",
        gap: "Three pages, three price lists",
        saw: "The home page lists the 3-day program at $1,000 a month for 10 months and the 2-day at $850. The Tuition page says $1,112 for 9 months and $890, adds a $310 Remote Learners program and has no 4-day option. The Programs page matches the home page.",
        impact: "A family can't tell what the 3-day or 2-day program actually costs, or whether Remote Learners is still offered.",
        source: "ESTEAM Academy, home page, Tuition and Programs",
        url: "https://esteamacademyrr.com/programs/tuition/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "parent-plan-choice", "website-service"],
          text: "Each program's price set up once and shown the same on every page, so families pick from the plans you actually bill.",
        },
      },
      {
        area: "website",
        gap: "A placeholder paragraph and a missing page",
        saw: "The Programs page ends with \"Lorem ipsum dolor sit amet\" placeholder text, and the Remote Learners program page returns page not found.",
        impact: "A parent reading about programs sees template text, and one listed program leads nowhere.",
        source: "ESTEAM Academy, Programs",
        url: "https://esteamacademyrr.com/programs/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We write and look after the site for you, with every page checked.",
        },
      },
      {
        area: "enroll",
        gap: "Eight onboarding items to return",
        saw: "Before the start date, families complete and return enrollment forms and a financial agreement, first month's tuition, an auto pay form, parent contracts, a Family Mission Statement, a volunteer form, a birth certificate and immunization records.",
        impact: "Families keep track of eight separate items, and the site doesn't say where they can see which are done.",
        source: "ESTEAM Academy, Apply Now",
        url: "https://esteamacademyrr.com/apply-now/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "forms-documents", "autopay"],
          text: "One onboarding checklist: contracts and the financial agreement signed online, documents uploaded, autopay set up, with reminders until it's done.",
        },
      },
      {
        area: "updates",
        gap: "The Parent Portal is one password-protected page",
        saw: "The Parent Portal link opens a page that asks for a password.",
        impact: "Everyone with the password sees the same page; nothing in it is specific to a family or learner.",
        source: "ESTEAM Academy, Parent Portal",
        url: "https://esteamacademyrr.com/parent-portal/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["parent-portal"],
          text: "A private login for each family, with their own billing, forms and messages.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 53 out of 100 on mobile. The main content takes about 15 seconds to appear, and the page is about 3.8 MB.",
        impact: "A parent opening the site on a phone may give up before they see anything about ESTEAM.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://esteamacademyrr.com/",
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
    shortSchoolName: "ESTEAM",
    founder: {
      fullName: "Nicholle Walton-Durban",
      firstName: "Nicholle",
      role: "Founder",
      source: "Round the Rock, Understanding Texas ESAs/TEFAs (\"Meet the Expert\")",
      url: "https://roundtherocktx.com/?p=55740",
    },
    mailTo: {
      lines: ["Nicholle Walton-Durban", "ESTEAM Academy", "12 Lake Drive", "Round Rock, TX 78665"],
      source: "ESTEAM Academy home page footer (\"ADDRESS: 12 Lake Drive, Round Rock, TX 78665\")",
      url: "https://esteamacademyrr.com/",
    },
    founderFacts: [
      {
        fact: "Nicholle wrote a four-part series for Round the Rock on Texas Education Freedom Accounts, starting with \"Education Freedom Is Personal: Why Texas EFAs Matter to Families Like Mine.\"",
        source: "Round the Rock, Understanding Texas ESAs/TEFAs",
        url: "https://roundtherocktx.com/?p=55740",
        readOn: "2026-11-23",
      },
      {
        fact: "Nicholle was the guest on episode 26 of Rock Solid: Round Rock Business Leaders Podcast (June 12, 2025), \"E.S.T.E.A.M Academy: The Power of Asking Why - Unleashing Natural Curiosity in Learning\".",
        source: "Rock Solid: Round Rock Business Leaders Podcast (Apple Podcasts listing)",
        url: "https://podcasts.apple.com/us/podcast/rock-solid-round-rock-business-leaders-podcast/id1790302670",
        readOn: "2026-11-23",
      },
      {
        fact: "ESTEAM Academy has been learner-driven in Round Rock since 2014.",
        source: "ESTEAM Academy home page",
        url: "https://esteamacademyrr.com/",
        readOn: "2026-11-23",
      },
    ],
    hook: "Nicholle wrote a four-part series for Round the Rock on Texas Education Freedom Accounts, starting with \"Education Freedom Is Personal: Why Texas EFAs Matter to Families Like Mine.\"",
    body: `Hi Nicholle,

I read your TEFA series for Round the Rock, starting with "Education Freedom Is Personal." ESTEAM has been learner-driven in Round Rock since 2014, and now you're helping other families work out TEFA too.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for ESTEAM.

If you're ever up for coffee, I'd like to hear how your first TEFA year is going.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Nicholle, a note from a microschool across town. J",
    shortCode: "esteam-c9h5",
    checkBeforeMailing: [
      "The address is the school's own, from the home page footer (directories list it as 12 or 12a Lake Drive).",
      "Read at least Part 1 of the Round the Rock series before mailing; the letter names it.",
      "She was also on Rock Solid: Round Rock Business Leaders Podcast (June 2025, \"The Power of Asking Why\"); if you listen to it, it would make an equally good opening line.",
      "JoAnn Nolte is a co-founder on the Our Team page; the letter goes to Nicholle, whose email is the school's contact and who wrote the series.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the May email, the TEFA two-payer detail from the snapshot, one proof number, offer the snapshot",
      subject: "TEFA families at ESTEAM",
      body: `Hi Nicholle,

I mailed you a handwritten note last week with a card for ESTEAM. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in May) and a one-page snapshot of what a family sees on your site today.

One thing stood out: at $14,900 for the 5-day program and $10,474 from TEFA, a full-time TEFA family still owes about $4,426, so one learner has two payers.

I run Sage Field, a small outdoor microschool here in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Nicholle,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the ESTEAM version: an inquiry landing in your admin inbox, the onboarding checklist, and the billing page a TEFA family would see.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where ESTEAM is, with no pitch",
      where: "Instagram (@esteam_academy), Facebook (esteamacademyrr) or LinkedIn, all linked on the home page",
      body: "Hi Nicholle, I'm Julius. I run Sage Field, a small outdoor microschool here in Round Rock. Your TEFA series in Round the Rock is a clear guide for local families.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Nicholle,

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
      body: `Hi Nicholle,

I'll leave it here so I'm not cluttering your inbox. The ESTEAM version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the next Quest.

Julius`,
    },
  ],
};
