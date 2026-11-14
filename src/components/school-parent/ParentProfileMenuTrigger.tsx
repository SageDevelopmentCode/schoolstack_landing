"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import SchoolParentAvatar from "@/components/school-parent/SchoolParentAvatar";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentProfileMenuTriggerProps = {
  displayName: string;
  profilePhotoUrl?: string | null;
  theme: AdminThemeTokens;
  parentTheme?: ParentThemeTokens;
  /** `garden`: parent portal Garden header (render inside a Garden scope). */
  variant?: "default" | "story" | "garden";
  menuOpen?: boolean;
  contextLabel?: string;
  coopModeEnabled?: boolean;
  coopProgramLabel?: string;
  className?: string;
  onClick?: () => void;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "menu" | "dialog" | boolean;
  "aria-controls"?: string;
  "data-testid"?: string;
};

export function profileInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "?";
}

export function profileFirstName(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 1) {
    return parts[0];
  }
  return displayName.trim() || "Account";
}

const ParentProfileMenuTrigger = forwardRef<
  HTMLButtonElement,
  ParentProfileMenuTriggerProps
>(function ParentProfileMenuTrigger({
  displayName,
  profilePhotoUrl,
  theme: C,
  parentTheme,
  variant = "default",
  menuOpen = false,
  contextLabel,
  coopModeEnabled = false,
  coopProgramLabel,
  className = "",
  onClick,
  "aria-expanded": ariaExpanded,
  "aria-haspopup": ariaHasPopup = "menu",
  "aria-controls": ariaControls,
  "data-testid": testId,
}, ref) {
  const initials = profileInitials(displayName);
  const firstName = profileFirstName(displayName);

  if (variant === "garden") {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        data-testid={testId}
        className={`group flex min-w-0 max-w-[min(280px,70vw)] items-center gap-2 rounded-full border-[1.5px] bg-white py-1 pl-1 pr-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/35 sm:min-w-[10rem] sm:pr-3.5 ${
          menuOpen
            ? "border-[var(--sf-clay)] shadow-[0_0_0_3px_var(--sf-accent-wash)]"
            : "border-[var(--sf-ink)]/15 shadow-[0_2px_0_0_rgba(43,36,29,0.08)]"
        } ${className}`}
        aria-expanded={ariaExpanded ?? menuOpen}
        aria-haspopup={ariaHasPopup}
        aria-controls={ariaControls}
        aria-label={`Account menu for ${displayName}`}
      >
        <span className="rounded-full ring-[1.5px] ring-[var(--sf-ink)]/80 ring-offset-1 ring-offset-white">
          <SchoolParentAvatar
            initials={initials}
            color={parentTheme?.primary ?? C.accent}
            size="md"
            src={profilePhotoUrl ?? undefined}
          />
        </span>
        <span className="hidden min-w-0 flex-1 sm:block">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="block max-w-[10rem] truncate text-[14px] font-extrabold leading-tight text-[var(--sf-ink)]">
              {firstName}
            </span>
            {coopModeEnabled ? (
              <span className="shrink-0 rounded-full bg-[var(--sf-sky)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#24507a]">
                Co-op
              </span>
            ) : null}
          </span>
          {contextLabel || (coopModeEnabled && coopProgramLabel) ? (
            <span className="mt-0.5 block max-w-[11rem] truncate text-[12px] font-semibold leading-tight text-[var(--sf-soft)]">
              {contextLabel ?? coopProgramLabel}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--sf-ink)]/55 transition-transform duration-200 group-hover:text-[var(--sf-ink)] ${menuOpen ? "rotate-180" : ""}`}
          strokeWidth={2.6}
          aria-hidden
        />
      </button>
    );
  }
  const isStory = variant === "story" && parentTheme;

  const buttonStyle: React.CSSProperties = isStory
    ? {
        backgroundColor: parentTheme.primarySoft,
        border: `1px solid ${parentTheme.line}`,
        borderRadius: "9999px",
        boxShadow: parentTheme.shadowPill,
      }
    : {
        ...getAdminButtonStyle(C, "secondary"),
        borderRadius: C.r.full,
      };

  const nameColor = isStory ? parentTheme.primary : C.accent;
  const chevronColor = isStory ? parentTheme.muted : C.textTertiary;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 text-left transition-opacity hover:opacity-90 ${
        isStory
          ? "min-w-0 max-w-[min(280px,70vw)] rounded-full px-2.5 py-1.5 sm:min-w-[9rem] sm:px-3.5 sm:py-2"
          : "min-w-[9rem] max-w-[min(280px,70vw)] px-3.5 py-2"
      } ${className}`}
      style={buttonStyle}
      aria-expanded={ariaExpanded ?? menuOpen}
      aria-haspopup={ariaHasPopup}
      aria-label={displayName}
    >
      <SchoolParentAvatar
        initials={initials}
        color={C.accent}
        size="sm"
        src={profilePhotoUrl ?? undefined}
      />
      <span className={`min-w-0 flex-1 ${isStory ? "hidden sm:block" : ""}`}>
        <span className="flex min-w-0 items-center gap-2">
          <span
            className="block max-w-[10rem] truncate text-sm font-medium"
            style={{ color: nameColor }}
          >
            {firstName}
          </span>
          {coopModeEnabled ? (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em]"
              style={{
                backgroundColor: parentTheme?.infoBg ?? C.accentLight,
                color: parentTheme?.primary ?? C.accent,
              }}
            >
              Co-op
            </span>
          ) : null}
        </span>
        {contextLabel ? (
          <span
            className="mt-0.5 block max-w-[10rem] truncate text-[11px] font-semibold"
            style={{ color: parentTheme?.muted ?? C.textTertiary }}
          >
            {contextLabel}
          </span>
        ) : coopModeEnabled && coopProgramLabel ? (
          <span
            className="mt-0.5 block max-w-[10rem] truncate text-[11px] font-semibold sm:hidden"
            style={{ color: parentTheme?.muted ?? C.textTertiary }}
          >
            {coopProgramLabel}
          </span>
        ) : null}
      </span>
      <ChevronDown
        className={`h-4 w-4 shrink-0 transition-transform ${menuOpen ? "rotate-180" : ""}`}
        style={{ color: chevronColor }}
      />
    </button>
  );
});

export default ParentProfileMenuTrigger;
