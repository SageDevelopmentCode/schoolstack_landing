"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  BookOpenText,
  Check,
  ClipboardCopy,
  FileText,
  Inbox,
  Mail,
  Mailbox,
  MessageCircle,
  Monitor,
  PenLine,
  Phone,
  Send,
} from "lucide-react";
import { GCard, GChip, G_INPUT, G_LABEL, G_TOGGLE, G_TOGGLE_OFF, G_TOGGLE_ON, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { BusyLabel, GardenNotice, GardenSaveBar, GardenSelect } from "@/components/school-admin/garden/kit";
import { buildResearchPrompt } from "@/components/admin/demos/outreach-ui";
import { listSchoolDemoOptions, schoolDemoHref } from "@/data/school-demos";
import type { OutreachEmailStep, OutreachSocialStep } from "@/data/outreach/types";
import { CRM_STATUSES, crmStatusLabel, type CrmStatus } from "@/lib/admin-crm/crm-status";
import {
  OUTREACH_CHANNEL_LABEL,
  type DemoOutreach,
  type OutreachChannel,
  type OutreachDirection,
} from "@/lib/admin-crm/demo-outreach-types";
import { snapshotPath } from "@/lib/admin-crm/outreach-email";
import type { JourneyStep } from "@/lib/admin-crm/outreach-journey";
import { PRIORITY_LABEL, type ResearchSchool, type SchoolPatch } from "@/lib/admin-crm/research-types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { adminToast } from "@/lib/school-admin/admin-toast";
import { OutreachComposeDialog } from "./OutreachComposeDialog";
import { SchoolLetterCard } from "./SchoolLetterCard";
import { dueText, formatDay, journeyChip } from "./research-ui";
import type { WorkspaceRow } from "./useResearchWorkspaceModel";

const DEMO_OPTIONS = listSchoolDemoOptions();
const SOCIAL_CHANNELS: OutreachChannel[] = ["instagram", "facebook", "linkedin"];
const TOUCH_CHANNELS: OutreachChannel[] = ["email", "phone", "instagram", "facebook", "linkedin", "in_person", "mail", "other"];

const STEP_ICON: Record<JourneyStep["id"], typeof Mail> = {
  first: Mail,
  "follow-1": Monitor,
  social: MessageCircle,
  "follow-2": FileText,
  close: Inbox,
};

function hostname(url: string) {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function websiteHref(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok || !json) throw new Error(json?.error ?? `Request failed (${res.status})`);
  return json;
}

// ── Stepper ──────────────────────────────────────────────────────────────────

function StepDot({ step }: { step: JourneyStep }) {
  const Icon = STEP_ICON[step.id];
  if (step.status === "done") {
    return (
      <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-forest)] text-white" aria-hidden>
        <Check className="h-5 w-5" strokeWidth={3} />
      </span>
    );
  }
  if (step.status === "current") {
    return (
      <span
        className="grid h-11 w-11 -translate-y-0.5 place-items-center rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_3px_0_0_var(--sf-ink)]"
        aria-hidden
      >
        <Icon className="h-5 w-5" strokeWidth={2.4} />
      </span>
    );
  }
  return (
    <span className="grid h-10 w-10 place-items-center rounded-full border-[1.5px] border-dashed border-[var(--sf-ink)]/30 bg-white text-[var(--sf-ink)]/45" aria-hidden>
      <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
    </span>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function stepWhen(step: JourneyStep, businessDay: number, afterLetter = false): string {
  if (step.status === "done" && step.at) return `${step.kind === "social" ? "Logged" : "Sent"} ${formatDay(step.at)}`;
  if (step.status === "current") return step.dueAt ? capitalize(dueText(step.dueAt)) : afterLetter ? "After the letter" : "Ready now";
  return businessDay === 0 ? "Day 0" : `Day ${businessDay}`;
}

function JourneyStepper({ row }: { row: WorkspaceRow }) {
  const { journey, plan } = row;
  return (
    <ol className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-5 sm:gap-0" aria-label="Outreach sequence">
      {journey.steps.map((step, i) => {
        const businessDay = plan?.steps.find((s) => s.id === step.id)?.businessDay ?? 0;
        const last = i === journey.steps.length - 1;
        const doneLine = step.status === "done";
        return (
          <li
            key={step.id}
            className="relative flex items-center gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center"
            aria-current={step.status === "current" ? "step" : undefined}
          >
            {!last ? (
              <span
                className={`absolute left-[calc(50%+24px)] right-[calc(-50%+24px)] top-5 hidden h-0 border-t-2 sm:block ${
                  doneLine ? "border-solid border-[var(--sf-forest)]" : "border-dashed border-[var(--sf-ink)]/20"
                }`}
                aria-hidden
              />
            ) : null}
            <StepDot step={step} />
            <span className="min-w-0">
              <span className={`block text-[13.5px] font-extrabold ${step.status === "upcoming" ? "text-[var(--sf-ink)]/60" : "text-[var(--sf-ink)]"}`}>
                {step.number}. {step.label}
              </span>
              <span
                className={`block text-[12px] font-bold ${
                  step.status === "current" && row.journey.actionable ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-soft)]"
                }`}
              >
                {stepWhen(step, businessDay, row.journey.stage === "letter")}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ── Current step ─────────────────────────────────────────────────────────────

function CurrentStepCard({
  row,
  onCompose,
  onSocialLogged,
}: {
  row: WorkspaceRow;
  onCompose: (step: OutreachEmailStep) => void;
  onSocialLogged: (next: DemoOutreach, channel: OutreachChannel) => void;
}) {
  const { journey, plan, school } = row;
  const [loggingChannel, setLoggingChannel] = useState<OutreachChannel | null>(null);
  const [copied, setCopied] = useState(false);
  const next = journey.next;
  // While the handwritten letter is still to be mailed, the first email waits behind it.
  const waitingOnLetter = journey.stage === "letter";
  const actionable = journey.actionable && !waitingOnLetter;
  if (!next || !plan) return null;
  const step = plan.steps.find((s) => s.id === next.id);
  if (!step) return null;

  const preview = step.body.split(/\n{2,}/).slice(1, 3).join(" ").slice(0, 240);

  async function copySocial(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      adminToast.success("Social note copied.", { id: "research-social-copied", description: "Paste it as a DM, then log where you sent it." });
    } catch {
      adminToast.error("Couldn't copy the note.", { id: "research-social-copy-error", description: text });
    }
  }

  async function logSocial(channel: OutreachChannel) {
    if (!school.demo_slug) return;
    setLoggingChannel(channel);
    const errorId = `research-social-error-${school.id}`;
    try {
      const { outreach } = await postJson<{ outreach: DemoOutreach }>(
        `/api/admin/demo-outreach/${encodeURIComponent(school.demo_slug)}/emails/social`,
        { channel },
      );
      adminToast.dismiss(errorId);
      onSocialLogged(outreach, channel);
    } catch (error) {
      adminToast.error("Couldn't log the social note.", {
        id: errorId,
        description: `${error instanceof Error ? error.message : "Try again."} Nothing was logged.`,
        action: { label: "Retry", onClick: () => void logSocial(channel) },
      });
    } finally {
      setLoggingChannel(null);
    }
  }

  return (
    <div
      className={`mt-5 rounded-[18px] border-[1.5px] p-4 sm:p-5 ${
        actionable ? "border-[var(--sf-clay)]/35 bg-[var(--sf-accent-wash)]" : "border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]"
      }`}
      data-testid="research-current-step"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
            Next · step {next.number}
          </p>
          <p className="m-0 mt-1 text-[15px] font-extrabold text-[var(--sf-ink)]">{step.purpose}</p>
          {step.kind === "email" && step.subject ? (
            <p className="m-0 mt-1 text-[13px] font-bold text-[var(--sf-soft)]">Subject: {step.subject}</p>
          ) : null}
        </div>
        {waitingOnLetter ? (
          <GChip tone="info">After the letter</GChip>
        ) : actionable ? (
          <GChip tone="alert">{next.dueAt ? capitalize(dueText(next.dueAt)) : "Ready now"}</GChip>
        ) : next.dueAt ? (
          <GChip tone="info">{capitalize(dueText(next.dueAt))}</GChip>
        ) : null}
      </div>

      {step.kind === "email" ? (
        <>
          {preview ? <p className="m-0 mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-[var(--sf-ink)]/75">{preview}</p> : null}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={actionable ? gBtnPopSm : gBtnOutlineSm}
              onClick={() => onCompose(step)}
              data-testid="research-compose-open"
            >
              <Send className="h-4 w-4" aria-hidden />
              {actionable ? `Preview & send step ${next.number}` : `Preview step ${next.number}`}
            </button>
            {waitingOnLetter ? (
              <span className="text-[12.5px] font-bold text-[var(--sf-soft)]">
                Goes out 5 business days after you log the letter as mailed.
              </span>
            ) : !actionable && next.dueAt ? (
              <span className="text-[12.5px] font-bold text-[var(--sf-soft)]">You can still send it early.</span>
            ) : null}
          </div>
        </>
      ) : (
        <SocialStepBody
          step={step}
          actionable={actionable}
          copied={copied}
          onCopy={() => void copySocial(step.body)}
          loggingChannel={loggingChannel}
          onLog={(c) => void logSocial(c)}
        />
      )}
    </div>
  );
}

function SocialStepBody({
  step,
  actionable,
  copied,
  onCopy,
  loggingChannel,
  onLog,
}: {
  step: OutreachSocialStep;
  actionable: boolean;
  copied: boolean;
  onCopy: () => void;
  loggingChannel: OutreachChannel | null;
  onLog: (channel: OutreachChannel) => void;
}) {
  return (
    <>
      <blockquote className="m-0 mt-3 rounded-[14px] border-l-4 border-[var(--sf-clay)]/40 bg-white px-3 py-2 text-[13.5px] leading-relaxed text-[var(--sf-ink)]/85">
        {step.body}
      </blockquote>
      <p className="m-0 mt-2 text-[12.5px] font-bold text-[var(--sf-soft)]">Send it by hand on {step.where}, then log where.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={actionable ? gBtnPopSm : gBtnOutlineSm} onClick={onCopy}>
          {copied ? <Check className="h-4 w-4" aria-hidden /> : <ClipboardCopy className="h-4 w-4" aria-hidden />}
          {copied ? "Copied" : "Copy note"}
        </button>
        {SOCIAL_CHANNELS.map((channel) => (
          <button
            key={channel}
            type="button"
            className={gBtnOutlineSm}
            onClick={() => onLog(channel)}
            disabled={loggingChannel !== null}
            aria-busy={loggingChannel === channel || undefined}
          >
            <BusyLabel busy={loggingChannel === channel} busyLabel="Logging…">
              Sent on {OUTREACH_CHANNEL_LABEL[channel]}
            </BusyLabel>
          </button>
        ))}
      </div>
    </>
  );
}

// ── Sequence card states without a next step ────────────────────────────────

function SequenceState({ row, onStatus }: { row: WorkspaceRow; onStatus: (status: CrmStatus) => void }) {
  const { journey, plan, school } = row;
  const [copied, setCopied] = useState(false);

  if (journey.stage === "needs_demo") {
    return (
      <GardenNotice tone="info" title="Link a demo first">
        The sequence offers each school its own MudKitchen version. Pick their demo above, or build one with the
        school-demo-builder skill.
      </GardenNotice>
    );
  }
  if (journey.stage === "not_started") {
    return (
      <GardenNotice tone="info" title="Not in outreach yet">
        Build a demo for this school, then write its plan to start the sequence.
      </GardenNotice>
    );
  }
  if (journey.stage === "needs_plan" && school.demo_slug) {
    const prompt = buildResearchPrompt({
      slug: school.demo_slug,
      schoolName: school.name,
      demoHref: schoolDemoHref(school.demo_slug),
      website: school.website,
      crmStatusLabel: crmStatusLabel(school.crm_status),
      contactName: school.contact_name,
      recontact: school.crm_status !== "not_contacted",
    });
    return (
      <GardenNotice
        tone="warning"
        title="No outreach plan yet"
        action={
          <button
            type="button"
            className={gBtnPopSm}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(prompt);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
                adminToast.success("Research prompt copied.", { id: "research-prompt-copied", description: "Paste it into Claude Code to write the plan." });
              } catch {
                adminToast.error("Couldn't copy the prompt.", { id: "research-prompt-copy-error", description: prompt.slice(0, 200) });
              }
            }}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <ClipboardCopy className="h-4 w-4" aria-hidden />}
            {copied ? "Copied" : "Copy research prompt"}
          </button>
        }
      >
        {school.crm_status === "not_contacted"
          ? "Research the school and write its first-contact sequence with the school-outreach-research skill."
          : "This school was emailed by hand before the funnel. The prompt asks for a re-contact sequence and its snapshot."}
      </GardenNotice>
    );
  }
  if (journey.stage === "do_not_email") {
    return (
      <GardenNotice tone="alert" title="Don't email this school">
        {plan?.doNotEmail?.reason}
      </GardenNotice>
    );
  }
  if (journey.stage === "finished") {
    return (
      <GardenNotice
        tone="success"
        title="Sequence finished"
        action={
          school.crm_status !== "nurturing" ? (
            <button type="button" className={gBtnOutlineSm} onClick={() => onStatus("nurturing")}>
              Move to Nurturing
            </button>
          ) : undefined
        }
      >
        Every step went out without a reply. The demo{plan?.snapshot ? " and snapshot stay" : " stays"} up.
      </GardenNotice>
    );
  }
  if (journey.next) return null;
  return (
    <GardenNotice tone={journey.stage === "won" ? "success" : "info"} title={`${journeyChip(journey).label}`}>
      {journey.stage === "not_interested"
        ? "The sequence is stopped."
        : journey.stage === "nurturing"
          ? "No sequence is running. Check back in later."
          : "They replied, so the sequence stopped. Take it from here by hand."}
    </GardenNotice>
  );
}

// ── Log a touch ──────────────────────────────────────────────────────────────

function LogTouchForm({ slug, onLogged }: { slug: string; onLogged: (next: DemoOutreach, direction: OutreachDirection) => void }) {
  const [direction, setDirection] = useState<OutreachDirection>("inbound");
  const [channel, setChannel] = useState<OutreachChannel>("email");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const errorId = `research-touch-error-${slug}`;
    try {
      const { outreach } = await postJson<{ outreach: DemoOutreach }>(`/api/admin/demo-outreach/${encodeURIComponent(slug)}/touches`, {
        channel,
        direction,
        note: note.trim(),
      });
      adminToast.dismiss(errorId);
      setNote("");
      onLogged(outreach, direction);
    } catch (error) {
      adminToast.error("Couldn't log it.", {
        id: errorId,
        description: `${error instanceof Error ? error.message : "Try again."} Nothing was logged.`,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3" aria-label="Log a reply, call or message">
      <div role="radiogroup" aria-label="Who reached out" className="flex flex-wrap gap-1.5">
        {(
          [
            ["inbound", "They replied"],
            ["outbound", "I reached out"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={direction === value}
            onClick={() => setDirection(value)}
            className={`${G_TOGGLE} ${direction === value ? G_TOGGLE_ON : G_TOGGLE_OFF}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <div>
          <label htmlFor={`touch-channel-${slug}`} className={G_LABEL}>
            Channel
          </label>
          <GardenSelect
            id={`touch-channel-${slug}`}
            value={channel}
            onChange={(v) => setChannel(v as OutreachChannel)}
            options={TOUCH_CHANNELS.map((c) => ({ value: c, label: OUTREACH_CHANNEL_LABEL[c] }))}
          />
        </div>
        <div>
          <label htmlFor={`touch-note-${slug}`} className={G_LABEL}>
            Note
          </label>
          <input
            id={`touch-note-${slug}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={direction === "inbound" ? "What did they say?" : "What did you send?"}
            className={G_INPUT}
            data-garden-skip
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" className={gBtnOutlineSm} disabled={saving} aria-busy={saving || undefined}>
          <BusyLabel busy={saving} busyLabel="Logging…" icon={<PenLine className="h-4 w-4" aria-hidden />}>
            Log it
          </BusyLabel>
        </button>
        {direction === "inbound" ? (
          <span className="text-[12.5px] font-bold text-[var(--sf-soft)]">A reply moves them to Replied and stops the sequence.</span>
        ) : null}
      </div>
    </form>
  );
}

// ── Activity ─────────────────────────────────────────────────────────────────

function Activity({ row }: { row: WorkspaceRow }) {
  const labelFor = (stepId: string) => row.journey.steps.find((s) => s.id === stepId)?.label ?? stepId;
  const items = [
    ...row.log.emails.map((e) => ({
      id: `e-${e.id}`,
      at: e.sentAt,
      icon: e.channel === "social" ? MessageCircle : Mail,
      title: `${labelFor(e.stepId)} ${e.status === "logged" ? "logged" : e.status === "sent" ? "sent" : e.status.replace(/_/g, " ")}`,
      detail: e.channel === "email" ? [e.toEmail, e.subject].filter(Boolean).join(" · ") : "",
      failed: e.status === "failed" || e.status === "skipped_unsubscribed",
    })),
    ...row.log.touches.map((t) => ({
      id: `t-${t.id}`,
      at: t.occurredAt,
      icon: t.channel === "phone" ? Phone : t.channel === "mail" ? Mailbox : t.direction === "inbound" ? Inbox : PenLine,
      title:
        t.channel === "mail" && t.direction === "outbound"
          ? "Handwritten letter mailed"
          : `${t.direction === "inbound" ? "They replied" : "Reached out"} · ${OUTREACH_CHANNEL_LABEL[t.channel]}`,
      detail: t.note,
      failed: false,
    })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  if (items.length === 0) {
    return <p className="m-0 text-[13.5px] font-semibold text-[var(--sf-soft)]">Nothing logged yet. Sends, DMs and replies show up here.</p>;
  }
  return (
    <ul className="m-0 grid min-w-0 list-none grid-cols-1 gap-1 p-0">
      {items.slice(0, 12).map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id} className="flex min-w-0 items-start gap-3 rounded-[12px] px-2 py-2">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1 ring-[var(--sf-ink)]/15 ${
                item.failed ? "bg-[var(--sf-peach)]" : "bg-[var(--sf-sky)]"
              }`}
              aria-hidden
            >
              <Icon className="h-4 w-4" strokeWidth={2.3} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-extrabold text-[var(--sf-ink)]">{item.title}</span>
              {item.detail ? <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">{item.detail}</span> : null}
            </span>
            <span className="shrink-0 text-[12px] font-bold tabular-nums text-[var(--sf-soft)]">{formatDay(item.at)}</span>
          </li>
        );
      })}
    </ul>
  );
}

// ── Contact & notes ──────────────────────────────────────────────────────────

function ContactForm({
  school,
  saving,
  onSave,
}: {
  school: ResearchSchool;
  saving: boolean;
  onSave: (patch: SchoolPatch) => Promise<boolean>;
}) {
  const initial = {
    contact_name: school.contact_name,
    contact_email: school.contact_email,
    contact_phone: school.contact_phone,
    website: school.website,
    notes: school.notes,
  };
  const [form, setForm] = useState(initial);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const changed = (Object.keys(initial) as (keyof typeof initial)[]).filter((k) => form[k].trim() !== initial[k].trim());
  const dirty = changed.length > 0;

  const field = (key: keyof typeof initial, label: string, type = "text") => (
    <div>
      <label htmlFor={`contact-${key}-${school.id}`} className={G_LABEL}>
        {label}
      </label>
      <input
        id={`contact-${key}-${school.id}`}
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className={G_INPUT}
        data-garden-skip
      />
    </div>
  );

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {field("contact_name", "Contact name")}
        {field("contact_email", "Email", "email")}
        {field("contact_phone", "Phone", "tel")}
        {field("website", "Website", "url")}
      </div>
      <div>
        <label htmlFor={`contact-notes-${school.id}`} className={G_LABEL}>
          Notes
        </label>
        <textarea
          id={`contact-notes-${school.id}`}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={4}
          className={`${G_INPUT} resize-y leading-relaxed`}
          data-garden-skip
        />
      </div>
      <GardenSaveBar
        sticky={false}
        dirty={dirty}
        saving={saving}
        savedAt={savedAt}
        onDiscard={() => setForm(initial)}
        onSave={async () => {
          const patch = Object.fromEntries(changed.map((k) => [k, form[k].trim()])) as SchoolPatch;
          if (await onSave(patch)) setSavedAt(Date.now());
        }}
      />
    </div>
  );
}

// ── Panel ────────────────────────────────────────────────────────────────────

export function SchoolJourneyPanel({
  row,
  theme,
  pendingKey,
  onSaveSchool,
  onStatus,
  onOutreach,
  onOpenResearch,
}: {
  row: WorkspaceRow;
  theme: ParentThemeTokens;
  pendingKey: string | null;
  onSaveSchool: (patch: SchoolPatch, copy: { key: string; success: string; description?: string; error: string }) => Promise<boolean>;
  onStatus: (status: CrmStatus) => Promise<boolean>;
  onOutreach: (next: DemoOutreach) => void;
  /** Opens the "Research & plan" drawer for this school. */
  onOpenResearch: () => void;
}) {
  const { school, plan, journey } = row;
  const [composing, setComposing] = useState<OutreachEmailStep | null>(null);
  const [statusPending, setStatusPending] = useState<CrmStatus | null>(null);
  const chip = journeyChip(journey);
  const snapshotHref = snapshotPath(plan);
  const lastTo = row.log.emails.find((e) => e.channel === "email" && e.toEmail)?.toEmail ?? "";
  const composeStep = composing ? journey.steps.find((s) => s.id === composing.id) : null;

  async function changeStatus(status: CrmStatus) {
    setStatusPending(status);
    await onStatus(status);
    setStatusPending(null);
  }

  return (
    <div className="flex min-w-0 flex-col gap-5" data-testid="research-journey-panel">
      {/* Header */}
      <GCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <GChip tone={chip.tone}>{chip.label}</GChip>
              {journey.isRecontact ? <GChip tone="neutral">Re-contact</GChip> : null}
              {school.state ? <GChip tone="neutral">{school.state}</GChip> : null}
            </div>
            <h2 className="sf-display m-0 mt-2 text-[1.75rem] leading-[1.02] text-[var(--sf-ink)] sm:text-[2rem]">{school.name}</h2>
            <p className="m-0 mt-1 text-[13.5px] font-semibold text-[var(--sf-soft)]">
              {[school.location, school.contact_name ? `${school.contact_name}` : null].filter(Boolean).join(" · ")}
              {school.website ? (
                <>
                  {" · "}
                  <a href={websiteHref(school.website)} target="_blank" rel="noopener noreferrer" className={gLinkSm}>
                    {hostname(school.website)}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </>
              ) : null}
            </p>
          </div>
          <div className="w-[150px] shrink-0">
            <label htmlFor={`priority-${school.id}`} className="sr-only">
              Priority
            </label>
            <GardenSelect
              id={`priority-${school.id}`}
              value={String(school.priority_score)}
              disabled={pendingKey === `priority:${school.id}`}
              onChange={(v) =>
                void onSaveSchool(
                  { priority_score: Number(v) },
                  { key: "priority", success: `${school.name} is now P${v}.`, error: `Couldn't change ${school.name}'s priority.` },
                )
              }
              options={[5, 4, 3, 2, 1].map((p) => ({ value: String(p), label: `P${p} · ${PRIORITY_LABEL[p]}` }))}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-dashed border-[var(--sf-ink)]/12 pt-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor={`demo-${school.id}`} className={G_LABEL}>
              Product demo
            </label>
            <GardenSelect
              id={`demo-${school.id}`}
              value={school.demo_slug ?? ""}
              disabled={pendingKey === `demo:${school.id}`}
              onChange={(v) =>
                void onSaveSchool(
                  { demo_slug: v || null },
                  {
                    key: "demo",
                    success: v ? `Demo linked to ${school.name}.` : `Demo unlinked from ${school.name}.`,
                    error: `Couldn't change ${school.name}'s demo.`,
                  },
                )
              }
              placeholder="No demo yet"
              options={[{ value: "", label: "No demo yet" }, ...DEMO_OPTIONS.map((o) => ({ value: o.slug, label: o.label }))]}
            />
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" className={gBtnOutlineSm} onClick={onOpenResearch} data-testid="research-drawer-open">
              <BookOpenText className="h-4 w-4" aria-hidden />
              Research &amp; plan
              {plan && !plan.doNotEmail && plan.facts.length > 0 ? (
                <span className="rounded-full bg-[var(--sf-ink)]/[0.07] px-1.5 text-[11.5px] tabular-nums" aria-label={`${plan.facts.length} sourced facts`}>
                  {plan.facts.length}
                </span>
              ) : null}
            </button>
            {school.demo_slug ? (
              <a href={schoolDemoHref(school.demo_slug)} target="_blank" rel="noopener noreferrer" className={gBtnOutlineSm}>
                <Monitor className="h-4 w-4" aria-hidden />
                Open demo
              </a>
            ) : null}
            {snapshotHref ? (
              <a href={`${snapshotHref}?preview=1`} target="_blank" rel="noopener noreferrer" className={gBtnOutlineSm}>
                <FileText className="h-4 w-4" aria-hidden />
                Open snapshot
              </a>
            ) : null}
          </div>
        </div>
      </GCard>

      {/* Handwritten letter (goes before the first email) */}
      <SchoolLetterCard row={row} index={1} onOutreach={onOutreach} />

      {/* Sequence */}
      <GCard
        kicker={journey.isRecontact ? `Re-contact · last emailed ${plan?.priorContact?.when}` : "Outreach"}
        title="Follow-up sequence"
        index={1}
      >
        {journey.steps.length > 0 ? <JourneyStepper row={row} /> : null}
        <CurrentStepCard
          row={row}
          onCompose={setComposing}
          onSocialLogged={(next, channel) => {
            onOutreach(next);
            adminToast.success(`Social hello logged on ${OUTREACH_CHANNEL_LABEL[channel]}.`, {
              id: `research-social-${school.id}`,
              description: "The next step is scheduled.",
            });
          }}
        />
        {journey.next ? null : (
          <div className={journey.steps.length > 0 ? "mt-5" : ""}>
            <SequenceState row={row} onStatus={(s) => void changeStatus(s)} />
          </div>
        )}
      </GCard>

      {/* Where it stands */}
      <GCard kicker="Pipeline" title="Where it stands" index={2}>
        <div role="radiogroup" aria-label="CRM status" className="flex flex-wrap gap-1.5">
          {CRM_STATUSES.map((status) => {
            const active = school.crm_status === status;
            const busy = statusPending === status;
            return (
              <button
                key={status}
                type="button"
                role="radio"
                aria-checked={active}
                aria-busy={busy || undefined}
                disabled={statusPending !== null}
                onClick={() => void changeStatus(status)}
                className={`${G_TOGGLE} ${active ? G_TOGGLE_ON : G_TOGGLE_OFF}`}
              >
                <BusyLabel busy={busy} busyLabel="Saving…">
                  {crmStatusLabel(status)}
                </BusyLabel>
              </button>
            );
          })}
        </div>
        {school.demo_slug ? (
          <div className="mt-5 border-t border-dashed border-[var(--sf-ink)]/12 pt-4">
            <p className="m-0 mb-3 text-[14px] font-extrabold text-[var(--sf-ink)]">Log a reply, call or DM</p>
            <LogTouchForm
              slug={school.demo_slug}
              onLogged={(next, direction) => {
                onOutreach(next);
                adminToast.success(direction === "inbound" ? `Reply from ${school.name} logged.` : "Touch logged.", {
                  id: `research-touch-${school.id}`,
                  description:
                    direction === "inbound" ? `${school.name} is now ${crmStatusLabel(next.crmStatus)}. The sequence stops here.` : undefined,
                });
              }}
            />
          </div>
        ) : null}
      </GCard>

      {/* Activity + contact */}
      <div className="grid gap-5 2xl:grid-cols-2">
        <GCard kicker="History" title="Activity" index={3}>
          <Activity row={row} />
        </GCard>
        <GCard kicker="Contact" title="Contact & notes" index={4}>
          <ContactForm
            key={`${school.id}-${school.updated_at}`}
            school={school}
            saving={pendingKey === `contact:${school.id}`}
            onSave={(patch) =>
              onSaveSchool(patch, {
                key: "contact",
                success: `${school.name} saved.`,
                description: "Contact details and notes are up to date.",
                error: `Couldn't save ${school.name}.`,
              })
            }
          />
        </GCard>
      </div>

      {composing && plan && school.demo_slug && composeStep ? (
        <OutreachComposeDialog
          theme={theme}
          slug={school.demo_slug}
          plan={plan}
          step={composing}
          stepNumber={composeStep.number}
          stepLabel={composeStep.label}
          defaultTo={school.contact_email || lastTo}
          onClose={() => setComposing(null)}
          onSent={(next, notice) => {
            setComposing(null);
            onOutreach(next);
            if (notice.warn) adminToast.error(notice.title, { id: `research-send-${school.id}`, description: notice.description });
            else adminToast.success(notice.title, { id: `research-send-${school.id}`, description: notice.description });
          }}
        />
      ) : null}
    </div>
  );
}

