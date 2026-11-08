import type { ReactNode } from "react";
import { DEMO_EYEBROW } from "./bright-demo-theme";

export default function DemoWebsiteSectionKicker({
  children,
  className = "",
  onDark = false,
}: {
  children: ReactNode;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 ${DEMO_EYEBROW} ${onDark ? "text-white/70!" : ""} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${onDark ? "bg-white/70" : "bg-[var(--demo-primary)]"}`}
        aria-hidden
      />
      {children}
    </span>
  );
}
