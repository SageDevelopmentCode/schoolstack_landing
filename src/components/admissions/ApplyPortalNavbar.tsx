"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import ApplyPortalBranding from "@/components/admissions/ApplyPortalBranding";
import SchoolPortalSwitcherMenuItems from "@/components/school/shared/SchoolPortalSwitcherMenuItems";
import ButtonLoadingLabel from "@/components/ui/ButtonLoadingLabel";
import ParentProfileMenuTrigger from "@/components/school-parent/ParentProfileMenuTrigger";
import StudentPhoto from "@/components/students/StudentPhoto";
import {
  detectPortalFromPathname,
  type SchoolPortalOption,
} from "@/lib/auth/portal-switcher-types";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  CLIENT_AUTH_ACTIVITY_ACTIONS,
  reportAuthActivityAndWait,
} from "@/lib/activity-auth-client";
import {
  GuardianProfilePhotoClientError,
  uploadGuardianProfilePhotoFromParent,
} from "@/lib/guardians/upload-guardian-profile-photo-client";
import { parentToast } from "@/lib/school-parent/parent-toast";
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
  previewMode = false,
  previewHomeHref,
}: ApplyPortalNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(initialProfilePhotoUrl);
  const [photoUploading, setPhotoUploading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() => setProfilePhotoUrl(initialProfilePhotoUrl));
  }, [initialProfilePhotoUrl]);

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
      await supabase.auth.signOut();
      router.refresh();
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

  const canUploadPhoto = !previewMode && Boolean(organizationId);
  const homeHref =
    previewHomeHref ?? `/school/${schoolSlug}/apply`;

  return (
    <header
      className="shrink-0 border-b px-4 sm:px-6"
      style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
    >
      <div className="flex h-14 w-full items-center justify-between gap-4">
        <div className="min-w-0 shrink">
          <ApplyPortalBranding
            branding={branding}
            schoolName={schoolName}
            schoolHomeHref={homeHref}
          />
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <ParentProfileMenuTrigger
            displayName={userDisplayName}
            profilePhotoUrl={profilePhotoUrl}
            theme={C}
            menuOpen={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          />

          {menuOpen ? (
            <div
              className="absolute right-0 top-full z-20 mt-1 w-64 rounded-md border py-1 shadow-lg"
              style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
              role="menu"
            >
              <div className="border-b px-3 py-3" style={{ borderColor: C.border }}>
                <div className="flex items-start gap-3">
                  <StudentPhoto
                    name={userDisplayName}
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
                      style={{ color: C.textPrimary }}
                    >
                      {userDisplayName}
                    </p>
                    {userEmail ? (
                      <p
                        className="mt-0.5 truncate text-xs"
                        style={{ color: C.textSecondary }}
                      >
                        {userEmail}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              <SchoolPortalSwitcherMenuItems
                C={C}
                options={portalOptions}
                currentPortal={detectPortalFromPathname(pathname, schoolSlug)}
                onNavigate={() => setMenuOpen(false)}
              />
              {!previewMode ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm disabled:opacity-60"
                style={{ color: C.textPrimary }}
              >
                {!signingOut ? (
                  <LogOut className="h-4 w-4 shrink-0" style={{ color: C.textSecondary }} />
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
    </header>
  );
}
