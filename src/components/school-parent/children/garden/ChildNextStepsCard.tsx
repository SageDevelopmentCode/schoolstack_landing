"use client";

import { ArrowRight, ChevronRight, ClipboardCheck, HeartPulse } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { useCelebrate } from "@/components/school-parent/garden/motion";
import {
  GCard,
  GChip,
  GIcon,
  GNoteTile,
  GSkeleton,
  NOTE_TINTS,
  G_FOCUS,
  gBtnOnAccent,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import { checklistItemStatusLabel } from "@/lib/admissions/enrollment-checklist-item-status-ui";
import type { ChildAttentionItem, ParentChildrenModel } from "../useParentChildrenModel";

/*
 * "Next steps" for the selected child — the Home "Start here" recipe:
 * the most important item as a solid accent strip (one button, toy pill),
 * the rest as numbered note tiles, and a dashed footer with step progress.
 */

const MAX_TILES = 4;
const MAX_DOTS = 12;

function LeadStrip({
  icon,
  kicker,
  title,
  subtitle,
  cta,
  onClick,
  testId,
}: {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  subtitle: string;
  cta: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`group flex w-full flex-col gap-4 rounded-[16px] bg-[var(--sf-clay)] p-5 text-left text-white sm:flex-row sm:items-center ${G_FOCUS}`}
    >
      <GIcon size="sm" className="!ring-white/70">
        {icon}
      </GIcon>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/75">{kicker}</span>
        <span className="mt-1 block text-[17px] font-extrabold leading-snug">{title}</span>
        <span className="mt-0.5 block text-sm text-white/85">{subtitle}</span>
      </span>
      <span className={gBtnOnAccent} aria-hidden="true">
        {cta} <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

function StepTile({ item, tint, onOpen }: { item: ChildAttentionItem; tint: string; onOpen: () => void }) {
  return (
    <GNoteTile tint={tint} onClick={onOpen}>
      <span className="flex items-start justify-between gap-2">
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-white px-2 text-xs font-extrabold text-[var(--sf-ink)]">
          <span className="sr-only">Step </span>
          {item.step}
        </span>
        <ChevronRight
          className="h-4 w-4 text-[var(--sf-ink)]/50 transition-transform duration-300 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
      <span className="mt-3 block text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">{item.label}</span>
      <span className="mt-2 block">
        <GChip tone={item.status === "in_progress" ? "info" : "neutral"} className="!bg-white/80">
          {checklistItemStatusLabel(item.status)}
        </GChip>
      </span>
    </GNoteTile>
  );
}

export default function ChildNextStepsCard({ model }: { model: ParentChildrenModel }) {
  const {
    selectedChild,
    firstName,
    attentionItems,
    checklistProgress,
    healthAttention,
    showHealthAttention,
    isRecordLoading,
    openRecordSection,
    previewMode,
  } = model;

  const caughtUp = !isRecordLoading && attentionItems.length === 0 && !showHealthAttention;
  const checklistDone = Boolean(
    checklistProgress && checklistProgress.total > 0 && checklistProgress.completed >= checklistProgress.total,
  );
  // Real success moment: every required enrollment step done. Never in previews/demos.
  useCelebrate(
    caughtUp && checklistDone && !previewMode,
    model.theme,
    `parent-children-checklist-done-${selectedChild?.applicationId ?? "none"}`,
  );

  const leadIsHealth = showHealthAttention && Boolean(healthAttention?.attentionLabel);
  const leadStep = leadIsHealth ? null : (attentionItems[0] ?? null);
  const tiles = (leadStep ? attentionItems.slice(1) : attentionItems).slice(0, MAX_TILES);
  const hidden = attentionItems.length - (leadStep ? 1 : 0) - tiles.length;
  const openChecklist = () => openRecordSection("checklist");

  const title = isRecordLoading
    ? `Checking ${firstName}'s next steps`
    : caughtUp
      ? "Everything is in good shape"
      : "Next steps";

  return (
    <GCard
      index={1}
      kicker="Needs your attention"
      title={title}
      action={
        !isRecordLoading && attentionItems.length > 0 ? (
          <button type="button" className={gLinkSm} onClick={openChecklist}>
            Review checklist <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null
      }
    >
      {isRecordLoading ? (
        <div data-testid="parent-children-loading" className="flex flex-col gap-4">
          <div data-testid="parent-children-overview-skeleton" className="contents">
            <GSkeleton className="h-24 !rounded-[16px]" />
            <div className="grid gap-4 sm:grid-cols-2">
              <GSkeleton className="h-28 !rounded-[10px]" />
              <GSkeleton className="h-28 !rounded-[10px]" />
            </div>
          </div>
        </div>
      ) : caughtUp ? (
        <div className="flex items-center gap-4 rounded-[16px] bg-[var(--sf-mint)] p-5">
          <Tick className="h-12 w-12" color="var(--sf-forest)" />
          <div className="min-w-0">
            <p className="m-0 text-[15px] font-semibold text-[var(--sf-ink)]/80">
              No required enrollment items are waiting on you right now.
            </p>
            {checklistDone ? (
              <p className="m-0 mt-1 text-[13px] font-extrabold text-[var(--sf-forest)]">
                All {checklistProgress?.total} required enrollment steps complete
              </p>
            ) : null}
            <span aria-hidden="true" className="sf-hand mt-1 block text-xl text-[var(--sf-forest)]">
              nothing to chase today ✿
            </span>
          </div>
        </div>
      ) : (
        <>
          {leadIsHealth && healthAttention?.attentionLabel ? (
            <LeadStrip
              icon={<HeartPulse />}
              kicker="Health"
              title={healthAttention.attentionLabel}
              subtitle={`Review ${firstName}'s health profile`}
              cta="Review"
              onClick={() => openRecordSection("health")}
              testId="parent-children-next-health"
            />
          ) : leadStep ? (
            <LeadStrip
              icon={<ClipboardCheck />}
              kicker={`Up next · Step ${leadStep.step}${checklistProgress ? ` of ${checklistProgress.total}` : ""}`}
              title={leadStep.label}
              subtitle={`${checklistItemStatusLabel(leadStep.status)} · Enrollment checklist`}
              cta="Open"
              onClick={openChecklist}
              testId="parent-children-next-step"
            />
          ) : null}

          {tiles.length > 0 ? (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {tiles.map((item, i) => (
                <li key={item.id}>
                  <StepTile item={item} tint={NOTE_TINTS[i % NOTE_TINTS.length]} onOpen={openChecklist} />
                </li>
              ))}
            </ul>
          ) : null}

          {checklistProgress && checklistProgress.total > 0 ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4">
              <div className="flex min-w-0 items-center gap-3">
                {checklistProgress.total <= MAX_DOTS ? (
                  <span className="flex gap-1" aria-hidden="true">
                    {Array.from({ length: checklistProgress.total }, (_, i) => (
                      <span
                        key={i}
                        className={`h-2.5 w-5 rounded-full border-[1.5px] border-[var(--sf-ink)] ${
                          i < checklistProgress.completed ? "bg-[var(--sf-clay)]" : "bg-white"
                        }`}
                      />
                    ))}
                  </span>
                ) : null}
                <span className="text-[13px] font-extrabold text-[var(--sf-ink)]/75">
                  {checklistProgress.completed} of {checklistProgress.total} required steps complete
                </span>
              </div>
              {hidden > 0 ? (
                <button type="button" className={gLinkSm} onClick={openChecklist}>
                  +{hidden} more
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </GCard>
  );
}
