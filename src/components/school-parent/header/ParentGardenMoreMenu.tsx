"use client";

import { ArrowRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import NavigationLink from "@/components/school/shared/NavigationLink";
import { Tick } from "@/components/garden/ui";
import {
  G_FOCUS,
  GKicker,
  NOTE_TINTS,
  SPRINGY,
} from "@/components/school-parent/garden/ui";
import {
  isParentNavItemActive,
  type ParentNavItem,
} from "@/lib/organization-settings/parent-nav";
import GardenNavBadge from "./GardenNavBadge";
import { POPOVER_ITEM_ATTR } from "./GardenHeaderPopover";

export const MORE_MENU_COLUMNS = 3;

export function navItemUnreadCount(
  item: ParentNavItem,
  messagesUnreadCount: number,
  committeesUnreadCount: number,
): number {
  if (item.key === "messages") return messagesUnreadCount;
  if (item.key === "committees") return committeesUnreadCount;
  return 0;
}

function MoreTile({
  item,
  index,
  pathname,
  unread,
  onClose,
  onNavigate,
}: {
  item: ParentNavItem;
  index: number;
  pathname: string;
  unread: number;
  onClose: () => void;
  onNavigate?: (href: string) => void;
}) {
  const Icon = item.icon;
  const active = isParentNavItemActive(pathname, item);
  const className = `group relative flex min-h-[96px] w-full flex-col items-center justify-start gap-2 rounded-[18px] px-1.5 pb-2.5 pt-3 text-center ${SPRINGY} ${G_FOCUS} ${
    active
      ? "bg-[var(--sf-accent-wash)] ring-[1.5px] ring-[var(--sf-clay)]/45"
      : "hover:-translate-y-0.5 hover:bg-[var(--sf-paper)] hover:ring-[1.5px] hover:ring-[var(--sf-ink)]/10"
  }`;

  const content = (
    <>
      {active ? (
        <span className="absolute right-1.5 top-1.5">
          <Tick className="h-4 w-4" color="var(--sf-clay-deep)" fill="#fff" />
        </span>
      ) : null}
      <span
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-[1.5px] ring-[var(--sf-ink)]/80 transition-transform duration-300 group-hover:scale-105 ${
          NOTE_TINTS[index % NOTE_TINTS.length]
        }`}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5 text-[var(--sf-ink)]" strokeWidth={2.2} />
        {unread > 0 ? (
          <span className="absolute -right-2 -top-1.5">
            <GardenNavBadge count={unread} />
          </span>
        ) : null}
      </span>
      <span
        className={`line-clamp-2 text-[12.5px] font-extrabold leading-tight text-balance ${
          active ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-ink)]"
        }`}
      >
        {item.name}
      </span>
      {active ? <span className="sr-only">(current page)</span> : null}
      {unread > 0 ? <span className="sr-only">{`, ${unread} unread`}</span> : null}
    </>
  );

  if (onNavigate) {
    return (
      <button
        type="button"
        {...POPOVER_ITEM_ATTR}
        aria-current={active ? "page" : undefined}
        data-autofocus={active ? "" : undefined}
        onClick={() => {
          onNavigate(item.href);
          onClose();
        }}
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <NavigationLink
      href={item.href}
      {...POPOVER_ITEM_ATTR}
      aria-current={active ? "page" : undefined}
      data-autofocus={active ? "" : undefined}
      onClick={onClose}
      className={className}
    >
      {content}
    </NavigationLink>
  );
}

/** The "More" grid: pages that don't fit in the header row. */
export default function ParentGardenMoreMenu({
  items,
  pathname,
  messagesUnreadCount,
  committeesUnreadCount,
  documentationHref,
  onClose,
  onNavigate,
}: {
  items: ParentNavItem[];
  pathname: string;
  messagesUnreadCount: number;
  committeesUnreadCount: number;
  documentationHref?: string;
  onClose: () => void;
  onNavigate?: (href: string) => void;
}) {
  // The phone sheet has its own title, so the kicker only shows in the popover.
  const showHeading = !useMediaQuery("(max-width: 639px)");
  const docsActive = documentationHref
    ? pathname === documentationHref || pathname.startsWith(`${documentationHref}/`)
    : false;
  const docsClass = `${G_FOCUS} inline-flex items-center gap-1 rounded-md text-[13px] font-extrabold text-[var(--sf-clay-deep)] hover:underline hover:decoration-2 hover:underline-offset-4`;

  return (
    <div data-testid="parent-header-more-menu">
      {showHeading ? (
        <div className="flex items-center justify-between px-4 pb-1 pt-3.5">
          <GKicker>More pages</GKicker>
        </div>
      ) : null}
      <ul
        className="grid gap-1.5 p-2"
        style={{ gridTemplateColumns: `repeat(${MORE_MENU_COLUMNS}, minmax(0, 1fr))` }}
      >
        {items.map((item, index) => (
          <li key={item.key} className="min-w-0">
            <MoreTile
              item={item}
              index={index}
              pathname={pathname}
              unread={navItemUnreadCount(item, messagesUnreadCount, committeesUnreadCount)}
              onClose={onClose}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
      {documentationHref && !docsActive ? (
        <div className="mx-2 mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-3.5 py-2.5">
          <span className="text-[13px] font-semibold text-[var(--sf-soft)]">
            Can&apos;t find something?
          </span>
          {onNavigate ? (
            <button
              type="button"
              {...POPOVER_ITEM_ATTR}
              className={docsClass}
              onClick={() => {
                onNavigate(documentationHref);
                onClose();
              }}
            >
              How-to guides
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : (
            <NavigationLink
              href={documentationHref}
              {...POPOVER_ITEM_ATTR}
              className={docsClass}
              onClick={onClose}
            >
              How-to guides
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </NavigationLink>
          )}
        </div>
      ) : null}
    </div>
  );
}
