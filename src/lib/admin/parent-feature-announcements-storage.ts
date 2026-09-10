import type { SupabaseClient } from "@supabase/supabase-js";
import type { ParentFeatures } from "@/lib/organization-settings/types";

export type ParentFeatureAnnouncementCtaLabel = "Try it now" | "View" | "Open";

export const PARENT_FEATURE_ANNOUNCEMENT_CTA_LABELS: ParentFeatureAnnouncementCtaLabel[] =
  ["Try it now", "View", "Open"];

export type ParentFeatureAnnouncementPortalScope = "any" | "main" | "coop";

export const PARENT_FEATURE_ANNOUNCEMENT_PORTAL_SCOPES: ParentFeatureAnnouncementPortalScope[] =
  ["any", "main", "coop"];

export const PARENT_FEATURE_ANNOUNCEMENT_FEATURE_KEYS = [
  "portal",
  "billing",
  "messages",
  "calendar",
  "attendance",
  "feed",
  "children",
  "committees",
  "classroom_signups",
  "curriculum",
  "supply_list",
  "teaching_schedule",
  "bulletin",
] as const;

export type ParentFeatureAnnouncementFeatureKey =
  (typeof PARENT_FEATURE_ANNOUNCEMENT_FEATURE_KEYS)[number];

export type ParentFeatureAnnouncementRecord = {
  id: string;
  organizationId: string | null;
  announcementId: string;
  title: string;
  description: string;
  ctaLabel: ParentFeatureAnnouncementCtaLabel;
  featureKey: ParentFeatureAnnouncementFeatureKey;
  hrefPath: string;
  portalScope: ParentFeatureAnnouncementPortalScope;
  publishedAt: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ParentFeatureAnnouncementRow = {
  id: string;
  organization_id: string | null;
  announcement_id: string;
  title: string;
  description: string;
  cta_label: ParentFeatureAnnouncementCtaLabel;
  feature_key: ParentFeatureAnnouncementFeatureKey;
  href_path: string;
  portal_scope: ParentFeatureAnnouncementPortalScope;
  published_at: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ParentFeatureAnnouncementInput = {
  organizationId?: string | null;
  announcementId: string;
  title: string;
  description: string;
  ctaLabel: ParentFeatureAnnouncementCtaLabel;
  featureKey: ParentFeatureAnnouncementFeatureKey;
  hrefPath: string;
  portalScope?: ParentFeatureAnnouncementPortalScope;
  publishedAt: string;
  published?: boolean;
  sortOrder?: number;
};

export type ParentFeatureAnnouncementUpdateInput = Partial<
  Omit<ParentFeatureAnnouncementInput, "organizationId" | "announcementId">
> & {
  announcementId?: string;
};

const ANNOUNCEMENT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function mapRow(
  row: ParentFeatureAnnouncementRow,
): ParentFeatureAnnouncementRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    announcementId: row.announcement_id,
    title: row.title,
    description: row.description,
    ctaLabel: row.cta_label,
    featureKey: row.feature_key,
    hrefPath: row.href_path,
    portalScope: row.portal_scope,
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
): ParentFeatureAnnouncementFeatureKey {
  if (
    !PARENT_FEATURE_ANNOUNCEMENT_FEATURE_KEYS.includes(
      featureKey as ParentFeatureAnnouncementFeatureKey,
    )
  ) {
    throw new Error("Invalid parent feature key.");
  }
  return featureKey as ParentFeatureAnnouncementFeatureKey;
}

export function validatePortalScope(
  portalScope: string,
): ParentFeatureAnnouncementPortalScope {
  if (
    !PARENT_FEATURE_ANNOUNCEMENT_PORTAL_SCOPES.includes(
      portalScope as ParentFeatureAnnouncementPortalScope,
    )
  ) {
    throw new Error("Invalid portal scope.");
  }
  return portalScope as ParentFeatureAnnouncementPortalScope;
}

export function validateCtaLabel(
  ctaLabel: string,
): ParentFeatureAnnouncementCtaLabel {
  if (
    !PARENT_FEATURE_ANNOUNCEMENT_CTA_LABELS.includes(
      ctaLabel as ParentFeatureAnnouncementCtaLabel,
    )
  ) {
    throw new Error("Invalid CTA label.");
  }
  return ctaLabel as ParentFeatureAnnouncementCtaLabel;
}

export function validateHrefPath(hrefPath: string): string {
  const normalized = hrefPath.trim().replace(/^\/+/, "").replace(/\/+$/, "");
  if (!normalized) {
    throw new Error("Parent path is required.");
  }
  return normalized;
}

function validateAnnouncementInput(
  input: ParentFeatureAnnouncementInput,
): ParentFeatureAnnouncementInput {
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
    portalScope: validatePortalScope(input.portalScope ?? "any"),
    publishedAt: input.publishedAt.trim(),
    published: input.published ?? true,
    sortOrder: input.sortOrder ?? 0,
  };
}

const SELECT_COLUMNS =
  "id, organization_id, announcement_id, title, description, cta_label, feature_key, href_path, portal_scope, published_at, published, sort_order, created_at, updated_at";

export async function listGlobalParentFeatureAnnouncements(
  supabase: SupabaseClient,
): Promise<ParentFeatureAnnouncementRecord[]> {
  const { data, error } = await supabase
    .from("parent_feature_announcements")
    .select(SELECT_COLUMNS)
    .is("organization_id", null)
    .order("published_at", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as ParentFeatureAnnouncementRow));
}

export async function listOrgParentFeatureAnnouncements(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ParentFeatureAnnouncementRecord[]> {
  const { data, error } = await supabase
    .from("parent_feature_announcements")
    .select(SELECT_COLUMNS)
    .eq("organization_id", organizationId)
    .order("published_at", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as ParentFeatureAnnouncementRow));
}

export async function createParentFeatureAnnouncement(
  supabase: SupabaseClient,
  input: ParentFeatureAnnouncementInput,
): Promise<ParentFeatureAnnouncementRecord> {
  const validated = validateAnnouncementInput(input);

  const { data, error } = await supabase
    .from("parent_feature_announcements")
    .insert({
      organization_id: validated.organizationId ?? null,
      announcement_id: validated.announcementId,
      title: validated.title,
      description: validated.description,
      cta_label: validated.ctaLabel,
      feature_key: validated.featureKey,
      href_path: validated.hrefPath,
      portal_scope: validated.portalScope ?? "any",
      published_at: validated.publishedAt,
      published: validated.published ?? true,
      sort_order: validated.sortOrder ?? 0,
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return mapRow(data as ParentFeatureAnnouncementRow);
}

export async function updateParentFeatureAnnouncement(
  supabase: SupabaseClient,
  id: string,
  input: ParentFeatureAnnouncementUpdateInput,
): Promise<ParentFeatureAnnouncementRecord> {
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
  if (input.portalScope != null) {
    patch.portal_scope = validatePortalScope(input.portalScope);
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
    .from("parent_feature_announcements")
    .update(patch)
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw error;
  return mapRow(data as ParentFeatureAnnouncementRow);
}

export async function deleteParentFeatureAnnouncement(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("parent_feature_announcements")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export type { ParentFeatures };
