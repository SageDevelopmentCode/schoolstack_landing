"use client";

import {
  BellRing,
  ChevronRight,
  ClipboardList,
  Loader2,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import NavigationLink from "@/components/school/shared/NavigationLink";
import type { PortalId, SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { POPOVER_ITEM_ATTR } from "./GardenHeaderPopover";
import {
  GardenAccountPortalOptions,
  GardenProgramOptions,
  gardenMenuRowClass,
} from "./ParentGardenPortalSwitcher";

function RowIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sf-paper)] text-[var(--sf-ink)]/75 ring-[1.5px] ring-[var(--sf-ink)]/12 transition-colors group-hover:bg-white group-hover:text-[var(--sf-ink)]"
    >
      <Icon className="h-4 w-4" strokeWidth={2.3} />
    </span>
  );
}

function LinkRow({
  href,
  icon,
  label,
  active = false,
  onClick,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <NavigationLink
      href={href}
      {...POPOVER_ITEM_ATTR}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`${gardenMenuRowClass} ${
        active ? "bg-[var(--sf-accent-wash)]" : "hover:bg-[var(--sf-accent-wash)]"
      }`}
    >
      <RowIcon icon={icon} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {active ? (
        <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--sf-clay-deep)]">
          Open
        </span>
      ) : (
        <ChevronRight
          className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/35 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--sf-ink)]/70"
          aria-hidden
        />
      )}
    </NavigationLink>
  );
}

/** Account menu body: who you are, program/portal switches, settings, log out. */
export default function ParentGardenProfileMenu({
  adminTheme,
  displayName,
  email,
  profilePhotoUrl,
  canUploadPhoto,
  photoUploading,
  onPhotoSelect,
  previewMode,
  coopModeEnabled,
  coopProgramLabel,
  portalOptions,
  currentPortal,
  openPortalLinksInNewTab,
  showApplicationsLink,
  applicationsHref,
  notificationsHref,
  notificationsActive,
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
  coopModeEnabled: boolean;
  coopProgramLabel?: string;
  portalOptions: SchoolPortalOption[];
  currentPortal: PortalId;
  openPortalLinksInNewTab: boolean;
  showApplicationsLink: boolean;
  applicationsHref: string;
  notificationsHref: string;
  notificationsActive: boolean;
  signingOut: boolean;
  onSignOut: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 p-2" data-testid="parent-header-profile-menu">
      {/* You */}
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
            <p className="m-0 mt-0.5 truncate text-[13px] font-semibold text-[var(--sf-soft)]">
              {email}
            </p>
          ) : null}
          <p
            className="m-0 mt-1.5 text-[12px] font-semibold text-[var(--sf-soft)]"
            aria-live="polite"
          >
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

      {coopModeEnabled && coopProgramLabel ? (
        <p className="m-0 flex items-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-[var(--sf-clay)]/35 px-3 py-2 text-[13px] font-extrabold text-[var(--sf-clay-deep)]">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--sf-clay)]" />
          Co-op mode · {coopProgramLabel}
        </p>
      ) : null}

      <GardenProgramOptions onNavigate={onClose} />

      <GardenAccountPortalOptions
        options={portalOptions}
        currentPortal={currentPortal}
        openLinksInNewTab={openPortalLinksInNewTab}
        onNavigate={onClose}
      />

      <div className="flex flex-col gap-0.5">
        {showApplicationsLink ? (
          <LinkRow
            href={applicationsHref}
            icon={ClipboardList}
            label="Your applications"
            onClick={onClose}
          />
        ) : null}
        <LinkRow
          href={notificationsHref}
          icon={BellRing}
          label="Notification settings"
          active={notificationsActive}
          onClick={onClose}
        />
      </div>

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
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" strokeWidth={2.3} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            {signingOut ? "Signing out…" : "Log out"}
          </span>
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
