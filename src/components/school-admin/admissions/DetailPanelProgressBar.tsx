"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type DetailPanelProgressBarProps = {
  C: AdminThemeTokens;
  completed: number;
  total: number;
  label?: string;
};

export default function DetailPanelProgressBar({
  C,
  completed,
  total,
  label = "Progress",
}: DetailPanelProgressBarProps) {
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: C.textSecondary }}>
          {label}
        </p>
        <span className="text-xs" style={{ color: C.textTertiary }}>
          {completed}/{total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: C.border }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ backgroundColor: C.accent, width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
