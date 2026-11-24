"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminDrawer } from "@/components/admin/ui/AdminDrawer";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { CRM_STATUSES, crmStatusLabel, type CrmStatus } from "@/lib/admin-crm/crm-status";
import {
  OUTREACH_CHANNELS,
  OUTREACH_CHANNEL_LABEL,
  isFollowUpDue,
  type DemoOutreach,
  type OutreachChannel,
  type OutreachDirection,
} from "@/lib/admin-crm/demo-outreach-types";
import type { DemoCard } from "@/components/admin/demos/DemoOutreachBoard";
import {
  daysFromToday,
  formatAgo,
  formatShortDate,
  fromDateInputValue,
  toDateInputValue,
} from "@/components/admin/demos/demo-outreach-format";

type OnChange = (slug: string, next: DemoOutreach | undefined) => void;

const INPUT_BASE_CLASS =
  "text-sm rounded-admin-md border border-admin-border bg-admin-bg px-2.5 py-1.5 text-admin-text focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30";
const INPUT_CLASS = `w-full ${INPUT_BASE_CLASS}`;
const LABEL_CLASS = "block text-[11px] font-medium uppercase tracking-wide text-admin-faint mb-1";

async function send(url: string, method: string, body?: unknown): Promise<DemoOutreach> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as { outreach?: DemoOutreach; error?: string } | null;
  if (!res.ok || !json?.outreach) throw new Error(json?.error ?? `Request failed (${res.status})`);
  return json.outreach;
}

function placeholder(): DemoOutreach {
  return {
    schoolId: "",
    crmStatus: "not_contacted",
    lastContactedAt: null,
    nextFollowUpAt: null,
    contactName: "",
    contactEmail: "",
    website: "",
    touches: [],
    emails: [],
  };
}

export function DemoOutreachDrawer({
  demo,
  outreach,
  onClose,
  onChange,
}: {
  demo: DemoCard | null;
  outreach: DemoOutreach | undefined;
  onClose: () => void;
  onChange: OnChange;
}) {
  return (
    <AdminDrawer open={demo !== null} onClose={onClose} title={demo?.schoolName ?? ""} width="lg">
      {demo ? <DrawerBody key={demo.slug} demo={demo} outreach={outreach} onChange={onChange} /> : null}
    </AdminDrawer>
  );
}

function DrawerBody({
  demo,
  outreach,
  onChange,
}: {
  demo: DemoCard;
  outreach: DemoOutreach | undefined;
  onChange: OnChange;
}) {
  const current = outreach ?? placeholder();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const patchQueueRef = useRef(Promise.resolve());
  const patchGenRef = useRef(0);

  const base = `/api/admin/demo-outreach/${encodeURIComponent(demo.slug)}`;

  /** Optimistic status / follow-up change; PATCH runs in order so stale responses cannot win. */
  function patch(next: Partial<Pick<DemoOutreach, "crmStatus" | "nextFollowUpAt">>) {
    const previous = outreach;
    const generation = ++patchGenRef.current;
    onChange(demo.slug, { ...current, ...next });
    setError(null);
    patchQueueRef.current = patchQueueRef.current.then(async () => {
      try {
        const saved = await send(base, "PATCH", next);
        if (generation === patchGenRef.current) onChange(demo.slug, saved);
      } catch (e) {
        if (generation === patchGenRef.current) {
          onChange(demo.slug, previous);
          setError(e instanceof Error ? e.message : "Couldn't save. Try again.");
        }
      }
    });
  }

  async function logTouch(input: {
    channel: OutreachChannel;
    direction: OutreachDirection;
    note: string;
    occurredAt: string;
    nextFollowUpAt?: string | null;
  }): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      onChange(demo.slug, await send(`${base}/touches`, "POST", input));
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't log the touch. Try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function deleteTouch(touchId: string) {
    if (!window.confirm("Delete this touch from the history?")) return;
    const previous = outreach;
    const generation = ++patchGenRef.current;
    onChange(demo.slug, { ...current, touches: current.touches.filter((t) => t.id !== touchId) });
    setError(null);
    patchQueueRef.current = patchQueueRef.current.then(async () => {
      try {
        const saved = await send(`/api/admin/demo-outreach/touches/${touchId}`, "DELETE");
        if (generation === patchGenRef.current) onChange(demo.slug, saved);
      } catch (e) {
        if (generation === patchGenRef.current) {
          onChange(demo.slug, previous);
          setError(e instanceof Error ? e.message : "Couldn't delete the touch. Try again.");
        }
      }
    });
  }

  const due = isFollowUpDue(current.nextFollowUpAt);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="h-10 flex items-center">
          <SchoolDemoWordmark logo={demo.logo} className="max-h-10 w-auto object-contain" />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <a href={demo.href} target="_blank" rel="noopener noreferrer" className="font-medium text-admin-accent hover:underline">
            Open demo →
          </a>
          <Link href="/admin/research" className="font-medium text-admin-muted hover:text-admin-text">
            View in CRM →
          </Link>
        </div>
        {current.contactName || current.contactEmail ? (
          <p className="text-xs text-admin-muted">
            {current.contactName}
            {current.contactName && current.contactEmail ? " · " : ""}
            {current.contactEmail ? (
              <a href={`mailto:${current.contactEmail}`} className="hover:text-admin-text underline-offset-2 hover:underline">
                {current.contactEmail}
              </a>
            ) : null}
          </p>
        ) : (
          <p className="text-xs text-admin-faint">No contact saved yet. Add the founder&apos;s name and email in the CRM.</p>
        )}
      </div>

      {error ? (
        <p role="alert" className="text-xs rounded-admin-md border border-admin-error-border bg-admin-error-bg text-admin-error px-3 py-2">
          {error}
        </p>
      ) : null}

      {/* Status + follow-up */}
      <section className="flex flex-col gap-4">
        <div>
          <span className={LABEL_CLASS}>Status</span>
          <AdminSelect
            value={current.crmStatus}
            onChange={(e) => void patch({ crmStatus: e.target.value as CrmStatus })}
            aria-label="Outreach status"
            className="w-full"
            triggerClassName="w-full"
          >
            {CRM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {crmStatusLabel(s)}
              </option>
            ))}
          </AdminSelect>
        </div>

        <div>
          <label htmlFor="demo-follow-up" className={LABEL_CLASS}>
            Next follow-up
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="demo-follow-up"
              type="date"
              value={toDateInputValue(current.nextFollowUpAt)}
              onChange={(e) => void patch({ nextFollowUpAt: fromDateInputValue(e.target.value) })}
              className={`${INPUT_BASE_CLASS} ${due ? "border-admin-warning-border" : ""}`}
            />
            {[3, 7, 14].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => void patch({ nextFollowUpAt: daysFromToday(days) })}
                className="text-xs px-2 py-1 rounded-admin-md border border-admin-border text-admin-muted hover:text-admin-text hover:bg-admin-neutral-bg"
              >
                +{days}d
              </button>
            ))}
            {current.nextFollowUpAt ? (
              <button
                type="button"
                onClick={() => void patch({ nextFollowUpAt: null })}
                className="text-xs text-admin-faint hover:text-admin-text"
              >
                Clear
              </button>
            ) : null}
          </div>
          {due ? <p className="mt-1 text-xs font-medium text-admin-warning">Follow-up is due.</p> : null}
        </div>
      </section>

      {/* The email sequence lives in the outreach workspace now. */}
      <section className="rounded-admin-md border border-admin-border bg-admin-bg p-3">
        <h3 className="text-xs font-semibold text-admin-text">Outreach sequence</h3>
        <p className="mt-1 text-xs text-admin-muted">Preview, send and track every step on the outreach page.</p>
        <Link
          href={`/admin/research?demo=${encodeURIComponent(demo.slug)}`}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-admin-accent hover:underline"
        >
          Open in Outreach
          <ArrowUpRight size={12} aria-hidden />
        </Link>
      </section>

      <LogTouchForm saving={saving} onSubmit={logTouch} />

      {/* History */}
      <section>
        <h3 className="text-xs font-semibold text-admin-text mb-2">
          History{current.touches.length > 0 ? ` (${current.touches.length})` : ""}
        </h3>
        {current.touches.length === 0 ? (
          <p className="text-xs text-admin-faint">
            {current.lastContactedAt
              ? `No touches logged here yet. The CRM shows last contact ${formatShortDate(current.lastContactedAt)}.`
              : "No touches logged yet."}
          </p>
        ) : (
          <ol className="flex flex-col">
            {current.touches.map((touch) => (
              <li key={touch.id} className="group flex gap-3 py-2.5 border-t border-admin-border first:border-t-0">
                <span
                  className={`mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center ${
                    touch.direction === "inbound"
                      ? "bg-admin-success-bg text-admin-success"
                      : "bg-admin-neutral-bg text-admin-muted"
                  }`}
                  title={touch.direction === "inbound" ? "They reached out" : "We reached out"}
                >
                  {touch.direction === "inbound" ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-admin-text">
                    <span className="font-medium">
                      {touch.direction === "inbound" ? "Reply" : "Sent"} · {OUTREACH_CHANNEL_LABEL[touch.channel]}
                    </span>
                    <span className="text-admin-faint">
                      {" "}
                      · {formatShortDate(touch.occurredAt)} ({formatAgo(touch.occurredAt)})
                    </span>
                  </p>
                  {touch.note ? (
                    <p className="text-xs text-admin-muted mt-0.5 whitespace-pre-wrap break-words">{touch.note}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void deleteTouch(touch.id)}
                  aria-label="Delete touch"
                  className="self-start p-1 rounded-admin-sm text-admin-faint opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-admin-error"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className="text-[11px] text-admin-faint">
        Logging a touch moves the status forward for you: first email → Contacted, the next → Followed Up, a reply →
        Replied. Changes here also update the school in the CRM.
      </p>
    </div>
  );
}

function LogTouchForm({
  saving,
  onSubmit,
}: {
  saving: boolean;
  onSubmit: (input: {
    channel: OutreachChannel;
    direction: OutreachDirection;
    note: string;
    occurredAt: string;
    nextFollowUpAt?: string | null;
  }) => Promise<boolean>;
}) {
  const [channel, setChannel] = useState<OutreachChannel>("email");
  const [direction, setDirection] = useState<OutreachDirection>("outbound");
  const [date, setDate] = useState(() => toDateInputValue(new Date().toISOString()));
  const [note, setNote] = useState("");
  const [followUpDays, setFollowUpDays] = useState<string>("3");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const today = toDateInputValue(new Date().toISOString());
    // Today's touch keeps the current time; a backdated one is stored at 9am that day.
    const occurredAt = date === today ? new Date().toISOString() : fromDateInputValue(date) ?? new Date().toISOString();
    const nextFollowUpAt =
      followUpDays === "keep" ? undefined : followUpDays === "none" ? null : daysFromToday(Number(followUpDays));
    const ok = await onSubmit({ channel, direction, note: note.trim(), occurredAt, nextFollowUpAt });
    if (ok) setNote("");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-admin-md border border-admin-border bg-admin-bg p-3">
      <h3 className="text-xs font-semibold text-admin-text">Log a touch</h3>

      <div className="grid grid-cols-2 gap-1 p-0.5 rounded-admin-md bg-admin-neutral-bg" role="radiogroup" aria-label="Direction">
        {(["outbound", "inbound"] as const).map((d) => (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={direction === d}
            onClick={() => {
              setDirection(d);
              setFollowUpDays(d === "inbound" ? "none" : "3");
            }}
            className={`text-xs py-1.5 rounded-admin-sm transition-colors ${
              direction === d ? "bg-admin-surface text-admin-text font-medium shadow-sm" : "text-admin-muted hover:text-admin-text"
            }`}
          >
            {d === "outbound" ? "We reached out" : "They replied"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className={LABEL_CLASS}>Channel</span>
          <AdminSelect
            value={channel}
            onChange={(e) => setChannel(e.target.value as OutreachChannel)}
            aria-label="Channel"
            className="w-full"
            triggerClassName="w-full"
          >
            {OUTREACH_CHANNELS.map((c) => (
              <option key={c} value={c}>
                {OUTREACH_CHANNEL_LABEL[c]}
              </option>
            ))}
          </AdminSelect>
        </div>
        <div>
          <label htmlFor="demo-touch-date" className={LABEL_CLASS}>
            Date
          </label>
          <input
            id="demo-touch-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label htmlFor="demo-touch-note" className={LABEL_CLASS}>
          Note
        </label>
        <textarea
          id="demo-touch-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={direction === "outbound" ? "e.g. Template A, subject “built this for …”" : "e.g. Wants a walkthrough next week"}
          className={`${INPUT_CLASS} resize-y`}
        />
      </div>

      <div>
        <span className={LABEL_CLASS}>Then follow up</span>
        <AdminSelect
          value={followUpDays}
          onChange={(e) => setFollowUpDays(e.target.value)}
          aria-label="Next follow-up"
          className="w-full"
          triggerClassName="w-full"
        >
          <option value="3">In 3 days</option>
          <option value="4">In 4 days</option>
          <option value="7">In 7 days</option>
          <option value="14">In 14 days</option>
          <option value="keep">Keep current date</option>
          <option value="none">No follow-up</option>
        </AdminSelect>
      </div>

      <AdminButton type="submit" variant="primary" disabled={saving}>
        {saving ? "Saving…" : "Log touch"}
      </AdminButton>
    </form>
  );
}
