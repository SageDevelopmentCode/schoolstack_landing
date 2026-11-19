"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import type { OutreachEmailStep, OutreachPlan } from "@/data/outreach/types";
import type { DemoOutreach } from "@/lib/admin-crm/demo-outreach-types";
import { countWords, type OutreachWarning } from "@/lib/admin-crm/outreach-email";
import { OUTREACH_STEP_LABEL } from "@/components/admin/demos/outreach-ui";

type Preview = {
  subject: string;
  text: string;
  html: string;
  warnings: OutreachWarning[];
  mailingAddressMissing: boolean;
};

const INPUT_CLASS =
  "w-full text-sm rounded-admin-md border border-admin-border bg-admin-bg px-2.5 py-1.5 text-admin-text focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30";
const LABEL_CLASS = "block text-[11px] font-medium uppercase tracking-wide text-admin-faint mb-1";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OutreachComposeModal({
  slug,
  plan,
  step,
  outreach,
  onClose,
  onSent,
}: {
  slug: string;
  plan: OutreachPlan;
  step: OutreachEmailStep;
  outreach: DemoOutreach | undefined;
  onClose: () => void;
  onSent: (next: DemoOutreach, notice: string) => void;
}) {
  const lastTo = outreach?.emails.find((e) => e.channel === "email" && e.toEmail)?.toEmail ?? "";
  const [toEmail, setToEmail] = useState(outreach?.contactEmail || lastTo);
  const [subject, setSubject] = useState(step.subject ?? "");
  const [body, setBody] = useState(step.body);
  const [factsChecked, setFactsChecked] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const requestId = useRef(0);

  const base = `/api/admin/demo-outreach/${encodeURIComponent(slug)}/emails`;
  const isFirst = step.id === "first";
  const needsFacts = plan.checkBeforeSending.length > 0;

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !sending) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, sending]);

  const blocking = useMemo(() => (preview?.warnings ?? []).filter((w) => w.level === "block"), [preview]);
  const validTo = EMAIL_RE.test(toEmail.trim());
  const canSend =
    !sending &&
    preview !== null &&
    !preview.mailingAddressMissing &&
    blocking.length === 0 &&
    validTo &&
    (!needsFacts || factsChecked);

  async function send() {
    if (!canSend || !preview) return;
    if (!window.confirm(`Send "${preview.subject}" to ${toEmail.trim()}?`)) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`${base}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId: step.id, toEmail: toEmail.trim(), subject: isFirst ? subject : undefined, body, factsChecked }),
      });
      const json = (await res.json().catch(() => null)) as
        | { outreach?: DemoOutreach; status?: string; dryRun?: boolean; error?: string }
        | null;
      if (!res.ok || !json?.outreach) throw new Error(json?.error ?? `Send failed (${res.status})`);
      const notice =
        json.status === "skipped_unsubscribed"
          ? `Not sent: ${toEmail.trim()} has unsubscribed from MudKitchen email.`
          : json.dryRun
            ? "Logged, but not actually sent: outbound email is turned off on this server."
            : `Sent to ${toEmail.trim()}.`;
      onSent(json.outreach, notice);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Send failed. Try again.");
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-admin-text/30" onClick={() => !sending && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${OUTREACH_STEP_LABEL[step.id]} to ${plan.schoolName}`}
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-admin-md border border-admin-border bg-admin-surface shadow-lg"
      >
        <div className="flex items-center justify-between gap-4 border-b border-admin-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-admin-text">
              {OUTREACH_STEP_LABEL[step.id]} · {plan.schoolName}
            </h2>
            <p className="text-xs text-admin-muted mt-0.5">{step.purpose}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-admin-sm text-admin-muted hover:text-admin-text hover:bg-admin-neutral-bg"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2">
          {/* Edit */}
          <div className="flex flex-col gap-3 border-b border-admin-border p-4 lg:border-b-0 lg:border-r">
            <div>
              <label htmlFor="outreach-to" className={LABEL_CLASS}>
                To
              </label>
              <input
                id="outreach-to"
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder={`${plan.recipient.firstName.toLowerCase() || "founder"}@…`}
                className={`${INPUT_CLASS} ${toEmail && !validTo ? "border-admin-error-border" : ""}`}
              />
              <p className="mt-1 text-[11px] text-admin-faint">
                {plan.recipient.firstName ? `${plan.recipient.firstName}, ${plan.recipient.role}. ` : ""}Source: {plan.recipient.source}
              </p>
            </div>

            <div>
              <label htmlFor="outreach-subject" className={LABEL_CLASS}>
                Subject
              </label>
              {isFirst ? (
                <input id="outreach-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={INPUT_CLASS} />
              ) : (
                <p id="outreach-subject" className="text-sm text-admin-muted">
                  {preview?.subject || "Re: (first email's subject)"}{" "}
                  <span className="text-admin-faint">· replies in the same thread</span>
                </p>
              )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <label htmlFor="outreach-body" className={LABEL_CLASS}>
                Email ({countWords(body)} words)
              </label>
              <textarea
                id="outreach-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={14}
                className={`${INPUT_CLASS} min-h-[260px] flex-1 resize-y font-[inherit] leading-relaxed`}
              />
              <p className="mt-1 text-[11px] text-admin-faint">
                The footer (your name, MudKitchen, postal address and opt-out line) and an unsubscribe link are added automatically.
              </p>
            </div>

            {needsFacts ? (
              <div className="rounded-admin-md border border-admin-warning-border bg-admin-warning-bg p-3">
                <p className="text-xs font-semibold text-admin-warning mb-1.5">Check before sending</p>
                <ul className="list-disc pl-4 text-xs text-admin-text space-y-1">
                  {plan.checkBeforeSending.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <label className="mt-2 flex items-center gap-2 text-xs font-medium text-admin-text">
                  <input type="checkbox" checked={factsChecked} onChange={(e) => setFactsChecked(e.target.checked)} />
                  I&apos;ve checked these
                </label>
              </div>
            ) : null}
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-3 bg-admin-bg p-4">
            <span className={LABEL_CLASS}>Preview (exactly what they&apos;ll get)</span>
            {preview?.mailingAddressMissing ? (
              <p role="alert" className="text-xs rounded-admin-md border border-admin-error-border bg-admin-error-bg text-admin-error px-3 py-2">
                Set <code>OUTREACH_POSTAL_ADDRESS</code> on the server to a street address, PO box or virtual mailbox (not an
                email) before sending. US law (CAN-SPAM) requires one in every cold email.
              </p>
            ) : null}
            {preview && preview.warnings.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {preview.warnings.map((w) => (
                  <li
                    key={`${w.code}-${w.message}`}
                    className={`text-xs rounded-admin-md border px-3 py-1.5 ${
                      w.level === "block"
                        ? "border-admin-error-border bg-admin-error-bg text-admin-error"
                        : "border-admin-warning-border bg-admin-warning-bg text-admin-warning"
                    }`}
                  >
                    {w.message}
                  </li>
                ))}
              </ul>
            ) : null}
            {previewError ? <p className="text-xs text-admin-error">{previewError}</p> : null}
            <div className="flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-admin-md border border-admin-border bg-white">
              <div className="border-b border-admin-border px-3 py-2 text-xs text-admin-muted space-y-0.5">
                <p>
                  <span className="text-admin-faint">From</span> Julius Cecilia
                </p>
                <p>
                  <span className="text-admin-faint">To</span> {toEmail || "—"}
                </p>
                <p className="font-medium text-admin-text">
                  <span className="font-normal text-admin-faint">Subject</span> {preview?.subject || subject || "—"}
                </p>
              </div>
              {preview ? (
                <iframe title="Email preview" sandbox="" srcDoc={preview.html} className="min-h-[280px] w-full flex-1 bg-white" />
              ) : (
                <p className="p-3 text-xs text-admin-faint">Building preview…</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-admin-border px-4 py-3">
          <p className="text-xs text-admin-error" role={sendError ? "alert" : undefined}>
            {sendError ?? ""}
          </p>
          <div className="flex items-center gap-2">
            <AdminButton type="button" variant="ghost" onClick={onClose} disabled={sending}>
              Cancel
            </AdminButton>
            <AdminButton type="button" variant="primary" onClick={() => void send()} disabled={!canSend}>
              {sending ? "Sending…" : "Send"}
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
}
