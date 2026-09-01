"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type SignupProgressBarProps = {
  theme: ParentThemeTokens;
  filled: number;
  total: number;
  label?: string;
  highlightIncomplete?: boolean;
};

export default function SignupProgressBar({
  theme,
  filled,
  total,
  label,
  highlightIncomplete = false,
}: SignupProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const percent = Math.min(100, Math.round((filled / safeTotal) * 100));
  const isComplete = total > 0 && filled >= total;
  const showAmber = highlightIncomplete && !isComplete && filled < total;

  return (
    <div className="space-y-1.5">
      {label ? (
        <div className="flex items-center justify-between gap-2 text-xs">
          <span style={{ color: "#76828A" }}>{label}</span>
          <span
            className="font-semibold"
            style={{ color: showAmber ? "#986F14" : theme.ink }}
          >
            {filled}/{total}
          </span>
        </div>
      ) : null}
      <div
        className="h-2 overflow-hidden rounded-full"
        style={{ backgroundColor: "#E7EBE2" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percent}%`,
            backgroundColor: isComplete
              ? theme.primary
              : showAmber
                ? "#E8C468"
                : theme.primary,
          }}
        />
      </div>
    </div>
  );
}
