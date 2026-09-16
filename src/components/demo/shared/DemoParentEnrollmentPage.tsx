"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle, Clock, Plus } from "lucide-react";
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
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";

type DemoParentEnrollmentPageProps = {
  activeChildId: DemoParentChildId;
  setActiveChildId: (id: DemoParentChildId) => void;
  childrenNav: DemoParentChildNavItem[];
  checklistItems: DemoParentChecklistItem[];
  completions: boolean[];
  enrolled: boolean;
  isJakePending: boolean;
  renderDetailPanel: (activeItem: DemoParentModalId) => ReactNode;
};

function StoryProgressBar({
  value,
  max,
  theme,
}: {
  value: number;
  max: number;
  theme: typeof PARENT_DEMO_STORY_THEME;
}) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: theme.primarySoft }}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ backgroundColor: theme.primary, width: `${percent}%` }}
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
}: DemoParentEnrollmentPageProps) {
  const theme = PARENT_DEMO_STORY_THEME;
  const [activeItem, setActiveItem] = useState<DemoParentModalId>(
    checklistItems[0]?.modal ?? "contract-1",
  );

  const reqCompleted = checklistItems.filter(
    (item) => item.required && completions[item.id - 1],
  ).length;
  const reqTotal = checklistItems.filter((item) => item.required).length;
  const checklistTitle = `${PARENT_DEMO_COPY?.schoolShortName ?? "School"} enrollment checklist`;

  const childNavItems = [
    ...childrenNav.map((child) => ({
      key: child.id,
      label: child.name.split(" ")[0],
      testId: `child-tab-${child.id}`,
      tourId: `child-tab-${child.id}`,
    })),
  ];

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1250px] flex-1 flex-col px-4 py-6 sm:py-8 md:px-9">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <ParentSectionKicker theme={theme}>Enrollment</ParentSectionKicker>
          <ParentDisplayHeading theme={theme} as="h1" size="section" className="mt-1">
            Enrollment checklist
          </ParentDisplayHeading>
          <p className="mt-1 text-sm" style={{ color: theme.muted }}>
            Welcome back, Sarah — here&apos;s your enrollment progress.
          </p>
        </div>
        <ParentStoryPillNav
          theme={theme}
          items={childNavItems}
          activeKey={activeChildId}
          onChange={(key) => setActiveChildId(key as DemoParentChildId)}
          ariaLabel="Enrollment child tabs"
        />
      </div>

      {isJakePending ? (
        <ParentCard theme={theme}>
          <div className="flex items-start gap-4">
            <Clock className="mt-0.5 h-6 w-6 flex-shrink-0" style={{ color: theme.warning }} />
            <div>
              <p className="font-semibold" style={{ color: theme.ink }}>
                Application under review
              </p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: theme.muted }}>
                Jake&apos;s application has been received and is currently being reviewed by
                the admissions team. You&apos;ll be notified by email once a decision has been
                made.
              </p>
              <p className="mt-3 text-xs" style={{ color: theme.muted }}>
                Submitted: April 10, 2026
              </p>
            </div>
          </div>
        </ParentCard>
      ) : (
        <ParentCard theme={theme} className="!p-0 flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <aside
              className="flex w-full flex-col border-b lg:w-[34%] lg:border-b-0 lg:border-r"
              style={{ borderColor: theme.line }}
            >
              <div className="px-4 py-4 sm:px-5">
                {enrolled ? (
                  <div className="mb-3 flex items-center gap-1.5" style={{ color: theme.success }}>
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">Enrollment confirmed</span>
                  </div>
                ) : null}
                <div
                  className="rounded-2xl border px-4 py-3.5"
                  style={{ borderColor: theme.line, backgroundColor: theme.white }}
                >
                  <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                    {checklistTitle}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
                    {reqCompleted}/{reqTotal} required steps complete
                  </p>
                  <div className="mt-3">
                    <StoryProgressBar value={reqCompleted} max={reqTotal} theme={theme} />
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-3 sm:px-4">
                {checklistItems.map((item, idx) => {
                  const done = completions[item.id - 1];
                  const Icon = item.icon;
                  const isActive = activeItem === item.modal;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-tour-id={idx === 0 ? "checklist-item-0" : undefined}
                      onClick={() => setActiveItem(item.modal)}
                      className="flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors"
                      style={{
                        borderColor: isActive ? theme.primary : theme.line,
                        backgroundColor: isActive ? theme.primarySoft : theme.white,
                        color: isActive ? theme.primary : theme.ink,
                      }}
                    >
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: done ? theme.successBg : theme.primarySoft,
                          color: done ? theme.success : theme.primary,
                        }}
                      >
                        {done ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{item.label}</p>
                        <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
                          {item.optional ? "Optional" : "Required"}
                        </p>
                      </div>
                      <ParentChip theme={theme} tone={done ? "success" : isActive ? "info" : "warning"}>
                        {done ? "Complete" : isActive ? "In progress" : "Not started"}
                      </ParentChip>
                    </button>
                  );
                })}
              </div>

              <div className="px-3 pb-3 sm:px-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed px-3 py-2 text-sm font-medium"
                  style={{
                    borderColor: `color-mix(in srgb, ${theme.primary} 30%, transparent)`,
                    color: theme.primary,
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New application
                </button>
              </div>
            </aside>

            <div className="min-h-[320px] min-w-0 flex-1 overflow-hidden lg:min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem ?? "empty"}
                  className="h-full overflow-y-auto p-4 sm:p-5"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeItem ? renderDetailPanel(activeItem) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </ParentCard>
      )}
    </div>
  );
}
