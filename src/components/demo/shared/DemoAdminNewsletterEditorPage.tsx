"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DemoAdminGardenShell from "@/components/demo/shared/DemoAdminGardenShell";
import { AdminGardenPage } from "@/components/school-admin/garden/kit";
import NewsletterWorkspace from "@/components/school-admin/newsletter/NewsletterWorkspace";
import type { NewsletterSaveState } from "@/components/school-admin/newsletter/NewsletterSection";
import type { NewsletterEditorPreview } from "@/components/school-admin/newsletter/useNewsletterEditorModel";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { GardenOverlayHostProvider } from "@/components/school-parent/garden/overlay-host";
import {
  buildDemoNewsletterWorkspace,
  DEMO_NEWSLETTER_GALLERY,
  DEMO_NEWSLETTER_STAFF,
} from "@/data/school-demos/demo-newsletter-workspace";
import { DEMO_PORTAL_ORG_ID, DEMO_PORTAL_SLUG } from "@/data/school-demos/demo-portal-shared";
import { luffLearningAdminDemoConfig } from "@/data/school-demos/luff-learning-admin-demo";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast } from "@/lib/school-admin/admin-toast";
import type {
  NewsletterEdition,
  NewsletterWorkspaceState,
} from "@/lib/school-admin/newsletter/newsletter-types";

/** Which part of the builder the embed opens on. */
export type NewsletterEditorDemoVariant = "editor" | "teacherUpdates" | "photoGallery";

const VARIANT_PREVIEW: Record<
  NewsletterEditorDemoVariant,
  Pick<NewsletterEditorPreview, "initialFocus" | "initialPanelOpen" | "initialGalleryPickerOpen">
> = {
  editor: {},
  teacherUpdates: { initialFocus: "teachers", initialPanelOpen: true },
  photoGallery: { initialFocus: "photos", initialGalleryPickerOpen: true },
};

const SAVE_DELAY_MS = 450;

/**
 * Blog demo of the newsletter builder: the REAL Garden builder
 * (`NewsletterWorkspace`) inside the real Garden admin frame, fed by fixtures.
 * Edits, Save and Publish stay in memory; nothing touches the network.
 */
export default function DemoAdminNewsletterEditorPage({
  variant = "editor",
}: {
  variant?: NewsletterEditorDemoVariant;
}) {
  const previewPathname = useMemo(() => schoolAdminPath(DEMO_PORTAL_SLUG, "my_school", "newsletters"), []);

  return (
    // Fills the frame's content box (`BlogProductDemoFrame fitHeight`), so toasts and drawer footers stay on screen.
    <div className="showcase-demo-embed relative mx-auto h-full w-[1100px] max-w-full overflow-hidden">
      <DemoAdminGardenShell
        config={luffLearningAdminDemoConfig}
        previewPathname={previewPathname}
        // The builder has three columns; the collapsed sidebar leaves the newsletter room to read.
        sidebarExpanded={false}
        data-testid="demo-admin-newsletter-editor"
      >
        {({ branding, schoolName, portalHost }) => (
          <GardenOverlayHostProvider container={portalHost}>
            <DemoNewsletterBuilder branding={branding} schoolName={schoolName} variant={variant} />
          </GardenOverlayHostProvider>
        )}
      </DemoAdminGardenShell>
    </div>
  );
}

/** A stripped-down `NewsletterSection`: workspace state, save state and an in-memory save. */
function DemoNewsletterBuilder({
  branding,
  schoolName,
  variant,
}: {
  branding: OrganizationBranding;
  schoolName: string;
  variant: NewsletterEditorDemoVariant;
}) {
  const { theme } = useSchoolAdminStoryTheme();
  const [workspace, setWorkspace] = useState<NewsletterWorkspaceState>(() =>
    buildDemoNewsletterWorkspace(schoolName, theme.primary),
  );
  const [saveState, setSaveState] = useState<NewsletterSaveState>("saved");
  const [isDirty, setIsDirty] = useState(false);
  const workspaceRef = useRef(workspace);
  useEffect(() => {
    workspaceRef.current = workspace;
  }, [workspace]);
  const editionId = workspace.activeEditionId;

  const preview = useMemo<NewsletterEditorPreview>(
    () => ({
      staffMembers: DEMO_NEWSLETTER_STAFF,
      galleryPhotos: DEMO_NEWSLETTER_GALLERY,
      ...VARIANT_PREVIEW[variant],
    }),
    [variant],
  );

  const applyWorkspaceChange = useCallback((next: NewsletterWorkspaceState) => {
    setWorkspace(next);
    setIsDirty(true);
  }, []);

  const replaceEdition = useCallback((edition: NewsletterEdition) => {
    setWorkspace((prev) => ({
      ...prev,
      editions: prev.editions.map((e) => (e.id === edition.id ? edition : e)),
    }));
    setIsDirty(false);
  }, []);

  const saveNow = useCallback(async () => {
    setSaveState("saving");
    await new Promise((resolve) => window.setTimeout(resolve, SAVE_DELAY_MS));
    const edition = workspaceRef.current.editions.find((e) => e.id === editionId);
    setSaveState("saved");
    setIsDirty(false);
    adminToast.success(edition?.status === "published" ? "Changes saved." : "Draft saved.", {
      id: "newsletter-save",
      description:
        edition?.status === "published"
          ? "Families see the updated newsletter now."
          : "Families can't see it until you publish.",
    });
    return true;
  }, [editionId]);

  const noop = useCallback(() => {}, []);

  return (
    <AdminGardenPage theme={theme} containerClassName="!max-w-none !gap-0 !p-0" data-testid="admin-newsletter-editor">
      <NewsletterWorkspace
        organizationId={DEMO_PORTAL_ORG_ID}
        slug={DEMO_PORTAL_SLUG}
        schoolName={schoolName}
        branding={branding}
        editionId={editionId}
        workspace={workspace}
        onWorkspaceChange={applyWorkspaceChange}
        onWorkspaceSync={setWorkspace}
        onEditionSaved={replaceEdition}
        onBack={noop}
        onResetSample={noop}
        galleryEnabled
        saveState={saveState}
        saveError={null}
        isDirty={isDirty}
        onSaveNow={saveNow}
        preview={preview}
      />
    </AdminGardenPage>
  );
}
