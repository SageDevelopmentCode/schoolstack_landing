import type { OutreachPlan } from "./types";

export const theFocusAcademyOutreach: OutreachPlan = {
  slug: "the-focus-academy",
  schoolName: "The FOCUS Academy",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Karolyn",
    role: "Founder",
    source:
      "FOCUS Founder's Bio page (Karolyn M. Miller, Founder, The FOCUS Academy) and Founder's Profile page; she is also the author of every blog post",
  },
  angle:
    "Proof + their process: the homepage lays out both options and tuition, then families only have a contact form, and the site doesn't say how enrollment and payment work after the conversation",
  facts: [
    {
      fact: "FOCUS offers a 4-Day option (Monday–Thursday, asynchronous Fridays) at $15,728 and a 2-Day option (Mon/Wed or Tue/Thu) at $9,909, both 8:30am–2:30pm, for homeschooled students registered independently or under an umbrella school",
      source: "FOCUS homepage, Program Options",
      url: "https://www.thefocusacademy.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "The homepage calls FOCUS \"a new microschool opening in the Memphis area for twice-exceptional middle school boys\" and says it is accepting applications for the 2026–27 school year",
      source: "FOCUS homepage",
      url: "https://www.thefocusacademy.org/",
      readOn: "2026-11-22",
    },
    {
      fact: "The only way to reach the school online is the Contact page form: parent name, email, street address and phone, plus name, age and grade for up to two children and a note, ending in \"Thanks for submitting!\"",
      source: "FOCUS Contact page",
      url: "https://www.thefocusacademy.org/contact-8",
      readOn: "2026-11-22",
    },
    {
      fact: "A FOCUS blog post says each student gets an individualized learning plan built with educators, parents and the student, and that parents get regular updates on progress",
      source: "FOCUS blog: How FOCUS Academy Empowers Neurodivergent Learners",
      url: "https://www.thefocusacademy.org/post/how-focus-academy-empowers-neurodivergent-learners",
      readOn: "2026-11-22",
    },
    {
      fact: "Karolyn posts on the blog regularly; the latest, on supporting a neurodivergent child through November, went up Oct 31, 2026",
      source: "FOCUS blog (post dates from the blog sitemap)",
      url: "https://www.thefocusacademy.org/post/when-the-school-year-gets-hard-5-ways-to-support-your-neurodivergent-child-through-november",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "The CRM row has no website. The school's site is https://www.thefocusacademy.org/ (title \"The FOCUS Academy | twice-exceptional | Memphis, TN\"); add it to the CRM.",
    "The CRM has no contact email and the site lists only a general school inbox (Contact page). Type the address in the send screen and confirm it reaches Karolyn.",
    "Unclear whether FOCUS opened this fall or is still pre-launch: the homepage says \"a new microschool opening\" and \"accepting applications for the 2026–27 school year\". The first email works either way; adjust the close if it hasn't opened.",
    "The Founder's Bio includes family details; none of it is used. Keep it that way.",
    "We'd build: Weekly learning plans for home days",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "hiZXPAN7fWZchsJRAC39JA",
    preparedOn: "2026-11-22",
    summary:
      "We read 33 pages of thefocusacademy.org on Nov 22, 2026, including the contact form, the blog and the booking and event pages.",
    pageSpeed: { mobileScore: 63, url: "https://www.thefocusacademy.org/", checkedOn: "2026-11-22" },
    observations: [
      {
        area: "apply",
        gap: "The contact form is the only way in, and it ends at \"Thanks\"",
        saw: "The Contact page form asks for the parent's name, email, street address and phone, plus name, age and grade for up to two children and a note about them. After Send it shows \"Thanks for submitting!\" and nothing about what happens next or when.",
        impact: "A family doesn't know whether to expect a call, an application or a visit, and a third child doesn't fit the form.",
        source: "FOCUS Contact page",
        url: "https://www.thefocusacademy.org/contact-8",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "Families start the conversation from your site with each child's details, and every inquiry lands in one admin inbox with its stage, from first call to yes.",
        },
      },
      {
        area: "enroll",
        gap: "The site doesn't say how a family enrolls after the conversation",
        saw: "Neither the homepage nor the Contact page mentions an application, an enrollment agreement, a deposit or a registration fee, or what a family sends in before their son starts.",
        impact: "Each family's enrollment runs on emails, and families can't see ahead of time what they'll be asked to sign or pay.",
        source: "FOCUS homepage",
        url: "https://www.thefocusacademy.org/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "After your yes, each family gets one checklist: the enrollment agreement signed online and any fee paid, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "Tuition is listed, but not when or how it's paid",
        saw: "The homepage gives tuition as $15,728 for the 4-Day option and $9,909 for the 2-Day option. It doesn't say whether that's paid monthly or up front, when it's due, or how families pay.",
        impact: "A family budgeting $15,728 a year has to ask before they know whether it can be spread out.",
        source: "FOCUS homepage, Program Options",
        url: "https://www.thefocusacademy.org/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "card-and-ach", "autopay"],
          text: "Families pick a payment plan, see what's due and paid in their portal, pay by card or bank, and can turn on autopay.",
        },
      },
      {
        area: "tour",
        gap: "There's no way to book a visit or a first call",
        saw: "The site has no visit or tour page. Families fill in the contact form to \"start a conversation\" and wait to hear back. The Book Online page lists paid coaching sessions, not visits.",
        impact: "Every first call or visit is arranged back and forth, and a family ready to pick a time tonight has nothing to click.",
        source: "FOCUS Contact page",
        url: "https://www.thefocusacademy.org/contact-8",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick a call or visit time from the slots you open, and the booking sits next to their inquiry in your admin inbox.",
        },
      },
      {
        area: "find",
        gap: "The homepage still says FOCUS is opening for 2026–27",
        saw: "The homepage calls FOCUS \"a new microschool opening in the Memphis area\" and says applications are open for the 2026–27 school year. It gives no location beyond the Memphis area, and doesn't say whether seats are left this year or mention 2027–28.",
        impact: "A family reading this in November can't tell whether their son could start mid-year or whether to apply for next fall.",
        source: "FOCUS homepage",
        url: "https://www.thefocusacademy.org/",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "programs-capacity"],
          text: "The site we build shows each option as Open, Waitlist or Full for the year families are choosing, and we keep the dates current.",
        },
      },
      {
        area: "updates",
        gap: "Learning plans and home days have no shared place on the site",
        saw: "A FOCUS blog post says each student gets an individualized learning plan built with educators, parents and the student, and that parents get regular progress updates. The 4-Day option has asynchronous Fridays and the 2-Day option leaves three days at home. The site doesn't say where families see those plans or updates.",
        impact: "On home days, the week's plan and the guide's notes reach parents piece by piece, in separate emails.",
        source: "FOCUS blog: How FOCUS Academy Empowers Neurodivergent Learners",
        url: "https://www.thefocusacademy.org/post/how-focus-academy-empowers-neurodivergent-learners",
        readOn: "2026-11-22",
        fix: {
          label: "set_up",
          capabilities: ["learning-plans", "messaging", "parent-portal"],
          text: "We'd set up weekly learning plans for home days in each family's login, next to two-way messages with their son's guide.",
        },
      },
      {
        area: "website",
        gap: "Pages outside the menu still show Wix sample content",
        saw: "The Events page lists three events, all on Fri, Jan 2, 2026, at a \"FOCUS Academy Innovation Center\" in Springfield, TN. The coaching pages under Book Online give a sample San Francisco address, the Refund Policy and Terms pages are Wix's template text, and the Founder's Bio social icons point to Wix's own accounts.",
        impact: "These pages are in the site's sitemap, so a family arriving from a search can land on another city's address before finding Memphis.",
        source: "FOCUS Events page",
        url: "https://www.thefocusacademy.org/event-details/focus-innovations-expo",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build carries only pages you've written, and we keep it current for you.",
        },
      },
      {
        area: "website",
        gap: "The homepage takes about 10 seconds to show on a phone",
        saw: "Google PageSpeed scored the homepage 63 out of 100 on mobile; the main content appears after about 10 seconds, on a 6.7 MB page.",
        impact: "A parent checking on a phone waits through the load before seeing the two options and tuition.",
        source: "Google PageSpeed Insights (mobile)",
        url: "https://www.thefocusacademy.org/",
        readOn: "2026-11-22",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "The site we build is made to load fast on a phone, and we keep it that way.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "FOCUS",
    founder: {
      fullName: "Karolyn Miller",
      firstName: "Karolyn",
      role: "Founder",
      source: "FOCUS Founder's Profile page (\"My name is Karolyn Miller\") and Founder's Bio page (Karolyn M. Miller, Founder, The FOCUS Academy)",
      url: "https://www.thefocusacademy.org/founder-s-profile",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "Karolyn Miller's Founder's Profile says she is a registered nurse with over 12 years of experience working within the educational space; she founded FOCUS, which its homepage calls a new microschool opening in the Memphis area for twice-exceptional middle school boys.",
        source: "The FOCUS Academy, Founder's Profile and homepage",
        url: "https://www.thefocusacademy.org/founder-s-profile",
        readOn: "2026-11-22",
      },
      {
        fact: "FOCUS's stated vision is a Christ-centered learning community where middle school boys can grow academically, socially and personally in a setting designed to recognize their strengths and support their challenges.",
        source: "The FOCUS Academy blog, When the School Year Gets Hard (Oct 31, 2026)",
        url: "https://www.thefocusacademy.org/post/when-the-school-year-gets-hard-5-ways-to-support-your-neurodivergent-child-through-november",
        readOn: "2026-11-22",
      },
    ],
    hook: "Karolyn Miller's Founder's Profile says she is a registered nurse with over 12 years of experience working within the educational space; she founded FOCUS, which its homepage calls a new microschool opening in the Memphis area for twice-exceptional middle school boys.",
    body: `Hi Karolyn,

I read your founder's profile. You've spent more than twelve years as a registered nurse working in education, and now you're opening FOCUS for twice-exceptional middle school boys in Memphis. Congratulations.

Stories like yours are why I wanted to write. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for FOCUS.

I'd love to hear how getting FOCUS started has gone.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Karolyn, a note from a microschool in Round Rock, Texas. J",
    shortCode: "focus-4bj1",
    checkBeforeMailing: [
      "Find a mailing address: thefocusacademy.org gives only \"the Memphis area\" (homepage, Contact, Founder's Profile and Bio pages, footer). The street addresses elsewhere on the site (the sample San Francisco address on the coaching pages, the Springfield, TN \"Innovation Center\" on the Events page) are Wix template placeholders: never use them. No other non-home lead found; check the Tennessee Department of Education non-public school list or ask in the first reply.",
      "The hook is from her own Founder's Profile, not an interview; no podcast or press piece turned up for her or FOCUS.",
      "The profile also mentions her own son; the letter leaves him out on purpose. Keep it that way, and keep the Founder's Bio family details out too.",
      "The homepage still says FOCUS is \"opening\" with applications for 2026–27. The ask (\"how getting FOCUS started has gone\") works whether or not it has opened.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Their own options and tuition, the gap after the contact form, then the Sage Field proof and a permission ask",
      subject: "after the FOCUS contact form",
      body: `Hi Karolyn,

I mailed you a handwritten note last week with a card for FOCUS.

The FOCUS homepage lays out both options plainly: four days at $15,728 or two at $9,909, 8:30 to 2:30, for homeschooled middle school boys. From there families start with the contact form, and the site doesn't say what comes after.

I run Sage Field, a microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it. I set up a version for FOCUS with your 4-Day and 2-Day options, from the first conversation to tuition; the card opens it.

Want me to send the link too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Karolyn,

I recorded a 60-second walkthrough of the FOCUS version: a family starting a conversation from your homepage, the enrollment checklist they get after your yes, and the page where they pay for the 4-Day or 2-Day option.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she posts, with no pitch",
      where: "Instagram (@thef0cusacademy, linked from the site footer)",
      body: "Hi Karolyn, I'm Julius. I run Sage Field, a small microschool in Round Rock, TX. Enjoyed your post on helping neurodivergent kids through a hard November.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Sage Field and Rooted Meadows proof",
      body: `Hi Karolyn,

I also put together a one-page snapshot of what a family sees on the FOCUS site today, from the contact form to tuition and home days. No reply needed:

{snapshot link}

For context, Sage Field went from 0 to 35 students in under 3 months on MudKitchen, and Rooted Meadows, a K–8 school in Idaho, opened on it this August.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Karolyn,

I'll leave it here so I'm not cluttering your inbox. The FOCUS version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with enrollment for next fall.

Julius`,
    },
  ],
};
