"use client";

import { ArrowRight, FileText } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import {
  GCard,
  GChip,
  GIcon,
  GNoteTile,
  G_FOCUS,
  NOTE_TINTS,
  gBtnOnAccent,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import type { ParentFormListItem } from "@/lib/school-parent/forms-documents/types";
import { formDateLine, formsCount, joinStudentNames } from "./forms-garden-ui";

const MAX_TILES = 4;

type FormsNextUpCardProps = {
  items: ParentFormListItem[];
  queue: ParentFormListItem[];
  signedCount: number;
  onOpen: (formId: string) => void;
  onShowWaiting: () => void;
  index?: number;
};

/** Main-column "what needs doing": the most urgent form as an accent strip, the rest as notes. */
export default function FormsNextUpCard({
  items,
  queue,
  signedCount,
  onOpen,
  onShowWaiting,
  index = 1,
}: FormsNextUpCardProps) {
  if (items.length === 0) {
    return (
      <GCard index={index} kicker="Next up" title="Nothing to sign yet" data-testid="parent-forms-next-up-card">
        <div className="flex items-start gap-3 rounded-[18px] bg-[var(--sf-paper)] p-4">
          <GIcon size="sm">
            <FileText />
          </GIcon>
          <p className="m-0 text-[15px] font-semibold text-[var(--sf-soft)]">
            No forms have been assigned to your family yet.
          </p>
        </div>
      </GCard>
    );
  }

  if (queue.length === 0) {
    return (
      <GCard index={index} kicker="Next up" title="All caught up" data-testid="parent-forms-next-up-card">
        <div className="flex items-center gap-4 rounded-[20px] bg-[var(--sf-mint)] p-5" data-testid="parent-forms-caught-up">
          <Tick className="h-12 w-12 shrink-0" color="var(--sf-forest)" />
          <div className="min-w-0">
            <p className="m-0 text-[16px] font-extrabold text-[var(--sf-ink)]">Nothing waiting for your signature.</p>
            <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-forest)]">
              {formsCount(signedCount)} signed — open any of them below to see what you submitted.
            </p>
          </div>
          <span aria-hidden="true" className="sf-hand ml-auto hidden shrink-0 -rotate-3 text-[1.35rem] text-[var(--sf-forest)] sm:block">
            all signed ✿
          </span>
        </div>
      </GCard>
    );
  }

  const [first, ...rest] = queue;
  const tiles = rest.slice(0, MAX_TILES);
  const more = rest.length - tiles.length;
  const total = items.length;
  const firstOverdue = first.response.status === "overdue";
  const firstMeta = [
    first.response.studentNames.length > 0 ? `For ${joinStudentNames(first.response.studentNames)}` : null,
    formDateLine(first),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <GCard
      index={index}
      kicker="Next up"
      title={`${formsCount(queue.length)} waiting for you`}
      data-testid="parent-forms-next-up-card"
      action={
        queue.length > 1 ? (
          <button type="button" onClick={onShowWaiting} className={gLinkSm}>
            See all waiting <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null
      }
    >
      <button
        type="button"
        onClick={() => onOpen(first.form.id)}
        data-testid="parent-forms-next-up"
        className={`group flex w-full flex-col items-start gap-3 rounded-[18px] border-2 border-[var(--sf-ink)] bg-[var(--sf-clay)] p-4 text-left text-white transition-transform duration-200 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:p-5 ${G_FOCUS}`}
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/75">
              {firstOverdue ? "Overdue — start here" : "Start here"}
            </span>
            {first.form.formCategory === "tuition" ? (
              <GChip tone="info" className="!py-0">Tuition</GChip>
            ) : null}
          </span>
          <span className="mt-1 block text-[17px] font-extrabold leading-snug">{first.form.title}</span>
          {firstMeta ? (
            <span className="mt-0.5 block text-[13px] font-semibold text-white/80">{firstMeta}</span>
          ) : null}
        </span>
        <span className={gBtnOnAccent} aria-hidden="true">
          Review &amp; sign
          <ArrowRight className="h-4 w-4" />
        </span>
      </button>

      {tiles.length > 0 ? (
        <ul className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-2">
          {tiles.map((item, i) => {
            const overdue = item.response.status === "overdue";
            const meta = formDateLine(item);
            return (
              <li key={item.form.id}>
                <GNoteTile
                  tint={NOTE_TINTS[i % NOTE_TINTS.length]}
                  onClick={() => onOpen(item.form.id)}
                  data-testid={`parent-forms-queue-${item.form.id}`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">
                      {item.form.title}
                    </span>
                    {overdue ? <GChip tone="alert" className="bg-white/80">Overdue</GChip> : null}
                  </span>
                  {item.response.studentNames.length > 0 ? (
                    <span className="mt-1 block truncate text-[13px] font-semibold text-[var(--sf-ink)]/65">
                      For {joinStudentNames(item.response.studentNames)}
                    </span>
                  ) : null}
                  <span className="mt-auto flex items-center justify-between gap-2 pt-3">
                    <span className="text-[12px] font-extrabold text-[var(--sf-ink)]/60">{meta ?? "No due date"}</span>
                    <span className="inline-flex items-center gap-1 text-[13px] font-extrabold text-[var(--sf-clay-deep)]">
                      Open <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </span>
                </GNoteTile>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4">
        <span className="flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: Math.min(total, 12) }).map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full border-[1.5px] border-[var(--sf-ink)] ${
                i < Math.round((signedCount / total) * Math.min(total, 12)) ? "bg-[var(--sf-forest)]" : "bg-white"
              }`}
            />
          ))}
        </span>
        <span className="text-[13px] font-extrabold text-[var(--sf-ink)]/70">
          {signedCount} of {total} signed
        </span>
        {more > 0 ? (
          <button type="button" onClick={onShowWaiting} className={`${gLinkSm} ml-auto`}>
            +{more} more
          </button>
        ) : null}
      </div>
    </GCard>
  );
}
