import type { ApplicationFormSchema } from "./application-form-schema";

export type Parent2FieldValues = {
  firstName: string;
  lastName: string;
  email: string;
};

const PARENT2_PREFIX = "Parent 2:";

function fieldValueByLabel(
  schema: ApplicationFormSchema,
  responses: Record<string, string>,
  labelSuffix: string,
): string {
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.label === `${PARENT2_PREFIX} ${labelSuffix}`) {
        return String(responses[field.id] ?? "").trim();
      }
    }
  }

  return "";
}

export function extractParent2FromApplication(
  schema: ApplicationFormSchema,
  responses: Record<string, string>,
): Parent2FieldValues | null {
  const firstName = fieldValueByLabel(schema, responses, "First name");
  const lastName = fieldValueByLabel(schema, responses, "Last name");
  const email = fieldValueByLabel(schema, responses, "Email address");

  if (!firstName && !lastName && !email) {
    return null;
  }

  return { firstName, lastName, email };
}
