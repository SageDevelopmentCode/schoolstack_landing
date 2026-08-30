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
      <span
        className={`min-w-0 max-w-[10rem] flex-1 truncate text-sm font-medium ${
          isStory ? "hidden sm:block" : ""
        }`}
        style={{ color: nameColor }}
      >
        {firstName}
      </span>
      <ChevronDown
        className={`h-4 w-4 shrink-0 transition-transform ${menuOpen ? "rotate-180" : ""}`}
        style={{ color: chevronColor }}
      />
    </button>
  );
}
