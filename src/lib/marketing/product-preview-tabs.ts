import type { LucideIcon } from "lucide-react";
import {
  Globe,
  ClipboardList,
  CreditCard,
  CalendarCheck,
  Clock,
  Megaphone,
  LayoutDashboard,
} from "lucide-react";

export type ProductPreviewTabId =
  | "admin"
  | "website"
  | "enrollment"
  | "parents"
  | "teachers"
  | "marketing"
  | "timeclock";

export type ProductPreviewTabGroup = "website" | "parent" | "teacher" | "admin";

export type ProductPreviewTab = {
  id: ProductPreviewTabId;
  label: string;
  caption: string;
  description: string;
  icon: LucideIcon;
  group: ProductPreviewTabGroup;
};

export const PRODUCT_PREVIEW_GROUP_COLORS: Record<ProductPreviewTabGroup, string> =
  {
    website: "var(--color-accent)",
    parent: "#3b82f6",
    teacher: "#10b981",
    admin: "#f97316",
  };

export const PRODUCT_PREVIEW_TABS: ProductPreviewTab[] = [
  {
    id: "website",
    label: "Website",
    caption: "School Website",
    description:
      "A full school website with programs, FAQs, team, and calls to action.",
    icon: Globe,
    group: "website",
  },
  {
    id: "enrollment",
    label: "Enrollment",
    caption: "Enrollment System",
    description:
      "Enrollment with health info, emergency contacts, uploads, and signatures.",
    icon: ClipboardList,
    group: "parent",
  },
  {
    id: "parents",
    label: "Tuition",
    caption: "Tuition & Billing",
    description:
      "Families view invoices, make payments, and track tuition history in one place.",
    icon: CreditCard,
    group: "parent",
  },
  {
    id: "teachers",
    label: "Attendance",
    caption: "Attendance",
    description:
      "Log daily attendance for every student, track who showed up, and navigate week by week.",
    icon: CalendarCheck,
    group: "teacher",
  },
  {
    id: "timeclock",
    label: "Timeclock",
    caption: "Timeclock",
    description:
      "Log hours, track sessions, and view weekly and monthly totals in one place.",
    icon: Clock,
    group: "teacher",
  },
  {
    id: "marketing",
    label: "Marketing",
    caption: "Marketing",
    description:
      "Automated email campaigns and lead nurture sequences, all tied to your pipeline.",
    icon: Megaphone,
    group: "admin",
  },
  {
    id: "admin",
    label: "Admin",
    caption: "Admin Portal",
    description:
      "Enrollment, billing, and daily operations in one workspace — from first click to enrolled.",
    icon: LayoutDashboard,
    group: "admin",
  },
];

export const PRODUCT_PREVIEW_GROUP_META: {
  id: ProductPreviewTabGroup;
  label: string;
}[] = [
  { id: "website", label: "Web" },
  { id: "parent", label: "Parent" },
  { id: "teacher", label: "Teacher" },
  { id: "admin", label: "Admin" },
];

export const PRODUCT_PREVIEW_GROUPS = PRODUCT_PREVIEW_GROUP_META.map((g) => ({
  ...g,
  tabs: PRODUCT_PREVIEW_TABS.filter((t) => t.group === g.id),
}));

export function prefetchProductPreviewTab(
  id: ProductPreviewTabId,
  prefetchers: {
    prefetchWebsiteDemo: () => void;
    prefetchParentDemo: () => void;
    prefetchTeacherDemo: () => void;
    prefetchAdminDemo: () => void;
  },
) {
  switch (id) {
    case "website":
      prefetchers.prefetchWebsiteDemo();
      break;
    case "enrollment":
    case "parents":
      prefetchers.prefetchParentDemo();
      break;
    case "teachers":
    case "timeclock":
      prefetchers.prefetchTeacherDemo();
      break;
    case "admin":
    case "marketing":
      prefetchers.prefetchAdminDemo();
      break;
  }
}
