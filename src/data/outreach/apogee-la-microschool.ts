import type { OutreachPlan } from "./types";

export const apogeeLaMicroschoolOutreach: OutreachPlan = {
  slug: "apogee-la-microschool",
  schoolName: "Apogee LA",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Will and Sheila",
    role: "Founder & Head of Learning Center (Will Reusch) and Co-Founder & Director of Advancement (Sheila Bella Reusch)",
    source: "Apogee LA Meet the Team page",
  },
  angle:
    "One real question: full-time tuition is projected around $1,200 a month, with part-time and flexible options that aren't priced on the site. How do they keep part-time families' schedules and bills straight? Plus a helpful aside: the scholarship button opens a page that isn't found.",
  facts: [
    {
      fact: "Apogee LA is a faith-based, project-based learning center for ages 5 to 18 at The New Freedom Center in Chatsworth, with martial arts (jiu-jitsu) built into the week; pathways are Explorers (5–8), Trailblazers (9–14) and Innovators (15+). It is an affiliate of the Apogee Strong network",
      source: "Apogee LA, Home, Programs, Contact and site footer",
      url: "https://apogeela.com/programs",
      readOn: "2026-11-23",
    },
    {
      fact: "Full-time tuition is \"projected around $1,200 per month\", with flexible part-time options; families are asked to book a discovery call to discuss a program that fits their budget",
      source: "Apogee LA, Tuition & Fees",
      url: "https://apogeela.com/tuition-and-fees",
      readOn: "2026-11-23",
    },
    {
      fact: "The Scholarships page's \"Apply For Assistance\" button links to an apogeestrong.com page that returns Not Found",
      source: "Apogee LA, Scholarships & Financial Aid",
      url: "https://apogeela.com/scholarships-and-aid",
      readOn: "2026-11-23",
    },
    {
      fact: "The Book a Discovery Call page invites families to \"Schedule a free 15-minute discovery call today\"; its BOOK NOW button links back to the same page, and no booking calendar appears",
      source: "Apogee LA, Book a Discovery Call",
      url: "https://apogeela.com/book-a-call",
      readOn: "2026-11-23",
    },
    {
      fact: "Will Reusch has taught in Los Angeles since 2005 in public and private schools, holds California elementary and secondary credentials, and teaches homeschool families online through his platform, Patterdox",
      source: "Apogee LA, Meet the Team",
      url: "https://apogeela.com/meet-the-team",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Apogee LA is an affiliate of the Apogee Strong network (shared curriculum, community and values); the network may supply tools or decide on software.",
    "Tuition on the site is \"projected\", so the school may be new or still setting prices. The demo shows the pathways and the ~$1,200 figure only.",
    "Both founders get every step (\"Hi Will and Sheila\"); Will oversees admissions, so you could write to him alone.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "csBPlqL-yJl1noILgXlvnQ",
    preparedOn: "2026-11-23",
    summary:
      "We read all 14 pages of apogeela.com on Nov 23, 2026, plus the discovery call page and the scholarship link.",
    pageSpeed: { mobileScore: 66, url: "https://apogeela.com/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "tour",
        gap: "The discovery call button doesn't open a calendar",
        saw: "Book a Discovery Call says \"Schedule a free 15-minute discovery call today\". The BOOK NOW button links back to the same page, and no booking calendar appears.",
        impact: "A family ready to talk can't pick a time, so they have to fill in the contact form and wait.",
        source: "Apogee LA, Book a Discovery Call",
        url: "https://apogeela.com/book-a-call",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a discovery call or shadow day from open slots, with a confirmation sent automatically.",
        },
      },
      {
        area: "pay",
        gap: "The scholarship button opens a page that isn't found",
        saw: "The Scholarships page says cost shouldn't keep families out. Its \"Apply For Assistance\" button opens an apogeestrong.com page that returns Not Found.",
        impact: "A family who needs help with tuition hits a dead end at the one step that would let them apply.",
        source: "Apogee LA, Scholarships & Financial Aid",
        url: "https://apogeela.com/scholarships-and-aid",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["forms-documents", "discounts"],
          text: "A scholarship form families fill in inside their login, and awards applied on their monthly bill.",
        },
      },
      {
        area: "find",
        gap: "Part-time prices aren't on the site",
        saw: "Tuition & Fees says full-time tuition is \"projected around $1,200 per month\" with flexible part-time options, and asks families to book a call to discuss a program that fits their budget.",
        impact: "A homeschool family looking for two or three days a week can't see what it costs before a call.",
        source: "Apogee LA, Tuition & Fees",
        url: "https://apogeela.com/tuition-and-fees",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tuition-rate-plans", "website-service"],
          text: "Full-time and part-time tuition set up once and shown on the site, matching what families are billed.",
        },
      },
      {
        area: "apply",
        gap: "Apply Now comes before the conversation",
        saw: "Admissions says the process starts with a conversation and a family interview. The Apply Now buttons go straight to a long application with six essay questions, with no way to save and come back.",
        impact: "A family not yet sure Apogee fits writes essays before anyone has talked with them.",
        source: "Apogee LA, Admissions Process and Apply Now",
        url: "https://apogeela.com/start-your-application-today-5779-4301",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "A short inquiry first, then an application families save as they go, with every family's step in one admin inbox.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 66 out of 100 on mobile. The main content takes about 9 seconds to appear, and the page is about 6.3 MB.",
        impact: "A parent opening the site on a phone waits several seconds before seeing anything.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://apogeela.com/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with images sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Apogee LA",
    founder: {
      fullName: "Will Reusch and Sheila Bella Reusch",
      firstName: "Will and Sheila",
      role: "Founder & Head of Learning Center; Co-Founder & Director of Advancement",
      source: "Apogee LA, Meet the Team",
      url: "https://apogeela.com/meet-the-team",
    },
    mailTo: {
      lines: ["Will and Sheila Reusch", "Apogee LA", "The New Freedom Center", "19809 Prairie St", "Chatsworth, CA 91311"],
      source: "Apogee LA Contact page (\"The New Freedom Center, 19809 Prairie St, Chatsworth, CA 91311\")",
      url: "https://apogeela.com/contact",
    },
    founderFacts: [
      {
        fact: "On Drinkin' Bros Podcast episode 1583, \"Where Is The Future Of Education Headed?\" (December 8, 2025), Will Reusch talked about the modern education system and how Apogee can play a huge role in its future.",
        source: "Apple Podcasts, Drinkin' Bros Podcast, Episode 1583",
        url: "https://podcasts.apple.com/us/podcast/episode-1583-where-is-the-future-of-education-headed/id1061361026?i=1000740255567",
        readOn: "2026-11-23",
      },
      {
        fact: "Will says on Meet the Team: after 20 years in education, he wanted a space where truth, physicality and curiosity weren't just tolerated but celebrated.",
        source: "Apogee LA, Meet the Team",
        url: "https://apogeela.com/meet-the-team",
        readOn: "2026-11-23",
      },
    ],
    hook: "On Drinkin' Bros Podcast episode 1583, \"Where Is The Future Of Education Headed?\" (December 8, 2025), Will Reusch talked about the modern education system and how Apogee can play a huge role in its future.",
    body: `Hi Will and Sheila,

Will, I enjoyed hearing you on the Drinkin' Bros podcast last December, talking about where education is headed and the part Apogee can play. Jiu-jitsu and real-world projects in the same school week is a great picture of that.

That's the kind of school we love hearing about. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Apogee LA.

I'd love to hear what families notice first when they visit.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your admissions.",
    stickyNote: "Will and Sheila, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "apogee-k2w8",
    checkBeforeMailing: [
      "The address is the venue on the Contact page (\"The New Freedom Center\"); confirm mail there reaches Apogee LA.",
      "The hook episode's description names Apogee; it's 1h 52m, so skim it before copying the letter out. Other podcast hits (CEO Glow Show) are about their marriage and money; the letter leaves them out.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about part-time billing (with the broken scholarship link as a helpful aside), then who's asking and one proof number",
      subject: "Part-time families at Apogee",
      body: `Hi Will and Sheila,

I mailed you a handwritten note last week with a card for Apogee LA.

Your Tuition page puts full time at around $1,200 a month, with flexible part-time options for homeschool families. One small thing: the Apply For Assistance button on your Scholarships page opens a page that isn't found.

How do you keep part-time families' days and bills straight from month to month?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Will and Sheila,

In case it's easier to see than describe, I set up a version of MudKitchen for Apogee LA and recorded a 60-second walkthrough: a discovery call request landing in your admin inbox, the enrollment checklist, and the monthly billing page families would pay from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Apogee LA is, with no pitch",
      where: "Instagram (@apogeela) or Facebook (Apogee La)",
      body: "Hi Will and Sheila, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Jiu-jitsu as part of the school week is a great idea.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Will and Sheila,

I also put together a one-page snapshot of what a family sees on your site today, from booking a call to applying for a scholarship. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Will and Sheila,

I'll leave it here so I'm not cluttering your inbox. The Apogee LA version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
