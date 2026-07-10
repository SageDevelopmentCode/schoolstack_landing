import {
  ClipboardList,
  CreditCard,
  FileSignature,
  FileText,
  PenLine,
  Upload,
  type LucideIcon,
} from "lucide-react";
import type {
  ChecklistItemInstanceStatus,
  ChecklistItemType,
} from "./enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export function checklistItemStatusLabel(status: ChecklistItemInstanceStatus): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In progress";
    case "waived":
      return "Waived";
    case "not_started":
    default:
      return "Not started";
  }
}

export function checklistItemStatusStyle(
  status: ChecklistItemInstanceStatus,
  C: Pick<
    AdminThemeTokens,
    "success" | "successBg" | "info" | "infoBg" | "warning" | "warningBg" | "textTertiary" | "elevated" | "textSecondary"
  >,
): { backgroundColor: string; color: string } {
  switch (status) {
    case "completed":
      return { backgroundColor: C.successBg, color: C.success };
    case "in_progress":
      return { backgroundColor: C.infoBg, color: C.info };
    case "waived":
      return { backgroundColor: C.elevated, color: C.textSecondary };
    case "not_started":
    default:
      return { backgroundColor: C.warningBg, color: C.warning };
  }
}

export function checklistItemStatusIconColor(
  status: ChecklistItemInstanceStatus,
  C: Pick<AdminThemeTokens, "success" | "info" | "textTertiary" | "textSecondary">,
): string {
  switch (status) {
    case "completed":
      return C.success;
    case "in_progress":
      return C.info;
    case "waived":
      return C.textSecondary;
    case "not_started":
    default:
      return C.textTertiary;
  }
}

export function getChecklistItemTypeIcon(type: ChecklistItemType): LucideIcon {
  switch (type) {
    case "document_sign":
      return FileSignature;
    case "document_sign_pdf":
      return FileText;
    case "form":
      return ClipboardList;
    case "file_upload":
      return Upload;
    case "payment":
      return CreditCard;
    case "acknowledgment":
      return PenLine;
  }
}
