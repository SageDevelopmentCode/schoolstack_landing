import type {
  HealthAllergyInput,
  HealthItemInput,
  HealthItemType,
  HealthMedicationInput,
  HealthUpdateInput,
  Weekday,
} from "@/lib/student-health/types";
import { WEEKDAYS } from "@/lib/student-health/types";

export class StudentHealthValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudentHealthValidationError";
  }
}

function requireNonEmpty(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new StudentHealthValidationError(`${field} is required.`);
  }
  return trimmed;
}

function parseIsoDate(value: string | null | undefined, field: string): string | null {
  if (value == null || value === "") return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new StudentHealthValidationError(`${field} must be a valid date.`);
  }
  return trimmed;
}

function parseWeekdays(value: unknown): Weekday[] {
  if (!Array.isArray(value)) {
    throw new StudentHealthValidationError("Days of the week are required.");
  }
  const days = value.filter((day): day is Weekday => WEEKDAYS.includes(day as Weekday));
  if (days.length === 0) {
    throw new StudentHealthValidationError("Select at least one day of the week.");
  }
  return [...new Set(days)].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b));
}

function parseSeverity(value: unknown): HealthAllergyInput["severity"] {
  if (value === "low" || value === "medium" || value === "high") return value;
  return "medium";
}

export function parseHealthItemType(value: unknown): HealthItemType {
  if (value === "allergy" || value === "medication" || value === "update") return value;
  throw new StudentHealthValidationError("Invalid health item type.");
}

export function validateAllergyInput(raw: Record<string, unknown>): HealthAllergyInput {
  return {
    allergen: requireNonEmpty(String(raw.allergen ?? ""), "Allergen"),
    severity: parseSeverity(raw.severity),
    treatmentNotes: String(raw.treatmentNotes ?? "").trim(),
  };
}

export function validateMedicationInput(raw: Record<string, unknown>): HealthMedicationInput {
  const ongoing = Boolean(raw.ongoing);
  const startDate =
    parseIsoDate(String(raw.startDate ?? ""), "Start date") ??
    new Date().toISOString().slice(0, 10);
  const endDate = ongoing ? null : parseIsoDate(String(raw.endDate ?? ""), "End date");

  return {
    name: requireNonEmpty(String(raw.name ?? ""), "Medication name"),
    dose: String(raw.dose ?? "").trim(),
    timeOfDay: requireNonEmpty(String(raw.timeOfDay ?? ""), "Time at school"),
    daysOfWeek: parseWeekdays(raw.daysOfWeek),
    instructions: String(raw.instructions ?? "").trim(),
    startDate,
    endDate,
    ongoing,
  };
}

export function validateUpdateInput(raw: Record<string, unknown>): HealthUpdateInput {
  const startDate =
    parseIsoDate(String(raw.startDate ?? ""), "Effective from") ??
    new Date().toISOString().slice(0, 10);
  const endDate = parseIsoDate(String(raw.endDate ?? ""), "Effective through");

  return {
    title: requireNonEmpty(String(raw.title ?? ""), "Update title"),
    details: String(raw.details ?? "").trim(),
    startDate,
    endDate: endDate ?? startDate,
  };
}

export function validateHealthItemInput(
  itemType: HealthItemType,
  rawValues: Record<string, unknown>,
): HealthItemInput {
  switch (itemType) {
    case "allergy":
      return { itemType, values: validateAllergyInput(rawValues) };
    case "medication":
      return { itemType, values: validateMedicationInput(rawValues) };
    default:
      return { itemType, values: validateUpdateInput(rawValues) };
  }
}
