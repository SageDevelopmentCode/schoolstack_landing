import type {
  NewsletterSchoolTemplate,
  NewsletterStoryBlock,
  NewsletterStoryBlockTemplate,
} from "./newsletter-types";

export const MAX_ENABLED_STORY_BLOCKS = 10;
export const MAX_CUSTOM_STORY_BLOCKS = 6;
export const MAX_NEWSLETTER_EVENTS = 30;
export const MAX_NEWSLETTER_REMINDERS = 30;
export const MAX_NEWSLETTER_PHOTOS = 30;

export function countEnabledStoryBlocks(
  blocks: Pick<NewsletterStoryBlock, "enabled">[],
): number {
  return blocks.filter((b) => b.enabled).length;
}

export function countCustomStoryBlocks(
  blocks: Pick<NewsletterStoryBlockTemplate, "kind">[],
): number {
  return blocks.filter((b) => b.kind === "custom").length;
}

export function canEnableStoryBlock(
  blocks: Pick<NewsletterStoryBlock, "id" | "enabled">[],
  blockId?: string,
): boolean {
  const enabled = countEnabledStoryBlocks(blocks);
  if (blockId) {
    const block = blocks.find((b) => b.id === blockId);
    if (block?.enabled) return true;
    return enabled < MAX_ENABLED_STORY_BLOCKS;
  }
  return enabled < MAX_ENABLED_STORY_BLOCKS;
}

export function canAddCustomStoryBlock(template: NewsletterSchoolTemplate): boolean {
  if (countCustomStoryBlocks(template.storyBlocks) >= MAX_CUSTOM_STORY_BLOCKS) {
    return false;
  }
  if (countEnabledStoryBlocks(template.storyBlocks) >= MAX_ENABLED_STORY_BLOCKS) {
    return false;
  }
  return true;
}

export function customStoryBlockLimitMessage(): string {
  return `Up to ${MAX_CUSTOM_STORY_BLOCKS} custom sections and ${MAX_ENABLED_STORY_BLOCKS} enabled story sections.`;
}
