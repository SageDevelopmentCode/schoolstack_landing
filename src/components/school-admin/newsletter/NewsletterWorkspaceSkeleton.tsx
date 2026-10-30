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
            <div className={styles.previewShell}>
              <div className={styles.newsletterWrap}>
                <div className={`${styles.newsletter} overflow-hidden rounded-xl border border-[var(--line)]`}>
                  <SkeletonBlock C={C} className="mx-6 mt-4 h-8 w-full max-w-none !rounded-md" />
                  <SkeletonBlock C={C} className="mt-4 h-[220px] w-full !rounded-none" />
                  <div className="space-y-3 px-6 py-5">
                    <SkeletonBlock C={C} className="h-4 w-2/3" />
                    <SkeletonBlock C={C} className="h-3 w-full" />
                    <SkeletonBlock C={C} className="h-3 w-5/6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
