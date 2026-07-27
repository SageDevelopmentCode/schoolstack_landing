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

export function buildAgreementResponsesPatch(
  existingResponses: Record<string, unknown>,
  sectionSignatures: AgreementSectionSignature[],
  signerName?: string,
  consentValue?: string,
): Record<string, unknown> {
  return {
    ...existingResponses,
    sectionSignatures,
    ...(signerName ? { signerName } : {}),
    ...(consentValue ? { consentValue } : {}),
  };
}
