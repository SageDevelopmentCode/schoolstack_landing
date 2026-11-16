"use client";

import GSidePanel, { type GSidePanelProps } from "@/components/school-parent/garden/GSidePanel";

/**
 * Billing right-hand drawer: the kit's `GSidePanel` with the "Billing" kicker.
 * Mounted outside the page's ParentGardenFrame (the panel carries its own).
 */
export default function ParentBillingSidePanel({ kicker = "Billing", ...props }: GSidePanelProps) {
  return <GSidePanel kicker={kicker} {...props} />;
}
