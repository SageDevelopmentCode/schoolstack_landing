"use client";

import type { ReactNode } from "react";
import { ChevronRight, CreditCard, ListChecks, Settings2, Sparkles } from "lucide-react";
import { GCard, GChip } from "@/components/school-parent/garden/ui";
import { ROW_INTERACTIVE } from "@/components/school-admin/dashboard/garden/shared";
import type { EditableFormSnapshot } from "@/lib/admissions/editable-snapshots";
import type { BuilderStage, StageStatus } from "./builder-stages";
import { FlowReadinessSummary } from "./flows/FlowReadinessRail";
import type { FlowReadiness, ReadinessItem } from "./flows/flowReadiness";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

type SummaryRow = {
  stage: Exclude<BuilderStage, "review">;
  icon: ReactNode;
  title: string;
  facts: string;
};

function StatusChip({ status }: { status: StageStatus }) {
  if (status === "todo") return <GChip tone="alert">Needs a fix</GChip>;
  if (status === "warning") return <GChip tone="warning">Check</GChip>;
  if (status === "done") return <GChip tone="success">Done</GChip>;
  return null;
}

/**
 * Stage 5: the publish checklist (same rows the rail used to show) next to a
 * recap of every stage with a jump back to edit it. Publishing itself stays
 * the toolbar's one primary button.
 */
export default function ApplicationFormReviewStage({
  editable,
  programName,
  applyLinkLabel,
  readiness,
  statuses,
  isPublished,
  publicUrl,
  onSelectItem,
  onGoToStage,
  onPreview,
  onCopyLink,
}: {
  editable: EditableFormSnapshot;
  programName: string | null;
  applyLinkLabel: string;
  readiness: FlowReadiness;
  statuses: Record<BuilderStage, StageStatus>;
  isPublished: boolean;
  publicUrl: string | null;
  onSelectItem: (item: ReadinessItem) => void;
  onGoToStage: (stage: BuilderStage) => void;
  onPreview: () => void;
  onCopyLink: () => void;
}) {
  const steps = editable.schema.sections.length;
  const questions = editable.schema.sections.reduce((sum, section) => sum + section.fields.length, 0);
  const acknowledgments = editable.schema.acknowledgments.length;
  const actions = editable.postSubmitConfig.actions.filter((action) => action.enabled).length;
  const fee = editable.feeConfig;
  const feeFact = fee.enabled
    ? `${fee.label?.trim() || "Application fee"}${
        typeof fee.amount_cents === "number" && fee.amount_cents > 0 ? ` · ${usd.format(fee.amount_cents / 100)}` : ""
      }`
    : "No application fee";

  const rows: SummaryRow[] = [
    {
      stage: "basics",
      icon: <Settings2 />,
      title: editable.title.trim() || "Untitled form",
      facts: [programName ?? "No program chosen", applyLinkLabel].join(" · "),
    },
    {
      stage: "questions",
      icon: <ListChecks />,
      title: "Questions",
      facts: `${steps} step${steps === 1 ? "" : "s"} · ${questions} question${questions === 1 ? "" : "s"}`,
    },
    {
      stage: "payments",
      icon: <CreditCard />,
      title: "Fees & agreements",
      facts: `${feeFact} · ${acknowledgments} acknowledgment${acknowledgments === 1 ? "" : "s"}`,
    },
    {
      stage: "afterSubmit",
      icon: <Sparkles />,
      title: "After submit",
      facts: actions > 0 ? `${actions} next step${actions === 1 ? "" : "s"} for families` : "No next steps yet",
    },
  ];

  return (
    <div className="grid w-full items-start gap-5 lg:grid-cols-[1.25fr_1fr]">
      <GCard data-testid="flow-readiness-rail">
        <FlowReadinessSummary
          readiness={readiness}
          isPublished={isPublished}
          kindLabel="form"
          publicUrl={publicUrl}
          onSelect={onSelectItem}
          onPreview={onPreview}
          onCopyLink={onCopyLink}
        />
      </GCard>

      <GCard kicker="What families get" title="Your form at a glance" headingLevel="h3" index={1}>
        <ul className="-mx-2 m-0 flex list-none flex-col gap-0.5 p-0">
          {rows.map((row) => (
            <li key={row.stage}>
              <button
                type="button"
                className={ROW_INTERACTIVE}
                onClick={() => onGoToStage(row.stage)}
                aria-label={`${row.title}: ${row.facts}. Edit`}
              >
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--sf-accent-wash)] text-[var(--sf-clay-deep)] [&_svg]:h-4 [&_svg]:w-4"
                >
                  {row.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-[14px] font-extrabold leading-snug text-[var(--sf-ink)]">
                    {row.title}
                  </span>
                  <span className="block break-words text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)] tabular-nums">
                    {row.facts}
                  </span>
                </span>
                <StatusChip status={statuses[row.stage]} />
                <span className="hidden text-[13px] font-extrabold text-[var(--sf-clay-deep)] sm:inline">Edit</span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/30 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </button>
            </li>
          ))}
        </ul>
      </GCard>
    </div>
  );
}
