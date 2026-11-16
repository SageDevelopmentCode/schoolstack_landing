"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, House, Loader2, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import GardenNavBadge from "@/components/school-parent/header/GardenNavBadge";
import type {
  AdminNavChildItem,
  AdminNavItem,
} from "@/lib/organization-settings/admin-nav";
import { adminNavItemMatchesPath } from "@/lib/organization-settings/admin-nav";
import { getAdminNavIconColor } from "@/lib/organization-settings/admin-feature-icon-styles";
import {
  getFirstAdminNavChildPath,
  resolveAdminNavChildHref,
} from "@/lib/organization-settings/admin-routes";
import {
  adminNavChildBadge,
  adminNavItemBadge,
  adminNavItemHref,
  adminNavRollUpBadge,
  formatNavGroupLabel,
  isAdminChildPathActive,
  isAdminNavChildLocked,
  isAdminNavItemLocked,
  isPathAtOrUnder,
  type AdminNavCountBadge,
  type AdminNavGroup,
} from "@/lib/school-admin/admin-sidebar-nav";
import SidebarFlyout from "./SidebarFlyout";
import { useSidebarNav } from "./sidebar-context";

/* ---------- Shared bits ---------- */

const ROW_BASE = `group/row relative flex w-full items-center rounded-[12px] text-left transition-[background-color,color,box-shadow] duration-150 ${G_FOCUS} focus-visible:ring-offset-0`;

export function PausedChip() {
  return (
    <span
      title="Friday Branch is paused in the parent portal"
      className="inline-flex shrink-0 items-center rounded-full bg-[var(--sf-butter)] px-1.5 py-px text-[9.5px] font-extrabold uppercase tracking-[0.08em] text-[#7a5a12] ring-1 ring-[#e9cf7c]"
    >
      Paused
    </span>
  );
}

function CountBadge({
  badge,
  onAccent = false,
  className = "",
}: {
  badge: AdminNavCountBadge | null;
  onAccent?: boolean;
  className?: string;
}) {
  if (!badge) return null;
  return (
    <GardenNavBadge
      count={badge.count}
      label={badge.label}
      onAccent={onAccent}
      className={`motion-safe:animate-[sf-admin-badge-in_260ms_cubic-bezier(0.34,1.56,0.64,1)] ${className}`}
    />
  );
}

/** Small dot on a collapsed icon when something inside is waiting. */
function IconDot({ badge }: { badge: AdminNavCountBadge | null }) {
  if (!badge) return null;
  return (
    <span className="absolute -right-1 -top-1 inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--sf-clay)] px-1 text-[9px] font-extrabold leading-none text-white tabular-nums ring-[1.5px] ring-white">
      <span aria-hidden>{badge.count > 99 ? "99+" : badge.count}</span>
    </span>
  );
}

function NavIcon({
  icon: Icon,
  featureKey,
  active,
  pending,
  locked,
}: {
  icon: LucideIcon;
  featureKey: string;
  active: boolean;
  pending: boolean;
  locked?: boolean;
}) {
  const color = getAdminNavIconColor(featureKey);
  return (
    <span
      aria-hidden
      className={`relative inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] transition-colors duration-150 ${
        active ? "bg-white/20" : ""
      } ${locked ? "opacity-60" : ""}`}
      style={active ? undefined : { backgroundColor: `color-mix(in srgb, ${color} 13%, #ffffff)` }}
    >
      {pending ? (
        <Loader2
          className={`h-[15px] w-[15px] animate-spin ${active ? "text-white" : "text-[var(--sf-clay-deep)]"}`}
          strokeWidth={2.4}
        />
      ) : (
        <Icon
          className="h-[15px] w-[15px]"
          strokeWidth={2.3}
          style={{ color: active ? "#ffffff" : color }}
        />
      )}
    </span>
  );
}

function ActivePill({ layoutId }: { layoutId: string }) {
  const reduce = useReducedMotion() === true;
  return (
    <motion.span
      layoutId={layoutId}
      aria-hidden
      className="absolute inset-0 rounded-[12px] border-[1.5px] border-[var(--sf-ink)] bg-[var(--sf-clay)] shadow-[0_2px_0_0_var(--sf-ink)]"
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 460, damping: 38 }}
    />
  );
}

function LockChip() {
  return (
    <span className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--sf-ink)]/[0.07] text-[var(--sf-ink)]/55">
      <Lock className="h-2.5 w-2.5" strokeWidth={2.6} aria-hidden />
    </span>
  );
}

/* ---------- Flyout content (collapsed mode) ---------- */

function FlyoutTitle({ name, badge, locked }: { name: string; badge: AdminNavCountBadge | null; locked?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5">
      <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-[var(--sf-ink)]">{name}</span>
      {locked ? <LockChip /> : null}
      {badge ? (
        <span className="text-[11.5px] font-bold text-[var(--sf-clay-deep)] tabular-nums">{badge.label}</span>
      ) : null}
    </div>
  );
}

/* ---------- Child links ---------- */

function ChildLinks({
  parentFeature,
  navChildren,
  depth,
  inFlyout = false,
}: {
  parentFeature: string;
  navChildren: AdminNavChildItem[];
  depth: number;
  inFlyout?: boolean;
}) {
  const nav = useSidebarNav();

  return (
    <ul className="flex flex-col gap-px">
      {navChildren.map((child) => {
        const locked = isAdminNavChildLocked(parentFeature, child, nav.lockedMode);
        const active = isAdminChildPathActive(nav.slug, nav.pathname, parentFeature, child);

        if (child.children?.length) {
          return (
            <li key={child.key}>
              <NestedGroup
                parentFeature={parentFeature}
                child={child}
                depth={depth}
                active={active}
                locked={locked}
                inFlyout={inFlyout}
              />
            </li>
          );
        }

        const href = resolveAdminNavChildHref(nav.slug, parentFeature, child);
        const leafActive = isPathAtOrUnder(nav.pathname, href);
        const pending = nav.pendingHref === href;
        const badge = adminNavChildBadge(parentFeature, child, nav.counts, nav.lockedMode);
        const paused =
          parentFeature === "my_school" &&
          child.key === "friday_branch" &&
          nav.fridayBranchParentPortalPaused;
        const rowClass = `${ROW_BASE} min-h-[32px] gap-2 px-2.5 py-1.5 text-[13px] ${
          leafActive
            ? "bg-[var(--sf-peach)] font-extrabold text-[var(--sf-clay-deep)]"
            : "font-semibold text-[var(--sf-ink)]/70 hover:bg-[var(--sf-accent-wash)] hover:text-[var(--sf-ink)]"
        }`;

        if (locked) {
          return (
            <li key={child.key}>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-label={`${child.name}, locked. See plans`}
                onClick={() => nav.onLockedSelect?.(child.name)}
                className={`${ROW_BASE} min-h-[32px] gap-2 px-2.5 py-1.5 text-[13px] font-semibold text-[var(--sf-ink)]/45 hover:bg-[var(--sf-ink)]/[0.04] hover:text-[var(--sf-ink)]/70`}
              >
                <span className="min-w-0 flex-1 truncate">{child.name}</span>
                <LockChip />
              </button>
            </li>
          );
        }

        return (
          <li key={child.key}>
            <Link
              href={href}
              aria-current={leafActive ? "page" : undefined}
              aria-busy={pending || undefined}
              onClick={(event) => nav.onLinkClick(event, href)}
              className={rowClass}
            >
              {!inFlyout ? (
                <span
                  aria-hidden
                  className={`absolute -left-[13px] top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full ring-2 ring-white transition-colors ${
                    leafActive ? "bg-[var(--sf-clay)]" : "bg-transparent"
                  }`}
                />
              ) : null}
              <span className="min-w-0 flex-1 truncate">{child.name}</span>
              {paused ? <PausedChip /> : null}
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[var(--sf-clay-deep)]" aria-hidden />
              ) : (
                <CountBadge badge={badge} />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function NestedGroup({
  parentFeature,
  child,
  depth,
  active,
  locked,
  inFlyout,
}: {
  parentFeature: string;
  child: AdminNavChildItem;
  depth: number;
  active: boolean;
  locked: boolean;
  inFlyout: boolean;
}) {
  const nav = useSidebarNav();
  const key = `${parentFeature}:${child.key}`;
  const isOpen = inFlyout ? true : (nav.openParents[key] ?? active);
  const firstHref = getFirstAdminNavChildPath(nav.slug, parentFeature, child.children!);
  const rollUp = adminNavRollUpBadge(parentFeature, child.children, nav.counts, nav.lockedMode);
  const listId = `admin-nav-${nav.pillLayoutId}-${key}`.replace(/[^a-zA-Z0-9_-]/g, "-");

  return (
    <div>
      <div className="flex items-center gap-0.5">
        {firstHref && !locked ? (
          <Link
            href={firstHref}
            onClick={(event) => nav.onLinkClick(event, firstHref)}
            className={`${ROW_BASE} min-h-[32px] flex-1 gap-2 px-2.5 py-1.5 text-[13px] ${
              active
                ? "font-extrabold text-[var(--sf-clay-deep)]"
                : "font-semibold text-[var(--sf-ink)]/70 hover:bg-[var(--sf-accent-wash)] hover:text-[var(--sf-ink)]"
            }`}
          >
            <span className="min-w-0 flex-1 truncate">{child.name}</span>
            {!isOpen ? <CountBadge badge={rollUp} /> : null}
          </Link>
        ) : locked ? (
          <button
            type="button"
            aria-haspopup="dialog"
            aria-label={`${child.name}, locked. See plans`}
            onClick={() => nav.onLockedSelect?.(child.name)}
            className={`${ROW_BASE} min-h-[32px] flex-1 gap-2 px-2.5 py-1.5 text-[13px] font-semibold text-[var(--sf-ink)]/45`}
          >
            <span className="min-w-0 flex-1 truncate">{child.name}</span>
            <LockChip />
          </button>
        ) : (
          <span className="min-w-0 flex-1 truncate px-2.5 py-1.5 text-[13px] font-semibold text-[var(--sf-ink)]/60">
            {child.name}
          </span>
        )}
        {!inFlyout ? (
          <button
            type="button"
            onClick={() => nav.toggleOpen(key)}
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-label={`${isOpen ? "Hide" : "Show"} ${child.name} pages`}
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--sf-ink)]/45 transition-colors hover:bg-[var(--sf-accent-wash)] hover:text-[var(--sf-ink)] ${G_FOCUS} focus-visible:ring-offset-0`}
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
      <Collapsible id={listId} open={isOpen}>
        <div className="ml-3 border-l-[1.5px] border-[var(--sf-ink)]/10 pl-2.5">
          <ChildLinks parentFeature={parentFeature} navChildren={child.children!} depth={depth + 1} inFlyout={inFlyout} />
        </div>
      </Collapsible>
    </div>
  );
}

/** Height-animated disclosure; closed content is `inert` so it leaves the tab order. */
function Collapsible({ id, open, children }: { id: string; open: boolean; children: ReactNode }) {
  return (
    <div
      id={id}
      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
      inert={!open}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

/* ---------- Top-level rows ---------- */

function groupHasHref(slug: string, parentFeature: string, navChildren: AdminNavChildItem[], href: string): boolean {
  return navChildren.some((child) =>
    child.children?.length
      ? groupHasHref(slug, parentFeature, child.children, href)
      : resolveAdminNavChildHref(slug, parentFeature, child) === href,
  );
}

function TopRowInner({
  item,
  icon,
  featureKey,
  active,
  solid,
  pending,
  badge,
  locked,
  trailing,
}: {
  item: { name: string };
  icon: LucideIcon;
  featureKey: string;
  active: boolean;
  solid: boolean;
  pending: boolean;
  badge: AdminNavCountBadge | null;
  locked?: boolean;
  trailing?: ReactNode;
}) {
  const nav = useSidebarNav();
  const expanded = nav.isExpanded;
  return (
    <>
      {solid ? <ActivePill layoutId={nav.pillLayoutId} /> : null}
      <span className={`relative flex min-w-0 flex-1 items-center ${expanded ? "gap-2.5" : "justify-center"}`}>
        <span className="relative inline-flex">
          <NavIcon icon={icon} featureKey={featureKey} active={solid} pending={pending} locked={locked} />
          {!expanded ? <IconDot badge={badge} /> : null}
        </span>
        {expanded ? (
          <>
            <span className="min-w-0 flex-1 truncate">{item.name}</span>
            {locked ? <LockChip /> : null}
            {trailing}
            <CountBadge badge={badge} onAccent={solid} />
          </>
        ) : (
          <span className="sr-only">
            {item.name}
            {locked ? ", locked" : ""}
            {badge ? `, ${badge.label}` : ""}
          </span>
        )}
      </span>
      {active && !solid && !expanded ? (
        <span aria-hidden className="absolute -left-[9px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[var(--sf-clay)]" />
      ) : null}
    </>
  );
}

function rowTone(active: boolean, solid: boolean): string {
  if (solid) return "font-extrabold text-white";
  if (active) return "bg-[var(--sf-accent-wash)] font-extrabold text-[var(--sf-clay-deep)]";
  return "font-bold text-[var(--sf-ink)]/75 hover:bg-[var(--sf-accent-wash)] hover:text-[var(--sf-ink)]";
}

export function SidebarHomeLink() {
  const nav = useSidebarNav();
  const href = `/school/${nav.slug}/admin/home`;
  const active = isPathAtOrUnder(nav.pathname, href);
  const pending = nav.pendingHref === href;
  return (
    <SidebarFlyout enabled={!nav.isExpanded} panel={<FlyoutTitle name="Home" badge={null} />} className="mb-3">
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        aria-busy={pending || undefined}
        aria-label={nav.isExpanded ? undefined : "Home"}
        onClick={(event) => nav.onLinkClick(event, href)}
        className={`${ROW_BASE} min-h-[40px] ${nav.isExpanded ? "px-1.5 py-1" : "justify-center p-1"} text-[13.5px] ${rowTone(active, active)}`}
      >
        <TopRowInner item={{ name: "Home" }} icon={House} featureKey="home" active={active} solid={active} pending={pending} badge={null} />
      </Link>
    </SidebarFlyout>
  );
}

function SidebarNavItem({ item }: { item: AdminNavItem }) {
  const nav = useSidebarNav();
  const expanded = nav.isExpanded;
  const hasChildren = Boolean(item.children?.length);
  const locked = isAdminNavItemLocked(item, nav.lockedMode);
  const href = adminNavItemHref(nav.slug, item, nav.lockedMode);
  const groupActive = adminNavItemMatchesPath(nav.slug, nav.pathname, item);
  const isOpen = nav.openParents[item.key] ?? false;
  const pending = nav.pendingHref === href && !hasChildren;
  const childPending =
    hasChildren && nav.pendingHref != null && groupHasHref(nav.slug, item.key, item.children!, nav.pendingHref);
  const badge = adminNavItemBadge(item, nav.counts, nav.lockedMode);
  const sizing = expanded ? "min-h-[40px] px-1.5 py-1" : "min-h-[40px] justify-center p-1";
  const listId = `admin-nav-${nav.pillLayoutId}-${item.key}`.replace(/[^a-zA-Z0-9_-]/g, "-");

  // Leaf rows (Dashboard, Schedule, Photos…).
  if (!hasChildren) {
    const active = nav.pathname === href;
    if (locked) {
      return (
        <SidebarFlyout enabled={!expanded} panel={<FlyoutTitle name={item.name} badge={null} locked />}>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-label={expanded ? `${item.name}, locked. See plans` : undefined}
            onClick={() => nav.onLockedSelect?.(item.name)}
            className={`${ROW_BASE} ${sizing} text-[13.5px] font-bold text-[var(--sf-ink)]/50 hover:bg-[var(--sf-ink)]/[0.04]`}
          >
            <TopRowInner item={item} icon={item.icon} featureKey={item.key} active={false} solid={false} pending={false} badge={null} locked />
          </button>
        </SidebarFlyout>
      );
    }
    return (
      <SidebarFlyout enabled={!expanded} panel={<FlyoutTitle name={item.name} badge={badge} />}>
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          aria-busy={pending || undefined}
          onClick={(event) => nav.onLinkClick(event, href)}
          className={`${ROW_BASE} ${sizing} text-[13.5px] ${rowTone(active, active)}`}
        >
          <TopRowInner item={item} icon={item.icon} featureKey={item.key} active={active} solid={active} pending={pending} badge={badge} />
        </Link>
      </SidebarFlyout>
    );
  }

  // Groups (Admissions, My School, Communication…).
  const groupBadge = expanded && isOpen ? null : badge;
  const flyoutPanel = (
    <div>
      <FlyoutTitle name={item.name} badge={badge} locked={locked} />
      <div className="mx-1 mb-0.5 border-t border-[var(--sf-ink)]/[0.08] pt-1">
        <ChildLinks parentFeature={item.key} navChildren={item.children!} depth={0} inFlyout />
      </div>
    </div>
  );

  const trigger = locked ? (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={expanded ? `${item.name}, locked. See plans` : undefined}
      onClick={() => nav.onLockedSelect?.(item.name)}
      className={`${ROW_BASE} ${sizing} flex-1 text-[13.5px] font-bold text-[var(--sf-ink)]/50 hover:bg-[var(--sf-ink)]/[0.04]`}
    >
      <TopRowInner item={item} icon={item.icon} featureKey={item.key} active={false} solid={false} pending={false} badge={null} locked />
    </button>
  ) : (
    <Link
      href={href}
      onClick={(event) => nav.onLinkClick(event, href)}
      aria-busy={childPending || undefined}
      className={`${ROW_BASE} ${sizing} flex-1 text-[13.5px] ${rowTone(groupActive, false)}`}
    >
      <TopRowInner
        item={item}
        icon={item.icon}
        featureKey={item.key}
        active={groupActive}
        solid={false}
        pending={!expanded && childPending}
        badge={groupBadge}
      />
    </Link>
  );

  if (!expanded) {
    return (
      <SidebarFlyout enabled interactive panel={flyoutPanel}>
        {trigger}
      </SidebarFlyout>
    );
  }

  return (
    <div>
      <div className={`flex items-center rounded-[12px] ${groupActive ? "bg-[var(--sf-accent-wash)]" : ""}`}>
        {trigger}
        <button
          type="button"
          onClick={() => nav.toggleOpen(item.key)}
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-label={`${isOpen ? "Hide" : "Show"} ${item.name} pages`}
          className={`mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--sf-ink)]/45 transition-colors hover:bg-white hover:text-[var(--sf-ink)] ${G_FOCUS} focus-visible:ring-offset-0`}
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>
      <Collapsible id={listId} open={isOpen}>
        <div className="mb-1 ml-[22px] mt-0.5 border-l-[1.5px] border-[var(--sf-ink)]/10 pl-[11px]">
          <ChildLinks parentFeature={item.key} navChildren={item.children!} depth={0} />
        </div>
      </Collapsible>
    </div>
  );
}

export default function SidebarNav({ navGroups }: { navGroups: AdminNavGroup[] }) {
  const nav = useSidebarNav();
  return (
    <>
      {navGroups.map((group, index) => {
        const headingId = `admin-nav-${nav.pillLayoutId}-group-${index}`.replace(/[^a-zA-Z0-9_-]/g, "-");
        return (
          <section key={group.label} aria-labelledby={headingId} className="mb-4 last:mb-1">
            {nav.isExpanded ? (
              <h2
                id={headingId}
                className="mb-1.5 px-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]"
              >
                {formatNavGroupLabel(group.label)}
              </h2>
            ) : (
              <>
                <h2 id={headingId} className="sr-only">
                  {formatNavGroupLabel(group.label)}
                </h2>
                {index > 0 ? <div aria-hidden className="mx-2 mb-2 h-px bg-[var(--sf-ink)]/10" /> : null}
              </>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <li key={item.key}>
                  <SidebarNavItem item={item} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
