import type { ReactNode } from "react";
import MarketingGardenToolShell from "@/components/marketing/shared/MarketingGardenToolShell";

export default function TuitionPlannerShell({ children }: { children: ReactNode }) {
  return <MarketingGardenToolShell>{children}</MarketingGardenToolShell>;
}
