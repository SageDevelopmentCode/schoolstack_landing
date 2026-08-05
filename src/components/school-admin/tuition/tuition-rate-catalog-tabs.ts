export const TUITION_RATE_CATALOG_TABS = [
  { id: "tuition_rates", label: "Tuition rates" },
  { id: "payment_options", label: "Payment options" },
  { id: "fees", label: "Fees" },
] as const;

export type TuitionRateCatalogTabId =
  (typeof TUITION_RATE_CATALOG_TABS)[number]["id"];

export const DEFAULT_TUITION_RATE_CATALOG_TAB: TuitionRateCatalogTabId =
  "tuition_rates";
