"use client";

import { Loader2, LogOut } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import { POPOVER_ITEM_ATTR } from "@/components/school-parent/header/GardenHeaderPopover";
import {
  GardenAccountPortalOptions,
  gardenMenuRowClass,
} from "@/components/school-parent/header/ParentGardenPortalSwitcher";
import type { PortalId, SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

/*
 * Apply-portal account menu body (Garden): who you are (with photo upload),
 * account portals, log out. Same look as ParentGardenProfileMenu, without the
 * parent-only rows (programs, notifications).
 */
export default function ApplyGardenAccountMenu({
  adminTheme,
  displayName,
  email,
  profilePhotoUrl,
  canUploadPhoto,
  photoUploading,
  onPhotoSelect,
  previewMode,
  portalOptions,
  currentPortal,
  openPortalLinksInNewTab,
  signingOut,
  onSignOut,
  onClose,
}: {
  adminTheme: AdminThemeTokens;
  displayName: string;
  email?: string | null;
  profilePhotoUrl?: string | null;
  canUploadPhoto: boolean;
  photoUploading: boolean;
  onPhotoSelect: (file: File) => void;
  previewMode: boolean;
  portalOptions: SchoolPortalOption[];
  currentPortal: PortalId;
  openPortalLinksInNewTab: boolean;
  signingOut: boolean;
  onSignOut: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 p-2" data-testid="apply-header-profile-menu">
      <div className="flex items-center gap-3 rounded-[18px] bg-[var(--sf-accent-wash)] px-3 py-3">
        <div className="[&_span]:font-[family-name:var(--font-sf-body)]">
          <StudentPhoto
            name={displayName}
            photoUrl={profilePhotoUrl}
            size="xl"
            theme={adminTheme}
            editable={canUploadPhoto}
            uploading={photoUploading}
            showEditHint={canUploadPhoto}
            onFileSelect={onPhotoSelect}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="sf-display m-0 truncate text-[1.15rem] leading-tight text-[var(--sf-ink)]">
            {displayName}
          </p>
          {email ? (
            <p className="m-0 mt-0.5 truncate text-[13px] font-semibold text-[var(--sf-soft)]">{email}</p>
          ) : null}
          <p className="m-0 mt-1.5 text-[12px] font-semibold text-[var(--sf-soft)]" aria-live="polite">
            {photoUploading ? (
              <span className="inline-flex items-center gap-1.5 text-[var(--sf-clay-deep)]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Uploading photo…
              </span>
            ) : previewMode ? (
              "Photo changes are off in preview"
            ) : null}
          </p>
        </div>
      </div>

      <GardenAccountPortalOptions
        options={portalOptions}
        currentPortal={currentPortal}
        openLinksInNewTab={openPortalLinksInNewTab}
        onNavigate={onClose}
        newTabDescription="This tab stays on your applications."
      />

      <div className="border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-2">
        <button
          type="button"
          {...POPOVER_ITEM_ATTR}
          onClick={onSignOut}
          disabled={signingOut || previewMode}
          aria-busy={signingOut || undefined}
          className={`${gardenMenuRowClass} hover:bg-[var(--sf-peach)] disabled:cursor-not-allowed disabled:hover:bg-transparent ${
            previewMode ? "opacity-60" : ""
          }`}
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sf-paper)] text-[var(--sf-ink)]/75 ring-[1.5px] ring-[var(--sf-ink)]/12"
          >
            {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" strokeWidth={2.3} />}
          </span>
          <span className="min-w-0 flex-1">{signingOut ? "Signing out…" : "Log out"}</span>
          {previewMode ? (
            <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--sf-soft)]">
              Off in preview
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}
