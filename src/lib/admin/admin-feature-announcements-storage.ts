import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminFeatures } from "@/lib/organization-settings/types";

export type AdminFeatureAnnouncementCtaLabel = "Try it now" | "View" | "Open";

export const ADMIN_FEATURE_ANNOUNCEMENT_CTA_LABELS: AdminFeatureAnnouncementCtaLabel[] =
  ["Try it now", "View", "Open"];

export const ADMIN_FEATURE_ANNOUNCEMENT_FEATURE_KEYS = [
  "admissions",
  "my_school",
  "committees",
  "schedule",
  "messages",
  "bulletin",
  "finances",
  "marketing",
  "notifications",
] as const satisfies ReadonlyArray<keyof AdminFeatures>;

export type AdminFeatureAnnouncementRecord = {
  id: string;
  organizationId: string | null;
  announcementId: string;
  title: string;
  description: string;
  ctaLabel: AdminFeatureAnnouncementCtaLabel;
  featureKey: keyof AdminFeatures;
  hrefPath: string;
  publishedAt: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type AdminFeatureAnnouncementRow = {
  id: string;
  organization_id: string | null;
  announcement_id: string;
  title: string;
  description: string;
  cta_label: AdminFeatureAnnouncementCtaLabel;
  feature_key: keyof AdminFeatures;
  href_path: string;
  published_at: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AdminFeatureAnnouncementInput = {
  organizationId?: string | null;
  announcementId: string;
  title: string;
  description: string;
  ctaLabel: AdminFeatureAnnouncementCtaLabel;
  featureKey: keyof AdminFeatures;
  hrefPath: string;
  publishedAt: string;
  published?: boolean;
  sortOrder?: number;
};

export type AdminFeatureAnnouncementUpdateInput = Partial<
  Omit<AdminFeatureAnnouncementInput, "organizationId" | "announcementId">
> & {
  announcementId?: string;
};

const ANNOUNCEMENT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function mapRow(row: AdminFeatureAnnouncementRow): AdminFeatureAnnouncementRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    announcementId: row.announcement_id,
    title: row.title,
    description: row.description,
    ctaLabel: row.cta_label,
    featureKey: row.feature_key,
    hrefPath: row.href_path,
    publishedAt: row.published_at,
    published: row.published,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function validateAnnouncementId(announcementId: string): string {
  const normalized = announcementId.trim().toLowerCase();
  if (!ANNOUNCEMENT_ID_PATTERN.test(normalized)) {
    throw new Error(
      "Announcement ID must use lowercase letters, numbers, and hyphens.",
    );
  }
  return normalized;
}

export function validateFeatureKey(
  featureKey: string,
): keyof AdminFeatures {
  if (
    !ADMIN_FEATURE_ANNOUNCEMENT_FEATURE_KEYS.includes(
      featureKey as (typeof ADMIN_FEATURE_ANNOUNCEMENT_FEATURE_KEYS)[number],
    )
  ) {
    throw new Error("Invalid admin feature key.");
  }
  return featureKey as keyof AdminFeatures;
}

export function validateCtaLabel(
  ctaLabel: string,
): AdminFeatureAnnouncementCtaLabel {
  if (
    !ADMIN_FEATURE_ANNOUNCEMENT_CTA_LABELS.includes(
      ctaLabel as AdminFeatureAnnouncementCtaLabel,
    )
  ) {
    throw new Error("Invalid CTA label.");
  }
  return ctaLabel as AdminFeatureAnnouncementCtaLabel;
}

export function validateHrefPath(hrefPath: string): string {
  const normalized = hrefPath.trim().replace(/^\/+/, "").replace(/\/+$/, "");
  if (!normalized) {
    throw new Error("Admin path is required.");
  }
  return normalized;
}

function validateAnnouncementInput(
  input: AdminFeatureAnnouncementInput,
): AdminFeatureAnnouncementInput {
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title) throw new Error("Title is required.");
  if (!description) throw new Error("Description is required.");
  if (!input.publishedAt.trim()) throw new Error("Published date is required.");

  return {
    ...input,
    announcementId: validateAnnouncementId(input.announcementId),
    title,
    description,
    ctaLabel: validateCtaLabel(input.ctaLabel),
    featureKey: validateFeatureKey(input.featureKey),
    hrefPath: validateHrefPath(input.hrefPath),
    publishedAt: input.publishedAt.trim(),
    published: input.published ?? true,
    sortOrder: input.sortOrder ?? 0,
  };
}

export async function listGlobalAdminFeatureAnnouncements(
  supabase: SupabaseClient,
): Promise<AdminFeatureAnnouncementRecord[]> {
  const { data, error } = await supabase
    .from("admin_feature_announcements")
    .select(
      "id, organization_id, announcement_id, title, description, cta_label, feature_key, href_path, published_at, published, sort_order, created_at, updated_at",
    )
    .is("organization_id", null)
    .order("published_at", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as AdminFeatureAnnouncementRow));
}

export async function listOrgAdminFeatureAnnouncements(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<AdminFeatureAnnouncementRecord[]> {
  const { data, error } = await supabase
    .from("admin_feature_announcements")
    .select(
      "id, organization_id, announcement_id, title, description, cta_label, feature_key, href_path, published_at, published, sort_order, created_at, updated_at",
    )
    .eq("organization_id", organizationId)
    .order("published_at", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as AdminFeatureAnnouncementRow));
}

export async function createAdminFeatureAnnouncement(
  supabase: SupabaseClient,
  input: AdminFeatureAnnouncementInput,
): Promise<AdminFeatureAnnouncementRecord> {
  const validated = validateAnnouncementInput(input);

  const { data, error } = await supabase
    .from("admin_feature_announcements")
    .insert({
      organization_id: validated.organizationId ?? null,
      announcement_id: validated.announcementId,
      title: validated.title,
      description: validated.description,
      cta_label: validated.ctaLabel,
      feature_key: validated.featureKey,
      href_path: validated.hrefPath,
      published_at: validated.publishedAt,
      published: validated.published ?? true,
      sort_order: validated.sortOrder ?? 0,
    })
    .select(
      "id, organization_id, announcement_id, title, description, cta_label, feature_key, href_path, published_at, published, sort_order, created_at, updated_at",
    )
    .single();

  if (error) throw error;
  return mapRow(data as AdminFeatureAnnouncementRow);
}

export async function updateAdminFeatureAnnouncement(
  supabase: SupabaseClient,
  id: string,
  input: AdminFeatureAnnouncementUpdateInput,
): Promise<AdminFeatureAnnouncementRecord> {
  const patch: Record<string, unknown> = {};

  if (input.announcementId != null) {
    patch.announcement_id = validateAnnouncementId(input.announcementId);
  }
  if (input.title != null) {
    const title = input.title.trim();
    if (!title) throw new Error("Title is required.");
    patch.title = title;
  }
  if (input.description != null) {
    const description = input.description.trim();
    if (!description) throw new Error("Description is required.");
    patch.description = description;
  }
  if (input.ctaLabel != null) {
    patch.cta_label = validateCtaLabel(input.ctaLabel);
  }
  if (input.featureKey != null) {
    patch.feature_key = validateFeatureKey(input.featureKey);
  }
  if (input.hrefPath != null) {
    patch.href_path = validateHrefPath(input.hrefPath);
  }
  if (input.publishedAt != null) {
    const publishedAt = input.publishedAt.trim();
    if (!publishedAt) throw new Error("Published date is required.");
    patch.published_at = publishedAt;
  }
  if (input.published != null) {
    patch.published = input.published;
  }
  if (input.sortOrder != null) {
    patch.sort_order = input.sortOrder;
  }

  if (Object.keys(patch).length === 0) {
    throw new Error("No changes provided.");
  }

  const { data, error } = await supabase
    .from("admin_feature_announcements")
    .update(patch)
    .eq("id", id)
    .select(
      "id, organization_id, announcement_id, title, description, cta_label, feature_key, href_path, published_at, published, sort_order, created_at, updated_at",
    )
    .single();

  if (error) throw error;
  return mapRow(data as AdminFeatureAnnouncementRow);
}

export async function deleteAdminFeatureAnnouncement(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("admin_feature_announcements")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
