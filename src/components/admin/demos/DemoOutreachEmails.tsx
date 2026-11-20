"use client";

import { useState } from "react";
import { getOutreachPlan } from "@/data/outreach";
import type { OutreachEmailStep, OutreachSocialStep } from "@/data/outreach/types";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import type { DemoOutreach, OutreachChannel } from "@/lib/admin-crm/demo-outreach-types";
import { OutreachComposeModal } from "@/components/admin/demos/OutreachComposeModal";
import { buildResearchPrompt, OUTREACH_STEP_LABEL, stepState, type StepState } from "@/components/admin/demos/outreach-ui";
import { crmStatusLabel } from "@/lib/admin-crm/crm-status";
import { isOutreachSequenceStoppedByCrmStatus } from "@/lib/admin-crm/outreach-email";
import { formatShortDate } from "@/components/admin/demos/demo-outreach-format";

/** The Claude Code prompt that researches this school and writes its sequence. */
export function researchPromptFor(demo: { slug: string; schoolName: string; href: string }, outreach: DemoOutreach | undefined) {
  return buildResearchPrompt({
    slug: demo.slug,
    schoolName: demo.schoolName,
    demoHref: demo.href,
    website: outreach?.website,
    crmStatusLabel: crmStatusLabel(outreach?.crmStatus ?? "not_contacted"),
    contactName: outreach?.contactName,
  });
}

function StateBadge({ state }: { state: StepState }) {
  const base = "shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-admin-sm border";
  if (state.kind === "done") {
    return (
      <span className={`${base} bg-admin-success-bg text-admin-success border-admin-success-border`}>
        {state.record.status === "logged" ? "Logged" : "Sent"} {formatShortDate(state.record.sentAt)}
      </span>
    );
  }
  if (state.kind === "attempted" && state.record.status === "sending") {
    return (
      <span className={`${base} bg-admin-neutral-bg text-admin-muted border-admin-border`}>Sending…</span>
    );
  }
  if (state.kind === "attempted") {
    return (
      <span className={`${base} bg-admin-error-bg text-admin-error border-admin-error-border`}>
        {state.record.status === "skipped_unsubscribed" ? "Unsubscribed" : "Failed"}
      </span>
    );
  }
  if (state.kind === "due") {
    return (
      <span className={`${base} bg-admin-warning-bg text-admin-warning border-admin-warning-border`}>
        {state.dueAt ? `Due ${formatShortDate(state.dueAt)}` : "Next"}
      </span>
    );
  }
  return (
    <span className={`${base} bg-admin-neutral-bg text-admin-muted border-admin-border`}>
      {state.dueAt ? formatShortDate(state.dueAt) : "Later"}
    </span>
  );
}

/** The researched email sequence for one demo, with preview & send. Lives in the outreach drawer. */
export function DemoOutreachEmails({
  demo,
  outreach,
  onChange,
}: {
  demo: { slug: string; schoolName: string; href: string };
  outreach: DemoOutreach | undefined;
  onChange: (slug: string, next: DemoOutreach | undefined) => void;
}) {
  const slug = demo.slug;
  const plan = getOutreachPlan(slug);
  const [composeStep, setComposeStep] = useState<OutreachEmailStep | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [socialChannel, setSocialChannel] = useState<OutreachChannel>("instagram");
  const [loggingSocial, setLoggingSocial] = useState(false);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      setError("Couldn't copy. Select the text and copy it by hand.");
    }
  }

  async function logSocial() {
    setLoggingSocial(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/demo-outreach/${encodeURIComponent(slug)}/emails/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: socialChannel }),
      });
      const json = (await res.json().catch(() => null)) as { outreach?: DemoOutreach; error?: string } | null;
      if (!res.ok || !json?.outreach) throw new Error(json?.error ?? `Couldn't log it (${res.status})`);
      onChange(slug, json.outreach);
      setNotice("Social note logged.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't log it. Try again.");
    } finally {
      setLoggingSocial(false);
    }
  }

  if (!plan) {
    return (
      <section className="rounded-admin-md border border-dashed border-admin-border p-3">
        <h3 className="text-xs font-semibold text-admin-text mb-1">Outreach emails</h3>
        <p className="text-xs text-admin-muted">
          No researched emails yet. Copy this prompt into Claude Code in this repo when you&apos;re ready.
        </p>
        <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-admin-sm bg-admin-neutral-bg p-2 text-[11px] text-admin-text">
          {researchPromptFor(demo, outreach)}
        </pre>
        <button
          type="button"
          onClick={() => void copy(researchPromptFor(demo, outreach), "cmd")}
          className="mt-2 text-xs font-medium text-admin-accent hover:underline"
        >
          {copied === "cmd" ? "Copied" : "Copy research prompt"}
        </button>
      </section>
    );
  }

  if (plan.doNotEmail) {
    return (
      <section className="rounded-admin-md border border-admin-error-border bg-admin-error-bg p-3">
        <h3 className="text-xs font-semibold text-admin-error mb-1">Don&apos;t email this school</h3>
        <p className="text-xs text-admin-text">{plan.doNotEmail.reason}</p>
        {plan.doNotEmail.source ? (
          <a href={plan.doNotEmail.source} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-admin-accent hover:underline">
            Source →
          </a>
        ) : null}
      </section>
    );
  }

  const replied = outreach && isOutreachSequenceStoppedByCrmStatus(outreach.crmStatus);

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-xs font-semibold text-admin-text">Outreach emails</h3>
        <p className="text-xs text-admin-muted mt-0.5">
          To {plan.recipient.firstName} ({plan.recipient.role}) · {plan.angle}
        </p>
      </div>

      {replied ? (
        <p className="text-xs rounded-admin-md border border-admin-success-border bg-admin-success-bg text-admin-success px-3 py-2">
          They&apos;ve replied or the deal has moved on, so the sequence has stopped. Answer them yourself.
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="text-xs rounded-admin-md border border-admin-border bg-admin-bg text-admin-text px-3 py-2">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs rounded-admin-md border border-admin-error-border bg-admin-error-bg text-admin-error px-3 py-2">
          {error}
        </p>
      ) : null}

      <ol className="flex flex-col">
        {plan.steps.map((step) => {
          const state = stepState(plan, step, outreach);
          const actionable = !replied && (state.kind === "due" || state.kind === "attempted");
          return (
            <li key={step.id} className="flex flex-col gap-1.5 border-t border-admin-border py-2.5 first:border-t-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-admin-text">
                  {OUTREACH_STEP_LABEL[step.id]}
                  <span className="font-normal text-admin-faint"> · day {step.businessDay}</span>
                </p>
                <StateBadge state={state} />
              </div>
              <p className="text-[11px] text-admin-muted">{step.purpose}</p>
              {step.kind === "email" && step.subject ? (
                <p className="text-[11px] text-admin-text">
                  <span className="text-admin-faint">Subject</span> {step.subject}
                </p>
              ) : null}
              {state.kind === "done" && state.record.toEmail ? (
                <p className="text-[11px] text-admin-faint">To {state.record.toEmail}</p>
              ) : null}
              {state.kind === "attempted" && state.record.error ? (
                <p className="text-[11px] text-admin-error">{state.record.error}</p>
              ) : null}
              <p className="text-[11px] text-admin-muted whitespace-pre-wrap line-clamp-3">{step.body}</p>

              {step.kind === "email" && state.kind !== "done" ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setComposeStep(step)}
                    disabled={Boolean(replied)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-admin-md border transition-colors disabled:opacity-50 ${
                      actionable
                        ? "bg-admin-accent text-white border-admin-accent hover:bg-admin-accent-hover"
                        : "border-admin-border text-admin-muted hover:text-admin-text hover:bg-admin-neutral-bg"
                    }`}
                  >
                    Preview &amp; send
                  </button>
                </div>
              ) : null}

              {step.kind === "social" && state.kind !== "done" ? (
                <SocialActions
                  step={step}
                  copied={copied === step.id}
                  onCopy={() => void copy(step.body, step.id)}
                  channel={socialChannel}
                  onChannel={setSocialChannel}
                  logging={loggingSocial}
                  onLog={() => void logSocial()}
                  disabled={Boolean(replied) || !outreach?.emails.some((e) => e.stepId === "first" && e.status === "sent")}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <details className="rounded-admin-md border border-admin-border p-2.5">
        <summary className="cursor-pointer text-xs font-medium text-admin-text">
          Research ({plan.facts.length} facts, read {formatShortDate(`${plan.researchedAt}T12:00:00`)})
        </summary>
        <ul className="mt-2 flex flex-col gap-1.5">
          {plan.facts.map((fact) => (
            <li key={`${fact.url}-${fact.fact}`} className="text-[11px] text-admin-muted">
              {fact.fact}{" "}
              <a href={fact.url} target="_blank" rel="noopener noreferrer" className="text-admin-accent hover:underline">
                {fact.source}
              </a>
            </li>
          ))}
        </ul>
        {plan.checkBeforeSending.length > 0 ? (
          <>
            <p className="mt-2 text-[11px] font-semibold text-admin-warning">Check before sending</p>
            <ul className="list-disc pl-4 text-[11px] text-admin-muted">
              {plan.checkBeforeSending.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}
      </details>

      {composeStep ? (
        <OutreachComposeModal
          slug={slug}
          plan={plan}
          step={composeStep}
          outreach={outreach}
          onClose={() => setComposeStep(null)}
          onSent={(next, message) => {
            onChange(slug, next);
            setNotice(message);
            setError(null);
            setComposeStep(null);
          }}
        />
      ) : null}
    </section>
  );
}

function SocialActions({
  step,
  copied,
  onCopy,
  channel,
  onChannel,
  logging,
  onLog,
  disabled,
}: {
  step: OutreachSocialStep;
  copied: boolean;
  onCopy: () => void;
  channel: OutreachChannel;
  onChannel: (c: OutreachChannel) => void;
  logging: boolean;
  onLog: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] text-admin-faint">{step.where}</span>
      <button
        type="button"
        onClick={onCopy}
        className="text-xs font-medium px-2.5 py-1 rounded-admin-md border border-admin-border text-admin-muted hover:text-admin-text hover:bg-admin-neutral-bg"
      >
        {copied ? "Copied" : "Copy note"}
      </button>
      <AdminSelect value={channel} onChange={(e) => onChannel(e.target.value as OutreachChannel)} aria-label="Sent on" triggerClassName="text-xs py-1">
        <option value="instagram">Instagram</option>
        <option value="facebook">Facebook</option>
        <option value="linkedin">LinkedIn</option>
      </AdminSelect>
      <button
        type="button"
        onClick={onLog}
        disabled={logging || disabled}
        title={disabled ? "Send the first email first" : undefined}
        className="text-xs font-medium px-2.5 py-1 rounded-admin-md border border-admin-border text-admin-muted hover:text-admin-text hover:bg-admin-neutral-bg disabled:opacity-50"
      >
        {logging ? "Logging…" : "Log as sent"}
      </button>
    </div>
  );
}
