"use client";

import { useCallback, useMemo, useState } from "react";
import { getOutreachPlan } from "@/data/outreach";
import type { OutreachEmailStep } from "@/data/outreach/types";
import { CRM, crmStatusLabel } from "@/lib/admin-crm/crm-status";
import { completedOutreachSteps, type DemoOutreach } from "@/lib/admin-crm/demo-outreach-types";
import {
  nextOutreachStep,
  OUTREACH_STAGE_LABEL,
  OUTREACH_STAGE_ORDER,
  type NextOutreachStep,
  type OutreachStage,
} from "@/lib/admin-crm/outreach-email";
import type { DemoCard } from "@/components/admin/demos/DemoOutreachBoard";
import { DemoOutreachDrawer } from "@/components/admin/demos/DemoOutreachDrawer";
import { researchPromptFor } from "@/components/admin/demos/DemoOutreachEmails";
import { OutreachComposeModal } from "@/components/admin/demos/OutreachComposeModal";
import { OUTREACH_STEP_LABEL } from "@/components/admin/demos/outreach-ui";
import { formatAgo, formatShortDate } from "@/components/admin/demos/demo-outreach-format";

const STAGE_HINT: Record<OutreachStage, string> = {
  due: "Their next follow-up is due today or overdue.",
  ready: "Researched emails are ready. Nothing sent yet.",
  waiting: "Sent. The next step isn't due yet.",
  replied: "They replied or booked a call. Answer them yourself.",
  closed: "Won, not interested, or the sequence has finished.",
  do_not_email: "Research says not to email them right now.",
  needs_research: "Has a demo but no researched emails yet. Copy the prompt into Claude Code when you're ready.",
};

type Row = { demo: DemoCard; outreach: DemoOutreach | undefined; next: NextOutreachStep };

export function DemoOutreachFunnel({
  demos,
  initialOutreach,
  loadError,
}: {
  demos: DemoCard[];
  initialOutreach: Record<string, DemoOutreach>;
  loadError?: string | null;
}) {
  const [outreach, setOutreach] = useState(initialOutreach);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [compose, setCompose] = useState<{ slug: string; step: OutreachEmailStep } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const setOne = useCallback((slug: string, next: DemoOutreach | undefined) => {
    setOutreach((prev) => {
      const copy = { ...prev };
      if (next) copy[slug] = next;
      else delete copy[slug];
      return copy;
    });
  }, []);

  const groups = useMemo(() => {
    const byStage = new Map<OutreachStage, Row[]>(OUTREACH_STAGE_ORDER.map((s) => [s, []]));
    for (const demo of demos) {
      const o = outreach[demo.slug];
      const next = nextOutreachStep({
        plan: getOutreachPlan(demo.slug),
        completed: completedOutreachSteps(o?.emails ?? []),
        crmStatus: o?.crmStatus ?? "not_contacted",
      });
      byStage.get(next.stage)!.push({ demo, outreach: o, next });
    }
    for (const [stage, rows] of byStage) {
      if (stage === "due" || stage === "waiting") {
        rows.sort((a, b) => (a.next.dueAt ?? "").localeCompare(b.next.dueAt ?? ""));
      }
    }
    return byStage;
  }, [demos, outreach]);

  const openDemo = openSlug ? demos.find((d) => d.slug === openSlug) ?? null : null;
  const composePlan = compose ? getOutreachPlan(compose.slug) : null;

  async function copyPrompt(demo: DemoCard) {
    const slug = demo.slug;
    try {
      await navigator.clipboard.writeText(researchPromptFor(demo, outreach[slug]));
      setCopied(slug);
      window.setTimeout(() => setCopied((c) => (c === slug ? null : c)), 1500);
    } catch {
      setNotice("Couldn't copy. Open the school and copy the prompt from its panel.");
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-admin-text">Outreach funnel</h1>
          <p className="text-sm text-admin-muted mt-1">
            {groups.get("due")!.length} due · {groups.get("ready")!.length} ready to send · {groups.get("waiting")!.length} waiting ·{" "}
            {groups.get("replied")!.length} replied. Every email is previewed and sent by you.
          </p>
        </header>

        {loadError ? (
          <p className="mb-4 text-sm rounded-admin-md border border-admin-error-border bg-admin-error-bg text-admin-error px-3 py-2">
            Couldn&apos;t load outreach: {loadError}. Everything shows as not contacted until it loads.
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="mb-4 text-sm rounded-admin-md border border-admin-border bg-admin-surface text-admin-text px-3 py-2">
            {notice}
          </p>
        ) : null}

        <div className="flex flex-col gap-6">
          {OUTREACH_STAGE_ORDER.map((stage) => {
            const rows = groups.get(stage)!;
            if (rows.length === 0) return null;
            return (
              <section key={stage} aria-labelledby={`stage-${stage}`}>
                <div className="flex items-baseline gap-2 mb-2">
                  <h2 id={`stage-${stage}`} className="text-sm font-semibold text-admin-text">
                    {OUTREACH_STAGE_LABEL[stage]} <span className="text-admin-faint font-normal">({rows.length})</span>
                  </h2>
                  <p className="text-xs text-admin-faint">{STAGE_HINT[stage]}</p>
                </div>
                <ul className="rounded-admin-md border border-admin-border bg-admin-surface divide-y divide-admin-border">
                  {rows.map((row) => (
                    <FunnelRow
                      key={row.demo.slug}
                      row={row}
                      copied={copied === row.demo.slug}
                      onOpen={() => setOpenSlug(row.demo.slug)}
                      onCompose={(step) => setCompose({ slug: row.demo.slug, step })}
                      onCopyCommand={() => void copyPrompt(row.demo)}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      <DemoOutreachDrawer
        demo={openDemo}
        outreach={openDemo ? outreach[openDemo.slug] : undefined}
        onClose={() => setOpenSlug(null)}
        onChange={setOne}
      />

      {compose && composePlan ? (
        <OutreachComposeModal
          slug={compose.slug}
          plan={composePlan}
          step={compose.step}
          outreach={outreach[compose.slug]}
          onClose={() => setCompose(null)}
          onSent={(next, message) => {
            setOne(compose.slug, next);
            setNotice(`${composePlan.schoolName}: ${message}`);
            setCompose(null);
          }}
        />
      ) : null}
    </div>
  );
}

function FunnelRow({
  row,
  copied,
  onOpen,
  onCompose,
  onCopyCommand,
}: {
  row: Row;
  copied: boolean;
  onOpen: () => void;
  onCompose: (step: OutreachEmailStep) => void;
  onCopyCommand: () => void;
}) {
  const { demo, outreach, next } = row;
  const status = outreach?.crmStatus ?? "not_contacted";
  const lastSent = outreach?.emails.find((e) => e.status === "sent" || e.status === "logged");
  const step = next.step;

  let nextLine = "";
  if (step) {
    nextLine = `${OUTREACH_STEP_LABEL[step.id]}${next.dueAt ? ` · ${next.stage === "due" ? "due" : "on"} ${formatShortDate(next.dueAt)}` : ""}`;
  }

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left group">
        <p className="text-sm font-medium text-admin-text group-hover:text-admin-accent truncate">{demo.schoolName}</p>
        <p className="text-xs text-admin-muted truncate">
          {nextLine || (lastSent ? `Last step ${formatAgo(lastSent.sentAt)}` : demo.slug)}
          {lastSent && nextLine ? ` · last step ${formatAgo(lastSent.sentAt)}` : ""}
        </p>
      </button>
      <span className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-admin-md border ${CRM[status].pill}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${CRM[status].dot}`} />
        {crmStatusLabel(status)}
      </span>
      {next.stage === "needs_research" ? (
        <button
          type="button"
          onClick={onCopyCommand}
          title="Copies a Claude Code prompt that researches this school and writes its emails"
          className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-admin-md border border-admin-border text-admin-muted hover:text-admin-text hover:bg-admin-neutral-bg"
        >
          {copied ? "Copied" : "Copy research prompt"}
        </button>
      ) : step && (next.stage === "due" || next.stage === "ready") ? (
        step.kind === "email" ? (
          <button
            type="button"
            onClick={() => onCompose(step)}
            className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-admin-md border bg-admin-accent text-white border-admin-accent hover:bg-admin-accent-hover"
          >
            Preview &amp; send
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpen}
            className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-admin-md border border-admin-border text-admin-text hover:bg-admin-neutral-bg"
          >
            Social note
          </button>
        )
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-admin-md border border-admin-border text-admin-muted hover:text-admin-text hover:bg-admin-neutral-bg"
        >
          Open
        </button>
      )}
    </li>
  );
}
