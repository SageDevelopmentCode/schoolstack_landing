import type { MessagesLayoutVariant } from "@/components/messages/MessagesAvatar";

export function isSplitPaneMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return (
    variant === "embedded" ||
    variant === "parent-story" ||
    variant === "parent-garden" ||
    variant === "admin-story"
  );
}

export function isStoryMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return (
    variant === "parent-story" ||
    variant === "parent-garden" ||
    variant === "admin-story"
  );
}

export function isAdminStoryMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return variant === "admin-story";
}

/** Parent portal Garden dashboard look (parent viewer only; teacher keeps parent-story). */
export function isParentGardenMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return variant === "parent-garden";
}
