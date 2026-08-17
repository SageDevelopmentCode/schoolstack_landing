import type {
  EnrollmentChecklistItem,
  EnrollmentContractSection,
} from "./enrollment-checklist-schema";
import { isInlineAgreementItem } from "./enrollment-checklist-schema";

export type EnrollmentDocumentSectionChange = {
  sectionId: string;
  sectionTitle: string;
};

export type EnrollmentDocumentChange = {
  checklistItemId: string;
  checklistItemLabel: string;
  documentTemplateId: string | null;
  changedSections: EnrollmentDocumentSectionChange[];
};

function inlineSectionsFromItem(
  item: EnrollmentChecklistItem,
): EnrollmentContractSection[] {
  if (!isInlineAgreementItem(item) || !item.document || item.document.kind !== "inline_sections") {
    return [];
  }
  return item.document.sections;
}

function documentTemplateIdFromItem(item: EnrollmentChecklistItem): string | null {
  const raw = item.metadata.documentTemplateId;
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export function summarizeEnrollmentDocumentChanges(
  beforeItems: EnrollmentChecklistItem[],
  afterItems: EnrollmentChecklistItem[],
): EnrollmentDocumentChange[] {
  const beforeById = new Map(beforeItems.map((item) => [item.id, item]));
  const changes: EnrollmentDocumentChange[] = [];

  for (const afterItem of afterItems) {
    if (!isInlineAgreementItem(afterItem)) continue;

    const beforeItem = beforeById.get(afterItem.id);
    const beforeSections = beforeItem ? inlineSectionsFromItem(beforeItem) : [];
    const afterSections = inlineSectionsFromItem(afterItem);

    const beforeBySectionId = new Map(
      beforeSections.map((section) => [section.id, section]),
    );
    const changedSections: EnrollmentDocumentSectionChange[] = [];

    for (const afterSection of afterSections) {
      const beforeSection = beforeBySectionId.get(afterSection.id);
      if (!beforeSection) {
        changedSections.push({
          sectionId: afterSection.id,
          sectionTitle: afterSection.title,
        });
        continue;
      }

      if (beforeSection.body !== afterSection.body || beforeSection.title !== afterSection.title) {
        changedSections.push({
          sectionId: afterSection.id,
          sectionTitle: afterSection.title,
        });
      }
    }

    if (changedSections.length === 0) continue;

    changes.push({
      checklistItemId: afterItem.id,
      checklistItemLabel: afterItem.label,
      documentTemplateId: documentTemplateIdFromItem(afterItem),
      changedSections,
    });
  }

  return changes;
}

export function inlineSectionBodiesEqual(
  beforeSections: EnrollmentContractSection[],
  afterSections: EnrollmentContractSection[],
): boolean {
  const beforeById = new Map(beforeSections.map((section) => [section.id, section]));
  for (const afterSection of afterSections) {
    const beforeSection = beforeById.get(afterSection.id);
    if (!beforeSection) return false;
    if (
      beforeSection.body !== afterSection.body ||
      beforeSection.title !== afterSection.title
    ) {
      return false;
    }
  }
  return true;
}
