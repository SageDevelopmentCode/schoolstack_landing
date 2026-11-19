import { notFound } from "next/navigation";
import NewsletterFullScreenFrame from "@/components/school-parent/newsletters/NewsletterFullScreenFrame";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import {
  isTeacherNewslettersFeatureEnabled,
  loadParentNewsletterDetailBundleForOrganization,
} from "@/lib/parent-portal/newsletters/load-parent-newsletters";
import { teacherNewsletterDocumentApiPath } from "@/lib/school-teacher/newsletters/teacher-newsletter-document-url";
import { getTeacherPortalPageUser } from "@/lib/staff/teacher-portal-access-request";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; editionId: string }>;
};

/** Staff full-screen newsletter reader (the standalone Garden document). */
export default async function TeacherNewsletterReadPage({ params }: PageProps) {
  const { slug, editionId } = await params;
  const org = await fetchOrganizationWithSettings(slug);
  if (!org || !isTeacherNewslettersFeatureEnabled(org.features)) notFound();

  await getTeacherPortalPageUser(org.id);

  const admin = createAdminClient();
  const result = await loadParentNewsletterDetailBundleForOrganization(admin, org.id, editionId, {
    isFeatureEnabled: isTeacherNewslettersFeatureEnabled,
  });
  if (!result.ok) notFound();

  return (
    <NewsletterFullScreenFrame
      backHref={`${schoolTeacherPath(slug, "newsletters")}?edition=${encodeURIComponent(editionId)}`}
      documentSrc={teacherNewsletterDocumentApiPath(org.id, editionId)}
      title={result.bundle.edition.title}
    />
  );
}
