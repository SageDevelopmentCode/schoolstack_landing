"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Megaphone, MessageSquare } from "lucide-react";
import PortalHomeSchoolBulletinLauncher from "@/components/portal-home/PortalHomeSchoolBulletinLauncher";
import { DateStamp, GCard, GIcon, QuickLinks, SPRINGY, G_FOCUS, eventWhen, gBtnButterSm } from "@/components/school-parent/garden/ui";
import type { ParentHomePageProps } from "../parent-home-types";
import type { ParentHomeModel } from "../useParentHomeModel";

/*
 * Home right rail: upcoming events (the page's one dark card, as tickets),
 * School Bulletin note, optional messages note, and Jump-to quick links.
 */

export function HomeEventsCard({ model, props }: { model: ParentHomeModel; props: ParentHomePageProps }) {
  const events = (props.upcomingEvents ?? []).slice(0, 3);
  return (
    <GCard index={2} tone="dark" kicker="Upcoming events" title="Coming up">
      {events.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <li key={event.id} className="sf-ticket flex items-stretch rounded-2xl bg-[var(--sf-paper)] text-[var(--sf-ink)]">
              <div className="flex items-center py-2.5 pl-5 pr-3">
                <DateStamp event={event} size="sm" />
              </div>
              <div className="my-3 border-l-[1.5px] border-dashed border-[var(--sf-ink)]/20" aria-hidden="true" />
              <div className="min-w-0 flex-1 px-4 py-3 pr-6">
                <p className="m-0 truncate text-[15px] font-extrabold">{event.title}</p>
                <p className="m-0 truncate text-[13px] font-semibold text-[var(--sf-soft)]">{eventWhen(event)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-[15px] text-white/80">No upcoming events right now.</p>
      )}
      <div className="mt-5">
        <Link href={model.calendarHref} className={gBtnButterSm}>
          View family calendar <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </GCard>
  );
}

const NOTE_ROW = `group relative flex w-full items-center gap-3.5 rounded-[14px] p-4 pt-5 text-left shadow-[0_10px_20px_-14px_rgba(43,36,29,0.55)] hover:-translate-y-0.5 ${SPRINGY} ${G_FOCUS}`;

export function HomeBulletinTile({ model, props }: { model: ParentHomeModel; props: ParentHomePageProps }) {
  const posts = props.bulletinPosts ?? [];
  return (
    <PortalHomeSchoolBulletinLauncher
      theme={model.theme}
      bulletinEnabled={props.bulletinEnabled ?? false}
      bulletinPosts={posts}
      renderTrigger={(open) => (
        <button type="button" onClick={open} className={`${NOTE_ROW} bg-[var(--sf-butter)]`}>
          <span aria-hidden="true" className="absolute left-1/2 top-0 h-3.5 w-12 -translate-x-1/2 -translate-y-1/2 -rotate-2 rounded-sm bg-white/75" />
          <GIcon size="sm">
            <Megaphone />
          </GIcon>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-extrabold text-[var(--sf-ink)]">School Bulletin</span>
            {posts[0] ? <span className="block truncate text-[13px] font-semibold text-[var(--sf-ink)]/65">{posts[0].title}</span> : null}
          </span>
          <ChevronRight className="h-4 w-4 text-[var(--sf-ink)]/60 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
        </button>
      )}
    />
  );
}

/**
 * Messages note. Shown where the old Home showed its "school updates" card:
 * co-op mode without a bulletin, or the marketing preview's communication cards.
 */
export function HomeMessagesTile({ model, props }: { model: ParentHomeModel; props: ParentHomePageProps }) {
  const promo = props.previewShowCommunicationCards ? props.previewMessagesPromo : undefined;
  const show =
    Boolean(model.messagesHref) &&
    (Boolean(props.previewShowCommunicationCards) || (Boolean(props.coopModeEnabled) && !props.bulletinEnabled));
  if (!show || !model.messagesHref) return null;
  return (
    <Link href={model.messagesHref} className={`${NOTE_ROW} bg-[var(--sf-sky)]`}>
      <span aria-hidden="true" className="absolute left-1/2 top-0 h-3.5 w-12 -translate-x-1/2 -translate-y-1/2 rotate-2 rounded-sm bg-white/75" />
      <GIcon size="sm">
        <MessageSquare />
      </GIcon>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-extrabold text-[var(--sf-ink)]">{promo?.title ?? "Messages from teachers and staff"}</span>
        <span className="block truncate text-[13px] font-semibold text-[var(--sf-ink)]/65">
          {promo?.subtitle ?? "Check your inbox for school communications."}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 text-[var(--sf-ink)]/60 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

export function HomeJumpToCard({ props }: { props: ParentHomePageProps }) {
  if (props.quickActions.length === 0) return null;
  return (
    <GCard index={3} kicker="Jump to">
      <QuickLinks actions={props.quickActions} />
    </GCard>
  );
}
