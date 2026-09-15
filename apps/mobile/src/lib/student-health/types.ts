export type HealthAllergySeverity = 'low' | 'medium' | 'high';

export type HealthItemType = 'allergy' | 'medication' | 'update';

export type HealthItemAddedBy = 'parent' | 'school';

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type HealthAllergyItem = {
  id: string;
  type: 'allergy';
  allergen: string;
  severity: HealthAllergySeverity;
  treatmentNotes: string;
  updatedAt: string;
  addedBy: HealthItemAddedBy;
};

export type HealthMedicationItem = {
  id: string;
  type: 'medication';
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
  type: 'update';
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

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export const SEVERITY_LABELS: Record<HealthAllergySeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function emptyStudentHealthProfile(): StudentHealthProfile {
  return { allergies: [], medications: [], updates: [] };
}

export function studentHasStandingHealthItems(profile: StudentHealthProfile): boolean {
  return profile.allergies.length > 0 || profile.medications.length > 0;
}

export function healthItemTypeLabel(itemType: HealthItemType): string {
  switch (itemType) {
    case 'allergy':
      return 'allergy';
    case 'medication':
      return 'medication';
    default:
      return 'health update';
  }
}
