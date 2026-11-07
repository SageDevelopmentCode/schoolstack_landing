import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
    <div className="flex min-h-dvh flex-col bg-[#F8F8F3]">
      <div className="shrink-0 border-b border-[#E4E8E1] bg-white px-4 py-3">
        <Link
          href={listHref}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5F7864]"
        >
          <ArrowLeft size={16} aria-hidden />
          Back to newsletter
        </Link>
      </div>
      <iframe
        title={result.bundle.edition.title || "School newsletter"}
        src={documentSrc}
        sandbox="allow-popups allow-popups-to-escape-sandbox"
        className="min-h-0 w-full flex-1 border-0"
      />
    </div>
  );
}
