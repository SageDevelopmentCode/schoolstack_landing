import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeBranding, mergeFeatures } from "@/lib/organization-settings/merge";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import {
  listPublishedNewsletterEditions,
  loadNewsletterTemplateForOrganization,
  loadPublishedNewsletterEdition,
  type PublishedNewsletterSummary,
} from "@/lib/school-admin/newsletter/newsletter-db";
import { newsletterVisualBrandingForExport } from "@/lib/school-admin/newsletter/newsletter-branding";
import { buildExportHtmlDocument } from "@/lib/school-admin/newsletter/newsletter-export";
import type {
  NewsletterEdition,
  NewsletterSchoolMeta,
  NewsletterSchoolTemplate,
} from "@/lib/school-admin/newsletter/newsletter-types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { mapGalleryPhotoRow } from "@/lib/school-gallery/mappers";
import { attachSignedUrlsToGalleryPhotos } from "@/lib/school-gallery/storage";
import type { GalleryPhotoRow } from "@/lib/school-gallery/types";
import { listStaffMembers } from "@/lib/staff/staff-members";
import {
  sanitizeNewsletterEditionForParent,
  staffMembersForPublishedUpdates,
  type ParentNewsletterStaffMember,
} from "@/lib/parent-portal/newsletters/parent-newsletter-staff";

const GALLERY_PHOTO_SELECT = `
  id,
  organization_id,
  photo_date,
  storage_path,
  file_name,
  mime_type,
  size_bytes,
  upload_batch_id,
  uploaded_by,
  created_at,
  updated_at
`;

export function isParentNewslettersFeatureEnabled(
  features: OrganizationFeatures | null | undefined,
): boolean {
  const merged = mergeFeatures(features as Record<string, unknown> | null | undefined);
  return merged.parent.newsletters === true;
}

export async function hydrateNewsletterEditionGalleryMedia(
  admin: SupabaseClient,
  organizationId: string,
  edition: NewsletterEdition,
): Promise<NewsletterEdition> {
  const galleryIds = new Set<string>();
  if (edition.coverGalleryPhotoId) {
    galleryIds.add(edition.coverGalleryPhotoId);
  }
  for (const photo of edition.photos) {
    if (photo.galleryPhotoId) {
      galleryIds.add(photo.galleryPhotoId);
    }
  }
  if (galleryIds.size === 0) {
    return edition;
  }

  const { data, error } = await admin
    .from("school_gallery_photos")
    .select(GALLERY_PHOTO_SELECT)
    .eq("organization_id", organizationId)
    .in("id", [...galleryIds]);

  if (error) throw error;

  const signed = await attachSignedUrlsToGalleryPhotos(
    admin,
    ((data ?? []) as GalleryPhotoRow[]).map(mapGalleryPhotoRow),
  );
  const urlById = new Map<string, string>();
  for (const photo of signed) {
    if (photo.imageUrl) {
      urlById.set(photo.id, photo.imageUrl);
    }
  }

  let coverImage = edition.coverImage;
  if (edition.coverGalleryPhotoId) {
    coverImage = urlById.get(edition.coverGalleryPhotoId) ?? coverImage;
  }

  const photos = edition.photos.map((photo) => {
    if (!photo.galleryPhotoId) return photo;
    const src = urlById.get(photo.galleryPhotoId);
    return src ? { ...photo, src } : photo;
  });

  return { ...edition, coverImage, photos };
}

export async function hydratePublishedNewsletterSummaryCovers(
  admin: SupabaseClient,
  organizationId: string,
  summaries: PublishedNewsletterSummary[],
): Promise<PublishedNewsletterSummary[]> {
  const galleryIds = new Set<string>();
  for (const summary of summaries) {
    if (summary.coverGalleryPhotoId) {
      galleryIds.add(summary.coverGalleryPhotoId);
    }
  }

  if (galleryIds.size === 0) {
    return summaries;
  }

  const { data, error } = await admin
    .from("school_gallery_photos")
    .select(GALLERY_PHOTO_SELECT)
    .eq("organization_id", organizationId)
    .in("id", [...galleryIds]);

  if (error) throw error;

  const signed = await attachSignedUrlsToGalleryPhotos(
    admin,
    ((data ?? []) as GalleryPhotoRow[]).map(mapGalleryPhotoRow),
  );
  const urlById = new Map<string, string>();
  for (const photo of signed) {
    if (photo.imageUrl) {
      urlById.set(photo.id, photo.imageUrl);
    }
  }

  return summaries.map((summary) => {
    if (!summary.coverGalleryPhotoId) return summary;
    const galleryUrl = urlById.get(summary.coverGalleryPhotoId);
    if (!galleryUrl) return summary;
    return {
      ...summary,
      coverImage: galleryUrl,
    };
  });
}

export type ParentNewslettersListBundle = {
  editions: PublishedNewsletterSummary[];
};

export async function loadParentNewslettersListBundle(
  admin: SupabaseClient,
  organizationId: string,
): Promise<ParentNewslettersListBundle> {
  const editions = await listPublishedNewsletterEditions(admin, organizationId);
  const hydrated = await hydratePublishedNewsletterSummaryCovers(admin, organizationId, editions);
  return { editions: hydrated };
}

export type ParentNewsletterDetailBundle = {
  edition: NewsletterEdition;
  template: NewsletterSchoolTemplate;
  school: NewsletterSchoolMeta;
  staffMembers: ParentNewsletterStaffMember[];
  htmlDocument: string;
};

export async function loadParentNewsletterDetailBundle(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
  school: { name: string; primaryColor: string; signature?: string },
  orgBranding: OrganizationBranding,
): Promise<ParentNewsletterDetailBundle | null> {
  const raw = await loadPublishedNewsletterEdition(admin, organizationId, editionId);
  if (!raw) return null;

  const [hydratedEdition, template, staffRoster] = await Promise.all([
    hydrateNewsletterEditionGalleryMedia(admin, organizationId, raw),
    loadNewsletterTemplateForOrganization(admin, organizationId),
    listStaffMembers(admin, organizationId),
  ]);

  const staffMembers = staffMembersForPublishedUpdates(hydratedEdition, staffRoster);
  const edition = sanitizeNewsletterEditionForParent(hydratedEdition);

  const schoolMeta: NewsletterSchoolMeta = {
    name: school.name,
    signature: school.signature ?? "With warmth,\nYour school team",
    primary: school.primaryColor,
  };
  const exportBranding = newsletterVisualBrandingForExport(orgBranding);
  const htmlDocument = buildExportHtmlDocument(hydratedEdition, schoolMeta, {
    staff: staffMembers,
    template,
    branding: exportBranding,
    primaryColor: schoolMeta.primary,
  });

  return {
    edition,
    template,
    staffMembers,
    school: schoolMeta,
    htmlDocument,
  };
}

export async function loadParentNewsletterDetailBundleForOrganization(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
): Promise<
  | { ok: true; bundle: ParentNewsletterDetailBundle }
  | { ok: false; reason: "not_found" | "feature_disabled" | "org_not_found" }
> {
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select(
      `
        name,
        organization_settings (
          features,
          branding
        )
      `,
    )
    .eq("id", organizationId)
    .maybeSingle();

  if (orgError) throw orgError;
  if (!org) {
    return { ok: false, reason: "org_not_found" };
  }

  const settings = org.organization_settings as
    | { features?: Record<string, unknown>; branding?: Record<string, unknown> }
    | { features?: Record<string, unknown>; branding?: Record<string, unknown> }[]
    | null;
  const settingsRow = Array.isArray(settings) ? settings[0] : settings;

  if (!isParentNewslettersFeatureEnabled(settingsRow?.features as never)) {
    return { ok: false, reason: "feature_disabled" };
  }

  const orgBranding = mergeBranding(settingsRow?.branding as Record<string, unknown> | undefined);

  const bundle = await loadParentNewsletterDetailBundle(
    admin,
    organizationId,
    editionId,
    {
      name: String(org.name ?? "Your school"),
      primaryColor: orgBranding.colors.accent,
    },
    orgBranding,
  );

  if (!bundle) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, bundle };
}
