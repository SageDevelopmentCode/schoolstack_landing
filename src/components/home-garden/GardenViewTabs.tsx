"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { STICKERS_BY_DEMO } from "@/components/home/FloatingStickers";
import { prefetchDemoStage, type DemoStageKey } from "@/components/home/DemoStage";
import GardenDemoFrame from "./GardenDemoFrame";
import StickerNote from "./StickerNote";

const VIEWS: { key: DemoStageKey; label: string; emoji: string; tint: string }[] = [
  { key: "parent", label: "Parent View", emoji: "🏡", tint: "bg-[var(--sf-sky)]" },
  { key: "teacher", label: "Teacher View", emoji: "🍎", tint: "bg-[var(--sf-mint)]" },
  { key: "admin", label: "Admin View", emoji: "🗂️", tint: "bg-[var(--sf-peach)]" },
];

/**
 * The live product with a Parent / Teacher / Admin switcher and popping sample
 * notifications (the home hero pattern, reusable below the fold).
 */
export default function GardenViewTabs({
  idPrefix,
  dark = false,
  tilt = -0.8,
  tape = "var(--sf-butter)",
}: {
  /** Unique per page: keys the tab pill animation and the tabpanel id. */
  idPrefix: string;
  /** On a forest panel: the hint text switches to cream. */
  dark?: boolean;
  tilt?: number;
  tape?: string;
}) {
  const [view, setView] = useState<DemoStageKey>("parent");
  const reduce = useReducedMotion();
  const [s1, s2] = STICKERS_BY_DEMO[view];
  const panelId = `${idPrefix}-demo`;

  return (
    <div className="relative">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Choose a view" className="inline-flex rounded-full border-2 border-[var(--sf-ink)] bg-white p-1.5 shadow-[0_4px_0_0_var(--sf-ink)]">
          {VIEWS.map((v) => {
            const active = v.key === view;
            return (
              <button
                key={v.key}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls={panelId}
                onClick={() => setView(v.key)}
                onPointerEnter={() => prefetchDemoStage(v.key)}
                onFocus={() => prefetchDemoStage(v.key)}
                className="relative cursor-pointer rounded-full px-3.5 py-2 text-sm font-extrabold text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 sm:px-5"
              >
                {active ? (
                  <motion.span layoutId={`${idPrefix}-view-pill`} className={`absolute inset-0 rounded-full ${v.tint}`} transition={{ type: "spring", stiffness: 420, damping: 32 }} />
                ) : null}
                <span className="relative">
                  <span aria-hidden="true">{v.emoji}</span> {v.label}
                </span>
              </button>
            );
          })}
        </div>
        <span className={`sf-hand hidden text-lg xl:inline ${dark ? "text-[var(--sf-butter)]" : "text-[var(--sf-soft)]"}`} aria-hidden="true">
          ← try each one
        </span>
      </div>

      <div id={panelId} role="tabpanel">
        <GardenDemoFrame active={view} tilt={tilt} tape={tape} designHeight={640}>
          <div className="pointer-events-none absolute -bottom-8 -left-4 z-20 hidden sm:block lg:-left-10" aria-hidden="true">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={s1.id}
                initial={reduce ? false : { scale: 0, rotate: -20, y: 20 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                exit={reduce ? undefined : { scale: 0, rotate: 10, opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
              >
                <StickerNote sticker={s1} tint="bg-[var(--sf-butter)]" tilt={-5} size="sm" />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="pointer-events-none absolute -right-3 top-1/3 z-20 hidden xl:block lg:-right-8" aria-hidden="true">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={s2.id}
                initial={reduce ? false : { scale: 0, rotate: 20, y: 20 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                exit={reduce ? undefined : { scale: 0, rotate: -10, opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.12 }}
              >
                <StickerNote sticker={s2} tint="bg-[var(--sf-lav)]" tilt={4} size="sm" />
              </motion.div>
            </AnimatePresence>
          </div>
        </GardenDemoFrame>
      </div>
    </div>
  );
}
