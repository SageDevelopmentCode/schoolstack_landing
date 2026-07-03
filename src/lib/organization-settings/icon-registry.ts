import type { LucideIcon } from "lucide-react";
import {
  BarChart2,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Clock,
  DollarSign,
  Eye,
  FileText,
  GraduationCap,
  Heart,
  Home,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Puzzle,
  School,
  Users,
  Wallet,
} from "lucide-react";

export type FeatureIconOption = {
  slug: string;
  label: string;
  icon: LucideIcon;
};

const ICON_MAP: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "graduation-cap": GraduationCap,
  users: Users,
  "book-open": BookOpen,
  heart: Heart,
  "dollar-sign": DollarSign,
  megaphone: Megaphone,
  eye: Eye,
  puzzle: Puzzle,
  school: School,
  "message-square": MessageSquare,
  "calendar-days": CalendarDays,
  "clipboard-list": ClipboardList,
  home: Home,
  "file-text": FileText,
  clock: Clock,
  wallet: Wallet,
  "bar-chart-2": BarChart2,
};

export const FEATURE_ICON_OPTIONS: FeatureIconOption[] = [
  { slug: "layout-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { slug: "graduation-cap", label: "Graduation cap", icon: GraduationCap },
  { slug: "users", label: "Users", icon: Users },
  { slug: "book-open", label: "Book", icon: BookOpen },
  { slug: "heart", label: "Heart", icon: Heart },
  { slug: "dollar-sign", label: "Dollar", icon: DollarSign },
  { slug: "megaphone", label: "Megaphone", icon: Megaphone },
  { slug: "eye", label: "Eye", icon: Eye },
  { slug: "school", label: "School", icon: School },
  { slug: "message-square", label: "Message", icon: MessageSquare },
  { slug: "calendar-days", label: "Calendar", icon: CalendarDays },
  { slug: "clipboard-list", label: "Clipboard", icon: ClipboardList },
  { slug: "home", label: "Home", icon: Home },
  { slug: "file-text", label: "Document", icon: FileText },
  { slug: "clock", label: "Clock", icon: Clock },
  { slug: "wallet", label: "Wallet", icon: Wallet },
  { slug: "bar-chart-2", label: "Chart", icon: BarChart2 },
  { slug: "puzzle", label: "Puzzle", icon: Puzzle },
];

export function getFeatureIcon(slug: string | undefined): LucideIcon {
  if (!slug) return Puzzle;
  return ICON_MAP[slug] ?? Puzzle;
}

export const DEFAULT_FEATURE_ICON_SLUG = "puzzle";
