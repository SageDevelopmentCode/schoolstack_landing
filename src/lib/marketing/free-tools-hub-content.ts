import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Briefcase,
  Calculator,
  ChartColumn,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  Landmark,
  Sparkles,
} from "lucide-react";

export type FreeToolsHubToolId = "enrollment" | "tuition" | "operations";

export type FreeToolsHubAccent = "default" | "sky" | "gold";

export type FreeToolsHubStageId =
  | "prospective_family"
  | "applying_family"
  | "accepted_enrolling"
  | "enrolled"
  | "staff"
  | "founder_admin";

export type FreeToolsHubStage = {
  id: FreeToolsHubStageId;
  label: string;
  flowIcon: LucideIcon;
};

export const FREE_TOOLS_HUB_STAGES: FreeToolsHubStage[] = [
  {
    id: "prospective_family",
    label: "Trying to reach prospective families?",
    flowIcon: Sparkles,
  },
  {
    id: "applying_family",
    label: "When families need to apply?",
    flowIcon: ClipboardList,
  },
  {
    id: "accepted_enrolling",
    label: "What happens after they’re accepted?",
    flowIcon: BadgeCheck,
  },
  {
    id: "enrolled",
    label: "Once families are enrolled?",
    flowIcon: GraduationCap,
  },
  {
    id: "staff",
    label: "What do your staff need day to day?",
    flowIcon: Briefcase,
  },
  {
    id: "founder_admin",
    label: "Planning and running your school?",
    flowIcon: Landmark,
  },
];

export function freeToolsStageSectionId(stageId: FreeToolsHubStageId): string {
  return `free-tools-stage-${stageId}`;
}

export type FreeToolsHubTool = {
  id: FreeToolsHubToolId;
  stageId: FreeToolsHubStageId;
  href: string;
  kicker: string;
  title: string;
  description: string;
  ctaLabel: string;
  timeHint: string;
  accent: FreeToolsHubAccent;
  icon: LucideIcon;
};

export const FREE_TOOLS_HUB_TOOLS: FreeToolsHubTool[] = [
  {
    id: "enrollment",
    stageId: "founder_admin",
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
    stageId: "founder_admin",
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
    stageId: "founder_admin",
    href: "/microschool-ops-check",
    kicker: "03 · Operations",
    title: "What's holding your school back?",
    description:
      "Look at admissions, tuition, paperwork, and communication to find your next practical step.",
    ctaLabel: "Get my personalized report",
    timeHint: "About three minutes · personalized report",
    accent: "gold",
    icon: ClipboardCheck,
  },
];

export function toolsByStage(): Map<FreeToolsHubStageId, FreeToolsHubTool[]> {
  const map = new Map<FreeToolsHubStageId, FreeToolsHubTool[]>();
  for (const stage of FREE_TOOLS_HUB_STAGES) {
    map.set(stage.id, []);
  }
  for (const tool of FREE_TOOLS_HUB_TOOLS) {
    const list = map.get(tool.stageId);
    if (list) {
      list.push(tool);
    }
  }
  return map;
}
