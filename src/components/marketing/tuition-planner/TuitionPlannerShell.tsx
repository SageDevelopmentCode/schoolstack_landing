import type { ReactNode } from "react";
import MarketingBrightToolShell from "@/components/marketing/shared/MarketingBrightToolShell";

export default function TuitionPlannerShell({ children }: { children: ReactNode }) {
  return <MarketingBrightToolShell>{children}</MarketingBrightToolShell>;
}
