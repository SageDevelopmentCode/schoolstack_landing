"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Check, ChevronRight, Circle, ExternalLink, Eye, Link2, Loader2 } from "lucide-react";
import { GChip, GKicker, GProgress, G_FOCUS, gBtnOutlineSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { useRelativeTime } from "@/components/school-admin/garden/kit";
import type { FlowReadiness, ReadinessItem } from "./flowReadiness";

/* ------------------------------------------------------------------ */
/* Status pill (toolbar, left of the actions)                          */
/* ------------------------------------------------------------------ */

/** "● Draft · Saved just now" / "● Live · Unsaved changes". */
export function FlowStatusPill({
  isPublished,
  dirty,
  saving,
  savedAt,
}: {
  isPublished: boolean;
  dirty: boolean;
  saving: boolean;
  savedAt: number | null;
}) {
  const saved = useRelativeTime(savedAt ?? 0);
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <GChip tone={isPublished ? "success" : "neutral"}>● {isPublished ? "Live" : "Draft"}</GChip>
      <span
        className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[var(--sf-soft)]"
        aria-live="polite"
      >
        {saving ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Saving…
          </>
        ) : dirty ? (
          <>
            <span aria-hidden className="h-2 w-2 rounded-full bg-[#d9a400]" />
            Unsaved changes
          </>
        ) : savedAt ? (
          <>
            <Check className="h-3.5 w-3.5 text-[var(--sf-forest)]" aria-hidden />
            Saved {saved}
          </>
        ) : (
          "All changes saved"
        )}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Readiness list                                                      */
/* ------------------------------------------------------------------ */

function ItemIcon({ status }: { status: ReadinessItem["status"] }) {
  if (status === "done") {
    return (
      <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--sf-forest)] text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === "warning") {
    return (
      <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--sf-butter)] text-[#6b4f00]">
        <AlertTriangle className="h-3 w-3" />
      </span>
    );
  }
  return (
    <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#b4412f]/50 bg-[#fdf0ec] text-[#9a3422]">
      <Circle className="h-2 w-2 fill-current" />
    </span>
  );
}

function ReadinessList({
  readiness,
  onSelect,
}: {
  readiness: FlowReadiness;
  onSelect?: (item: ReadinessItem) => void;
}) {
  // Problems first, then warnings, then what's done.
  const order = { todo: 0, warning: 1, done: 2 } as const;
  const items = [...readiness.items].sort((a, b) => order[a.status] - order[b.status]);
  return (
    <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
      {items.map((item) => {
        const clickable = Boolean(onSelect && (item.target || item.checklistItemId));
        const body = (
          <>
            <ItemIcon status={item.status} />
            <span className="min-w-0 flex-1">
              <span
                className={`block text-[13.5px] font-extrabold leading-snug ${
                  item.status === "done" ? "text-[var(--sf-ink)]/70" : "text-[var(--sf-ink)]"
                }`}
              >
                {item.label}
              </span>
              {item.detail ? (
                <span className="block text-[12px] font-semibold leading-snug text-[var(--sf-soft)]">{item.detail}</span>
              ) : null}
            </span>
            {clickable ? (
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-ink)]/30 transition-transform group-hover:translate-x-0.5" aria-hidden />
            ) : null}
          </>
        );
        return (
          <li key={item.id}>
            {clickable ? (
              <button
                type="button"
                onClick={() => onSelect?.(item)}
                className={`group flex w-full items-start gap-2.5 rounded-[12px] px-2 py-2 text-left transition-colors hover:bg-[var(--sf-accent-wash)] ${G_FOCUS} focus-visible:ring-inset`}
                data-readiness-item={item.id}
              >
                {body}
              </button>
            ) : (
              <div className="flex items-start gap-2.5 px-2 py-2">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Rail (xl and up) + popover (below xl)                               */
/* ------------------------------------------------------------------ */

type RailProps = {
  readiness: FlowReadiness;
  isPublished: boolean;
  kindLabel: string;
  publicUrl?: string | null;
  onSelect?: (item: ReadinessItem) => void;
  onPreview?: () => void;
  onCopyLink?: () => void;
  footer?: ReactNode;
};

function RailBody({ readiness, isPublished, kindLabel, publicUrl, onSelect, onPreview, onCopyLink, footer }: RailProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);
  const done = readiness.items.filter((item) => item.status !== "todo").length;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <GKicker>{isPublished ? "Live" : "Before you publish"}</GKicker>
        <h2 className="sf-display m-0 mt-1 text-[1.25rem] leading-[1.1] text-[var(--sf-ink)]">
          {isPublished
            ? readiness.ready
              ? `This ${kindLabel} is live`
              : `${readiness.blocking} thing${readiness.blocking === 1 ? "" : "s"} to fix`
            : readiness.ready
              ? "Ready to publish"
              : "Ready to publish?"}
        </h2>
        <div className="mt-3 flex items-center gap-2.5">
          <GProgress
            value={done}
            total={readiness.items.length}
            label="Publish checklist"
            done={readiness.ready}
          />
          <span className="shrink-0 text-[12.5px] font-extrabold tabular-nums text-[var(--sf-ink)]/70">
            {done}/{readiness.items.length}
          </span>
        </div>
      </div>

      <ReadinessList readiness={readiness} onSelect={onSelect} />

      {onPreview || onCopyLink ? (
        <div className="flex flex-wrap gap-2 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-3">
          {onPreview ? (
            <button type="button" onClick={onPreview} className={`${gBtnOutlineSm} !px-3 !py-2 !text-[13px]`}>
              <Eye className="h-4 w-4" aria-hidden />
              Preview
            </button>
          ) : null}
          {onCopyLink ? (
            <button
              type="button"
              onClick={() => {
                onCopyLink();
                setCopied(true);
                if (timer.current) window.clearTimeout(timer.current);
                timer.current = window.setTimeout(() => setCopied(false), 2000);
              }}
              disabled={!publicUrl}
              title={publicUrl ? undefined : "Publish first"}
              className={`${gBtnOutlineSm} !px-3 !py-2 !text-[13px]`}
            >
              {copied ? <Check className="h-4 w-4 text-[var(--sf-forest)]" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
              {copied ? "Link copied" : "Copy apply link"}
            </button>
          ) : null}
        </div>
      ) : null}

      {isPublished && publicUrl ? (
        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className={`${gLinkSm} !text-[13px]`}>
          Open the family page
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      ) : null}
      {footer}
    </div>
  );
}

/** Right-hand readiness rail for the builders (xl and up). */
export function FlowReadinessRail(props: RailProps) {
  return (
    <aside
      aria-label="Publish checklist"
      className="hidden w-[300px] shrink-0 overflow-y-auto border-l-[1.5px] border-dashed border-[var(--sf-ink)]/14 bg-[#fffdf8] p-4 xl:block"
      data-testid="flow-readiness-rail"
    >
      <RailBody {...props} />
    </aside>
  );
}

/** Toolbar chip that opens the readiness list below xl. */
export function FlowReadinessPopover(props: RailProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const { readiness } = props;
  return (
    <div className="relative xl:hidden" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1.5 text-[12.5px] font-extrabold transition-colors ${
          readiness.ready
            ? "border-[var(--sf-forest)]/30 bg-[var(--sf-mint)] text-[var(--sf-forest)]"
            : "border-[#b4412f]/30 bg-[#fdf0ec] text-[#9a3422]"
        } ${G_FOCUS}`}
      >
        {readiness.ready ? <Check className="h-3.5 w-3.5" aria-hidden /> : <AlertTriangle className="h-3.5 w-3.5" aria-hidden />}
        {readiness.summary}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Publish checklist"
          data-garden-dialog
          className="absolute right-0 top-full z-40 mt-2 w-[min(92vw,340px)] rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-4 shadow-[0_6px_0_0_rgba(43,36,29,0.08),0_24px_48px_-24px_rgba(43,36,29,0.45)]"
        >
          <RailBody
            {...props}
            onSelect={
              props.onSelect
                ? (item) => {
                    setOpen(false);
                    props.onSelect?.(item);
                  }
                : undefined
            }
          />
        </div>
      ) : null}
    </div>
  );
}
