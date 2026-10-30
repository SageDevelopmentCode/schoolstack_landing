import { DEFAULT_NEWSLETTER_SECTIONS } from "./newsletter-types";
import type {
  NewsletterEdition,
  NewsletterEditionStatus,
  NewsletterPhoto,
} from "./newsletter-types";

export type NewsletterEditionSnapshotContent = {
  layout?: NewsletterEdition["layout"];
  sections?: NewsletterEdition["sections"];
  storyBlocks?: NewsletterEdition["storyBlocks"];
  teacherUpdates?: NewsletterEdition["teacherUpdates"];
  events?: NewsletterEdition["events"];
  reminders?: NewsletterEdition["reminders"];
  photos?: NewsletterPhoto[];
  coverGalleryPhotoId?: string;
};

export type NewsletterEditionSnapshot = {
  title: string;
  week: string;
  week_end: string | null;
  cover_storage_path: string | null;
  content: NewsletterEditionSnapshotContent;
};

export type NewsletterEditionVersionKind = "manual_save" | "before_restore";

export type NewsletterEditionVersion = {
  id: string;
  editionId: string;
  kind: NewsletterEditionVersionKind;
  label: string | null;
  createdAt: string;
  snapshot: NewsletterEditionSnapshot;
};

/** Storage paths referenced by an edition version snapshot (cover + uploaded photos). */
export function collectAssetStoragePathsFromSnapshot(snapshot: NewsletterEditionSnapshot): string[] {
  const paths: string[] = [];
  if (snapshot.cover_storage_path) {
    paths.push(snapshot.cover_storage_path);
  }
  for (const photo of snapshot.content?.photos ?? []) {
    if (photo.storagePath) {
      paths.push(photo.storagePath);
    }
  }
  return paths;
}

export function editionFromVersionSnapshot(
  editionId: string,
  snapshot: NewsletterEditionSnapshot,
  status: NewsletterEditionStatus,
  publishedAt?: string,
): NewsletterEdition {
  const content = snapshot.content ?? {};
  return {
    id: editionId,
    title: snapshot.title,
    week: snapshot.week,
    weekEnd: snapshot.week_end ?? undefined,
    layout: "storybook",
    status,
    publishedAt,
    sections: { ...DEFAULT_NEWSLETTER_SECTIONS, ...content.sections },
    storyBlocks: content.storyBlocks ?? [],
    teacherUpdates: content.teacherUpdates ?? {},
    events: content.events ?? [],
    reminders: content.reminders ?? [],
    photos: (content.photos ?? []).map((photo) => ({ ...photo, src: photo.src ?? "" })),
    coverGalleryPhotoId: content.coverGalleryPhotoId,
    coverImage: undefined,
  };
}
