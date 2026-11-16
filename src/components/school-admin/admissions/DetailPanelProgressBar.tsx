"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { GProgress } from "@/components/school-parent/garden/ui";
import { useSubmissionDetailStory } from "./SubmissionDetailStoryContext";

type DetailPanelProgressBarProps = {
  C: AdminThemeTokens;
  completed: number;
  total: number;
  label?: string;
  subtitle?: ReactNode;
};

export default function DetailPanelProgressBar({
  C,
  completed,
  total,
  label = "Progress",
  subtitle,
}: DetailPanelProgressBarProps) {
  const { variant, theme } = useSubmissionDetailStory();
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const fillColor = variant === "story" && theme ? theme.primary : C.accent;

  if (variant === "garden") {
    const done = total > 0 && completed >= total;
    return (
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="m-0 text-[13px] font-extrabold text-[var(--sf-ink)]">{label}</p>
          <span className="text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]/70">
            {completed}/{total}
          </span>
        </div>
        <GProgress value={completed} total={total} label={label} done={done} />
        {subtitle ? (
          <p className="m-0 mt-1.5 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
            {subtitle}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: C.textSecondary }}>
          {label}
        </p>
        <span className="text-xs tabular-nums" style={{ color: C.textTertiary }}>
          {completed}/{total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: C.border }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: fillColor }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {subtitle ? (
        <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: C.textTertiary }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
