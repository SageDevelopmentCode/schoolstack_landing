"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import ButtonLoadingLabel from "@/components/ui/ButtonLoadingLabel";
import ParentProfileMenuTrigger from "@/components/school-parent/ParentProfileMenuTrigger";
import StudentPhoto from "@/components/students/StudentPhoto";
import { MessagesNavBadge } from "@/components/messages/MessagesNavBadge";
import { useMessagesUnreadCount } from "@/lib/messages/use-messages-unread-count";
import {
  buildTeacherNavItems,
  isTeacherNavItemActive,
  splitTeacherNavForHeader,
  type TeacherNavItem,
} from "@/lib/organization-settings/teacher-nav";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
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
};

function NavLink({
  item,
  pathname,
  C,
  messagesUnreadCount,
}: {
  item: TeacherNavItem;
  pathname: string;
  C: AdminThemeTokens;
  messagesUnreadCount: number;
}) {
  const Icon = item.icon;
  const active = isTeacherNavItemActive(pathname, item);

  return (
    <Link
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
      {item.key === "messages" ? (
        <MessagesNavBadge count={messagesUnreadCount} />
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
}: SchoolTeacherHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
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
      ),
    [slug, features.teacher, features.feature_nav?.teacher],
  );
  const messagesEnabled = Boolean(features.teacher.messages);
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
    [organizationId],
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
    <header className="shrink-0 border-b border-gray-100 bg-white">
      <div className="flex items-center px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link href={homeHref} className="min-w-0 shrink">
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
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {primary.map((item) => (
            <NavLink
              key={item.key}
              item={item}
              pathname={pathname}
              C={C}
              messagesUnreadCount={messagesUnreadCount}
            />
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
                    const active = isTeacherNavItemActive(pathname, item);
                    return (
                      <Link
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
                        {item.key === "messages" ? (
                          <MessagesNavBadge count={messagesUnreadCount} />
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

        <div className="flex flex-1 justify-end">
          <div className="relative" ref={menuRef}>
            <ParentProfileMenuTrigger
              displayName={userProfile.displayName}
              profilePhotoUrl={profilePhotoUrl}
              theme={C}
              menuOpen={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            />
            {menuOpen ? (
              <div
                className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
                role="menu"
              >
                <div className="border-b border-gray-100 px-3 py-3">
                  <div className="flex items-start gap-3">
                    <StudentPhoto
                      name={userProfile.displayName}
                      photoUrl={profilePhotoUrl}
                      size="lg"
                      theme={C}
                      editable
                      uploading={photoUploading}
                      showEditHint
                      onFileSelect={(file) => void handlePhotoUpload(file)}
                    />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {userProfile.displayName}
                      </p>
                      {userProfile.email ? (
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {userProfile.email}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
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
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {navItems.length > 0 ? (
        <nav className="flex gap-1 overflow-x-auto border-t border-gray-100 px-4 py-2 lg:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              item={item}
              pathname={pathname}
              C={C}
              messagesUnreadCount={messagesUnreadCount}
            />
          ))}
        </nav>
      ) : null}
    </header>
  );
}
