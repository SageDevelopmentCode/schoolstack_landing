import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applyTemplateToEdition,
  createEditionFromTemplate,
  defaultSchoolTemplate,
} from "./newsletter-template";
import { editionHasContent } from "./newsletter-render";
import { NewsletterError } from "./newsletter-errors";

export { NewsletterError } from "./newsletter-errors";
import {
  MAX_NEWSLETTER_EVENTS,
  MAX_NEWSLETTER_PHOTOS,
  MAX_NEWSLETTER_REMINDERS,
} from "./newsletter-limits";
import {
  compressNewsletterImageBytes,
  deleteNewsletterAssetFiles,
  getNewsletterAssetSignedUrlWithReport,
  isNewsletterEditionAssetStoragePath,
  parseNewsletterDataUrl,
  reportNewsletterAssetDeleteFailure,
  uploadNewsletterAsset,
} from "./newsletter-storage";
import type {
  NewsletterEdition,
  NewsletterEditionStatus,
  NewsletterPhoto,
  NewsletterSchoolTemplate,
  NewsletterWorkspaceState,
} from "./newsletter-types";
import {
  collectAssetStoragePathsFromSnapshot,
  type NewsletterEditionSnapshot,
  type NewsletterEditionVersion,
  type NewsletterEditionVersionKind,
} from "./newsletter-version-snapshot";
import { DEFAULT_NEWSLETTER_SECTIONS } from "./newsletter-types";

type EditionRow = {
  id: string;
  organization_id: string;
  title: string;
  week: string;
  week_end: string | null;
  status: NewsletterEditionStatus;
  published_at: string | null;
  cover_storage_path: string | null;
  content: EditionContentJson | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type EditionContentJson = {
  layout?: NewsletterEdition["layout"];
  sections?: NewsletterEdition["sections"];
  storyBlocks?: NewsletterEdition["storyBlocks"];
  teacherUpdates?: NewsletterEdition["teacherUpdates"];
  events?: NewsletterEdition["events"];
  reminders?: NewsletterEdition["reminders"];
  photos?: NewsletterPhoto[];
  coverGalleryPhotoId?: string;
};

const EDITION_SELECT = `
  id,
  organization_id,
  title,
  week,
  week_end,
  status,
  published_at,
  cover_storage_path,
  content,
  created_by,
  created_at,
  updated_at
`;

function normalizeTemplate(raw: unknown): NewsletterSchoolTemplate {
  const base = defaultSchoolTemplate();
  if (!raw || typeof raw !== "object") return base;
  const parsed = raw as Partial<NewsletterSchoolTemplate>;
  if (!Array.isArray(parsed.storyBlocks) || parsed.storyBlocks.length === 0) {
    return base;
  }
  return {
    ...base,
    ...parsed,
    sections: { ...DEFAULT_NEWSLETTER_SECTIONS, ...parsed.sections },
    storyBlocks: parsed.storyBlocks,
    teacherUpdatesHeading:
      typeof parsed.teacherUpdatesHeading === "string"
        ? parsed.teacherUpdatesHeading
        : base.teacherUpdatesHeading,
  };
}

function contentFromEdition(edition: NewsletterEdition): EditionContentJson {
  return {
    layout: edition.layout === "storybook" ? edition.layout : "storybook",
    sections: edition.sections,
    storyBlocks: edition.storyBlocks,
    teacherUpdates: edition.teacherUpdates,
    events: edition.events,
    reminders: edition.reminders,
    photos: edition.photos.map(({ src: _src, ...rest }) => ({ ...rest, src: "" })),
    coverGalleryPhotoId: edition.coverGalleryPhotoId,
  };
}

function validateEditionPayload(edition: NewsletterEdition): void {
  if (edition.events.length > MAX_NEWSLETTER_EVENTS) {
    throw new NewsletterError("Too many dates for this newsletter.", "limit_events", 400);
  }
  if (edition.reminders.length > MAX_NEWSLETTER_REMINDERS) {
    throw new NewsletterError("Too many reminders for this newsletter.", "limit_reminders", 400);
  }
  if (edition.photos.length > MAX_NEWSLETTER_PHOTOS) {
    throw new NewsletterError("Too many photos for this newsletter.", "limit_photos", 400);
  }
}

async function uploadCoverFromDataUrl(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
  dataUrl: string,
): Promise<string> {
  const parsed = parseNewsletterDataUrl(dataUrl);
  if (!parsed) {
    throw new NewsletterError("Cover image format is not supported.", "invalid_cover", 400);
  }
  const compressed = await compressNewsletterImageBytes(
    parsed.bytes,
    parsed.mimeType,
    parsed.fileName,
  );
  return uploadNewsletterAsset(
    admin,
    organizationId,
    editionId,
    compressed.body,
    compressed.mimeType,
    compressed.fileName,
  );
}

async function uploadPhotoFromDataUrl(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
  photoId: string,
  dataUrl: string,
): Promise<string> {
  const parsed = parseNewsletterDataUrl(dataUrl);
  if (!parsed) {
    throw new NewsletterError("Photo format is not supported.", "invalid_photo", 400);
  }
  const fileName = `photo-${photoId}.${parsed.fileName.split(".").pop() ?? "jpg"}`;
  const compressed = await compressNewsletterImageBytes(
    parsed.bytes,
    parsed.mimeType,
    fileName,
  );
  return uploadNewsletterAsset(
    admin,
    organizationId,
    editionId,
    compressed.body,
    compressed.mimeType,
    compressed.fileName,
  );
}

async function deleteOwnedEditionAssetFile(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
  storagePath: string | null,
): Promise<void> {
  if (!storagePath) return;
  if (!isNewsletterEditionAssetStoragePath(organizationId, editionId, storagePath)) return;
  await deleteNewsletterAssetsIfUnreferenced(admin, organizationId, editionId, [storagePath]);
}

async function resolveCoverStoragePath(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
  existingPath: string | null,
  coverImage: string | undefined,
  coverGalleryPhotoId: string | undefined,
): Promise<string | null> {
  if (coverGalleryPhotoId) {
    await deleteOwnedEditionAssetFile(admin, organizationId, editionId, existingPath);
    return null;
  }
  if (!coverImage?.trim()) {
    await deleteOwnedEditionAssetFile(admin, organizationId, editionId, existingPath);
    return null;
  }
  if (coverImage.startsWith("data:")) {
    const nextPath = await uploadCoverFromDataUrl(admin, organizationId, editionId, coverImage);
    if (existingPath && existingPath !== nextPath) {
      await deleteOwnedEditionAssetFile(admin, organizationId, editionId, existingPath);
    }
    return nextPath;
  }
  if (
    existingPath &&
    isNewsletterEditionAssetStoragePath(organizationId, editionId, existingPath)
  ) {
    return existingPath;
  }
  return null;
}

async function processPhotosForSave(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
  existingPhotos: NewsletterPhoto[],
  incomingPhotos: NewsletterPhoto[],
): Promise<NewsletterPhoto[]> {
  const oldPaths = existingPhotos
    .map((photo) => photo.storagePath)
    .filter((path): path is string => Boolean(path));
  const keptPaths = new Set<string>();
  const nextPhotos: NewsletterPhoto[] = [];

  for (const photo of incomingPhotos) {
    if (photo.galleryPhotoId) {
      nextPhotos.push({
        id: photo.id,
        caption: photo.caption,
        galleryPhotoId: photo.galleryPhotoId,
        src: "",
      });
      continue;
    }

    if (photo.src?.startsWith("data:")) {
      const storagePath = await uploadPhotoFromDataUrl(
        admin,
        organizationId,
        editionId,
        photo.id,
        photo.src,
      );
      keptPaths.add(storagePath);
      nextPhotos.push({
        id: photo.id,
        caption: photo.caption,
        storagePath,
        src: "",
      });
      continue;
    }

    if (photo.storagePath) {
      if (!isNewsletterEditionAssetStoragePath(organizationId, editionId, photo.storagePath)) {
        throw new NewsletterError(
          "Photo storage path is not valid for this newsletter.",
          "invalid_photo",
          400,
        );
      }
      keptPaths.add(photo.storagePath);
      nextPhotos.push({
        id: photo.id,
        caption: photo.caption,
        storagePath: photo.storagePath,
        src: "",
      });
      continue;
    }

    nextPhotos.push({
      id: photo.id,
      caption: photo.caption,
      src: photo.src ?? "",
    });
  }

  const removedPaths = oldPaths
    .filter((path) => !keptPaths.has(path))
    .filter((path) => isNewsletterEditionAssetStoragePath(organizationId, editionId, path));
  if (removedPaths.length > 0) {
    await deleteNewsletterAssetsIfUnreferenced(admin, organizationId, editionId, removedPaths);
  }

  return nextPhotos;
}

async function rowToEdition(admin: SupabaseClient, row: EditionRow): Promise<NewsletterEdition> {
  const content = row.content ?? {};
  let coverImage: string | undefined;
  if (
    row.cover_storage_path &&
    isNewsletterEditionAssetStoragePath(row.organization_id, row.id, row.cover_storage_path)
  ) {
    coverImage = await getNewsletterAssetSignedUrlWithReport(admin, {
      organizationId: row.organization_id,
      editionId: row.id,
      storagePath: row.cover_storage_path,
      assetKind: "cover",
    });
  }

  const photos: NewsletterPhoto[] = await Promise.all(
    (content.photos ?? []).map(async (photo) => {
      if (photo.galleryPhotoId) {
        return { ...photo, src: photo.src ?? "" };
      }
      if (
        photo.storagePath &&
        isNewsletterEditionAssetStoragePath(row.organization_id, row.id, photo.storagePath)
      ) {
        const signed =
          (await getNewsletterAssetSignedUrlWithReport(admin, {
            organizationId: row.organization_id,
            editionId: row.id,
            storagePath: photo.storagePath,
            photoId: photo.id,
            assetKind: "photo",
          })) ?? photo.src ?? "";
        return { ...photo, src: signed };
      }
      return photo;
    }),
  );

  return {
    id: row.id,
    title: row.title,
    week: row.week,
    weekEnd: row.week_end ?? undefined,
    layout: content.layout === "storybook" ? "storybook" : "storybook",
    status: row.status,
    publishedAt: row.published_at ?? undefined,
    sections: { ...DEFAULT_NEWSLETTER_SECTIONS, ...content.sections },
    storyBlocks: content.storyBlocks ?? [],
    teacherUpdates: content.teacherUpdates ?? {},
    events: content.events ?? [],
    reminders: content.reminders ?? [],
    photos,
    coverImage,
    coverGalleryPhotoId: content.coverGalleryPhotoId,
  };
}

export type LoadNewsletterWorkspaceOptions = {
  schoolName: string;
  primaryColor: string;
  signature?: string;
};

export async function loadNewsletterWorkspaceForAdmin(
  admin: SupabaseClient,
  organizationId: string,
  options: LoadNewsletterWorkspaceOptions,
): Promise<NewsletterWorkspaceState> {
  const [{ data: templateRow }, { data: editionRows, error: editionsError }] = await Promise.all([
    admin
      .from("school_newsletter_templates")
      .select("template")
      .eq("organization_id", organizationId)
      .maybeSingle(),
    admin
      .from("school_newsletter_editions")
      .select(EDITION_SELECT)
      .eq("organization_id", organizationId)
      .order("week", { ascending: false }),
  ]);

  if (editionsError) throw editionsError;

  const template = normalizeTemplate(templateRow?.template);
  const editions = await Promise.all(
    ((editionRows ?? []) as EditionRow[]).map((row) => rowToEdition(admin, row)),
  );

  return {
    school: {
      name: options.schoolName,
      signature: options.signature ?? "With warmth,\nYour school team",
      primary: options.primaryColor,
    },
    template,
    editions,
    activeEditionId: editions[0]?.id ?? "",
  };
}

export type CreateNewsletterEditionInput = {
  week: string;
  weekEnd?: string;
  title?: string;
  cloneFromEditionId?: string;
  createdByStaffMemberId?: string | null;
};

export async function createNewsletterEdition(
  admin: SupabaseClient,
  organizationId: string,
  template: NewsletterSchoolTemplate,
  input: CreateNewsletterEditionInput,
): Promise<NewsletterEdition> {
  let draft = createEditionFromTemplate(template, {
    week: input.week,
    weekEnd: input.weekEnd,
    title: input.title,
  });

  if (input.cloneFromEditionId) {
    const { data: sourceRow, error } = await admin
      .from("school_newsletter_editions")
      .select(EDITION_SELECT)
      .eq("organization_id", organizationId)
      .eq("id", input.cloneFromEditionId)
      .maybeSingle();

    if (error) throw error;
    if (sourceRow) {
      const sourceContent = (sourceRow as EditionRow).content ?? {};
      draft = {
        ...draft,
        title: input.title ?? (sourceRow as EditionRow).title,
        sections: { ...DEFAULT_NEWSLETTER_SECTIONS, ...sourceContent.sections },
        storyBlocks: sourceContent.storyBlocks ?? draft.storyBlocks,
        teacherUpdates: sourceContent.teacherUpdates ?? {},
        events: sourceContent.events ?? [],
        reminders: sourceContent.reminders ?? [],
        photos: [],
      };
      draft = applyTemplateToEdition(template, draft);
    }
  }

  validateEditionPayload(draft);

  const { data, error } = await admin
    .from("school_newsletter_editions")
    .insert({
      organization_id: organizationId,
      title: draft.title,
      week: draft.week,
      week_end: draft.weekEnd ?? null,
      status: "draft",
      content: contentFromEdition(draft),
      created_by: input.createdByStaffMemberId ?? null,
    })
    .select(EDITION_SELECT)
    .single();

  if (error) throw error;
  return rowToEdition(admin, data as EditionRow);
}

export async function updateNewsletterEdition(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
  edition: NewsletterEdition,
): Promise<NewsletterEdition> {
  if (edition.id !== editionId) {
    throw new NewsletterError("Edition id mismatch.", "invalid_edition", 400);
  }

  validateEditionPayload(edition);

  const { data: existingRow, error: loadError } = await admin
    .from("school_newsletter_editions")
    .select(EDITION_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", editionId)
    .maybeSingle();

  if (loadError) throw loadError;
  if (!existingRow) {
    throw new NewsletterError("Newsletter not found.", "not_found", 404);
  }

  const existing = existingRow as EditionRow;
  const existingContent = existing.content ?? {};
  const existingPhotos = existingContent.photos ?? [];

  const coverStoragePath = await resolveCoverStoragePath(
    admin,
    organizationId,
    editionId,
    existing.cover_storage_path,
    edition.coverImage,
    edition.coverGalleryPhotoId,
  );

  const photos = await processPhotosForSave(
    admin,
    organizationId,
    editionId,
    existingPhotos,
    edition.photos,
  );

  const content: EditionContentJson = {
    ...contentFromEdition(edition),
    photos,
  };

  const { data, error } = await admin
    .from("school_newsletter_editions")
    .update({
      title: edition.title,
      week: edition.week,
      week_end: edition.weekEnd ?? null,
      status: edition.status,
      published_at: edition.publishedAt ?? null,
      cover_storage_path: coverStoragePath,
      content,
    })
    .eq("organization_id", organizationId)
    .eq("id", editionId)
    .select(EDITION_SELECT)
    .single();

  if (error) throw error;
  return rowToEdition(admin, data as EditionRow);
}

export async function upsertNewsletterTemplate(
  admin: SupabaseClient,
  organizationId: string,
  template: NewsletterSchoolTemplate,
): Promise<NewsletterSchoolTemplate> {
  const normalized = normalizeTemplate(template);
  const { error } = await admin.from("school_newsletter_templates").upsert(
    {
      organization_id: organizationId,
      template: normalized,
    },
    { onConflict: "organization_id" },
  );
  if (error) throw error;
  return normalized;
}

export async function publishNewsletterEdition(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
): Promise<NewsletterEdition> {
  const { data: existingRow, error: loadError } = await admin
    .from("school_newsletter_editions")
    .select(EDITION_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", editionId)
    .maybeSingle();

  if (loadError) throw loadError;
  if (!existingRow) {
    throw new NewsletterError("Newsletter not found.", "not_found", 404);
  }

  const edition = await rowToEdition(admin, existingRow as EditionRow);

  if (!edition.title.trim()) {
    throw new NewsletterError("Add a title before publishing.", "missing_title", 400);
  }
  if (!edition.week) {
    throw new NewsletterError("Choose a week before publishing.", "missing_week", 400);
  }
  if (!editionHasContent(edition)) {
    throw new NewsletterError(
      "Add a story, note, date, reminder, or photo before publishing.",
      "missing_content",
      400,
    );
  }

  const publishedAt = new Date().toISOString();
  const { data, error } = await admin
    .from("school_newsletter_editions")
    .update({
      status: "published",
      published_at: publishedAt,
    })
    .eq("organization_id", organizationId)
    .eq("id", editionId)
    .select(EDITION_SELECT)
    .single();

  if (error) throw error;
  return rowToEdition(admin, data as EditionRow);
}

export async function deleteNewsletterEdition(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
): Promise<void> {
  const { data: existingRow, error: loadError } = await admin
    .from("school_newsletter_editions")
    .select(EDITION_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", editionId)
    .maybeSingle();

  if (loadError) throw loadError;
  if (!existingRow) {
    throw new NewsletterError("Newsletter not found.", "not_found", 404);
  }

  const row = existingRow as EditionRow;
  const paths: string[] = [];
  if (row.cover_storage_path) paths.push(row.cover_storage_path);
  for (const photo of row.content?.photos ?? []) {
    if (photo.storagePath) paths.push(photo.storagePath);
  }
  const ownedPaths = paths.filter((path) =>
    isNewsletterEditionAssetStoragePath(organizationId, editionId, path),
  );

  const { error } = await admin
    .from("school_newsletter_editions")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", editionId);

  if (error) throw error;

  if (ownedPaths.length > 0) {
    await deleteNewsletterAssetFiles(admin, ownedPaths).catch((cause) => {
      reportNewsletterAssetDeleteFailure(
        admin,
        { organizationId, editionId, storagePaths: ownedPaths },
        cause,
      );
    });
  }
}

export async function importNewsletterWorkspaceFromClient(
  admin: SupabaseClient,
  organizationId: string,
  workspace: NewsletterWorkspaceState,
  createdByStaffMemberId?: string | null,
): Promise<NewsletterWorkspaceState> {
  await upsertNewsletterTemplate(admin, organizationId, workspace.template);

  for (const edition of workspace.editions) {
    const created = await createNewsletterEdition(admin, organizationId, workspace.template, {
      week: edition.week,
      weekEnd: edition.weekEnd,
      title: edition.title,
      createdByStaffMemberId,
    });
    await updateNewsletterEdition(admin, organizationId, created.id, {
      ...edition,
      id: created.id,
    });
  }

  return loadNewsletterWorkspaceForAdmin(admin, organizationId, {
    schoolName: workspace.school.name,
    primaryColor: workspace.school.primary,
    signature: workspace.school.signature,
  });
}

export const MAX_NEWSLETTER_EDITION_VERSIONS = 30;

export type { NewsletterEditionSnapshot, NewsletterEditionVersion } from "./newsletter-version-snapshot";

type VersionRow = {
  id: string;
  edition_id: string;
  organization_id: string;
  snapshot: NewsletterEditionSnapshot;
  kind: NewsletterEditionVersionKind;
  label: string | null;
  created_at: string;
};

function snapshotFromEditionRow(row: EditionRow): NewsletterEditionSnapshot {
  const content = row.content ?? {};
  return {
    title: row.title,
    week: row.week,
    week_end: row.week_end,
    cover_storage_path: row.cover_storage_path,
    content: {
      layout: content.layout,
      sections: content.sections,
      storyBlocks: content.storyBlocks,
      teacherUpdates: content.teacherUpdates,
      events: content.events,
      reminders: content.reminders,
      photos: content.photos,
      coverGalleryPhotoId: content.coverGalleryPhotoId,
    },
  };
}

function mapVersionRow(row: VersionRow): NewsletterEditionVersion {
  return {
    id: row.id,
    editionId: row.edition_id,
    kind: row.kind,
    label: row.label,
    createdAt: row.created_at,
    snapshot: row.snapshot,
  };
}

type LoadRetainedNewsletterAssetPathsOptions = {
  includeLiveEdition?: boolean;
};

async function loadRetainedNewsletterAssetPaths(
  admin: SupabaseClient,
  editionId: string,
  options?: LoadRetainedNewsletterAssetPathsOptions,
): Promise<Set<string>> {
  const retained = new Set<string>();

  const { data: versionRows, error: versionError } = await admin
    .from("school_newsletter_edition_versions")
    .select("snapshot")
    .eq("edition_id", editionId);

  if (versionError) throw versionError;
  for (const row of versionRows ?? []) {
    for (const path of collectAssetStoragePathsFromSnapshot(row.snapshot as NewsletterEditionSnapshot)) {
      retained.add(path);
    }
  }

  if (options?.includeLiveEdition) {
    const { data: editionRow, error: editionError } = await admin
      .from("school_newsletter_editions")
      .select(EDITION_SELECT)
      .eq("id", editionId)
      .maybeSingle();

    if (editionError) throw editionError;
    if (editionRow) {
      for (const path of collectAssetStoragePathsFromSnapshot(
        snapshotFromEditionRow(editionRow as EditionRow),
      )) {
        retained.add(path);
      }
    }
  }

  return retained;
}

async function deleteNewsletterAssetsIfUnreferenced(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
  storagePaths: string[],
): Promise<void> {
  const candidates = storagePaths.filter(Boolean);
  if (candidates.length === 0) return;

  const retained = await loadRetainedNewsletterAssetPaths(admin, editionId);
  const toDelete = candidates.filter((path) => !retained.has(path));
  if (toDelete.length > 0) {
    await deleteNewsletterAssetFiles(admin, toDelete).catch((cause) => {
      reportNewsletterAssetDeleteFailure(
        admin,
        { organizationId, editionId, storagePaths: toDelete },
        cause,
      );
    });
  }
}

async function pruneEditionVersions(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
): Promise<void> {
  const { data, error } = await admin
    .from("school_newsletter_edition_versions")
    .select("id, snapshot")
    .eq("edition_id", editionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = data ?? [];
  if (rows.length <= MAX_NEWSLETTER_EDITION_VERSIONS) return;

  const excessRows = rows.slice(MAX_NEWSLETTER_EDITION_VERSIONS);
  const prunedPaths = new Set<string>();
  for (const row of excessRows) {
    for (const path of collectAssetStoragePathsFromSnapshot(row.snapshot as NewsletterEditionSnapshot)) {
      prunedPaths.add(path);
    }
  }

  const excessIds = excessRows.map((row) => row.id);
  const { error: deleteError } = await admin
    .from("school_newsletter_edition_versions")
    .delete()
    .in("id", excessIds);
  if (deleteError) throw deleteError;

  if (prunedPaths.size === 0) return;

  const retained = await loadRetainedNewsletterAssetPaths(admin, editionId, {
    includeLiveEdition: true,
  });
  const toDelete = [...prunedPaths].filter((path) => !retained.has(path));
  if (toDelete.length > 0) {
    await deleteNewsletterAssetFiles(admin, toDelete).catch((cause) => {
      reportNewsletterAssetDeleteFailure(
        admin,
        { organizationId, editionId, storagePaths: toDelete },
        cause,
      );
    });
  }
}

async function insertEditionVersion(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
  snapshot: NewsletterEditionSnapshot,
  kind: NewsletterEditionVersionKind,
  label: string | null,
  createdByStaffMemberId?: string | null,
): Promise<NewsletterEditionVersion> {
  const { data, error } = await admin
    .from("school_newsletter_edition_versions")
    .insert({
      edition_id: editionId,
      organization_id: organizationId,
      snapshot,
      kind,
      label,
      created_by: createdByStaffMemberId ?? null,
    })
    .select("id, edition_id, snapshot, kind, label, created_at")
    .single();

  if (error) throw error;
  await pruneEditionVersions(admin, organizationId, editionId);
  return mapVersionRow(data as VersionRow);
}

export async function listNewsletterEditionVersions(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
): Promise<NewsletterEditionVersion[]> {
  const { data, error } = await admin
    .from("school_newsletter_edition_versions")
    .select("id, edition_id, snapshot, kind, label, created_at")
    .eq("organization_id", organizationId)
    .eq("edition_id", editionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as VersionRow[]).map(mapVersionRow);
}

async function applyEditionSnapshotToRow(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
  snapshot: NewsletterEditionSnapshot,
): Promise<EditionRow> {
  const { data, error } = await admin
    .from("school_newsletter_editions")
    .update({
      title: snapshot.title,
      week: snapshot.week,
      week_end: snapshot.week_end,
      cover_storage_path: snapshot.cover_storage_path,
      content: snapshot.content,
    })
    .eq("organization_id", organizationId)
    .eq("id", editionId)
    .select(EDITION_SELECT)
    .single();

  if (error) throw error;
  return data as EditionRow;
}

export async function saveNewsletterEditionWithVersion(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
  edition: NewsletterEdition,
  template: NewsletterSchoolTemplate,
  createdByStaffMemberId?: string | null,
): Promise<{
  edition: NewsletterEdition;
  template: NewsletterSchoolTemplate;
  version: NewsletterEditionVersion;
}> {
  const savedTemplate = await upsertNewsletterTemplate(admin, organizationId, template);
  const savedEdition = await updateNewsletterEdition(admin, organizationId, editionId, edition);

  const { data: row, error } = await admin
    .from("school_newsletter_editions")
    .select(EDITION_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", editionId)
    .single();

  if (error) throw error;

  const version = await insertEditionVersion(
    admin,
    organizationId,
    editionId,
    snapshotFromEditionRow(row as EditionRow),
    "manual_save",
    "Manual save",
    createdByStaffMemberId,
  );

  return { edition: savedEdition, template: savedTemplate, version };
}

export async function restoreNewsletterEditionVersion(
  admin: SupabaseClient,
  organizationId: string,
  editionId: string,
  versionId: string,
  createdByStaffMemberId?: string | null,
): Promise<NewsletterEdition> {
  const { data: versionRow, error: versionError } = await admin
    .from("school_newsletter_edition_versions")
    .select("id, edition_id, snapshot, kind, label, created_at")
    .eq("organization_id", organizationId)
    .eq("edition_id", editionId)
    .eq("id", versionId)
    .maybeSingle();

  if (versionError) throw versionError;
  if (!versionRow) {
    throw new NewsletterError("Version not found.", "not_found", 404);
  }

  const { data: currentRow, error: currentError } = await admin
    .from("school_newsletter_editions")
    .select(EDITION_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", editionId)
    .maybeSingle();

  if (currentError) throw currentError;
  if (!currentRow) {
    throw new NewsletterError("Newsletter not found.", "not_found", 404);
  }

  await insertEditionVersion(
    admin,
    organizationId,
    editionId,
    snapshotFromEditionRow(currentRow as EditionRow),
    "before_restore",
    "Before restore",
    createdByStaffMemberId,
  );

  await applyEditionSnapshotToRow(
    admin,
    organizationId,
    editionId,
    (versionRow as VersionRow).snapshot,
  );

  const { data: updatedRow, error: reloadError } = await admin
    .from("school_newsletter_editions")
    .select(EDITION_SELECT)
    .eq("organization_id", organizationId)
    .eq("id", editionId)
    .single();

  if (reloadError) throw reloadError;
  return rowToEdition(admin, updatedRow as EditionRow);
}
