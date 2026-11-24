import type { OutreachPlan } from "./types";

export const homeworkHubOutreach: OutreachPlan = {
  slug: "homework-hub",
  schoolName: "Homework Hub (HwH Academy and The Learning Pod)",
  researchedAt: "2026-11-22",
  recipient: {
    firstName: "Tracy",
    role: "Owner",
    source: "Homework Hub, Meet Our Office Staff (Tracy Berman-Rolleri, Owner, founded Homework Hub in 2012)",
  },
  angle: "Re-contact with a snapshot: after acceptance, a Learning Pod family fills in six forms and writes out its own payment schedule",
  priorContact: {
    when: "June",
    what: "A hand-sent first email with a link to the Homework Hub MudKitchen demo",
  },
  facts: [
    {
      fact: "Tracy Berman-Rolleri is the owner and founded Homework Hub in 2012",
      source: "Homework Hub, Meet Our Office Staff",
      url: "https://www.homeworkhubtutoring.com/our-office-staff",
      readOn: "2026-11-22",
    },
    {
      fact: "HwH Academy is a grades 5–8 microschool with a 6:1 ratio, Monday–Friday 9:00–2:30 in Melville, now enrolling for 2026–2027",
      source: "Homework Hub, HwH Academy",
      url: "https://www.homeworkhubtutoring.com/hwh-academy",
      readOn: "2026-11-22",
    },
    {
      fact: "After an acceptance letter, Learning Pod families complete six separate forms (registration, membership agreement, field trip waiver, card authorization, medical safety, handbook acknowledgement) and create a PayTrace account",
      source: "Homework Hub, Student Registration Forms",
      url: "https://www.homeworkhubtutoring.com/our-registration-forms",
      readOn: "2026-11-22",
    },
    {
      fact: "The Membership Enrollment Agreement offers 10 monthly payments, four every 2.5 months, two every 5 months or one full-term payment, and asks the family to fill in each installment's due date and amount",
      source: "The Learning Pod Membership Enrollment Agreement",
      url: "https://www.homeworkhubtutoring.com/learning-pod-membership-enrollment-agreement",
      readOn: "2026-11-22",
    },
    {
      fact: "Card payments carry a 3% fee; families can pay by cash, check, Zelle or Venmo instead and are asked to text HwH after paying",
      source: "Homework Hub, Pay Now",
      url: "https://www.homeworkhubtutoring.com/temp-pay-now",
      readOn: "2026-11-22",
    },
    {
      fact: "The Enroll Now page asks families to use a desktop or laptop and Chrome, as Safari is not compatible with the site",
      source: "Homework Hub, Enroll Now",
      url: "https://www.homeworkhubtutoring.com/enroll-now-homework-hub",
      readOn: "2026-11-22",
    },
  ],
  checkBeforeSending: [
    "Confirm the earlier email went out in June (the first email says so).",
    "Confirm Tracy (Owner) is still the right person for HwH Academy and the Learning Pod; the Director of Home Instruction role is listed as Coming Soon.",
    "Homework Hub is mostly a tutoring and test-prep center: the pitch covers HwH Academy and the Learning Pod only.",
    "Confirm MudKitchen tuition plans can do the Learning Pod's four payments every 2.5 months, with due dates on the 1st or 15th.",
    "Confirm Rooted Meadows opened on MudKitchen before sending step 4.",
    "We'd build: Monthly billing for clubs, after-care or add-on classes",
    "We'd build: Calendar that syncs to Google or Apple calendars",
  ],
  snapshot: {
    token: "DO7MiMG1zTVz_7sMDNML1w",
    preparedOn: "2026-12-01",
    summary:
      "We read 60 pages of homeworkhubtutoring.com on Dec 1, 2026, from HwH Academy and The Learning Pod to the registration forms and payment pages.",
    toolStack: [
      { name: "PayTrace", usedFor: "Card on file and Make a Payment", url: "https://www.homeworkhubtutoring.com/copy-of-paytrace-gateway-2222222" },
      { name: "PayPal (online class store)", usedFor: "Class sign-up and payment", url: "https://www.homeworkhubtutoring.com/enroll-now-homework-hub" },
      { name: "Zelle", usedFor: "Paying without the 3% card fee", url: "https://www.homeworkhubtutoring.com/temp-pay-now" },
      { name: "Venmo", usedFor: "Paying without the 3% card fee", url: "https://www.homeworkhubtutoring.com/temp-pay-now" },
      { name: "Constant Contact", usedFor: "Stay in touch sign-up and emails", url: "https://www.homeworkhubtutoring.com/hwh-academy" },
      { name: "Handbook site (chatgpt.site)", usedFor: "Learning Pod Parent Student Handbook", url: "https://www.homeworkhubtutoring.com/learning-pods" },
    ],
    observations: [
      {
        area: "find",
        gap: "HwH Academy has no tuition, no application and no menu link",
        saw: "The HwH Academy page (grades 5–8, 6:1, now enrolling for 2026–2027) isn't linked from the home page or the site menu. It lists no tuition and no way to apply; families are asked to call or text.",
        impact: "A family comparing schools has to find the page first, then call before they know the cost or can start applying.",
        source: "Homework Hub, HwH Academy",
        url: "https://www.homeworkhubtutoring.com/hwh-academy",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["website-service", "online-application", "admissions-pipeline"],
          text: "The site we build puts HwH Academy in the menu with its tuition, and families start an online application from the same page. Every application lands in one admin inbox.",
        },
      },
      {
        area: "tour",
        gap: "Tours are arranged by phone or text",
        saw: "The HwH Academy page has a Schedule a Tour section with a phone and a text number, and the Learning Pod page invites families to visit and take a tour without a booking link. Request Appointment is a form for a 20-minute virtual call.",
        impact: "Each visit takes a round of calls or texts to find a time, and interested families wait on you to set it up.",
        source: "Homework Hub, HwH Academy",
        url: "https://www.homeworkhubtutoring.com/hwh-academy",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["tour-self-booking"],
          text: "Families pick a tour time from the slots you open, and get a reminder before they come.",
        },
      },
      {
        area: "enroll",
        gap: "Six forms and a PayTrace account after acceptance",
        saw: "After the acceptance letter, a Learning Pod family opens six separate forms from the navy buttons (registration, membership agreement, field trip waiver, card authorization, medical safety, handbook acknowledgement) and creates a PayTrace account.",
        impact: "Registration isn't complete until every form and the first payment are in, so you check each family's submissions one by one.",
        source: "Homework Hub, Student Registration Forms",
        url: "https://www.homeworkhubtutoring.com/our-registration-forms",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["enrollment-checklist", "enrollment-agreements", "enrollment-fees"],
          text: "Accepted families get one checklist: the registration form, the membership agreement signed online and the first payment, with reminders until it's done.",
        },
      },
      {
        area: "pay",
        gap: "Families write out their own payment schedule",
        saw: "The Membership Enrollment Agreement offers four plans, from 10 monthly payments to one full-term payment, and asks the family to fill in the number of installments and each one's due date and amount.",
        impact: "Every schedule is typed a little differently, and you check each payment against it before the $10 late fee applies.",
        source: "The Learning Pod Membership Enrollment Agreement",
        url: "https://www.homeworkhubtutoring.com/learning-pod-membership-enrollment-agreement",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["parent-plan-choice", "parent-billing", "autopay"],
          text: "Families pick their plan in their portal and see every payment's date and amount filled in for them. Autopay charges each one when it's due.",
        },
      },
      {
        area: "pay",
        gap: "Several ways to pay, and a text to say you paid",
        saw: "The Pay Now page takes cards through PayTrace with a 3% fee, or cash, check, Zelle or Venmo to avoid it. Families are asked to include the student's name and subject and text HwH after paying. Classes are paid through an online store with PayPal.",
        impact: "Payments land in several places, and staff match each one to a student from a text.",
        source: "Homework Hub, Pay Now",
        url: "https://www.homeworkhubtutoring.com/temp-pay-now",
        readOn: "2026-12-01",
        fix: {
          label: "in_demo",
          capabilities: ["parent-billing", "card-and-ach"],
          text: "Each family sees their balance and invoices in one place and pays by card or bank. The payment is recorded against the student, with no text needed.",
        },
      },
      {
        area: "website",
        gap: "Class sign-up asks for a laptop and Chrome",
        saw: "The Enroll Now page asks families to use a desktop or laptop rather than a phone, and Chrome, because Safari is not compatible with the site.",
        impact: "A parent reading on an iPhone has to wait until they're at a computer to sign up, and may not come back to finish.",
        source: "Homework Hub, Enroll Now",
        url: "https://www.homeworkhubtutoring.com/enroll-now-homework-hub",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["website-service", "class-billing"],
          text: "The site we build works on any phone and browser, and we'd set up class sign-up with payment inside it.",
        },
      },
      {
        area: "updates",
        gap: "The Learning Pod calendar is a picture",
        saw: "The 2026–2027 Calendar at a Glance and the typical week for each level are images on the Learning Pod page, and the handbook sits on a separate site.",
        impact: "Families can't search the dates or add recesses to their own calendar, and every change means a new image.",
        source: "Homework Hub, The Learning Pod",
        url: "https://www.homeworkhubtutoring.com/learning-pods",
        readOn: "2026-12-01",
        fix: {
          label: "set_up",
          capabilities: ["calendar", "calendar-sync"],
          text: "The calendar lives in each family's portal, and we'd set it up to sync to their Google or Apple calendar.",
        },
      },
    ],
  },
  letter: {
    writtenOn: "2026-11-22",
    shortSchoolName: "Homework Hub",
    founder: {
      fullName: "Tracy Berman-Rolleri",
      firstName: "Tracy",
      role: "Owner and founder",
      source: "Homework Hub, Meet Our Office Staff",
      url: "https://www.homeworkhubtutoring.com/our-office-staff",
    },
    mailTo: {
      lines: ["628 Walt Whitman Road", "Melville, NY 11747"],
      source: "Homework Hub home page (schema.org address) and the HwH Academy page's form footer",
      url: "https://www.homeworkhubtutoring.com/",
    },
    founderFacts: [
      {
        fact: "Tracy Berman-Rolleri began her career teaching elementary school at a Manhattan private school, built a tutoring practice that took off in New York City, relocated to Long Island over 25 years ago and founded Homework Hub in 2012.",
        source: "Homework Hub, Meet Our Office Staff",
        url: "https://www.homeworkhubtutoring.com/our-office-staff",
        readOn: "2026-11-22",
      },
      {
        fact: "Tracy holds two master's degrees, in Special Education and in Reading, is Orton-Gillingham and Lindamood-Bell trained, and has over 30 years of experience educating children.",
        source: "Homework Hub, Meet Our Office Staff",
        url: "https://www.homeworkhubtutoring.com/our-office-staff",
        readOn: "2026-11-22",
      },
      {
        fact: "Homework Hub now runs HwH Academy, a grades 5–8 microschool in Melville with a 6:1 ratio, Monday to Friday 9:00–2:30, enrolling for 2026–2027.",
        source: "Homework Hub, HwH Academy",
        url: "https://www.homeworkhubtutoring.com/hwh-academy",
        readOn: "2026-11-22",
      },
    ],
    hook: "Tracy Berman-Rolleri began her career teaching elementary school at a Manhattan private school, built a tutoring practice that took off in New York City, relocated to Long Island over 25 years ago and founded Homework Hub in 2012.",
    body: `Hi Tracy,

I read how Homework Hub began, with a classroom in Manhattan and a tutoring practice in the city before you started it on Long Island in 2012. I liked seeing it now include a full-day microschool for grades 5 to 8.

My fiancée and I run Sage Field, an outdoor microschool in Round Rock, Texas. We built MudKitchen from the start to run our whole school, and it's a big part of how we grew. So I set up a version of it for Homework Hub.

I'd like to hear what led you to start HwH Academy.

Julius`,
    postscript: "The card inside has a QR code for it, plus a parent's-eye look at your enrollment.",
    stickyNote: "Tracy, a handwritten note from a small school in Texas. J",
    shortCode: "homeworkhub-hq4k",
    checkBeforeMailing: [
      "The site gives 628 Walt Whitman Road with no suite number. It's a storefront learning center on Route 110, but check the door or Google Maps for a suite before mailing.",
      "The founding story is from the school's own staff page, not an interview. I couldn't open a Team Girl Boss feature that search results tie to her, so it isn't used.",
    ],
  },
  steps: [
    {
      id: "first",
      kind: "email",
      businessDay: 0,
      purpose: "Re-intro after the handwritten letter: mention the note and the June email, one detail from the snapshot, one proof number",
      subject: "Learning Pod registration at Homework Hub",
      body: `Hi Tracy,

I mailed you a handwritten note last week with a card for Homework Hub. It has a QR code for the version of MudKitchen I set up for you (I first wrote about it in June) and a one-page snapshot of what a family sees on your site today, from finding a program to paying for it.

One thing stood out: after acceptance, a Learning Pod family fills in six separate forms, and the membership agreement has them write out each installment's date and amount.

I run Sage Field, a microschool in Round Rock. We went from 0 to 35 students in under 3 months on MudKitchen.

Want me to send the snapshot link here too?

Julius`,
    },
    {
      id: "follow-1",
      kind: "email",
      businessDay: 3,
      purpose: "Walkthrough: a 60-second Loom of their demo, so they don't have to click around",
      body: `Hi Tracy,

In case it's easier than clicking around, I recorded a 60-second walkthrough of the Homework Hub version: the homepage, what a parent sees for enrollment and tuition, and your admin view.

{loom link}

Julius`,
    },
    {
      id: "social",
      kind: "social",
      businessDay: 5,
      purpose: "Say hello where she is, with no pitch",
      where: "Instagram (homeworkhub) or Facebook (HomeworkHubtutoring)",
      body: "Hi Tracy, I'm Julius. I run Sage Field, a small microschool in Round Rock, TX. I enjoyed reading about the Learning Pod's monthly field trips.",
    },
    {
      id: "follow-2",
      kind: "email",
      businessDay: 8,
      purpose: "Send the snapshot (no reply needed) plus the Rooted Meadows proof",
      body: `Hi Tracy,

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
      body: `Hi Tracy,

I'll leave it here so I'm not cluttering your inbox. The Homework Hub version of MudKitchen and the snapshot stay up if you ever want them. Just reply and I'll resend the links.

Good luck with the rest of the school year.

Julius`,
    },
  ],
};
