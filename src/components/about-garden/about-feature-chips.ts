import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ClipboardList,
  CreditCard,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  MessagesSquare,
  Smartphone,
  UserRound,
  Wallet,
  Zap,
} from "lucide-react";

export type AboutFeatureChip = {
  id: string;
  label: string;
  icon: LucideIcon;
};

function defineChip(id: string, label: string, icon: LucideIcon): AboutFeatureChip {
  return { id, label, icon };
}

export const BUILT_CAPABILITY_CHIPS: readonly AboutFeatureChip[] = [
  defineChip("website", "Branded school website", Globe),
  defineChip("parent-app", "Parent portal & mobile app", Smartphone),
  defineChip("applications", "Applications & enrollment", ClipboardList),
  defineChip("tuition", "Tuition & family billing", CreditCard),
  defineChip("communication", "Family communication", MessagesSquare),
  defineChip("marketing", "Marketing, tours & shadow days", Megaphone),
  defineChip("teachers", "Teacher dashboards", GraduationCap),
  defineChip("admin", "School administration & finances", Building2),
  defineChip("automations", "Automations", Zap),
];

export const CORE_FEATURE_CHIPS: readonly AboutFeatureChip[] = [
  defineChip("core-website", "Branded school website", Globe),
  defineChip("core-enrollment", "Enrollment and registration workflows", ClipboardList),
  defineChip("core-portal", "Parent portal, forms, and billing", LayoutDashboard),
  defineChip("core-records", "Student records and family information", UserRound),
  defineChip("core-tuition", "Tuition, fees, and Stripe payments", Wallet),
  defineChip("core-admin", "Admin tools for daily operations", Building2),
  defineChip("core-teachers", "Teacher workflows and classroom tools", GraduationCap),
  defineChip("core-mobile", "Mobile app for families and staff", Smartphone),
  defineChip("core-support", "Guided setup and support", LifeBuoy),
];
