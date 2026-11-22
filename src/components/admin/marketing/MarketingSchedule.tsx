"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { getMarketingCarousel } from "@/components/admin/marketing/carousels/registry";
import { MarketingSlideShell, SLIDE_HEIGHT, SLIDE_WIDTH } from "@/components/admin/marketing/slide-frame";
import { adminStatusBadgeClassName, type AdminStatusVariant } from "@/lib/admin-ui/admin-status-styles";
import type { SchedulePostStatus } from "@/lib/marketing/schedule-post-status";
import {
  SCHEDULE_AD_OPTIONS,
  SCHEDULE_ITEMS,
  SCHEDULE_RHYTHM,
  SCHEDULE_SPARES,
  SCHEDULE_STATUSES,
  SOCIAL_SCHEDULE,
  type ScheduleAdOption,
  type ScheduleItem,
  type ScheduleStatus,
  type ScheduleWeek,
} from "@/lib/marketing/social-schedule";

/** Anything with a status row: an organic post or a paid ad option. */
type Schedulable = { id: string; label: string; carouselId: ScheduleItem["carouselId"]; slideId?: string };

const STATUS_LABEL: Record<ScheduleStatus, string> = { planned: "Planned", scheduled: "Scheduled", posted: "Posted" };
const STATUS_VARIANT: Record<ScheduleStatus, AdminStatusVariant> = { planned: "neutral", scheduled: "scheduled", posted: "success" };

const PILLAR_STYLE: Record<ScheduleItem["pillar"], string> = {
  Laugh: "bg-amber-50 text-amber-800 border-amber-200",
  Talk: "bg-sky-50 text-sky-800 border-sky-200",
  Show: "bg-violet-50 text-violet-800 border-violet-200",
  Teach: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Prove: "bg-rose-50 text-rose-800 border-rose-200",
  Brand: "bg-stone-100 text-stone-700 border-stone-200",
};

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-23" → "Mon Nov 23" without time-zone drift. */
function dayLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return { weekday: WEEKDAY[date.getDay()], date: `${MONTH[m - 1]} ${d}` };
}

function localToday() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function studioHref(item: Pick<Schedulable, "carouselId" | "slideId">) {
  const params = new URLSearchParams({ carousel: item.carouselId });
  if (item.slideId) params.set("slide", item.slideId);
  return `/admin/marketing?${params.toString()}`;
}

export default function MarketingSchedule() {
  const [statuses, setStatuses] = useState<Record<string, ScheduleStatus>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const inFlightRef = useRef(new Set<string>());
  const [savingIds, setSavingIds] = useState<Set<string>>(() => new Set());
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [today, setToday] = useState<string | null>(null);

  const syncSavingIds = useCallback(() => {
    setSavingIds(new Set(inFlightRef.current));
  }, []);

  useEffect(() => {
    setToday(localToday());
  }, []);

  const loadStatuses = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/admin/marketing-schedule/status");
      const payload = (await response.json().catch(() => null)) as { statuses?: Record<string, SchedulePostStatus>; error?: string } | null;
      if (!response.ok) throw new Error(payload?.error ?? "Could not load post statuses.");
      const next: Record<string, ScheduleStatus> = {};
      for (const [id, value] of Object.entries(payload?.statuses ?? {})) next[id] = value.status;
      setStatuses(next);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load post statuses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatuses();
  }, [loadStatuses]);

  const statusOf = useCallback((id: string): ScheduleStatus => statuses[id] ?? "planned", [statuses]);

  const setStatus = useCallback(
    async (item: Schedulable, status: ScheduleStatus) => {
      const previous = statuses[item.id] ?? "planned";
      if (previous === status) return;
      if (inFlightRef.current.has(item.id)) return;
      inFlightRef.current.add(item.id);
      syncSavingIds();
      setRowErrors((current) => ({ ...current, [item.id]: "" }));
      setStatuses((current) => ({ ...current, [item.id]: status }));
      try {
        const response = await fetch(`/api/admin/marketing-schedule/${encodeURIComponent(item.id)}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Could not save the status.");
        }
      } catch (error) {
        setStatuses((current) => ({ ...current, [item.id]: previous }));
        setRowErrors((current) => ({
          ...current,
          [item.id]: `${error instanceof Error ? error.message : "Could not save the status."} Try again.`,
        }));
      } finally {
        inFlightRef.current.delete(item.id);
        syncSavingIds();
      }
    },
    [statuses, syncSavingIds],
  );

  const counts = useMemo(() => {
    const result: Record<ScheduleStatus, number> = { planned: 0, scheduled: 0, posted: 0 };
    for (const item of [...SCHEDULE_ITEMS, ...SCHEDULE_AD_OPTIONS]) result[statusOf(item.id)] += 1;
    return result;
  }, [statusOf]);

  const currentWeek = useMemo(() => {
    if (!today) return null;
    return SOCIAL_SCHEDULE.find((week) => today >= week.start && today <= addDays(week.start, 6)) ?? null;
  }, [today]);
  const jumpTarget = currentWeek ?? (today ? SOCIAL_SCHEDULE.find((week) => week.start >= today) : null) ?? SOCIAL_SCHEDULE[0];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-admin-text">Posting schedule · Nov 23 – Jan 3 · ads Nov 21 – Jan 30</h1>
            <p className="mt-1 text-sm text-admin-muted">{SCHEDULE_RHYTHM}</p>
            <p className="mt-0.5 text-xs text-admin-faint">
              Times are the audience&apos;s local time. Captions are ready to paste. Free-preview ad options: several per day, pick any.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SCHEDULE_STATUSES.map((status) => (
              <span key={status} className={`inline-flex items-center gap-1.5 rounded-admin-md border px-2.5 py-1 text-xs font-medium ${adminStatusBadgeClassName(STATUS_VARIANT[status])}`}>
                {STATUS_LABEL[status]}
                <span className="font-semibold">{loading ? "–" : counts[status]}</span>
              </span>
            ))}
            <a
              href={`#${jumpTarget.id}`}
              className="rounded-admin-md border border-admin-border bg-admin-surface px-3 py-1.5 text-sm font-medium text-admin-text hover:border-admin-border-strong"
            >
              {currentWeek ? "This week" : "Next week"}
            </a>
          </div>
        </header>

        {loadError ? (
          <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-admin-md border border-admin-error-border bg-admin-error-bg px-4 py-2 text-sm text-admin-error">
            <span>{loadError} The schedule still works; statuses show as Planned until this loads.</span>
            <button type="button" onClick={() => void loadStatuses()} className="font-medium underline">
              Retry
            </button>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-8">
          {SOCIAL_SCHEDULE.map((week) => (
            <WeekSection
              key={week.id}
              week={week}
              isCurrent={currentWeek?.id === week.id}
              today={today}
              statusOf={statusOf}
              savingIds={savingIds}
              rowErrors={rowErrors}
              onStatus={setStatus}
            />
          ))}
        </div>

        <p className="mt-8 rounded-admin-md border border-admin-border bg-admin-surface px-4 py-3 text-sm text-admin-muted">
          <span className="font-medium text-admin-text">Spares</span> if a slot opens or a post underperforms: {SCHEDULE_SPARES}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- week

function WeekSection({
  week,
  isCurrent,
  today,
  statusOf,
  savingIds,
  rowErrors,
  onStatus,
}: {
  week: ScheduleWeek;
  isCurrent: boolean;
  today: string | null;
  statusOf: (id: string) => ScheduleStatus;
  savingIds: Set<string>;
  rowErrors: Record<string, string>;
  onStatus: (item: Schedulable, status: ScheduleStatus) => void;
}) {
  const posted = week.items.filter((item) => statusOf(item.id) === "posted").length;
  const adOptions = week.adOptions ?? [];
  const adsLive = adOptions.filter((item) => statusOf(item.id) === "posted").length;
  return (
    <section id={week.id} aria-labelledby={`${week.id}-title`} className="scroll-mt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={`${week.id}-title`} className="flex items-center gap-2 text-base font-semibold text-admin-text">
          {week.title}
          {isCurrent ? <span className="rounded-admin-sm bg-admin-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">This week</span> : null}
        </h2>
        <span className="text-xs text-admin-muted">
          {week.adOnly ? "Ads only" : `${posted} of ${week.items.length} posted`}
          {adOptions.length ? ` · ${adsLive} of ${adOptions.length} ads live` : ""}
        </span>
      </div>
      <p className="mt-1 text-sm text-admin-muted">{week.note}</p>

      <div className="mt-3 rounded-admin-md border border-admin-border bg-admin-canvas px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-admin-faint">
            Ads this week · <span className="normal-case tracking-normal text-admin-text">{week.ads.sets}</span>
          </p>
          <CopyButton text={week.ads.primaryText} label="Copy ad text" />
        </div>
        <p className="mt-1.5 text-sm text-admin-text">{week.ads.primaryText}</p>
        <p className="mt-1 text-xs text-admin-muted">
          Headline: <span className="font-medium text-admin-text">{week.ads.headline}</span>
        </p>
      </div>

      {adOptions.length ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-admin-faint">
            Free-preview ad options · <span className="normal-case tracking-normal text-admin-muted">pick any for the day; mark Posted once it&apos;s live</span>
          </p>
          <ol className="mt-2 flex flex-col gap-2">
            {adOptions.map((item) => (
              <AdOptionRow
                key={item.id}
                item={item}
                past={today != null && item.date < today}
                isToday={today === item.date}
                status={statusOf(item.id)}
                saving={savingIds.has(item.id)}
                error={rowErrors[item.id]}
                onStatus={onStatus}
              />
            ))}
          </ol>
        </div>
      ) : null}

      {week.items.length ? (
        <>
          {adOptions.length ? <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-admin-faint">Organic posts</p> : null}
          <ol className={`mt-3 flex flex-col gap-2 ${isCurrent ? "rounded-admin-md ring-2 ring-admin-accent/30 ring-offset-4 ring-offset-transparent" : ""}`}>
            {week.items.map((item) => (
              <ScheduleRow
                key={item.id}
                item={item}
                past={today != null && item.date < today}
                isToday={today === item.date}
                status={statusOf(item.id)}
                saving={savingIds.has(item.id)}
                error={rowErrors[item.id]}
                onStatus={onStatus}
              />
            ))}
          </ol>
        </>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------- row

function ScheduleRow({
  item,
  past,
  isToday,
  status,
  saving,
  error,
  onStatus,
}: {
  item: ScheduleItem;
  past: boolean;
  isToday: boolean;
  status: ScheduleStatus;
  saving: boolean;
  error?: string;
  onStatus: (item: Schedulable, status: ScheduleStatus) => void;
}) {
  const day = dayLabel(item.date);
  const dim = past && status !== "posted";
  return (
    <li
      className={`grid grid-cols-[88px_96px_minmax(0,1fr)] gap-4 rounded-admin-md border bg-admin-surface p-3 md:grid-cols-[88px_96px_minmax(0,1fr)_200px] ${
        isToday ? "border-admin-accent/50" : "border-admin-border"
      } ${past && status === "posted" ? "opacity-70" : ""}`}
    >
      <div className="flex flex-col">
        <span className={`text-xs font-semibold uppercase tracking-wide ${isToday ? "text-admin-accent" : "text-admin-faint"}`}>{isToday ? "Today" : day.weekday}</span>
        <span className="text-sm font-semibold text-admin-text">{day.date}</span>
        <span className="mt-1 text-xs text-admin-muted">{item.time}</span>
      </div>

      <Thumbnail item={item} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`rounded-admin-sm border px-1.5 py-0.5 text-[11px] font-medium ${PILLAR_STYLE[item.pillar]}`}>{item.pillar}</span>
          {item.platforms.map((platform) => (
            <span key={platform} className="rounded-admin-sm border border-admin-border bg-admin-canvas px-1.5 py-0.5 text-[11px] text-admin-muted">
              {platform}
            </span>
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-sm font-medium text-admin-text">{item.label}</p>
          <Link href={studioHref(item)} className="inline-flex items-center gap-1 text-xs font-medium text-admin-accent hover:underline">
            Open in Studio <ExternalLink className="h-3 w-3" aria-hidden />
          </Link>
        </div>
        <div className="mt-2 flex items-start gap-2">
          <p className={`min-w-0 flex-1 whitespace-pre-line text-sm leading-snug ${dim ? "text-admin-muted" : "text-admin-text"}`}>{item.caption}</p>
          <CopyButton text={item.caption} label="Copy caption" />
        </div>
      </div>

      <StatusControl item={item} status={status} saving={saving} error={error} onStatus={onStatus} />
    </li>
  );
}

function StatusControl({
  item,
  status,
  saving,
  error,
  onStatus,
}: {
  item: Schedulable;
  status: ScheduleStatus;
  saving: boolean;
  error?: string;
  onStatus: (item: Schedulable, status: ScheduleStatus) => void;
}) {
  return (
    <div className="col-span-3 flex flex-col gap-1 md:col-span-1 md:items-end">
      <div role="radiogroup" aria-label={`Status for ${item.label}`} className="inline-flex rounded-admin-md border border-admin-border bg-admin-canvas p-0.5">
        {SCHEDULE_STATUSES.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={status === option}
            disabled={saving}
            onClick={() => onStatus(item, option)}
            className={`rounded-admin-md px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-wait ${
              status === option ? `border ${adminStatusBadgeClassName(STATUS_VARIANT[option])}` : "border border-transparent text-admin-muted hover:text-admin-text"
            }`}
          >
            {STATUS_LABEL[option]}
          </button>
        ))}
      </div>
      {saving ? (
        <span className="inline-flex items-center gap-1 text-[11px] text-admin-muted">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> Saving…
        </span>
      ) : null}
      {error ? (
        <span role="alert" className="text-[11px] text-admin-error md:text-right">
          {error}
        </span>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- ad option row

function AdOptionRow({
  item,
  past,
  isToday,
  status,
  saving,
  error,
  onStatus,
}: {
  item: ScheduleAdOption;
  past: boolean;
  isToday: boolean;
  status: ScheduleStatus;
  saving: boolean;
  error?: string;
  onStatus: (item: Schedulable, status: ScheduleStatus) => void;
}) {
  const day = dayLabel(item.date);
  const dim = past && status !== "posted";
  const carousel = getMarketingCarousel(item.carouselId);
  const slide = (item.slideId ? carousel?.slides.find((s) => s.id === item.slideId) : undefined) ?? carousel?.slides[0];
  const copy = slide?.adCopy;
  return (
    <li
      className={`grid grid-cols-[88px_96px_minmax(0,1fr)] gap-4 rounded-admin-md border bg-admin-surface p-3 md:grid-cols-[88px_96px_minmax(0,1fr)_200px] ${
        isToday ? "border-admin-accent/50" : "border-admin-border"
      } ${past && status === "posted" ? "opacity-70" : ""}`}
    >
      <div className="flex flex-col">
        <span className={`text-xs font-semibold uppercase tracking-wide ${isToday ? "text-admin-accent" : "text-admin-faint"}`}>{isToday ? "Today" : day.weekday}</span>
        <span className="text-sm font-semibold text-admin-text">{day.date}</span>
        <span className="mt-1 text-xs text-admin-muted">{item.runs}</span>
      </div>

      <Thumbnail item={item} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-admin-sm border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[11px] font-medium text-orange-800">Paid ad</span>
          <span className="rounded-admin-sm border border-admin-border bg-admin-canvas px-1.5 py-0.5 text-[11px] text-admin-muted">Meta · Instagram + Facebook</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-sm font-medium text-admin-text">{item.label}</p>
          <Link href={studioHref(item)} className="inline-flex items-center gap-1 text-xs font-medium text-admin-accent hover:underline">
            Open in Studio <ExternalLink className="h-3 w-3" aria-hidden />
          </Link>
        </div>
        {copy ? (
          <>
            <div className="mt-2 flex items-start gap-2">
              <p className={`min-w-0 flex-1 whitespace-pre-line text-sm leading-snug ${dim ? "text-admin-muted" : "text-admin-text"}`}>{copy.primaryText}</p>
              <CopyButton text={copy.primaryText} label="Copy primary text" />
            </div>
            <div className="mt-1.5 flex items-start gap-2">
              <p className="min-w-0 flex-1 text-xs text-admin-muted">
                Headline: <span className="font-medium text-admin-text">{copy.headline}</span>
                {copy.description ? <> · Description: <span className="text-admin-text">{copy.description}</span></> : null}
              </p>
              <CopyButton text={copy.headline} label="Copy headline" />
            </div>
            {slide?.adCopyVariants?.length ? (
              <Link href={studioHref(item)} className="mt-1.5 inline-block text-xs text-admin-muted hover:text-admin-accent hover:underline">
                +{slide.adCopyVariants.length} more caption {slide.adCopyVariants.length === 1 ? "version" : "versions"} in Studio
              </Link>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-sm text-admin-muted">Ad copy is in the Studio.</p>
        )}
      </div>

      <StatusControl item={item} status={status} saving={saving} error={error} onStatus={onStatus} />
    </li>
  );
}

// ---------------------------------------------------------------- copy

function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 1800);
    return () => window.clearTimeout(timer);
  }, [state]);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        if (!navigator.clipboard) {
          setState("failed");
          return;
        }
        navigator.clipboard.writeText(text).then(
          () => setState("copied"),
          () => setState("failed"),
        );
      }}
      className={`inline-flex shrink-0 items-center gap-1 rounded-admin-md border px-2 py-1 text-[11px] font-medium ${
        state === "failed" ? "border-admin-error-border text-admin-error" : "border-admin-border text-admin-accent hover:border-admin-border-strong"
      }`}
    >
      {state === "copied" ? <Check className="h-3 w-3" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
      {state === "copied" ? "Copied" : state === "failed" ? "Copy failed, select the text" : "Copy"}
    </button>
  );
}

// ---------------------------------------------------------------- thumbnail

const THUMB_WIDTH = 96;
const THUMB_SCALE = THUMB_WIDTH / SLIDE_WIDTH;
const THUMB_HEIGHT = Math.round(SLIDE_HEIGHT * THUMB_SCALE);

/** The real slide, rendered small and only once it scrolls near the viewport. */
function Thumbnail({ item }: { item: Schedulable }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const carousel = getMarketingCarousel(item.carouselId);
  const slide = (item.slideId ? carousel?.slides.find((s) => s.id === item.slideId) : undefined) ?? carousel?.slides[0];

  return (
    <Link
      ref={ref}
      href={studioHref(item)}
      aria-label={`Open ${item.label} in the Studio`}
      className="relative block overflow-hidden rounded-admin-sm border border-admin-border bg-admin-canvas"
      style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
    >
      {visible && slide ? (
        <div aria-hidden className="pointer-events-none" style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, transform: `scale(${THUMB_SCALE})`, transformOrigin: "top left" }}>
          <MarketingSlideShell>{slide.render()}</MarketingSlideShell>
        </div>
      ) : null}
      {!item.slideId ? (
        <span className="absolute bottom-1 right-1 rounded-admin-sm bg-black/60 px-1 text-[9px] font-semibold uppercase tracking-wide text-white">
          {carousel?.slides.length ?? 0} slides
        </span>
      ) : null}
    </Link>
  );
}
