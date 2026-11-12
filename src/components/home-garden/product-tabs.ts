import type { DemoStageKey } from "@/components/home/DemoStage";
import type { ProductPreviewTabGroup, ProductPreviewTabId } from "@/lib/marketing/product-preview-tabs";

/** Which live demo each product module shows. */
export const TAB_TO_DEMO: Record<ProductPreviewTabId, DemoStageKey> = {
  website: "website",
  enrollment: "enrollment",
  parents: "tuition",
  teachers: "attendance",
  timeclock: "timeclock",
  marketing: "marketing",
  admin: "admin",
};

/** Garden tint per audience group (replaces the Bright blue/green/orange). */
export const GROUP_TINT: Record<ProductPreviewTabGroup, { bg: string; dot: string; label: string }> = {
  website: { bg: "bg-[var(--sf-peach)]", dot: "bg-[var(--sf-clay)]", label: "Web" },
  parent: { bg: "bg-[var(--sf-sky)]", dot: "bg-[#3d6fa8]", label: "Parent" },
  teacher: { bg: "bg-[var(--sf-mint)]", dot: "bg-[var(--sf-forest)]", label: "Teacher" },
  admin: { bg: "bg-[var(--sf-butter)]", dot: "bg-[#b07d00]", label: "Admin" },
};
