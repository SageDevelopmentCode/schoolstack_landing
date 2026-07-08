import type { ApplicationSection } from "./application-form-schema";
import { newAdmissionsId } from "./application-form-schema";

export type ChecklistItemType =
  | "document_sign"
  | "form"
  | "file_upload"
  | "payment"
  | "acknowledgment";

export type ChecklistStepIconKey =
  | "fileText"
  | "users"
  | "heart"
  | "pill"
  | "shieldCheck"
  | "clipboardList"
  | "camera"
  | "alertTriangle"
  | "userPlus"
  | "creditCard";

export type EnrollmentContractSection = {
  id: string;
  title: string;
  body: string;
};

export type InlineDocumentConfig = {
  kind: "inline_sections";
  sections: EnrollmentContractSection[];
  showWarningBanner?: boolean;
  consentOptions?: { value: string; label: string }[];
};

export type PdfDocumentConfig = {
  kind: "pdf";
  fileName: string;
};

export type DocumentConfig = InlineDocumentConfig | PdfDocumentConfig;

export type ChecklistFileUploadConfig = {
  accept: string;
  maxFiles: number;
  helpText: string;
};

export type ChecklistPaymentConfig = {
  label: string;
  amountCents: number;
};

export type ChecklistAcknowledgmentOption = {
  value: string;
  label: string;
};

export type ChecklistAcknowledgmentConfig = {
  body: string;
  options?: ChecklistAcknowledgmentOption[];
};

export type EnrollmentChecklistItem = {
  id: string;
  itemKey: string;
  label: string;
  type: ChecklistItemType;
  required: boolean;
  icon: ChecklistStepIconKey;
  document?: DocumentConfig;
  formSchema?: ApplicationSection;
  fileUpload?: ChecklistFileUploadConfig;
  payment?: ChecklistPaymentConfig;
  acknowledgment?: ChecklistAcknowledgmentConfig;
  metadata: Record<string, unknown>;
};

export const CHECKLIST_ITEM_TYPE_LABELS: Record<ChecklistItemType, string> = {
  document_sign: "Agreement",
  form: "Form",
  file_upload: "File upload",
  payment: "Payment",
  acknowledgment: "Acknowledgment",
};

export function createChecklistItemKey(label: string): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
  return base || `item_${newAdmissionsId().slice(0, 8)}`;
}

export function createBlankChecklistItem(
  type: ChecklistItemType,
  label = "New checklist item",
): EnrollmentChecklistItem {
  const id = newAdmissionsId();
  const item: EnrollmentChecklistItem = {
    id,
    itemKey: createChecklistItemKey(label),
    label,
    type,
    required: true,
    icon: defaultIconForType(type),
    metadata: {},
  };

  switch (type) {
    case "document_sign":
      item.document = {
        kind: "inline_sections",
        sections: [
          {
            id: newAdmissionsId(),
            title: "1. Section title",
            body: "Add agreement text families will read and sign.",
          },
        ],
      };
      break;
    case "form":
      item.formSchema = {
        id: newAdmissionsId(),
        title: label,
        fields: [],
      };
      break;
    case "file_upload":
      item.fileUpload = {
        accept: ".pdf,.jpg,.jpeg,.png",
        maxFiles: 3,
        helpText: "Upload required documents.",
      };
      break;
    case "payment":
      item.payment = {
        label: "Registration fee",
        amountCents: 15000,
      };
      break;
    case "acknowledgment":
      item.acknowledgment = {
        body: "By signing below, I confirm that the information provided is accurate.",
      };
      break;
  }

  return item;
}

export function defaultIconForType(type: ChecklistItemType): ChecklistStepIconKey {
  switch (type) {
    case "document_sign":
      return "fileText";
    case "form":
      return "heart";
    case "file_upload":
      return "shieldCheck";
    case "payment":
      return "creditCard";
    case "acknowledgment":
      return "clipboardList";
  }
}

export function getChecklistItemSummary(item: EnrollmentChecklistItem): string {
  switch (item.type) {
    case "document_sign": {
      if (!item.document) return "Agreement";
      if (item.document.kind === "pdf") {
        return item.document.fileName
          ? `PDF · ${item.document.fileName}`
          : "PDF · no file selected";
      }
      const count = item.document.sections.length;
      return `${count} section${count === 1 ? "" : "s"} · signatures required`;
    }
    case "form": {
      const count = item.formSchema?.fields.length ?? 0;
      if (count === 0) return item.required ? "Required item" : "Optional item";
      return `${count} question${count === 1 ? "" : "s"}`;
    }
    case "file_upload":
      return item.fileUpload?.helpText || "File upload";
    case "payment":
      return item.payment
        ? `${item.payment.label} · $${(item.payment.amountCents / 100).toFixed(2)}`
        : "Payment";
    case "acknowledgment":
      return item.acknowledgment?.options?.length
        ? `${item.acknowledgment.options.length} options · signature required`
        : "Signature required";
  }
}
