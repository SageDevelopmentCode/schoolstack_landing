import type {
  ApplicationField,
  ApplicationFormSchema,
  ApplicationSection,
} from "./application-form-schema";
import { newAdmissionsId } from "./application-form-schema";

export const APPLY_SYSTEM_SECTION_TITLE = "Student information";

export const APPLY_SYSTEM_FIELD_IDS = [
  "student_first_name",
  "student_last_name",
  "student_date_of_birth",
  "student_grade",
] as const;

export type ApplySystemFieldId = (typeof APPLY_SYSTEM_FIELD_IDS)[number];

export const APPLY_SYSTEM_PARENT_DESCRIPTION =
  "Tell us about the student you're applying for. This information is saved to your school's records when you submit.";

export const APPLY_SYSTEM_ADMIN_CALLOUT =
  "These questions create a student record in your school directory when a family submits. They cannot be removed because admissions, submissions, and enrollment depend on consistent student data.";

const GRADE_OPTIONS = [
  { value: "pk", label: "Pre-K" },
  { value: "k", label: "Kindergarten" },
  { value: "1", label: "1st Grade" },
  { value: "2", label: "2nd Grade" },
  { value: "3", label: "3rd Grade" },
  { value: "4", label: "4th Grade" },
  { value: "5", label: "5th Grade" },
  { value: "6", label: "6th Grade" },
  { value: "7", label: "7th Grade" },
  { value: "8", label: "8th Grade" },
  { value: "9", label: "9th Grade" },
  { value: "10", label: "10th Grade" },
  { value: "11", label: "11th Grade" },
  { value: "12", label: "12th Grade" },
];

function buildSystemField(id: ApplySystemFieldId): ApplicationField {
  switch (id) {
    case "student_first_name":
      return {
        id,
        label: "Student first name",
        type: "text",
        required: true,
        width: "half",
        system: true,
      };
    case "student_last_name":
      return {
        id,
        label: "Student last name",
        type: "text",
        required: true,
        width: "half",
        system: true,
      };
    case "student_date_of_birth":
      return {
        id,
        label: "Date of birth",
        type: "date",
        required: true,
        width: "half",
        system: true,
      };
    case "student_grade":
      return {
        id,
        label: "Grade level",
        type: "select",
        required: true,
        width: "half",
        options: GRADE_OPTIONS,
        system: true,
      };
    default:
      throw new Error(`Unknown system field: ${id}`);
  }
}

export function isSystemFieldId(id: string): id is ApplySystemFieldId {
  return (APPLY_SYSTEM_FIELD_IDS as readonly string[]).includes(id);
}

export function isSystemSection(section: ApplicationSection): boolean {
  return section.system === true;
}

export function findSystemSection(
  schema: ApplicationFormSchema,
): ApplicationSection | undefined {
  return schema.sections.find(isSystemSection);
}

export function buildApplySystemSection(): ApplicationSection {
  return {
    id: newAdmissionsId(),
    title: APPLY_SYSTEM_SECTION_TITLE,
    system: true,
    description: APPLY_SYSTEM_PARENT_DESCRIPTION,
    fields: APPLY_SYSTEM_FIELD_IDS.map(buildSystemField),
  };
}

export function emptyApplyCustomSection(title = "Step 2"): ApplicationSection {
  return {
    id: newAdmissionsId(),
    title,
    fields: [],
  };
}

function mergeSystemFields(section: ApplicationSection): ApplicationSection {
  const canonicalFields = APPLY_SYSTEM_FIELD_IDS.map((id) => {
    const existing = section.fields.find((field) => field.id === id);
    const canonical = buildSystemField(id);
    return existing
      ? {
          ...canonical,
          ...existing,
          id,
          type: canonical.type,
          required: true,
          system: true,
          options: canonical.options ?? existing.options,
        }
      : canonical;
  });

  return {
    ...section,
    system: true,
    title: section.title?.trim() || APPLY_SYSTEM_SECTION_TITLE,
    description: section.description?.trim() || APPLY_SYSTEM_PARENT_DESCRIPTION,
    stepNotice: undefined,
    fields: canonicalFields,
  };
}

export function ensureApplySystemSchema(
  schema: ApplicationFormSchema,
): ApplicationFormSchema {
  const systemSection = findSystemSection(schema);

  if (!systemSection) {
    return {
      ...schema,
      sections: [buildApplySystemSection(), ...schema.sections],
    };
  }

  const merged = mergeSystemFields(systemSection);
  const otherSections = schema.sections.filter((section) => !isSystemSection(section));

  return {
    ...schema,
    sections: [merged, ...otherSections],
  };
}

export function applySystemSchemaChanged(
  before: ApplicationFormSchema,
  after: ApplicationFormSchema,
): boolean {
  return JSON.stringify(before) !== JSON.stringify(after);
}

export function validateApplySystemSchema(schema: ApplicationFormSchema): string[] {
  const errors: string[] = [];
  const systemSection = findSystemSection(schema);

  if (!systemSection) {
    errors.push("Apply forms must include a Student information step.");
    return errors;
  }

  if (schema.sections[0]?.id !== systemSection.id) {
    errors.push("The Student information step must be the first step.");
  }

  for (const fieldId of APPLY_SYSTEM_FIELD_IDS) {
    const field = systemSection.fields.find((entry) => entry.id === fieldId);
    if (!field) {
      errors.push(`Missing required system field: ${fieldId}.`);
      continue;
    }
    if (!field.required) {
      errors.push(`"${field.label}" must be required.`);
    }
    const canonical = buildSystemField(fieldId);
    if (field.type !== canonical.type) {
      errors.push(`"${field.label}" must use the ${canonical.type} field type.`);
    }
  }

  return errors;
}

export type ExtractedStudentData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  grade: string;
};

function parseResponses(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (key === "__progress") continue;
    if (typeof entry === "string") {
      result[key] = entry;
    } else if (entry != null) {
      result[key] = String(entry);
    }
  }
  return result;
}

export function extractStudentFromResponses(
  responses: unknown,
): ExtractedStudentData | null {
  const record = parseResponses(responses);
  const firstName = record.student_first_name?.trim() ?? "";
  const lastName = record.student_last_name?.trim() ?? "";
  const dateOfBirth = record.student_date_of_birth?.trim() ?? "";
  const grade = record.student_grade?.trim() ?? "";

  if (!firstName || !lastName || !dateOfBirth || !grade) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return null;
  }

  return { firstName, lastName, dateOfBirth, grade };
}

export function validateStudentResponses(responses: unknown): string | null {
  const student = extractStudentFromResponses(responses);
  if (!student) {
    return "Please complete all student information fields before submitting.";
  }
  return null;
}
