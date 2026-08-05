"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import ButtonLoadingLabel from "@/components/ui/ButtonLoadingLabel";
import SchoolParentAvatar from "@/components/school-parent/SchoolParentAvatar";
import NavigationLink from "@/components/school/shared/NavigationLink";
import {
  buildParentNavItems,
  isParentNavItemActive,
  splitParentNavForHeader,
  type ParentNavItem,
} from "@/lib/organization-settings/parent-nav";
import {
  CLIENT_AUTH_ACTIVITY_ACTIONS,
  reportAuthActivityAndWait,
} from "@/lib/activity-auth-client";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import SchoolPortalSwitcherMenuItems from "@/components/school/shared/SchoolPortalSwitcherMenuItems";
import { usePreviewPortalOptions } from "@/components/admin/PreviewPortalOptionsProvider";
import {
  detectPortalFromPathname,
  shouldShowPortalSwitcher,
  type SchoolPortalOption,
} from "@/lib/auth/portal-switcher-types";
import type {
  FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type SchoolParentHeaderProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: FamilyUserProfile;
  portalOptions?: SchoolPortalOption[];
  previewMode?: boolean;
  previewBasePath?: string;
  previewParentBasePath?: string;
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

function NavLink({
  item,
  pathname,
  C,
}: {
  item: ParentNavItem;
  pathname: string;
  C: AdminThemeTokens;
}) {
  const Icon = item.icon;
  const active = isParentNavItemActive(pathname, item);

  return (
    <NavigationLink
      href={item.href}
      className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
      style={{
        color: active ? C.accent : C.textSecondary,
        backgroundColor: active ? C.accentLight : "transparent",
        fontWeight: active ? 600 : 500,
      }}
    >
      <Icon className="h-3.5 w-3.5" />
      {item.name}
    </NavigationLink>
  );
}

export default function SchoolParentHeader({
  slug,
  organizationId,
  schoolName,
  branding,
  features,
  userProfile,
  portalOptions = [],
  previewMode = false,
  previewBasePath,
  previewParentBasePath,
}: SchoolParentHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const previewPortalOptions = usePreviewPortalOptions();
  const resolvedPortalOptions =
    previewMode && previewPortalOptions.length > 0
      ? previewPortalOptions
      : portalOptions;
  const showPreviewSwitcher =
    previewMode && shouldShowPortalSwitcher(resolvedPortalOptions);
  const supabase = useMemo(() => createClient(), []);
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = useMemo(
    () =>
      buildParentNavItems(
        slug,
        features.parent,
        features.feature_nav?.parent,
        previewParentBasePath,
      ),
    [slug, features.parent, features.feature_nav?.parent, previewParentBasePath],
  );
  const { primary, more } = useMemo(
    () => splitParentNavForHeader(navItems),
    [navItems],
  );
  const homeHref =
    navItems[0]?.href ??
    (previewParentBasePath
      ? `${previewParentBasePath}/portal`
      : `/school/${slug}/parent/portal`);
  const applicationsHref = previewBasePath ?? `/school/${slug}/apply`;
  const moreActive = more.some((item) => isParentNavItemActive(pathname, item));
  const initials = profileInitials(userProfile.displayName);

  useEffect(() => {
    if (!moreOpen) return;
    const handler = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await reportAuthActivityAndWait({
        action: CLIENT_AUTH_ACTIVITY_ACTIONS.SIGNED_OUT,
        organizationId,
        surface: "parent_portal",
        metadata: {
          page: "/parent",
          organizationSlug: slug,
        },
      });
      await supabase.auth.signOut();
      router.refresh();
    } finally {
      setSigningOut(false);
      setMenuOpen(false);
    }
  };

  return (
    <header className="shrink-0 border-b border-gray-100 bg-white">
      <div className="flex items-center px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <NavigationLink href={homeHref} className="min-w-0 shrink">
            <SchoolDemoWordmark
              logo={{
                src: branding.logo.src,
                alt: branding.logo.alt || schoolName,
                width: branding.logo.width,
                height: branding.logo.height,
                text: branding.logo.src ? undefined : schoolName,
              }}
              className="h-8 w-auto max-w-[min(180px,40vw)] object-contain sm:h-10"
            />
          </NavigationLink>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {primary.map((item) => (
            <NavLink key={item.key} item={item} pathname={pathname} C={C} />
          ))}
          {more.length > 0 ? (
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  color: moreActive ? C.accent : C.textSecondary,
                  backgroundColor: moreActive ? C.accentLight : "transparent",
                  fontWeight: moreActive ? 600 : 500,
                }}
              >
                More
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${moreOpen ? "rotate-180" : ""}`}
                />
              </button>
              {moreOpen ? (
                <div className="absolute right-0 z-50 mt-1.5 w-52 rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg">
                  {more.map((item) => {
                    const Icon = item.icon;
                    const active = isParentNavItemActive(pathname, item);
                    return (
                      <NavigationLink
                        key={item.key}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
                        style={{
                          color: active ? C.accent : "#4B5563",
                          backgroundColor: active ? C.accentLight : "transparent",
                          fontWeight: active ? 500 : 400,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </NavigationLink>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

        <div className="flex flex-1 justify-end">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-gray-50"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <SchoolParentAvatar initials={initials} color={C.accent} size="sm" />
            </button>
            {menuOpen ? (
              <div
                className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
                role="menu"
              >
                <div className="border-b border-gray-100 px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {userProfile.displayName}
                  </p>
                  {userProfile.email ? (
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {userProfile.email}
                    </p>
                  ) : null}
                </div>
                <SchoolPortalSwitcherMenuItems
                  C={C}
                  options={resolvedPortalOptions}
                  currentPortal={detectPortalFromPathname(pathname, slug)}
                  onNavigate={() => setMenuOpen(false)}
                />
                {!showPreviewSwitcher ? (
                <NavigationLink
                  href={applicationsHref}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Your applications
                </NavigationLink>
                ) : null}
                {!previewMode ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void handleSignOut()}
                    disabled={signingOut}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    {!signingOut ? (
                      <LogOut className="h-4 w-4 text-gray-500" />
                    ) : null}
                    <ButtonLoadingLabel loading={signingOut} loadingLabel="Signing out…">
                      Log out
                    </ButtonLoadingLabel>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {navItems.length > 0 ? (
        <nav className="flex gap-1 overflow-x-auto border-t border-gray-100 px-4 py-2 lg:hidden">
          {navItems.map((item) => (
            <NavLink key={item.key} item={item} pathname={pathname} C={C} />
          ))}
        </nav>
      ) : null}
    </header>
  );
}
