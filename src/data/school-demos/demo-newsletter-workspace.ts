import { DEMO_NEWSLETTER_TEACHER_UPDATES } from "@/data/school-demos/demo-newsletter-editor-fixtures";
import { DEMO_NEWSLETTER_STOCK_GALLERY_PHOTOS } from "@/data/school-demos/demo-newsletter-gallery-photos";
import { DEMO_PORTAL_ORG_ID } from "@/data/school-demos/demo-portal-shared";
import { plusDays } from "@/lib/school-admin/newsletter/newsletter-dates";
import { createSampleEdition } from "@/lib/school-admin/newsletter/newsletter-sample";
import type { NewsletterWorkspaceState } from "@/lib/school-admin/newsletter/newsletter-types";
import type { GalleryPhoto } from "@/lib/school-gallery/types";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";

/*
 * Fixtures for the marketing newsletter demo (blog embeds): the real Garden
 * builder fed with a sample edition, three teachers and a small photo library.
 */

const FIXTURE_TIMESTAMP = "2026-09-01T12:00:00.000Z";

function splitName(name: string): { firstName: string; lastName: string } {
  const [firstName, ...rest] = name.split(" ");
  return { firstName, lastName: rest.join(" ") };
}

export const DEMO_NEWSLETTER_STAFF: StaffMemberRecord[] = DEMO_NEWSLETTER_TEACHER_UPDATES.map((teacher) => ({
  id: `demo-staff-${teacher.id}`,
  organizationId: DEMO_PORTAL_ORG_ID,
  userId: null,
  ...splitName(teacher.name),
  email: null,
  roleTitle: "Lead guide",
  employmentStatus: "active",
  portalRole: "teacher",
  membershipStatus: "active",
  isLinked: true,
  profilePhotoUrl: teacher.photoUrl ?? null,
  createdAt: FIXTURE_TIMESTAMP,
  updatedAt: FIXTURE_TIMESTAMP,
}));

export const DEMO_NEWSLETTER_GALLERY: GalleryPhoto[] = DEMO_NEWSLETTER_STOCK_GALLERY_PHOTOS.map(
  (photo, index) => ({
    id: photo.id,
    organizationId: DEMO_PORTAL_ORG_ID,
    photoDate: plusDays("2026-10-01", index),
    storagePath: photo.src,
    fileName: photo.alt,
    mimeType: "image/webp",
    sizeBytes: null,
    uploadBatchId: null,
    uploadedBy: null,
    createdAt: FIXTURE_TIMESTAMP,
    updatedAt: FIXTURE_TIMESTAMP,
    imageUrl: photo.src,
    uploadedByName: "Morgan Ellis",
  }),
);

/** Photos already in the edition (picked from the library, so the picker marks them). */
const EDITION_PHOTOS: { id: string; caption: string }[] = [
  { id: "stock-10", caption: "Leaf hunting on the north loop" },
  { id: "stock-3", caption: "Sorting our finds for the leaf museum" },
  { id: "stock-5", caption: "Watercolor maps of the creek trail" },
];

/** Monday of the current week (local), as YYYY-MM-DD. */
function currentWeekMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((day + 6) % 7));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
}

/** A filled-in draft for this week: the sample edition plus teacher updates and photos. */
export function buildDemoNewsletterWorkspace(schoolName: string, primaryColor: string): NewsletterWorkspaceState {
  const workspace = createSampleEdition(schoolName, primaryColor);
  const week = currentWeekMonday();
  const byId = new Map(DEMO_NEWSLETTER_GALLERY.map((photo) => [photo.id, photo]));

  const editions = workspace.editions.map((edition) => ({
    ...edition,
    week,
    weekEnd: plusDays(week, 4),
    coverImage: byId.get("stock-2")?.imageUrl,
    coverGalleryPhotoId: "stock-2",
    events: edition.events.map((event) => ({ ...event, date: plusDays(week, 4) })),
    teacherUpdates: Object.fromEntries(
      DEMO_NEWSLETTER_TEACHER_UPDATES.filter((teacher) => teacher.preview).map((teacher) => [
        `demo-staff-${teacher.id}`,
        teacher.preview as string,
      ]),
    ),
    photos: EDITION_PHOTOS.map(({ id, caption }) => ({
      id: `demo-photo-${id}`,
      src: byId.get(id)?.imageUrl ?? "",
      caption,
      galleryPhotoId: id,
    })),
  }));

  return { ...workspace, editions, activeEditionId: editions[0].id };
}
