"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, User } from "lucide-react";
import SchoolParentAvatar from "@/components/school-parent/SchoolParentAvatar";
import ButtonLoadingLabel from "@/components/ui/ButtonLoadingLabel";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { SchoolAdminUserProfile } from "@/lib/school-admin/access";

type SchoolAdminProfileMenuProps = {
  C: AdminThemeTokens;
  userProfile: SchoolAdminUserProfile;
  isExpanded: boolean;
  onSignOut: () => Promise<void>;
};

type PopoverPosition = {
  top: number;
  left: number;
};

const POPOVER_GAP = 8;

function profileInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "?";
}

export default function SchoolAdminProfileMenu({
  C,
  userProfile,
  isExpanded,
  onSignOut,
}: SchoolAdminProfileMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePopoverPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setPopoverPosition({
      left: rect.right + POPOVER_GAP,
      top: rect.bottom,
    });
  };

  useLayoutEffect(() => {
    if (!menuOpen) return;

    updatePopoverPosition();

    let frameId = 0;
    const scheduleUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updatePopoverPosition();
      });
    };

    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [menuOpen, isExpanded]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setSigningOut(false);
      setMenuOpen(false);
    }
  };

  const initials = profileInitials(userProfile.displayName);

  const popover =
    menuOpen && popoverPosition
      ? createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[200] w-64 -translate-y-full rounded-md border py-1 shadow-lg"
            style={{
              top: popoverPosition.top,
              left: popoverPosition.left,
              borderColor: C.border,
              backgroundColor: C.surface,
            }}
            role="menu"
          >
            <div className="border-b px-3 py-2.5" style={{ borderColor: C.border }}>
              <p
                className="truncate text-sm font-semibold"
                style={{ color: C.textPrimary }}
              >
                {userProfile.displayName}
              </p>
              {userProfile.email ? (
                <p
                  className="mt-0.5 truncate text-xs"
                  style={{ color: C.textSecondary }}
                >
                  {userProfile.email}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm disabled:opacity-60"
              style={{ color: C.textPrimary }}
            >
              {!signingOut ? (
                <LogOut
                  className="h-4 w-4 shrink-0"
                  style={{ color: C.textSecondary }}
                />
              ) : null}
              <ButtonLoadingLabel loading={signingOut} loadingLabel="Signing out…">
                Sign out
              </ButtonLoadingLabel>
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="mb-2">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        title={userProfile.displayName}
        className="w-full flex items-center transition-colors duration-150"
        style={{
          justifyContent: isExpanded ? "flex-start" : "center",
          gap: isExpanded ? "8px" : 0,
          padding: "6px 8px",
          borderRadius: C.r.sm,
          color: C.textSecondary,
          cursor: "pointer",
          backgroundColor: "transparent",
          border: "none",
        }}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={userProfile.displayName}
      >
        {initials !== "?" ? (
          <SchoolParentAvatar initials={initials} color={C.accent} size="sm" />
        ) : (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            <User className="h-3.5 w-3.5" />
          </span>
        )}
        {isExpanded && (
          <span className="min-w-0 flex-1 truncate text-left text-xs font-medium">
            {userProfile.displayName}
          </span>
        )}
      </button>
      {popover}
    </div>
  );
}
