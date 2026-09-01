import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import { DEFAULT_PARENT_ONBOARDING_ITEMS } from "./catalog";
import {
  childHealthDeepLinkHref,
  isParentFeatureEnabled,
  schoolParentPath,
} from "./parent-routes";
import type {
  OrganizationFeatures,
  ParentOnboardingAutoCompletionType,
  ParentOnboardingConfig,
  ParentOnboardingItem,
} from "./types";

const CUSTOM_URL_PREFIX = "url:";

export type ResolvedParentOnboardingItem = ParentOnboardingItem & {
  href: string;
  completed: boolean;
  autoTracked: boolean;
};

export type ParentOnboardingCompletionStatus = {
  billing: boolean;
  messages: boolean;
  committees: boolean;
  children: boolean;
  health: boolean;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeOnboardingItem(
  raw: Record<string, unknown>,
  index: number,
): ParentOnboardingItem | null {
  const label = typeof raw.label === "string" ? raw.label.trim() : "";
  const target = typeof raw.target === "string" ? raw.target.trim() : "";
  if (!label || !target) return null;

  const id =
    typeof raw.id === "string" && raw.id.trim()
      ? raw.id.trim()
      : `onboarding_item_${index + 1}`;

  const icon =
    typeof raw.icon === "string" && raw.icon.trim() ? raw.icon.trim() : undefined;

  return { id, label, target, icon };
}

function backfillDefaultOnboardingItems(
  items: ParentOnboardingItem[],
): ParentOnboardingItem[] {
  const existingIds = new Set(items.map((item) => item.id));
  const missingDefaults = DEFAULT_PARENT_ONBOARDING_ITEMS.filter(
    (item) => !existingIds.has(item.id),
  );

  if (missingDefaults.length === 0) return items;
  return [...items, ...missingDefaults];
}

export function mergeParentOnboarding(
  stored: ParentOnboardingConfig | Record<string, unknown> | null | undefined,
): ParentOnboardingConfig {
  if (!stored || !isPlainObject(stored)) {
    return { items: structuredClone(DEFAULT_PARENT_ONBOARDING_ITEMS) };
  }

  const rawItems = stored.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { items: structuredClone(DEFAULT_PARENT_ONBOARDING_ITEMS) };
  }

  const items = rawItems
    .map((item, index) =>
      isPlainObject(item) ? normalizeOnboardingItem(item, index) : null,
    )
    .filter((item): item is ParentOnboardingItem => item !== null);

  if (items.length === 0) {
    return { items: structuredClone(DEFAULT_PARENT_ONBOARDING_ITEMS) };
  }

  return { items: backfillDefaultOnboardingItems(items) };
}

export function getParentOnboardingItems(
  features: OrganizationFeatures,
): ParentOnboardingItem[] {
  return mergeParentOnboarding(features.parent_onboarding).items;
}

export function isCustomOnboardingUrlTarget(target: string): boolean {
  return target.startsWith(CUSTOM_URL_PREFIX);
}

export function getCustomOnboardingUrl(target: string): string | null {
  if (!isCustomOnboardingUrlTarget(target)) return null;
  const href = target.slice(CUSTOM_URL_PREFIX.length).trim();
  return href || null;
}

export function toCustomOnboardingUrlTarget(href: string): string {
  return `${CUSTOM_URL_PREFIX}${href.trim()}`;
}

export function getAutoCompletionType(
  target: string,
): ParentOnboardingAutoCompletionType | null {
  if (isCustomOnboardingUrlTarget(target)) return null;
  if (
    target === "billing" ||
    target === "messages" ||
    target === "committees" ||
    target === "children" ||
    target === "health"
  ) {
    return target;
  }
  return null;
}

export function firstChildWithStudentId(
  familyChildren: FamilyChildOverview[],
): FamilyChildOverview | null {
  return familyChildren.find((child) => Boolean(child.studentId)) ?? null;
}

export function resolveParentOnboardingHref(
  slug: string,
  target: string,
  options?: {
    parentBasePath?: string;
    familyChildren?: FamilyChildOverview[];
  },
): string | null {
  const customUrl = getCustomOnboardingUrl(target);
  if (customUrl) return customUrl;

  if (target === "health") {
    const child = firstChildWithStudentId(options?.familyChildren ?? []);
    if (!child) return null;
    return childHealthDeepLinkHref(
      slug,
      child.applicationId,
      options?.parentBasePath,
    );
  }

  if (options?.parentBasePath) {
    return `${options.parentBasePath}/${target}`;
  }

  return schoolParentPath(slug, target);
}

export function shouldShowParentOnboardingItem(
  features: OrganizationFeatures,
  item: ParentOnboardingItem,
  familyChildren?: FamilyChildOverview[],
): boolean {
  if (isCustomOnboardingUrlTarget(item.target)) {
    return getCustomOnboardingUrl(item.target) !== null;
  }

  if (item.target === "health") {
    if (!isParentFeatureEnabled(features, "children")) {
      return false;
    }
    return firstChildWithStudentId(familyChildren ?? []) !== null;
  }

  return isParentFeatureEnabled(features, item.target);
}

export function resolveParentOnboardingItems(input: {
  slug: string;
  features: OrganizationFeatures;
  completion: ParentOnboardingCompletionStatus;
  previewBasePath?: string;
  familyChildren?: FamilyChildOverview[];
}): ResolvedParentOnboardingItem[] {
  const items = getParentOnboardingItems(input.features);
  const familyChildren = input.familyChildren ?? [];

  return items
    .filter((item) =>
      shouldShowParentOnboardingItem(input.features, item, familyChildren),
    )
    .map((item) => {
      const autoType = getAutoCompletionType(item.target);
      const href = resolveParentOnboardingHref(input.slug, item.target, {
        parentBasePath: input.previewBasePath,
        familyChildren,
      });

      return {
        ...item,
        href: href ?? "#",
        completed:
          autoType !== null ? input.completion[autoType] : false,
        autoTracked: autoType !== null,
      };
    })
    .filter((item) => item.href !== "#");
}
