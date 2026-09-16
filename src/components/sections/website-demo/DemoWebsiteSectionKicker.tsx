import type { ReactNode } from "react";

export default function DemoWebsiteSectionKicker({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] font-secondary ${className}`}
      style={{
        backgroundColor: "var(--demo-primary-soft)",
        color: "var(--demo-primary)",
      }}
    >
      {children}
    </span>
  );
}
