import type { LucideIcon } from "lucide-react";
import { Calculator, ClipboardCheck, Scale } from "lucide-react";

export const FREE_TOOLS_HUB_PATH = "/tools";

export type MarketingFreeTool = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
};

export const MARKETING_FREE_TOOLS: MarketingFreeTool[] = [
  {
    href: "/how-many-students",
    title: "Can your school pay you?",
    description:
      "Find the enrollment you need to cover your costs and pay yourself.",
    icon: Calculator,
  },
  {
    href: "/tuition-planner",
    title: "Tuition revenue planner",
    description:
      "Change tuition or enrollment and see the difference in annual revenue before you tell families.",
    icon: Scale,
  },
  {
    href: "/microschool-ops-check",
    title: "Microschool Ops Check",
    description:
      "Admissions, paperwork, tuition tracking, and parent communication — get a personalized report in about three minutes.",
    icon: ClipboardCheck,
    badge: "~3 min",
  },
];

export const FREE_TOOLS_NAV_LABEL = "Free tools";
