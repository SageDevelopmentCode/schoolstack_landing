"use client";

import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import SkeletonBlock from "@/components/school-admin/skeletons/SkeletonBlock";
import styles from "./newsletter-workspace.module.css";

type NewsletterWorkspaceSkeletonProps = {
  previewVisible?: boolean;
};

export default function NewsletterWorkspaceSkeleton({
  previewVisible = true,
}: NewsletterWorkspaceSkeletonProps) {
  const { C } = useSchoolAdminStoryTheme();

  return (
    <div
      className={styles.builderShell}
      aria-busy="true"
      aria-label="Loading newsletter builder"
    >
      <div className={`${styles.previewToolbar} ${styles.builderToolbarRow}`}>
        <div className={styles.previewLeft}>
          <SkeletonBlock C={C} className="h-3 w-10" />
          <SkeletonBlock C={C} className="h-8 w-[140px] rounded-lg" />
        </div>
        <div className={styles.previewTools}>
          <SkeletonBlock C={C} className="h-8 w-8 rounded-[9px]" />
          <SkeletonBlock C={C} className="h-8 w-8 rounded-[9px]" />
          <SkeletonBlock C={C} className="h-8 w-16 rounded-[9px]" />
          <SkeletonBlock C={C} className="h-8 w-24 rounded-[9px]" />
        </div>
      </div>
      <div
        className={`${styles.builder} ${previewVisible ? "" : styles.builderPreviewHidden}`.trim()}
      >
        <div className={styles.editorColumn}>
          <div className={styles.editor}>
            <div className={styles.editorHeadingRow}>
              <SkeletonBlock C={C} className="h-6 w-36" />
              <SkeletonBlock C={C} className="h-3 w-20" />
            </div>
            <div className="flex gap-5 px-[22px] pb-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock key={index} C={C} className="h-3 w-16" />
              ))}
            </div>
            <div className={`${styles.editorContent} space-y-4`}>
              <SkeletonBlock C={C} className="h-28 w-full rounded-2xl" />
              <SkeletonBlock C={C} className="h-36 w-full rounded-2xl" />
              <SkeletonBlock C={C} className="h-36 w-full rounded-2xl" />
            </div>
          </div>
        </div>
        {previewVisible ? (
          <div className={styles.previewColumnWrap}>
            <SkeletonBlock C={C} className="h-[min(560px,70vh)] w-full rounded-2xl" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
