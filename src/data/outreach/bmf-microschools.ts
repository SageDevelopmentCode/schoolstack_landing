import type { OutreachPlan } from "./types";

export const bmfMicroschoolsOutreach: OutreachPlan = {
  slug: "bmf-microschools",
  schoolName: "BMF Microschools (School to Purpose Academies)",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Tiffany",
    role: "Microschool Director, School to Purpose Academies (Tiffany Dudley)",
    source: "BMF Microschools About Us (\"Ms. Tiffany Dudley, Microschool Director\") and Enroll/Tour page (\"please contact Tiffany Dudley\")",
  },
  angle:
    "One real question: tuition can be fully covered by Arizona's ESA, and extra classes are paid through ClassWallet too. Across four academies and a virtual option, how does the Director track whose ESA payments have come through each quarter? Plus a helpful aside: the home page's tour link opens a page that isn't found.",
  facts: [
    {
      fact: "School to Purpose Academies are the Black Mothers Forum's accredited microschools in Phoenix: Moore Academy (Pre-K–3rd), King Academy (4th–8th), Love Academy (high school) and the Hamer virtual learning community, with 10–12 students per microschool and one coach; first opened in January 2021",
      source: "BMF Microschools, Home and About Us",
      url: "https://bmfmicroschools.org/about-us",
      readOn: "2026-11-23",
    },
    {
      fact: "The site says tuition can be fully covered by Arizona's Empowerment Scholarship Account; the home page's \"Free Tuition\" banner links to the state ESA site, and Outschool extra classes are paid through ESA and ClassWallet",
      source: "BMF Microschools, Home and Learning Model",
      url: "https://bmfmicroschools.org/learning-model",
      readOn: "2026-11-23",
    },
    {
      fact: "The home page's \"Schedule your tour today!\" link opens a page that returns Not Found; the Enroll/Tour page's \"Schedule My Tour\" button opens a Calendly booking page",
      source: "BMF Microschools, Home and Enroll/Tour",
      url: "https://bmfmicroschools.org/",
      readOn: "2026-11-23",
    },
    {
      fact: "Enroll/Tour offers \"Contact Us\" and \"Begin Enrollment\" buttons that open Spark Your School forms; families complete an enrollment interest form and the school contacts them to finalize enrollment",
      source: "BMF Microschools, Enroll/Tour",
      url: "https://bmfmicroschools.org/enroll%2Ftour",
      readOn: "2026-11-23",
    },
    {
      fact: "Students in the Living on Purpose Community Meal Service Project prepare and distribute free meals to the community, with no applications or qualifications",
      source: "BMF Microschools, Home",
      url: "https://bmfmicroschools.org/",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). ESA payments go through ClassWallet; MudKitchen works alongside it.",
    "Enrollment forms run through Spark Your School; ask what they use before pitching enrollment as new.",
    "This is one organization (one office and director) running four academies and a virtual option, not a multi-site network; the demo treats the academies as programs.",
    "The CRM already has an email on file; check it's Tiffany's or the microschools office address.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "KwyACAtlINXzYukBgDNJPA",
    preparedOn: "2026-11-23",
    summary:
      "We read all 8 pages of bmfmicroschools.org on Nov 23, 2026, plus the tour and enrollment links.",
    pageSpeed: { mobileScore: 57, url: "https://bmfmicroschools.org/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Calendly",
        usedFor: "Campus tours",
        url: "https://bmfmicroschools.org/enroll%2Ftour",
      },
      {
        name: "Spark Your School",
        usedFor: "Enrollment interest and contact forms",
        url: "https://bmfmicroschools.org/enroll%2Ftour",
      },
      {
        name: "Mailchimp",
        usedFor: "Newsletter sign-up",
        url: "https://bmfmicroschools.org/",
      },
      {
        name: "Stripe",
        usedFor: "Dinner Table program and meal donations",
        url: "https://bmfmicroschools.org/dinner-table",
      },
    ],
    observations: [
      {
        area: "tour",
        gap: "The home page's tour link opens a page not found",
        saw: "The home page says \"Better yet, see us in person! Schedule your tour today!\" That link opens a page that returns Not Found. The Calendly booking only appears on the Enroll/Tour page.",
        impact: "A family who wants to visit from the home page hits a dead end and has to find the right page themselves.",
        source: "BMF Microschools, Home and Enroll/Tour",
        url: "https://bmfmicroschools.org/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "website-service"],
          text: "One tour booking button on every page, opening open times for each academy.",
        },
      },
      {
        area: "apply",
        gap: "Enrollment starts with an interest form",
        saw: "Enroll/Tour has \"Contact Us\" and \"Begin Enrollment\" buttons opening separate forms, plus an Enrollment Interest/Questions page. After the interest form, the school contacts families to finalize enrollment.",
        impact: "A family ready to enroll fills in a form, then waits for a call before they know what else is needed.",
        source: "BMF Microschools, Enroll/Tour and Enroll",
        url: "https://bmfmicroschools.org/enroll%2Ftour",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline", "enrollment-checklist"],
          text: "One enrollment form per child, saved as they go, then a checklist that shows families exactly what's left.",
        },
      },
      {
        area: "pay",
        gap: "Families can't see what ESA will cover",
        saw: "The site says tuition can be fully covered by ESA and links the Free Tuition banner to the state ESA site. It doesn't list tuition, and Outschool classes are paid separately through ClassWallet.",
        impact: "An ESA family can't see what their account will be charged each quarter, and a family without ESA can't see a price.",
        source: "BMF Microschools, Home and Learning Model",
        url: "https://bmfmicroschools.org/learning-model",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "website-service"],
          text: "We'd set up each family's billing page to show what ESA pays and anything left over, with tuition stated on the site.",
        },
      },
      {
        area: "find",
        gap: "The high school section still says 2025–2026",
        saw: "The Learning Model page says the Pathways Early College high school is \"now accepting applications for the 2025-2026 school year\", while the home page says enrollment is open for 2026–2027.",
        impact: "A high school family can't tell whether Love Academy is taking students for this year.",
        source: "BMF Microschools, Learning Model and Home",
        url: "https://bmfmicroschools.org/learning-model",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and keep the site current for you, with each academy's enrollment year in one place.",
        },
      },
      {
        area: "website",
        gap: "The home page is heavy on a phone",
        saw: "Google PageSpeed scores the home page 57 out of 100 on mobile. The page is about 8.6 MB and the main content takes about 6 seconds to appear.",
        impact: "A parent opening the site on a phone waits several seconds and uses a lot of data.",
        source: "Google PageSpeed Insights, mobile",
        url: "https://bmfmicroschools.org/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and host the site for you, with images and video sized for phones.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Purpose Academies",
    founder: {
      fullName: "Tiffany Dudley",
      firstName: "Tiffany",
      role: "Microschool Director",
      source: "BMF Microschools, About Us",
      url: "https://bmfmicroschools.org/about-us",
    },
    mailTo: null,
    founderFacts: [
      {
        fact: "On The Future of Education podcast with Michael Horn (\"Black Mothers and Microschools\", February 27, 2023), Tiffany said the secret of microschools is \"the autonomy that their children have, where they're more of a participant in their education instead of just a bystander.\"",
        source: "The Future of Education (Michael Horn), \"Black Mothers and Microschools\"",
        url: "https://podcasts.apple.com/us/podcast/black-mothers-and-microschools/id1606014294?i=1000601899925",
        readOn: "2026-11-23",
      },
      {
        fact: "Students in the Living on Purpose Community Meal Service Project prepare and distribute free meals to the community, with no applications or qualifications.",
        source: "BMF Microschools, Home (Living on Purpose: Community Meal Service Project)",
        url: "https://bmfmicroschools.org/",
        readOn: "2026-11-23",
      },
      {
        fact: "Tiffany Dudley is a mother and former microschool coach who now directs School to Purpose Academies and the Black Mothers Forum microschools.",
        source: "BMF Microschools, About Us",
        url: "https://bmfmicroschools.org/about-us",
        readOn: "2026-11-23",
      },
    ],
    hook: "On The Future of Education podcast with Michael Horn (\"Black Mothers and Microschools\", February 27, 2023), Tiffany said the secret of microschools is \"the autonomy that their children have, where they're more of a participant in their education instead of just a bystander.\"",
    body: `Hi Tiffany,

On Michael Horn's Future of Education podcast, you said microschool kids become "more of a participant in their education instead of just a bystander." Your students cooking free meals for the community, no questions asked, looks like exactly that.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Purpose Academies.

I'd like to hear how the students have taken to cooking for their neighbors.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Tiffany, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "purpose-h4r6",
    checkBeforeMailing: [
      "Find a mailing address: the microschools site lists only an office phone and email, no street address. The Black Mothers Forum's own site or the Arizona ESA provider list may show one; use it only if it's clearly a business address.",
      "Tiffany is the Director who handles enrollment; the founder, Rev. Dr. Janelle Wood, leads the wider Black Mothers Forum.",
      "The hook is from the 2023 Future of Education episode, which names the Black Mothers Forum microschools. Other \"Tiffany Dudley\" podcast hits are a dentist and a Learning Ally program manager (not confirmed as her); the letter doesn't use them.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about tracking ESA payments across the academies (with the not-found tour link as a helpful aside), then who's asking and one proof number",
      subject: "ESA families at Purpose Academies",
      body: `Hi Tiffany,

I mailed you a handwritten note last week with a card for Purpose Academies.

Your site says ESA can cover tuition in full, and Outschool classes go through ClassWallet too. One small thing: the "Schedule your tour today!" link on your home page opens a page that isn't found.

With four academies and a virtual option, how do you keep track of whose ESA payments have come through each quarter?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Tiffany,

In case it's easier to see than describe, I set up a version of MudKitchen for Purpose Academies and recorded a 60-second walkthrough: a tour request landing in your admin inbox tagged by academy, the enrollment checklist, and the billing page an ESA family would see.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Purpose Academies is, with no pitch",
      where: "Facebook or Instagram (linked from the site's Social Media section)",
      body: "Hi Tiffany, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. Students cooking free meals for their neighbors is purpose in action.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Tiffany,

I also put together a one-page snapshot of what a family sees on your site today, from booking a tour to paying with ESA. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Tiffany,

I'll leave it here so I'm not cluttering your inbox. The Purpose Academies version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Julius`,
    },
  ],
};
