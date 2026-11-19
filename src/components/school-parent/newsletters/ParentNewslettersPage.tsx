"use client";

import { useSearchParams } from "next/navigation";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import NewslettersReader from "@/components/school-parent/newsletters/NewslettersReader";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type {
  ParentNewsletterDetailBundle,
  ParentNewslettersListBundle,
} from "@/lib/parent-portal/newsletters/load-parent-newsletters";
import { parentNewsletterDocumentApiPath } from "@/lib/parent-portal/newsletters/parent-newsletter-document-url";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";

type ParentNewslettersPageProps = {
  organizationId: string;
  slug: string;
  parentBasePath?: string;
  initialList: ParentNewslettersListBundle;
  detailBundle?: ParentNewsletterDetailBundle | null;
  branding: OrganizationBranding;
  previewMode?: boolean;
};

/** Parent Newsletters (Garden). Also used by the admin family preview. */
export default function ParentNewslettersPage({
  organizationId,
  slug,
  parentBasePath,
  initialList,
  detailBundle,
  branding,
  previewMode = false,
}: ParentNewslettersPageProps) {
  const { theme } = useParentTheme();
  const searchParams = useSearchParams();
  const editionId = searchParams.get("edition");
  const base = parentBasePath ?? schoolParentPath(slug, "newsletters");

  return (
    <NewslettersReader
      theme={theme}
      branding={branding}
      list={initialList}
      editionId={editionId}
      detailBundle={detailBundle}
      basePath={base}
      previewMode={previewMode}
      readHref={(id) => `/school/${slug}/parent/newsletters/${encodeURIComponent(id)}/read`}
      documentHref={(id) => parentNewsletterDocumentApiPath(organizationId, id)}
      data-testid="parent-newsletters-page"
    />
  );
}
