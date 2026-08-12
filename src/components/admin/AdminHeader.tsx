"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarCheck,
  CalendarClock,
  MessageSquare,
  MessageSquarePlus,
  MessageSquareText,
  LayoutGrid,
  CircleHelp,
  Building2,
  School,
  ScrollText,
  CreditCard,
  LifeBuoy,
  Gauge,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  color: string;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavLink[];
};

type NavEntry =
  | { type: "group"; group: NavGroup }
  | { type: "link"; link: NavLink };

const NAV_ENTRIES: NavEntry[] = [
  {
    type: "group",
    group: {
      id: "demos",
      label: "Demos",
      items: [
        { href: "/admin/demo-requests", label: "Requests", icon: CalendarCheck, color: "#2563eb" },
        { href: "/admin/availability", label: "Schedule", icon: CalendarClock, color: "#059669" },
        { href: "/admin/demo-feedback", label: "Feedback", icon: MessageSquareText, color: "#7c3aed" },
        { href: "/admin/demos", label: "Demos", icon: LayoutGrid, color: "#d97706" },
        { href: "/admin/homepage-questions", label: "Questions", icon: CircleHelp, color: "#0891b2" },
      ],
    },
  },
  {
    type: "group",
    group: {
      id: "schools",
      label: "Schools",
      items: [
        { href: "/admin/organizations", label: "Organizations", icon: School, color: "#4f46e5" },
        { href: "/admin/messages", label: "Messages", icon: MessageSquare, color: "#0284c7" },
        { href: "/admin/parent-portal-feedback", label: "Parent feedback", icon: MessageSquarePlus, color: "#9333ea" },
        { href: "/admin/activity", label: "Activity", icon: ScrollText, color: "#0f766e" },
        { href: "/admin/performance", label: "Performance", icon: Gauge, color: "#0d9488" },
      ],
    },
  },
  { type: "link", link: { href: "/admin/tickets", label: "Tickets", icon: LifeBuoy, color: "#ea580c" } },
  { type: "link", link: { href: "/admin/payments", label: "Payments", icon: CreditCard, color: "#2563eb" } },
  { type: "link", link: { href: "/admin/research", label: "CRM", icon: Building2, color: "#db2777" } },
];

function isLinkActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isGroupActive(pathname: string, group: NavGroup) {
  return group.items.some((item) => isLinkActive(pathname, item.href));
}

function navLinkClassName(active: boolean) {
  return `flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-admin-md transition-colors duration-150 ${
    active
      ? "bg-admin-accent-soft text-admin-accent font-medium"
      : "text-admin-muted hover:text-admin-text hover:bg-admin-neutral-bg"
  }`;
}

function AdminNavLink({ link, pathname }: { link: NavLink; pathname: string }) {
  const Icon = link.icon;
  const active = isLinkActive(pathname, link.href);

  return (
    <Link href={link.href} className={navLinkClassName(active)}>
      <Icon
        className="w-3.5 h-3.5 shrink-0"
        style={{ color: link.color }}
        strokeWidth={2.25}
        aria-hidden
      />
      {link.label}
    </Link>
  );
}

function AdminNavDropdown({
  group,
  pathname,
  isOpen,
  onToggle,
  onClose,
}: {
  group: NavGroup;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const groupActive = isGroupActive(pathname, group);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <div ref={rootRef} className="relative overflow-visible">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={navLinkClassName(groupActive)}
      >
        {group.label}
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-[210] mt-1 min-w-[180px] -translate-x-1/2 rounded-admin-md border border-admin-border bg-admin-surface py-1 shadow-sm"
        >
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={onClose}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors duration-150 ${
                  active
                    ? "bg-admin-accent-soft text-admin-accent font-medium"
                    : "text-admin-muted hover:bg-admin-neutral-bg hover:text-admin-text"
                }`}
              >
                <Icon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: item.color }}
                  strokeWidth={2.25}
                  aria-hidden
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

type AdminHeaderProps = {
  variant?: "minimal" | "full";
  onSignOut?: () => void;
};

export default function AdminHeader({
  variant = "full",
  onSignOut,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  const closeDropdown = useCallback(() => setOpenGroupId(null), []);

  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroupId((current) => (current === groupId ? null : groupId));
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[200] overflow-visible border-b border-admin-border bg-admin-surface">
      <div className="flex h-12 items-center justify-between gap-6 overflow-visible px-4 md:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <img
            src="/images/Logo.png"
            alt="MudKitchen"
            className="h-8 w-auto object-contain md:h-9"
          />
        </Link>

        {variant === "full" && (
          <>
            <nav
              className="flex flex-1 items-center justify-center gap-1 overflow-visible"
              aria-label="Admin navigation"
            >
              {NAV_ENTRIES.map((entry) =>
                entry.type === "group" ? (
                  <AdminNavDropdown
                    key={entry.group.id}
                    group={entry.group}
                    pathname={pathname}
                    isOpen={openGroupId === entry.group.id}
                    onToggle={() => toggleGroup(entry.group.id)}
                    onClose={closeDropdown}
                  />
                ) : (
                  <AdminNavLink key={entry.link.href} link={entry.link} pathname={pathname} />
                ),
              )}
            </nav>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="text-sm font-medium text-admin-muted hover:text-admin-text transition-colors duration-150 shrink-0"
              >
                Sign out
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
