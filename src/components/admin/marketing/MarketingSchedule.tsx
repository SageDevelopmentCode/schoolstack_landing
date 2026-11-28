"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Megaphone } from "lucide-react";
import { GChip, gBtnOutlineSm, gLinkSm } from "@/components/school-parent/garden/ui";
import {
  AdminGardenPage,
  GardenNotice,
  GardenStatTiles,
  type GardenStat,
} from "@/components/school-admin/garden/kit";
import { getMarketingCarousel } from "@/components/admin/marketing/carousels/registry";
import { MUDKITCHEN_ADMIN_GARDEN_THEME as THEME } from "@/components/admin/garden/theme";
import {
  SCHEDULE_RHYTHM,
  SCHEDULE_SPARES,
  SCHEDULE_STATUSES,
  type ScheduleAdOption,
  type ScheduleItem,
  type ScheduleStatus,
  type ScheduleWeek,
} from "@/lib/marketing/social-schedule";
import { MarketingGardenHeader } from "@/components/admin/marketing/garden/MarketingGardenHeader";
import {
  CopyChip,
  MetaChip,
  PillarChip,
  SCHEDULE_STATUS_LABEL,
  SlideThumb,
  StatusSegmented,
  studioHref,
} from "@/components/admin/marketing/garden/marketing-ui";
import {
  useMarketingScheduleModel,
  type Schedulable,
  type ScheduleFilter,
} from "@/components/admin/marketing/useMarketingScheduleModel";

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-23" → "Mon Nov 23" without time-zone drift. */
function dayLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return { weekday: WEEKDAY[date.getDay()], date: `${MONTH[m - 1]} ${d}` };
}

const STAT_ACCENT: Record<ScheduleStatus, GardenStat["accent"]> = { planned: "gold", scheduled: "sky", posted: "forest" };

/** /admin/marketing/schedule: the posting plan, one week per card, with a status per post. */
export default function MarketingSchedule() {
  const model = useMarketingScheduleModel();
  const statusLine = model.loaded
    ? [
        model.thisWeekPlanned != null ? `${model.thisWeekPlanned} still planned this week` : null,
        `${model.counts.posted} of ${model.total} posted`,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Nov 23 – Jan 3 · ads Nov 21 – Jan 30";

  const toggleFilter = (status: ScheduleStatus) =>
    model.setFilter((current: ScheduleFilter) => (current === status ? "all" : status));

  return (
    <AdminGardenPage theme={THEME} data-testid="marketing-schedule">
      <MarketingGardenHeader
        title={
          <>
            Posting <span className="text-[var(--sf-clay)]">schedule</span>
          </>
        }
        subtitle={statusLine}
        refresh={{
          onRefresh: model.refresh,
          refreshing: model.refreshing || (model.loading && !model.loaded),
          lastUpdatedAt: model.lastUpdatedAt,
          label: "Refresh post statuses",
        }}
        actions={
          <a href={`#${model.jumpTarget.id}`} className={gBtnOutlineSm}>
            <CalendarDays className="h-4 w-4" aria-hidden />
            {model.currentWeek ? "Jump to this week" : "Jump to next week"}
          </a>
        }
      />

      {model.loadError ? (
        <GardenNotice
          tone="warning"
          role="alert"
          title="Couldn't load post statuses."
          action={
            <button type="button" className={gBtnOutlineSm} onClick={model.retryLoad} disabled={model.loading}>
              {model.loading ? "Trying again…" : "Try again"}
            </button>
          }
        >
          {model.loadError} The schedule still works; statuses show as Planned until this loads.
        </GardenNotice>
      ) : null}

      <GardenStatTiles
        layout="strip"
        ariaLabel="Posts by status"
        stats={SCHEDULE_STATUSES.map((status) => ({
          id: status,
          label: SCHEDULE_STATUS_LABEL[status],
          value: model.loaded ? model.counts[status] : "–",
          accent: STAT_ACCENT[status],
          onClick: () => toggleFilter(status),
          active: model.filter === status,
          hint: model.filter === status ? "Showing only these · click to show all" : undefined,
          testId: `marketing-schedule-stat-${status}`,
        }))}
      />

      <GardenNotice tone="info" title={SCHEDULE_RHYTHM}>
        Times are the audience&apos;s local time. Captions are ready to paste. Free-preview ad options: several per day, pick any.
      </GardenNotice>

      {model.weeks.length === 0 ? (
        <div className="rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
          No posts match this filter.{" "}
          <button type="button" className={gLinkSm} onClick={() => model.setFilter("all")}>
            Show everything
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {model.weeks.map(({ week, items, adOptions }) => (
            <WeekCard
              key={week.id}
              week={week}
              items={items}
              adOptions={adOptions}
              isCurrent={model.currentWeek?.id === week.id}
              today={model.today}
              statusOf={model.statusOf}
              savingIds={model.savingIds}
              flashId={model.flashId}
              onStatus={model.setStatus}
            />
          ))}
        </div>
      )}

      <GardenNotice tone="warning" title="Spares">
        If a slot opens or a post underperforms: {SCHEDULE_SPARES}
      </GardenNotice>
    </AdminGardenPage>
  );
}

// ---------------------------------------------------------------- week

function WeekCard({
  week,
  items,
  adOptions,
  isCurrent,
  today,
  statusOf,
  savingIds,
  flashId,
  onStatus,
}: {
  week: ScheduleWeek;
  items: ScheduleItem[];
  adOptions: ScheduleAdOption[];
  isCurrent: boolean;
  today: string | null;
  statusOf: (id: string) => ScheduleStatus;
  savingIds: Set<string>;
  flashId: string | null;
  onStatus: (item: Schedulable, status: ScheduleStatus) => void;
}) {
  const posted = week.items.filter((item) => statusOf(item.id) === "posted").length;
  const allAds = week.adOptions ?? [];
  const adsLive = allAds.filter((item) => statusOf(item.id) === "posted").length;
  return (
    <section
      id={week.id}
      aria-labelledby={`${week.id}-title`}
      className={`scroll-mt-6 rounded-[24px] border-[1.5px] bg-white p-4 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:p-5 ${
        isCurrent ? "border-[var(--sf-clay)]/50 ring-4 ring-[var(--sf-clay)]/10" : "border-[var(--sf-ink)]/12"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 id={`${week.id}-title`} className="sf-display m-0 flex flex-wrap items-center gap-2 text-[1.3rem] leading-[1.1] text-[var(--sf-ink)]">
            {week.title}
            {isCurrent ? <GChip tone="alert">This week</GChip> : null}
          </h2>
          <p className="m-0 mt-1.5 max-w-3xl text-[13.5px] font-semibold leading-snug text-[var(--sf-soft)]">{week.note}</p>
        </div>
        <span className="shrink-0 text-[12.5px] font-extrabold tabular-nums text-[var(--sf-soft)]">
          {week.adOnly ? "Ads only" : `${posted} of ${week.items.length} posted`}
          {allAds.length ? ` · ${adsLive} of ${allAds.length} ads live` : ""}
        </span>
      </div>

      <div className="mt-4 rounded-[16px] border-[1.5px] border-[var(--sf-clay)]/15 bg-[var(--sf-peach)]/45 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="m-0 flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-clay-deep)]">
            <Megaphone className="h-3.5 w-3.5" aria-hidden />
            Ads this week
            <span className="normal-case tracking-normal text-[var(--sf-ink)]">· {week.ads.sets}</span>
          </p>
          <CopyChip text={week.ads.primaryText} label="Copy ad text" what="Ad text" />
        </div>
        <p className="m-0 mt-1.5 text-[14px] font-semibold leading-snug text-[var(--sf-ink)]">{week.ads.primaryText}</p>
        <p className="m-0 mt-1 text-[12.5px] font-semibold text-[var(--sf-soft)]">
          Headline: <span className="font-extrabold text-[var(--sf-ink)]">{week.ads.headline}</span>
        </p>
      </div>

      {adOptions.length ? (
        <div className="mt-5">
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
            Free-preview ad options{" "}
            <span className="normal-case tracking-normal">· pick any for the day; mark Posted once it&apos;s live</span>
          </p>
          <ol className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
            {adOptions.map((item) => (
              <AdOptionRow
                key={item.id}
                item={item}
                past={today != null && item.date < today}
                isToday={today === item.date}
                status={statusOf(item.id)}
                saving={savingIds.has(item.id)}
                flashed={flashId === item.id}
                onStatus={onStatus}
              />
            ))}
          </ol>
        </div>
      ) : null}

      {items.length ? (
        <div className="mt-5">
          {adOptions.length ? (
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">Organic posts</p>
          ) : null}
          <ol className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
            {items.map((item) => (
              <ScheduleRow
                key={item.id}
                item={item}
                past={today != null && item.date < today}
                isToday={today === item.date}
                status={statusOf(item.id)}
                saving={savingIds.has(item.id)}
                flashed={flashId === item.id}
                onStatus={onStatus}
              />
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------- rows

function rowClass(isToday: boolean, flashed: boolean, dimmed: boolean) {
  return `grid grid-cols-[72px_80px_minmax(0,1fr)] gap-3 rounded-[16px] border-[1.5px] p-3 transition-colors duration-300 sm:grid-cols-[84px_96px_minmax(0,1fr)] sm:gap-4 md:grid-cols-[84px_96px_minmax(0,1fr)_auto] ${
    flashed
      ? "border-[var(--sf-forest)]/35 bg-[var(--sf-mint)]"
      : isToday
        ? "border-[var(--sf-clay)]/45 bg-[var(--sf-accent-wash)]"
        : "border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]"
  } ${dimmed ? "opacity-70" : ""}`;
}

function DateCell({ iso, isToday, sub }: { iso: string; isToday: boolean; sub: string }) {
  const day = dayLabel(iso);
  return (
    <div className="flex flex-col">
      <span
        className={`text-[11px] font-extrabold uppercase tracking-[0.14em] ${
          isToday ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-soft)]"
        }`}
      >
        {isToday ? "Today" : day.weekday}
      </span>
      <span className="text-[15px] font-extrabold tabular-nums text-[var(--sf-ink)]">{day.date}</span>
      <span className="mt-1 text-[12px] font-semibold text-[var(--sf-soft)]">{sub}</span>
    </div>
  );
}

function OpenInStudio({ item }: { item: Schedulable }) {
  return (
    <Link href={studioHref(item)} className={`${gLinkSm} !text-[13px]`}>
      Open in Studio <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}

function ScheduleRow({
  item,
  past,
  isToday,
  status,
  saving,
  flashed,
  onStatus,
}: {
  item: ScheduleItem;
  past: boolean;
  isToday: boolean;
  status: ScheduleStatus;
  saving: boolean;
  flashed: boolean;
  onStatus: (item: Schedulable, status: ScheduleStatus) => void;
}) {
  const dim = past && status !== "posted";
  return (
    <li className={rowClass(isToday, flashed, past && status === "posted")} data-testid={`marketing-schedule-row-${item.id}`}>
      <DateCell iso={item.date} isToday={isToday} sub={item.time} />
      <SlideThumb carouselId={item.carouselId} slideId={item.slideId} label={item.label} href={studioHref(item)} width={80} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <PillarChip pillar={item.pillar} />
          {item.platforms.map((platform) => (
            <MetaChip key={platform}>{platform}</MetaChip>
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="m-0 text-[14.5px] font-extrabold text-[var(--sf-ink)]">{item.label}</p>
          <OpenInStudio item={item} />
        </div>
        <div className="mt-2 flex items-start gap-2">
          <p
            className={`m-0 min-w-0 flex-1 whitespace-pre-line text-[13.5px] font-semibold leading-snug ${
              dim ? "text-[var(--sf-soft)]" : "text-[var(--sf-ink)]/85"
            }`}
          >
            {item.caption}
          </p>
          <CopyChip text={item.caption} what="Caption" ariaLabel="Copy caption" />
        </div>
      </div>
      <div className="col-span-3 md:col-span-1">
        <StatusSegmented
          itemLabel={item.label}
          statuses={SCHEDULE_STATUSES}
          value={status}
          saving={saving}
          onChange={(next) => onStatus(item, next)}
        />
      </div>
    </li>
  );
}

function AdOptionRow({
  item,
  past,
  isToday,
  status,
  saving,
  flashed,
  onStatus,
}: {
  item: ScheduleAdOption;
  past: boolean;
  isToday: boolean;
  status: ScheduleStatus;
  saving: boolean;
  flashed: boolean;
  onStatus: (item: Schedulable, status: ScheduleStatus) => void;
}) {
  const dim = past && status !== "posted";
  const carousel = getMarketingCarousel(item.carouselId);
  const slide = (item.slideId ? carousel?.slides.find((s) => s.id === item.slideId) : undefined) ?? carousel?.slides[0];
  const copy = slide?.adCopy;
  return (
    <li className={rowClass(isToday, flashed, past && status === "posted")} data-testid={`marketing-schedule-row-${item.id}`}>
      <DateCell iso={item.date} isToday={isToday} sub={item.runs} />
      <SlideThumb carouselId={item.carouselId} slideId={item.slideId} label={item.label} href={studioHref(item)} width={80} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <GChip tone="alert">Paid ad</GChip>
          <MetaChip>Meta · Instagram + Facebook</MetaChip>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="m-0 text-[14.5px] font-extrabold text-[var(--sf-ink)]">{item.label}</p>
          <OpenInStudio item={item} />
        </div>
        {copy ? (
          <>
            <div className="mt-2 flex items-start gap-2">
              <p
                className={`m-0 min-w-0 flex-1 whitespace-pre-line text-[13.5px] font-semibold leading-snug ${
                  dim ? "text-[var(--sf-soft)]" : "text-[var(--sf-ink)]/85"
                }`}
              >
                {copy.primaryText}
              </p>
              <CopyChip text={copy.primaryText} what="Primary text" ariaLabel="Copy primary text" />
            </div>
            <div className="mt-1.5 flex items-start gap-2">
              <p className="m-0 min-w-0 flex-1 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                Headline: <span className="font-extrabold text-[var(--sf-ink)]">{copy.headline}</span>
                {copy.description ? (
                  <>
                    {" "}
                    · Description: <span className="text-[var(--sf-ink)]">{copy.description}</span>
                  </>
                ) : null}
              </p>
              <CopyChip text={copy.headline} what="Headline" ariaLabel="Copy headline" />
            </div>
            {slide?.adCopyVariants?.length ? (
              <Link href={studioHref(item)} className={`${gLinkSm} mt-1.5 !text-[12.5px]`}>
                +{slide.adCopyVariants.length} more caption {slide.adCopyVariants.length === 1 ? "version" : "versions"} in Studio
              </Link>
            ) : null}
          </>
        ) : (
          <p className="m-0 mt-2 text-[13.5px] font-semibold text-[var(--sf-soft)]">Ad copy is in the Studio.</p>
        )}
      </div>
      <div className="col-span-3 md:col-span-1">
        <StatusSegmented
          itemLabel={item.label}
          statuses={SCHEDULE_STATUSES}
          value={status}
          saving={saving}
          onChange={(next) => onStatus(item, next)}
        />
      </div>
    </li>
  );
}
