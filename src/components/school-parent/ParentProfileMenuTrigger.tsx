"use client";

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
  variant?: "default" | "story";
  menuOpen?: boolean;
  contextLabel?: string;
  coopModeEnabled?: boolean;
  coopProgramLabel?: string;
  className?: string;
  onClick?: () => void;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "menu" | boolean;
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

export default function ParentProfileMenuTrigger({
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
}: ParentProfileMenuTriggerProps) {
  const initials = profileInitials(displayName);
  const firstName = profileFirstName(displayName);
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
}
