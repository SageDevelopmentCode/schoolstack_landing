"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { G_FOCUS, gBtnOutlineSm } from "@/components/school-parent/garden/ui";

/**
 * Back / Next bar under the flow builder canvas. Next is solid accent but not
 * the toy button: the toolbar's Publish / Save stays the one primary action.
 */
export function FlowStageFooter({
  index,
  total,
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  prevLabel?: string | null;
  nextLabel?: string | null;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-white px-3 py-2.5 sm:px-5">
      <div className="min-w-0 flex-1">
        {prevLabel ? (
          <button
            type="button"
            onClick={onPrev}
            className={`${gBtnOutlineSm} !px-3.5 !py-2 !text-[13px]`}
            data-testid="flow-stage-back"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Back:</span>
            <span className="max-w-[11rem] truncate sm:max-w-none">{prevLabel}</span>
          </button>
        ) : null}
      </div>
      {/* Phones: the stepper above already shows where you are. */}
      <p className="m-0 hidden shrink-0 text-[12.5px] font-extrabold tabular-nums text-[var(--sf-soft)] sm:block">
        Stage {index + 1} of {total}
      </p>
      <div className="flex min-w-0 flex-1 justify-end">
        {nextLabel ? (
          <button
            type="button"
            onClick={onNext}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[var(--sf-clay)] bg-[var(--sf-clay)] px-3.5 py-2 text-[13px] font-extrabold text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 ${G_FOCUS}`}
            data-testid="flow-stage-next"
          >
            <span className="hidden sm:inline">Next:</span>
            <span className="max-w-[11rem] truncate sm:max-w-none">{nextLabel}</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
