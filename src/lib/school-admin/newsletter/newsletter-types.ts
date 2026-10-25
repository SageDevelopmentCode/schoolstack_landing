export type NewsletterLayout = "storybook" | "brief" | "journal";

export type NewsletterEditionStatus = "draft" | "published";

export type NewsletterStoryBlockKind =
  | "welcome"
  | "learning"
  | "moment"
  | "next"
  | "family"
  | "quote"
  | "custom";

export type NewsletterSections = {
  events: boolean;
  reminders: boolean;
  photos: boolean;
  teacherUpdates: boolean;
};

export type NewsletterStoryBlock = {
  id: string;
  kind: NewsletterStoryBlockKind;
  heading: string;
  prompt: string;
  starter?: string;
  optional?: boolean;
  enabled: boolean;
  value: string;
};

export type NewsletterStoryBlockTemplate = Omit<NewsletterStoryBlock, "value">;

export type NewsletterSchoolTemplate = {
  storyBlocks: NewsletterStoryBlockTemplate[];
  sections: NewsletterSections;
  teacherUpdatesHeading: string;
};

export type NewsletterEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  note: string;
};

export type NewsletterReminder = {
  id: string;
  text: string;
  keep: boolean;
};

export type NewsletterPhoto = {
  id: string;
  src: string;
  caption: string;
};

export type NewsletterEdition = {
  id: string;
  title: string;
  week: string;
  weekEnd?: string;
  layout: NewsletterLayout;
  status: NewsletterEditionStatus;
  publishedAt?: string;
  sections: NewsletterSections;
  storyBlocks: NewsletterStoryBlock[];
  teacherUpdates: Record<string, string>;
  events: NewsletterEvent[];
  reminders: NewsletterReminder[];
  photos: NewsletterPhoto[];
};

export type NewsletterSchoolMeta = {
  name: string;
  signature: string;
  primary: string;
};

export type NewsletterWorkspaceState = {
  school: NewsletterSchoolMeta;
  template: NewsletterSchoolTemplate;
  editions: NewsletterEdition[];
  activeEditionId: string;
};

export const DEFAULT_NEWSLETTER_SECTIONS: NewsletterSections = {
  events: true,
  reminders: true,
  photos: true,
  teacherUpdates: false,
};

export function createNewsletterId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
