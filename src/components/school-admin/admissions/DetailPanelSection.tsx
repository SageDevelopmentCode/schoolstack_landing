"use client";

import type { ReactNode } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type DetailPanelSectionProps = {
  C: AdminThemeTokens;
  title: string;
  description?: string;
  badge?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export default function DetailPanelSection({
  C,
  title,
  description,
  badge,
  children,
  className = "",
}: DetailPanelSectionProps) {
  return (
    <section className={className}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          {title}
        </h4>
        {badge}
      </div>
      {description ? (
        <p className="mt-1 text-xs leading-relaxed" style={{ color: C.textTertiary }}>
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}
