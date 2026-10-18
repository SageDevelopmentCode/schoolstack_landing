import type { LucideIcon } from "lucide-react";
import { Calculator, ChartColumn, ClipboardCheck } from "lucide-react";

export type FreeToolsHubToolId = "enrollment" | "tuition" | "operations";

export type FreeToolsHubAccent = "default" | "sky" | "gold";

export type FreeToolsHubTool = {
  id: FreeToolsHubToolId;
  href: string;
  kicker: string;
  title: string;
  description: string;
  ctaLabel: string;
  timeHint: string;
  accent: FreeToolsHubAccent;
  icon: LucideIcon;
};

export type FreeToolsHubFaq = {
  question: string;
  answer: string;
};

export const FREE_TOOLS_HUB_TOOLS: FreeToolsHubTool[] = [
  {
    id: "enrollment",
    href: "/how-many-students",
    kicker: "01 · Enrollment",
    title: "How many students do I need?",
    description:
      "Find the enrollment needed to cover your school’s costs and pay yourself.",
    ctaLabel: "Find my enrollment target",
    timeHint: "Enter your costs, pay goal, and tuition",
    accent: "default",
    icon: Calculator,
  },
  {
    id: "tuition",
    href: "/tuition-planner",
    kicker: "02 · Tuition",
    title: "What if I change tuition?",
    description:
      "Try a different tuition or enrollment and compare the annual revenue with your current plan.",
    ctaLabel: "Compare tuition plans",
    timeHint: "Adjust tuition, students, and billing months",
    accent: "sky",
    icon: ChartColumn,
  },
  {
    id: "operations",
    href: "/microschool-ops-check",
    kicker: "03 · Operations",
    title: "Where are the loose threads?",
    description:
      "Look at admissions, tuition, paperwork, and communication to find your next practical step.",
    ctaLabel: "Get my personalized report",
    timeHint: "About three minutes · personalized report",
    accent: "gold",
    icon: ClipboardCheck,
  },
];

export const FREE_TOOLS_HUB_FAQS: FreeToolsHubFaq[] = [
  {
    question: "Do I need a MudKitchen account?",
    answer:
      "No. These tools open directly—no signup, contact details, or connecting your school’s accounts.",
  },
  {
    question: "Will these numbers be saved?",
    answer:
      "The tuition planner and Ops Check can keep progress in your browser when storage is available. The enrollment calculator resets when you leave the page. Nothing you enter is sent to MudKitchen servers for these free tools.",
  },
  {
    question: "Are the calculations a financial forecast?",
    answer:
      "No. They are planning estimates based on the numbers you enter. The enrollment calculator assumes full tuition is collected; the tuition planner estimates revenue, not profit. Review each tool’s assumptions before using its results.",
  },
  {
    question: "What’s included in the Ops Check?",
    answer:
      "A short questionnaire about admissions, tuition, paperwork, and family communication, plus a personalized report with practical next steps. It takes about three minutes.",
  },
];
