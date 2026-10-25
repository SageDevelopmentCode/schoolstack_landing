import type { PublicTourFieldDefinition } from "./public-tour-settings";
import { validatePublicTourAnswers } from "./public-tour-validation";

export function extractGuestContactEmail(
  fields: PublicTourFieldDefinition[],
  answers: Record<string, unknown>,
): string | null {
  const validation = validatePublicTourAnswers(fields, answers);
  if (!validation.ok) {
    return null;
  }
  const email = validation.registrant.contactEmail.trim();
  return email || null;
}
