import { Calendar, ClipboardList, Receipt, RefreshCw, Wallet } from "lucide-react";

export const TUITION_FAMILY_TABS = [
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "balance", label: "Balance", icon: Wallet },
  { id: "autopay", label: "Autopay", icon: RefreshCw },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "payments", label: "Payment history", icon: Receipt },
] as const;

export type TuitionFamilyTabId = (typeof TUITION_FAMILY_TABS)[number]["id"];

export const DEFAULT_TUITION_FAMILY_TAB: TuitionFamilyTabId = "assignments";
