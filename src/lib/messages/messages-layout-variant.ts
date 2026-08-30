import type { MessagesLayoutVariant } from "@/components/messages/MessagesAvatar";

export function isSplitPaneMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return variant === "embedded" || variant === "parent-story";
}

export function isStoryMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return variant === "parent-story";
}
