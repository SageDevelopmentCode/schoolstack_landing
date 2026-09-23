import type { TeacherParentFormCategory } from "@/lib/school-teacher/forms-documents/types";

export function parseFormCategoryQuery(
  value: string | null | undefined,
): TeacherParentFormCategory | undefined {
  if (value === "tuition") return "tuition";
  if (value === "general") return "general";
  return undefined;
}
