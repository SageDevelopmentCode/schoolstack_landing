"use client";

import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import SkeletonBlock from "@/components/school-admin/skeletons/SkeletonBlock";
import NewsletterWorkspaceSkeleton from "./NewsletterWorkspaceSkeleton";
import styles from "./newsletter-workspace.module.css";

type NewsletterEditorPageSkeletonProps = {
  previewVisible?: boolean;
};

export default function NewsletterEditorPageSkeleton({
  previewVisible = true,
}: NewsletterEditorPageSkeletonProps) {
  const { C } = useSchoolAdminStoryTheme();

  return (
    <main className={styles.workspace} aria-busy="true" aria-label="Loading newsletter editor">
      <header className={styles.pagehead}>
        <div className={styles.pageheadMain}>
          <div className={styles.pageheadTitle}>
            <SkeletonBlock C={C} className="h-7 w-28 rounded-lg" />
            <SkeletonBlock C={C} className="mt-3 h-9 w-full max-w-lg" />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <SkeletonBlock C={C} className="h-5 w-14 rounded-full" />
              <SkeletonBlock C={C} className="h-3 w-32" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} C={C} className="h-8 w-16 rounded-lg" />
            ))}
          </div>
        </div>
      </header>
      <NewsletterWorkspaceSkeleton previewVisible={previewVisible} />
    </main>
  );
}
