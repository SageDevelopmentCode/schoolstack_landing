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
import { MUDKITCHEN_MARKETING_STORY_THEME as theme } from "@/lib/marketing/mudkitchen-story-theme";

export type AboutFeatureChip = {
  id: string;
  label: string;
  icon: LucideIcon;
  chipBg: string;
  chipBorder: string;
  iconBg: string;
  iconColor: string;
};

function chipColors(accent: string): Pick<
  AboutFeatureChip,
  "chipBg" | "chipBorder" | "iconBg" | "iconColor"
> {
  return {
    chipBg: `color-mix(in srgb, ${accent} 14%, ${theme.white})`,
    chipBorder: `color-mix(in srgb, ${accent} 30%, ${theme.line})`,
    iconBg: `color-mix(in srgb, ${accent} 24%, ${theme.white})`,
    iconColor: accent,
  };
}

function defineChip(
  id: string,
  label: string,
  icon: LucideIcon,
  accent: string,
): AboutFeatureChip {
  return { id, label, icon, ...chipColors(accent) };
}

export const BUILT_CAPABILITY_CHIPS: readonly AboutFeatureChip[] = [
  defineChip("website", "Branded school website", Globe, theme.primary),
  defineChip("parent-app", "Parent portal & mobile app", Smartphone, theme.sky),
  defineChip("applications", "Applications & enrollment", ClipboardList, theme.coral),
  defineChip("tuition", "Tuition & family billing", CreditCard, theme.success),
  defineChip("communication", "Family communication", MessagesSquare, theme.berry),
  defineChip("marketing", "Marketing, tours & shadow days", Megaphone, theme.sun),
  defineChip("teachers", "Teacher dashboards", GraduationCap, theme.sage),
  defineChip("admin", "School administration & finances", Building2, theme.primaryDark),
  defineChip("automations", "Automations", Zap, theme.warning),
];

export const CORE_FEATURE_CHIPS: readonly AboutFeatureChip[] = [
  defineChip("core-website", "Branded school website", Globe, theme.sky),
  defineChip(
    "core-enrollment",
    "Enrollment and registration workflows",
    ClipboardList,
    theme.primary,
  ),
  defineChip(
    "core-portal",
    "Parent portal, forms, and billing",
    LayoutDashboard,
    theme.coral,
  ),
  defineChip(
    "core-records",
    "Student records and family information",
    UserRound,
    theme.berry,
  ),
  defineChip(
    "core-tuition",
    "Tuition, fees, and Stripe payments",
    Wallet,
    theme.success,
  ),
  defineChip(
    "core-admin",
    "Admin tools for daily operations",
    Building2,
    theme.primaryDark,
  ),
  defineChip(
    "core-teachers",
    "Teacher workflows and classroom tools",
    GraduationCap,
    theme.sage,
  ),
  defineChip(
    "core-mobile",
    "Mobile app for families and staff",
    Smartphone,
    theme.sun,
  ),
  defineChip("core-support", "Guided setup and support", LifeBuoy, theme.sky),
];
