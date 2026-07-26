import type {
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
} from "./enrollment-checklist-schema";

export function resolveEnrollmentChecklistInitialItemId(
  items: EnrollmentChecklistItem[],
  instances: EnrollmentChecklistItemInstance[],
  options?: {
    explicitItemId?: string;
    lastActiveTemplateItemId?: string;
  },
): string | null {
  if (items.length === 0) return null;

  const statusByTemplateId = new Map(
    instances.map((instance) => [instance.templateItemId, instance.status]),
  );

  const isSelectableItem = (itemId: string) => {
    const status = statusByTemplateId.get(itemId);
    return status !== "completed" && status !== "waived";
  };

  const { explicitItemId, lastActiveTemplateItemId } = options ?? {};

  if (explicitItemId && items.some((item) => item.id === explicitItemId)) {
    return explicitItemId;
  }

  if (
    lastActiveTemplateItemId &&
    items.some((item) => item.id === lastActiveTemplateItemId) &&
    isSelectableItem(lastActiveTemplateItemId)
  ) {
    return lastActiveTemplateItemId;
  }

  const firstInProgress = items.find(
    (item) => statusByTemplateId.get(item.id) === "in_progress",
  );
  if (firstInProgress) return firstInProgress.id;

  const firstIncomplete = items.find((item) => isSelectableItem(item.id));
  if (firstIncomplete) return firstIncomplete.id;

  return items[0].id;
}
