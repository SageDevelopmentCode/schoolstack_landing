import type { ApplicationField, ApplicationFieldType } from "./application-form-schema";
import { newAdmissionsId } from "./application-form-schema";

export type ApplicationFieldPreset = Omit<ApplicationField, "id">;

export const APPLICATION_FIELD_PRESETS: ApplicationFieldPreset[] = [
  { label: "First Name", type: "text", required: true, width: "half" },
  { label: "Last Name", type: "text", required: true, width: "half" },
  { label: "Email", type: "email", required: true, width: "half" },
  { label: "Phone", type: "tel", required: false, width: "half" },
  { label: "Child's Name", type: "text", required: true },
  { label: "Date of Birth", type: "date", required: true, width: "half" },
  {
    label: "Grade Level",
    type: "select",
    required: true,
    width: "half",
    options: [
      { value: "k", label: "Kindergarten" },
      { value: "1", label: "1st Grade" },
      { value: "2", label: "2nd Grade" },
      { value: "3", label: "3rd Grade" },
    ],
  },
  {
    label: "Preferred Program",
    type: "select",
    required: true,
    options: [
      { value: "full-day", label: "Full Day" },
      { value: "half-day", label: "Half Day" },
    ],
  },
  { label: "Preferred Start Date", type: "date", required: false },
  { label: "Interested in Financial Aid", type: "checkbox", required: false },
  { label: "How did you hear about us?", type: "text", required: false },
  { label: "Supporting documents", type: "file", required: false },
];

export function fieldFromPreset(preset: ApplicationFieldPreset): ApplicationField {
  return {
    id: newAdmissionsId(),
    ...preset,
    options: preset.options ? [...preset.options] : undefined,
  };
}

export function fieldTypeLabel(type: ApplicationFieldType): string {
  const match = [
    { value: "text", label: "Short text" },
    { value: "email", label: "Email" },
    { value: "tel", label: "Phone" },
    { value: "date", label: "Date" },
    { value: "select", label: "Dropdown" },
    { value: "textarea", label: "Long text" },
    { value: "radio", label: "Multiple choice" },
    { value: "checkbox", label: "Checkbox" },
    { value: "file", label: "File upload" },
  ].find((item) => item.value === type);
  return match?.label ?? type;
}
