"use client";

import { useSearchParams } from "next/navigation";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import NewslettersReader from "@/components/school-parent/newsletters/NewslettersReader";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type {
  ParentNewsletterDetailBundle,
  ParentNewslettersListBundle,
} from "@/lib/parent-portal/newsletters/load-parent-newsletters";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import { teacherNewsletterDocumentApiPath } from "@/lib/school-teacher/newsletters/teacher-newsletter-document-url";

/**
 * Staff Newsletters (Garden): the same published editions families read, in
 * the same Garden newsletter. Rules: `.claude/skills/teacher-portal-garden-design/SKILL.md`.
 */
export default function TeacherNewslettersPage({
  organizationId,
  slug,
  basePath,
  initialList,
  detailBundle,
  branding,
  previewMode = false,
}: {
  organizationId: string;
  slug: string;
  basePath?: string;
  initialList: ParentNewslettersListBundle;
  detailBundle?: ParentNewsletterDetailBundle | null;
  branding: OrganizationBranding;
  previewMode?: boolean;
}) {
  const { theme } = useParentTheme();
  const searchParams = useSearchParams();
  const editionId = searchParams.get("edition");

  return (
    <NewslettersReader
      theme={theme}
      branding={branding}
      list={initialList}
      editionId={editionId}
      detailBundle={detailBundle}
      basePath={basePath ?? schoolTeacherPath(slug, "newsletters")}
      previewMode={previewMode}
      readHref={(id) => `/school/${slug}/teacher/newsletters/${encodeURIComponent(id)}/read`}
      documentHref={(id) => teacherNewsletterDocumentApiPath(organizationId, id)}
      data-testid="teacher-newsletters-page"
    />
  );
}
