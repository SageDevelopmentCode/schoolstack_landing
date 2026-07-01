"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { FadeInView } from "@/components/ui/FadeInView";
import {
  ROOTED_MEADOWS_TIMELINE_PHASES,
  ROOTED_MEADOWS_TIMELINE_START,
  ROOTED_MEADOWS_TIMELINE_THEME,
  ROOTED_MEADOWS_TIMELINE_V1,
} from "@/data/school-demos/rooted-meadows-timeline";

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function RootedMeadowsTimelineProgress() {
  const { progress, markerLabel } = useMemo(() => {
    const start = ROOTED_MEADOWS_TIMELINE_START.getTime();
    const end = ROOTED_MEADOWS_TIMELINE_V1.getTime();
    const now = Date.now();
    const pct = clamp(((now - start) / (end - start)) * 100, 0, 100);

    const today = new Date();
    const label =
      now < start
        ? "Kickoff"
        : now > end
          ? "v1 reached"
          : `Today · ${formatShortDate(today)}`;

    return { progress: pct, markerLabel: label };
  }, []);

  return (
    <section className="px-6 pb-6 lg:px-16">
      <div className="mx-auto max-w-[1100px]">
        <FadeInView>
          <div
            className="rounded-2xl border px-5 py-6 sm:px-8 sm:py-7"
            style={{
              backgroundColor: "white",
              borderColor: ROOTED_MEADOWS_TIMELINE_THEME.border,
            }}
          >
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                >
                  Rollout window
                </p>
                <p
                  className="font-heading mt-1 text-xl font-medium sm:text-2xl"
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textPrimary }}
                >
                  {formatShortDate(ROOTED_MEADOWS_TIMELINE_START)} →{" "}
                  {formatShortDate(ROOTED_MEADOWS_TIMELINE_V1)}
                </p>
              </div>
              <p
                className="font-secondary text-sm font-medium"
                style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.accentDark }}
              >
                {ROOTED_MEADOWS_TIMELINE_PHASES.length} phases · {Math.round(progress)}% elapsed
              </p>
            </div>

            <div className="relative pt-2 pb-8">
              <div
                className="h-2 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.purpleStepBg }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${ROOTED_MEADOWS_TIMELINE_THEME.accent} 0%, ${ROOTED_MEADOWS_TIMELINE_THEME.clay} 100%)`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              <motion.div
                className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${progress}%` }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <div
                  className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.accent }}
                />
                <span
                  className="font-secondary mt-2 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    color: ROOTED_MEADOWS_TIMELINE_THEME.accentDark,
                    backgroundColor: ROOTED_MEADOWS_TIMELINE_THEME.oliveStepBg,
                  }}
                >
                  {markerLabel}
                </span>
              </motion.div>

              <div className="mt-6 flex justify-between">
                <span
                  className="font-secondary text-[11px] font-medium"
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.textSecondary }}
                >
                  Start
                </span>
                <span
                  className="font-secondary text-[11px] font-semibold"
                  style={{ color: ROOTED_MEADOWS_TIMELINE_THEME.accentDark }}
                >
                  v1 · Aug 15
                </span>
              </div>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
