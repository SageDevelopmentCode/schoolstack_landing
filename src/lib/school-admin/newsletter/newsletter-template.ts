import {
  createNewsletterId,
  DEFAULT_NEWSLETTER_SECTIONS,
  type NewsletterEdition,
  type NewsletterSchoolTemplate,
  type NewsletterStoryBlock,
  type NewsletterStoryBlockKind,
  type NewsletterStoryBlockTemplate,
} from "./newsletter-types";

const TEMPLATE_STORAGE_PREFIX = "mudkitchen-newsletter-template-";

function blockId(kind: NewsletterStoryBlockKind, suffix = ""): string {
  return suffix ? `${kind}-${suffix}` : kind;
}

export function defaultStoryBlockTemplates(): NewsletterStoryBlockTemplate[] {
  return [
    {
      id: blockId("welcome"),
      kind: "welcome",
      heading: "Opening note",
      prompt: "A note to families",
      optional: true,
      enabled: true,
    },
    {
      id: blockId("learning"),
      kind: "learning",
      heading: "Little discoveries",
      prompt: "What did children explore?",
      starter: "This week, we explored…",
      enabled: true,
    },
    {
      id: blockId("moment"),
      kind: "moment",
      heading: "A moment worth sharing",
      prompt: "A moment worth sharing",
      optional: true,
      enabled: true,
    },
    {
      id: blockId("next"),
      kind: "next",
      heading: "Looking ahead",
      prompt: "What's coming next?",
      starter: "Next week, we'll explore…",
      optional: true,
      enabled: true,
    },
    {
      id: blockId("family"),
      kind: "family",
      heading: "An invitation for home",
      prompt: "An invitation for home",
      optional: true,
      enabled: true,
    },
    {
      id: blockId("quote"),
      kind: "quote",
      heading: "A child's words",
      prompt: "A child's words",
      optional: true,
      enabled: false,
    },
  ];
}

export function defaultSchoolTemplate(): NewsletterSchoolTemplate {
  return {
    storyBlocks: defaultStoryBlockTemplates(),
    sections: { ...DEFAULT_NEWSLETTER_SECTIONS },
    teacherUpdatesHeading: "Class updates",
  };
}

export function storyBlocksFromTemplate(
  template: NewsletterSchoolTemplate,
  values: Record<string, string> = {},
): NewsletterStoryBlock[] {
  return template.storyBlocks.map((block) => ({
    ...block,
    value: values[block.id] ?? "",
  }));
}

export function applyTemplateToEdition(
  template: NewsletterSchoolTemplate,
  edition: NewsletterEdition,
): NewsletterEdition {
  const valueById = new Map(edition.storyBlocks.map((b) => [b.id, b.value]));
  const storyBlocks = template.storyBlocks.map((block) => ({
    ...block,
    value: valueById.get(block.id) ?? "",
  }));
  return {
    ...edition,
    sections: { ...template.sections },
    storyBlocks,
  };
}

export function createEditionFromTemplate(
  template: NewsletterSchoolTemplate,
  partial: Partial<Pick<NewsletterEdition, "week" | "weekEnd" | "title" | "layout">> = {},
): NewsletterEdition {
  const week = partial.week ?? new Date().toISOString().slice(0, 10);
  return {
    id: createNewsletterId(),
    title: partial.title ?? "This week at our school",
    week,
    weekEnd: partial.weekEnd,
    layout: partial.layout ?? "storybook",
    status: "draft",
    sections: { ...template.sections },
    storyBlocks: storyBlocksFromTemplate(template),
    teacherUpdates: {},
    events: [],
    reminders: [],
    photos: [],
  };
}

export function templateFromEdition(
  edition: NewsletterEdition,
  existing?: NewsletterSchoolTemplate,
): NewsletterSchoolTemplate {
  const base = existing ?? defaultSchoolTemplate();
  const templateBlocks: NewsletterStoryBlockTemplate[] = edition.storyBlocks.map(
    ({ value: _value, ...rest }) => rest,
  );
  const customFromEdition = templateBlocks.filter((b) => b.kind === "custom");
  const fixedFromEdition = templateBlocks.filter((b) => b.kind !== "custom");
  const fixedFromBase = base.storyBlocks.filter((b) => b.kind !== "custom");

  const mergedFixed = fixedFromBase.map((baseBlock) => {
    const fromEdition = fixedFromEdition.find((b) => b.kind === baseBlock.kind);
    return fromEdition ?? baseBlock;
  });

  const customFromBase = base.storyBlocks.filter((b) => b.kind === "custom");
  const customIds = new Set(customFromEdition.map((b) => b.id));
  const custom = [
    ...customFromEdition,
    ...customFromBase.filter((b) => !customIds.has(b.id)),
  ];

  return {
    ...base,
    sections: { ...edition.sections },
    storyBlocks: [...mergedFixed, ...custom],
  };
}

export function loadSchoolTemplate(organizationId: string): NewsletterSchoolTemplate | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${TEMPLATE_STORAGE_PREFIX}${organizationId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NewsletterSchoolTemplate;
    if (!parsed?.storyBlocks?.length) return null;
    return {
      ...defaultSchoolTemplate(),
      ...parsed,
      sections: { ...DEFAULT_NEWSLETTER_SECTIONS, ...parsed.sections },
      storyBlocks: parsed.storyBlocks,
    };
  } catch {
    return null;
  }
}

export function saveSchoolTemplate(organizationId: string, template: NewsletterSchoolTemplate): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${TEMPLATE_STORAGE_PREFIX}${organizationId}`,
      JSON.stringify(template),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function getStoryBlock(
  edition: NewsletterEdition,
  kind: NewsletterStoryBlockKind,
): NewsletterStoryBlock | undefined {
  return edition.storyBlocks.find((b) => b.kind === kind);
}

export function getWelcomeValue(edition: NewsletterEdition): string {
  const block = getStoryBlock(edition, "welcome");
  return block?.enabled ? block.value : "";
}
