"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  importNewsletterWorkspaceApi,
  saveNewsletterEditionWithVersionApi,
} from "@/lib/school-admin/newsletter/newsletter-api-client";
import { createSampleEdition } from "@/lib/school-admin/newsletter/newsletter-sample";
import { templateFromEdition } from "@/lib/school-admin/newsletter/newsletter-template";
import type {
  NewsletterEdition,
  NewsletterWorkspaceState,
} from "@/lib/school-admin/newsletter/newsletter-types";
import {
  applyNewsletterSaveResultToLiveWorkspace,
  buildSavedBaselineAfterNewsletterSave,
  workspaceStatesEqual,
} from "@/lib/school-admin/newsletter/newsletter-save-merge";
import {
  clearBrowserNewsletterWorkspace,
  loadBrowserNewsletterWorkspaceForImport,
  markNewsletterImportPrompted,
  wasNewsletterImportPrompted,
} from "@/lib/school-admin/newsletter/newsletter-workspace-storage";
import { useHydrated } from "@/hooks/useHydrated";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import NewsletterOverviewPage from "./NewsletterOverviewPage";
import NewsletterOverviewSkeleton from "./NewsletterOverviewSkeleton";
import NewsletterEditorPageSkeleton from "./NewsletterEditorPageSkeleton";
import NewsletterWorkspace from "./NewsletterWorkspace";

export type NewsletterSaveState = "idle" | "saving" | "saved" | "error";

function cloneNewsletterWorkspace(state: NewsletterWorkspaceState): NewsletterWorkspaceState {
  return structuredClone(state);
}

type NewsletterSectionProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  galleryEnabled: boolean;
  initialEditionId?: string | null;
  initialWorkspace: NewsletterWorkspaceState;
};

export default function NewsletterSection({
  organizationId,
  slug,
  schoolName,
  branding,
  galleryEnabled,
  initialEditionId = null,
  initialWorkspace,
}: NewsletterSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editionId = searchParams.get("edition") ?? initialEditionId;
  const { theme, C } = useSchoolAdminStoryTheme();

  const hydrated = useHydrated();
  const [workspace, setWorkspace] = useState<NewsletterWorkspaceState>(initialWorkspace);
  const [saveState, setSaveState] = useState<NewsletterSaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const importCheckedRef = useRef(false);
  const workspaceRef = useRef(workspace);
  const savedWorkspaceRef = useRef(cloneNewsletterWorkspace(initialWorkspace));
  const saveGenerationRef = useRef(0);

  useEffect(() => {
    workspaceRef.current = workspace;
  }, [workspace]);

  const syncSavedBaseline = useCallback((next: NewsletterWorkspaceState) => {
    savedWorkspaceRef.current = cloneNewsletterWorkspace(next);
  }, []);

  const revertUnsavedChanges = useCallback(() => {
    setWorkspace(cloneNewsletterWorkspace(savedWorkspaceRef.current));
    setIsDirty(false);
  }, []);

  const {
    dialogOpen: leaveDialogOpen,
    requestAction,
    confirmLeave,
    cancelLeave,
  } = useUnsavedChangesGuard({
    isDirty,
    enabled: hydrated,
  });

  const handleConfirmLeave = useCallback(() => {
    revertUnsavedChanges();
    confirmLeave();
  }, [confirmLeave, revertUnsavedChanges]);

  useEffect(() => {
    if (!hydrated || importCheckedRef.current) return;
    importCheckedRef.current = true;

    if (initialWorkspace.editions.length > 0) return;
    if (wasNewsletterImportPrompted(organizationId)) return;

    const browserWorkspace = loadBrowserNewsletterWorkspaceForImport(organizationId);
    if (!browserWorkspace?.editions.length) return;

    markNewsletterImportPrompted(organizationId);
    const shouldImport = window.confirm(
      "You have newsletter drafts saved only in this browser. Import them into MudKitchen now?",
    );
    if (!shouldImport) return;

    void importNewsletterWorkspaceApi(slug, browserWorkspace)
      .then((imported) => {
        clearBrowserNewsletterWorkspace(organizationId);
        setWorkspace(imported);
        syncSavedBaseline(imported);
        setSaveState("saved");
        setSaveError(null);
        setIsDirty(false);
      })
      .catch((err: unknown) => {
        setSaveState("error");
        setSaveError(err instanceof Error ? err.message : "Import failed.");
      });
  }, [hydrated, initialWorkspace.editions.length, organizationId, slug, syncSavedBaseline]);

  const applyWorkspaceChange = useCallback((next: NewsletterWorkspaceState) => {
    setWorkspace(next);
    setIsDirty(true);
  }, []);

  const syncWorkspace = useCallback((next: NewsletterWorkspaceState) => {
    setWorkspace(next);
  }, []);

  const saveNow = useCallback(async () => {
    if (!editionId) return;
    const current = workspaceRef.current;
    const edition = current.editions.find((e) => e.id === editionId);
    if (!edition) return;

    const submittedEdition = structuredClone(edition);
    const submittedTemplate = structuredClone(current.template);
    const generation = ++saveGenerationRef.current;

    setSaveState("saving");
    setSaveError(null);

    try {
      const result = await saveNewsletterEditionWithVersionApi(
        slug,
        editionId,
        submittedEdition,
        submittedTemplate,
      );
      if (generation !== saveGenerationRef.current) return;

      const live = workspaceRef.current;
      const displayWorkspace = applyNewsletterSaveResultToLiveWorkspace({
        live,
        submittedEdition,
        submittedTemplate,
        savedEditionId: editionId,
        resultEdition: result.edition,
        resultTemplate: result.template,
      });
      syncSavedBaseline(
        buildSavedBaselineAfterNewsletterSave(
          savedWorkspaceRef.current,
          live,
          editionId,
          result.edition,
          result.template,
        ),
      );
      setWorkspace(displayWorkspace);
      setSaveState("saved");
      setIsDirty(!workspaceStatesEqual(displayWorkspace, savedWorkspaceRef.current));
    } catch (err: unknown) {
      if (generation !== saveGenerationRef.current) return;
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Could not save newsletter.");
    }
  }, [editionId, slug, syncSavedBaseline]);

  const replaceWorkspaceEdition = useCallback(
    (edition: NewsletterEdition) => {
      setWorkspace((prev) => {
        const next: NewsletterWorkspaceState = {
          ...prev,
          template: templateFromEdition(edition, prev.template),
          editions: prev.editions.map((e) => (e.id === edition.id ? edition : e)),
        };
        syncSavedBaseline(next);
        return next;
      });
      setIsDirty(false);
    },
    [syncSavedBaseline],
  );

  useEffect(() => {
    if (!hydrated || !editionId) return;
    const exists = workspace.editions.some((e) => e.id === editionId);
    if (!exists) {
      router.replace(pathname);
    }
  }, [hydrated, editionId, workspace.editions, pathname, router]);

  const openEdition = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("edition", id);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const backToOverview = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  const guardedBackToOverview = useCallback(() => {
    requestAction(backToOverview);
  }, [backToOverview, requestAction]);

  const guardedOpenEdition = useCallback(
    (id: string) => {
      requestAction(() => openEdition(id));
    },
    [openEdition, requestAction],
  );

  const resetSampleAndLeave = useCallback(() => {
    requestAction(() => {
      const current = workspaceRef.current;
      const sample = createSampleEdition(schoolName, theme.primary, current.template);
      applyWorkspaceChange(sample);
      backToOverview();
    });
  }, [applyWorkspaceChange, backToOverview, requestAction, schoolName, theme.primary]);

  const leaveDialog = (
    <ConfirmDialog
      C={C}
      open={leaveDialogOpen}
      title="Unsaved changes"
      description="You have unsaved changes. If you leave now, your changes will be lost."
      confirmLabel="Leave without saving"
      cancelLabel="Keep editing"
      variant="destructive"
      onConfirm={handleConfirmLeave}
      onClose={cancelLeave}
    />
  );

  if (editionId && !hydrated) {
    return (
      <>
        <NewsletterEditorPageSkeleton />
        {leaveDialog}
      </>
    );
  }

  if (!hydrated) {
    return (
      <>
        <NewsletterOverviewSkeleton />
        {leaveDialog}
      </>
    );
  }

  if (hydrated && editionId && workspace.editions.some((e) => e.id === editionId)) {
    return (
      <>
        <NewsletterWorkspace
          organizationId={organizationId}
          slug={slug}
          schoolName={schoolName}
          branding={branding}
          editionId={editionId}
          workspace={workspace}
          onWorkspaceChange={applyWorkspaceChange}
          onWorkspaceSync={syncWorkspace}
          onEditionSaved={replaceWorkspaceEdition}
          onBack={guardedBackToOverview}
          onResetSample={resetSampleAndLeave}
          galleryEnabled={galleryEnabled}
          saveState={saveState}
          saveError={saveError}
          isDirty={isDirty}
          onSaveNow={saveNow}
        />
        {leaveDialog}
      </>
    );
  }

  return (
    <>
      <NewsletterOverviewPage
        slug={slug}
        workspace={workspace}
        onWorkspaceChange={setWorkspace}
        onOpenEdition={guardedOpenEdition}
      />
      {leaveDialog}
    </>
  );
}
