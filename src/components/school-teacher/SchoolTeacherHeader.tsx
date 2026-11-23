"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import { usePreviewPortalOptions } from "@/components/admin/PreviewPortalOptionsProvider";
import ParentProfileMenuTrigger from "@/components/school-parent/ParentProfileMenuTrigger";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import GardenBellButton from "@/components/school-parent/header/GardenBellButton";
import GardenHeaderPopover from "@/components/school-parent/header/GardenHeaderPopover";
import ParentGardenNav from "@/components/school-parent/header/ParentGardenNav";
import TeacherGardenProfileMenu from "@/components/school-teacher/header/TeacherGardenProfileMenu";
import NavigationLink from "@/components/school/shared/NavigationLink";
import { useMessagesUnreadCount } from "@/lib/messages/use-messages-unread-count";
import {
  buildTeacherNavItems,
  isTeacherNavItemActive,
  splitTeacherNavForHeader,
} from "@/lib/organization-settings/teacher-nav";
import { teacherDocumentationPath } from "@/lib/organization-settings/teacher-routes";
import { isSchoolGalleryEnabled } from "@/lib/school-gallery/gallery-enabled";
import { injectSchoolGalleryTeacherNavItem } from "@/lib/school-gallery/gallery-nav";
import { detectPortalFromPathname } from "@/lib/auth/portal-switcher-types";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import type { StaffUserProfile } from "@/lib/staff/teacher-portal-access";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";
import {
  StaffProfilePhotoClientError,
  uploadStaffProfilePhotoFromTeacher,
} from "@/lib/staff/upload-staff-profile-photo-client";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
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
  activityUnreadCount?: number;
  onOpenNotifications?: () => void;
  portalOptions?: SchoolPortalOption[];
  openPortalLinksInNewTab?: boolean;
  /**
   * Marketing demos: a virtual pathname for active pills, and nav clicks
   * handled in place instead of navigating (same as `SchoolParentHeader`).
   */
  embeddedPreview?: {
    pathname: string;
    onNavigate: (href: string) => void;
  };
  /** Messages badge to show in preview, where the unread poll is off. */
  initialMessagesUnreadCount?: number;
};

export default function SchoolTeacherHeader({
  slug,
  organizationId,
  schoolName,
  branding,
  features,
  userProfile,
  previewMode = false,
  previewBasePath,
  activityUnreadCount = 0,
  onOpenNotifications,
  portalOptions = [],
  openPortalLinksInNewTab = false,
  embeddedPreview,
  initialMessagesUnreadCount,
}: SchoolTeacherHeaderProps) {
  const routerPathname = usePathname();
  const pathname = embeddedPreview?.pathname ?? routerPathname;
  const onPreviewNavigate = embeddedPreview?.onNavigate;
  const previewPortalOptions = usePreviewPortalOptions();
  const resolvedPortalOptions =
    previewMode && previewPortalOptions.length > 0
      ? previewPortalOptions
      : portalOptions;
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { theme, adminCompat: C } = useParentTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    userProfile.profilePhotoUrl,
  );
  const [photoUploading, setPhotoUploading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const navItems = useMemo(() => {
    const items = buildTeacherNavItems(
      slug,
      features.teacher,
      features.feature_nav?.teacher,
      previewBasePath,
    );
    return injectSchoolGalleryTeacherNavItem(
      slug,
      items,
      isSchoolGalleryEnabled(features),
      previewBasePath,
    );
  }, [slug, features, previewBasePath]);
  const messagesEnabled = Boolean(features.teacher.messages) && !previewMode;
  const { unreadCount: polledMessagesUnreadCount } = useMessagesUnreadCount(
    "/api/teacher-portal/messages",
    organizationId,
    schoolName,
    messagesEnabled,
  );
  const messagesUnreadCount =
    previewMode && initialMessagesUnreadCount != null
      ? initialMessagesUnreadCount
      : polledMessagesUnreadCount;
  const { primary, more } = useMemo(
    () => splitTeacherNavForHeader(navItems),
    [navItems],
  );
  const homeHref = navItems[0]?.href ?? `/school/${slug}/teacher/dashboard`;
  const documentationHref = teacherDocumentationPath(slug, { teacherBasePath: previewBasePath });
  const documentationActive =
    pathname === documentationHref || pathname.startsWith(`${documentationHref}/`);

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
        parentToast.dismiss("teacher-profile-photo-error");
        parentToast.success("Profile photo updated.", {
          description: "Families and staff will see your new photo.",
          id: "teacher-profile-photo",
        });
      } catch (error) {
        void reportPortalOperationalError("teacher_portal", {
          organizationId,
          operation: "profile.upload_photo",
          error: "",
        }, error);
        parentToast.error(
          error instanceof StaffProfilePhotoClientError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Failed to upload photo.",
          { description: "Your photo wasn't changed.", id: "teacher-profile-photo-error" },
        );
      } finally {
        setPhotoUploading(false);
      }
    },
    [organizationId, previewMode],
  );

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace(`/school/${slug}/teacher/login`);
      router.refresh();
    } catch (error) {
      parentToast.error("Couldn't log you out.", {
        description: "You're still signed in. Check your connection and try again.",
        id: "teacher-sign-out",
      });
      void reportPortalOperationalError(
        "teacher_portal",
        { organizationId, operation: "auth.sign_out", error: "" },
        error,
      );
    } finally {
      setSigningOut(false);
      setMenuOpen(false);
    }
  };

  const wordmarkClass = `min-w-0 shrink rounded-lg transition-opacity hover:opacity-80 ${G_FOCUS}`;
  const wordmark = (
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
  );

  return (
    <ParentGardenScope
      as="header"
      theme={theme}
      className="relative z-40 shrink-0 border-b-[1.5px] border-[var(--sf-ink)]/10 !bg-[var(--sf-paper)]/90 backdrop-blur-md"
    >
      <div className="mx-auto flex min-h-[64px] max-w-[1440px] items-center justify-between gap-3 overflow-visible px-4 sm:min-h-[78px] sm:gap-4 sm:px-7">
        <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`shrink-0 rounded-lg transition-opacity hover:opacity-80 ${G_FOCUS}`}
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
          <div className="h-7 w-[1.5px] shrink-0 rounded-full bg-[var(--sf-ink)]/12 sm:h-8" aria-hidden />
          {onPreviewNavigate ? (
            <button type="button" onClick={() => onPreviewNavigate(homeHref)} className={wordmarkClass}>
              {wordmark}
            </button>
          ) : (
            <NavigationLink href={homeHref} className={wordmarkClass}>
              {wordmark}
            </NavigationLink>
          )}
        </div>

        <ParentGardenNav
          variant="desktop"
          primary={primary}
          more={more}
          pathname={pathname}
          theme={theme}
          messagesUnreadCount={messagesUnreadCount}
          committeesUnreadCount={0}
          documentationHref={documentationHref}
          ariaLabel="Staff portal"
          isItemActive={isTeacherNavItemActive}
          testIdPrefix="teacher-header"
          onNavigate={onPreviewNavigate}
        />

        <div className="relative z-[100] flex shrink-0 items-center gap-2" ref={menuRef}>
          <GardenBellButton unreadCount={activityUnreadCount} onClick={() => onOpenNotifications?.()} />
          <ParentProfileMenuTrigger
            ref={profileTriggerRef}
            displayName={userProfile.displayName}
            profilePhotoUrl={profilePhotoUrl}
            theme={C}
            parentTheme={theme}
            variant="garden"
            menuOpen={menuOpen}
            aria-haspopup="dialog"
            aria-controls="teacher-account-menu"
            data-testid="teacher-header-profile"
            onClick={() => setMenuOpen((open) => !open)}
          />
          <GardenHeaderPopover
            open={menuOpen}
            onClose={closeMenu}
            theme={theme}
            id="teacher-account-menu"
            triggerRef={profileTriggerRef}
            anchorRef={menuRef}
            label="Account menu"
            sheetTitle="Your account"
            align="right"
            widthClass="w-[21rem]"
          >
            <TeacherGardenProfileMenu
              adminTheme={C}
              displayName={userProfile.displayName}
              email={userProfile.email}
              profilePhotoUrl={profilePhotoUrl}
              photoUploading={photoUploading}
              onPhotoSelect={(file) => void handlePhotoUpload(file)}
              previewMode={previewMode}
              portalOptions={resolvedPortalOptions}
              currentPortal={detectPortalFromPathname(pathname, slug)}
              openPortalLinksInNewTab={openPortalLinksInNewTab}
              documentationHref={documentationHref}
              documentationActive={documentationActive}
              signingOut={signingOut}
              onSignOut={() => void handleSignOut()}
              onClose={closeMenu}
            />
          </GardenHeaderPopover>
        </div>
      </div>

      {navItems.length > 0 ? (
        <ParentGardenNav
          variant="mobile"
          primary={primary}
          more={more}
          pathname={pathname}
          theme={theme}
          messagesUnreadCount={messagesUnreadCount}
          committeesUnreadCount={0}
          documentationHref={documentationHref}
          ariaLabel="Staff portal"
          isItemActive={isTeacherNavItemActive}
          testIdPrefix="teacher-header"
          onNavigate={onPreviewNavigate}
        />
      ) : null}
    </ParentGardenScope>
  );
}
