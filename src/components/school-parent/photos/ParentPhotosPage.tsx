"use client";

import { useMemo, useState } from "react";
import SchoolGalleryPage from "@/components/school-gallery/SchoolGalleryPage";
import type { GalleryPhotosFeedInitial } from "@/components/school-gallery/useGalleryPhotosFeed";
import ParentPhotoPermissionsBanner from "@/components/school-parent/photos/ParentPhotoPermissionsBanner";
import ParentPhotoPermissionsSidebar from "@/components/school-parent/photos/ParentPhotoPermissionsSidebar";
import type { PhotoPermissionLearner } from "@/components/school-parent/photos/photo-permissions-ui";
import ParentPhotosStoryHeader from "@/components/school-parent/photos/ParentPhotosStoryHeader";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [consentsByStudentId, setConsentsByStudentId] = useState(
    initialConsentsByStudentId,
  );

  const learners = useMemo<PhotoPermissionLearner[]>(
    () =>
      eligibleChildren
        .filter((child): child is FamilyChildOverview & { studentId: string } =>
          Boolean(child.studentId),
        )
        .map((child) => ({
          studentId: child.studentId,
          studentName: child.studentName,
        })),
    [eligibleChildren],
  );

  const handleSaved = (updates: Record<string, PhotoMediaConsentState>) => {
    setConsentsByStudentId((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div
      className="mx-auto max-w-[1250px] px-4 py-6 sm:py-8 md:px-9"
      data-testid="parent-photos-page"
    >
      <ParentPhotosStoryHeader theme={theme} />

      {learners.length === 0 ? (
        <ParentCard theme={theme} className="mt-6">
          <p className="text-[13px]" style={{ color: theme.muted }}>
            Photo permissions are available once a learner is enrolled.
          </p>
        </ParentCard>
      ) : (
        <ParentPhotoPermissionsBanner
          theme={theme}
          learners={learners}
          consentsByStudentId={consentsByStudentId}
          previewMode={previewMode}
          onEdit={() => setSidebarOpen(true)}
        />
      )}

      {!previewMode && learners.length > 0 ? (
        <ParentPhotoPermissionsSidebar
          theme={theme}
          open={sidebarOpen}
          organizationId={organizationId}
          learners={learners}
          consentsByStudentId={consentsByStudentId}
          onClose={() => setSidebarOpen(false)}
          onSaved={handleSaved}
        />
      ) : null}

      <div className="mt-6">
        <SchoolGalleryPage
          organizationId={organizationId}
          slug={slug}
          programId={programId}
          portal="parent"
          initialFeed={initialFeed}
          readOnly={previewMode}
          previewFamilyId={previewFamilyId}
        />
      </div>

      {previewMode ? (
        <p className="mt-4 text-[11px]" style={{ color: theme.muted }}>
          Preview mode — photo permissions cannot be changed here.
        </p>
      ) : null}
    </div>
  );
}
