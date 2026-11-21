"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  FileText,
  Image as ImageIcon,
  Megaphone,
  MessageSquare,
  Newspaper,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GCard, GIcon, GKicker, GTabBar, G_FOCUS, SPRINGY, gLinkSm } from "@/components/school-parent/garden/ui";
import {
  DEMO_FEED_DAY_LABELS,
  type DemoFeedDay,
  type DemoFeedItem,
  type DemoFeedKind,
} from "@/data/school-demos/demo-feed-types";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";

/*
 * Demo-only Garden update feed shared by the parent "School feed" and the
 * teacher Feed (fixtures + local state, no backend): filters, day groups,
 * photo strips, note excerpts, and a CTA per update. Updates for tabs the
 * demo has call `onNavigate`; photos and announcements/newsletters open a
 * Garden dialog. Each page supplies its header copy, rail and fixtures.
 * Must render inside a `ParentThemeProvider` (the demo story providers).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FeedItem = DemoFeedItem<any>;

type FeedFilter = "all" | "photos" | "announcements" | "forms-events";

const FILTER_TABS: { key: FeedFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "photos", label: "Photos" },
  { key: "announcements", label: "Announcements" },
  { key: "forms-events", label: "Forms & events" },
];

const FILTER_KINDS: Record<FeedFilter, DemoFeedKind[] | null> = {
  all: null,
  photos: ["photos"],
  announcements: ["announcement", "newsletter"],
  "forms-events": ["form", "event"],
};

const DAY_ORDER: DemoFeedDay[] = ["today", "yesterday", "earlier"];

/** Pastel icon chip per kind (literal classes; tints match `ParentActivityNotificationRow`). */
const KIND_VISUALS: Record<DemoFeedKind, { Icon: LucideIcon; tint: string }> = {
  photos: { Icon: ImageIcon, tint: "!bg-[var(--sf-lav)]" },
  announcement: { Icon: Megaphone, tint: "!bg-[var(--sf-butter)]" },
  form: { Icon: FileText, tint: "!bg-[var(--sf-butter)]" },
  event: { Icon: CalendarDays, tint: "!bg-[var(--sf-sky)]" },
  newsletter: { Icon: Newspaper, tint: "!bg-[var(--sf-mint)]" },
  message: { Icon: MessageSquare, tint: "!bg-[var(--sf-lav)]" },
  hours: { Icon: Clock, tint: "!bg-[var(--sf-peach)]" },
  student: { Icon: UserPlus, tint: "!bg-[var(--sf-mint)]" },
};

/** Slight tilt on photos only (never on data). */
const THUMB_TILTS = [-3, 2, -1.5, 3];

type DialogKind = "photos" | "read";

function KindIcon({ kind, isNew }: { kind: DemoFeedKind; isNew: boolean }) {
  const { Icon, tint } = KIND_VISUALS[kind];
  return (
    <span className="relative shrink-0">
      <GIcon className={`!text-[var(--sf-ink)] [&_svg]:!text-[var(--sf-ink)] ${tint}`}>
        <Icon />
      </GIcon>
      {isNew ? (
        <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[var(--sf-clay)] ring-2 ring-white" />
      ) : null}
    </span>
  );
}

/** Fills GDialog's own icon circle with the kind's pastel (GDialog wraps `icon` in a GIcon). */
function DialogIconFill({ tint, children }: { tint: string; children: ReactNode }) {
  return (
    <span className={`flex h-full w-full items-center justify-center rounded-full [&_svg]:!text-[var(--sf-ink)] ${tint}`}>{children}</span>
  );
}

function PhotoStrip({ item, onOpen }: { item: FeedItem; onOpen: () => void }) {
  if (!item.photos) return null;
  const shown = item.photos.photos.slice(0, 4);
  const more = item.photos.total - shown.length;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${item.photos.total} photos from ${item.source}`}
      className={`group/strip grid w-full max-w-[22rem] grid-cols-5 items-center gap-2 rounded-[10px] p-1 sm:flex sm:w-fit sm:max-w-full sm:gap-3 ${G_FOCUS}`}
    >
      {shown.map((photo, i) => (
        <span
          key={photo.id}
          className={`sf-polaroid block w-full min-w-0 !p-1 !pb-2 sm:w-20 sm:shrink-0 ${SPRINGY} group-hover/strip:-translate-y-0.5`}
          style={{ rotate: `${THUMB_TILTS[i % THUMB_TILTS.length]}deg` }}
        >
          <span className="block aspect-square overflow-hidden rounded-[3px] bg-[var(--sf-lav)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt="" className="h-full w-full object-cover" loading="lazy" />
          </span>
        </span>
      ))}
      {more > 0 ? (
        <span className="flex aspect-square w-full min-w-0 items-center justify-center rounded-[8px] border-[1.5px] border-dashed border-[var(--sf-ink)]/25 bg-[var(--sf-paper)] sm:w-16 sm:shrink-0">
          <span className="sf-display text-[1.1rem] leading-none sm:text-[1.3rem] text-[var(--sf-ink)]/75">+{more}</span>
        </span>
      ) : null}
    </button>
  );
}

function FeedRow({
  item,
  isNew,
  onAction,
  testId,
}: {
  item: FeedItem;
  isNew: boolean;
  onAction: (item: FeedItem) => void;
  testId: string;
}) {
  return (
    <li>
      <article
        data-testid={`${testId}-item`}
        className={`rounded-[18px] border-[1.5px] p-3.5 sm:p-4 ${
          isNew ? "border-[var(--sf-clay)]/35 bg-[var(--sf-accent-wash)]" : "border-[var(--sf-ink)]/10 bg-white"
        }`}
      >
        <div className="flex items-start gap-3.5">
          <KindIcon kind={item.kind} isNew={isNew} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="m-0 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)] sm:text-[16px]">{item.title}</h3>
              {isNew ? (
                <span className="mt-0.5 shrink-0 rounded-full bg-[var(--sf-clay)] px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-white">
                  New
                </span>
              ) : null}
            </div>
            <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">
              {item.source} <span aria-hidden="true">·</span>{" "}
              <time dateTime={item.postedAt}>{item.whenLabel}</time>
            </p>
            <p className="m-0 mt-1.5 line-clamp-2 text-[14px] font-semibold leading-relaxed text-[var(--sf-ink)]/80 sm:line-clamp-1">
              {item.preview}
            </p>
          </div>
        </div>

        {/* Under the text column from `sm`; full row width on phones. */}
        <div className="mt-3 sm:pl-[3.625rem]">
          {item.kind === "photos" ? <PhotoStrip item={item} onOpen={() => onAction(item)} /> : null}

          {item.excerpt ? (
            <div className="relative mt-1 rounded-[10px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-3.5 pb-2.5 pt-3 shadow-[0_8px_16px_-14px_rgba(43,36,29,0.55)]">
              <span
                aria-hidden="true"
                className="absolute left-5 top-0 h-3 w-10 -translate-y-1/2 -rotate-2 rounded-sm bg-[var(--sf-butter)]/90"
              />
              <p className="m-0 line-clamp-3 text-[13.5px] font-semibold leading-[1.6] text-[var(--sf-ink)]/80">{item.excerpt}</p>
            </div>
          ) : null}

          <button type="button" onClick={() => onAction(item)} className={`${gLinkSm} group mt-3 first:mt-0`}>
            {item.ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        </div>
      </article>
    </li>
  );
}

function FeedList({
  items,
  newIds,
  onAction,
  testId,
}: {
  items: FeedItem[];
  newIds: Set<string>;
  onAction: (item: FeedItem) => void;
  testId: string;
}) {
  const groups = DAY_ORDER.map((day) => ({ day, items: items.filter((item) => item.day === day) })).filter(
    (group) => group.items.length > 0,
  );
  if (groups.length === 0) {
    return (
      <p className="m-0 rounded-[18px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 px-4 py-6 text-center text-[14px] font-semibold text-[var(--sf-soft)]">
        Nothing here this week.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <section key={group.day} aria-label={DEMO_FEED_DAY_LABELS[group.day]} className="flex flex-col gap-2.5">
          <GKicker>{DEMO_FEED_DAY_LABELS[group.day]}</GKicker>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {group.items.map((item) => (
              <FeedRow key={item.id} item={item} isNew={newIds.has(item.id)} onAction={onAction} testId={testId} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export type DemoGardenFeedProps<Tab extends string> = {
  items: DemoFeedItem<Tab>[];
  /** The newest N items get the "New" dot and chip. */
  newCount: number;
  header: { kicker?: ReactNode; title: ReactNode; subtitle?: ReactNode };
  onNavigate?: (tab: Tab) => void;
  /** Right-hand rail (the page's own "at a glance" / classrooms cards). */
  rail?: ReactNode;
  /** Prefix for the page, item, filter and dialog test ids. */
  testId: string;
};

export default function DemoGardenFeed<Tab extends string>({
  items,
  newCount,
  header,
  onNavigate,
  rail,
  testId,
}: DemoGardenFeedProps<Tab>) {
  const { theme } = useParentTheme();
  const reduce = useReducedMotion() === true;
  const newIds = useMemo(() => new Set(items.slice(0, newCount).map((item) => item.id)), [items, newCount]);

  const [filter, setFilter] = useState<FeedFilter>("all");
  const [active, setActive] = useState<FeedItem | null>(null);
  const [openDialog, setOpenDialog] = useState<DialogKind | null>(null);

  const kinds = FILTER_KINDS[filter];
  const visible = kinds ? items.filter((item) => kinds.includes(item.kind)) : items;

  const handleAction = (item: FeedItem) => {
    if (item.target.type === "tab") {
      onNavigate?.(item.target.tab as Tab);
      return;
    }
    setActive(item);
    setOpenDialog(item.target.type);
  };
  const closeDialog = () => setOpenDialog(null);

  const activeVisual = active ? KIND_VISUALS[active.kind] : null;

  return (
    <>
      <ParentGardenFrame theme={theme}>
        <div className={PORTAL_HOME_CONTAINER_CLASS} data-testid={`${testId}-page`}>
          <ParentGardenPageHeader kicker={header.kicker} title={header.title} subtitle={header.subtitle} />

          <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
            <GCard index={1} kicker="Newest first" title="Updates">
              <GTabBar
                items={FILTER_TABS}
                activeKey={filter}
                onChange={(key) => setFilter(key as FeedFilter)}
                ariaLabel="Filter updates"
                className="mb-5"
                data-testid={`${testId}-filter`}
              />
              <div role="tabpanel" aria-label={FILTER_TABS.find((tab) => tab.key === filter)?.label}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={filter}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 1 } : { opacity: 0, y: -6 }}
                    transition={{ duration: reduce ? 0 : 0.24, ease: PORTAL_EASE }}
                  >
                    <FeedList items={visible} newIds={newIds} onAction={handleAction} testId={testId} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </GCard>

            {rail ? <div className="flex flex-col gap-5">{rail}</div> : null}
          </div>
        </div>
      </ParentGardenFrame>

      <GDialog
        theme={theme}
        open={openDialog === "photos"}
        onClose={closeDialog}
        size="xl"
        title={active?.title ?? "Photos"}
        description={active ? `${active.source} · ${active.whenLong}` : undefined}
        icon={
          activeVisual ? (
            <DialogIconFill tint={KIND_VISUALS.photos.tint}>
              <ImageIcon />
            </DialogIconFill>
          ) : undefined
        }
        data-testid={`${testId}-photos-dialog`}
      >
        {active?.photos ? (
          <div className="flex flex-col gap-4 pb-6">
            <p className="m-0 text-[14.5px] font-semibold leading-relaxed text-[var(--sf-ink)]/80">{active.photos.caption}</p>
            <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0 sm:gap-3">
              {active.photos.photos.map((photo) => (
                <li key={photo.id} className="overflow-hidden rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-lav)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.src} alt={photo.alt} className="block aspect-square h-full w-full object-cover" loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </GDialog>

      <GDialog
        theme={theme}
        open={openDialog === "read"}
        onClose={closeDialog}
        size="md"
        title={active?.title ?? "Update"}
        description={active ? `${active.source} · ${active.whenLong}` : undefined}
        icon={
          activeVisual ? (
            <DialogIconFill tint={activeVisual.tint}>
              <activeVisual.Icon />
            </DialogIconFill>
          ) : undefined
        }
        data-testid={`${testId}-read-dialog`}
      >
        {active?.body ? (
          <div className="mb-6 flex flex-col bg-[var(--sf-paper)] gap-3 rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 px-4 py-3.5">
            {active.body.map((paragraph) => (
              <p key={paragraph} className="m-0 text-[15px] font-semibold leading-[1.7] text-[var(--sf-ink)]/85">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </GDialog>
    </>
  );
}
