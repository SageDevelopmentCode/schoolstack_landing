"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, Copy, Loader2, Search, X, type LucideIcon } from "lucide-react";
import { adminToast } from "@/lib/school-admin/admin-toast";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import {
  GChip,
  GSkeleton,
  G_FOCUS,
  G_INPUT,
  PANEL_TINTS,
  gBtnOnAccent,
  gBtnOutlineSm,
  gBtnPopSm,
  gLinkSm,
  type GChipTone,
} from "@/components/school-parent/garden/ui";
import { useHydrated } from "@/hooks/useHydrated";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { useAdminGardenSkin } from "./skin";
import { BusyLabel, GardenFilterChips, type GardenFilterOption } from "./kit";
import { GardenLoadError } from "@/components/school-admin/dashboard/garden/shared";

/*
 * Admin Garden blocks shared by the My School tabs (Staff, Classrooms,
 * Students, Tuition, Friday Branch…). Rules:
 * `.claude/skills/admin-portal-garden-design/SKILL.md`.
 */

/* ------------------------------------------------------------------ */
/* Overlay scope                                                       */
/* ------------------------------------------------------------------ */

/**
 * Portals an overlay to <body> inside the Garden scope + admin skin class, so
 * fixed panels escape transformed ancestors and raw inputs / hand-rolled
 * dialogs inside them take the Garden look. Renders nothing during SSR.
 */
export function GardenOverlayScope({
  theme,
  children,
}: {
  theme: ParentThemeTokens;
  children: ReactNode;
}) {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return createPortal(
    <ParentGardenScope theme={theme} className="contents sf-admin-garden-skin">
      {children}
    </ParentGardenScope>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/* Avatars                                                             */
/* ------------------------------------------------------------------ */

export function gInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function hashIndex(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

/** Initials on a pastel tile (pastel picked from the name, so it's stable). */
export function GardenAvatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "sm" ? "h-8 w-8 text-[12px] rounded-[10px]" : size === "lg" ? "h-12 w-12 text-[16px] rounded-[15px]" : "h-10 w-10 text-[13px] rounded-[12px]";
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center font-extrabold text-[var(--sf-ink)]/70 ${sizeClass} ${
        PANEL_TINTS[hashIndex(name) % PANEL_TINTS.length]
      } ${className}`}
    >
      {gInitials(name)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Lead strip                                                          */
/* ------------------------------------------------------------------ */

/**
 * "Needs attention" strip: a solid accent button/link with an ink border and
 * toy shadow. One per page, sentence built from data.
 */
export function GardenLeadStrip({
  kicker = "Needs attention",
  title,
  meta,
  cta,
  icon: Icon,
  onClick,
  href,
  busy,
  "data-testid": testId,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  cta: ReactNode;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  busy?: boolean;
  "data-testid"?: string;
}) {
  const reduce = useReducedMotion() === true;
  const className =
    "group flex w-full flex-col items-start gap-3 rounded-[22px] border-2 border-[var(--sf-ink)] bg-[var(--sf-clay)] px-5 py-4 text-left text-white no-underline shadow-[0_4px_0_0_var(--sf-ink)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/35 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-80 sm:flex-row sm:items-center sm:justify-between";
  const body = (
    <>
      <span className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)]"
        >
          <Icon className="h-5 w-5 text-[var(--sf-ink)]" />
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/75">{kicker}</span>
          <span className="mt-0.5 block text-[16px] font-extrabold leading-snug">{title}</span>
          {meta ? <span className="block text-[13px] font-semibold text-white/80">{meta}</span> : null}
        </span>
      </span>
      <span className={gBtnOnAccent}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {cta}
        {busy ? null : <ArrowRight className="h-4 w-4" aria-hidden />}
      </span>
    </>
  );
  const motionProps = {
    initial: reduce ? false : { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  } as const;
  if (href) {
    return (
      <motion.div {...motionProps}>
        <Link href={href} className={className} data-testid={testId}>
          {body}
        </Link>
      </motion.div>
    );
  }
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-busy={busy || undefined}
      className={className}
      data-testid={testId}
      {...motionProps}
    >
      {body}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

export function GardenSearchInput({
  value,
  onChange,
  placeholder,
  label,
  className = "",
  "data-testid": testId,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sf-ink)]/45"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        data-garden-skip
        data-testid={testId}
        className={`${G_INPUT} !pl-10 ${value ? "!pr-10" : ""}`}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className={`absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--sf-ink)]/55 hover:bg-[var(--sf-ink)]/[0.06] hover:text-[var(--sf-ink)] ${G_FOCUS}`}
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Record list (list + detail pages)                                   */
/* ------------------------------------------------------------------ */

export type GardenRecordItem = {
  id: string;
  title: string;
  meta?: ReactNode;
  chip?: { tone: GChipTone; label: string } | null;
  leading?: ReactNode;
  /** Extra hidden text matched by search (emails, roles…). */
  searchText?: string;
};

/** Grid for a list card + detail card (stacks below `lg`). */
export const GARDEN_LIST_DETAIL_GRID = "grid items-start gap-5 lg:grid-cols-[minmax(290px,370px)_minmax(0,1fr)]";

/**
 * List card for list + detail pages: search, optional filter chips, rows
 * (14px radius, accent wash when selected, mint flash after a save), an
 * empty state and a "no match" state with a reset link.
 */
export function GardenRecordList({
  title,
  kicker,
  items,
  selectedId,
  onSelect,
  flashId,
  searchPlaceholder,
  searchLabel,
  filters,
  emptyState,
  noun,
  action,
  loading,
  error,
  onRetry,
  detailAnchorId,
  "data-testid": testId,
}: {
  title: ReactNode;
  kicker?: ReactNode;
  items: GardenRecordItem[];
  /** Below `lg` the detail card sits under the list: scroll to it on select. */
  detailAnchorId?: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  flashId?: string | null;
  searchPlaceholder: string;
  searchLabel: string;
  filters?: { options: GardenFilterOption[]; value: string; onChange: (key: string) => void; ariaLabel: string };
  emptyState?: ReactNode;
  noun: { one: string; many: string };
  action?: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  "data-testid"?: string;
}) {
  const [query, setQuery] = useState("");
  const listId = useId();
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.title} ${item.searchText ?? ""}`.toLowerCase().includes(q),
    );
  }, [items, query]);
  const filterActive = Boolean(filters && filters.value !== filters.options[0]?.key);

  return (
    <section
      aria-label={typeof title === "string" ? title : undefined}
      data-testid={testId}
      className="flex min-w-0 flex-col rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-4 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:p-5 lg:sticky lg:top-4"
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {kicker ? (
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">{kicker}</p>
          ) : null}
          <h2 className="m-0 text-[17px] font-extrabold text-[var(--sf-ink)]">{title}</h2>
        </div>
        {action}
      </div>
      {loading ? (
        <div className="flex flex-col gap-2" role="status" aria-live="polite">
          <span className="sr-only">Loading {noun.many}</span>
          <GSkeleton className="h-11 !rounded-[14px]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <GSkeleton key={i} className="h-[54px] !rounded-[14px]" />
          ))}
        </div>
      ) : error && items.length === 0 ? (
        <GardenLoadError title={`Couldn't load ${noun.many}`} description={error} onRetry={onRetry ?? (() => {})} />
      ) : items.length === 0 && !filterActive ? (
        emptyState
      ) : (
        <>
          <GardenSearchInput
            value={query}
            onChange={setQuery}
            placeholder={searchPlaceholder}
            label={searchLabel}
            className="mb-3"
          />
          {filters ? (
            <GardenFilterChips
              options={filters.options}
              value={filters.value}
              onChange={filters.onChange}
              ariaLabel={filters.ariaLabel}
              className="mb-3"
            />
          ) : null}
          <p className="sr-only" aria-live="polite">
            {visible.length} {visible.length === 1 ? noun.one : noun.many} shown
          </p>
          {visible.length === 0 ? (
            <div className="rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
              No {noun.many} match {query ? <>&ldquo;{query}&rdquo;</> : "this filter"}.{" "}
              <button
                type="button"
                className={gLinkSm}
                onClick={() => {
                  setQuery("");
                  if (filters) filters.onChange(filters.options[0]?.key ?? "");
                }}
              >
                Show all {noun.many}
              </button>
            </div>
          ) : (
            <ul
              id={listId}
              className="m-0 flex max-h-[min(62vh,640px)] list-none flex-col gap-1 overflow-y-auto p-0 pr-0.5 max-lg:max-h-[300px]"
            >
              {visible.map((item) => {
                const selected = item.id === selectedId;
                const flashed = item.id === flashId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(item.id);
                        if (detailAnchorId && window.matchMedia("(max-width: 1023px)").matches) {
                          window.requestAnimationFrame(() =>
                            document.getElementById(detailAnchorId)?.scrollIntoView({ behavior: "smooth", block: "start" }),
                          );
                        }
                      }}
                      aria-current={selected ? "true" : undefined}
                      className={`flex w-full items-center gap-3 rounded-[14px] border-[1.5px] px-3 py-2.5 text-left transition-colors duration-300 ${
                        flashed
                          ? "border-[var(--sf-forest)]/35 bg-[var(--sf-mint)]"
                          : selected
                            ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)]"
                            : "border-transparent hover:bg-[var(--sf-accent-wash)]"
                      } ${G_FOCUS} focus-visible:ring-inset`}
                    >
                      {item.leading ?? <GardenAvatar name={item.title} size="sm" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{item.title}</span>
                        {item.meta ? (
                          <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">{item.meta}</span>
                        ) : null}
                      </span>
                      {item.chip ? <GChip tone={item.chip.tone}>{item.chip.label}</GChip> : null}
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 ${selected ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-ink)]/30"}`}
                        aria-hidden
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Table recipe                                                        */
/* ------------------------------------------------------------------ */

export const G_TABLE = "w-full border-separate border-spacing-0 text-left";
export const G_TH =
  "border-b-[1.5px] border-[var(--sf-ink)]/10 px-3 pb-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]";
export const G_TD = "border-b border-[var(--sf-ink)]/[0.06] px-3 py-3 align-middle";

export function gRowClass({
  selected = false,
  flashed = false,
  interactive = false,
}: {
  selected?: boolean;
  flashed?: boolean;
  interactive?: boolean;
}): string {
  return `transition-colors duration-300 ${interactive ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sf-clay)]/45" : ""} ${
    flashed
      ? "bg-[var(--sf-mint)]"
      : selected
        ? "bg-[var(--sf-accent-wash)]"
        : interactive
          ? "hover:bg-[var(--sf-accent-wash)]"
          : ""
  }`;
}

/** Dims content and shows a spinner while a list refetches. */
export function GardenRefetchVeil({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div className="relative" aria-busy={active || undefined}>
      {active ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-16" aria-hidden>
          <Loader2 className="h-5 w-5 animate-spin text-[var(--sf-clay)]" />
        </div>
      ) : null}
      <div className={`transition-opacity duration-200 ${active ? "opacity-55" : ""}`}>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Detail helpers                                                      */
/* ------------------------------------------------------------------ */

/** Label / value grid for record details. */
export function GardenFacts({
  items,
  className = "",
}: {
  items: { label: string; value: ReactNode; hint?: ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={`m-0 grid gap-x-6 gap-y-3 sm:grid-cols-2 ${className}`}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]">{item.label}</dt>
          <dd className="m-0 mt-0.5 break-words text-[14px] font-bold text-[var(--sf-ink)]">{item.value}</dd>
          {item.hint ? <dd className="m-0 text-[12px] font-semibold text-[var(--sf-soft)]">{item.hint}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

/** Kicker + count chip above a group of rows. */
export function GardenGroupHeading({
  children,
  count,
  action,
}: {
  children: ReactNode;
  count?: number;
  action?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <p className="m-0 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
        {children}
        {count != null ? <GChip tone="neutral">{count}</GChip> : null}
      </p>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Picker sheet                                                        */
/* ------------------------------------------------------------------ */

export type GardenPickerOption = {
  id: string;
  label: string;
  meta?: ReactNode;
  group?: string;
  leading?: ReactNode;
  disabled?: boolean;
  disabledReason?: string;
  searchText?: string;
};

/**
 * Garden picker drawer (single or multi select). `onSave` returns whether
 * the save worked: the sheet only closes on success, so a failed save keeps
 * the admin's selection for Retry.
 */
export function GardenPickerSheet({
  open,
  onClose,
  title,
  subtitle,
  kicker,
  options,
  initialSelected,
  multiple = true,
  onSave,
  saveLabel,
  savingLabel = "Saving…",
  loading,
  loadError,
  onRetryLoad,
  emptyState,
  searchPlaceholder = "Search",
  testId,
  extra,
  allowEmpty = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  kicker?: ReactNode;
  options: GardenPickerOption[];
  initialSelected: string[];
  multiple?: boolean;
  onSave: (selected: string[]) => Promise<boolean>;
  saveLabel: (count: number) => string;
  savingLabel?: string;
  loading?: boolean;
  loadError?: string | null;
  onRetryLoad?: () => void;
  emptyState?: ReactNode;
  searchPlaceholder?: string;
  testId: string;
  extra?: ReactNode;
  allowEmpty?: boolean;
}) {
  const skin = useAdminGardenSkin();
  const panelId = useId().replace(/:/g, "");
  // Reset the draft each time the sheet opens (previous-props pattern).
  const [wasOpen, setWasOpen] = useState(open);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setSelected(initialSelected);
      setQuery("");
    }
  }

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? options.filter((option) => `${option.label} ${option.searchText ?? ""} ${option.group ?? ""}`.toLowerCase().includes(q))
      : options;
    const map = new Map<string, GardenPickerOption[]>();
    for (const option of filtered) {
      const key = option.group ?? "";
      map.set(key, [...(map.get(key) ?? []), option]);
    }
    return [...map.entries()];
  }, [options, query]);

  if (!skin) return null;

  const toggle = (id: string) => {
    if (!multiple) {
      setSelected([id]);
      return;
    }
    setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  };
  const unchanged =
    selected.length === initialSelected.length && selected.every((id) => initialSelected.includes(id));
  const save = async () => {
    setSaving(true);
    try {
      const ok = await onSave(selected);
      if (ok) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <GardenOverlayScope theme={skin}>
    <GSidePanel
      theme={skin}
      open={open}
      onClose={saving ? () => {} : onClose}
      title={title}
      kicker={kicker}
      subtitle={subtitle}
      testId={testId}
      panelId={`picker-${panelId}`}
      footer={
        <>
          <span className="mr-auto text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]/70" aria-live="polite">
            {multiple ? `${selected.length} selected` : selected.length ? "1 selected" : "None selected"}
          </span>
          <button type="button" className={gBtnOutlineSm} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className={gBtnPopSm}
            onClick={() => void save()}
            disabled={saving || unchanged || (!allowEmpty && selected.length === 0) || loading}
            aria-busy={saving || undefined}
            data-testid={`${testId}-save`}
          >
            <BusyLabel busy={saving} busyLabel={savingLabel} icon={<Check className="h-4 w-4" aria-hidden />}>
              {saveLabel(selected.length)}
            </BusyLabel>
          </button>
        </>
      }
    >
      <div className="sf-admin-garden-skin flex flex-col gap-4">
        {extra}
        {loading ? (
          <div className="flex flex-col gap-2" role="status" aria-live="polite">
            <span className="sr-only">Loading options</span>
            {Array.from({ length: 6 }).map((_, i) => (
              <GSkeleton key={i} className="h-[52px] !rounded-[14px]" />
            ))}
          </div>
        ) : loadError ? (
          <GardenLoadError title="Couldn't load the list" description={loadError} onRetry={onRetryLoad ?? (() => {})} />
        ) : options.length === 0 ? (
          emptyState
        ) : (
          <>
            <GardenSearchInput value={query} onChange={setQuery} placeholder={searchPlaceholder} label={searchPlaceholder} />
            {groups.length === 0 ? (
              <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
                Nothing matches &ldquo;{query}&rdquo;.{" "}
                <button type="button" className={gLinkSm} onClick={() => setQuery("")}>
                  Clear search
                </button>
              </p>
            ) : (
              groups.map(([group, rows]) => (
                <div key={group || "all"}>
                  {group ? <GardenGroupHeading count={rows.length}>{group}</GardenGroupHeading> : null}
                  <ul className="m-0 flex list-none flex-col gap-1 p-0" role={multiple ? "group" : "radiogroup"}>
                    {rows.map((option) => {
                      const checked = selected.includes(option.id);
                      return (
                        <li key={option.id}>
                          <button
                            type="button"
                            role={multiple ? "checkbox" : "radio"}
                            aria-checked={checked}
                            disabled={option.disabled}
                            onClick={() => toggle(option.id)}
                            title={option.disabled ? option.disabledReason : undefined}
                            className={`flex w-full items-center gap-3 rounded-[14px] border-[1.5px] px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
                              checked
                                ? "border-[var(--sf-clay)]/45 bg-[var(--sf-accent-wash)]"
                                : "border-[var(--sf-ink)]/10 bg-white hover:border-[var(--sf-ink)]/25"
                            } ${G_FOCUS} focus-visible:ring-inset`}
                          >
                            <span
                              aria-hidden
                              className={`flex h-5 w-5 shrink-0 items-center justify-center border-[1.5px] ${
                                multiple ? "rounded-[6px]" : "rounded-full"
                              } ${checked ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white" : "border-[var(--sf-ink)]/30 bg-white"}`}
                            >
                              {checked ? <Check className="h-3 w-3" strokeWidth={3.5} /> : null}
                            </span>
                            {option.leading ?? null}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{option.label}</span>
                              {option.meta ? (
                                <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                                  {option.disabled && option.disabledReason ? option.disabledReason : option.meta}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </GSidePanel>
    </GardenOverlayScope>
  );
}

/* ------------------------------------------------------------------ */
/* Tab panel header                                                    */
/* ------------------------------------------------------------------ */

/** Small "how this works" helper line with an icon, for clear next steps. */
export function GardenHint({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <p className="m-0 flex items-start gap-2 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
      {Icon ? <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
      <span>{children}</span>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Copy row                                                            */
/* ------------------------------------------------------------------ */

/**
 * URL / value with a Copy button: "Copied" + check for 2s and a toast; on
 * failure the error toast shows the value so it can be copied by hand.
 */
export function GardenCopyRow({
  value,
  label = "Link",
  toastTitle = "Link copied.",
  "data-testid": testId,
}: {
  value: string;
  label?: string;
  toastTitle?: string;
  "data-testid"?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
      adminToast.success(toastTitle, { id: `copy-${label}` });
    } catch {
      adminToast.error("Couldn't copy automatically.", {
        id: `copy-${label}-error`,
        description: `Select and copy it here: ${value}`,
      });
    }
  };
  return (
    <div
      className="flex min-w-0 items-center gap-2 rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-paper)] py-1.5 pl-3.5 pr-1.5"
      data-testid={testId}
    >
      <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] font-semibold text-[var(--sf-ink)]/80" title={value}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1.5 text-[12.5px] font-extrabold transition-colors ${
          copied
            ? "border-[var(--sf-forest)]/40 bg-[var(--sf-mint)] text-[var(--sf-forest)]"
            : "border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)] hover:border-[var(--sf-ink)]/45"
        } ${G_FOCUS}`}
      >
        {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
