"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, FileText } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  GCard,
  GChip,
  GIcon,
  GTabBar,
  G_FOCUS,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import type {
  ParentFormFilterStatus,
  ParentFormListItem,
} from "@/lib/school-parent/forms-documents/types";
import { formDateLine, formStatusChip, joinStudentNames } from "./forms-garden-ui";

const FILTERS: { key: ParentFormFilterStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs_action", label: "Needs action" },
  { key: "signed", label: "Signed" },
];

type FormsListCardProps = {
  filter: ParentFormFilterStatus;
  onFilterChange: (filter: ParentFormFilterStatus) => void;
  counts: Record<ParentFormFilterStatus, number>;
  items: ParentFormListItem[];
  totalCount: number;
  recentlySignedId: string | null;
  onOpen: (formId: string) => void;
  index?: number;
};

/** Every form for the family as a notebook list, filterable by status. */
export default function FormsListCard({
  filter,
  onFilterChange,
  counts,
  items,
  totalCount,
  recentlySignedId,
  onOpen,
  index = 2,
}: FormsListCardProps) {
  const reduce = useReducedMotion() === true;

  if (totalCount === 0) return null;

  return (
    <GCard index={index} id="parent-forms-list" kicker="Forms & documents" title="All forms" data-testid="parent-forms-list-card">
      <GTabBar
        ariaLabel="Filter forms by status"
        activeKey={filter}
        onChange={(key) => onFilterChange(key as ParentFormFilterStatus)}
        className="mb-4"
        data-testid="parent-forms-filter"
        items={FILTERS.map(({ key, label }) => ({
          key,
          label,
          testId: `parent-forms-filter-${key}`,
          suffix: <span className="tabular-nums opacity-75">· {counts[key]}</span>,
        }))}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={filter}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: PORTAL_EASE }}
        >
          {items.length === 0 ? (
            <div className="flex flex-col items-start gap-2 rounded-[18px] bg-[var(--sf-paper)] p-4 sm:flex-row sm:items-center">
              <GIcon size="sm">
                <FileText />
              </GIcon>
              <p className="m-0 flex-1 text-[15px] font-semibold text-[var(--sf-soft)]">No forms match this filter.</p>
              <button type="button" onClick={() => onFilterChange("all")} className={gLinkSm}>
                Show all forms
              </button>
            </div>
          ) : (
            <ul className="sf-paper m-0 flex list-none flex-col rounded-[18px] p-1">
              {items.map((item) => {
                const signed = item.listStatus === "signed";
                const chip = formStatusChip(item);
                const flash = recentlySignedId === item.form.id;
                const meta = [
                  item.response.studentNames.length > 0 ? joinStudentNames(item.response.studentNames) : null,
                  formDateLine(item),
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <motion.li
                    key={item.form.id}
                    initial={false}
                    animate={{ backgroundColor: flash ? "var(--sf-accent-wash)" : "rgba(255,255,255,0)" }}
                    transition={{ duration: reduce ? 0 : 0.35, ease: PORTAL_EASE }}
                    className="rounded-[14px]"
                  >
                    <button
                      type="button"
                      onClick={() => onOpen(item.form.id)}
                      data-testid={`parent-form-card-${item.form.id}`}
                      className={`group flex min-h-[60px] w-full cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors hover:bg-white/80 ${G_FOCUS} focus-visible:ring-inset`}
                    >
                      {signed ? (
                        <Tick className="h-7 w-7 shrink-0" color="var(--sf-forest)" fill="var(--sf-mint)" />
                      ) : (
                        <span
                          aria-hidden="true"
                          className={`h-7 w-7 shrink-0 rounded-full border-2 bg-white ${
                            item.response.status === "overdue" ? "border-[var(--sf-clay)]" : "border-[var(--sf-ink)]/55"
                          }`}
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="min-w-0 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">
                            {item.form.title}
                          </span>
                          <GChip tone={chip.tone}>{chip.label}</GChip>
                          {item.form.formCategory === "tuition" ? <GChip tone="info">Tuition</GChip> : null}
                          {flash ? (
                            <GChip tone="neutral">
                              <Tick className="h-3.5 w-3.5" /> Saved
                            </GChip>
                          ) : null}
                        </span>
                        {meta ? (
                          <span className="mt-0.5 block truncate text-[13px] font-semibold text-[var(--sf-soft)]">{meta}</span>
                        ) : null}
                      </span>
                      <span className="hidden shrink-0 text-[13px] font-extrabold text-[var(--sf-clay-deep)] sm:inline">
                        {signed ? "View" : "Review & sign"}
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform duration-300 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </GCard>
  );
}
