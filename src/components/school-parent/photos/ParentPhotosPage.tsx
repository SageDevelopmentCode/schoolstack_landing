"use client";

import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { useCelebrate } from "@/components/school-parent/garden/motion";
import ParentGardenGallery from "@/components/school-parent/photos/garden/ParentGardenGallery";
import PhotoPermissionsCard from "@/components/school-parent/photos/garden/PhotoPermissionsCard";
import PhotoPermissionsGuideCard from "@/components/school-parent/photos/garden/PhotoPermissionsGuideCard";
import PhotoPermissionsPanel from "@/components/school-parent/photos/garden/PhotoPermissionsPanel";
import { useParentPhotosModel } from "@/components/school-parent/photos/useParentPhotosModel";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type { GalleryPhotosFeedInitial } from "@/components/school-gallery/useGalleryPhotosFeed";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import type { PhotoMediaConsentState } from "@/lib/students/load-student-photo-media-consents";

type ParentPhotosPageProps = {
  organizationId: string;
  slug: string;
  programId?: string;
  eligibleChildren: FamilyChildOverview[];
  initialConsentsByStudentId: Record<string, PhotoMediaConsentState>;
  previewMode?: boolean;
  previewFamilyId?: string;
  initialFeed?: GalleryPhotosFeedInitial | null;
};

/**
 * Parent Photos tab (Garden): the school gallery in the main column, each
 * child's photo permission in the rail. Preview mode shows everything with
 * permission editing disabled.
 */
export default function ParentPhotosPage({
  organizationId,
  slug,
  programId,
  eligibleChildren,
  initialConsentsByStudentId,
  previewMode = false,
  previewFamilyId,
  initialFeed,
}: ParentPhotosPageProps) {
  const { theme } = useParentTheme();
  const model = useParentPhotosModel({
    organizationId,
    eligibleChildren,
    initialConsentsByStudentId,
  });

  useCelebrate(model.justCompletedAll, theme, "parent-photos-permissions-complete");

  return (
    <>
      <ParentGardenFrame theme={theme}>
        <div className={PORTAL_HOME_CONTAINER_CLASS} data-testid="parent-photos-page">
          <ParentGardenPageHeader
            kicker="Your family"
            title="Photos"
            subtitle="School gallery and your child's photo permissions in one place."
            data-testid="parent-photos-story-header"
          />

          {/* Phones: permissions → gallery → guide. lg: gallery left, permissions + guide in the rail. */}
          <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr] lg:grid-rows-[auto_1fr]">
            <div className="min-w-0 lg:col-start-2 lg:row-start-1">
              <PhotoPermissionsCard
                index={1}
                learners={model.learners}
                consentsByStudentId={model.consentsByStudentId}
                unsetLearners={model.unsetLearners}
                total={model.total}
                setCount={model.setCount}
                allSet={model.allSet}
                previewMode={previewMode}
                recentlyUpdatedIds={model.recentlyUpdatedIds}
                onEdit={model.openPanel}
              />
            </div>

            <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <ParentGardenGallery
                index={2}
                theme={theme}
                organizationId={organizationId}
                slug={slug}
                programId={programId}
                previewFamilyId={previewFamilyId}
                initialFeed={initialFeed}
              />
            </div>

            {model.learners.length > 0 ? (
              <div className="min-w-0 lg:col-start-2 lg:row-start-2">
                <PhotoPermissionsGuideCard index={3} />
              </div>
            ) : null}
          </div>
        </div>
      </ParentGardenFrame>

      {!previewMode && model.learners.length > 0 ? (
        <PhotoPermissionsPanel
          theme={theme}
          open={model.panelOpen}
          learners={model.learners}
          consentsByStudentId={model.consentsByStudentId}
          onClose={model.closePanel}
          onSave={model.savePermissions}
        />
      ) : null}
    </>
  );
}
