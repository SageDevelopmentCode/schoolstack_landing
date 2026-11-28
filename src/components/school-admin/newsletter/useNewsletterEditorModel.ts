"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBuilderViewMode } from "@/components/school-admin/admissions/builder-view-mode";
import type { ReadinessItem } from "@/components/school-admin/admissions/flows/flowReadiness";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { publishNewsletterEditionApi } from "@/lib/school-admin/newsletter/newsletter-api-client";
import {
  newsletterVisualBrandingForExport,
  newsletterVisualBrandingForPreview,
} from "@/lib/school-admin/newsletter/newsletter-branding";
import {
  buildExportHtmlDocument,
  downloadFile,
  plainTextFromHtml,
} from "@/lib/school-admin/newsletter/newsletter-export";
import { newsletterEditionGalleryMediaChanged } from "@/lib/school-admin/newsletter/newsletter-image-url";
import {
  canAddCustomStoryBlock,
  customStoryBlockLimitMessage,
  MAX_NEWSLETTER_PHOTOS,
} from "@/lib/school-admin/newsletter/newsletter-limits";
import { prepareNewsletterImageFileForUpload } from "@/lib/school-admin/newsletter/newsletter-photos";
import { newsletterOutline, newsletterReadiness } from "@/lib/school-admin/newsletter/newsletter-readiness";
import {
  buildNewsletterArticleHtml,
  type NewsletterRegion,
} from "@/lib/school-admin/newsletter/newsletter-render";
import { templateFromEdition } from "@/lib/school-admin/newsletter/newsletter-template";
import {
  createNewsletterId,
  type NewsletterEdition,
  type NewsletterSchoolTemplate,
  type NewsletterStoryBlock,
  type NewsletterWorkspaceState,
} from "@/lib/school-admin/newsletter/newsletter-types";
import { refreshNewsletterEditionGalleryUrls } from "@/lib/school-admin/newsletter/refresh-newsletter-gallery-photo-urls";
import type { GalleryPhoto } from "@/lib/school-gallery/types";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import type { NewsletterSaveState } from "./NewsletterSection";
import type { PreviewDevice } from "./NewsletterPreviewPanel";

export type NewsletterModal =
  | { type: "sections" }
  | { type: "export" }
  | { type: "returnToDraft" }
  | { type: "resetSample" };

export type NewsletterEditorModelProps = {
  slug: string;
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
  /** Resolves true when the edition reached MudKitchen. */
  onSaveNow: () => Promise<boolean>;
  /** Marketing demos only: fixtures instead of the network (see `NewsletterEditorPreview`). */
  preview?: NewsletterEditorPreview;
};

/**
 * Fixture mode for marketing demos (blog embeds): the real builder with no
 * network. Staff and gallery photos come from here, publish only changes the
 * edition in memory, and version history shows its empty state. Wrap the
 * builder in `GardenOverlayHostProvider` so drawers stay in the demo canvas.
 * Undefined in the admin portal.
 */
export type NewsletterEditorPreview = {
  staffMembers: StaffMemberRecord[];
  galleryPhotos: GalleryPhoto[];
  initialFocus?: NewsletterBuilderFocus;
  /** Open the side panel for `initialFocus` on mount. */
  initialPanelOpen?: boolean;
  /** Open the "Add from gallery" picker on mount. */
  initialGalleryPickerOpen?: boolean;
};

/** Where the builder canvas is: one newsletter part, or Review & publish. */
export type NewsletterBuilderFocus = NewsletterRegion | "review";

const PUBLISH_ERROR_ID = "newsletter-publish-error";

/**
 * View model for the newsletter builder (§5 of the admin Garden skill): all
 * state, loading and actions live here so the view only draws. Behaviour is
 * the same as the old tabbed editor; save state comes from NewsletterSection.
 */
export function useNewsletterEditorModel(props: NewsletterEditorModelProps) {
  const {
    slug,
    branding,
    editionId,
    workspace,
    onWorkspaceChange,
    onWorkspaceSync,
    onEditionSaved,
    saveState,
    isDirty,
    onSaveNow,
    preview,
  } = props;
  const { theme, C } = useSchoolAdminStoryTheme();

  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [storedViewMode, setStoredViewMode] = useBuilderViewMode("newsletter-builder-view");
  // Demos always open on Family view and don't touch the admin's saved choice.
  const [previewViewMode, setPreviewViewMode] = useState<typeof storedViewMode>("family");
  const viewMode = preview ? previewViewMode : storedViewMode;
  const setViewMode = preview ? setPreviewViewMode : setStoredViewMode;
  const [focus, setFocus] = useState<NewsletterBuilderFocus>(preview?.initialFocus ?? "cover");
  /** Family view: the side panel editing `focus` is open. */
  const [panelOpen, setPanelOpen] = useState(preview?.initialPanelOpen ?? false);
  const [modal, setModal] = useState<NewsletterModal | null>(null);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(preview?.initialGalleryPickerOpen ?? false);
  const [coverGalleryPickerOpen, setCoverGalleryPickerOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [galleryUrlsRefreshing, setGalleryUrlsRefreshing] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>(preview?.staffMembers ?? []);
  const [staffLoading, setStaffLoading] = useState(!preview);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [notifyFamilies, setNotifyFamilies] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const workspaceRef = useRef(workspace);
  const galleryRefreshDoneRef = useRef<string | null>(null);
  const onWorkspaceSyncRef = useRef(onWorkspaceSync);

  useEffect(() => {
    workspaceRef.current = workspace;
    onWorkspaceSyncRef.current = onWorkspaceSync;
  }, [workspace, onWorkspaceSync]);

  const activeEdition = useMemo(
    () => workspace.editions.find((e) => e.id === editionId) ?? workspace.editions[0],
    [workspace.editions, editionId],
  );
  const locked = activeEdition?.status === "published";

  /* ---------------- Gallery URL refresh (signed URLs expire) ---------------- */

  const isPreview = Boolean(preview);
  const galleryRefreshKey = isPreview
    ? ""
    : [
    activeEdition?.coverGalleryPhotoId ?? "",
        ...(activeEdition?.photos.filter((p) => p.galleryPhotoId).map((p) => p.galleryPhotoId) ?? []),
      ].join(",");

  useEffect(() => {
    if (!galleryRefreshKey) return;
    const attemptKey = `${editionId}:${galleryRefreshKey}`;
    if (galleryRefreshDoneRef.current === attemptKey) return;
    const edition = workspaceRef.current.editions.find((e) => e.id === editionId);
    if (!edition) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setGalleryUrlsRefreshing(true);
    });
    void refreshNewsletterEditionGalleryUrls(slug, edition)
      .then((refreshed) => {
        if (cancelled) return;
        galleryRefreshDoneRef.current = attemptKey;
        if (!newsletterEditionGalleryMediaChanged(edition, refreshed)) return;
        const current = workspaceRef.current;
        onWorkspaceSyncRef.current({
          ...current,
          editions: current.editions.map((e) => (e.id === editionId ? refreshed : e)),
        });
      })
      .finally(() => {
        if (!cancelled) setGalleryUrlsRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editionId, galleryRefreshKey, slug]);

  /* ---------------- Staff (teacher updates) ---------------- */

  const staffRequestRef = useRef(0);
  const loadStaff = useCallback(() => {
    if (isPreview) return;
    const request = ++staffRequestRef.current;
    setStaffLoading(true);
    setStaffError(null);
    void fetch(`/api/school/${slug}/staff`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Failed to load staff.");
        if (request === staffRequestRef.current) {
          setStaffMembers((body.staffMembers ?? []) as StaffMemberRecord[]);
        }
      })
      .catch((err: unknown) => {
        if (request === staffRequestRef.current) {
          setStaffError(err instanceof Error ? err.message : "Failed to load staff.");
        }
      })
      .finally(() => {
        if (request === staffRequestRef.current) setStaffLoading(false);
      });
  }, [isPreview, slug]);

  useEffect(() => {
    queueMicrotask(loadStaff);
    return () => {
      staffRequestRef.current += 1;
    };
  }, [loadStaff]);

  /* ---------------- Edits ---------------- */

  const updateActiveEdition = useCallback(
    (edition: NewsletterEdition) => {
      const current = workspaceRef.current;
      onWorkspaceChange({
        ...current,
        activeEditionId: editionId,
        editions: current.editions.map((e) => (e.id === edition.id ? edition : e)),
        template: templateFromEdition(edition, current.template),
      });
    },
    [editionId, onWorkspaceChange],
  );

  const updateTemplate = useCallback(
    (template: NewsletterSchoolTemplate) => {
      const current = workspaceRef.current;
      const edition = current.editions.find((e) => e.id === editionId);
      if (!edition) {
        onWorkspaceChange({ ...current, template, activeEditionId: editionId });
        return;
      }
      onWorkspaceChange({
        ...current,
        activeEditionId: editionId,
        template,
        editions: current.editions.map((e) =>
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
    [editionId, onWorkspaceChange],
  );

  /** Toast ids come from the message so unrelated messages don't replace each other. */
  const showToast = useCallback(
    (message: string, tone: "success" | "error" | "info" = "info", options?: { description?: string }) => {
      const key = message.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
      if (tone === "success") adminToast.success(message, { id: `newsletter-${key}`, description: options?.description });
      else if (tone === "error") adminToast.error(message, { id: `newsletter-${key}-error`, description: options?.description });
      else adminToast.info(message, { id: `newsletter-${key}-info`, description: options?.description });
    },
    [],
  );

  /** Adds a custom story section (same limit as before) and opens it. */
  const addCustomSection = useCallback(() => {
    if (locked) return;
    const current = workspaceRef.current;
    const edition = current.editions.find((e) => e.id === editionId);
    if (!edition) return;
    if (!canAddCustomStoryBlock(current.template)) {
      showToast(customStoryBlockLimitMessage());
      return;
    }
    const block: NewsletterStoryBlock = {
      id: createNewsletterId(),
      kind: "custom",
      heading: "Custom section",
      prompt: "Your prompt",
      optional: true,
      enabled: true,
      value: "",
    };
    const { value: _value, ...templateBlock } = block;
    void _value;
    onWorkspaceChange({
      ...current,
      activeEditionId: editionId,
      template: { ...current.template, storyBlocks: [...current.template.storyBlocks, templateBlock] },
      editions: current.editions.map((e) =>
        e.id === editionId ? { ...e, storyBlocks: [...e.storyBlocks, block] } : e,
      ),
    });
    setFocus(`story:${block.id}`);
    setPanelOpen(true);
  }, [editionId, locked, onWorkspaceChange, showToast]);

  const handlePhotoInput = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (locked) return;
      const edition = workspaceRef.current.editions.find((e) => e.id === editionId);
      if (!edition) return;
      const slotsLeft = MAX_NEWSLETTER_PHOTOS - edition.photos.length;
      const files = [...(event.target.files ?? [])].slice(0, slotsLeft);
      event.target.value = "";
      if (!files.length) {
        showToast(`Up to ${MAX_NEWSLETTER_PHOTOS} photos.`, "info", { description: "Remove a photo to add another." });
        return;
      }
      const newPhotos = [...edition.photos];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        try {
          const src = await prepareNewsletterImageFileForUpload(file);
          newPhotos.push({ id: createNewsletterId(), src, caption: "" });
        } catch {
          showToast("Couldn't add a photo.", "error", {
            description: `“${file.name}” couldn't be loaded. Try a JPG or PNG.`,
          });
        }
      }
      const latest = workspaceRef.current.editions.find((e) => e.id === editionId) ?? edition;
      updateActiveEdition({ ...latest, photos: newPhotos.slice(0, MAX_NEWSLETTER_PHOTOS) });
    },
    [editionId, locked, showToast, updateActiveEdition],
  );

  /* ---------------- Rendering ---------------- */

  const previewBranding = useMemo(() => newsletterVisualBrandingForPreview(branding), [branding]);
  const exportOptions = useMemo(
    () => ({
      staff: staffMembers,
      template: workspace.template,
      branding: newsletterVisualBrandingForExport(branding),
      primaryColor: theme.primary,
    }),
    [branding, staffMembers, theme.primary, workspace.template],
  );

  const exportHtml = useCallback(() => {
    const doc = buildExportHtmlDocument(activeEdition, workspace.school, exportOptions);
    downloadFile(doc, "text/html;charset=utf-8", `newsletter-${activeEdition.week || "draft"}.html`);
  }, [activeEdition, workspace.school, exportOptions]);

  const exportText = useCallback(async () => {
    const text = await plainTextFromHtml(buildNewsletterArticleHtml(activeEdition, workspace.school, exportOptions));
    downloadFile(text, "text/plain;charset=utf-8", `newsletter-${activeEdition.week || "draft"}.txt`);
  }, [activeEdition, workspace.school, exportOptions]);

  const copyText = useCallback(async () => {
    const text = await plainTextFromHtml(buildNewsletterArticleHtml(activeEdition, workspace.school, exportOptions));
    try {
      await navigator.clipboard.writeText(text);
      showToast("Text copied.", "success", { description: "Paste it into an email or document." });
      return true;
    } catch {
      showToast("Couldn't copy the text.", "error", { description: "Use Download text instead — nothing was copied." });
      return false;
    }
  }, [activeEdition, workspace.school, exportOptions, showToast]);

  /* ---------------- Builder focus ---------------- */

  const readiness = useMemo(() => newsletterReadiness(activeEdition), [activeEdition]);
  const outline = useMemo(
    () => newsletterOutline(activeEdition, workspace.template, staffMembers),
    [activeEdition, workspace.template, staffMembers],
  );

  // If the focused story block was hidden or removed, fall back to the cover.
  const focusExists =
    focus === "review" || !focus.startsWith("story:") || outline.some((row) => row.region === focus);
  const effectiveFocus: NewsletterBuilderFocus = focusExists ? focus : "cover";

  const openRegion = useCallback(
    (region: NewsletterRegion) => {
      if (region === "teachers" && staffError) loadStaff();
      setFocus(region);
      setPanelOpen(true);
    },
    [loadStaff, staffError],
  );

  const selectOutline = useCallback(
    (target: NewsletterBuilderFocus) => {
      setFocus(target);
      if (target === "review") {
        setPanelOpen(false);
        return;
      }
      if (viewMode === "family" && !locked) setPanelOpen(true);
      // Compact list: scroll its card into view.
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(`[data-newsletter-region-card="${CSS.escape(target)}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [locked, viewMode],
  );

  const focusReadinessItem = useCallback(
    (item: ReadinessItem) => {
      const region = (item.stepId ?? "cover") as NewsletterRegion;
      setFocus(region);
      setPanelOpen(viewMode === "family");
      window.requestAnimationFrame(() => {
        const fieldId =
          item.id === "title"
            ? `newsletter-title-${activeEdition.id}`
            : item.id === "week"
              ? `newsletter-week-begin-${activeEdition.id}`
              : null;
        window.setTimeout(() => {
          const el = fieldId
            ? document.getElementById(fieldId)
            : document.querySelector<HTMLElement>("[data-newsletter-story-value]");
          el?.focus({ preventScroll: false });
        }, 260);
      });
    },
    [activeEdition.id, viewMode],
  );

  /* ---------------- Save / publish ---------------- */

  const publishRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const publish = useCallback(async () => {
    if (publishing || locked || !readiness.ready) return;
    setPublishing(true);
    try {
      // Publishing reads the stored edition, so unsaved edits are saved first.
      if (isDirty) {
        const saved = await onSaveNow();
        if (!saved) return;
      }
      const published = preview
        ? await previewPublish(workspaceRef.current.editions.find((e) => e.id === activeEdition.id) ?? activeEdition)
        : await publishNewsletterEditionApi(slug, activeEdition.id, notifyFamilies);
      onEditionSaved(published);
      adminToast.dismiss(PUBLISH_ERROR_ID);
      adminToast.success("Published.", {
        id: "newsletter-publish",
        description: notifyFamilies
          ? "Families can read it in the parent portal and were notified by email and push."
          : "Families can read it in the parent portal. No notification was sent.",
      });
      setFocus("cover");
    } catch (err: unknown) {
      adminToast.error("Couldn't publish.", {
        id: PUBLISH_ERROR_ID,
        description: `${formatActionError(err, "Could not publish this newsletter.")} It's still a draft — families can't see it yet.`,
        action: { label: "Retry", onClick: () => void publishRef.current() },
      });
    } finally {
      setPublishing(false);
    }
  }, [activeEdition, isDirty, locked, notifyFamilies, onEditionSaved, onSaveNow, preview, publishing, readiness.ready, slug]);
  useEffect(() => {
    publishRef.current = publish;
  }, [publish]);

  const returnToDraft = useCallback(() => {
    updateActiveEdition({ ...activeEdition, status: "draft", publishedAt: undefined });
    setModal(null);
    showToast("Back to draft.", "info", {
      description: "Families still see the published version until you save. Save to take it down.",
    });
  }, [activeEdition, showToast, updateActiveEdition]);

  return {
    ...props,
    theme,
    C,
    activeEdition,
    locked,
    template: workspace.template,
    school: workspace.school,
    staffMembers,
    staffLoading,
    staffError,
    loadStaff,
    galleryUrlsRefreshing,
    previewBranding,
    device,
    setDevice,
    viewMode,
    setViewMode,
    focus: effectiveFocus,
    panelOpen: panelOpen && effectiveFocus !== "review" && !locked,
    setPanelOpen,
    openRegion,
    selectOutline,
    focusReadinessItem,
    readiness,
    outline,
    modal,
    setModal,
    galleryPickerOpen,
    setGalleryPickerOpen,
    coverGalleryPickerOpen,
    setCoverGalleryPickerOpen,
    versionHistoryOpen,
    setVersionHistoryOpen,
    photoInputId: `newsletter-photo-input-${editionId}`,
    requestPhotoUpload: () => document.getElementById(`newsletter-photo-input-${editionId}`)?.click(),
    handlePhotoInput,
    updateActiveEdition,
    updateTemplate,
    addCustomSection,
    showToast,
    exportHtml,
    exportText,
    copyText,
    notifyFamilies,
    setNotifyFamilies,
    publishing,
    publish,
    returnToDraft,
    saving: saveState === "saving",
  };
}

/** Demo publish: same busy time as a real request, nothing leaves the page. */
async function previewPublish(edition: NewsletterEdition): Promise<NewsletterEdition> {
  await new Promise((resolve) => window.setTimeout(resolve, 450));
  return { ...edition, status: "published", publishedAt: new Date().toISOString() };
}

export type NewsletterEditorModel = ReturnType<typeof useNewsletterEditorModel>;
