"use client";

import type { SelectHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import { G_FOCUS, G_INPUT } from "./ui";

/*
 * Garden fields + table recipe shared by the parent, admin and teacher
 * Garden pages (the admin kit re-exports these under its Garden* names).
 * Everything here must render inside a Garden scope (ParentGardenFrame /
 * ParentGardenScope). Rules: `.agents/skills/parent-portal-garden-design/SKILL.md`.
 */

/** Input class with an error state. */
export function gInputClass(error?: string | null, extra = ""): string {
  return `${G_INPUT} ${error ? "!border-[#b4412f]/60 focus:!ring-[#b4412f]/15" : ""} ${extra}`;
}

export type GSelectOption = { value: string; label: string; disabled?: boolean };

/** Native Garden select with a drawn chevron. */
export function GSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  error,
  className = "",
  ...rest
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> & {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: GSelectOption[];
  placeholder?: string;
  error?: string | null;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        data-garden-skip
        className={`${gInputClass(error)} cursor-pointer appearance-none pr-10 ${className}`}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sf-ink)]/55"
      >
        <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Search box with a leading icon and a clear button. */
export function GSearchInput({
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
