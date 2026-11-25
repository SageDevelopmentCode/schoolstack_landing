import type { OutreachPlan } from "./types";

export const giftedCollectiveMicroschoolOutreach: OutreachPlan = {
  slug: "gifted-collective-microschool",
  schoolName: "Gifted Microschool at The Gifted Collective",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Adam",
    role: "Founder & Lead Teacher (Adam Laningham)",
    source: "Gifted Microschool, Microschool About Us (Meet the Team)",
  },
  angle:
    "One real question: tuition is billed monthly from August to May ($1,250 hybrid, $1,750 full time), ESA pays quarterly (about $6,800 a year), and ClassWallet charges can be added to the parent's share. How does Adam keep each family's ESA share and their own share straight month to month?",
  facts: [
    {
      fact: "The Gifted Microschool at The Gifted Collective (15255 N 40th St #147, Phoenix) meets Monday to Thursday 9:30–2:30, caps classes at 16, and runs an Advanced Learners Academy and a Unique Learners 2e Academy; families can choose a 2–3 day hybrid",
      source: "The Gifted Collective, Class Size, Schedules & Supplies and Microschool About Us",
      url: "https://thegiftedcollective.com/microschool-schedules",
      readOn: "2026-11-23",
    },
    {
      fact: "Tuition is billed monthly August to May: $1,250 hybrid and $1,750 full time for grades 2–8, $2,000 for grades 9–12; plus a $50 application fee, a $250/$350 yearly enrollment fee and a $350 semester curriculum fee",
      source: "The Gifted Collective, Microschool Enrollment",
      url: "https://thegiftedcollective.com/microschool-enrollment",
      readOn: "2026-11-23",
    },
    {
      fact: "The enrollment page says ESA pays quarterly (July, October, January, April), typically about $6,800 a year, and that ESA/ClassWallet charges may be added to the tuition the parent pays; the fee pages ask families to consider Zelle to avoid transaction fees",
      source: "The Gifted Collective, Microschool Enrollment and Application Step 1",
      url: "https://thegiftedcollective.com/microschool-enrollment",
      readOn: "2026-11-23",
    },
    {
      fact: "To schedule a tour, the Tours page asks families to email; the founder sets aside time through the week to visit with families",
      source: "The Gifted Collective, Tours",
      url: "https://thegiftedcollective.com/tours",
      readOn: "2026-11-23",
    },
    {
      fact: "In an October 2024 article for the Arizona Association for Gifted and Talented, Adam Laningham wrote that after over 20 years in public education he chose to open Arizona's first Gifted Microschool because the flexibility let him do what was best for gifted and twice-exceptional children",
      source: "Arizona Association for Gifted and Talented, Microschools Explained: A Growing Educational Alternative in Arizona",
      url: "https://arizonagifted.org/microschools-explained-a-growing-educational-alternative-in-arizona/",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds).",
    "The microschool is one program of The Gifted Collective, which also runs classes, parent nights, testing, tutoring and Saturday enrichment. The pitch is the microschool's enrollment and billing.",
    "Arizona ESA (ClassWallet) is work-alongside; we don't replace it.",
    "The CRM has a contact email on file; check it's the general inquiries address or Adam's before sending.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "GOLTieQlw1ryR7PVkqnclg",
    preparedOn: "2026-11-23",
    summary:
      "We read 60 pages of thegiftedcollective.com on Nov 23, 2026, including every microschool, enrollment and fee page.",
    pageSpeed: { mobileScore: 45, url: "https://thegiftedcollective.com/", checkedOn: "2026-11-23" },
    observations: [
      {
        area: "pay",
        gap: "Tuition is monthly, but ESA pays quarterly",
        saw: "Tuition is billed monthly from August to May. ESA pays in July, October, January and April, about $6,800 a year, and ClassWallet charges may be added to what the parent pays.",
        impact: "An ESA family can't see what each ESA payment covers and what they owe each month on top.",
        source: "The Gifted Collective, Microschool Enrollment",
        url: "https://thegiftedcollective.com/microschool-enrollment",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing"],
          text: "We'd set up billing with you so each family sees the ESA share and their own share month by month, alongside ClassWallet.",
        },
      },
      {
        area: "enroll",
        gap: "Each fee is its own checkout, with Zelle preferred",
        saw: "The $50 application fee and the $250 registration are separate store checkouts, and the semester curriculum fee is listed on its own. Each fee page asks families to consider Zelle so the school avoids transaction fees.",
        impact: "A family pays several fees in separate places, and chooses between a card fee for the school or sending Zelle by hand.",
        source: "The Gifted Collective, Application Step 1 and Registration Step 2",
        url: "https://thegiftedcollective.com/course-catalog/p/microschool-step-1-application-fee-k2be5-74gmh",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-fees", "card-and-ach"],
          text: "One enrollment checklist where families pay each fee by card or by bank, which keeps fees low.",
        },
      },
      {
        area: "apply",
        gap: "Two pages give different times to pay the $50 fee",
        saw: "The enrollment page says to pay the $50 fee if you're invited to an interview after screening. The Step 1 page asks families to fill in the application and pay the fee together, then schedule the interview.",
        impact: "A family can't tell whether to pay before or after they hear back.",
        source: "The Gifted Collective, Microschool Enrollment and Application Step 1",
        url: "https://thegiftedcollective.com/microschool-enrollment",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["online-application", "application-fee", "admissions-pipeline"],
          text: "One application that asks for the fee at the step you choose, with every applicant in one admin inbox.",
        },
      },
      {
        area: "tour",
        gap: "Tours are booked by email",
        saw: "The Tours page says the founder sets aside time each week to visit with families, and asks families to email to schedule a time.",
        impact: "A family writes in and waits for a reply before they can find a time to visit.",
        source: "The Gifted Collective, Tours",
        url: "https://thegiftedcollective.com/tours",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "admissions-pipeline"],
          text: "Families pick one of Adam's open tour times on the site, and each tour lands in your admin inbox.",
        },
      },
      {
        area: "find",
        gap: "Pages list different grades",
        saw: "The schedules page says the microschool serves grades 3–8. Tuition is listed for grades 2–8 and 9–12, and the application says grades K–12.",
        impact: "A family with a 2nd grader or a high schooler can't tell whether there's a place for them.",
        source: "The Gifted Collective, Class Size, Schedules & Supplies; Microschool Enrollment",
        url: "https://thegiftedcollective.com/microschool-schedules",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["programs-capacity", "website-service"],
          text: "Each grade band marked Open, Waitlist or Full, shown the same way on every page.",
        },
      },
      {
        area: "website",
        gap: "The enrollment page still opens for Fall 2026",
        saw: "The Microschool Enrollment page is headed \"Now accepting applications for Fall 2026\", while the Step 1 application is for 2027/28. One \"applied for the microschool\" link on it opens a page that isn't found.",
        impact: "A family applying now for next year reads last fall's headline and may follow a link that doesn't open.",
        source: "The Gifted Collective, Microschool Enrollment",
        url: "https://thegiftedcollective.com/microschool-enrollment",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and keep the site up to date for you, so the year and links stay current.",
        },
      },
      {
        area: "website",
        gap: "The home page is slow on a phone",
        saw: "Google PageSpeed scores the home page 45 out of 100 on mobile. The main content takes about 29 seconds to appear.",
        impact: "A parent opening the site on a phone waits a long time before seeing anything.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://thegiftedcollective.com/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with images sized for phones.",
        },
      },
    ],
    toolStack: [
      {
        name: "Google Forms",
        usedFor: "Microschool application and interest list",
        url: "https://thegiftedcollective.com/microschool-enrollment",
      },
      {
        name: "Squarespace store",
        usedFor: "Application fee and registration",
        url: "https://thegiftedcollective.com/course-catalog/p/microschool-step-1-application-fee-k2be5-74gmh",
      },
      {
        name: "Zelle",
        usedFor: "Fee payments without card fees",
        url: "https://thegiftedcollective.com/course-catalog/p/microschool-step-1-application-fee-k2be5-74gmh",
      },
      {
        name: "ClassDojo",
        usedFor: "Weekly teacher updates",
        url: "https://thegiftedcollective.com/micro-curriculum",
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "the Gifted Microschool",
    founder: {
      fullName: "Adam Laningham",
      firstName: "Adam",
      role: "Founder & Lead Teacher",
      source: "Gifted Microschool, Microschool About Us (Meet the Team)",
      url: "https://thegiftedcollective.com/microschool-about",
    },
    mailTo: {
      lines: ["Adam Laningham", "The Gifted Collective", "15255 N 40th St #147", "Phoenix, AZ 85032"],
      source: "The Gifted Collective site footer, on every page",
      url: "https://thegiftedcollective.com/",
    },
    founderFacts: [
      {
        fact: "In an October 2024 article for the Arizona Association for Gifted and Talented, Adam Laningham wrote that after over 20 years in public education he chose to open Arizona's first Gifted Microschool because the flexibility let him do what was best for gifted and twice-exceptional children.",
        source: "Arizona Association for Gifted and Talented, Microschools Explained: A Growing Educational Alternative in Arizona",
        url: "https://arizonagifted.org/microschools-explained-a-growing-educational-alternative-in-arizona/",
        readOn: "2026-11-23",
      },
      {
        fact: "Adam was named Arizona Gifted Teacher of the Year, is President of SENG, and the microschool now runs two academies: Advanced Learners and Unique Learners 2e.",
        source: "Gifted Microschool, Microschool About Us",
        url: "https://thegiftedcollective.com/microschool-about",
        readOn: "2026-11-23",
      },
    ],
    hook: "In an October 2024 article for the Arizona Association for Gifted and Talented, Adam Laningham wrote that after over 20 years in public education he chose to open Arizona's first Gifted Microschool because the flexibility let him do what was best for gifted and twice-exceptional children.",
    body: `Hi Adam,

You wrote that after more than 20 years in public education, you opened Arizona's first Gifted Microschool so you could do what was best for gifted and twice-exceptional kids. I loved reading the family stories on your site.

Stories like those are why I wanted to write. My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for the Gifted Microschool.

I'd love to hear what you've learned from running two academies side by side.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Adam, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "gifted-f2kh",
    checkBeforeMailing: [
      "The hook is Adam's own article for the Arizona Association for Gifted and Talented (Oct 2024). A 2023 Testing Psychologist podcast episode features him but doesn't name the school, so it isn't used.",
      "The address is the suite the school publishes in its footer (40th St & Greenway).",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about monthly tuition against quarterly ESA, then who's asking and one proof number, plus a broken-link aside",
      subject: "Monthly tuition and ESA",
      body: `Hi Adam,

I mailed you a handwritten note last week with a card for the Gifted Microschool.

Your enrollment page bills tuition monthly from August to May, while ESA pays quarterly and ClassWallet charges can be added to the family's share.

How do you keep each family's ESA share and their own share straight from month to month?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

One small thing: one "applied for the microschool" link on the enrollment page opens a page that isn't found.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Adam,

In case it's easier to see than describe, I set up a version of MudKitchen for the Gifted Microschool and recorded a 60-second walkthrough: a tour request landing in your admin inbox, the enrollment checklist with the registration fee, and a family's monthly tuition paid by card or bank.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello with no pitch",
      where: "Facebook (The Gifted Collective)",
      body: "Hi Adam, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Learning Binders instead of grades is a lovely way to show kids their own progress.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Adam,

I also put together a one-page snapshot of what a family sees on your site today, from the application to paying tuition. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Adam,

I'll leave it here so I'm not cluttering your inbox. The Gifted Microschool version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
