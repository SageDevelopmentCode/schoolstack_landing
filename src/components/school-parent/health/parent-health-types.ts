export type HealthAllergySeverity = "low" | "medium" | "high";

export type HealthItemType = "allergy" | "medication" | "update";

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
};

export type HealthUpdateItem = {
  id: string;
  type: "update";
  title: string;
  details: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
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

export function createHealthItemId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
