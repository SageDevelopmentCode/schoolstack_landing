import { CreditCard, DollarSign, Tag } from "lucide-react";

export const TUITION_RATE_CATALOG_TABS = [
  { id: "tuition_rates", label: "Tuition rates", icon: DollarSign },
  { id: "payment_options", label: "Payment options", icon: CreditCard },
  { id: "fees", label: "Fees", icon: Tag },
] as const;

export type TuitionRateCatalogTabId =
  (typeof TUITION_RATE_CATALOG_TABS)[number]["id"];

export const DEFAULT_TUITION_RATE_CATALOG_TAB: TuitionRateCatalogTabId =
  "tuition_rates";
