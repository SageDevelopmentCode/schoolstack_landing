import { notFound } from "next/navigation";
import NewsletterFullScreenFrame from "@/components/school-parent/newsletters/NewsletterFullScreenFrame";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";
import {
  isParentNewslettersFeatureEnabled,
  loadParentNewsletterDetailBundleForOrganization,
} from "@/lib/parent-portal/newsletters/load-parent-newsletters";
import { parentNewsletterDocumentApiPath } from "@/lib/parent-portal/newsletters/parent-newsletter-document-url";
import { requireParentPortalAccess } from "@/lib/parent-portal/parent-portal-server-cache";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; editionId: string }>;
};

export default async function ParentNewsletterReadPage({ params }: PageProps) {
  const { slug, editionId } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org || !isParentNewslettersFeatureEnabled(org.features)) {
    notFound();
  }

  await requireParentPortalAccess({ organizationId: org.id, schoolSlug: slug });

  const admin = createAdminClient();
  const result = await loadParentNewsletterDetailBundleForOrganization(admin, org.id, editionId);

  if (!result.ok) {
    notFound();
  }

  const listHref = `${schoolParentPath(slug, "newsletters")}?edition=${encodeURIComponent(editionId)}`;
  const documentSrc = parentNewsletterDocumentApiPath(org.id, editionId);

  return (
    <NewsletterFullScreenFrame
      backHref={listHref}
      documentSrc={documentSrc}
      title={result.bundle.edition.title}
    />
  );
}
