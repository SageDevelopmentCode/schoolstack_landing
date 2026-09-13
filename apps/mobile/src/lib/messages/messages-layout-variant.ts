export type MessagesLayoutVariant = 'default' | 'parent-story' | 'admin-story';

export function isStoryMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return variant === 'parent-story' || variant === 'admin-story';
}

export function isSplitPaneMessagesVariant(variant: MessagesLayoutVariant): boolean {
  return variant === 'parent-story' || variant === 'admin-story';
}
