"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Maximize2 } from "lucide-react";
import NewsletterPreviewArticle from "@/components/school-admin/newsletter/NewsletterPreviewArticle";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentNewsletterEditionCard from "@/components/school-parent/newsletters/ParentNewsletterEditionCard";
import { newsletterVisualBrandingForPreview } from "@/lib/school-admin/newsletter/newsletter-branding";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const editionId = searchParams.get("edition");
  const base = parentBasePath ?? schoolParentPath(slug, "newsletters");

  const previewBranding = newsletterVisualBrandingForPreview(branding);

  if (editionId && !detailBundle) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-6 sm:py-8 md:px-9">
        <button
          type="button"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium"
          style={{ color: theme.primary }}
          onClick={() => router.push(base)}
        >
          <ArrowLeft size={16} aria-hidden />
          All newsletters
        </button>
        <ParentCard theme={theme}>
          <p className="text-[13px]" style={{ color: theme.muted }}>
            This newsletter could not be found or is no longer available.
          </p>
        </ParentCard>
      </div>
    );
  }

  if (editionId && detailBundle) {
    const documentHref = parentNewsletterDocumentApiPath(organizationId, editionId);
    const readHref = `/school/${slug}/parent/newsletters/${encodeURIComponent(editionId)}/read`;

    return (
      <div className="mx-auto max-w-[900px] px-4 py-6 sm:py-8 md:px-9">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium"
            style={{ color: theme.primary }}
            onClick={() => router.push(base)}
          >
            <ArrowLeft size={16} aria-hidden />
            All newsletters
          </button>
          {!previewMode ? (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={readHref}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium"
                style={{ color: theme.primary }}
              >
                <Maximize2 size={15} aria-hidden />
                Full screen
              </a>
              <a
                href={documentHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium"
                style={{ color: theme.primary }}
              >
                <ExternalLink size={15} aria-hidden />
                Open in new tab
              </a>
            </div>
          ) : null}
        </div>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: theme.line }}>
          <NewsletterPreviewArticle
            edition={detailBundle.edition}
            school={detailBundle.school}
            branding={previewBranding}
            staffMembers={detailBundle.staffMembers}
            template={detailBundle.template}
            primaryColor={detailBundle.school.primary}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:py-8 md:px-9" data-testid="parent-newsletters-page">
      <header className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: theme.muted }}>
          School updates
        </p>
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl" style={{ color: theme.ink }}>
          Newsletters
        </h1>
        <p className="mt-2 text-[13px]" style={{ color: theme.muted }}>
          Weekly stories and updates from your school.
        </p>
      </header>

      {initialList.editions.length === 0 ? (
        <ParentCard theme={theme}>
          <p className="text-[13px]" style={{ color: theme.muted }}>
            No newsletters have been published yet.
          </p>
        </ParentCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {initialList.editions.map((edition) => {
            const href = `${base}?edition=${encodeURIComponent(edition.id)}`;
            return (
              <ParentNewsletterEditionCard
                key={edition.id}
                edition={edition}
                href={href}
                theme={theme}
                previewMode={previewMode}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
