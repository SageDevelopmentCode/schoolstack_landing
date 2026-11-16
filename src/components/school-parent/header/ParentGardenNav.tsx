"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import NavigationLink from "@/components/school/shared/NavigationLink";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import {
  isParentNavItemActive,
  type ParentNavItem,
} from "@/lib/organization-settings/parent-nav";
import { getParentFeatureIconColor } from "@/lib/organization-settings/parent-feature-icon-styles";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import GardenHeaderPopover from "./GardenHeaderPopover";
import GardenNavBadge from "./GardenNavBadge";
import ParentGardenMoreMenu, {
  MORE_MENU_COLUMNS,
  navItemUnreadCount,
} from "./ParentGardenMoreMenu";

/*
 * Garden header nav: pill links with an accent pill that glides to the
 * active tab, plus the "More" trigger and grid. Renders the desktop row
 * (`variant="desktop"`) and the phone/tablet second row (`variant="mobile"`).
 */

const pillBase = `relative inline-flex shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-extrabold transition-colors duration-200 ${G_FOCUS} focus-visible:ring-offset-0`;

function ActivePill({ layoutId }: { layoutId: string }) {
  const reduce = useReducedMotion() === true;
  return (
    <motion.span
      layoutId={layoutId}
      aria-hidden="true"
      className="absolute inset-0 rounded-full bg-[var(--sf-clay)] shadow-[0_2px_0_0_var(--sf-ink)]"
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
    />
  );
}

function NavPill({
  item,
  active,
  unread,
  pillId,
  onNavigate,
}: {
  item: ParentNavItem;
  active: boolean;
  unread: number;
  pillId: string;
  onNavigate?: (href: string) => void;
}) {
  const Icon = item.icon;
  const className = `${pillBase} ${
    active
      ? "text-white"
      : "text-[var(--sf-ink)]/70 hover:bg-[var(--sf-accent-wash)] hover:text-[var(--sf-ink)]"
  }`;
  const inner = (
    <>
      {active ? <ActivePill layoutId={pillId} /> : null}
      <span className="relative inline-flex items-center gap-1.5">
        <Icon
          className={`h-3.5 w-3.5 shrink-0 ${active ? "!text-white" : getParentFeatureIconColor(item.iconSlug)}`}
          strokeWidth={2.4}
          aria-hidden
        />
        <span>{item.name}</span>
        {unread > 0 ? <GardenNavBadge count={unread} onAccent={active} /> : null}
      </span>
    </>
  );

  if (onNavigate) {
    return (
      <button
        type="button"
        data-nav-key={item.key}
        aria-current={active ? "page" : undefined}
        onClick={() => onNavigate(item.href)}
        className={className}
      >
        {inner}
      </button>
    );
  }

  return (
    <NavigationLink
      href={item.href}
      data-nav-key={item.key}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {inner}
    </NavigationLink>
  );
}

/** Keeps the active pill in view in the scrollable phone row, with edge fades. */
function useScrollRow(pathname: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (active) {
      const target =
        active.offsetLeft - el.clientWidth / 2 + active.offsetWidth / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    }
    const frame = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, measure]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const mask =
    edges.left && edges.right
      ? "linear-gradient(to right, transparent, #000 20px, #000 calc(100% - 20px), transparent)"
      : edges.left
        ? "linear-gradient(to right, transparent, #000 20px)"
        : edges.right
          ? "linear-gradient(to right, #000 calc(100% - 20px), transparent)"
          : undefined;

  return { ref, mask };
}

export default function ParentGardenNav({
  variant,
  primary,
  more,
  pathname,
  theme,
  messagesUnreadCount,
  committeesUnreadCount,
  documentationHref,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  primary: ParentNavItem[];
  more: ParentNavItem[];
  pathname: string;
  theme: ParentThemeTokens;
  messagesUnreadCount: number;
  committeesUnreadCount: number;
  documentationHref?: string;
  onNavigate?: (href: string) => void;
}) {
  const pillId = `parent-nav-pill-${useId()}`;
  const menuId = `parent-more-menu-${useId()}`;
  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement>(null);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const { ref: rowRef, mask } = useScrollRow(pathname);

  const activeMoreItem = more.find((item) => isParentNavItemActive(pathname, item));
  const moreActive = Boolean(activeMoreItem);
  const hiddenUnread = more.reduce(
    (sum, item) =>
      sum + navItemUnreadCount(item, messagesUnreadCount, committeesUnreadCount),
    0,
  );
  const closeMore = useCallback(() => setMoreOpen(false), []);

  // Close the menu when the route changes (e.g. browser back).
  useEffect(() => {
    queueMicrotask(() => setMoreOpen(false));
  }, [pathname]);

  const isDesktop = variant === "desktop";

  return (
    <nav
      aria-label="Parent portal"
      className={
        isDesktop
          ? "hidden min-w-0 max-w-[min(100%,54rem)] items-center gap-1 lg:flex"
          : "flex items-center gap-1 border-t-[1.5px] border-[var(--sf-ink)]/[0.07] px-3 py-2 sm:px-5 lg:hidden"
      }
    >
      <div
        ref={rowRef}
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
      >
        {primary.map((item) => (
          <NavPill
            key={item.key}
            item={item}
            active={isParentNavItemActive(pathname, item)}
            unread={navItemUnreadCount(item, messagesUnreadCount, committeesUnreadCount)}
            pillId={pillId}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {more.length > 0 ? (
        <div className={`shrink-0 ${isDesktop ? "relative" : "sm:relative"}`} ref={moreWrapRef}>
          <button
            ref={moreTriggerRef}
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
            aria-controls={menuId}
            aria-haspopup="dialog"
            data-testid={isDesktop ? "parent-header-more" : "parent-header-more-mobile"}
            className={`${pillBase} gap-1 ${
              moreActive
                ? "text-white"
                : moreOpen
                  ? "bg-[var(--sf-accent-wash)] text-[var(--sf-ink)]"
                  : "text-[var(--sf-ink)]/70 hover:bg-[var(--sf-accent-wash)] hover:text-[var(--sf-ink)]"
            }`}
          >
            {moreActive ? <ActivePill layoutId={pillId} /> : null}
            <span className="relative inline-flex items-center gap-1">
              <span>More</span>
              {activeMoreItem ? (
                <span className="max-w-[9rem] truncate font-bold opacity-90">
                  <span aria-hidden="true">· </span>
                  <span className="sr-only">, current page: </span>
                  {activeMoreItem.name}
                </span>
              ) : null}
              {hiddenUnread > 0 && !moreOpen ? (
                <GardenNavBadge
                  count={hiddenUnread}
                  onAccent={moreActive}
                  label={`${hiddenUnread} unread inside More`}
                />
              ) : null}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
                strokeWidth={2.6}
                aria-hidden
              />
            </span>
          </button>
          <GardenHeaderPopover
            open={moreOpen}
            onClose={closeMore}
            theme={theme}
            id={menuId}
            triggerRef={moreTriggerRef}
            anchorRef={moreWrapRef}
            label="More pages"
            align="right"
            widthClass="w-[22rem]"
            columns={MORE_MENU_COLUMNS}
          >
            <ParentGardenMoreMenu
              items={more}
              pathname={pathname}
              messagesUnreadCount={messagesUnreadCount}
              committeesUnreadCount={committeesUnreadCount}
              documentationHref={documentationHref}
              onClose={closeMore}
              onNavigate={onNavigate}
            />
          </GardenHeaderPopover>
        </div>
      ) : null}
    </nav>
  );
}

