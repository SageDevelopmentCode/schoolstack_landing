import type { ReactNode } from "react";
import MarketingBrightToolShell from "@/components/marketing/shared/MarketingBrightToolShell";

type MondayCheckStoryShellProps = {
  wide?: boolean;
  children: ReactNode;
};

export default function MondayCheckStoryShell({
  wide = false,
  children,
}: MondayCheckStoryShellProps) {
  return (
    <MarketingBrightToolShell>
      <div
        className={`mx-auto transition-[max-width] duration-300 ${wide ? "max-w-[1180px]" : "max-w-[720px]"}`}
      >
        {children}
      </div>
    </MarketingBrightToolShell>
  );
}
