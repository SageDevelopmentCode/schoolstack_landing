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
import { MessagesNavBadge } from "@/components/messages/MessagesNavBadge";
import { useMessagesUnreadCount } from "@/lib/messages/use-messages-unread-count";
import {
  buildTeacherNavItems,
  isTeacherNavItemActive,
  splitTeacherNavForHeader,
  type TeacherNavItem,
} from "@/lib/organization-settings/teacher-nav";
import { getParentFeatureIconColor } from "@/lib/organization-settings/parent-feature-icon-styles";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { StaffUserProfile } from "@/lib/staff/teacher-portal-access";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";
import {
  StaffProfilePhotoClientError,
  uploadStaffProfilePhotoFromTeacher,
} from "@/lib/staff/upload-staff-profile-photo-client";
import { parentToast } from "@/lib/school-parent/parent-toast";
import { createClient } from "@/utils/supabase/client";

type SchoolTeacherHeaderProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: StaffUserProfile;
  previewMode?: boolean;
  previewBasePath?: string;
};

const teacherNavTextClass = "text-[13px] font-semibold";

function NavLink({
  item,
  pathname,
  theme,
  adminCompat,
  messagesUnreadCount,
}: {
  item: TeacherNavItem;
  pathname: string;
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
  messagesUnreadCount: number;
}) {
  const Icon = item.icon;
  const active = isTeacherNavItemActive(pathname, item);
  const iconColorClass = getParentFeatureIconColor(item.iconSlug);

  return (
    <Link
      href={item.href}
      className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 transition-colors ${teacherNavTextClass}`}
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
    </Link>
  );
}

export default function SchoolTeacherHeader({
  slug,
  organizationId,
  schoolName,
  branding,
  features,
  userProfile,
  previewMode = false,
  previewBasePath,
}: SchoolTeacherHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { theme, adminCompat: C } = useParentTheme();
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
      buildTeacherNavItems(
        slug,
        features.teacher,
        features.feature_nav?.teacher,
        previewBasePath,
      ),
    [slug, features.teacher, features.feature_nav?.teacher, previewBasePath],
  );
  const messagesEnabled = Boolean(features.teacher.messages) && !previewMode;
  const { unreadCount: messagesUnreadCount } = useMessagesUnreadCount(
    "/api/teacher-portal/messages",
    organizationId,
    schoolName,
    messagesEnabled,
  );
  const { primary, more } = useMemo(
    () => splitTeacherNavForHeader(navItems),
    [navItems],
  );
  const homeHref = navItems[0]?.href ?? `/school/${slug}/teacher/dashboard`;
  const moreActive = more.some((item) => isTeacherNavItemActive(pathname, item));

  useEffect(() => {
    queueMicrotask(() => setProfilePhotoUrl(userProfile.profilePhotoUrl));
  }, [userProfile.profilePhotoUrl]);

  const handlePhotoUpload = useCallback(
    async (file: File) => {
      if (previewMode) return;

      setPhotoUploading(true);

      try {
        const nextUrl = await uploadStaffProfilePhotoFromTeacher(
          organizationId,
          file,
        );
        setProfilePhotoUrl(nextUrl);
        parentToast.success("Profile photo updated.");
      } catch (error) {
        parentToast.error(
          error instanceof StaffProfilePhotoClientError
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
      await supabase.auth.signOut();
      router.replace(`/school/${slug}/teacher/login`);
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
          <Link
            href={homeHref}
            className="min-w-0 shrink rounded-sm transition-opacity hover:opacity-80"
          >
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
          </Link>
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
                className={`flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 transition-colors ${teacherNavTextClass}`}
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
                    const active = isTeacherNavItemActive(pathname, item);
                    const iconColorClass = getParentFeatureIconColor(item.iconSlug);
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-left transition-colors ${teacherNavTextClass}`}
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
                      </Link>
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
                      editable={!previewMode}
                      uploading={photoUploading}
                      showEditHint={!previewMode}
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
                {!previewMode ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void handleSignOut()}
                    disabled={signingOut}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:opacity-90 disabled:opacity-60"
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
          className="flex gap-1 overflow-x-auto border-t px-4 py-2 lg:hidden"
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
