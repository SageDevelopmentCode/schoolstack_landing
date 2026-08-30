"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import ButtonLoadingLabel from "@/components/ui/ButtonLoadingLabel";
import ParentProfileMenuTrigger from "@/components/school-parent/ParentProfileMenuTrigger";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import StudentPhoto from "@/components/students/StudentPhoto";
import NavigationLink from "@/components/school/shared/NavigationLink";
import { MessagesNavBadge } from "@/components/messages/MessagesNavBadge";
import { useMessagesUnreadCount } from "@/lib/messages/use-messages-unread-count";
import {
  buildParentNavItems,
  isParentNavItemActive,
  splitParentNavForHeader,
  type ParentNavItem,
} from "@/lib/organization-settings/parent-nav";
import { getParentFeatureIconColor } from "@/lib/organization-settings/parent-feature-icon-styles";
import {
  CLIENT_AUTH_ACTIVITY_ACTIONS,
  reportAuthActivityAndWait,
} from "@/lib/activity-auth-client";
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
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  GuardianProfilePhotoClientError,
  uploadGuardianProfilePhotoFromParent,
} from "@/lib/guardians/upload-guardian-profile-photo-client";
import { parentToast } from "@/lib/school-parent/parent-toast";
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

const parentNavTextClass = "text-[13px] font-semibold";

function NavLink({
  item,
  pathname,
  theme,
  adminCompat,
  messagesUnreadCount,
}: {
  item: ParentNavItem;
  pathname: string;
  theme: ParentThemeTokens;
  adminCompat: ReturnType<typeof useParentTheme>["adminCompat"];
  messagesUnreadCount: number;
}) {
  const Icon = item.icon;
  const active = isParentNavItemActive(pathname, item);
  const iconColorClass = getParentFeatureIconColor(item.iconSlug);

  return (
    <NavigationLink
      href={item.href}
      className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 transition-colors ${parentNavTextClass}`}
      style={{
        backgroundColor: active ? theme.primaryLight : "transparent",
      }}
    >
      <Icon className={`h-3.5 w-3.5 shrink-0 ${iconColorClass}`} />
      <span style={{ color: active ? theme.primary : theme.muted }}>
        {item.name}
      </span>
      {item.key === "messages" ? (
        <MessagesNavBadge
          count={messagesUnreadCount}
          theme={{
            accent: adminCompat.accent,
            accentLight: adminCompat.accentLight,
          }}
        />
      ) : null}
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
  const { theme, adminCompat: C } = useParentTheme();
  const previewPortalOptions = usePreviewPortalOptions();
  const resolvedPortalOptions =
    previewMode && previewPortalOptions.length > 0
      ? previewPortalOptions
      : portalOptions;
  const showPreviewSwitcher =
    previewMode && shouldShowPortalSwitcher(resolvedPortalOptions);
  const supabase = useMemo(() => createClient(), []);
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    userProfile.profilePhotoUrl,
  );
  const [photoUploading, setPhotoUploading] = useState(false);
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
  const messagesEnabled = Boolean(features.parent.messages);
  const { unreadCount: messagesUnreadCount } = useMessagesUnreadCount(
    "/api/parent-portal/messages",
    organizationId,
    schoolName,
    messagesEnabled && !previewMode,
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
  const notificationsHref = previewParentBasePath
    ? `${previewParentBasePath}/notifications`
    : `/school/${slug}/parent/notifications`;
  const moreActive = more.some((item) => isParentNavItemActive(pathname, item));
  const canUploadPhoto = !previewMode;

  useEffect(() => {
    queueMicrotask(() => setProfilePhotoUrl(userProfile.profilePhotoUrl));
  }, [userProfile.profilePhotoUrl]);

  const handlePhotoUpload = useCallback(
    async (file: File) => {
      if (previewMode) return;

      setPhotoUploading(true);

      try {
        const nextUrl = await uploadGuardianProfilePhotoFromParent(
          organizationId,
          file,
        );
        setProfilePhotoUrl(nextUrl);
        parentToast.success("Profile photo updated.");
      } catch (error) {
        parentToast.error(
          error instanceof GuardianProfilePhotoClientError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Failed to upload photo.",
        );
      } finally {
        setPhotoUploading(false);
      }
    },
    [organizationId, previewMode],
  );

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
    <header
      className="relative z-40 shrink-0 border-b backdrop-blur-sm"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.89)",
        borderColor: theme.line,
      }}
    >
      <div className="mx-auto flex min-h-[64px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:min-h-[78px] sm:gap-4 sm:px-7">
        <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-sm transition-opacity hover:opacity-80"
          >
            <Image
              src="/images/schoolstack-logo.png"
              alt="SchoolStack"
              width={40}
              height={40}
              priority
              className="h-8 w-auto shrink-0 object-contain sm:h-10"
            />
          </Link>
          <div
            className="h-7 w-px shrink-0 sm:h-8"
            style={{ backgroundColor: theme.line }}
            aria-hidden
          />
          <NavigationLink href={homeHref} className="min-w-0 shrink rounded-sm transition-opacity hover:opacity-80">
            <SchoolDemoWordmark
              logo={{
                src: branding.logo.src,
                alt: branding.logo.alt || schoolName,
                width: branding.logo.width,
                height: branding.logo.height,
                text: branding.logo.src ? undefined : schoolName,
              }}
              className="h-8 w-auto max-w-[min(120px,28vw)] object-contain sm:max-w-[min(180px,40vw)] sm:h-10"
              sizes="(max-width: 640px) 160px, 200px"
            />
          </NavigationLink>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {primary.map((item) => (
            <NavLink
              key={item.key}
              item={item}
              pathname={pathname}
              theme={theme}
              adminCompat={C}
              messagesUnreadCount={messagesUnreadCount}
            />
          ))}
          {more.length > 0 ? (
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                className={`flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 transition-colors ${parentNavTextClass}`}
                style={{
                  color: moreActive ? theme.primary : theme.muted,
                  backgroundColor: moreActive ? theme.primaryLight : "transparent",
                }}
              >
                More
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${moreOpen ? "rotate-180" : ""}`}
                />
              </button>
              {moreOpen ? (
                <div
                  className="absolute right-0 z-[100] mt-1.5 w-52 rounded-xl py-1.5 shadow-lg"
                  style={{
                    border: `1px solid ${theme.line}`,
                    backgroundColor: theme.white,
                  }}
                >
                  {more.map((item) => {
                    const Icon = item.icon;
                    const active = isParentNavItemActive(pathname, item);
                    const iconColorClass = getParentFeatureIconColor(item.iconSlug);
                    return (
                      <NavigationLink
                        key={item.key}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-left transition-colors ${parentNavTextClass}`}
                        style={{
                          color: active ? theme.primary : theme.ink,
                          backgroundColor: active ? theme.primaryLight : "transparent",
                        }}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${iconColorClass}`} />
                        <span>{item.name}</span>
                        {item.key === "messages" ? (
                          <MessagesNavBadge
                            count={messagesUnreadCount}
                            theme={{
                              accent: C.accent,
                              accentLight: C.accentLight,
                            }}
                          />
                        ) : null}
                      </NavigationLink>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

        <div className="relative z-[100] shrink-0" ref={menuRef}>
          <ParentProfileMenuTrigger
            displayName={userProfile.displayName}
            profilePhotoUrl={profilePhotoUrl}
            theme={C}
            parentTheme={theme}
            variant="story"
            menuOpen={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          />
          {menuOpen ? (
            <div
              className="absolute right-0 top-full z-[100] mt-1.5 w-64 rounded-xl py-1 shadow-lg"
              style={{
                border: `1px solid ${theme.line}`,
                backgroundColor: theme.white,
              }}
              role="menu"
            >
              <div
                className="border-b px-3 py-3"
                style={{ borderColor: theme.line }}
              >
                <div className="flex items-start gap-3">
                  <StudentPhoto
                    name={userProfile.displayName}
                    photoUrl={profilePhotoUrl}
                    size="lg"
                    theme={C}
                    editable={canUploadPhoto}
                    uploading={photoUploading}
                    showEditHint={canUploadPhoto}
                    onFileSelect={(file) => void handlePhotoUpload(file)}
                  />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p
                      className="truncate text-sm font-semibold"
                      style={{ color: theme.ink }}
                    >
                      {userProfile.displayName}
                    </p>
                    {userProfile.email ? (
                      <p
                        className="mt-0.5 truncate text-xs"
                        style={{ color: theme.muted }}
                      >
                        {userProfile.email}
                      </p>
                    ) : null}
                  </div>
                </div>
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
                  className="block px-3 py-2 text-sm transition-colors hover:opacity-80"
                  style={{ color: theme.ink }}
                  onClick={() => setMenuOpen(false)}
                >
                  Your applications
                </NavigationLink>
              ) : null}
              <NavigationLink
                href={notificationsHref}
                className="block px-3 py-2 text-sm transition-colors hover:opacity-80"
                style={{ color: theme.ink }}
                onClick={() => setMenuOpen(false)}
              >
                Notification settings
              </NavigationLink>
              {!previewMode ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void handleSignOut()}
                  disabled={signingOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:opacity-80 disabled:opacity-60"
                  style={{ color: theme.ink }}
                >
                  {!signingOut ? (
                    <LogOut className="h-4 w-4" style={{ color: theme.muted }} />
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

      {navItems.length > 0 ? (
        <nav
          className="flex gap-1 overflow-x-auto border-t px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
          style={{ borderColor: theme.line }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              item={item}
              pathname={pathname}
              theme={theme}
              adminCompat={C}
              messagesUnreadCount={messagesUnreadCount}
            />
          ))}
        </nav>
      ) : null}
    </header>
  );
}
