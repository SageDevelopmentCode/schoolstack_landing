import type { MarketingCarouselId } from "@/lib/marketing/marketing-carousel-ids";

/**
 * Six-week organic posting schedule (Nov 23, 2026 – Jan 3, 2027) with captions and the weekly ad plan.
 * Mirrors the Schedule tab of the "MudKitchen social playbook" doc. Statuses are stored in
 * `website_marketing_schedule_posts` (see schedule-post-status.ts).
 */

export type SchedulePlatform = "Instagram" | "Facebook" | "LinkedIn";
export type SchedulePillar = "Laugh" | "Talk" | "Show" | "Teach" | "Prove" | "Brand";

export type ScheduleItem = {
  id: string;
  /** ISO date, YYYY-MM-DD (audience local time). */
  date: string;
  time: string;
  platforms: SchedulePlatform[];
  pillar: SchedulePillar;
  carouselId: MarketingCarouselId;
  /** Set for a single post inside a set of singles; omitted for a whole carousel. */
  slideId?: string;
  label: string;
  caption: string;
};

export type ScheduleWeek = {
  id: string;
  /** Monday, YYYY-MM-DD. */
  start: string;
  title: string;
  note: string;
  ads: { sets: string; primaryText: string; headline: string };
  items: ScheduleItem[];
};

const IG_FB: SchedulePlatform[] = ["Instagram", "Facebook"];
const ALL: SchedulePlatform[] = ["Instagram", "Facebook", "LinkedIn"];
const IG: SchedulePlatform[] = ["Instagram"];
const LI_IG: SchedulePlatform[] = ["LinkedIn", "Instagram"];

export const SCHEDULE_RHYTHM =
  "Mon meme · Tue poll · Wed carousel (LinkedIn peak) · Thu tip · Fri story or crew · Sat light meme · Sun extra in big weeks";

export const SOCIAL_SCHEDULE: ScheduleWeek[] = [
  {
    id: "week-1",
    start: "2026-11-23",
    title: "Week 1 · Nov 23–29 (Thanksgiving)",
    note: "Open by introducing the crew, then keep Thanksgiving week warm and light: no product posts on Thursday or Black Friday morning.",
    ads: {
      sets: "Holiday gift card 60% · Crew voice 40%",
      primaryText:
        "Teachers get apples. Microschools get $200. Book a MudKitchen demo this holiday season, start a paid plan within 30 days, and the Amazon gift card is yours. 🍎 Terms apply.",
      headline: "Sign up, your school gets $200",
    },
    items: [
      {
        id: "2026-11-23-meet-the-crew",
        date: "2026-11-23",
        time: "9am; LinkedIn 3pm",
        platforms: ALL,
        pillar: "Brand",
        carouselId: "posts-weekly-singles",
        slideId: "meet-the-crew",
        label: "Weekly singles #9: Meet the crew (pin it)",
        caption:
          "Meet the MudKitchen crew: twelve tiny coworkers, one for every job at your school. 👋 Pip runs enrollment, Nutmeg chases tuition (politely), Loam takes the 9pm texts. Which one are you this week? #microschool #schoolfounder #microschooling",
      },
      {
        id: "2026-11-24-poll-tabs",
        date: "2026-11-24",
        time: "9am",
        platforms: IG_FB,
        pillar: "Talk",
        carouselId: "posts-weekly-singles",
        slideId: "poll-tabs",
        label: "Weekly singles #1: Poll, how many tabs",
        caption: "Be honest: how many tabs does your school run in? A, B or C in the comments. Dig is a C. 🙃 #microschool #schooladmin #schoolfounder",
      },
      {
        id: "2026-11-25-founder-week",
        date: "2026-11-25",
        time: "9am; LinkedIn 4pm",
        platforms: ALL,
        pillar: "Show",
        carouselId: "mascot-founder-week",
        label: "Carousel: A founder's week, Mon–Fri",
        caption:
          "A microschool founder's week: admissions officer on Monday, payroll on Friday. 🫠 Here's the same week with one screen per day. Swipe → and tag the founder who does all five jobs. #microschool #founderlife #schoolfounder",
      },
      {
        id: "2026-11-26-thankful",
        date: "2026-11-26",
        time: "9am",
        platforms: ALL,
        pillar: "Brand",
        carouselId: "posts-holiday-singles",
        slideId: "thankful",
        label: "Holiday singles #1: Things we're thankful for",
        caption:
          "Things we're thankful for this year, in order: autopay, forms that come back signed, a quiet inbox. And you, obviously. Happy Thanksgiving to every founder who teaches, bills and answers the 9pm texts. 🧡 #microschool #schoolfounder #thanksgiving",
      },
      {
        id: "2026-11-27-black-friday",
        date: "2026-11-27",
        time: "6pm",
        platforms: IG_FB,
        pillar: "Laugh",
        carouselId: "posts-holiday-singles",
        slideId: "black-friday",
        label: "Holiday singles #2: Black Friday haul",
        caption:
          "Our Black Friday haul: one calm spring semester. No checkout, no line at 5am. What's the one thing you'd add to your school's cart? 👇 #microschool #schoolfounder #blackfriday",
      },
      {
        id: "2026-11-28-monday-friday-dig",
        date: "2026-11-28",
        time: "9am",
        platforms: IG,
        pillar: "Laugh",
        carouselId: "mascot-crew-singles",
        slideId: "dig-monday-friday",
        label: "Crew singles #6: Monday Dig vs Friday Dig",
        caption: "Monday Dig vs Friday Dig. We all contain both. Which one are you right now? 👇 #microschool #founderlife #teacherlife",
      },
    ],
  },
  {
    id: "week-2",
    start: "2026-11-30",
    title: "Week 2 · Nov 30 – Dec 6",
    note: "A 7-post week: everyone is back from Thanksgiving, so this is where the guided-setup carousel and the Sage Field story land.",
    ads: {
      sets: "Holiday gift card 50% · Pain → proof 50% (offer 25% / no-offer 25%)",
      primaryText:
        "Enrollment in a form builder. Tuition in Venmo. Updates in a group text. MudKitchen pulls them into one shared system for your microschool. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
      headline: "Run your school from one place",
    },
    items: [
      {
        id: "2026-11-30-which-crew-member",
        date: "2026-11-30",
        time: "9am",
        platforms: IG_FB,
        pillar: "Laugh",
        carouselId: "mascot-crew-singles",
        slideId: "crew-this-week",
        label: "Crew singles #5: Which crew member are you",
        caption: "Which crew member are you this week? Be honest. Nobody is a Clover in December. Drop yours below. 👇 #microschool #schoolfounder #microschooling",
      },
      {
        id: "2026-12-01-this-or-that",
        date: "2026-12-01",
        time: "9am",
        platforms: IG_FB,
        pillar: "Talk",
        carouselId: "posts-weekly-singles",
        slideId: "this-or-that",
        label: "Weekly singles #2: This or that, forms",
        caption: "This or that: paper forms or online forms? Bramble has strong feelings. Tell us yours. #microschool #enrollment #schoolforms",
      },
      {
        id: "2026-12-02-guided-setup",
        date: "2026-12-02",
        time: "9am; LinkedIn 4pm",
        platforms: ALL,
        pillar: "Show",
        carouselId: "mascot-guided-setup",
        label: "Carousel: How switching actually works",
        caption:
          "Switching your school's software sounds like a whole semester of pain. It isn't. Here's how guided setup actually works, in 3 steps. Swipe → (Dig made it to stage 5.) #microschool #schooladmin #schoolfounder",
      },
      {
        id: "2026-12-03-enrollment-packet",
        date: "2026-12-03",
        time: "9am; LinkedIn 4pm",
        platforms: ALL,
        pillar: "Teach",
        carouselId: "posts-weekly-singles",
        slideId: "enrollment-packet",
        label: "Weekly singles #3: Enrollment packet tip",
        caption: "Save this for spring enrollment: 3 things every enrollment packet needs, so you're not chasing them in week one. 📌 #microschool #enrollment #schoolfounder",
      },
      {
        id: "2026-12-04-sage-field",
        date: "2026-12-04",
        time: "LinkedIn 3pm; Instagram 6pm",
        platforms: LI_IG,
        pillar: "Prove",
        carouselId: "posts-weekly-singles",
        slideId: "sage-field",
        label: "Weekly singles #7: Sage Field story",
        caption:
          "Sage Field went from 0 to 35 students in under 3 months, running enrollment, tuition and family communication from one place. Read the story at trymudkitchen.com/customers/sagefield. #microschool #schoolfounder #microschooling",
      },
      {
        id: "2026-12-05-job-description",
        date: "2026-12-05",
        time: "9am",
        platforms: IG,
        pillar: "Laugh",
        carouselId: "posts-weekly-singles",
        slideId: "job-description",
        label: "Weekly singles #5: Founder job description",
        caption: "Microschool founder, official job description. Lunch break not included. What did we miss? 👇 #microschool #founderlife #schoolfounder",
      },
      {
        id: "2026-12-06-holiday-program",
        date: "2026-12-06",
        time: "6pm",
        platforms: IG_FB,
        pillar: "Show",
        carouselId: "mascot-holiday-program",
        label: "Carousel: Holiday program survival guide",
        caption:
          "The holiday program is in 9 days. Who has the costumes? 🎄 A survival guide for dates, permission slips and volunteers. Swipe → #microschool #holidayprogram #schoolfounder",
      },
    ],
  },
  {
    id: "week-3",
    start: "2026-12-07",
    title: "Week 3 · Dec 7–13",
    note: "Peak December chaos: lean into it with the timeline meme, then show the calm version from the family's side.",
    ads: {
      sets: "Holiday gift card 50% · Feature spotlight 50%",
      primaryText:
        "School owners: families see every bill in one place and set up autopay once, so tuition arrives on time without the reminder texts. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
      headline: "Tuition on autopay",
    },
    items: [
      {
        id: "2026-12-07-december-timeline",
        date: "2026-12-07",
        time: "9am",
        platforms: IG_FB,
        pillar: "Laugh",
        carouselId: "posts-holiday-singles",
        slideId: "december-timeline",
        label: "Holiday singles #4: December, as told by a founder",
        caption: "December, as told by a microschool founder. Week 4 is a lifestyle. Tag the founder who's currently in week 2. 🎄 #microschool #founderlife #schoolfounder",
      },
      {
        id: "2026-12-08-december-crew",
        date: "2026-12-08",
        time: "9am",
        platforms: IG_FB,
        pillar: "Talk",
        carouselId: "posts-holiday-singles",
        slideId: "december-crew",
        label: "Holiday singles #3: Who's getting you through December",
        caption:
          "Which crew member is getting you through December? Comment a letter. We're a solid E. Someone has to answer \"is there school on the 23rd?\" #microschool #schoollife #schoolfounder",
      },
      {
        id: "2026-12-09-family-first-week",
        date: "2026-12-09",
        time: "9am; LinkedIn 4pm",
        platforms: ALL,
        pillar: "Show",
        carouselId: "mascot-family-first-week",
        label: "Carousel: A family's first week",
        caption:
          "A family finds your school. They have 11 questions. 😅 Here's what their first week looks like when everything lives in one place: apply, enroll, pay, plan. Swipe → #microschool #enrollment #schoolfounder",
      },
      {
        id: "2026-12-10-program-checklist",
        date: "2026-12-10",
        time: "9am; LinkedIn 4pm",
        platforms: ALL,
        pillar: "Teach",
        carouselId: "posts-holiday-singles",
        slideId: "holiday-program-checklist",
        label: "Holiday singles #5: Holiday program checklist",
        caption:
          "Holiday program in two weeks? Save this checklist. Permission slips, costumes, volunteers, photos, programs: tick them off now, enjoy the show later. #microschool #holidayprogram #schoolfounder",
      },
      {
        id: "2026-12-11-only-founders",
        date: "2026-12-11",
        time: "LinkedIn 3pm; Instagram 6pm",
        platforms: LI_IG,
        pillar: "Laugh",
        carouselId: "posts-weekly-singles",
        slideId: "only-founders",
        label: "Weekly singles #11: Things only founders understand",
        caption: "Things only microschool founders understand. Number 4 is why there's glitter in your car. Add yours below. 👇 #microschool #founderlife #schoolfounder",
      },
      {
        id: "2026-12-12-rate-your-week",
        date: "2026-12-12",
        time: "9am",
        platforms: IG,
        pillar: "Laugh",
        carouselId: "posts-weekly-singles",
        slideId: "rate-your-week",
        label: "Weekly singles #6: Rate your week, 1–5 Fennels",
        caption: "Rate your week from 1 to 5 Fennels. No judgment. Fennel is a 2 today. 🐸 #microschool #teacherlife #founderlife",
      },
    ],
  },
  {
    id: "week-4",
    start: "2026-12-14",
    title: "Week 4 · Dec 14–20",
    note: "The last full week before break, and the second 7-post week: tuition is the theme (the December bill run), with gifts and games around it.",
    ads: {
      sets: "Winter break 50% · Holiday gift card 50%",
      primaryText:
        "Winter break is the calmest two weeks of the school year. Use it to get MudKitchen set up, so enrollment, tuition and parent messages are ready when families come back. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
      headline: "Set up over break, open January ready",
    },
    items: [
      {
        id: "2026-12-14-gift-guide",
        date: "2026-12-14",
        time: "9am",
        platforms: IG_FB,
        pillar: "Laugh",
        carouselId: "posts-holiday-singles",
        slideId: "gift-guide",
        label: "Holiday singles #8: Gift guide for founders",
        caption:
          "The only gift guide a microschool founder needs. A printer that works, a second coffee, three more hours, one system for everything else. Which one are you asking for? 🎁 #microschool #schoolfounder #giftguide",
      },
      {
        id: "2026-12-15-caption-this",
        date: "2026-12-15",
        time: "9am",
        platforms: IG_FB,
        pillar: "Talk",
        carouselId: "posts-weekly-singles",
        slideId: "caption-this",
        label: "Weekly singles #10: Caption this",
        caption: "Caption this. 📸 Best one gets pinned (and Flicker gets a new camera strap). #microschool #pictureday #schoollife",
      },
      {
        id: "2026-12-16-nutmeg-tuition",
        date: "2026-12-16",
        time: "9am; LinkedIn 4pm",
        platforms: ALL,
        pillar: "Show",
        carouselId: "mascot-nutmeg-tuition",
        label: "Carousel: Nutmeg rehearses the tuition reminder",
        caption:
          "Things Nutmeg has said instead of \"please pay tuition\": a thread. 🌰 Then the part where autopay takes over and nobody has to say it. Swipe → #microschool #tuition #schoolfounder",
      },
      {
        id: "2026-12-17-tuition-template",
        date: "2026-12-17",
        time: "9am; LinkedIn 4pm",
        platforms: ALL,
        pillar: "Teach",
        carouselId: "posts-weekly-singles",
        slideId: "tuition-template",
        label: "Weekly singles #4: Tuition reminder template",
        caption:
          "A tuition reminder that isn't awkward. Copy it, fill in the brackets, send. (Or turn on autopay and never send it again.) #microschool #tuition #schoolfounder",
      },
      {
        id: "2026-12-18-two-truths",
        date: "2026-12-18",
        time: "LinkedIn 3pm; Instagram 6pm",
        platforms: LI_IG,
        pillar: "Talk",
        carouselId: "posts-holiday-singles",
        slideId: "two-truths",
        label: "Holiday singles #6: Two truths and a lie",
        caption: "Two truths and a lie, founder edition. Which one's the lie: 1, 2 or 3? (Loam knows. Loam is not telling.) #microschool #founderlife #schoolfounder",
      },
      {
        id: "2026-12-19-quick-question",
        date: "2026-12-19",
        time: "9am",
        platforms: IG,
        pillar: "Laugh",
        carouselId: "mascot-crew-singles",
        slideId: "quick-question",
        label: "Crew singles #8: Quick question",
        caption: "\"Quick question\" has never once been quick. 📱 Tag the founder whose phone just buzzed. #microschool #founderlife #schoollife",
      },
      {
        id: "2026-12-20-flicker-tansy",
        date: "2026-12-20",
        time: "6pm",
        platforms: IG_FB,
        pillar: "Show",
        carouselId: "mascot-flicker-tansy-community",
        label: "Carousel: Picture day and the sign-up sheet",
        caption:
          "Picture day: 347 photos, 2 usable. 📸 Meet Flicker and Tansy, who handle the photos and the volunteer sheet everyone loses. Swipe → #microschool #pictureday #schoolfounder",
      },
    ],
  },
  {
    id: "week-5",
    start: "2026-12-21",
    title: "Week 5 · Dec 21–27 (holidays)",
    note: "A lighter 5-post week. Nothing on Christmas Eve or Christmas Day, and no product pitches: just warmth and the break.",
    ads: {
      sets: "Winter break 70% · Holiday gift card 30% (half budget)",
      primaryText:
        "Switching systems mid-semester is chaos. Switching over winter break is a cozy afternoon. Book a MudKitchen demo now, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
      headline: "Switch while it's quiet",
    },
    items: [
      {
        id: "2026-12-21-out-of-office",
        date: "2026-12-21",
        time: "9am; LinkedIn 3pm",
        platforms: ALL,
        pillar: "Teach",
        carouselId: "posts-holiday-singles",
        slideId: "out-of-office",
        label: "Holiday singles #7: Winter break out-of-office",
        caption:
          "Your winter break out-of-office, written for you. Copy it, fill in the brackets, close the laptop. You're allowed to not reply until January. We checked. #microschool #schoolfounder #winterbreak",
      },
      {
        id: "2026-12-22-real-break",
        date: "2026-12-22",
        time: "9am",
        platforms: IG_FB,
        pillar: "Brand",
        carouselId: "posts-holiday-singles",
        slideId: "real-break",
        label: "Holiday singles #9: You deserve a real break",
        caption:
          "Unpopular opinion: you deserve a real break this year. Not a \"check email once a day\" break. A real one. Clover is already practicing. 🐝 #microschool #schoolfounder #winterbreak",
      },
      {
        id: "2026-12-23-happy-holidays",
        date: "2026-12-23",
        time: "9am",
        platforms: ALL,
        pillar: "Brand",
        carouselId: "posts-weekly-singles",
        slideId: "happy-holidays",
        label: "Weekly singles #12: Happy holidays from the crew",
        caption: "Happy holidays from the MudKitchen crew. Thank you for everything you do for your students this year. Rest up. ❄️ #microschool #schoolfounder #happyholidays",
      },
      {
        id: "2026-12-26-break-mode",
        date: "2026-12-26",
        time: "9am",
        platforms: IG,
        pillar: "Brand",
        carouselId: "posts-holiday-singles",
        slideId: "break-mode",
        label: "Holiday singles #12: Winter break mode: on",
        caption: "Winter break mode: on. The crew is off until January, and we hope you are too. See you in the new year. ❄️ #microschool #winterbreak",
      },
      {
        id: "2026-12-27-year-wrapped",
        date: "2026-12-27",
        time: "6pm",
        platforms: IG_FB,
        pillar: "Laugh",
        carouselId: "posts-holiday-singles",
        slideId: "year-wrapped",
        label: "Holiday singles #11: Your school year, wrapped",
        caption:
          "Your school year, wrapped. Top phrase: \"quick question.\" Top app: Venmo. Top genre: permission slips. What would be on yours? 👇 #microschool #schoolfounder #wrapped",
      },
    ],
  },
  {
    id: "week-6",
    start: "2026-12-28",
    title: "Week 6 · Dec 28 – Jan 3 (new year)",
    note: "Six posts that turn toward spring enrollment. Nothing on New Year's Day; the week ends with a back-from-break carousel.",
    ads: {
      sets: "New year 60% · Winter break 40% (no-offer exports from Jan 1)",
      primaryText:
        "Microschool directors: new year, same six tabs? MudKitchen puts enrollment, tuition, messages and attendance in one place. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
      headline: "Not this year, tabs",
    },
    items: [
      {
        id: "2026-12-28-pick-your-fighter",
        date: "2026-12-28",
        time: "9am",
        platforms: IG_FB,
        pillar: "Laugh",
        carouselId: "mascot-crew-singles",
        slideId: "pick-your-fighter",
        label: "Crew singles #7: Pick your fighter",
        caption: "Pick your fighter for spring enrollment. 🥊 Comment the crew member you're sending in first. #microschool #enrollment #schoolfounder",
      },
      {
        id: "2026-12-29-resolution-bingo",
        date: "2026-12-29",
        time: "9am",
        platforms: IG_FB,
        pillar: "Talk",
        carouselId: "posts-holiday-singles",
        slideId: "resolution-bingo",
        label: "Holiday singles #10: Resolution bingo",
        caption:
          "New Year's resolution bingo, school founder edition. How many squares are you going for? Screenshot it, circle yours, check back in March. 😅 #microschool #schoolfounder #newyear",
      },
      {
        id: "2026-12-30-spring-enrollment-plan",
        date: "2026-12-30",
        time: "9am; LinkedIn 4pm",
        platforms: ALL,
        pillar: "Show",
        carouselId: "mascot-spring-enrollment-plan",
        label: "Carousel: Your spring enrollment game plan",
        caption:
          "Spring enrollment opens in January. Here's the game plan, in 5 steps. 📋 Save it now, thank yourself in February. Swipe → #microschool #enrollment #schoolfounder",
      },
      {
        id: "2026-12-31-january-checklist",
        date: "2026-12-31",
        time: "9am; LinkedIn 4pm",
        platforms: ALL,
        pillar: "Teach",
        carouselId: "posts-weekly-singles",
        slideId: "january-checklist",
        label: "Weekly singles #8: Your January checklist",
        caption:
          "Your January checklist for a calm spring semester. Save it, screenshot it, tape it to the fridge next to the volunteer sheet. #microschool #schoolfounder #newyear",
      },
      {
        id: "2027-01-02-flicker-one-photo",
        date: "2027-01-02",
        time: "9am",
        platforms: IG,
        pillar: "Laugh",
        carouselId: "mascot-crew-singles",
        slideId: "flicker-attempts",
        label: "Crew singles #1: Flicker's one good photo",
        caption: "Flicker just wanted one good group photo. How many tries does yours usually take? 📸 #microschool #pictureday #schoollife",
      },
      {
        id: "2027-01-03-bramble-forms",
        date: "2027-01-03",
        time: "6pm",
        platforms: IG_FB,
        pillar: "Show",
        carouselId: "mascot-bramble-forms",
        label: "Carousel: Bramble's backpack (forms)",
        caption:
          "Back from break, and there are 41 unsigned forms in a backpack somewhere. 🎒 Bramble ranked them by how fast they get lost. Then: 41 → 0. Swipe → #microschool #schoolforms #schoolfounder",
      },
    ],
  },
];

/** Posts to swap in if a slot opens or a post underperforms. */
export const SCHEDULE_SPARES =
  "The Pip, Dig, Terra, Fennel, Clover, Marigold, Loam and Dot carousels; crew singles #2, #3 and #4; the original tuition, application and “where was that update” carousels; and the free custom preview campaign (the 12 free-preview ads, the 8 free-preview singles, and the “What happens after you send us your website” and “From 9 tools to one link” carousels), all linking to trymudkitchen.com/free-preview.";

export const SCHEDULE_ITEMS: ScheduleItem[] = SOCIAL_SCHEDULE.flatMap((week) => week.items);

export const SCHEDULE_ITEM_IDS = new Set(SCHEDULE_ITEMS.map((item) => item.id));

export function isScheduleItemId(id: string): boolean {
  return SCHEDULE_ITEM_IDS.has(id);
}

export function getScheduleItem(id: string): ScheduleItem | undefined {
  return SCHEDULE_ITEMS.find((item) => item.id === id);
}

export const SCHEDULE_STATUSES = ["planned", "scheduled", "posted"] as const;
export type ScheduleStatus = (typeof SCHEDULE_STATUSES)[number];

export function isScheduleStatus(value: unknown): value is ScheduleStatus {
  return typeof value === "string" && (SCHEDULE_STATUSES as readonly string[]).includes(value);
}
