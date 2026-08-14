"use client";

import { ChevronDown } from "lucide-react";
import SchoolParentAvatar from "@/components/school-parent/SchoolParentAvatar";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentProfileMenuTriggerProps = {
  displayName: string;
  profilePhotoUrl?: string | null;
  theme: AdminThemeTokens;
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
  menuOpen = false,
  className = "",
  onClick,
  "aria-expanded": ariaExpanded,
  "aria-haspopup": ariaHasPopup = "menu",
}: ParentProfileMenuTriggerProps) {
  const initials = profileInitials(displayName);
  const firstName = profileFirstName(displayName);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-[9rem] max-w-[min(280px,70vw)] items-center gap-2 px-3.5 py-2 text-left transition-opacity hover:opacity-90 ${className}`}
      style={{
        ...getAdminButtonStyle(C, "secondary"),
        borderRadius: C.r.full,
      }}
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
        className="min-w-0 max-w-[10rem] flex-1 truncate text-sm font-medium"
        style={{ color: C.accent }}
      >
        {firstName}
      </span>
      <ChevronDown
        className={`h-4 w-4 shrink-0 transition-transform ${menuOpen ? "rotate-180" : ""}`}
        style={{ color: C.textTertiary }}
      />
    </button>
  );
}
