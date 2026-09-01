export type HealthAllergySeverity = "low" | "medium" | "high";

export type HealthItemType = "allergy" | "medication" | "update";

export type HealthItemAddedBy = "parent" | "school";

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type HealthAllergyItem = {
  id: string;
  type: "allergy";
  allergen: string;
  severity: HealthAllergySeverity;
  treatmentNotes: string;
  updatedAt: string;
  addedBy: HealthItemAddedBy;
};

export type HealthMedicationItem = {
  id: string;
  type: "medication";
  name: string;
  dose: string;
  timeOfDay: string;
  daysOfWeek: Weekday[];
  instructions: string;
  startDate: string;
  endDate: string | null;
  ongoing: boolean;
  updatedAt: string;
  addedBy: HealthItemAddedBy;
};

export type HealthUpdateItem = {
  id: string;
  type: "update";
  title: string;
  details: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  addedBy: HealthItemAddedBy;
};

export type StudentHealthProfile = {
  allergies: HealthAllergyItem[];
  medications: HealthMedicationItem[];
  updates: HealthUpdateItem[];
};

export type HealthAttentionSummary = {
  activeMedicationCount: number;
  highSeverityAllergyCount: number;
  hasAttentionItems: boolean;
  attentionLabel: string | null;
};

export type HealthAllergyInput = Omit<HealthAllergyItem, "id" | "type" | "updatedAt" | "addedBy">;
export type HealthMedicationInput = Omit<
  HealthMedicationItem,
  "id" | "type" | "updatedAt" | "addedBy"
>;
export type HealthUpdateInput = Omit<HealthUpdateItem, "id" | "type" | "createdAt" | "addedBy">;

export type HealthItemInput =
  | { itemType: "allergy"; values: HealthAllergyInput }
  | { itemType: "medication"; values: HealthMedicationInput }
  | { itemType: "update"; values: HealthUpdateInput };

export type StudentHealthItemRow = {
  id: string;
  organization_id: string;
  student_id: string;
  item_type: HealthItemType;
  payload: Record<string, unknown>;
  start_date: string | null;
  end_date: string | null;
  ongoing: boolean;
  created_by_user_id: string | null;
  created_by_guardian_id: string | null;
  created_at: string;
  updated_at: string;
};

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const SCHOOL_WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export const SEVERITY_LABELS: Record<HealthAllergySeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function severityChipTone(
  severity: HealthAllergySeverity,
): "success" | "warning" | "alert" {
  switch (severity) {
    case "high":
      return "alert";
    case "medium":
      return "warning";
    default:
      return "success";
  }
}

export function formatHealthDate(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMedicationSchedule(item: HealthMedicationItem): string {
  const dayPart =
    item.daysOfWeek.length === SCHOOL_WEEKDAYS.length &&
    SCHOOL_WEEKDAYS.every((day) => item.daysOfWeek.includes(day))
      ? "Every school day"
      : item.daysOfWeek.map((day) => WEEKDAY_LABELS[day]).join("–");

  const parts = [item.timeOfDay, dayPart];
  if (item.dose.trim()) parts.push(item.dose);
  if (item.instructions.trim()) parts.push(item.instructions);
  return parts.filter(Boolean).join(" · ");
}

export function medicationStatusLabel(item: HealthMedicationItem): string {
  if (item.ongoing) return "Ongoing";
  if (item.endDate) return `Active until ${formatHealthDate(item.endDate)}`;
  return "Active";
}

export function medicationStatusTone(item: HealthMedicationItem): "success" | "info" {
  return item.ongoing ? "success" : "info";
}

export function isMedicationActive(item: HealthMedicationItem, today = new Date()): boolean {
  const todayStr = today.toISOString().slice(0, 10);
  if (item.startDate > todayStr) return false;
  if (item.ongoing || !item.endDate) return true;
  return item.endDate >= todayStr;
}

export function buildHealthAttentionSummary(profile: StudentHealthProfile): HealthAttentionSummary {
  const activeMedicationCount = profile.medications.filter((item) =>
    isMedicationActive(item),
  ).length;
  const highSeverityAllergyCount = profile.allergies.filter(
    (item) => item.severity === "high",
  ).length;

  let attentionLabel: string | null = null;
  if (activeMedicationCount > 0) {
    attentionLabel =
      activeMedicationCount === 1
        ? "1 medication scheduled at school"
        : `${activeMedicationCount} medications scheduled at school`;
  } else if (highSeverityAllergyCount > 0) {
    attentionLabel =
      highSeverityAllergyCount === 1
        ? "1 high-severity allergy on file"
        : `${highSeverityAllergyCount} high-severity allergies on file`;
  }

  return {
    activeMedicationCount,
    highSeverityAllergyCount,
    hasAttentionItems: attentionLabel !== null,
    attentionLabel,
  };
}

export function emptyStudentHealthProfile(): StudentHealthProfile {
  return { allergies: [], medications: [], updates: [] };
}

export function studentHasStandingHealthItems(profile: StudentHealthProfile): boolean {
  return profile.allergies.length > 0 || profile.medications.length > 0;
}

export function healthItemLabel(
  itemType: HealthItemType,
  payload: Record<string, unknown>,
): string {
  switch (itemType) {
    case "allergy":
      return String(payload.allergen ?? "Allergy").trim() || "Allergy";
    case "medication":
      return String(payload.name ?? "Medication").trim() || "Medication";
    default:
      return String(payload.title ?? "Health update").trim() || "Health update";
  }
}

export function healthItemTypeLabel(itemType: HealthItemType): string {
  switch (itemType) {
    case "allergy":
      return "allergy";
    case "medication":
      return "medication";
    default:
      return "health update";
  }
}
