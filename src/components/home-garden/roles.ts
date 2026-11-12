import { ADMIN_COPY, FAMILY_COPY, TEACHER_COPY } from "@/components/home/home-copy";
import type { DemoStageKey } from "@/components/home/DemoStage";
import { ILLUSTRATIONS, STOCK_PHOTOS, type Photo } from "./assets";

export const ROLES_HEADING = "Built for every role";

export type Role = {
  id: "family" | "admin" | "teacher";
  demo: DemoStageKey;
  /** Short label for toggles. */
  label: string;
  emoji: string;
  copy: {
    eyebrow: string;
    headlineLead: string;
    headlineAccent: string;
    body: string;
    cta: string;
    bullets?: readonly string[];
  };
  photo: Photo;
  illustration: string;
  tint: string;
  tintSoft: string;
  ink: string;
};

export const ROLES: Role[] = [
  {
    id: "family",
    demo: "parent",
    label: "Parent View",
    emoji: "🏡",
    copy: FAMILY_COPY,
    photo: STOCK_PHOTOS.family,
    illustration: ILLUSTRATIONS.backpack,
    tint: "bg-[var(--sf-sky)]",
    tintSoft: "bg-[var(--sf-sky)]/60",
    ink: "text-[#24507a]",
  },
  {
    id: "admin",
    demo: "admin",
    label: "Admin View",
    emoji: "🗂️",
    copy: ADMIN_COPY,
    photo: STOCK_PHOTOS.admin,
    illustration: ILLUSTRATIONS.folder,
    tint: "bg-[var(--sf-peach)]",
    tintSoft: "bg-[var(--sf-peach)]/60",
    ink: "text-[var(--sf-clay-deep)]",
  },
  {
    id: "teacher",
    demo: "teacher",
    label: "Teacher View",
    emoji: "🍎",
    copy: TEACHER_COPY,
    photo: STOCK_PHOTOS.teacher,
    illustration: ILLUSTRATIONS.notebook,
    tint: "bg-[var(--sf-mint)]",
    tintSoft: "bg-[var(--sf-mint)]/60",
    ink: "text-[var(--sf-forest)]",
  },
];
