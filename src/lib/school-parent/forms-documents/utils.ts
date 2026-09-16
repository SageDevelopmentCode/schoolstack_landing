import type { TeacherFormField } from "@/lib/school-teacher/forms-documents/types";
import type {
  ParentFormFilterStatus,
  ParentFormListItem,
  ParentFormListStatus,
} from "./types";

export const PARENT_FORM_MODAL_PREVIEW_HEIGHT_CLASS = "h-[min(72vh,760px)]";

export function classifyParentFormListStatus(
  status: ParentFormListItem["response"]["status"],
): ParentFormListStatus {
  return status === "signed" ? "signed" : "needs_action";
}

export function filterParentFormsByStatus(
  items: ParentFormListItem[],
  filter: ParentFormFilterStatus,
): ParentFormListItem[] {
  if (filter === "all") return items;
  return items.filter((item) => item.listStatus === filter);
}

export function areBuilderFieldValuesComplete(
  fields: TeacherFormField[],
  fieldValues: Record<string, string | boolean | string[]>,
): boolean {
  for (const field of fields) {
    if (!field.required) continue;

    const value = fieldValues[field.id];
    if (field.type === "checkbox") {
      if (value !== true) return false;
      continue;
    }

    if (field.type === "multiple_choice") {
      const selected = Array.isArray(value) ? value : [];
      if (selected.length === 0) return false;
      continue;
    }

    const text = typeof value === "string" ? value.trim() : "";
    if (!text) return false;
  }

  return true;
}

export function countParentFormsByStatus(items: ParentFormListItem[]): {
  all: number;
  needs_action: number;
  signed: number;
} {
  return {
    all: items.length,
    needs_action: items.filter((item) => item.listStatus === "needs_action").length,
    signed: items.filter((item) => item.listStatus === "signed").length,
  };
}
