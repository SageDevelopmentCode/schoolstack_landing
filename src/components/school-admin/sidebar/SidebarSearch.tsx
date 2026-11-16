"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Loader2, Lock, Search, X } from "lucide-react";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import GardenNavBadge from "@/components/school-parent/header/GardenNavBadge";
import { getAdminNavIconColor } from "@/lib/organization-settings/admin-feature-icon-styles";
import {
  searchAdminNav,
  type AdminNavSearchEntry,
} from "@/lib/school-admin/admin-sidebar-nav";
import { useSidebarNav } from "./sidebar-context";

/*
 * "Find a page": filters every page in the sidebar as the admin types.
 * Combobox pattern: focus stays in the input, ↑/↓ move the highlight, Enter
 * opens it (locked pages open the upgrade dialog), Escape clears. ⌘K / Ctrl+K
 * from anywhere focuses it (the shell bumps `focusToken`).
 */

export type SidebarSearchState = {
  query: string;
  setQuery: (value: string) => void;
  results: AdminNavSearchEntry[];
  highlight: number;
  setHighlight: (index: number | ((index: number) => number)) => void;
  listId: string;
  active: boolean;
};

export function useSidebarSearch(entries: AdminNavSearchEntry[]): SidebarSearchState {
  const listId = useId().replace(/:/g, "");
  const [query, setQueryState] = useState("");
  const [highlight, setHighlight] = useState(0);
  const results = useMemo(() => searchAdminNav(entries, query), [entries, query]);
  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    setHighlight(0);
  }, []);
  return {
    query,
    setQuery,
    results,
    highlight: Math.min(highlight, Math.max(0, results.length - 1)),
    setHighlight,
    listId,
    active: query.trim().length > 0,
  };
}

function useShortcutLabel(): string {
  const [label, setLabel] = useState("Ctrl K");
  useEffect(() => {
    queueMicrotask(() => {
      if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) setLabel("⌘K");
    });
  }, []);
  return label;
}

export function SidebarSearchField({
  search,
  focusToken,
  onCollapsedSearch,
}: {
  search: SidebarSearchState;
  /** Bumped by the shell on ⌘K; the visible panel focuses its input. */
  focusToken: number;
  onCollapsedSearch: () => void;
}) {
  const nav = useSidebarNav();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const shortcut = useShortcutLabel();
  const { query, setQuery, results, highlight, setHighlight, listId, active } = search;

  useEffect(() => {
    if (!focusToken) return;
    const input = inputRef.current;
    // Only the panel that is on screen takes focus (desktop aside vs drawer).
    if (!input || input.offsetParent === null) return;
    input.focus();
    input.select();
  }, [focusToken, nav.isExpanded]);

  const openEntry = (entry: AdminNavSearchEntry) => {
    if (entry.locked) {
      nav.onLockedSelect?.(entry.label);
      return;
    }
    setQuery("");
    if (entry.href === nav.pathname) return;
    nav.markPending(entry.href);
    router.push(entry.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (query) {
        event.preventDefault();
        event.stopPropagation();
        setQuery("");
      } else {
        inputRef.current?.blur();
      }
      return;
    }
    if (!active || results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const entry = results[highlight];
      if (entry) openEntry(entry);
    }
  };

  if (!nav.isExpanded) {
    return (
      <button
        type="button"
        onClick={onCollapsedSearch}
        aria-label={`Find a page (${shortcut})`}
        title={`Find a page · ${shortcut}`}
        className={`mx-auto flex h-9 w-9 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white text-[var(--sf-ink)]/60 transition-colors hover:border-[var(--sf-ink)]/30 hover:text-[var(--sf-ink)] ${G_FOCUS} focus-visible:ring-offset-0`}
      >
        <Search className="h-4 w-4" strokeWidth={2.4} aria-hidden />
      </button>
    );
  }

  return (
    <div className="relative">
      <label className="sr-only" htmlFor={`${listId}-input`}>
        Find a page
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sf-ink)]/40"
        strokeWidth={2.4}
        aria-hidden
      />
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="text"
        role="combobox"
        aria-expanded={active}
        aria-controls={`${listId}-list`}
        aria-activedescendant={active && results.length > 0 ? `${listId}-opt-${highlight}` : undefined}
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck={false}
        value={query}
        placeholder="Find a page"
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onKeyDown}
        data-admin-sidebar-search=""
        className="h-10 w-full rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-cream)]/70 pl-9 pr-12 text-[13.5px] font-semibold text-[var(--sf-ink)] transition-[border-color,box-shadow] placeholder:font-semibold placeholder:text-[var(--sf-ink)]/40 focus:border-[var(--sf-clay)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--sf-clay)]/15"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className={`absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--sf-ink)]/50 hover:bg-[var(--sf-ink)]/[0.06] hover:text-[var(--sf-ink)] ${G_FOCUS} focus-visible:ring-offset-0`}
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : (
        <kbd
          aria-hidden
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-[var(--sf-ink)]/12 bg-white px-1.5 py-px font-sans text-[10.5px] font-extrabold text-[var(--sf-ink)]/50"
        >
          {shortcut}
        </kbd>
      )}
    </div>
  );
}

export function SidebarSearchResults({ search }: { search: SidebarSearchState }) {
  const nav = useSidebarNav();
  const { query, setQuery, results, highlight, setHighlight, listId } = search;
  const countLabel = `${results.length} page${results.length === 1 ? "" : "s"}`;

  return (
    <div>
      <p aria-hidden className="mb-1.5 px-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
        {results.length > 0 ? countLabel : "No matches"}
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        {results.length > 0
          ? `${countLabel} found. Use the arrow keys and Enter to open one.`
          : `No pages match ${query.trim()}.`}
      </p>
      {results.length === 0 ? (
        <div className="rounded-[14px] bg-[var(--sf-cream)] px-3 py-3 text-[13px] font-semibold text-[var(--sf-ink)]/70">
          No pages match “{query.trim()}”.
          <button
            type="button"
            onClick={() => setQuery("")}
            className={`mt-1 block rounded-md text-[13px] font-extrabold text-[var(--sf-clay-deep)] hover:underline hover:decoration-2 hover:underline-offset-4 ${G_FOCUS}`}
          >
            Clear search
          </button>
        </div>
      ) : (
        <ul id={`${listId}-list`} role="listbox" aria-label="Pages" className="flex flex-col gap-0.5">
          {results.map((entry, index) => {
            const selected = index === highlight;
            const pending = nav.pendingHref === entry.href;
            const color = getAdminNavIconColor(entry.iconKey);
            const rowClass = `relative flex w-full items-center gap-2.5 rounded-[12px] px-2 py-1.5 text-left transition-colors ${
              selected ? "bg-[var(--sf-peach)]" : "hover:bg-[var(--sf-accent-wash)]"
            }`;
            const body = (
              <>
                <span
                  aria-hidden
                  className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[9px]"
                  style={{ backgroundColor: `color-mix(in srgb, ${color} 13%, #ffffff)` }}
                >
                  {pending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--sf-clay-deep)]" />
                  ) : entry.locked ? (
                    <Lock className="h-3 w-3 text-[var(--sf-ink)]/50" strokeWidth={2.6} />
                  ) : (
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-[13px] font-extrabold ${
                      entry.locked ? "text-[var(--sf-ink)]/50" : "text-[var(--sf-ink)]"
                    }`}
                  >
                    {entry.label}
                  </span>
                  <span className="block truncate text-[11.5px] font-semibold text-[var(--sf-soft)]">
                    {entry.locked ? `${entry.trail} · Locked` : entry.trail}
                  </span>
                </span>
                {entry.badge ? <GardenNavBadge count={entry.badge.count} label={entry.badge.label} /> : null}
                {selected ? (
                  <CornerDownLeft aria-hidden className="h-3.5 w-3.5 shrink-0 text-[var(--sf-ink)]/40" />
                ) : null}
              </>
            );
            const shared = {
              id: `${listId}-opt-${index}`,
              role: "option" as const,
              "aria-selected": selected,
              tabIndex: -1,
              onMouseEnter: () => setHighlight(index),
              className: rowClass,
            };
            return (
              <li key={entry.key} role="presentation">
                {entry.locked ? (
                  <div {...shared} onClick={() => nav.onLockedSelect?.(entry.label)} aria-haspopup="dialog">
                    {body}
                  </div>
                ) : (
                  <Link
                    {...shared}
                    href={entry.href}
                    onClick={(event) => {
                      nav.onLinkClick(event, entry.href);
                      setQuery("");
                    }}
                  >
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
