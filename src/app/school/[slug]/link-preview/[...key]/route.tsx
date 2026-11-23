import { NextResponse, type NextRequest } from "next/server";
import { parseSchoolPreviewPage } from "@/lib/og/school-link-preview-core";
import { loadSchoolLogo, renderSchoolLinkPreview } from "@/lib/og/school-link-preview";
import { resolveSchoolPreviewCopy } from "@/lib/og/school-link-preview-copy";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";

/**
 * The link-preview image for a school's shared links (`og:image` from `schoolPageMetadata`).
 * Path: `/school/<slug>/link-preview/<page>/<version>[/<formSlug>]` (`schoolPreviewImagePath`).
 * The version only busts crawler caches; the words always come from the school's own settings,
 * never from the URL.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string; key: string[] }> }) {
  const { slug, key } = await params;
  const org = await fetchOrganizationWithSettings(slug);
  if (!org) {
    return NextResponse.redirect(new URL("/og/home.png", request.url), 302);
  }

  const page = parseSchoolPreviewPage(key[0]);
  const form = page === "form" ? key[2]?.slice(0, 120) || null : null;

  const [copy, logo] = await Promise.all([
    resolveSchoolPreviewCopy(org, page, form),
    loadSchoolLogo(org.branding.logo.src, org.slug),
  ]);

  const image = await renderSchoolLinkPreview({
    schoolName: org.name,
    colors: org.branding.colors,
    logo,
    copy,
  });
  image.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
  return image;
}
