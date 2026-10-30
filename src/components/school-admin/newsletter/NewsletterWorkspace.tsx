"use client";

import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { newsletterEditionDateRange } from "@/lib/school-admin/newsletter/newsletter-dates";
import {
  buildExportHtmlDocument,
  downloadFile,
  plainTextFromHtml,
} from "@/lib/school-admin/newsletter/newsletter-export";
import {
  newsletterVisualBrandingForExport,
  newsletterVisualBrandingForPreview,
} from "@/lib/school-admin/newsletter/newsletter-branding";
import { buildNewsletterArticleHtml } from "@/lib/school-admin/newsletter/newsletter-render";
import { prepareNewsletterImageFileForUpload } from "@/lib/school-admin/newsletter/newsletter-photos";
import {
  templateFromEdition,
} from "@/lib/school-admin/newsletter/newsletter-template";
import { publishNewsletterEditionApi } from "@/lib/school-admin/newsletter/newsletter-api-client";
import { MAX_NEWSLETTER_EVENTS, MAX_NEWSLETTER_PHOTOS } from "@/lib/school-admin/newsletter/newsletter-limits";
import { refreshNewsletterEditionGalleryUrls } from "@/lib/school-admin/newsletter/refresh-newsletter-gallery-photo-urls";
import { newsletterEditionGalleryMediaChanged } from "@/lib/school-admin/newsletter/newsletter-image-url";
import {
  createNewsletterId,
  type NewsletterEdition,
  type NewsletterSchoolTemplate,
  type NewsletterWorkspaceState,
} from "@/lib/school-admin/newsletter/newsletter-types";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import NewsletterEditorPanel, {
  type NewsletterEditorTab,
} from "./NewsletterEditorPanel";
import NewsletterModals, { type NewsletterModalState } from "./NewsletterModals";
import NewsletterPreviewPanel, { type PreviewDevice } from "./NewsletterPreviewPanel";
import NewsletterPreviewToolbar from "./NewsletterPreviewToolbar";
import NewsletterGalleryPickerSheet from "./NewsletterGalleryPickerSheet";
import NewsletterVersionHistorySheet from "./NewsletterVersionHistorySheet";
import NewsletterEditorPageSkeleton from "./NewsletterEditorPageSkeleton";
import styles from "./newsletter-workspace.module.css";
import type { NewsletterSaveState } from "./NewsletterSection";

type NewsletterWorkspaceProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  editionId: string;
  workspace: NewsletterWorkspaceState;
  onWorkspaceChange: (next: NewsletterWorkspaceState) => void;
  onWorkspaceSync: (next: NewsletterWorkspaceState) => void;
  onEditionSaved: (edition: NewsletterEdition) => void;
  onBack: () => void;
  onResetSample: () => void;
  galleryEnabled: boolean;
  saveState: NewsletterSaveState;
  saveError: string | null;
  isDirty: boolean;
  onSaveNow: () => Promise<void>;
};

export default function NewsletterWorkspace({
  organizationId,
  slug,
  schoolName,
  branding,
  editionId,
  workspace,
  onWorkspaceChange,
  onWorkspaceSync,
  onEditionSaved,
  onBack,
  onResetSample,
  galleryEnabled,
  saveState,
  saveError,
  isDirty,
  onSaveNow,
}: NewsletterWorkspaceProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const [previewVisible, setPreviewVisible] = useState(true);
  const [editorTab, setEditorTab] = useState<NewsletterEditorTab>("story");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [modal, setModal] = useState<NewsletterModalState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [coverGalleryPickerOpen, setCoverGalleryPickerOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [galleryUrlsRefreshing, setGalleryUrlsRefreshing] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const previewColumnRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef(workspace);
  const galleryRefreshDoneRef = useRef<string | null>(null);

  useEffect(() => {
    workspaceRef.current = workspace;
  }, [workspace]);

  const activeEdition = useMemo(
    () =>
      workspace.editions.find((e) => e.id === editionId) ?? workspace.editions[0],
    [workspace.editions, editionId],
  );

  const locked = activeEdition?.status === "published";

  const saveStatusLabel =
    saveState === "saving"
      ? "Saving…"
      : saveState === "error"
        ? saveError ?? "Couldn't save"
        : isDirty
          ? "Unsaved changes"
          : "Saved to MudKitchen";

  const galleryRefreshKey = [
    activeEdition?.coverGalleryPhotoId ?? "",
    ...(activeEdition?.photos.filter((p) => p.galleryPhotoId).map((p) => p.galleryPhotoId) ??
      []),
  ].join(",");

  useEffect(() => {
    if (!galleryRefreshKey) return;
    const attemptKey = `${editionId}:${galleryRefreshKey}`;
    if (galleryRefreshDoneRef.current === attemptKey) return;

    const edition = workspaceRef.current.editions.find((e) => e.id === editionId);
    if (!edition) return;

    let cancelled = false;
    setGalleryUrlsRefreshing(true);
    void refreshNewsletterEditionGalleryUrls(slug, edition)
      .then((refreshed) => {
        if (cancelled) return;
        galleryRefreshDoneRef.current = attemptKey;
        if (!newsletterEditionGalleryMediaChanged(edition, refreshed)) return;
        const current = workspaceRef.current;
        onWorkspaceSync({
          ...current,
          editions: current.editions.map((e) => (e.id === editionId ? refreshed : e)),
        });
      })
      .finally(() => {
        if (!cancelled) setGalleryUrlsRefreshing(false);
      });
    return () => {
      cancelled = true;
      setGalleryUrlsRefreshing(false);
    };
  }, [editionId, galleryRefreshKey, onWorkspaceSync, slug]);
  const pageContentLoading =
    (staffLoading && staffMembers.length === 0 && !staffError) || galleryUrlsRefreshing;

  const previewBranding = useMemo(
    () => newsletterVisualBrandingForPreview(branding),
    [branding],
  );

  const renderOptions = useMemo(
    () => ({
      staff: staffMembers,
      template: workspace.template,
      branding: newsletterVisualBrandingForExport(branding),
      primaryColor: theme.primary,
    }),
    [branding, staffMembers, theme.primary, workspace.template],
  );

  const loadStaff = useCallback(() => {
    setStaffLoading(true);
    setStaffError(null);
    void fetch(`/api/school/${slug}/staff`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error ?? "Failed to load staff.");
        }
        setStaffMembers((body.staffMembers ?? []) as StaffMemberRecord[]);
      })
      .catch((err: unknown) => {
        setStaffError(err instanceof Error ? err.message : "Failed to load staff.");
      })
      .finally(() => {
        setStaffLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/school/${slug}/staff`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error ?? "Failed to load staff.");
        }
        return body;
      })
      .then((body) => {
        if (cancelled) return;
        setStaffMembers((body.staffMembers ?? []) as StaffMemberRecord[]);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStaffError(err instanceof Error ? err.message : "Failed to load staff.");
      })
      .finally(() => {
        if (!cancelled) setStaffLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const updateActiveEdition = useCallback(
    (edition: NewsletterEdition) => {
      onWorkspaceChange({
        ...workspace,
        activeEditionId: editionId,
        editions: workspace.editions.map((e) => (e.id === edition.id ? edition : e)),
        template: templateFromEdition(edition, workspace.template),
      });
    },
    [editionId, onWorkspaceChange, workspace],
  );

  const updateTemplate = useCallback(
    (template: NewsletterSchoolTemplate) => {
      const edition = workspace.editions.find((e) => e.id === editionId);
      if (!edition) {
        onWorkspaceChange({ ...workspace, template, activeEditionId: editionId });
        return;
      }
      onWorkspaceChange({
        ...workspace,
        activeEditionId: editionId,
        template,
        editions: workspace.editions.map((e) =>
          e.id === edition.id
            ? {
                ...e,
                storyBlocks: template.storyBlocks.map((block) => {
                  const existing = e.storyBlocks.find((b) => b.id === block.id);
                  return { ...block, value: existing?.value ?? "" };
                }),
                sections: { ...template.sections },
              }
            : e,
        ),
      });
    },
    [editionId, onWorkspaceChange, workspace],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const showPreview = useCallback(() => {
    setPreviewVisible(true);
    window.requestAnimationFrame(() => {
      previewColumnRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, []);

  const togglePreview = useCallback(() => {
    setPreviewVisible((prev) => !prev);
  }, []);

  const handlePhotoInput = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (locked) return;
      const slotsLeft = MAX_NEWSLETTER_PHOTOS - activeEdition.photos.length;
      const files = [...(event.target.files ?? [])].slice(0, slotsLeft);
      if (!files.length) {
        showToast(`Up to ${MAX_NEWSLETTER_PHOTOS} photos.`);
        event.target.value = "";
        return;
      }
      const newPhotos = [...activeEdition.photos];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        try {
          const src = await prepareNewsletterImageFileForUpload(file);
          newPhotos.push({ id: createNewsletterId(), src, caption: "" });
        } catch {
          showToast("Could not load an image. Try JPG or PNG.");
        }
      }
      updateActiveEdition({ ...activeEdition, photos: newPhotos });
      event.target.value = "";
    },
    [activeEdition, locked, showToast, updateActiveEdition],
  );

  const exportHtml = useCallback(() => {
    const doc = buildExportHtmlDocument(activeEdition, workspace.school, renderOptions);
    downloadFile(doc, "text/html;charset=utf-8", `newsletter-${activeEdition.week || "draft"}.html`);
  }, [activeEdition, workspace.school, renderOptions]);

  const exportText = useCallback(async () => {
    const html = buildNewsletterArticleHtml(
      activeEdition,
      workspace.school,
      renderOptions,
    );
    const text = await plainTextFromHtml(html);
    downloadFile(text, "text/plain;charset=utf-8", `newsletter-${activeEdition.week || "draft"}.txt`);
  }, [activeEdition, workspace.school, renderOptions]);

  const copyText = useCallback(async () => {
    const html = buildNewsletterArticleHtml(
      activeEdition,
      workspace.school,
      renderOptions,
    );
    const text = await plainTextFromHtml(html);
    try {
      await navigator.clipboard.writeText(text);
      showToast("Text copied.");
    } catch {
      showToast("Copy failed — try Download text.");
    }
  }, [activeEdition, workspace.school, renderOptions, showToast]);

  const openPublish = useCallback(() => {
    if (locked) {
      showPreview();
      return;
    }
    setModal({ type: "publish" });
  }, [locked, showPreview]);

  const handlePublish = useCallback(async () => {
    const published = await publishNewsletterEditionApi(slug, activeEdition.id);
    onEditionSaved(published);
  }, [activeEdition.id, onEditionSaved, slug]);

  const workspaceStyle = useMemo(
    () =>
      ({
        "--primary": theme.primary,
      }) as React.CSSProperties,
    [theme.primary],
  );

  const toolbarProps = {
    theme,
    C,
    device,
    locked,
    previewVisible,
    onTogglePreview: togglePreview,
    onDeviceChange: setDevice,
    onExport: () => setModal({ type: "export" }),
    onVersionHistory: () => setVersionHistoryOpen(true),
    onSave: () => void onSaveNow(),
    saveDisabled: !isDirty,
    saving: saveState === "saving",
    onPublish: openPublish,
  };

  if (pageContentLoading) {
    return <NewsletterEditorPageSkeleton previewVisible={previewVisible} />;
  }

  return (
    <main className={styles.workspace} style={workspaceStyle}>
      <header className={styles.pagehead}>
        <div className={styles.pageheadMain}>
          <div className={styles.pageheadTitle}>
            <AdminButton
              theme={theme}
              variant="outline"
              size="compact"
              className={`${styles.pageheadBack} !text-[9px] !px-2 !py-1`}
              aria-label="Back to newsletters"
              onClick={onBack}
            >
              <ArrowLeft size={12} strokeWidth={1.65} aria-hidden />
              Back to newsletters
            </AdminButton>
            <AdminDisplayHeading theme={theme} as="h1" size="display">
              Weekly newsletter: {newsletterEditionDateRange(activeEdition)}
            </AdminDisplayHeading>
            <div className={styles.editionMeta}>
              <AdminChip theme={theme} tone={locked ? "success" : "warning"}>
                {locked ? "Published" : "Draft"}
              </AdminChip>
              <span style={saveState === "error" ? { color: C.textSecondary } : undefined}>
                {saveStatusLabel}
              </span>
            </div>
          </div>
          <NewsletterPreviewToolbar
            {...toolbarProps}
            variant="pagehead"
            className={styles.pageheadToolbar}
          />
        </div>
      </header>

      {locked ? (
        <div className={styles.publishedBanner}>
          <span>Published preview · Read-only</span>
          <AdminTextLink
            theme={theme}
            onClick={() =>
              setModal({
                type: "confirm",
                title: "Return to draft?",
                body: "Reopen this edition for editing. Nothing is sent to families.",
                confirmLabel: "Return to draft",
                onConfirm: () => {
                  updateActiveEdition({
                    ...activeEdition,
                    status: "draft",
                    publishedAt: undefined,
                  });
                },
              })
            }
          >
            Return to draft
          </AdminTextLink>
        </div>
      ) : null}

      <div className={styles.builderShell}>
          <div
            className={`${styles.builder} ${previewVisible ? "" : styles.builderPreviewHidden}`.trim()}
          >
              <div className={styles.editorColumn}>
                <NewsletterEditorPanel
                  edition={activeEdition}
                  template={workspace.template}
                  locked={locked}
                  editorTab={editorTab}
                  staffMembers={staffMembers}
                  staffLoading={staffLoading}
                  staffError={staffError}
                  onTabChange={(tab) => {
                    if (tab === "teachers") loadStaff();
                    setEditorTab(tab);
                  }}
                  onEditionChange={updateActiveEdition}
                  onTemplateChange={updateTemplate}
                  onOpenSections={() => setModal({ type: "sections" })}
                  onAddEvent={() => {
                    if (activeEdition.events.length >= MAX_NEWSLETTER_EVENTS) {
                      showToast(`Up to ${MAX_NEWSLETTER_EVENTS} dates.`);
                      return;
                    }
                    setModal({ type: "event" });
                  }}
                  onOpenGalleryPicker={() => setGalleryPickerOpen(true)}
                  onOpenCoverGalleryPicker={
                    galleryEnabled ? () => setCoverGalleryPickerOpen(true) : undefined
                  }
                  galleryEnabled={galleryEnabled}
                  slug={slug}
                  onEditEvent={(index) => setModal({ type: "event", index })}
                  onUploadPhotos={() => photoInputRef.current?.click()}
                  onToast={showToast}
                />
              </div>

              {previewVisible ? (
                <div ref={previewColumnRef} className={styles.previewColumnWrap}>
                  <NewsletterPreviewPanel
                    theme={theme}
                    edition={activeEdition}
                    school={workspace.school}
                    branding={previewBranding}
                    device={device}
                    staffMembers={staffMembers}
                    template={workspace.template}
                  />
                </div>
              ) : null}
            </div>
      </div>

      <footer className={styles.bottomNote}>
        <span>Click Save to store edits in MudKitchen. Publishing does not email families yet.</span>
        <AdminTextLink
          theme={theme}
          className="!text-[9px] !font-normal underline"
          onClick={() =>
            setModal({
              type: "confirm",
              title: "Reset to sample content?",
              body: "This replaces the current edition in this browser with sample text. Saving will write it to MudKitchen.",
              confirmLabel: "Reset sample",
              onConfirm: () => {
                setEditorTab("story");
                onResetSample();
              },
            })
          }
        >
          Reset sample
        </AdminTextLink>
      </footer>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handlePhotoInput}
      />

      <NewsletterModals
        modal={modal}
        workspace={workspace}
        activeEdition={activeEdition}
        onClose={() => setModal(null)}
        onWorkspaceChange={onWorkspaceChange}
        onActiveEditionChange={updateActiveEdition}
        onTemplateChange={updateTemplate}
        onToast={showToast}
        onShowPreview={showPreview}
        onExportHtml={exportHtml}
        onExportText={() => void exportText()}
        onCopyText={() => void copyText()}
        onPublish={handlePublish}
      />

      <NewsletterGalleryPickerSheet
        open={galleryPickerOpen}
        slug={slug}
        edition={activeEdition}
        mode="photos"
        onClose={() => setGalleryPickerOpen(false)}
        onAddPhotos={(newPhotos) => {
          const merged = [...activeEdition.photos, ...newPhotos].slice(
            0,
            MAX_NEWSLETTER_PHOTOS,
          );
          updateActiveEdition({ ...activeEdition, photos: merged });
        }}
      />

      <NewsletterGalleryPickerSheet
        open={coverGalleryPickerOpen}
        slug={slug}
        edition={activeEdition}
        mode="cover"
        onClose={() => setCoverGalleryPickerOpen(false)}
        onPickCover={({ galleryPhotoId, src }) => {
          updateActiveEdition({
            ...activeEdition,
            coverGalleryPhotoId: galleryPhotoId,
            coverImage: src,
          });
        }}
      />

      <NewsletterVersionHistorySheet
        open={versionHistoryOpen}
        slug={slug}
        edition={activeEdition}
        school={workspace.school}
        template={workspace.template}
        branding={branding}
        staffMembers={staffMembers}
        onClose={() => setVersionHistoryOpen(false)}
        onRestored={(edition) => {
          onEditionSaved(edition);
        }}
        onToast={showToast}
      />

      {toast ? (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
