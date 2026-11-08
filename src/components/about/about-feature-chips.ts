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
import { MUDKITCHEN_MARKETING_BRIGHT_THEME as bright } from "@/lib/marketing/mudkitchen-bright-marketing-theme";
import { INK } from "@/components/home/bright-styles";

export type AboutFeatureChip = {
  id: string;
  label: string;
  icon: LucideIcon;
  chipBg: string;
  chipBorder: string;
  iconBg: string;
  iconColor: string;
};

function chipColors(accent: string, iconWell = "#F4F1EC"): Pick<
  AboutFeatureChip,
  "chipBg" | "chipBorder" | "iconBg" | "iconColor"
> {
  return {
    chipBg: iconWell,
    chipBorder: "rgba(0, 0, 0, 0.08)",
    iconBg: `color-mix(in srgb, ${accent} 18%, #FFFFFF)`,
    iconColor: accent,
  };
}

function defineChip(
  id: string,
  label: string,
  icon: LucideIcon,
  accent: string,
  iconWell?: string,
): AboutFeatureChip {
  return { id, label, icon, ...chipColors(accent, iconWell) };
}

export const BUILT_CAPABILITY_CHIPS: readonly AboutFeatureChip[] = [
  defineChip("website", "Branded school website", Globe, bright.primary, "#EEF3EC"),
  defineChip("parent-app", "Parent portal & mobile app", Smartphone, "#3d6bb3", "#EAF1FD"),
  defineChip("applications", "Applications & enrollment", ClipboardList, bright.coral, "#FDEFE4"),
  defineChip("tuition", "Tuition & family billing", CreditCard, bright.success, "#E9F2E4"),
  defineChip("communication", "Family communication", MessagesSquare, bright.berry, "#F8E8ED"),
  defineChip("marketing", "Marketing, tours & shadow days", Megaphone, bright.warning, "#FFF4D9"),
  defineChip("teachers", "Teacher dashboards", GraduationCap, "#4a7c59", "#E4F5EC"),
  defineChip("admin", "School administration & finances", Building2, INK, "#F4F1EC"),
  defineChip("automations", "Automations", Zap, bright.warning, "#FFF4D9"),
];

export const CORE_FEATURE_CHIPS: readonly AboutFeatureChip[] = [
  defineChip("core-website", "Branded school website", Globe, "#3d6bb3", "#EAF1FD"),
  defineChip(
    "core-enrollment",
    "Enrollment and registration workflows",
    ClipboardList,
    bright.primary,
    "#EEF3EC",
  ),
  defineChip(
    "core-portal",
    "Parent portal, forms, and billing",
    LayoutDashboard,
    bright.coral,
    "#FDEFE4",
  ),
  defineChip(
    "core-records",
    "Student records and family information",
    UserRound,
    bright.berry,
    "#F8E8ED",
  ),
  defineChip(
    "core-tuition",
    "Tuition, fees, and Stripe payments",
    Wallet,
    bright.success,
    "#E9F2E4",
  ),
  defineChip(
    "core-admin",
    "Admin tools for daily operations",
    Building2,
    INK,
    "#F4F1EC",
  ),
  defineChip(
    "core-teachers",
    "Teacher workflows and classroom tools",
    GraduationCap,
    "#4a7c59",
    "#E4F5EC",
  ),
  defineChip(
    "core-mobile",
    "Mobile app for families and staff",
    Smartphone,
    bright.warning,
    "#FFF4D9",
  ),
  defineChip("core-support", "Guided setup and support", LifeBuoy, "#3d6bb3", "#EAF1FD"),
];
