import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";

export type ChecklistBuilderFocus =
  | { kind: "item"; itemId: string }
  | { kind: "field"; itemId: string; fieldId: string };

export function checklistFocusKey(focus: ChecklistBuilderFocus | null): string {
  if (!focus) return "empty";
  switch (focus.kind) {
    case "item":
      return `item:${focus.itemId}`;
    case "field":
      return `field:${focus.itemId}:${focus.fieldId}`;
  }
}

export function initialChecklistFocus(
  items: EnrollmentChecklistItem[],
): ChecklistBuilderFocus | null {
  return items[0] ? { kind: "item", itemId: items[0].id } : null;
}
