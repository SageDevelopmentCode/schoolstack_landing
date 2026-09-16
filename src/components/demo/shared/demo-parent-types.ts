import type { LucideIcon } from "lucide-react";

export type DemoParentChildId = "emma" | "jake" | "liam";

export type DemoParentModalId =
  | "contract-1"
  | "contract-2"
  | "health-form"
  | "medication-plan"
  | "immunization"
  | "photo-release"
  | "assumption-of-risk"
  | "authorized-pickup"
  | "health-statement"
  | "registration-fee";

export type DemoParentChecklistItem = {
  id: number;
  label: string;
  icon: LucideIcon;
  required: boolean;
  modal: DemoParentModalId;
  optional: boolean;
};

export type DemoParentChildNavItem = {
  id: DemoParentChildId;
  name: string;
};
