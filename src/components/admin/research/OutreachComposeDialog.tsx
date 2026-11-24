"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Mail, Send } from "lucide-react";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import { G_INPUT, G_LABEL, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { BusyLabel, GardenNotice } from "@/components/school-admin/garden/kit";
import { SNAPSHOT_LINK_TOKEN, type OutreachEmailStep, type OutreachPlan } from "@/data/outreach/types";
import type { DemoOutreach } from "@/lib/admin-crm/demo-outreach-types";
import { countWords, snapshotPath, type OutreachWarning } from "@/lib/admin-crm/outreach-email";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type Preview = {
  subject: string;
  text: string;
  html: string;
  warnings: OutreachWarning[];
  mailingAddressMissing: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Preview and send one email step through Zoho (same API and checks as before: content
 * warnings, CAN-SPAM footer, facts to confirm, one send per step). Sending asks to confirm
 * in place instead of a browser dialog.
 */
export function OutreachComposeDialog({
  theme,
  slug,
  plan,
  step,
  stepNumber,
  stepLabel,
  defaultTo,
  onClose,
  onSent,
}: {
  theme: ParentThemeTokens;
  slug: string;
  plan: OutreachPlan;
  step: OutreachEmailStep;
  stepNumber: number;
  stepLabel: string;
  defaultTo: string;
  onClose: () => void;
  onSent: (next: DemoOutreach, notice: { title: string; description: string; warn: boolean }) => void;
}) {
  const [toEmail, setToEmail] = useState(defaultTo);
  const [subject, setSubject] = useState(step.subject ?? "");
  const [body, setBody] = useState(step.body);
  const [factsChecked, setFactsChecked] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const requestId = useRef(0);

  const base = `/api/admin/demo-outreach/${encodeURIComponent(slug)}/emails`;
  const isFirst = step.id === "first";
  const needsFacts = plan.checkBeforeSending.length > 0;
  const usesSnapshot = body.includes(SNAPSHOT_LINK_TOKEN);
  const snapshotHref = snapshotPath(plan);

  // Re-render the exact email (and re-run the content checks) as the draft changes.
  useEffect(() => {
    const id = ++requestId.current;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`${base}/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stepId: step.id, subject: isFirst ? subject : undefined, body }),
        });
        const json = (await res.json().catch(() => null)) as (Preview & { error?: string }) | null;
        if (id !== requestId.current) return;
        if (!res.ok || !json) throw new Error(json?.error ?? `Preview failed (${res.status})`);
        setPreview(json);
        setPreviewError(null);
      } catch (e) {
        if (id === requestId.current) setPreviewError(e instanceof Error ? e.message : "Preview failed.");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [base, step.id, isFirst, subject, body]);

  const blocking = useMemo(() => (preview?.warnings ?? []).filter((w) => w.level === "block"), [preview]);
  const validTo = EMAIL_RE.test(toEmail.trim());
  const blockedReason = !preview
    ? "Building the preview…"
    : preview.mailingAddressMissing
      ? "Set the postal address first."
      : blocking.length > 0
        ? "Fix the issues in red first."
        : !validTo
          ? "Enter a valid email address."
          : needsFacts && !factsChecked
            ? "Confirm the facts to check."
            : null;
  const canSend = !sending && blockedReason === null;

  async function send() {
    if (!canSend) return;
    setSending(true);
    setSendError(null);
    const to = toEmail.trim();
    try {
      const res = await fetch(`${base}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId: step.id, toEmail: to, subject: isFirst ? subject : undefined, body, factsChecked }),
      });
      const json = (await res.json().catch(() => null)) as
        | { outreach?: DemoOutreach; status?: string; dryRun?: boolean; error?: string }
        | null;
      if (!res.ok || !json?.outreach) throw new Error(json?.error ?? `Send failed (${res.status})`);
      const notice =
        json.status === "skipped_unsubscribed"
          ? { title: `Not sent to ${plan.schoolName}.`, description: `${to} has unsubscribed from MudKitchen email.`, warn: true }
          : json.dryRun
            ? { title: `${stepLabel} logged, not sent.`, description: "Outbound email is turned off on this server.", warn: true }
            : { title: `${stepLabel} sent to ${plan.schoolName}.`, description: `It went to ${to}. The next step is scheduled.`, warn: false };
      onSent(json.outreach, notice);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Send failed. Try again.");
      setConfirming(false);
      setSending(false);
    }
  }

  return (
    <GDialog
      theme={theme}
      open
      onClose={onClose}
      closeDisabled={sending}
      size="2xl"
      icon={<Mail className="h-5 w-5" aria-hidden />}
      title={`Step ${stepNumber} · ${stepLabel} · ${plan.schoolName}`}
      description={step.purpose}
      footerBordered
      data-testid="research-compose"
      footer={
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className={`m-0 text-[13px] font-bold ${sendError ? "text-[#9a3422]" : "text-[var(--sf-soft)]"}`} role={sendError ? "alert" : undefined}>
            {sendError
              ? `${sendError} Nothing was sent.`
              : confirming
                ? `Send "${preview?.subject ?? subject}" to ${toEmail.trim()}?`
                : (blockedReason ?? "Ready to send.")}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className={gBtnOutlineSm}
              onClick={() => (confirming ? setConfirming(false) : onClose())}
              disabled={sending}
            >
              {confirming ? "Back" : "Cancel"}
            </button>
            {confirming ? (
              <button
                type="button"
                className={gBtnPopSm}
                onClick={() => void send()}
                disabled={!canSend}
                aria-busy={sending || undefined}
                data-testid="research-compose-confirm"
              >
                <BusyLabel busy={sending} busyLabel="Sending…" icon={<Send className="h-4 w-4" aria-hidden />}>
                  Yes, send it
                </BusyLabel>
              </button>
            ) : (
              <button
                type="button"
                className={gBtnPopSm}
                onClick={() => setConfirming(true)}
                disabled={!canSend}
                data-testid="research-compose-send"
              >
                <Send className="h-4 w-4" aria-hidden />
                Send
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Edit */}
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <label htmlFor="compose-to" className={G_LABEL}>
              To
            </label>
            <input
              id="compose-to"
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder={`${plan.recipient.firstName.toLowerCase() || "founder"}@…`}
              className={`${G_INPUT} ${toEmail && !validTo ? "!border-[#b4412f]/60" : ""}`}
              data-garden-skip
            />
            <p className="m-0 mt-1 text-[12px] font-semibold text-[var(--sf-soft)]">
              {plan.recipient.firstName ? `${plan.recipient.firstName}, ${plan.recipient.role}. ` : ""}Source: {plan.recipient.source}
            </p>
          </div>

          <div>
            <label htmlFor="compose-subject" className={G_LABEL}>
              Subject
            </label>
            {isFirst ? (
              <input
                id="compose-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={G_INPUT}
                data-garden-skip
              />
            ) : (
              <p id="compose-subject" className="m-0 text-[14px] font-bold text-[var(--sf-ink)]/80">
                {preview?.subject || "Re: (first email's subject)"}{" "}
                <span className="font-semibold text-[var(--sf-soft)]">· replies in the same thread</span>
              </p>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <label htmlFor="compose-body" className={G_LABEL}>
              Email <span className="font-semibold text-[var(--sf-soft)]">· {countWords(body)} words</span>
            </label>
            <textarea
              id="compose-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={13}
              className={`${G_INPUT} min-h-[260px] flex-1 resize-y leading-relaxed`}
              data-garden-skip
            />
            <p className="m-0 mt-1 text-[12px] font-semibold text-[var(--sf-soft)]">
              The footer (your name, MudKitchen, postal address and opt-out line) and an unsubscribe link are added automatically.
              {usesSnapshot && snapshotHref ? (
                <>
                  {" "}
                  <code className="rounded bg-[var(--sf-ink)]/[0.06] px-1">{SNAPSHOT_LINK_TOKEN}</code> becomes their snapshot
                  link (
                  <a href={`${snapshotHref}?preview=1`} target="_blank" rel="noopener noreferrer" className="font-extrabold text-[var(--sf-clay-deep)] underline">
                    open it
                  </a>
                  ).
                </>
              ) : null}
            </p>
          </div>

          {needsFacts ? (
            <GardenNotice tone="warning" icon={AlertTriangle} title="Check before sending">
              <ul className="m-0 list-disc space-y-1 pl-4">
                {plan.checkBeforeSending.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <label className="mt-2 flex items-center gap-2 font-extrabold text-[var(--sf-ink)]">
                <input type="checkbox" checked={factsChecked} onChange={(e) => setFactsChecked(e.target.checked)} />
                I&apos;ve checked these
              </label>
            </GardenNotice>
          ) : null}
        </div>

        {/* Preview */}
        <div className="flex min-w-0 flex-col gap-3">
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
            Preview · exactly what they&apos;ll get
          </p>
          {preview?.mailingAddressMissing ? (
            <GardenNotice tone="alert" role="alert" title="Postal address missing">
              Set <code>OUTREACH_POSTAL_ADDRESS</code> on the server to a street address, PO box or virtual mailbox before
              sending. US law (CAN-SPAM) requires one in every cold email.
            </GardenNotice>
          ) : null}
          {preview && preview.warnings.length > 0 ? (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {preview.warnings.map((w) => (
                <li
                  key={`${w.code}-${w.message}`}
                  className={`rounded-[12px] border-[1.5px] px-3 py-2 text-[13px] font-bold ${
                    w.level === "block"
                      ? "border-[#b4412f]/30 bg-[#fdf0ec] text-[#9a3422]"
                      : "border-[#d9b94a]/50 bg-[var(--sf-butter)]/40 text-[#6b4f00]"
                  }`}
                >
                  {w.message}
                </li>
              ))}
            </ul>
          ) : null}
          {previewError ? (
            <p className="m-0 text-[13px] font-bold text-[#9a3422]" role="alert">
              {previewError}
            </p>
          ) : null}
          <div className="flex min-h-[340px] flex-1 flex-col overflow-hidden rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white">
            <div className="space-y-0.5 border-b border-[var(--sf-ink)]/[0.08] px-3 py-2 text-[12.5px] text-[var(--sf-soft)]">
              <p className="m-0">
                <span className="font-extrabold">From</span> Julius Cecilia
              </p>
              <p className="m-0">
                <span className="font-extrabold">To</span> {toEmail || "—"}
              </p>
              <p className="m-0 font-bold text-[var(--sf-ink)]">
                <span className="font-extrabold text-[var(--sf-soft)]">Subject</span> {preview?.subject || subject || "—"}
              </p>
            </div>
            {preview ? (
              <iframe title="Email preview" sandbox="" srcDoc={preview.html} className="min-h-[300px] w-full flex-1 bg-white" />
            ) : (
              <p className="m-0 p-3 text-[13px] font-semibold text-[var(--sf-soft)]">Building preview…</p>
            )}
          </div>
        </div>
      </div>
    </GDialog>
  );
}
