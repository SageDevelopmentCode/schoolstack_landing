"use client";

import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import SkeletonBlock from "@/components/school-admin/skeletons/SkeletonBlock";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import styles from "./newsletter-workspace.module.css";

export default function NewsletterOverviewSkeleton() {
  const { theme, C } = useSchoolAdminStoryTheme();

  return (
    <main className={styles.workspace} aria-busy="true" aria-label="Loading newsletters">
      <header className={styles.pagehead}>
        <div className={styles.pageheadMain}>
          <div className={styles.pageheadTitle}>
            <SkeletonBlock C={C} className="h-9 w-48 max-w-full" />
            <SkeletonBlock C={C} className="mt-3 h-3 w-full max-w-md" />
            <SkeletonBlock C={C} className="mt-2 h-3 w-4/5 max-w-sm" />
          </div>
          <div className={styles.headingActions}>
            <SkeletonBlock C={C} className="h-9 w-36 rounded-lg" />
          </div>
        </div>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <AdminCard key={index} theme={theme} padding="none" className="h-full">
            <div className={styles.overviewCardBanner}>
              <SkeletonBlock C={C} className="absolute inset-0 h-full w-full !rounded-none" />
            </div>
            <div className={styles.overviewCardBody}>
              <div className="flex items-start justify-between gap-3">
                <SkeletonBlock C={C} className="h-5 w-4/5" />
                <SkeletonBlock C={C} className="h-5 w-16 shrink-0 rounded-full" />
              </div>
              <SkeletonBlock C={C} className="mt-3 h-3 w-28" />
            </div>
          </AdminCard>
        ))}
      </div>
    </main>
  );
}
