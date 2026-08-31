import type {
  HealthAllergyItem,
  HealthAllergySeverity,
  HealthItemAddedBy,
  HealthItemType,
  HealthMedicationItem,
  HealthUpdateItem,
  StudentHealthItemRow,
  StudentHealthProfile,
  Weekday,
} from "@/lib/student-health/types";
import { WEEKDAYS } from "@/lib/student-health/types";

function isoDateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asSeverity(value: unknown): HealthAllergySeverity {
  if (value === "low" || value === "medium" || value === "high") return value;
  return "medium";
}

function asWeekdays(value: unknown): Weekday[] {
  if (!Array.isArray(value)) return [];
  return value.filter((day): day is Weekday => WEEKDAYS.includes(day as Weekday));
}

function resolveAddedBy(row: StudentHealthItemRow): HealthItemAddedBy {
  return row.created_by_guardian_id != null ? "parent" : "school";
}

export function mapStudentHealthItemRow(row: StudentHealthItemRow): HealthAllergyItem | HealthMedicationItem | HealthUpdateItem {
  const payload = row.payload ?? {};
  const updatedAt = isoDateOnly(row.updated_at) ?? row.updated_at.slice(0, 10);

  const addedBy = resolveAddedBy(row);

  if (row.item_type === "allergy") {
    return {
      id: row.id,
      type: "allergy",
      allergen: asString(payload.allergen),
      severity: asSeverity(payload.severity),
      treatmentNotes: asString(payload.treatmentNotes),
      updatedAt,
      addedBy,
    };
  }

  if (row.item_type === "medication") {
    return {
      id: row.id,
      type: "medication",
      name: asString(payload.name),
      dose: asString(payload.dose),
      timeOfDay: asString(payload.timeOfDay),
      daysOfWeek: asWeekdays(payload.daysOfWeek),
      instructions: asString(payload.instructions),
      startDate: isoDateOnly(row.start_date) ?? asString(payload.startDate),
      endDate: row.ongoing ? null : isoDateOnly(row.end_date),
      ongoing: row.ongoing,
      updatedAt,
      addedBy,
    };
  }

  return {
    id: row.id,
    type: "update",
    title: asString(payload.title),
    details: asString(payload.details),
    startDate: isoDateOnly(row.start_date) ?? asString(payload.startDate),
    endDate: isoDateOnly(row.end_date),
    createdAt: isoDateOnly(row.created_at) ?? row.created_at.slice(0, 10),
    addedBy,
  };
}

export function buildStudentHealthProfile(rows: StudentHealthItemRow[]): StudentHealthProfile {
  const profile: StudentHealthProfile = {
    allergies: [],
    medications: [],
    updates: [],
  };

  for (const row of rows) {
    const item = mapStudentHealthItemRow(row);
    if (item.type === "allergy") profile.allergies.push(item);
    else if (item.type === "medication") profile.medications.push(item);
    else profile.updates.push(item);
  }

  profile.allergies.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  profile.medications.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  profile.updates.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return profile;
}

export function allergyPayload(input: {
  allergen: string;
  severity: HealthAllergySeverity;
  treatmentNotes: string;
}): Record<string, unknown> {
  return {
    allergen: input.allergen,
    severity: input.severity,
    treatmentNotes: input.treatmentNotes,
  };
}

export function medicationPayload(input: {
  name: string;
  dose: string;
  timeOfDay: string;
  daysOfWeek: Weekday[];
  instructions: string;
}): Record<string, unknown> {
  return {
    name: input.name,
    dose: input.dose,
    timeOfDay: input.timeOfDay,
    daysOfWeek: input.daysOfWeek,
    instructions: input.instructions,
  };
}

export function updatePayload(input: {
  title: string;
  details: string;
}): Record<string, unknown> {
  return {
    title: input.title,
    details: input.details,
  };
}

export function removeHealthItemFromProfile(
  profile: StudentHealthProfile,
  itemId: string,
  itemType: HealthItemType,
): StudentHealthProfile {
  if (itemType === "allergy") {
    return {
      ...profile,
      allergies: profile.allergies.filter((item) => item.id !== itemId),
    };
  }
  if (itemType === "medication") {
    return {
      ...profile,
      medications: profile.medications.filter((item) => item.id !== itemId),
    };
  }
  return {
    ...profile,
    updates: profile.updates.filter((item) => item.id !== itemId),
  };
}

export function mergeHealthItemIntoProfile(
  profile: StudentHealthProfile,
  item: HealthAllergyItem | HealthMedicationItem | HealthUpdateItem,
): StudentHealthProfile {
  if (item.type === "allergy") {
    const allergies = profile.allergies.some((entry) => entry.id === item.id)
      ? profile.allergies.map((entry) => (entry.id === item.id ? item : entry))
      : [...profile.allergies, item];
    allergies.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return { ...profile, allergies };
  }

  if (item.type === "medication") {
    const medications = profile.medications.some((entry) => entry.id === item.id)
      ? profile.medications.map((entry) => (entry.id === item.id ? item : entry))
      : [...profile.medications, item];
    medications.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return { ...profile, medications };
  }

  const updates = profile.updates.some((entry) => entry.id === item.id)
    ? profile.updates.map((entry) => (entry.id === item.id ? item : entry))
    : [item, ...profile.updates];
  updates.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { ...profile, updates };
}
