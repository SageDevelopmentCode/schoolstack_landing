import type { ReactNode } from "react";
import MarketingGardenToolShell from "@/components/marketing/shared/MarketingGardenToolShell";

type MondayCheckStoryShellProps = {
  wide?: boolean;
  children: ReactNode;
};

export default function MondayCheckStoryShell({
  wide = false,
  children,
}: MondayCheckStoryShellProps) {
  return (
    <MarketingGardenToolShell>
      <div
        className={`mx-auto transition-[max-width] duration-300 ${wide ? "max-w-[1180px]" : "max-w-[720px]"}`}
      >
        {children}
      </div>
    </MarketingGardenToolShell>
  );
}
