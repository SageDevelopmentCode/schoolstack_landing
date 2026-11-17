"use client";

import { ChevronDown, Globe } from "lucide-react";
import { formatOrganizationTimezoneLabel } from "@/lib/admissions/admissions-availability";
import type { DemoTimezoneOption } from "@/lib/marketing/demo-timezone-options";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type DemoTimezoneSelectProps = {
  value: string;
  options: DemoTimezoneOption[];
  onChange: (timezone: string) => void;
  storyTheme?: ParentThemeTokens;
  id?: string;
  compact?: boolean;
  /** "garden" needs a `.sf-garden` ancestor. */
  appearance?: "story" | "garden";
};

export function DemoTimezoneSelect({
  value,
  options,
  onChange,
  storyTheme,
  id = "demo-display-timezone",
  compact = false,
  appearance = "story",
}: DemoTimezoneSelectProps) {
  const label = formatOrganizationTimezoneLabel(value);

  if (appearance === "garden") {
    return (
      <div className="min-w-0">
        {!compact ? (
          <label
            htmlFor={id}
            className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]"
          >
            <Globe size={12} aria-hidden />
            Your timezone
          </label>
        ) : null}
        <div className="relative min-w-0">
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-w-0 cursor-pointer appearance-none rounded-full border-2 border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] py-2.5 pl-4 pr-9 text-[13px] font-bold text-[var(--sf-ink)] transition-colors hover:border-[var(--sf-ink)] focus-visible:border-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
            aria-label={`Timezone, currently ${label}`}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            strokeWidth={2.4}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--sf-soft)]"
            aria-hidden
          />
        </div>
      </div>
    );
  }

  const selectClass = storyTheme
    ? "w-full min-w-0 rounded-[10px] border py-2.5 pl-3 pr-8 text-[11px] font-semibold cursor-pointer appearance-none"
    : "w-full min-w-0 rounded-lg border border-border bg-bg py-1.5 pl-2 pr-8 text-[11px] font-medium font-secondary text-text cursor-pointer appearance-none";

  return (
    <div className={compact ? "min-w-0" : "space-y-1"}>
      {!compact ? (
        <label
          htmlFor={id}
          className={`flex items-center gap-1.5 mb-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] ${storyTheme ? "" : "font-secondary text-text-faint"}`}
          style={
            storyTheme
              ? { color: storyTheme.muted, fontFamily: storyTheme.fontBody }
              : undefined
          }
        >
          {storyTheme ? <Globe size={12} aria-hidden /> : null}
          {storyTheme ? "Your timezone" : "Timezone"}
        </label>
      ) : null}
      <div className="relative min-w-0">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={selectClass}
          style={
            storyTheme
              ? {
                  fontFamily: storyTheme.fontBody,
                  borderColor: storyTheme.line,
                  color: storyTheme.ink,
                  backgroundColor: "#F4F7F5",
                }
              : undefined
          }
          aria-label={`Timezone, currently ${label}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 shrink-0 ${storyTheme ? "" : "text-text-muted"}`}
          style={storyTheme ? { color: storyTheme.muted } : undefined}
          aria-hidden
        />
      </div>
    </div>
  );
}
