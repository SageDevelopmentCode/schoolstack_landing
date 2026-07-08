"use client";

import {
  AlertTriangle,
  Camera,
  ClipboardList,
  CreditCard,
  FileText,
  Heart,
  Pill,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import type { ChecklistStepIconKey } from "@/lib/admissions/enrollment-checklist-schema";

export const CHECKLIST_STEP_ICON_MAP: Record<
  ChecklistStepIconKey,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  fileText: FileText,
  users: Users,
  heart: Heart,
  pill: Pill,
  shieldCheck: ShieldCheck,
  clipboardList: ClipboardList,
  camera: Camera,
  alertTriangle: AlertTriangle,
  userPlus: UserPlus,
  creditCard: CreditCard,
};

export const CHECKLIST_STEP_ICON_COLORS: Record<
  ChecklistStepIconKey,
  { bg: string; color: string }
> = {
  fileText: { bg: "#EEF4F8", color: "#827096" },
  users: { bg: "#F5F0E8", color: "#5C4A2A" },
  heart: { bg: "#FEE2E2", color: "#B91C1C" },
  pill: { bg: "#EDE9FE", color: "#6D28D9" },
  shieldCheck: { bg: "#D1FAE5", color: "#047857" },
  clipboardList: { bg: "#CFFAFE", color: "#0E7490" },
  camera: { bg: "#E0E7FF", color: "#4338CA" },
  alertTriangle: { bg: "#FFEDD5", color: "#C2410C" },
  userPlus: { bg: "#F3E8FF", color: "#7C3AED" },
  creditCard: { bg: "#DCFCE7", color: "#15803D" },
};
