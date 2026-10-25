"use client";

import { Check, Copy, Eye, FileText } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { weekLabel } from "@/lib/school-admin/newsletter/newsletter-dates";
import {
  buildExportHtmlDocument,
  downloadFile,
  plainTextFromHtml,
} from "@/lib/school-admin/newsletter/newsletter-export";
import { buildNewsletterArticleHtml } from "@/lib/school-admin/newsletter/newsletter-render";
import { resizeImageFileToDataUrl } from "@/lib/school-admin/newsletter/newsletter-photos";
import { createSampleEdition } from "@/lib/school-admin/newsletter/newsletter-sample";
import {
  loadSchoolTemplate,
  saveSchoolTemplate,
  templateFromEdition,
} from "@/lib/school-admin/newsletter/newsletter-template";
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
import styles from "./newsletter-workspace.module.css";

type NewsletterWorkspaceProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
};

function initWorkspace(
  organizationId: string,
  schoolName: string,
  primary: string,
): NewsletterWorkspaceState {
  const stored = loadSchoolTemplate(organizationId);
  return createSampleEdition(schoolName, primary, stored ?? undefined);
}

export default function NewsletterWorkspace({
  organizationId,
  slug,
  schoolName,
  branding: _branding,
}: NewsletterWorkspaceProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const [workspace, setWorkspace] = useState<NewsletterWorkspaceState>(() =>
    initWorkspace(organizationId, schoolName, theme.primary),
  );
  const [previewVisible, setPreviewVisible] = useState(true);
  const [editorTab, setEditorTab] = useState<NewsletterEditorTab>("story");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [modal, setModal] = useState<NewsletterModalState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const previewColumnRef = useRef<HTMLDivElement>(null);
  const templateSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeEdition = useMemo(
    () =>
      workspace.editions.find((e) => e.id === workspace.activeEditionId) ??
      workspace.editions[0],
    [workspace],
  );

  const locked = activeEdition.status === "published";

  const renderOptions = useMemo(
    () => ({
      staff: staffMembers,
      template: workspace.template,
    }),
    [staffMembers, workspace.template],
  );

  useEffect(() => {
    if (templateSaveTimer.current) clearTimeout(templateSaveTimer.current);
    templateSaveTimer.current = setTimeout(() => {
      saveSchoolTemplate(organizationId, workspace.template);
    }, 400);
    return () => {
      if (templateSaveTimer.current) clearTimeout(templateSaveTimer.current);
    };
  }, [organizationId, workspace.template]);

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
      setWorkspace((prev) => ({
        ...prev,
        editions: prev.editions.map((e) => (e.id === edition.id ? edition : e)),
        template: templateFromEdition(edition, prev.template),
      }));
    },
    [],
  );

  const updateTemplate = useCallback((template: NewsletterSchoolTemplate) => {
    setWorkspace((prev) => {
      const edition = prev.editions.find((e) => e.id === prev.activeEditionId);
      if (!edition) return { ...prev, template };
      return {
        ...prev,
        template,
        editions: prev.editions.map((e) =>
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
      };
    });
  }, []);

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

  const resetSample = useCallback(() => {
    setWorkspace(initWorkspace(organizationId, schoolName, theme.primary));
    setEditorTab("story");
  }, [organizationId, schoolName, theme.primary]);

  const handlePhotoInput = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (locked) return;
      const files = [...(event.target.files ?? [])].slice(
        0,
        6 - activeEdition.photos.length,
      );
      if (!files.length) {
        showToast("Up to six photos.");
        event.target.value = "";
        return;
      }
      const newPhotos = [...activeEdition.photos];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        try {
          const src = await resizeImageFileToDataUrl(file);
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

  const workspaceStyle = useMemo(
    () =>
      ({
        "--primary": theme.primary,
      }) as React.CSSProperties,
    [theme.primary],
  );

  const toolbarProps = {
    theme,
    edition: activeEdition,
    device,
    locked,
    previewVisible,
    onTogglePreview: togglePreview,
    onDeviceChange: setDevice,
    onLayoutChange: (layout: NewsletterEdition["layout"]) =>
      updateActiveEdition({ ...activeEdition, layout }),
    onExport: () => setModal({ type: "export" }),
  };

  return (
    <main className={styles.workspace} style={workspaceStyle}>
      <header className={styles.pagehead}>
        <div>
          <AdminSectionKicker theme={theme}>Communications</AdminSectionKicker>
          <AdminDisplayHeading theme={theme} as="h1" size="display" className="mt-2">
            Weekly newsletter
          </AdminDisplayHeading>
          <div className={styles.editionMeta}>
            <AdminChip theme={theme} tone={locked ? "success" : "warning"}>
              {locked ? "Published" : "Draft"}
            </AdminChip>
            <span>{weekLabel(activeEdition)}</span>
            <span>Not saved to MudKitchen yet</span>
          </div>
        </div>
        <div className={styles.headingActions}>
          <AdminButton
            theme={theme}
            variant="outline"
            size="compact"
            onClick={() => setModal({ type: "editions" })}
          >
            <FileText size={14} strokeWidth={1.65} aria-hidden />
            Editions
          </AdminButton>
          <AdminButton theme={theme} variant="primary" size="compact" onClick={openPublish}>
            {locked ? (
              <Eye size={14} strokeWidth={1.65} aria-hidden />
            ) : (
              <Check size={14} strokeWidth={1.65} aria-hidden />
            )}
            {locked ? "View edition" : "Review & publish"}
          </AdminButton>
        </div>
      </header>

      <div className={`${styles.navRow} ${styles.navRowActionsOnly}`}>
        <div className={styles.navActions}>
          <AdminTextLink
            theme={theme}
            disabled={locked}
            onClick={() => setModal({ type: "sections" })}
          >
            Sections
          </AdminTextLink>
          <AdminTextLink theme={theme} onClick={() => setModal({ type: "nextWeek" })}>
            <span className="inline-flex items-center gap-1">
              <Copy size={14} strokeWidth={1.65} aria-hidden />
              Next week
            </span>
          </AdminTextLink>
        </div>
      </div>

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
                  updateActiveEdition({ ...activeEdition, status: "draft" });
                },
              })
            }
          >
            Return to draft
          </AdminTextLink>
        </div>
      ) : null}

      <div className={styles.builderShell}>
        <NewsletterPreviewToolbar
          {...toolbarProps}
          className={styles.builderToolbarRow}
        />
        <div
          className={`${styles.builder} ${previewVisible ? "" : styles.builderPreviewHidden}`.trim()}
        >
          <div
            className={`${styles.editorColumn} ${previewVisible ? "" : styles.editorColumnCentered}`.trim()}
          >
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
              onAddEvent={() => setModal({ type: "event" })}
              onEditEvent={(index) => setModal({ type: "event", index })}
              onUploadPhotos={() => photoInputRef.current?.click()}
            />
          </div>

          {previewVisible ? (
            <div ref={previewColumnRef} className={styles.previewColumnWrap}>
              <NewsletterPreviewPanel
                theme={theme}
                edition={activeEdition}
                school={workspace.school}
                device={device}
                staffMembers={staffMembers}
                template={workspace.template}
              />
            </div>
          ) : null}
        </div>
      </div>

      <footer className={styles.bottomNote}>
        <span>Draft only — nothing is sent to families yet.</span>
        <AdminTextLink
          theme={theme}
          className="!text-[9px] !font-normal underline"
          onClick={() =>
            setModal({
              type: "confirm",
              title: "Reset to sample content?",
              body: "This replaces your in-browser edits with the sample newsletter.",
              confirmLabel: "Reset sample",
              onConfirm: resetSample,
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
        onWorkspaceChange={setWorkspace}
        onActiveEditionChange={updateActiveEdition}
        onTemplateChange={updateTemplate}
        onToast={showToast}
        onShowPreview={showPreview}
        onEditorTabStory={() => setEditorTab("story")}
        onExportHtml={exportHtml}
        onExportText={() => void exportText()}
        onCopyText={() => void copyText()}
      />

      {toast ? (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
