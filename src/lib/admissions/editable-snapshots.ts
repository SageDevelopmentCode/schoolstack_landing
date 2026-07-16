import type {
  ApplicationFormFeeConfig,
  ApplicationFormNotificationConfig,
  ApplicationFormPostSubmitConfig,
  ApplicationFormSchema,
} from "./application-form-schema";
import type { EnrollmentChecklistItem } from "./enrollment-checklist-schema";

export type EditableFormSnapshot = {
  title: string;
  intro: string;
  programId: string | null;
  publicSlug: string;
  schema: ApplicationFormSchema;
  feeConfig: ApplicationFormFeeConfig;
  postSubmitConfig: ApplicationFormPostSubmitConfig;
  notificationConfig: ApplicationFormNotificationConfig;
};

export type ChecklistEditableSnapshot = {
  name: string;
  programId: string | null;
  items: EnrollmentChecklistItem[];
};

export function serializeEditableFormState(state: EditableFormSnapshot): string {
  return JSON.stringify(state);
}

export function serializeChecklistEditableState(
  state: ChecklistEditableSnapshot,
): string {
  return JSON.stringify(state);
}
