import type { ReactNode } from "react";
import { dmSans, fraunces } from "@/lib/fonts";

type LayoutProps = {
  children: ReactNode;
};

export default function SchoolParentLayout({ children }: LayoutProps) {
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)]`}
      data-parent-portal
    >
      {children}
    </div>
  );
}
