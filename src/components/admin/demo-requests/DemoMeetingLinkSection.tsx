"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminDetailSection } from "@/components/admin/ui/AdminDetailSection";

const INPUT_CLASS =
  "w-full text-sm rounded-admin-md border border-admin-border bg-admin-bg px-2.5 py-1.5 text-admin-text focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30";
const LAST_LINK_KEY = "admin:demo-meeting-link:last";

export type DemoMeetingLinkRequest = {
  id: string;
  name: string;
  email: string;
  meeting_link?: string | null;
  meeting_link_sent_at?: string | null;
};

type Preview = { to: string; subject: string; html: string };

function readLastLink(): string {
  try {
    return window.localStorage.getItem(LAST_LINK_KEY) ?? "";
  } catch {
    return "";
  }
}

function rememberLastLink(link: string) {
  try {
    window.localStorage.setItem(LAST_LINK_KEY, link);
  } catch {
    // Convenience only.
  }
}

function looksLikeUrl(value: string) {
  return /^https?:\/\/\S+\.\S+/i.test(value.trim());
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json;
}

/** Detail-pane section: paste the call link, preview the email, send it. */
export function DemoMeetingLinkSection({
  request,
  onSent,
}: {
  request: DemoMeetingLinkRequest;
  onSent: (meetingLink: string, sentAt: string) => void;
}) {
  // Rendered with key={request.id}, so each request starts fresh:
  // its saved link, else the last link sent (usually the same room).
  const [link, setLink] = useState(() => request.meeting_link || readLastLink());
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const sentAt = request.meeting_link_sent_at ? new Date(request.meeting_link_sent_at) : null;
  const validLink = looksLikeUrl(link);
  const base = `/api/admin/demo-requests/${request.id}/meeting-link`;

  async function openPreview() {
    setError(null);
    setPreviewOpen(true);
    setPreview(null);
    setLoadingPreview(true);
    try {
      setPreview(await postJson<Preview>(`${base}/preview`, { meetingLink: link.trim() }));
    } catch (e) {
      setPreview(null);
      setError(e instanceof Error ? e.message : "Preview failed.");
      setPreviewOpen(false);
    } finally {
      setLoadingPreview(false);
    }
  }

  async function send(skipConfirm = false) {
    if (
      !skipConfirm &&
      !window.confirm(`Email the meeting link to ${request.name} (${request.email})?`)
    ) {
      return;
    }
    setError(null);
    setNotice(null);
    setSending(true);
    try {
      const json = await postJson<{ meetingLink: string; meetingLinkSentAt: string; warning?: string }>(
        `${base}/send`,
        { meetingLink: link.trim() },
      );
      rememberLastLink(json.meetingLink);
      setLink(json.meetingLink);
      setPreviewOpen(false);
      setNotice(json.warning ?? `Sent to ${request.email}.`);
      onSent(json.meetingLink, json.meetingLinkSentAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AdminDetailSection title="Meeting link">
      <div className="space-y-2.5">
        <p className="text-xs text-admin-muted">
          {sentAt
            ? `Link email sent ${sentAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.`
            : "They were told the link arrives 24 hours before the call."}
        </p>
        <label className="block">
          <span className="sr-only">Meeting link</span>
          <input
            type="url"
            inputMode="url"
            placeholder="https://meet.google.com/…"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <AdminButton
            type="button"
            variant="secondary"
            disabled={!validLink || loadingPreview || sending}
            onClick={() => void openPreview()}
          >
            {loadingPreview ? "Building preview…" : "Preview email"}
          </AdminButton>
          <AdminButton
            type="button"
            variant="primary"
            disabled={!validLink || sending}
            onClick={() => void send()}
          >
            {sending ? "Sending…" : sentAt ? "Resend link email" : "Send link email"}
          </AdminButton>
        </div>
        {error ? (
          <p className="text-xs text-admin-error" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? <p className="text-xs text-admin-muted">{notice}</p> : null}
      </div>

      {previewOpen ? (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close preview"
            className="absolute inset-0 bg-admin-text/30"
            onClick={() => !sending && setPreviewOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Meeting link email preview"
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-admin-md border border-admin-border bg-admin-surface shadow-lg"
          >
            <div className="flex items-center justify-between gap-4 border-b border-admin-border px-4 py-3">
              <h2 className="text-sm font-semibold text-admin-text">Meeting link email</h2>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                disabled={sending}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-admin-sm text-admin-muted hover:text-admin-text hover:bg-admin-neutral-bg"
              >
                <X size={16} />
              </button>
            </div>
            <div className="border-b border-admin-border px-4 py-2 text-xs text-admin-muted space-y-0.5">
              <p>
                <span className="text-admin-faint">To</span> {preview?.to ?? request.email}
              </p>
              <p className="font-medium text-admin-text">
                <span className="font-normal text-admin-faint">Subject</span> {preview?.subject ?? "…"}
              </p>
              <p>
                <span className="text-admin-faint">Attachment</span> Updated calendar invite (.ics)
              </p>
            </div>
            {preview ? (
              <iframe
                title="Email preview"
                sandbox=""
                srcDoc={preview.html}
                className="min-h-[420px] w-full flex-1 bg-white"
              />
            ) : (
              <p className="p-4 text-xs text-admin-faint">Building preview…</p>
            )}
            <div className="flex items-center justify-end gap-2 border-t border-admin-border px-4 py-3">
              <AdminButton type="button" variant="ghost" onClick={() => setPreviewOpen(false)} disabled={sending}>
                Close
              </AdminButton>
              <AdminButton
                type="button"
                variant="primary"
                disabled={!preview || sending || loadingPreview}
                onClick={() => void send(true)}
              >
                {sending ? "Sending…" : "Send this email"}
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </AdminDetailSection>
  );
}
