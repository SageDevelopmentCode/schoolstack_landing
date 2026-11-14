"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ApplyGardenAccountMenu from "@/components/admissions/ApplyGardenAccountMenu";
import ApplyPortalBranding from "@/components/admissions/ApplyPortalBranding";
import ParentProfileMenuTrigger from "@/components/school-parent/ParentProfileMenuTrigger";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";
import GardenHeaderPopover from "@/components/school-parent/header/GardenHeaderPopover";
import {
  detectPortalFromPathname,
  type SchoolPortalOption,
} from "@/lib/auth/portal-switcher-types";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import {
  CLIENT_AUTH_ACTIVITY_ACTIONS,
  reportAuthActivityAndWait,
} from "@/lib/activity-auth-client";
import {
  GuardianProfilePhotoClientError,
  uploadGuardianProfilePhotoFromParent,
} from "@/lib/guardians/upload-guardian-profile-photo-client";
import { parentToast } from "@/lib/school-parent/parent-toast";
import {
  parseOperationalError,
  reportPublicApplyOperationalError,
  shouldReportApplyClientError,
} from "@/lib/operational-errors-client";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type ApplyPortalNavbarProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId?: string;
  userEmail: string;
  userDisplayName: string;
  profilePhotoUrl?: string | null;
  portalOptions?: SchoolPortalOption[];
  openPortalLinksInNewTab?: boolean;
  previewMode?: boolean;
  previewHomeHref?: string;
};

export default function ApplyPortalNavbar({
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  userEmail,
  userDisplayName,
  profilePhotoUrl: initialProfilePhotoUrl = null,
  portalOptions = [],
  openPortalLinksInNewTab = false,
  previewMode = false,
  previewHomeHref,
}: ApplyPortalNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { theme, adminCompat: C } = useParentTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(initialProfilePhotoUrl);
  const [photoUploading, setPhotoUploading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    queueMicrotask(() => setProfilePhotoUrl(initialProfilePhotoUrl));
  }, [initialProfilePhotoUrl]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      if (organizationId) {
        await reportAuthActivityAndWait({
          action: CLIENT_AUTH_ACTIVITY_ACTIONS.SIGNED_OUT,
          organizationId,
          surface: "parent_portal",
          metadata: {
            page: "/apply",
            organizationSlug: schoolSlug,
          },
        });
      }
      const { error } = await supabase.auth.signOut();
      if (error) {
        parentToast.error("Couldn't log you out", {
          description: "Check your connection and try again.",
          id: "apply-sign-out",
        });
        return;
      }
      router.refresh();
    } catch {
      parentToast.error("Couldn't log you out", {
        description: "Check your connection and try again.",
        id: "apply-sign-out",
      });
    } finally {
      setSigningOut(false);
      setMenuOpen(false);
    }
  };

  const handlePhotoUpload = useCallback(
    async (file: File) => {
      if (previewMode || !organizationId) return;

      setPhotoUploading(true);

      try {
        const nextUrl = await uploadGuardianProfilePhotoFromParent(
          organizationId,
          file,
        );
        setProfilePhotoUrl(nextUrl);
        parentToast.success("Profile photo updated", {
          description: "Your new photo shows on your account everywhere.",
        });
      } catch (error) {
        if (organizationId && shouldReportApplyClientError(error)) {
          const parsed = parseOperationalError(error);
          void reportPublicApplyOperationalError({
            organizationId,
            operation: "apply.profile_photo.upload",
            error: parsed.message,
            code: parsed.code,
            details: parsed.details,
            notify: true,
          });
        }
        parentToast.error("Couldn't update your photo", {
          description:
          error instanceof GuardianProfilePhotoClientError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Failed to upload photo.",
        });
      } finally {
        setPhotoUploading(false);
      }
    },
    [organizationId, previewMode],
  );

  const canUploadPhoto = !previewMode && Boolean(organizationId);
  const homeHref =
    previewHomeHref ?? `/school/${schoolSlug}/apply`;

  return (
    <ParentGardenScope
      as="header"
      theme={theme}
      className="relative z-40 shrink-0 border-b-[1.5px] border-[var(--sf-ink)]/10 !bg-[var(--sf-paper)]/90 px-4 backdrop-blur-md sm:px-8 lg:px-[68px]"
    >
      <div className="mx-auto flex min-h-[64px] w-full max-w-[1440px] items-center justify-between gap-4 sm:min-h-[71px]">
        <div className="min-w-0 shrink">
          <ApplyPortalBranding
            branding={branding}
            schoolName={schoolName}
            schoolHomeHref={homeHref}
          />
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <ParentProfileMenuTrigger
            ref={profileTriggerRef}
            displayName={userDisplayName}
            profilePhotoUrl={profilePhotoUrl}
            theme={C}
            parentTheme={theme}
            variant="garden"
            menuOpen={menuOpen}
            aria-haspopup="dialog"
            aria-controls="apply-account-menu"
            data-testid="apply-header-profile"
            onClick={() => setMenuOpen((open) => !open)}
          />

          <GardenHeaderPopover
            open={menuOpen}
            onClose={closeMenu}
            theme={theme}
            id="apply-account-menu"
            triggerRef={profileTriggerRef}
            anchorRef={menuRef}
            label="Account menu"
            sheetTitle="Your account"
            align="right"
            widthClass="w-[21rem]"
          >
            <ApplyGardenAccountMenu
              adminTheme={C}
              displayName={userDisplayName}
              email={userEmail}
              profilePhotoUrl={profilePhotoUrl}
              canUploadPhoto={canUploadPhoto}
              photoUploading={photoUploading}
              onPhotoSelect={(file) => void handlePhotoUpload(file)}
              previewMode={previewMode}
              portalOptions={portalOptions}
              currentPortal={detectPortalFromPathname(pathname, schoolSlug)}
              openPortalLinksInNewTab={openPortalLinksInNewTab}
              signingOut={signingOut}
              onSignOut={() => void handleSignOut()}
              onClose={closeMenu}
            />
          </GardenHeaderPopover>
        </div>
      </div>
    </ParentGardenScope>
  );
}
