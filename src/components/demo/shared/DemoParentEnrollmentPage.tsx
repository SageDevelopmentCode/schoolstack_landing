"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock, Plus } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import {
  PARENT_DEMO_COPY,
  PARENT_DEMO_STORY_THEME,
} from "@/components/demo/shared/parent-demo-runtime";
import type {
  DemoParentChecklistItem,
  DemoParentChildId,
  DemoParentChildNavItem,
  DemoParentModalId,
} from "@/components/demo/shared/demo-parent-types";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  G_FOCUS,
  GCard,
  GChip,
  GIcon,
  GKicker,
  GProgress,
  GTabBar,
  type GChipTone,
} from "@/components/school-parent/garden/ui";

/*
 * Parent demo › Enrollment tab in the parent-portal Garden look (same
 * materials as the apply-portal `EnrollmentChecklistExperience`): page header
 * with a child switcher, a checklist card (progress + notebook rows) and a
 * detail card. `fillHeight` is the compact marketing-window variant.
 *
 * Skill: `.claude/skills/parent-portal-garden-design`.
 */

type DemoParentEnrollmentPageProps = {
  activeChildId: DemoParentChildId;
  setActiveChildId: (id: DemoParentChildId) => void;
  childrenNav: DemoParentChildNavItem[];
  checklistItems: DemoParentChecklistItem[];
  completions: boolean[];
  enrolled: boolean;
  isJakePending: boolean;
  renderDetailPanel: (activeItem: DemoParentModalId) => ReactNode;
  initialActiveItem?: DemoParentModalId;
  fillHeight?: boolean;
};

const STATUS: Record<"done" | "active" | "todo", { tone: GChipTone; label: string }> = {
  done: { tone: "success", label: "Complete" },
  active: { tone: "info", label: "In progress" },
  todo: { tone: "warning", label: "Not started" },
};

/** Notebook mark: mint tick (done), accent ring + dot (open), type icon ring (to do). */
function StatusMark({
  item,
  done,
  active,
}: {
  item: DemoParentChecklistItem;
  done: boolean;
  active: boolean;
}) {
  const Icon = item.icon;
  if (done) {
    return (
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sf-mint)] ring-[1.5px] ring-[var(--sf-forest)]/30"
      >
        <Tick className="h-6 w-6" fill="transparent" />
      </span>
    );
  }
  if (active) {
    return (
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-[var(--sf-clay)]"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--sf-clay)]" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[var(--sf-ink)]/55 ring-[1.5px] ring-[var(--sf-ink)]/20"
    >
      <Icon className="h-4 w-4" strokeWidth={2.2} />
    </span>
  );
}

function ChecklistProgress({
  completed,
  total,
  compact = false,
}: {
  completed: number;
  total: number;
  compact?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        {compact ? (
          <span className="text-[13px] font-extrabold text-[var(--sf-ink)]">
            {completed} of {total} required steps complete
          </span>
        ) : (
          <>
            <GKicker>Required steps</GKicker>
            <span className="text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]">
              {completed}/{total}
            </span>
          </>
        )}
      </div>
      <GProgress
        value={completed}
        total={total}
        done={total > 0 && completed === total}
        label={`${completed} of ${total} required steps complete`}
      />
    </div>
  );
}

export default function DemoParentEnrollmentPage({
  activeChildId,
  setActiveChildId,
  childrenNav,
  checklistItems,
  completions,
  enrolled,
  isJakePending,
  renderDetailPanel,
  initialActiveItem,
  fillHeight = false,
}: DemoParentEnrollmentPageProps) {
  const theme = PARENT_DEMO_STORY_THEME;
  const reduce = useReducedMotion() === true;
  const [activeItem, setActiveItem] = useState<DemoParentModalId>(
    initialActiveItem ?? checklistItems[0]?.modal ?? "contract-1",
  );

  const reqCompleted = checklistItems.filter(
    (item) => item.required && completions[item.id - 1],
  ).length;
  const reqTotal = checklistItems.filter((item) => item.required).length;
  const checklistTitle = `${PARENT_DEMO_COPY?.schoolShortName ?? "School"} enrollment checklist`;

  const activeIndex = checklistItems.findIndex((item) => item.modal === activeItem);
  const activeEntry = checklistItems[activeIndex];
  const activeKicker = activeEntry
    ? `Item ${activeIndex + 1} of ${checklistItems.length} · ${activeEntry.optional ? "Optional" : "Required"}`
    : null;

  const listItems = fillHeight
    ? [...checklistItems].sort((a, b) => {
        if (a.modal === activeItem) return -1;
        if (b.modal === activeItem) return 1;
        return 0;
      })
    : checklistItems;

  const childTabs = childrenNav.map((child) => ({
    key: child.id,
    label: child.name.split(" ")[0],
    testId: `child-tab-${child.id}`,
  }));

  return (
    <ParentGardenFrame
      theme={theme}
      className={`flex min-h-0 flex-1 flex-col bg-[var(--sf-cream)] ${fillHeight ? "h-full" : ""}`}
    >
      <div
        className={`mx-auto flex min-h-0 w-full max-w-[1250px] flex-1 flex-col gap-5 ${
          fillHeight ? "h-full p-4" : "px-5 py-6 sm:px-9 sm:py-8"
        }`}
      >
        {fillHeight ? null : (
          <ParentGardenPageHeader
            kicker="Enrollment"
            title="Enrollment checklist"
            subtitle="Welcome back, Sarah — here's your enrollment progress."
            actions={
              <GTabBar
                items={childTabs}
                activeKey={activeChildId}
                onChange={(key) => setActiveChildId(key as DemoParentChildId)}
                ariaLabel="Enrollment child tabs"
              />
            }
          />
        )}

        {isJakePending ? (
          <GCard index={1} kicker="Application" title="Application under review">
            <div className="flex items-start gap-4">
              <GIcon>
                <Clock />
              </GIcon>
              <div className="min-w-0">
                <GChip tone="warning">In review</GChip>
                <p className="m-0 mt-3 max-w-2xl text-[15px] font-semibold leading-relaxed text-[var(--sf-soft)]">
                  Jake&apos;s application has been received and is currently being reviewed by the
                  admissions team. You&apos;ll be notified by email once a decision has been made.
                </p>
                <p className="m-0 mt-3 text-[13px] font-semibold text-[var(--sf-soft)]">
                  Submitted: April 10, 2026
                </p>
              </div>
            </div>
          </GCard>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-5 showcase:flex-row lg:flex-row">
            <GCard
              index={1}
              kicker={fillHeight ? undefined : "Your checklist"}
              title={fillHeight ? undefined : checklistTitle}
              className={`w-full shrink-0 showcase:w-[36%] lg:w-[36%] ${fillHeight ? "min-h-0 overflow-hidden !p-4" : ""}`}
              bodyClassName="min-h-0 gap-4"
            >
              {enrolled && !fillHeight ? (
                <div className="flex items-center gap-2 rounded-[14px] bg-[var(--sf-mint)] px-3 py-2">
                  <Tick className="h-5 w-5" />
                  <span className="text-[13px] font-extrabold text-[var(--sf-forest)]">
                    Enrollment confirmed
                  </span>
                </div>
              ) : null}

              <ChecklistProgress completed={reqCompleted} total={reqTotal} compact={fillHeight} />

              <ul
                className={`m-0 -mx-1 flex min-h-0 flex-1 list-none flex-col gap-1.5 p-1 ${
                  fillHeight ? "overflow-hidden" : "overflow-y-auto"
                }`}
              >
                {listItems.map((item, idx) => {
                  const done = completions[item.id - 1];
                  const isActive = activeItem === item.modal;
                  const status = STATUS[done ? "done" : isActive ? "active" : "todo"];
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        data-tour-id={idx === 0 ? "checklist-item-0" : undefined}
                        data-checklist-modal={item.modal}
                        aria-current={isActive ? "step" : undefined}
                        onClick={() => setActiveItem(item.modal)}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-[16px] px-3 py-2.5 text-left transition-colors duration-200 ${G_FOCUS} focus-visible:ring-inset ${
                          isActive
                            ? "bg-[var(--sf-accent-wash)] ring-[1.5px] ring-[var(--sf-clay)]/45"
                            : "hover:bg-[var(--sf-paper)]"
                        }`}
                      >
                        <StatusMark item={item} done={done} active={isActive} />
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-[14px] font-extrabold ${
                              isActive ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-ink)]"
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className="mt-0.5 block text-[12px] font-semibold text-[var(--sf-soft)]">
                            {item.optional ? "Optional" : "Required"}
                          </span>
                        </span>
                        <GChip tone={status.tone}>{status.label}</GChip>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {fillHeight ? null : (
                <button
                  type="button"
                  className={`flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border-[1.5px] border-dashed border-[var(--sf-clay)]/40 px-3 py-2.5 text-[13px] font-extrabold text-[var(--sf-clay-deep)] transition-colors hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  New application
                </button>
              )}
            </GCard>

            <GCard
              index={2}
              className="min-h-[320px] min-w-0 flex-1 overflow-hidden !p-0 showcase:min-h-0 lg:min-h-0"
              bodyClassName="min-h-0"
            >
              {activeKicker ? (
                <div className="shrink-0 border-b-[1.5px] border-[var(--sf-ink)]/10 px-5 py-3 sm:px-6">
                  <GKicker>{activeKicker}</GKicker>
                </div>
              ) : null}
              <div className="min-h-0 flex-1 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeItem}
                    className="h-full overflow-y-auto px-5 py-5 sm:px-6 sm:py-6"
                    initial={reduce ? false : { opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: -8 }}
                    transition={{ duration: 0.22, ease: PORTAL_EASE }}
                  >
                    {renderDetailPanel(activeItem)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </GCard>
          </div>
        )}
      </div>
    </ParentGardenFrame>
  );
}
