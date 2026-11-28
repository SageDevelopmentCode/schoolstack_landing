import "server-only";
import type { Metadata } from "next";
import {
  schoolPreviewImagePath,
  schoolPreviewVersion,
  type SchoolPreviewPage,
} from "@/lib/og/school-link-preview-core";
import { resolveSchoolPreviewCopy, type SchoolPreviewCopy } from "@/lib/og/school-link-preview-copy";
import type { OrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { SITE_URL } from "@/lib/site";

type SchoolOrg = Pick<OrganizationWithSettings, "id" | "slug" | "name" | "branding">;

type SchoolPageMetadataOptions = {
  title: string;
  description?: string;
  /** Path after `/school/<slug>`, e.g. "/tour". */
  path?: string;
  page: SchoolPreviewPage;
  form?: string | null;
};

/** Version for the image URL: changes whenever anything drawn on the card changes. */
export function schoolPreviewVersionFor(org: SchoolOrg, copy: SchoolPreviewCopy): string {
  return schoolPreviewVersion([
    org.name,
    org.branding.logo.src,
    org.branding.colors.accent,
    org.branding.colors.accentDark,
    copy.eyebrow,
    copy.headline,
    copy.sub,
  ]);
}

/**
 * Metadata for a school-branded page, so a shared link previews as the school (its name as the
 * site, its own card) instead of inheriting MudKitchen's root Open Graph tags.
 */
export async function schoolPageMetadata(org: SchoolOrg, options: SchoolPageMetadataOptions): Promise<Metadata> {
  const copy = await resolveSchoolPreviewCopy(org, options.page, options.form);
  const image = schoolPreviewImagePath(org.slug, {
    page: options.page,
    form: options.form,
    version: schoolPreviewVersionFor(org, copy),
  });
  const alt = copy.headline.toLowerCase().includes(org.name.toLowerCase()) ? copy.headline : `${copy.headline} — ${org.name}`;
  const url = `${SITE_URL}/school/${org.slug}${options.path ?? ""}`;
  const description = options.description;

  return {
    title: options.title,
    ...(description ? { description } : {}),
    ...(options.path !== undefined ? { alternates: { canonical: url } } : {}),
    openGraph: {
      title: options.title,
      ...(description ? { description } : {}),
      siteName: org.name,
      type: "website",
      locale: "en_US",
      url,
      images: [{ url: image, width: 1200, height: 630, alt, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      ...(description ? { description } : {}),
      images: [{ url: image, alt }],
    },
  };
}
