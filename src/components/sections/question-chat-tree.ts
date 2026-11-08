import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";

export const TRY_FREE_PATH = "/try";

export type QuestionChatAction = {
  id: "demo" | "try";
  label: string;
  href: string;
};

export const QUESTION_CHAT_ACTIONS: readonly QuestionChatAction[] = [
  { id: "demo", label: "Book a demo", href: GET_STARTED_PAGE_PATH },
  { id: "try", label: "Try it free", href: TRY_FREE_PATH },
];

export type QuestionChatNode = {
  id: string;
  question: string;
  answer: string;
  followUpIds: readonly string[];
  actions: readonly QuestionChatAction[];
};

export const QUESTION_CHAT_GREETING =
  "Hi. Pick a question and I’ll point you to the next step.";

export const QUESTION_CHAT_COVERED =
  "You’ve covered the basics. When you’re ready, book a walkthrough or try a free dashboard.";

export const QUESTION_CHAT_STARTERS = [
  "what-is",
  "who-for",
  "included",
  "get-started",
  "replaces",
] as const;

function node(
  entry: Omit<QuestionChatNode, "actions">,
): QuestionChatNode {
  return { ...entry, actions: QUESTION_CHAT_ACTIONS };
}

export const QUESTION_CHAT_NODES: Record<string, QuestionChatNode> = {
  "what-is": node({
    id: "what-is",
    question: "What is MudKitchen?",
    answer:
      "It’s the one place to run your microschool — enrollment, tuition, parent updates, and the daily work, together.",
    followUpIds: ["replaces", "website-enrollment", "who-for"],
  }),
  "who-for": node({
    id: "who-for",
    question: "Who is it for?",
    answer:
      "It’s for you if you’re launching a school or already running one, and you want parents, teachers, and admins in the same place.",
    followUpIds: ["launching", "already-running", "teachers", "parents"],
  }),
  included: node({
    id: "included",
    question: "What’s included?",
    answer:
      "The core plan covers your website, enrollment, the parent portal and billing, records, Stripe tuition, daily admin, and guided setup.",
    followUpIds: [
      "feat-website",
      "feat-enrollment",
      "feat-parent-billing",
      "feat-records",
      "feat-tuition",
      "feat-admin",
      "feat-setup",
      "custom-setup",
    ],
  }),
  "get-started": node({
    id: "get-started",
    question: "How do we get started?",
    answer:
      "Book a free 30-minute walkthrough of your school. No pitch, just whether MudKitchen fits.",
    followUpIds: ["setup-1", "setup-2", "setup-3"],
  }),
  replaces: node({
    id: "replaces",
    question: "What does it replace?",
    answer:
      "It takes the place of a separate website, enrollment forms, parent texts, tuition billing, and student spreadsheets.",
    followUpIds: ["replace-website", "replace-billing", "replace-parents"],
  }),
  "website-enrollment": node({
    id: "website-enrollment",
    question: "Does it include a website and enrollment?",
    answer:
      "Yes. You get a branded school site, and families can apply, share health info, and finish registration from there.",
    followUpIds: [],
  }),
  launching: node({
    id: "launching",
    question: "We’re launching a new school",
    answer:
      "If you’re opening a new school, we set it up with you so enrollment, billing, and parent updates start in one place.",
    followUpIds: [],
  }),
  "already-running": node({
    id: "already-running",
    question: "We already run a school",
    answer:
      "If the school is already running, forms, records, follow-ups, and billing come into one shared place as you grow.",
    followUpIds: [],
  }),
  teachers: node({
    id: "teachers",
    question: "What do teachers get?",
    answer:
      "Teachers see what changed and what a family needs, so the day is less about chasing details.",
    followUpIds: [],
  }),
  parents: node({
    id: "parents",
    question: "What do parents get?",
    answer:
      "Parents get one place for updates, forms, and the week ahead — not another thread to search.",
    followUpIds: [],
  }),
  "feat-website": node({
    id: "feat-website",
    question: "Is a school website included?",
    answer: "Yes. Your public site includes programs, the team, FAQs, and a path to enroll.",
    followUpIds: [],
  }),
  "feat-enrollment": node({
    id: "feat-enrollment",
    question: "How does enrollment work?",
    answer:
      "Families apply, add health and emergency contacts, upload documents, and finish registration in the same system you use.",
    followUpIds: [],
  }),
  "feat-parent-billing": node({
    id: "feat-parent-billing",
    question: "What about the parent portal and billing?",
    answer:
      "Families get a portal for updates, forms, and billing, instead of digging through email and group chats.",
    followUpIds: [],
  }),
  "feat-records": node({
    id: "feat-records",
    question: "Where do student records live?",
    answer:
      "Student and family records live with enrollment and tuition, not in a separate spreadsheet.",
    followUpIds: [],
  }),
  "feat-tuition": node({
    id: "feat-tuition",
    question: "How do tuition and fees work?",
    answer: "Tuition and fees are collected with Stripe, tied to enrollment and the parent portal.",
    followUpIds: [],
  }),
  "feat-admin": node({
    id: "feat-admin",
    question: "What admin tools are included?",
    answer:
      "Forms, reminders, onboarding, and follow-ups sit in clearer workflows as the school grows.",
    followUpIds: [],
  }),
  "feat-setup": node({
    id: "feat-setup",
    question: "How does guided setup work?",
    answer: "We move the important pieces over with you, then walk the team through going live.",
    followUpIds: [],
  }),
  "custom-setup": node({
    id: "custom-setup",
    question: "What if we need a larger setup?",
    answer:
      "Growing schools can add tour booking, custom tuition, or workflows that match how you already run.",
    followUpIds: [],
  }),
  "setup-1": node({
    id: "setup-1",
    question: "Show us how your school runs now.",
    answer:
      "We look at your forms, spreadsheets, and payments so the move is as clean as it can be.",
    followUpIds: [],
  }),
  "setup-2": node({
    id: "setup-2",
    question: "We build your setup inside MudKitchen.",
    answer:
      "We set up the essentials inside MudKitchen and bring over what matters, so you don’t start from zero.",
    followUpIds: [],
  }),
  "setup-3": node({
    id: "setup-3",
    question: "Go live with support.",
    answer: "We walk you through going live and stay with your team while everyone gets comfortable.",
    followUpIds: [],
  }),
  "replace-website": node({
    id: "replace-website",
    question: "What about the school website?",
    answer:
      "Your school site and enrollment forms live together — programs, team, FAQs, and applications in one place.",
    followUpIds: [],
  }),
  "replace-billing": node({
    id: "replace-billing",
    question: "What about tuition billing?",
    answer: "Tuition, fees, and Stripe payments replace a separate billing tool.",
    followUpIds: [],
  }),
  "replace-parents": node({
    id: "replace-parents",
    question: "What about parent updates?",
    answer:
      "Parent updates, forms, and schedules live in one place instead of texts and old email threads.",
    followUpIds: [],
  }),
};

export function nextQuestionIds(
  asked: readonly { id: string; followUpIds: readonly string[] }[],
): string[] {
  const visited = new Set(asked.map((item) => item.id));

  for (let index = asked.length - 1; index >= 0; index -= 1) {
    const pending = asked[index].followUpIds.filter(
      (id) => !visited.has(id) && QUESTION_CHAT_NODES[id],
    );
    if (pending.length > 0) return pending;
  }

  return QUESTION_CHAT_STARTERS.filter((id) => !visited.has(id));
}

export function questionChatDraft(questions: readonly string[]): string {
  if (questions.length === 0) return "";
  const lines = questions.map((question) => `- ${question}`).join("\n");
  return `I already looked through:\n${lines}\n\nMy question:\n`;
}
