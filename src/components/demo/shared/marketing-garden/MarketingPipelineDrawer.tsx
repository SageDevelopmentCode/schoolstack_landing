"use client";

import { createPortal } from "react-dom";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GChip, GKicker } from "@/components/school-parent/garden/ui";
import type { AutomationPipeline } from "@/data/school-demos/demo-marketing-automations";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { PipelineStatusChip, STEP_TINTS, STEP_TYPE_LABELS, StepIcon, formatCount } from "./parts";

function percent(part: number | undefined, whole: number): string | null {
  if (part === undefined || whole <= 0) return null;
  return `${Math.round((part / whole) * 100)}%`;
}

/**
 * Read-only pipeline drawer: the mock's detail view (KPIs + step flow) as a
 * Garden `GSidePanel`, portalled into the demo canvas when a host is given.
 */
export default function MarketingPipelineDrawer({
  theme,
  pipeline,
  open,
  onClose,
  portalHost,
}: {
  theme: ParentThemeTokens;
  pipeline: AutomationPipeline | null;
  open: boolean;
  onClose: () => void;
  portalHost: HTMLElement | null;
}) {
  const panel = (
    <GSidePanel
      theme={theme}
      open={open && pipeline != null}
      onClose={onClose}
      title={pipeline?.name ?? ""}
      kicker="Automation"
      subtitle={pipeline ? `Trigger: ${pipeline.trigger}` : undefined}
      headerAside={
        pipeline ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <PipelineStatusChip status={pipeline.status} />
            <GChip tone="neutral">{pipeline.audience}</GChip>
          </div>
        ) : null
      }
      testId="demo-marketing-pipeline-drawer"
      panelId="demo-marketing-pipeline-drawer"
    >
      {pipeline ? <PipelineDetail pipeline={pipeline} /> : null}
    </GSidePanel>
  );
  return portalHost ? createPortal(panel, portalHost) : panel;
}

function PipelineDetail({ pipeline }: { pipeline: AutomationPipeline }) {
  const { stats } = pipeline;
  const kpis = [
    { label: "Enrolled", value: formatCount(stats.enrolled) },
    { label: "Emails sent", value: formatCount(stats.sent) },
    { label: "Open rate", value: stats.openRate > 0 ? `${stats.openRate}%` : "—" },
    { label: "Conversions", value: stats.conversions > 0 ? formatCount(stats.conversions) : "—" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {pipeline.description ? (
        <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">{pipeline.description}</p>
      ) : null}

      <dl className="m-0 grid grid-cols-2 overflow-hidden rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`flex flex-col-reverse gap-1 px-4 py-3 ${i % 2 === 1 ? "border-l-[1.5px]" : ""} ${
              i >= 2 ? "border-t-[1.5px]" : ""
            } border-[var(--sf-ink)]/[0.08]`}
          >
            <dt className="text-[12px] font-extrabold text-[var(--sf-ink)]/60">{kpi.label}</dt>
            <dd className="sf-display m-0 text-[1.6rem] leading-none tabular-nums text-[var(--sf-ink)]">{kpi.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="demo-marketing-flow-title">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <GKicker>
            <span id="demo-marketing-flow-title">Automation flow</span>
          </GKicker>
          <span className="text-[12px] font-bold tabular-nums text-[var(--sf-soft)]">
            {pipeline.steps.length} steps
          </span>
        </div>
        <ol className="m-0 flex list-none flex-col p-0">
          {pipeline.steps.map((step, i) => {
            const last = i === pipeline.steps.length - 1;
            const isWait = step.type === "wait";
            const sent = step.sent;
            const hasSentData = !isWait && sent !== undefined && sent > 0;
            const notSent = !isWait && sent === 0;
            return (
              <li key={`${step.label}-${i}`} className="relative flex gap-3 pb-3">
                {/* Rail */}
                {!last ? (
                  <span
                    aria-hidden
                    className="absolute left-[15px] top-8 bottom-0 w-[1.5px] bg-[var(--sf-ink)]/12"
                  />
                ) : null}
                <span
                  className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-[1.5px] ring-[var(--sf-ink)]/10 ${STEP_TINTS[step.type]}`}
                >
                  <StepIcon type={step.type} />
                </span>
                {isWait ? (
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 pt-1.5">
                    <span className="text-[13px] font-bold text-[var(--sf-soft)]">{step.label}</span>
                    {step.delay ? (
                      <span className="text-[12px] font-semibold tabular-nums text-[var(--sf-ink)]/45">{step.delay}</span>
                    ) : null}
                  </div>
                ) : (
                  <div className="min-w-0 flex-1 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-ink)]/55">
                        {STEP_TYPE_LABELS[step.type]}
                      </span>
                      {step.delay ? (
                        <GChip tone="neutral" className="ml-auto tabular-nums">
                          {step.delay}
                        </GChip>
                      ) : null}
                    </div>
                    <h3 className="m-0 mt-1 text-[14.5px] font-extrabold leading-snug text-[var(--sf-ink)]">
                      {step.label}
                    </h3>
                    {step.subject ? (
                      <p className="m-0 mt-1 text-[13px] font-semibold italic leading-snug text-[var(--sf-soft)]">
                        &ldquo;{step.subject}&rdquo;
                      </p>
                    ) : null}
                    {step.type === "condition" && step.body ? (
                      <p className="m-0 mt-1 text-[13px] font-semibold text-[var(--sf-soft)]">{step.body}</p>
                    ) : null}
                    {hasSentData ? (
                      <dl className="m-0 mt-2.5 flex flex-wrap gap-x-5 gap-y-1 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-2.5 text-[12px]">
                        {[
                          { label: "Sent", value: formatCount(sent) },
                          { label: "Opened", value: percent(step.opened, sent) },
                          { label: "Clicked", value: percent(step.clicked, sent) },
                        ]
                          .filter((metric) => metric.value != null)
                          .map((metric) => (
                            <div key={metric.label} className="flex items-baseline gap-1.5">
                              <dt className="font-semibold text-[var(--sf-soft)]">{metric.label}</dt>
                              <dd className="m-0 font-extrabold tabular-nums text-[var(--sf-ink)]">{metric.value}</dd>
                            </div>
                          ))}
                      </dl>
                    ) : null}
                    {notSent ? (
                      <p className="m-0 mt-2 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-2 text-[12px] font-semibold italic text-[var(--sf-soft)]">
                        Not yet sent
                      </p>
                    ) : null}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
