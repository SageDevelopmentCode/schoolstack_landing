import type { ApplicationSection } from "./application-form-schema";
import { newAdmissionsId } from "./application-form-schema";

export type ChecklistItemType =
  | "document_sign"
  | "document_sign_pdf"
  | "form"
  | "file_upload"
  | "payment"
  | "acknowledgment";

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
  storagePath?: string;
  mimeType?: string;
  sizeBytes?: number;
  requireSignature?: boolean;
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
  document?: DocumentConfig;
  formSchema?: ApplicationSection;
  fileUpload?: ChecklistFileUploadConfig;
  payment?: ChecklistPaymentConfig;
  acknowledgment?: ChecklistAcknowledgmentConfig;
  metadata: Record<string, unknown>;
};

export const CHECKLIST_ITEM_TYPE_LABELS: Record<ChecklistItemType, string> = {
  document_sign: "Agreement",
  document_sign_pdf: "Agreement PDF",
  form: "Form",
  file_upload: "File upload",
  payment: "Payment",
  acknowledgment: "Acknowledgment",
};

export function isPdfAgreementItem(item: EnrollmentChecklistItem): boolean {
  return (
    item.type === "document_sign_pdf" ||
    (item.type === "document_sign" && item.document?.kind === "pdf")
  );
}

export function isInlineAgreementItem(item: EnrollmentChecklistItem): boolean {
  return (
    item.type === "document_sign" &&
    (!item.document || item.document.kind === "inline_sections")
  );
}

const CHECKLIST_ITEM_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isChecklistItemId(value: string): boolean {
  return CHECKLIST_ITEM_ID_PATTERN.test(value);
}

export function newChecklistItemId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function createChecklistItemKey(label: string): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
  return base || `item_${newAdmissionsId().slice(0, 8)}`;
}

export function createChecklistItemKeyForItem(
  label: string,
  itemId: string,
): string {
  const suffix = itemId.replace(/-/g, "").slice(0, 8);
  const base = createChecklistItemKey(label).slice(0, 40 - suffix.length - 1);
  return `${base}_${suffix}`;
}

export function createBlankChecklistItem(
  type: ChecklistItemType,
  label?: string,
): EnrollmentChecklistItem {
  const resolvedLabel = label ?? CHECKLIST_ITEM_TYPE_LABELS[type];
  const id = newChecklistItemId();
  const item: EnrollmentChecklistItem = {
    id,
    itemKey: createChecklistItemKeyForItem(resolvedLabel, id),
    label: resolvedLabel,
    type,
    required: true,
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
    case "document_sign_pdf":
      item.document = {
        kind: "pdf",
        fileName: "",
        requireSignature: true,
      };
      break;
    case "form":
      item.formSchema = {
        id: newAdmissionsId(),
        title: resolvedLabel,
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

export function getChecklistItemSummary(item: EnrollmentChecklistItem): string {
  switch (item.type) {
    case "document_sign": {
      if (!item.document || item.document.kind !== "inline_sections") {
        return "Agreement";
      }
      const count = item.document.sections.length;
      return `${count} section${count === 1 ? "" : "s"} · signatures required`;
    }
    case "document_sign_pdf": {
      if (!item.document || item.document.kind !== "pdf") {
        return "Agreement PDF";
      }
      return item.document.fileName
        ? `PDF · ${item.document.fileName}`
        : "PDF · no file selected";
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
