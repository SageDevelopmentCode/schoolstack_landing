import type {
  ChecklistVariantConfig,
  ChecklistVariantResolution,
  EnrollmentChecklistItem,
} from "./enrollment-checklist-schema";
import {
  deriveVariantKey,
  getItemVariantConfig,
  hasItemVariantMetadata,
  isAgreementItemType,
  readItemVariantDraft,
} from "./enrollment-checklist-schema";

export type ChecklistVariantGroup = {
  groupId: string;
  groupLabel: string;
  variants: EnrollmentChecklistItem[];
  needsSetup: boolean;
};

function draftGroupLabel(draft: { groupLabel: string }, variants: EnrollmentChecklistItem[]): string {
  const trimmed = draft.groupLabel.trim();
  if (trimmed) return trimmed;
  return variants[0]?.label.trim() || "Agreement options";
}

export function getVariantGroups(
  items: EnrollmentChecklistItem[],
): ChecklistVariantGroup[] {
  const byGroup = new Map<string, { variants: EnrollmentChecklistItem[]; draftLabel: string }>();

  for (const item of items) {
    const draft = readItemVariantDraft(item);
    if (!draft) continue;

    const existing = byGroup.get(draft.groupId);
    if (existing) {
      existing.variants.push(item);
      if (draft.groupLabel.trim()) {
        existing.draftLabel = draft.groupLabel;
      }
    } else {
      byGroup.set(draft.groupId, {
        variants: [item],
        draftLabel: draft.groupLabel,
      });
    }
  }

  return [...byGroup.entries()].map(([groupId, group]) => {
    const needsSetup = group.variants.some((item) => !getItemVariantConfig(item));
    return {
      groupId,
      groupLabel: draftGroupLabel({ groupLabel: group.draftLabel }, group.variants),
      variants: group.variants,
      needsSetup,
    };
  });
}

export function itemBelongsToVariantGroup(item: EnrollmentChecklistItem): boolean {
  return hasItemVariantMetadata(item);
}

export function validateVariantGroups(items: EnrollmentChecklistItem[]): string[] {
  const errors: string[] = [];
  const groups = getVariantGroups(items);

  for (const group of groups) {
    const displayLabel = group.groupLabel || "Agreement options";

    for (const item of group.variants) {
      const config = getItemVariantConfig(item);
      if (!config) {
        errors.push(
          `Complete all fields for agreement options in "${displayLabel}" before publishing.`,
        );
        break;
      }
    }

    if (group.variants.length < 2) {
      errors.push(
        `"${displayLabel}" needs at least two agreement options.`,
      );
    }

    const defaultCount = group.variants.filter(
      (item) => getItemVariantConfig(item)?.isDefault,
    ).length;

    if (defaultCount !== 1) {
      errors.push(
        `"${displayLabel}" needs exactly one default option.`,
      );
    }

    const types = new Set(group.variants.map((item) => item.type));
    if (types.size > 1) {
      errors.push(
        `All options in "${displayLabel}" must use the same item type.`,
      );
    }

    for (const item of group.variants) {
      if (!isAgreementItemType(item.type)) {
        errors.push(
          `Only agreement items can belong to variant groups ("${item.label}").`,
        );
      }
    }

    const variantKeys = new Set<string>();
    for (const item of group.variants) {
      const key = deriveVariantKey(item);
      if (variantKeys.has(key)) {
        errors.push(
          `Duplicate option in "${displayLabel}".`,
        );
      }
      variantKeys.add(key);
    }
  }

  return errors;
}

/** Map of groupId → selected template item id. */
export type VariantResolutionMap = Record<string, string>;

export function buildDefaultResolutions(
  groups: ChecklistVariantGroup[],
): VariantResolutionMap {
  const resolutions: VariantResolutionMap = {};
  for (const group of groups) {
    const defaultVariant =
      group.variants.find((item) => getItemVariantConfig(item)?.isDefault) ??
      group.variants[0];
    if (defaultVariant) {
      resolutions[group.groupId] = defaultVariant.id;
    }
  }
  return resolutions;
}

export function buildVariantResolutions(
  items: EnrollmentChecklistItem[],
  resolutionMap: VariantResolutionMap,
  resolvedAt: string,
): Record<string, ChecklistVariantResolution> {
  const groups = getVariantGroups(items);
  const result: Record<string, ChecklistVariantResolution> = {};

  for (const group of groups) {
    const selectedId = resolutionMap[group.groupId];
    const selected = group.variants.find((item) => item.id === selectedId);
    if (!selected) continue;
    const variant = getItemVariantConfig(selected);
    if (!variant) continue;
    result[group.groupId] = {
      templateItemId: selected.id,
      variantKey: variant.variantKey,
      resolvedBy: "admin",
      resolvedAt,
    };
  }

  return result;
}

export function validateResolutionMap(
  items: EnrollmentChecklistItem[],
  resolutionMap: VariantResolutionMap,
): string[] {
  const errors: string[] = [];
  const groups = getVariantGroups(items);

  for (const group of groups) {
    const selectedId = resolutionMap[group.groupId];
    if (!selectedId) {
      errors.push(`Select an option for "${group.groupLabel}".`);
      continue;
    }
    const selected = group.variants.find((item) => item.id === selectedId);
    if (!selected) {
      errors.push(`Invalid selection for "${group.groupLabel}".`);
    }
  }

  return errors;
}

export function isVariantItemSelected(
  item: EnrollmentChecklistItem,
  resolutions: Record<string, ChecklistVariantResolution>,
): boolean {
  const draft = readItemVariantDraft(item);
  if (!draft) return true;
  const resolution = resolutions[draft.groupId];
  return resolution?.templateItemId === item.id;
}

export function resolveVisibleTemplateItems(
  items: EnrollmentChecklistItem[],
  resolutions: Record<string, ChecklistVariantResolution>,
): EnrollmentChecklistItem[] {
  return items.filter((item) => isVariantItemSelected(item, resolutions));
}

export function getSharedChecklistItems(
  items: EnrollmentChecklistItem[],
): EnrollmentChecklistItem[] {
  return items.filter((item) => !itemBelongsToVariantGroup(item));
}

export function variantConfigFromGroup(
  group: ChecklistVariantGroup,
  variantKey: string,
  isDefault?: boolean,
): ChecklistVariantConfig {
  return {
    groupId: group.groupId,
    groupLabel: group.groupLabel,
    variantKey,
    ...(isDefault ? { isDefault: true } : {}),
  };
}

/** Outline rows: either a single item or a collapsed variant group. */
export type ChecklistOutlineEntry =
  | { kind: "item"; item: EnrollmentChecklistItem; itemIdx: number }
  | {
      kind: "variant_group";
      group: ChecklistVariantGroup;
      itemIdx: number;
    };

export function buildChecklistOutlineEntries(
  items: EnrollmentChecklistItem[],
): ChecklistOutlineEntry[] {
  const entries: ChecklistOutlineEntry[] = [];
  const seenGroups = new Set<string>();
  let displayIdx = 0;

  for (const item of items) {
    const draft = readItemVariantDraft(item);
    if (draft) {
      if (seenGroups.has(draft.groupId)) continue;
      seenGroups.add(draft.groupId);
      const groups = getVariantGroups(items);
      const group = groups.find((g) => g.groupId === draft.groupId);
      if (group) {
        entries.push({ kind: "variant_group", group, itemIdx: displayIdx });
        displayIdx += 1;
      }
      continue;
    }
    entries.push({ kind: "item", item, itemIdx: displayIdx });
    displayIdx += 1;
  }

  return entries;
}

export function findVariantGroupForItem(
  items: EnrollmentChecklistItem[],
  itemId: string,
): ChecklistVariantGroup | null {
  const item = items.find((row) => row.id === itemId);
  if (!item) return null;
  const draft = readItemVariantDraft(item);
  if (!draft) return null;
  return getVariantGroups(items).find((g) => g.groupId === draft.groupId) ?? null;
}
