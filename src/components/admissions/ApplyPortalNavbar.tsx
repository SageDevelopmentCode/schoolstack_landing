"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type ApplyPortalNavbarProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  userEmail: string;
  userDisplayName: string;
};

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

export default function ApplyPortalNavbar({
  branding,
  schoolName,
  schoolSlug,
  userEmail,
  userDisplayName,
}: ApplyPortalNavbarProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
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
      await supabase.auth.signOut();
      router.refresh();
    } finally {
      setSigningOut(false);
      setMenuOpen(false);
    }
  };

  const initials = profileInitials(userDisplayName);

  return (
    <header
      className="shrink-0 border-b px-4 sm:px-6"
      style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
    >
      <div className="flex h-14 w-full items-center justify-between gap-4">
        <Link href={`/school/${schoolSlug}/apply`} className="min-w-0 shrink">
          <SchoolDemoWordmark
            logo={{
              src: branding.logo.src,
              alt: branding.logo.alt || schoolName,
              width: branding.logo.width,
              height: branding.logo.height,
              text: branding.logo.src ? undefined : schoolName,
            }}
            className="h-7 w-auto max-w-[min(200px,50vw)] object-contain sm:h-8"
          />
        </Link>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex max-w-[min(240px,60vw)] items-center gap-2 rounded-md border px-2.5 py-1.5 text-left sm:px-3 sm:py-2"
            style={getAdminButtonStyle(C, "secondary")}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ backgroundColor: C.accentLight, color: C.accent }}
            >
              {initials !== "?" ? initials : <User className="h-3.5 w-3.5" />}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {userDisplayName}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              style={{ color: C.textTertiary }}
            />
          </button>

          {menuOpen ? (
            <div
              className="absolute right-0 top-full z-20 mt-1 w-64 rounded-md border py-1 shadow-lg"
              style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
              role="menu"
            >
              <div className="border-b px-3 py-2.5" style={{ borderColor: C.border }}>
                <p className="truncate text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {userDisplayName}
                </p>
                {userEmail ? (
                  <p className="mt-0.5 truncate text-xs" style={{ color: C.textSecondary }}>
                    {userEmail}
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
                <LogOut className="h-4 w-4 shrink-0" style={{ color: C.textSecondary }} />
                {signingOut ? "Signing out…" : "Log out"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
