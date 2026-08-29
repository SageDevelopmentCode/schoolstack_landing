import type { LucideIcon } from "lucide-react";

export type MobileShowcaseSlide = {
  id: string;
  label: string;
  shortLabel: string;
  caption: string;
  icon: LucideIcon;
  audience: "parent" | "admin" | "teacher";
  render: () => React.ReactNode;
};
