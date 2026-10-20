import { getFeatureIcon } from "@/lib/organization-settings/icon-registry";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";
import type { ParentNavItem } from "@/lib/organization-settings/parent-nav";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import type { TeacherNavItem } from "@/lib/organization-settings/teacher-nav";

export const SCHOOL_GALLERY_NAV_KEY = "photos";

export function isSchoolGalleryFeatureKey(feature: string): boolean {
  return feature === SCHOOL_GALLERY_NAV_KEY;
}

export function injectSchoolGalleryParentNavItem(
  slug: string,
  items: ParentNavItem[],
  galleryEnabled: boolean,
  parentBasePath?: string,
): ParentNavItem[] {
  if (!galleryEnabled) return items;
  if (items.some((item) => item.key === SCHOOL_GALLERY_NAV_KEY)) {
    return items;
  }

  const href = parentBasePath
    ? `${parentBasePath}/${SCHOOL_GALLERY_NAV_KEY}`
    : schoolParentPath(slug, SCHOOL_GALLERY_NAV_KEY);

  const galleryItem: ParentNavItem = {
    key: SCHOOL_GALLERY_NAV_KEY,
    name: "Photos",
    icon: getFeatureIcon("image"),
    iconSlug: "image",
    href,
  };

  const calendarIndex = items.findIndex((item) => item.key === "calendar");
  const insertAt = calendarIndex >= 0 ? calendarIndex + 1 : items.length;
  return [...items.slice(0, insertAt), galleryItem, ...items.slice(insertAt)];
}

export function injectSchoolGalleryTeacherNavItem(
  slug: string,
  items: TeacherNavItem[],
  galleryEnabled: boolean,
  teacherBasePath?: string,
): TeacherNavItem[] {
  if (!galleryEnabled) return items;
  if (items.some((item) => item.key === SCHOOL_GALLERY_NAV_KEY)) {
    return items;
  }

  const href = teacherBasePath
    ? `${teacherBasePath}/${SCHOOL_GALLERY_NAV_KEY}`
    : schoolTeacherPath(slug, SCHOOL_GALLERY_NAV_KEY);

  const galleryItem: TeacherNavItem = {
    key: SCHOOL_GALLERY_NAV_KEY,
    name: "Photos",
    icon: getFeatureIcon("image"),
    iconSlug: "image",
    href,
  };

  const calendarIndex = items.findIndex((item) => item.key === "calendar");
  const insertAt = calendarIndex >= 0 ? calendarIndex + 1 : items.length;
  return [...items.slice(0, insertAt), galleryItem, ...items.slice(insertAt)];
}
