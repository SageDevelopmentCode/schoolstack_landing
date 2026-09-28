export type MondayCheckPillarId =
  | "inquiry_capture"
  | "family_next_steps"
  | "tour_scheduling"
  | "post_tour_followup"
  | "forms_documents"
  | "tuition_payments"
  | "parent_self_service"
  | "family_communication"
  | "admin_continuity"
  | "growth_clarity";

export type MondayCheckOption = {
  id: string;
  label: string;
  score: number;
  insight: string;
  action: string;
  mudkitchen: string;
  featureHref: string;
  /** Q10 only: which pillar to spotlight when this option is chosen */
  spotlightPillar?: MondayCheckPillarId;
};

export type MondayCheckQuestion = {
  id: string;
  prompt: string;
  pillar: MondayCheckPillarId;
  options: MondayCheckOption[];
};

export const MONDAY_CHECK_QUESTIONS: MondayCheckQuestion[] = [
  {
    id: "q1",
    prompt: "Where does a new family inquiry end up?",
    pillar: "inquiry_capture",
    options: [
      {
        id: "q1-a",
        label: "One tracked place",
        score: 0,
        insight:
          "You have a single front door for interest—which means fewer families slip through the cracks.",
        action:
          "Keep a simple status on every open inquiry (new, touring, applied, enrolled) so the team shares the same picture.",
        mudkitchen:
          "MudKitchen admissions keeps inquiries and family records tied together so nothing lives only in someone's inbox.",
        featureHref: "/get-started",
      },
      {
        id: "q1-b",
        label: "Mainly email, we watch it",
        score: 1,
        insight:
          "Email works until volume picks up—then threads get buried and response time varies.",
        action:
          "Pick one shared inbox or label and agree who owns first reply within 24 hours.",
        mudkitchen:
          "MudKitchen gives families a clear apply path on your site and stores each inquiry with the right family profile.",
        featureHref: "/get-started",
      },
      {
        id: "q1-c",
        label: "Email, forms, DMs, and more",
        score: 2,
        insight:
          "Scattered entry points make it hard to know who still needs a reply or a next step.",
        action:
          "List every place a family can reach you this week, then choose one system of record for new interest.",
        mudkitchen:
          "MudKitchen consolidates enrollment interest into one admissions workspace instead of five apps.",
        featureHref: "/get-started",
      },
      {
        id: "q1-d",
        label: "Whoever sees it first",
        score: 3,
        insight:
          "When ownership is accidental, families get uneven experiences—and you lose track of warm leads.",
        action:
          "Assign a default owner for new inquiries and a backup for days you're teaching.",
        mudkitchen:
          "MudKitchen routes new families into a tracked pipeline so the whole team sees the same queue.",
        featureHref: "/get-started",
      },
    ],
  },
  {
    id: "q2",
    prompt: "What's next for each interested family?",
    pillar: "family_next_steps",
    options: [
      {
        id: "q2-a",
        label: "Clear next step for everyone",
        score: 0,
        insight: "Defined next steps turn curiosity into enrollment without heroics.",
        action:
          "Document your stages (inquiry → tour → apply → enroll) on one page the team can reference.",
        mudkitchen:
          "MudKitchen mirrors a real admissions flow so each family has an obvious next action.",
        featureHref: "/get-started",
      },
      {
        id: "q2-b",
        label: "We have steps, someone nudges",
        score: 1,
        insight:
          "A process that needs a human reminder still costs you evenings and mental load.",
        action:
          "Add a weekly 15-minute pipeline review: who is stuck, and what is the one move for each?",
        mudkitchen:
          "MudKitchen surfaces where each family is in the journey so follow-up is visible, not tribal knowledge.",
        featureHref: "/get-started",
      },
      {
        id: "q2-c",
        label: "In an inbox, notes, or someone's head",
        score: 2,
        insight:
          "When next steps live in heads, growth means more dropped balls—not more capacity.",
        action:
          "Move open families to a shared list with one field: “next step + date.”",
        mudkitchen:
          "MudKitchen keeps family status and tasks in the admin workspace instead of private notes.",
        featureHref: "/get-started",
      },
      {
        id: "q2-d",
        label: "We figure it out when they write back",
        score: 3,
        insight:
          "Reactive follow-up often loses families who were ready—but didn't want to chase you.",
        action:
          "Send one templated “here's what happens next” message after every tour or inquiry.",
        mudkitchen:
          "MudKitchen automates the boring part: every family sees the same clear path forward.",
        featureHref: "/get-started",
      },
    ],
  },
  {
    id: "q3",
    prompt: "How do families schedule a tour or intro call?",
    pillar: "tour_scheduling",
    options: [
      {
        id: "q3-a",
        label: "They pick a time",
        score: 0,
        insight: "Self-serve scheduling respects busy parents and saves you coordination time.",
        action:
          "Keep your booking link in email signatures and on your website enrollment page.",
        mudkitchen:
          "MudKitchen connects tours and apply flows to your school's site so families book without a ping-pong thread.",
        featureHref: "/get-started",
      },
      {
        id: "q3-b",
        label: "A few back-and-forth messages",
        score: 1,
        insight:
          "Manual scheduling is fine at low volume; it becomes the bottleneck when interest spikes.",
        action:
          "Offer two concrete time windows in your first reply instead of open-ended “when works?”",
        mudkitchen:
          "MudKitchen reduces back-and-forth with scheduling built into the family journey.",
        featureHref: "/get-started",
      },
      {
        id: "q3-c",
        label: "Link sent, then we confirm",
        score: 2,
        insight:
          "Extra confirmation steps often mean no-shows or families who never finish booking.",
        action:
          "Track who clicked but didn't book and send one friendly nudge within 48 hours.",
        mudkitchen:
          "MudKitchen ties tour requests to the family record so confirmations aren't a separate hunt.",
        featureHref: "/get-started",
      },
      {
        id: "q3-d",
        label: "Different every week",
        score: 3,
        insight:
          "Inconsistent scheduling confuses families and makes your school feel harder to join than it is.",
        action:
          "Pick one default tour path for the next month—link, email template, and who hosts.",
        mudkitchen:
          "MudKitchen standardizes how families request and schedule time with your school.",
        featureHref: "/get-started",
      },
    ],
  },
  {
    id: "q4",
    prompt: "What happens after a tour?",
    pillar: "post_tour_followup",
    options: [
      {
        id: "q4-a",
        label: "Everyone gets a clear next step",
        score: 0,
        insight: "Post-tour clarity is where many microschools win enrollments.",
        action:
          "Send apply links and deadlines within 24 hours of every tour—same template, every time.",
        mudkitchen:
          "MudKitchen links tours to applications so families move from visit to paperwork in one flow.",
        featureHref: "/get-started",
      },
      {
        id: "q4-b",
        label: "We follow up, timing varies",
        score: 1,
        insight:
          "Variable timing means some families enroll quickly while others cool off.",
        action:
          "Set a team norm: first follow-up within one business day, second touch within one week.",
        mudkitchen:
          "MudKitchen shows which toured families haven't applied yet so nothing waits on memory.",
        featureHref: "/get-started",
      },
      {
        id: "q4-c",
        label: "Depends who gave the tour",
        score: 2,
        insight:
          "When follow-up style differs by person, families get uneven information—and you can't forecast enrollment.",
        action:
          "Share one post-tour email draft everyone uses, with space for a personal sentence.",
        mudkitchen:
          "MudKitchen keeps post-tour tasks on the family record, not on whoever gave the walkthrough.",
        featureHref: "/get-started",
      },
      {
        id: "q4-d",
        label: "We mean to follow up. Then Tuesday happens.",
        score: 3,
        insight:
          "Good intentions without a system quietly leak enrollment every season.",
        action:
          "Block 20 minutes after each tour block on your calendar for follow-up sends.",
        mudkitchen:
          "MudKitchen helps you run admissions like a pipeline—not a pile of good intentions.",
        featureHref: "/get-started",
      },
    ],
  },
  {
    id: "q5",
    prompt: "Where do enrollment forms and signed papers live?",
    pillar: "forms_documents",
    options: [
      {
        id: "q5-a",
        label: "With the right family or student",
        score: 0,
        insight: "Documents tied to families save hours at enrollment crunch time.",
        action:
          "Audit one enrolled family: can you find every signed form in under two minutes?",
        mudkitchen:
          "MudKitchen enrollment checklists keep forms, uploads, and signatures on the family record.",
        featureHref: "/get-started",
      },
      {
        id: "q5-b",
        label: "A shared folder we use",
        score: 1,
        insight:
          "Shared folders work until naming drifts or someone saves outside the structure.",
        action:
          "Agree on a folder naming rule: FamilyName_Year_Student.",
        mudkitchen:
          "MudKitchen replaces mystery folders with checklists linked to each application.",
        featureHref: "/get-started",
      },
      {
        id: "q5-c",
        label: "Email, downloads, random folders",
        score: 2,
        insight:
          "Hunting documents is one of the highest hidden costs for small school teams.",
        action:
          "Pick one checklist of required enrollment items and mark what's missing per family.",
        mudkitchen:
          "MudKitchen shows what's complete, what's outstanding, and who owes what—per family.",
        featureHref: "/get-started",
      },
      {
        id: "q5-d",
        label: "Somewhere safe. Probably.",
        score: 3,
        insight:
          "When you're not sure where paperwork lives, compliance and parent trust both get shaky.",
        action:
          "This week, gather all open enrollment docs into one place before accepting another application.",
        mudkitchen:
          "MudKitchen centralizes enrollment materials so “probably safe” becomes definitely findable.",
        featureHref: "/get-started",
      },
    ],
  },
  {
    id: "q6",
    prompt: "How do you track tuition and who's paid?",
    pillar: "tuition_payments",
    options: [
      {
        id: "q6-a",
        label: "One place shows paid and due",
        score: 0,
        insight: "A single tuition picture prevents awkward conversations and cash-flow surprises.",
        action:
          "Review balances monthly and note any family on a non-standard plan in the same system.",
        mudkitchen:
          "MudKitchen tuition and billing shows paid, due, and overdue in one admin view.",
        featureHref: "/get-started",
      },
      {
        id: "q6-b",
        label: "Payment app plus a spreadsheet",
        score: 1,
        insight:
          "Dual tracking often means the spreadsheet is right until it isn't—and reconciliation eats Sundays.",
        action:
          "Decide which source is authoritative and stop updating the other for two weeks as a trial.",
        mudkitchen:
          "MudKitchen connects family billing to your school records so spreadsheets become optional.",
        featureHref: "/get-started",
      },
      {
        id: "q6-c",
        label: "Split across apps and messages",
        score: 2,
        insight:
          "Tuition scattered across tools makes gentle reminders feel chaotic to parents.",
        action:
          "List every place money is discussed (Venmo, email, portal) and pick one parent-facing channel.",
        mudkitchen:
          "MudKitchen gives families one place to pay and see receipts—aligned with your admin ledger.",
        featureHref: "/get-started",
      },
      {
        id: "q6-d",
        label: "When someone asks—or when we remember",
        score: 3,
        insight:
          "Reactive billing creates stress for you and uncertainty for families on payment plans.",
        action:
          "Set a recurring calendar reminder to scan balances every Monday morning.",
        mudkitchen:
          "MudKitchen surfaces who needs a nudge before anyone has to ask awkwardly.",
        featureHref: "/get-started",
      },
    ],
  },
  {
    id: "q7",
    prompt: "A parent needs the calendar, receipt, or form. What happens?",
    pillar: "parent_self_service",
    options: [
      {
        id: "q7-a",
        label: "They can get it themselves",
        score: 0,
        insight:
          "Self-service parent access is a force multiplier—especially when you're in the classroom.",
        action:
          "Ask one parent what they wished they could find without emailing you; fix that one thing.",
        mudkitchen:
          "MudKitchen parent portal puts calendars, forms, billing, and updates in one calm home base.",
        featureHref: "/get-started",
      },
      {
        id: "q7-b",
        label: "We send a link quickly",
        score: 1,
        insight:
          "Fast replies help, but you're still the search engine for your school.",
        action:
          "Build a short “parent quick links” page and reuse it in every reply.",
        mudkitchen:
          "MudKitchen reduces repeat requests by keeping resources where parents already log in.",
        featureHref: "/get-started",
      },
      {
        id: "q7-c",
        label: "Someone hunts it down",
        score: 2,
        insight:
          "Internal scavenger hunts don't scale when enrollment grows or staff is part-time.",
        action:
          "Tag your five most-requested items and store them in one shared location with stable URLs.",
        mudkitchen:
          "MudKitchen links documents and billing to each family so staff aren't digging through drives.",
        featureHref: "/get-started",
      },
      {
        id: "q7-d",
        label: "We've sent that link many times",
        score: 3,
        insight:
          "Repeat link requests are a signal parents need a real portal—not another email thread.",
        action:
          "Track how many times you resent the same resource this month; that's your portal priority list.",
        mudkitchen:
          "MudKitchen mobile app and parent portal cut down “can you resend that?” forever.",
        featureHref: "/get-started",
      },
    ],
  },
  {
    id: "q8",
    prompt: "How many tools do you use to message families?",
    pillar: "family_communication",
    options: [
      {
        id: "q8-a",
        label: "One main place",
        score: 0,
        insight: "One channel means parents know where urgent news lives.",
        action:
          "Publish a short comms policy: what goes in the portal vs. what warrants a text.",
        mudkitchen:
          "MudKitchen messaging keeps school–family conversations in context with each student.",
        featureHref: "/get-started",
      },
      {
        id: "q8-b",
        label: "Two, and we know which is which",
        score: 1,
        insight:
          "Two channels can work with crisp boundaries—until a substitute or new parent joins mid-year.",
        action:
          "Add a one-line “how we communicate” blurb to your welcome packet.",
        mudkitchen:
          "MudKitchen reduces channel sprawl by pairing messaging with enrollment and billing.",
        featureHref: "/get-started",
      },
      {
        id: "q8-c",
        label: "Three or more",
        score: 2,
        insight:
          "Multiple channels increase the odds a family misses something important.",
        action:
          "Pick one channel for official school updates and migrate there over the next month.",
        mudkitchen:
          "MudKitchen gives families one trusted place for messages—not another group chat to monitor.",
        featureHref: "/get-started",
      },
      {
        id: "q8-d",
        label: "Several—we have to remember which",
        score: 3,
        insight:
          "When staff must remember channels, parents feel the friction—and so do you.",
        action:
          "Survey parents: where do they actually see your notes? Double down on that winner.",
        mudkitchen:
          "MudKitchen aligns team messaging with family records so context travels with the conversation.",
        featureHref: "/get-started",
      },
    ],
  },
  {
    id: "q9",
    prompt: "You're out three days. What happens to school admin?",
    pillar: "admin_continuity",
    options: [
      {
        id: "q9-a",
        label: "The team keeps it going",
        score: 0,
        insight:
          "Operational resilience is rare in microschools—you've built something worth protecting.",
        action:
          "Document logins and weekly rhythms so backup isn't only in your head.",
        mudkitchen:
          "MudKitchen admin workspace lets trusted staff run admissions, tuition, and comms without you in every thread.",
        featureHref: "/get-started",
      },
      {
        id: "q9-b",
        label: "Mostly fine, a few questions",
        score: 1,
        insight:
          "Small gaps are normal—until the wrong gap happens during enrollment week.",
        action:
          "Write a one-page “while I'm out” guide: who to ask, where records live.",
        mudkitchen:
          "MudKitchen keeps school operations in one system so coverage isn't a treasure hunt.",
        featureHref: "/get-started",
      },
      {
        id: "q9-c",
        label: "Someone would text me",
        score: 2,
        insight:
          "Founder-as-router is a tax on every sick day and vacation.",
        action:
          "Delegate one admin task this month (billing check, tour reply) to build redundancy.",
        mudkitchen:
          "MudKitchen gives your team shared visibility so you're not the human API for school admin.",
        featureHref: "/get-started",
      },
      {
        id: "q9-d",
        label: "School runs; my phone doesn't",
        score: 3,
        insight:
          "When admin lives on one person's device, growth multiplies interruptions—not capacity.",
        action:
          "Move one critical workflow (applications or tuition) into a shared tool this quarter.",
        mudkitchen:
          "MudKitchen is built so microschool teams can run school admin without living in your texts.",
        featureHref: "/get-started",
      },
    ],
  },
  {
    id: "q10",
    prompt: "If you added 10 students, what would break first?",
    pillar: "growth_clarity",
    options: [
      {
        id: "q10-a",
        label: "We'd be okay",
        score: 0,
        spotlightPillar: "admin_continuity",
        insight:
          "You're in a strong spot—growth will still test systems you haven't needed at scale yet.",
        action:
          "Stress-test one workflow (apply → enroll → pay) with a pretend family before the rush.",
        mudkitchen:
          "MudKitchen helps you stay ahead so the next ten students feel as calm as the last ten.",
        featureHref: "/get-started",
      },
      {
        id: "q10-b",
        label: "Enrollment paperwork",
        score: 1,
        spotlightPillar: "forms_documents",
        insight:
          "Paperwork is usually the first crack when headcount jumps—before classroom culture changes.",
        action:
          "List every form required today and mark which could be digital checklists.",
        mudkitchen:
          "MudKitchen enrollment checklists scale with you—same steps, more families, less chaos.",
        featureHref: "/get-started",
      },
      {
        id: "q10-c",
        label: "Parent communication",
        score: 1,
        spotlightPillar: "family_communication",
        insight:
          "More families mean more questions, reminders, and threads unless comms are centralized.",
        action:
          "Batch weekly updates instead of one-off replies where possible.",
        mudkitchen:
          "MudKitchen messaging and parent portal keep communication proportional to your size.",
        featureHref: "/get-started",
      },
      {
        id: "q10-d",
        label: "Tuition tracking",
        score: 1,
        spotlightPillar: "tuition_payments",
        insight:
          "More students multiply invoices, plans, and exceptions—spreadsheets break quietly.",
        action:
          "Confirm how you'd handle ten more payment plans before you need to.",
        mudkitchen:
          "MudKitchen tuition tools grow with enrollment without a second ledger.",
        featureHref: "/get-started",
      },
      {
        id: "q10-e",
        label: "Keeping info straight",
        score: 2,
        spotlightPillar: "inquiry_capture",
        insight:
          "When information sprawls, every new student adds cognitive load across the whole team.",
        action:
          "Map where student and family data lives today—then pick one source of truth.",
        mudkitchen:
          "MudKitchen connects admissions, records, billing, and comms so information stays straight.",
        featureHref: "/get-started",
      },
      {
        id: "q10-f",
        label: "Not sure",
        score: 3,
        spotlightPillar: "growth_clarity",
        insight:
          "Uncertainty about what would break first is a sign ops are held together informally—not badly, just fragily.",
        action:
          "Take this quiz's top three themes and discuss them at your next team meeting.",
        mudkitchen:
          "MudKitchen gives microschools one calm system so growth feels predictable, not mysterious.",
        featureHref: "/get-started",
      },
    ],
  },
];

export const PILLAR_LABELS: Record<MondayCheckPillarId, string> = {
  inquiry_capture: "Inquiry capture",
  family_next_steps: "Family next steps",
  tour_scheduling: "Tour & intro scheduling",
  post_tour_followup: "Post-tour follow-up",
  forms_documents: "Forms & signed documents",
  tuition_payments: "Tuition & payments",
  parent_self_service: "Parent self-service",
  family_communication: "Family communication",
  admin_continuity: "Admin continuity",
  growth_clarity: "Growth readiness",
};

export type MondayCheckAnswers = Record<string, string>;

export type MondayCheckTier = {
  id: string;
  title: string;
  summary: string;
  mudkitchenPitch: string;
  minScore: number;
  maxScore: number;
};

export const MONDAY_CHECK_TIERS: MondayCheckTier[] = [
  {
    id: "steady",
    title: "Steady Monday",
    minScore: 0,
    maxScore: 7,
    summary:
      "You're running tighter than most microschools. The gaps are small—but growth will still test informal habits.",
    mudkitchenPitch:
      "MudKitchen helps you keep this calm as you add families: one connected system for admissions, billing, documents, and parent communication.",
  },
  {
    id: "loose_threads",
    title: "A few loose threads",
    minScore: 8,
    maxScore: 14,
    summary:
      "You've got real processes, but a few areas still depend on someone's memory or inbox.",
    mudkitchenPitch:
      "MudKitchen turns those loose threads into shared workflows so your team isn't re-deciding the same steps every week.",
  },
  {
    id: "spread_thin",
    title: "Spread across tools",
    minScore: 15,
    maxScore: 21,
    summary:
      "You're doing the work—but it's scattered across apps, messages, and folders. That tax shows up on Mondays.",
    mudkitchenPitch:
      "MudKitchen replaces the patchwork with one place to enroll families, collect tuition, share documents, and message parents.",
  },
  {
    id: "monday_never_ends",
    title: "Monday never ends",
    minScore: 22,
    maxScore: 27,
    summary:
      "Admin is competing with teaching for your attention. Families still love your school—but ops are held together with grit.",
    mudkitchenPitch:
      "MudKitchen was built by a microschool founder to get evenings back: admissions, billing, and parent comms in one system made for schools your size.",
  },
];

export const MONDAY_CHECK_INTRO_FAQS = [
  {
    question: "What is the Microschool Monday Check?",
    answer:
      "A free ten-question check for how inquiries, enrollment, tuition, and parent communication run at your school.",
  },
  {
    question: "Who is this assessment for?",
    answer:
      "Microschool founders and small-school leaders who handle admin alongside teaching.",
  },
  {
    question: "How long does it take?",
    answer: "About three minutes, with instant results.",
  },
  {
    question: "Do I need to use MudKitchen to take the check?",
    answer: "No—results are free. Book a demo anytime if you want a walkthrough.",
  },
  {
    question: "How are results calculated?",
    answer:
      "We weight your answers by theme (admissions, documents, tuition, comms) and suggest next steps.",
  },
];

function findOption(questionId: string, optionId: string): MondayCheckOption | null {
  const question = MONDAY_CHECK_QUESTIONS.find((q) => q.id === questionId);
  if (!question) return null;
  return question.options.find((o) => o.id === optionId) ?? null;
}

/** Sum scores for questions 1–9 only (max 27). */
export function computeTotalScore(answers: MondayCheckAnswers): number {
  let total = 0;
  for (const question of MONDAY_CHECK_QUESTIONS) {
    if (question.id === "q10") continue;
    const optionId = answers[question.id];
    if (!optionId) continue;
    const option = findOption(question.id, optionId);
    if (option) total += option.score;
  }
  return total;
}

export function resolveOverallTier(totalScore: number): MondayCheckTier {
  const tier =
    MONDAY_CHECK_TIERS.find(
      (t) => totalScore >= t.minScore && totalScore <= t.maxScore,
    ) ?? MONDAY_CHECK_TIERS[MONDAY_CHECK_TIERS.length - 1];
  return tier;
}

export function computePillarWeights(
  answers: MondayCheckAnswers,
): Record<MondayCheckPillarId, number> {
  const weights: Record<MondayCheckPillarId, number> = {
    inquiry_capture: 0,
    family_next_steps: 0,
    tour_scheduling: 0,
    post_tour_followup: 0,
    forms_documents: 0,
    tuition_payments: 0,
    parent_self_service: 0,
    family_communication: 0,
    admin_continuity: 0,
    growth_clarity: 0,
  };

  for (const question of MONDAY_CHECK_QUESTIONS) {
    const optionId = answers[question.id];
    if (!optionId) continue;
    const option = findOption(question.id, optionId);
    if (!option) continue;

    if (question.id === "q10") {
      const spotlight = option.spotlightPillar ?? "growth_clarity";
      weights[spotlight] += 3;
      if (option.id === "q10-f") {
        for (const key of Object.keys(weights) as MondayCheckPillarId[]) {
          if (key !== "growth_clarity") weights[key] += 0.5;
        }
      }
      continue;
    }

    weights[question.pillar] += option.score;
  }

  return weights;
}

export type PillarWeightEntry = {
  pillar: MondayCheckPillarId;
  label: string;
  weight: number;
};

export function getTopPillars(
  answers: MondayCheckAnswers,
  limit = 3,
): PillarWeightEntry[] {
  const weights = computePillarWeights(answers);
  return (Object.keys(weights) as MondayCheckPillarId[])
    .map((pillar) => ({
      pillar,
      label: PILLAR_LABELS[pillar],
      weight: weights[pillar],
    }))
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

export type PersonalizedInsight = {
  questionId: string;
  prompt: string;
  option: MondayCheckOption;
  pillar: MondayCheckPillarId;
  pillarLabel: string;
};

export function getPersonalizedInsights(
  answers: MondayCheckAnswers,
): PersonalizedInsight[] {
  const insights: PersonalizedInsight[] = [];

  for (const question of MONDAY_CHECK_QUESTIONS) {
    const optionId = answers[question.id];
    if (!optionId) continue;
    const option = findOption(question.id, optionId);
    if (!option) continue;

    const pillar =
      question.id === "q10" && option.spotlightPillar
        ? option.spotlightPillar
        : question.pillar;

    insights.push({
      questionId: question.id,
      prompt: question.prompt,
      option,
      pillar,
      pillarLabel: PILLAR_LABELS[pillar],
    });
  }

  return insights.sort((a, b) => b.option.score - a.option.score);
}

export function getSpotlightFromQ10(
  answers: MondayCheckAnswers,
): PillarWeightEntry | null {
  const optionId = answers.q10;
  if (!optionId) return null;
  const option = findOption("q10", optionId);
  if (!option?.spotlightPillar) return null;
  return {
    pillar: option.spotlightPillar,
    label: PILLAR_LABELS[option.spotlightPillar],
    weight: 3,
  };
}

export function computeMondayCheckResults(answers: MondayCheckAnswers) {
  const totalScore = computeTotalScore(answers);
  const tier = resolveOverallTier(totalScore);
  const topPillars = getTopPillars(answers);
  const personalizedInsights = getPersonalizedInsights(answers);
  const growthSpotlight = getSpotlightFromQ10(answers);

  return {
    totalScore,
    maxScore: 27,
    tier,
    topPillars,
    personalizedInsights,
    growthSpotlight,
  };
}
