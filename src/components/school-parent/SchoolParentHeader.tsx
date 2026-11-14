"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import ParentProfileMenuTrigger from "@/components/school-parent/ParentProfileMenuTrigger";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import NavigationLink from "@/components/school/shared/NavigationLink";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import GardenBellButton from "@/components/school-parent/header/GardenBellButton";
import GardenHeaderPopover from "@/components/school-parent/header/GardenHeaderPopover";
import ParentGardenNav from "@/components/school-parent/header/ParentGardenNav";
import ParentGardenProfileMenu from "@/components/school-parent/header/ParentGardenProfileMenu";
import { useMessagesUnreadCount } from "@/lib/messages/use-messages-unread-count";
import type { CommitteeUnreadSummary } from "@/lib/committees/committee-unread-types";
import { useCommitteeUnreadSummary } from "@/lib/committees/use-committee-unread-summary";
import {
  buildParentNavItems,
  splitParentNavForHeader,
} from "@/lib/organization-settings/parent-nav";
import { parentDocumentationPath } from "@/lib/organization-settings/parent-routes";
import { isParentNavFridayBranchEnabled } from "@/lib/organization-settings/parent-home-features";
import { isSchoolGalleryEnabled } from "@/lib/school-gallery/gallery-enabled";
import { injectSchoolGalleryParentNavItem } from "@/lib/school-gallery/gallery-nav";
import {
  CLIENT_AUTH_ACTIVITY_ACTIONS,
  reportAuthActivityAndWait,
} from "@/lib/activity-auth-client";
import ParentPortalContextTopBar from "@/components/school-parent/ParentPortalContextTopBar";
import { useParentPortalContext } from "@/components/school-parent/ParentPortalContextProvider";
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
import type { OrganizationFridayBranchSettings } from "@/lib/school-admin/friday-branch/friday-branch-org-settings";
import {
  GuardianProfilePhotoClientError,
  uploadGuardianProfilePhotoFromParent,
} from "@/lib/guardians/upload-guardian-profile-photo-client";
import { parentToast } from "@/lib/school-parent/parent-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { createClient } from "@/utils/supabase/client";

type SchoolParentHeaderProps = {
  slug: string;
  organizationId: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  userProfile: FamilyUserProfile;
  portalOptions?: SchoolPortalOption[];
  openPortalLinksInNewTab?: boolean;
  parentNavBasePath?: string;
  mainParentBasePath?: string;
  previewMode?: boolean;
  previewBasePath?: string;
  previewParentBasePath?: string;
  coopModeEnabled?: boolean;
  coopProgramLabel?: string;
  embeddedPreview?: {
    pathname: string;
    onNavigate: (href: string) => void;
  };
  activityUnreadCount?: number;
  initialCommitteeUnreadSummary?: CommitteeUnreadSummary;
  initialMessagesUnreadCount?: number;
  /** Live: counts started by the layout; the hooks apply them instead of fetching. */
  messagesUnreadPromise?: Promise<number | null>;
  committeesUnreadPromise?: Promise<CommitteeUnreadSummary | null>;
  onOpenNotifications?: () => void;
  fridayBranchSettings?: OrganizationFridayBranchSettings | null;
};

export default function SchoolParentHeader({
  slug,
  organizationId,
  schoolName,
  branding,
  features,
  userProfile,
  portalOptions = [],
  openPortalLinksInNewTab = false,
  parentNavBasePath,
  mainParentBasePath,
  previewMode = false,
  previewBasePath,
  previewParentBasePath,
  coopModeEnabled = false,
  coopProgramLabel,
  embeddedPreview,
  activityUnreadCount = 0,
  initialCommitteeUnreadSummary,
  initialMessagesUnreadCount,
  messagesUnreadPromise,
  committeesUnreadPromise,
  onOpenNotifications,
  fridayBranchSettings,
}: SchoolParentHeaderProps) {
  const routerPathname = usePathname();
  const pathname = embeddedPreview?.pathname ?? routerPathname;
  const onPreviewNavigate = embeddedPreview?.onNavigate;
  const router = useRouter();
  const { theme, adminCompat: C } = useParentTheme();
  const { showSwitcher, activeContext } = useParentPortalContext();
  const previewPortalOptions = usePreviewPortalOptions();
  const resolvedPortalOptions =
    previewMode && previewPortalOptions.length > 0
      ? previewPortalOptions
      : portalOptions;
  const showPreviewSwitcher =
    previewMode && shouldShowPortalSwitcher(resolvedPortalOptions);
  const supabase = useMemo(() => createClient(), []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    userProfile.profilePhotoUrl,
  );
  const [photoUploading, setPhotoUploading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  /** Last picked photo, so a failed upload can be retried from the toast. */
  const lastPhotoRef = useRef<File | null>(null);

  const resolvedNavBasePath =
    parentNavBasePath ??
    previewParentBasePath ??
    `/school/${slug}/parent`;
  const resolvedMainParentBasePath =
    mainParentBasePath ??
    previewParentBasePath ??
    `/school/${slug}/parent`;

  const navItems = useMemo(
    () => {
      const items = buildParentNavItems(
        slug,
        features.parent,
        features.feature_nav?.parent,
        resolvedNavBasePath,
      );
      const filtered = items.filter(
        (item) =>
          item.key !== "friday_branch" ||
          isParentNavFridayBranchEnabled(features, fridayBranchSettings),
      );
      return injectSchoolGalleryParentNavItem(
        slug,
        filtered,
        isSchoolGalleryEnabled(features),
        resolvedNavBasePath,
      );
    },
    [
      slug,
      features,
      features.parent,
      features.feature_nav?.parent,
      resolvedNavBasePath,
      fridayBranchSettings,
    ],
  );
  const messagesEnabled = Boolean(features.parent.messages);
  const committeesEnabled = Boolean(features.parent.committees);
  const { unreadCount: liveMessagesUnreadCount } = useMessagesUnreadCount(
    "/api/parent-portal/messages",
    organizationId,
    schoolName,
    messagesEnabled && !previewMode,
    { deferUntilIdle: true, seedPromise: messagesUnreadPromise },
  );
  const messagesUnreadCount =
    previewMode && initialMessagesUnreadCount != null
      ? initialMessagesUnreadCount
      : liveMessagesUnreadCount;
  const { totalUnread: liveCommitteesUnreadCount } = useCommitteeUnreadSummary(
    "/api/parent-portal/committees",
    organizationId,
    committeesEnabled && !previewMode,
    undefined,
    { deferUntilIdle: true, seedPromise: committeesUnreadPromise },
  );
  const committeesUnreadCount =
    previewMode && initialCommitteeUnreadSummary
      ? initialCommitteeUnreadSummary.totalUnread
      : liveCommitteesUnreadCount;
  const { primary, more } = useMemo(
    () => splitParentNavForHeader(navItems, { coopMode: coopModeEnabled }),
    [navItems, coopModeEnabled],
  );
  const homeHref =
    navItems[0]?.href ?? `${resolvedNavBasePath}/portal`;
  const applicationsHref = previewBasePath ?? `/school/${slug}/apply`;
  const notificationsHref = `${resolvedMainParentBasePath}/notifications`;
  const documentationHref = parentDocumentationPath(slug, {
    previewBasePath,
    parentNavBasePath,
  });
  const notificationsActive =
    pathname === notificationsHref || pathname.startsWith(`${notificationsHref}/`);
  const canUploadPhoto = !previewMode;
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Close the account menu when the route changes (e.g. browser back).
  useEffect(() => {
    queueMicrotask(() => setMenuOpen(false));
  }, [pathname]);

  useEffect(() => {
    queueMicrotask(() => setProfilePhotoUrl(userProfile.profilePhotoUrl));
  }, [userProfile.profilePhotoUrl]);

  const handlePhotoUpload = useCallback(
    async function upload(file: File) {
      if (previewMode) return;

      lastPhotoRef.current = file;
      setPhotoUploading(true);

      try {
        const nextUrl = await uploadGuardianProfilePhotoFromParent(
          organizationId,
          file,
        );
        setProfilePhotoUrl(nextUrl);
        lastPhotoRef.current = null;
        parentToast.success("Profile photo updated", {
          description: "Your new photo is saved.",
          id: "parent-profile-photo",
        });
      } catch (error) {
        parentToast.error("Couldn't update your photo", {
          description:
            error instanceof GuardianProfilePhotoClientError
              ? error.message
              : error instanceof Error
                ? error.message
                : "Failed to upload photo.",
          // No fixed id: clicking "Try again" dismisses this toast, and a
          // reused id would let that dismissal swallow the next result.
          action: {
            label: "Try again",
            onClick: () => {
              const retryFile = lastPhotoRef.current;
              if (retryFile) void upload(retryFile);
            },
          },
        });
        void reportPortalOperationalError(
          "parent_portal",
          {
            organizationId,
            operation: "profile.upload_photo",
            error: "",
          },
          error,
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
      await reportAuthActivityAndWait({
        action: CLIENT_AUTH_ACTIVITY_ACTIONS.SIGNED_OUT,
        organizationId,
        surface: "parent_portal",
        metadata: {
          page: "/parent",
          organizationSlug: slug,
        },
      });
      const { error } = await supabase.auth.signOut();
      if (error) {
        parentToast.error("Couldn't log you out", {
          description: "Check your connection and try again.",
          id: "parent-sign-out",
        });
        return;
      }
      setMenuOpen(false);
      router.refresh();
    } catch (error) {
      parentToast.error("Couldn't log you out", {
        description: "Check your connection and try again.",
        id: "parent-sign-out",
      });
      void reportPortalOperationalError(
        "parent_portal",
        { organizationId, operation: "auth.sign_out", error: "" },
        error,
      );
    } finally {
      setSigningOut(false);
    }
  };

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
  const wordmarkClass = `min-w-0 shrink rounded-lg text-left transition-opacity hover:opacity-80 ${G_FOCUS}`;

  return (
    <ParentGardenScope
      as="header"
      theme={theme}
      className={`relative z-40 shrink-0 border-b-[1.5px] backdrop-blur-md ${
        coopModeEnabled
          ? "!bg-[var(--sf-accent-wash)] border-[var(--sf-clay)]/25"
          : "!bg-[var(--sf-paper)]/90 border-[var(--sf-ink)]/10"
      }`}
    >
      <ParentPortalContextTopBar />
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
          <div
            className="h-7 w-[1.5px] shrink-0 rounded-full bg-[var(--sf-ink)]/12 sm:h-8"
            aria-hidden
          />
          {onPreviewNavigate ? (
            <button
              type="button"
              onClick={() => onPreviewNavigate(homeHref)}
              className={wordmarkClass}
              aria-label={`${schoolName} home`}
            >
              <div className="min-w-0">{wordmark}</div>
            </button>
          ) : (
            <NavigationLink href={homeHref} className={wordmarkClass}>
              <div className="min-w-0">{wordmark}</div>
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
          committeesUnreadCount={committeesUnreadCount}
          documentationHref={documentationHref}
          onNavigate={onPreviewNavigate}
        />

        <div className="relative z-[100] flex shrink-0 items-center gap-2" ref={menuRef}>
          <GardenBellButton
            unreadCount={activityUnreadCount}
            onClick={() => onOpenNotifications?.()}
          />
          <ParentProfileMenuTrigger
            ref={profileTriggerRef}
            displayName={userProfile.displayName}
            profilePhotoUrl={profilePhotoUrl}
            theme={C}
            parentTheme={theme}
            variant="garden"
            menuOpen={menuOpen}
            aria-haspopup="dialog"
            aria-controls="parent-account-menu"
            data-testid="parent-header-profile"
            contextLabel={
              showSwitcher && activeContext ? activeContext.label : undefined
            }
            coopModeEnabled={coopModeEnabled}
            coopProgramLabel={coopProgramLabel}
            onClick={() => setMenuOpen((open) => !open)}
          />
          <GardenHeaderPopover
            open={menuOpen}
            onClose={closeMenu}
            theme={theme}
            id="parent-account-menu"
            triggerRef={profileTriggerRef}
            anchorRef={menuRef}
            label="Account menu"
            sheetTitle="Your account"
            align="right"
            widthClass="w-[21rem]"
          >
            <ParentGardenProfileMenu
              adminTheme={C}
              displayName={userProfile.displayName}
              email={userProfile.email}
              profilePhotoUrl={profilePhotoUrl}
              canUploadPhoto={canUploadPhoto}
              photoUploading={photoUploading}
              onPhotoSelect={(file) => void handlePhotoUpload(file)}
              previewMode={previewMode}
              coopModeEnabled={coopModeEnabled}
              coopProgramLabel={coopProgramLabel}
              portalOptions={resolvedPortalOptions}
              currentPortal={detectPortalFromPathname(pathname, slug)}
              openPortalLinksInNewTab={openPortalLinksInNewTab}
              showApplicationsLink={!showPreviewSwitcher}
              applicationsHref={applicationsHref}
              notificationsHref={notificationsHref}
              notificationsActive={notificationsActive}
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
          committeesUnreadCount={committeesUnreadCount}
          documentationHref={documentationHref}
          onNavigate={onPreviewNavigate}
        />
      ) : null}
    </ParentGardenScope>
  );
}
