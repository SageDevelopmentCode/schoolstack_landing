import type { ReactNode } from "react";
import { BRIGHT_NAV_OFFSET } from "@/components/home/bright-styles";

type MarketingBrightToolShellProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

export default function MarketingBrightToolShell({
  children,
  id,
  className = "",
}: MarketingBrightToolShellProps) {
  return (
    <div
      id={id}
      className={`min-h-0 bg-white px-3 pb-16 font-secondary text-[#1d1a16] sm:px-6 sm:pb-20 lg:px-8 ${BRIGHT_NAV_OFFSET} ${className}`.trim()}
    >
      <div className="mx-auto min-w-0 max-w-[1240px]">{children}</div>
    </div>
  );
}
