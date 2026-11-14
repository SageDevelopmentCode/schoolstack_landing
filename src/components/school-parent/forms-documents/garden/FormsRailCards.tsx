"use client";

import { ChevronRight } from "lucide-react";
import {
  DateStamp,
  GCard,
  GChip,
  GProgress,
  G_FOCUS,
} from "@/components/school-parent/garden/ui";
import type { ParentFormListItem } from "@/lib/school-parent/forms-documents/types";
import { formatFormDueDate } from "@/lib/school-teacher/forms-documents/utils";
import { formsCount } from "./forms-garden-ui";

/** Rail: how far along the family is, what's overdue, and the next due date. */
export function FormsProgressCard({
  total,
  signed,
  overdueCount,
  nextDue,
  onOpen,
  index = 2,
}: {
  total: number;
  signed: number;
  overdueCount: number;
  nextDue: ParentFormListItem | null;
  onOpen: (formId: string) => void;
  index?: number;
}) {
  if (total === 0) return null;
  const done = signed === total;
  return (
    <GCard
      index={index}
      kicker="Your progress"
      title={done ? "Everything's signed" : `${signed} of ${total} signed`}
      data-testid="parent-forms-progress-card"
      action={overdueCount > 0 ? <GChip tone="alert">{formsCount(overdueCount)} overdue</GChip> : null}
    >
      <GProgress value={signed} total={total} label="Forms signed" done={done} />
      <p className="m-0 mt-2 text-[13px] font-semibold text-[var(--sf-soft)]">
        {done
          ? "Signed forms stay here for your records."
          : `${formsCount(total - signed)} still ${total - signed === 1 ? "needs" : "need"} your attention.`}
      </p>

      {nextDue?.form.dueDate ? (
        <button
          type="button"
          onClick={() => onOpen(nextDue.form.id)}
          className={`group mt-4 flex w-full items-center gap-3 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3 text-left transition-colors hover:border-[var(--sf-ink)]/30 hover:bg-white ${G_FOCUS}`}
          data-testid="parent-forms-next-due"
        >
          <DateStamp date={nextDue.form.dueDate} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
              {nextDue.response.status === "overdue" ? "Was due" : "Next due"}
            </span>
            <span className="mt-0.5 block truncate text-[15px] font-extrabold text-[var(--sf-ink)]">{nextDue.form.title}</span>
            <span className="block text-[13px] font-semibold text-[var(--sf-soft)]">{formatFormDueDate(nextDue.form.dueDate)}</span>
          </span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>
      ) : null}
    </GCard>
  );
}
