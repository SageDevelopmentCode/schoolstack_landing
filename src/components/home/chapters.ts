import { BookOpen, Users, type LucideIcon } from "lucide-react";
import {
  PRODUCT_PREVIEW_GROUP_COLORS,
  PRODUCT_PREVIEW_TABS,
  type ProductPreviewTabId,
} from "@/lib/marketing/product-preview-tabs";
import type { DemoStageKey } from "./DemoStage";
import { ADMIN_COPY, FAMILY_COPY, TEACHER_COPY } from "./home-copy";

export type ChapterTab = {
  key: DemoStageKey;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export type Chapter = {
  id: "family" | "admin" | "teacher";
  color: string;
  tint: string;
  copy: {
    eyebrow: string;
    headlineLead: string;
    headlineAccent: string;
    body: string;
    cta: string;
    bullets?: readonly string[];
  };
  tabs: ChapterTab[];
};

/** Demo-stage keys that map onto an existing product preview tab. */
export const DEMO_KEY_TO_PREVIEW_TAB: Partial<Record<DemoStageKey, ProductPreviewTabId>> = {
  website: "website",
  enrollment: "enrollment",
  tuition: "parents",
  attendance: "teachers",
  timeclock: "timeclock",
  marketing: "marketing",
  admin: "admin",
};

/** Reverse map so product preview tabs can drive a DemoStage. */
export const PREVIEW_TAB_TO_DEMO_KEY: Record<ProductPreviewTabId, DemoStageKey> = {
  website: "website",
  enrollment: "enrollment",
  parents: "tuition",
  teachers: "attendance",
  timeclock: "timeclock",
  marketing: "marketing",
  admin: "admin",
};

function previewTab(key: DemoStageKey): ChapterTab {
  const id = DEMO_KEY_TO_PREVIEW_TAB[key];
  const tab = PRODUCT_PREVIEW_TABS.find((t) => t.id === id);
  if (!tab) throw new Error(`No product preview tab for ${key}`);
  return { key, label: tab.label, icon: tab.icon, description: tab.description };
}

export const CHAPTERS: Chapter[] = [
  {
    id: "family",
    color: PRODUCT_PREVIEW_GROUP_COLORS.parent,
    tint: "#EAF1FD",
    copy: FAMILY_COPY,
    tabs: [
      { key: "parent", label: "Parent View", icon: Users },
      previewTab("enrollment"),
      previewTab("tuition"),
    ],
  },
  {
    id: "admin",
    color: PRODUCT_PREVIEW_GROUP_COLORS.admin,
    tint: "#FDF0E6",
    copy: ADMIN_COPY,
    tabs: [previewTab("admin"), previewTab("marketing"), previewTab("website")],
  },
  {
    id: "teacher",
    color: PRODUCT_PREVIEW_GROUP_COLORS.teacher,
    tint: "#E7F6EF",
    copy: TEACHER_COPY,
    tabs: [
      { key: "teacher", label: "Teacher View", icon: BookOpen },
      previewTab("attendance"),
      previewTab("timeclock"),
    ],
  },
];
