import type { GChipTone } from "@/components/school-parent/garden/ui";
import type { ParentFormListItem } from "@/lib/school-parent/forms-documents/types";
import { formatFormDueDate } from "@/lib/school-teacher/forms-documents/utils";

/** List status → chip (same mapping the story list card used). */
export function formStatusChip(item: ParentFormListItem): { tone: GChipTone; label: string } {
  if (item.listStatus === "signed") return { tone: "success", label: "Signed" };
  if (item.response.status === "overdue") return { tone: "alert", label: "Overdue" };
  return { tone: "warning", label: "Needs action" };
}

/** "Nov 3, 2026" for a signed timestamp. */
export function formatSignedOn(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** One meta line: "Due Nov 20, 2026" / "Signed on Nov 3, 2026". */
export function formDateLine(item: ParentFormListItem): string | null {
  if (item.listStatus === "signed") {
    const signed = formatSignedOn(item.response.signedAt);
    return signed ? `Signed on ${signed}` : null;
  }
  return item.form.dueDate ? `Due ${formatFormDueDate(item.form.dueDate)}` : null;
}

/** "Ava", "Ava and Leo", "Ava, Leo and Mia". */
export function joinStudentNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** Forms still waiting on the family: overdue first, then soonest due, undated last. */
export function sortFormQueue(items: ParentFormListItem[]): ParentFormListItem[] {
  return items
    .filter((item) => item.listStatus === "needs_action")
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aOver = a.item.response.status === "overdue" ? 0 : 1;
      const bOver = b.item.response.status === "overdue" ? 0 : 1;
      if (aOver !== bOver) return aOver - bOver;
      const aDue = a.item.form.dueDate ?? "9999-12-31";
      const bDue = b.item.form.dueDate ?? "9999-12-31";
      if (aDue !== bDue) return aDue < bDue ? -1 : 1;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}

/** "1 form" / "3 forms". */
export function formsCount(n: number): string {
  return `${n} form${n === 1 ? "" : "s"}`;
}
