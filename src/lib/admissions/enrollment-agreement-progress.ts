import type {
  AgreementSectionSignature,
  EnrollmentContractSection,
} from "./enrollment-checklist-schema";

export function parseAgreementSectionSignatures(
  responses: Record<string, unknown> | null | undefined,
): AgreementSectionSignature[] {
  const raw = responses?.sectionSignatures;
  if (!Array.isArray(raw)) return [];

  const signatures: AgreementSectionSignature[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const record = entry as Record<string, unknown>;
    const sectionId = record.sectionId;
    const signerName = record.signerName;
    const signedAt = record.signedAt;
    if (
      typeof sectionId !== "string" ||
      typeof signerName !== "string" ||
      typeof signedAt !== "string"
    ) {
      continue;
    }
    signatures.push({ sectionId, signerName, signedAt });
  }
  return signatures;
}

export function signaturesBySectionId(
  signatures: AgreementSectionSignature[],
): Map<string, AgreementSectionSignature> {
  return new Map(signatures.map((signature) => [signature.sectionId, signature]));
}

export function mergeAgreementSectionSignature(
  existing: AgreementSectionSignature[],
  sectionId: string,
  signerName: string,
  signedAt: string = new Date().toISOString(),
): AgreementSectionSignature[] {
  const next = existing.filter((signature) => signature.sectionId !== sectionId);
  next.push({ sectionId, signerName, signedAt });
  return next;
}

export function allAgreementSectionsSigned(
  sections: EnrollmentContractSection[],
  signatures: AgreementSectionSignature[],
): boolean {
  if (sections.length === 0) return false;
  const signedIds = new Set(signatures.map((signature) => signature.sectionId));
  return sections.every((section) => signedIds.has(section.id));
}

export function getAgreementResumeSectionIndex(
  sections: EnrollmentContractSection[],
  signatures: AgreementSectionSignature[],
): number {
  if (sections.length === 0) return 0;

  const signedIds = new Set(signatures.map((signature) => signature.sectionId));
  const firstUnsignedIndex = sections.findIndex((section) => !signedIds.has(section.id));
  if (firstUnsignedIndex === -1) {
    return sections.length - 1;
  }
  return firstUnsignedIndex;
}

export function getAgreementSectionIndexById(
  sections: EnrollmentContractSection[],
  sectionId: string,
): number | null {
  const index = sections.findIndex((section) => section.id === sectionId);
  return index === -1 ? null : index;
}

export function getAgreementPendingResignSectionIndex(
  sections: EnrollmentContractSection[],
  pendingResignSectionIds: string[],
): number | null {
  if (pendingResignSectionIds.length === 0) return null;

  const pendingSet = new Set(pendingResignSectionIds);
  const index = sections.findIndex((section) => pendingSet.has(section.id));
  return index === -1 ? null : index;
}

export function isAgreementSectionPendingResign(
  sectionId: string,
  pendingResignSectionIds: string[],
): boolean {
  return pendingResignSectionIds.includes(sectionId);
}

export function getAgreementInitialSectionIndex(
  sections: EnrollmentContractSection[],
  signatures: AgreementSectionSignature[],
  pendingResignSectionIds: string[],
  explicitSectionId?: string | null,
): number {
  if (sections.length === 0) return 0;

  if (explicitSectionId) {
    const explicitIndex = getAgreementSectionIndexById(sections, explicitSectionId);
    if (explicitIndex != null) return explicitIndex;
  }

  const pendingIndex = getAgreementPendingResignSectionIndex(sections, pendingResignSectionIds);
  if (pendingIndex != null) return pendingIndex;

  return getAgreementResumeSectionIndex(sections, signatures);
}

export function getAgreementSectionProgressLabel(
  sections: EnrollmentContractSection[],
  signatures: AgreementSectionSignature[],
): string {
  const total = sections.length;
  if (total === 0) return "";

  const signedIds = new Set(signatures.map((signature) => signature.sectionId));
  const signedCount = sections.filter((section) => signedIds.has(section.id)).length;
  const sectionWord = total === 1 ? "section" : "sections";
  return `${signedCount} of ${total} ${sectionWord} signed`;
}

export function parseAgreementConsentValue(
  responses: Record<string, unknown> | null | undefined,
): string | null {
  const value = responses?.consentValue;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parsePendingResignSectionIds(
  responses: Record<string, unknown> | null | undefined,
): string[] {
  const raw = responses?.pendingResignSectionIds;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    .map((entry) => entry.trim());
}

export function parseAmendmentNotice(
  responses: Record<string, unknown> | null | undefined,
): string | null {
  const value = responses?.amendmentNotice;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parseSignedContentRevision(
  responses: Record<string, unknown> | null | undefined,
): number | null {
  const value = responses?.signedContentRevision;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function hasPendingAgreementResign(
  responses: Record<string, unknown> | null | undefined,
): boolean {
  return parsePendingResignSectionIds(responses).length > 0;
}

export function areAllPendingResignSectionsSigned(
  pendingResignSectionIds: string[],
  signatures: AgreementSectionSignature[],
): boolean {
  if (pendingResignSectionIds.length === 0) return true;
  const signedIds = new Set(signatures.map((signature) => signature.sectionId));
  return pendingResignSectionIds.every((sectionId) => signedIds.has(sectionId));
}

export function shouldClearAgreementAmendmentAfterSectionSave(
  isComplete: boolean,
  priorPendingResignSectionIds: string[],
  nextPendingResignSectionIds: string[],
): boolean {
  return (
    isComplete ||
    (priorPendingResignSectionIds.length > 0 && nextPendingResignSectionIds.length === 0)
  );
}

export function buildAgreementResponsesPatch(
  existingResponses: Record<string, unknown>,
  sectionSignatures: AgreementSectionSignature[],
  signerName?: string,
  consentValue?: string,
  options?: {
    clearAmendment?: boolean;
    signedContentRevision?: number;
  },
): Record<string, unknown> {
  const next: Record<string, unknown> = {
    ...existingResponses,
    sectionSignatures,
    ...(signerName ? { signerName } : {}),
    ...(consentValue ? { consentValue } : {}),
  };

  if (options?.clearAmendment) {
    delete next.amendmentNotice;
    delete next.pendingResignSectionIds;
  }

  if (options?.signedContentRevision != null) {
    next.signedContentRevision = options.signedContentRevision;
  }

  return next;
}
