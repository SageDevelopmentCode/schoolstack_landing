export type AgreementSectionSignature = {
  sectionId: string;
  signerName: string;
  signedAt: string;
};

export type EnrollmentContractSection = {
  id: string;
  title: string;
};

export function parseAgreementSectionSignatures(
  responses: Record<string, unknown> | null | undefined,
): AgreementSectionSignature[] {
  const raw = responses?.sectionSignatures;
  if (!Array.isArray(raw)) return [];

  const signatures: AgreementSectionSignature[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const record = entry as Record<string, unknown>;
    if (
      typeof record.sectionId !== 'string' ||
      typeof record.signerName !== 'string' ||
      typeof record.signedAt !== 'string'
    ) {
      continue;
    }
    signatures.push({
      sectionId: record.sectionId,
      signerName: record.signerName,
      signedAt: record.signedAt,
    });
  }
  return signatures;
}

export function getAgreementSectionProgressLabel(
  sections: EnrollmentContractSection[],
  signatures: AgreementSectionSignature[],
): string {
  const total = sections.length;
  if (total === 0) return '';
  const signedIds = new Set(signatures.map((signature) => signature.sectionId));
  const signedCount = sections.filter((section) => signedIds.has(section.id)).length;
  const sectionWord = total === 1 ? 'section' : 'sections';
  return `${signedCount} of ${total} ${sectionWord} signed`;
}
