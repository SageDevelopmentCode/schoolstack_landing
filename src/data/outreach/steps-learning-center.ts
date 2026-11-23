import type { OutreachPlan } from "./types";

export const stepsLearningCenterOutreach: OutreachPlan = {
  slug: "steps-learning-center",
  schoolName: "Steps Learning Center",
  researchedAt: "2026-11-23",
  recipient: {
    firstName: "Alexandra",
    role: "Founder and Director (Alexandra Batista Rodriguez)",
    source:
      "Steps Learning Center About page (\"founded by Alexandra Batista Rodriguez\") and her LiberatED episode, which calls her founder and director",
  },
  angle:
    "One real question: FES-UA pays Steps monthly or quarterly as a Direct Pay Provider, the $25 intake fee isn't available through FES-UA, and families can also pay on monthly or bi-weekly plans. When one family's bill comes from the scholarship and from them, how do they see what they still owe?",
  facts: [
    {
      fact: "Steps Learning Center was established in 2022 by Alexandra Batista Rodriguez, an ESE teacher with 10+ years of experience, to bridge the gap between what neurodiverse learners need and what families can realistically piece together on their own",
      source: "Steps Learning Center, About",
      url: "https://stepslearningcenterllc.com/about",
      readOn: "2026-11-23",
    },
    {
      fact: "LiberatED Podcast, June 13, 2025: \"Alexandra Batista Rodriguez on creating a microschool for students with special needs\" describes Steps as a K-8 microschool for neurodiverse learners with moderate to significant needs, with full-time and part-time enrollment, tutoring and homebound curriculum, all financially accessible through Florida's school-choice programs",
      source: "LiberatED Podcast episode listing (Apple Podcasts)",
      url: "https://podcasts.apple.com/us/podcast/alexandra-batista-rodriguez-on-creating-a/id1608978473?i=1000712743588",
      readOn: "2026-11-23",
    },
    {
      fact: "Services and Pricing: Direct Pay Provider for FES-UA; $25 intake fee due at enrollment (not available through FES-UA), $200 evaluation fees and $350 learning materials fee (listed as EMA categories); 4-day schedule $18,000 (Aug 2026–Jul 2027), 3-day $10,000 (10 months) or $12,000 (12 months); FES-UA monthly or quarterly payments, or monthly/bi-weekly payment plans by card or ACH",
      source: "Steps Learning Center, Services and Pricing",
      url: "https://stepslearningcenterllc.com/services",
      readOn: "2026-11-23",
    },
    {
      fact: "The home page's Book a Tour! button opens a Google Calendar \"Tour & Orientation\" booking page (45-minute appointments at 1526 E Concord St) that shows \"No available times in the next year\"",
      source: "Steps Learning Center home page and its Google Calendar booking page",
      url: "https://stepslearningcenterllc.com/",
      readOn: "2026-11-23",
    },
    {
      fact: "The Contact page embeds KaiPod's \"Founder Websites - Single Shared Form\" Jotform (name, email, phone, \"Tell us about your student(s)\"), tagged microschool=Steps+Learning+Center",
      source: "Steps Learning Center, Contact",
      url: "https://stepslearningcenterllc.com/contact",
      readOn: "2026-11-23",
    },
    {
      fact: "The site header and page titles read \"Support that helps neurodiverse learners thrive\" rather than the school's name, and no logo appears on the pages",
      source: "Steps Learning Center, all pages",
      url: "https://stepslearningcenterllc.com/",
      readOn: "2026-11-23",
    },
  ],
  checkBeforeSending: [
    "Uses KaiPod's Jotform: decide whether to pitch replacing it (the Contact page embeds KaiPod's shared founder-website form, so Steps is likely a KaiPod partner).",
    "We'd build: Billing part of tuition to a funding program (TEFA, ESA, charter funds). Here it's FES-UA through Step Up's EMA, which MudKitchen works alongside; don't pitch replacing it.",
    "The tour calendar showing no times may be deliberate if Steps is full. The snapshot names it plainly as what a family sees, without guessing why.",
    "The site now describes Steps as a tutoring and developmental support center for homeschoolers, while the 2025 podcast calls it a K-8 microschool. The plan uses the site's wording.",
    "Batch note: this school was pulled forward from batch 4 because Peninsular Prep and the Santa Monica Beach Microschool row were skipped.",
    "No Instagram or Facebook is linked from the site; find their page before the social step, or skip it.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
  ],
  snapshot: {
    token: "G0yv4DajxeVburVRk3_BXQ",
    preparedOn: "2026-11-23",
    summary:
      "We read all 4 pages of stepslearningcenterllc.com on Nov 23, 2026, plus the contact form and the tour booking page.",
    pageSpeed: { mobileScore: 78, url: "https://stepslearningcenterllc.com/", checkedOn: "2026-11-23" },
    toolStack: [
      {
        name: "Jotform",
        usedFor: "Get in Touch inquiry form",
        url: "https://stepslearningcenterllc.com/contact",
        network: "KaiPod",
      },
      {
        name: "Google Calendar booking",
        usedFor: "Tour & Orientation appointments",
        url: "https://stepslearningcenterllc.com/",
      },
    ],
    observations: [
      {
        area: "tour",
        gap: "The tour calendar has no open times",
        saw: "Book a Tour! opens a Google Calendar \"Tour & Orientation\" page for 45-minute visits at 1526 E Concord St. Today it says \"No available times in the next year.\"",
        impact: "A family ready to visit can't book a tour, and the page doesn't say why or what to do instead.",
        source: "Steps Learning Center home page and its Google Calendar booking page",
        url: "https://stepslearningcenterllc.com/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking", "programs-capacity", "admissions-pipeline"],
          text: "Families pick a tour from your open times, or see that a schedule is full and join the list, and every request lands in one admin inbox.",
        },
      },
      {
        area: "pay",
        gap: "Scholarship families have two payers",
        saw: "Steps is a Direct Pay Provider for FES-UA, paid monthly or quarterly. The $25 intake fee isn't available through FES-UA, and families can also pay on monthly or bi-weekly plans by card or ACH.",
        impact: "A family on FES-UA can't see what the scholarship covers and what they still owe until they ask.",
        source: "Steps Learning Center, Services and Pricing",
        url: "https://stepslearningcenterllc.com/services",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["third-party-payer-billing", "parent-billing", "autopay", "card-and-ach"],
          text: "We'd set up each family's billing page to show the FES-UA share and their own, with autopay by card or ACH for their part.",
        },
      },
      {
        area: "apply",
        gap: "The inquiry form has one open question",
        saw: "Get in Touch is KaiPod's shared Jotform: name, email, phone and \"Tell us about your student(s)\", plus consent to marketing emails, calls and texts. It doesn't ask about schedule, age or FES-UA.",
        impact: "Families describe their child in one box and don't learn what happens after they send it.",
        source: "Steps Learning Center, Contact",
        url: "https://stepslearningcenterllc.com/contact",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["online-application", "admissions-pipeline"],
          text: "An inquiry and application that ask for the schedule, the learner's age and FES-UA status, all landing in one admin inbox with each family's stage.",
        },
      },
      {
        area: "enroll",
        gap: "Intake and assessment aren't laid out as steps",
        saw: "Services lists a $25 intake fee due at enrollment, $200 for the initial assessment, progress reports and annual evaluation, and a $350 learning materials fee. The site doesn't say what order these happen in.",
        impact: "A family can't see what comes after the tour, or when each fee is due.",
        source: "Steps Learning Center, Services and Pricing",
        url: "https://stepslearningcenterllc.com/services",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-fees"],
          text: "Accepted families get one checklist with the intake fee paid online and each next step, with reminders until it's done.",
        },
      },
      {
        area: "updates",
        gap: "Progress updates have no home on the site",
        saw: "Steps promises \"personalized communication, onboarding, and continuous progress updates,\" and Services mentions progress reports and an annual evaluation. The site doesn't show where families will see them.",
        impact: "A family choosing Steps can't tell how they'll follow their child's progress through the year.",
        source: "Steps Learning Center, home page and Services and Pricing",
        url: "https://stepslearningcenterllc.com/",
        readOn: "2026-11-23",
        fix: {
          label: "set_up",
          capabilities: ["parent-portal", "messaging", "mobile-app"],
          text: "Each family gets a login, on the web and the iPhone app, with messages from staff and their child's reports in one place.",
        },
      },
      {
        area: "website",
        gap: "The school's name isn't in the header",
        saw: "The header and every page title read \"Support that helps neurodiverse learners thrive.\" The Steps logo doesn't appear on any page.",
        impact: "In a browser tab, a bookmark or a search result, families see a tagline instead of Steps Learning Center.",
        source: "Steps Learning Center, all pages",
        url: "https://stepslearningcenterllc.com/",
        readOn: "2026-11-23",
        fix: {
          label: "in_demo",
          capabilities: ["website-service"],
          text: "We build and look after the site for you, with your name and logo on every page.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-23",
    shortSchoolName: "Steps",
    founder: {
      fullName: "Alexandra Batista Rodriguez",
      firstName: "Alexandra",
      role: "Founder and Director",
      source: "Steps Learning Center, About",
      url: "https://stepslearningcenterllc.com/about",
    },
    mailTo: {
      lines: ["Alexandra Batista Rodriguez", "Steps Learning Center", "1526 E Concord St", "Orlando, FL 32803"],
      source: "Steps Learning Center footer (\"Location: 1526 E Concord St, Orlando FL 32803\") and its tour booking page",
      url: "https://stepslearningcenterllc.com/contact",
    },
    founderFacts: [
      {
        fact: "Alexandra's About page says she created Steps to bridge the gap between what many neurodiverse learners need and what families can realistically piece together on their own.",
        source: "Steps Learning Center, About",
        url: "https://stepslearningcenterllc.com/about",
        readOn: "2026-11-23",
      },
      {
        fact: "Alexandra was the guest on the LiberatED Podcast with Kerry McDonald on June 13, 2025, in an episode titled \"Alexandra Batista Rodriguez on creating a microschool for students with special needs\".",
        source: "LiberatED Podcast episode listing (Apple Podcasts)",
        url: "https://podcasts.apple.com/us/podcast/alexandra-batista-rodriguez-on-creating-a/id1608978473?i=1000712743588",
        readOn: "2026-11-23",
      },
    ],
    hook: "Alexandra's About page says she created Steps to bridge the gap between what many neurodiverse learners need and what families can realistically piece together on their own.",
    body: `Hi Alexandra,

I found your LiberatED episode with Kerry McDonald, then read your About page. You built Steps to bridge the gap between what neurodiverse learners need and what families can piece together on their own.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Steps.

I'd like to hear how Choice Navigation started.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Alexandra, a note from a small microschool in Round Rock, Texas. J",
    shortCode: "steps-w6n2",
    checkBeforeMailing: [
      "Listen to the LiberatED episode (June 13, 2025) before mailing; the letter only mentions it, and the detail comes from her About page.",
      "The address is the Location in the site footer, also used on the tour booking page. Check on a map that it's the center's building.",
      "The Cato Institute's Friday Feature on Steps (linked from the About page) blocked automated reading, so it isn't used.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Mention last week's handwritten note, then one real question about FES-UA and family payments, then who's asking and one proof number",
      subject: "FES-UA families at Steps",
      body: `Hi Alexandra,

I mailed you a handwritten note last week with a card for Steps.

Your Services page says FES-UA pays Steps monthly or quarterly, the $25 intake fee isn't available through FES-UA, and families can also pay on monthly or bi-weekly plans.

When one family's bill comes from the scholarship and from them, how do they see what they still owe?

I ask because I run Sage Field, a small outdoor microschool in Round Rock, TX. We went from 0 to 35 students in under 3 months on MudKitchen, the system I built to run it.

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo",
      body: `Hi Alexandra,

In case it's easier to see than describe, I set up a version of MudKitchen for Steps and recorded a 60-second walkthrough: an inquiry landing in your admin inbox, the intake checklist, and the billing page a family would pay their part from.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where Steps is, with no pitch",
      where: "Facebook, Instagram or LinkedIn (none are linked from the site; search for Steps Learning Center Orlando or Alexandra first)",
      body: "Hi Alexandra, I'm Julius. I run Sage Field, a small outdoor microschool in Round Rock, TX. I enjoyed reading how Steps brings tutoring, life skills and therapy together.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Alexandra,

I also put together a one-page snapshot of what a family sees on your site today, from booking a tour to paying. One thing in it: the Book a Tour calendar shows no open times right now. No reply needed:

{snapshot link}

One more data point: Rooted Meadows, a K–8 school in Rigby, Idaho, opened this August with enrollment, tuition and their parent portal on MudKitchen.

Julius`,
    },
    {
      id: "close",
      kind: "email",
      businessDay: 20,
      purpose: "An honest close; the demo and snapshot stay up",
      body: `Hi Alexandra,

I'll leave it here so I'm not cluttering your inbox. The Steps version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the year.

Julius`,
    },
  ],
};
