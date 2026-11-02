import type {
  NewsletterEdition,
  NewsletterSchoolTemplate,
  NewsletterStoryBlock,
  NewsletterStoryBlockTemplate,
} from "./newsletter-types";
import { NewsletterError } from "./newsletter-errors";

export const MAX_ENABLED_STORY_BLOCKS = 10;
export const MAX_CUSTOM_STORY_BLOCKS = 6;
export const MAX_NEWSLETTER_EVENTS = 30;
export const MAX_NEWSLETTER_REMINDERS = 30;
export const MAX_NEWSLETTER_PHOTOS = 30;
/** Keeps figcaptions to one line in the 2-column photo grid. */
export const MAX_NEWSLETTER_PHOTO_CAPTION_LENGTH = 80;
/** Show current/max caption counter in the editor at this length and above. */
export const NEWSLETTER_PHOTO_CAPTION_COUNT_SHOW_AT = 60;

export function newsletterPhotoCaptionLimitMessage(): string {
  return `Up to ${MAX_NEWSLETTER_PHOTO_CAPTION_LENGTH} characters (one line in the newsletter).`;
}

export function assertNewsletterPhotoCaptionLimits(edition: NewsletterEdition): void {
  for (const photo of edition.photos) {
    if (photo.caption.length > MAX_NEWSLETTER_PHOTO_CAPTION_LENGTH) {
      throw new NewsletterError(
        `Photo captions must be ${MAX_NEWSLETTER_PHOTO_CAPTION_LENGTH} characters or fewer.`,
        "limit_photo_caption",
        400,
      );
    }
  }
}

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
