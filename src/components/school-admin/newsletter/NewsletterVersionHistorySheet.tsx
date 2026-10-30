"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { editionFromVersionSnapshot } from "@/lib/school-admin/newsletter/newsletter-version-snapshot";
import {
  listNewsletterEditionVersionsApi,
  restoreNewsletterEditionVersionApi,
  type NewsletterEditionVersion,
} from "@/lib/school-admin/newsletter/newsletter-api-client";
import { newsletterVisualBrandingForPreview } from "@/lib/school-admin/newsletter/newsletter-branding";
import { refreshNewsletterEditionGalleryUrls } from "@/lib/school-admin/newsletter/refresh-newsletter-gallery-photo-urls";
import type {
  NewsletterEdition,
  NewsletterSchoolMeta,
  NewsletterSchoolTemplate,
} from "@/lib/school-admin/newsletter/newsletter-types";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import NewsletterPreviewPanel from "./NewsletterPreviewPanel";

function formatVersionWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function versionLabel(version: NewsletterEditionVersion): string {
  if (version.label?.trim()) return version.label.trim();
  return version.kind === "before_restore" ? "Before restore" : "Saved version";
}

type NewsletterVersionHistorySheetProps = {
  open: boolean;
  slug: string;
  edition: NewsletterEdition;
  school: NewsletterSchoolMeta;
  template: NewsletterSchoolTemplate;
  branding: OrganizationBranding;
  staffMembers: StaffMemberRecord[];
  onClose: () => void;
  onRestored: (edition: NewsletterEdition) => void;
  onToast: (message: string) => void;
};

export default function NewsletterVersionHistorySheet({
  open,
  slug,
  edition,
  school,
  template,
  branding,
  staffMembers,
  onClose,
  onRestored,
  onToast,
}: NewsletterVersionHistorySheetProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const [versions, setVersions] = useState<NewsletterEditionVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [loadedPreview, setLoadedPreview] = useState<{
    versionId: string;
    edition: NewsletterEdition;
  } | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<NewsletterEditionVersion | null>(null);
  const [restoring, setRestoring] = useState(false);

  const previewEdition =
    previewVersionId && loadedPreview?.versionId === previewVersionId
      ? loadedPreview.edition
      : null;

  const previewBranding = useMemo(
    () => newsletterVisualBrandingForPreview(branding),
    [branding],
  );

  const reloadVersions = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    void listNewsletterEditionVersionsApi(slug, edition.id)
      .then(setVersions)
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : "Could not load versions.");
      })
      .finally(() => setLoading(false));
  }, [edition.id, slug]);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setLoading(true);
      setLoadError(null);
      void listNewsletterEditionVersionsApi(slug, edition.id)
        .then(setVersions)
        .catch((err: unknown) => {
          setLoadError(err instanceof Error ? err.message : "Could not load versions.");
        })
        .finally(() => setLoading(false));
    });
  }, [edition.id, open, slug]);

  useEffect(() => {
    if (!previewVersionId) return;
    const version = versions.find((v) => v.id === previewVersionId);
    if (!version) return;

    let cancelled = false;
    const base = editionFromVersionSnapshot(
      edition.id,
      version.snapshot,
      edition.status,
      edition.publishedAt,
    );
    void refreshNewsletterEditionGalleryUrls(slug, base).then((refreshed) => {
      if (!cancelled) {
        setLoadedPreview({ versionId: previewVersionId, edition: refreshed });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [edition.id, edition.publishedAt, edition.status, previewVersionId, slug, versions]);

  const handleClose = () => {
    setPreviewVersionId(null);
    setLoadedPreview(null);
    onClose();
  };

  const handleRestore = () => {
    if (!restoreTarget || restoring) return;
    setRestoring(true);
    void restoreNewsletterEditionVersionApi(slug, edition.id, restoreTarget.id)
      .then(async (restored) => {
        const refreshed = await refreshNewsletterEditionGalleryUrls(slug, restored);
        onRestored(refreshed);
        setRestoreTarget(null);
        setPreviewVersionId(null);
        setLoadedPreview(null);
        onToast("Restored that version.");
        reloadVersions();
        handleClose();
      })
      .catch((err: unknown) => {
        onToast(err instanceof Error ? err.message : "Could not restore this version.");
      })
      .finally(() => setRestoring(false));
  };

  return (
    <>
      <SchoolAdminSlideOverShell
        open={open}
        onClose={handleClose}
        title="Version history"
        subtitle="Saved versions from Save. Restore replaces your draft content; publish status stays as-is."
        C={C}
        widthClassName="w-[min(100%,32rem)]"
        footer={
          previewVersionId ? (
            <>
              <AdminButton
                theme={theme}
                variant="outline"
                onClick={() => {
                  setPreviewVersionId(null);
                  setLoadedPreview(null);
                }}
              >
                Back to current
              </AdminButton>
              <AdminButton
                theme={theme}
                variant="primary"
                disabled={restoring}
                onClick={() => {
                  const version = versions.find((v) => v.id === previewVersionId);
                  if (version) setRestoreTarget(version);
                }}
              >
                Restore this version
              </AdminButton>
            </>
          ) : (
            <AdminButton theme={theme} variant="outline" onClick={handleClose}>
              Close
            </AdminButton>
          )
        }
      >
        <div className="space-y-4 pb-4">
          {loading ? (
            <p className="text-[11px]" style={{ color: theme.muted }}>
              Loading versions…
            </p>
          ) : null}
          {loadError ? (
            <p className="text-[11px]" style={{ color: theme.muted }}>
              {loadError}
            </p>
          ) : null}
          {!loading && !loadError && versions.length === 0 ? (
            <p className="text-[11px] leading-relaxed" style={{ color: theme.muted }}>
              No saved versions yet. Use Save in the editor to create a version you can restore
              later.
            </p>
          ) : null}

          {!previewVersionId ? (
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--cream)] px-3 py-2.5 text-left"
                >
                  <span className="block text-sm font-semibold">Current draft</span>
                  <span className="text-[10px]" style={{ color: theme.muted }}>
                    What you are editing now
                  </span>
                </button>
              </li>
              {versions.map((version) => (
                <li key={version.id}>
                  <button
                    type="button"
                    className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-left transition-colors hover:bg-[var(--paper)]"
                    onClick={() => setPreviewVersionId(version.id)}
                  >
                    <span className="font-semibold">{versionLabel(version)}</span>
                    <span className="text-[10px]" style={{ color: theme.muted }}>
                      {formatVersionWhen(version.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : previewEdition ? (
            <div className="max-h-[50vh] overflow-auto rounded-lg border border-[var(--line)] p-2">
              <NewsletterPreviewPanel
                theme={theme}
                edition={previewEdition}
                school={school}
                branding={previewBranding}
                device="desktop"
                staffMembers={staffMembers}
                template={template}
              />
            </div>
          ) : (
            <p className="text-[11px]" style={{ color: theme.muted }}>
              Loading preview…
            </p>
          )}
        </div>
      </SchoolAdminSlideOverShell>

      <ConfirmDialog
        C={C}
        open={Boolean(restoreTarget)}
        title="Restore this version?"
        description="Your current draft content will be replaced. A backup of the current content is saved in version history."
        confirmLabel={restoring ? "Restoring…" : "Restore"}
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleRestore}
        onClose={() => setRestoreTarget(null)}
      />
    </>
  );
}
