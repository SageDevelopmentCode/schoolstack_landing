"use client";

import {
  DASHBOARD_SECTION_STACK_CLASS,
  DASHBOARD_TAB_ROOT_CLASS,
} from "@/components/school-admin/dashboard/dashboard-panel-layout";
import AdminDashboardHowToGuidesCard from "@/components/school-admin/ui/story/AdminDashboardHowToGuidesCard";
import AdminFeatureAnnouncementsCard from "@/components/school-admin/ui/story/AdminFeatureAnnouncementsCard";
import type { AdminDocGuide } from "@/lib/school-admin/admin-documentation";
import type { AdminDashboardGuides } from "@/lib/school-admin/dashboard-summary";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminDashboardGuidesPanelProps = {
  theme: ParentThemeTokens;
  slug: string;
  guides: AdminDashboardGuides;
  groupedHowToGuides: ReturnType<
    typeof import("@/lib/school-admin/admin-documentation").groupAdminDocumentationByCategory
  >;
  buildLogHref: string;
  onOpenGuide: (guide: AdminDocGuide) => void;
};

export default function AdminDashboardGuidesPanel({
  theme,
  slug,
  guides,
  groupedHowToGuides,
  buildLogHref,
  onOpenGuide,
}: AdminDashboardGuidesPanelProps) {
  const hasAnnouncements = guides.featureAnnouncements.length > 0;
  const hasHowTos = groupedHowToGuides.some((group) => group.guides.length > 0);

  if (!hasAnnouncements && !hasHowTos) {
    return (
      <p className={`${DASHBOARD_TAB_ROOT_CLASS} text-sm`} style={{ color: theme.muted }}>
        Guides and product updates will show up here when they are available.
      </p>
    );
  }

  return (
    <div className={DASHBOARD_TAB_ROOT_CLASS}>
      {hasAnnouncements ? (
        <div className={DASHBOARD_SECTION_STACK_CLASS}>
          <AdminFeatureAnnouncementsCard
            theme={theme}
            announcements={guides.featureAnnouncements}
            buildLogHref={buildLogHref}
          />
        </div>
      ) : null}
      {hasHowTos ? (
        <AdminDashboardHowToGuidesCard
          theme={theme}
          slug={slug}
          groupedGuides={groupedHowToGuides}
          onOpenGuide={onOpenGuide}
        />
      ) : null}
    </div>
  );
}
