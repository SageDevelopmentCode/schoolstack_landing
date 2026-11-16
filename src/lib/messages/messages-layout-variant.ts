import type { MessagesLayoutVariant } from "@/components/messages/MessagesAvatar";

export function isSplitPaneMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return (
    variant === "embedded" ||
    variant === "parent-story" ||
    variant === "parent-garden" ||
    variant === "admin-story" ||
    variant === "admin-garden"
  );
}

export function isStoryMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return (
    variant === "parent-story" ||
    variant === "parent-garden" ||
    variant === "admin-story" ||
    variant === "admin-garden"
  );
}

export function isAdminStoryMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return variant === "admin-story";
}

/** Garden inbox look for parents and staff (the viewer decides the extras, e.g. staff student links). */
export function isParentGardenMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return variant === "parent-garden";
}

/** School admin portal Garden look (admin viewer; same Garden inbox as parents plus admin tools). */
export function isAdminGardenMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return variant === "admin-garden";
}

/** Either Garden inbox (parent or admin): rendered by the presentation-only Garden view. */
export function isGardenMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return variant === "parent-garden" || variant === "admin-garden";
}
