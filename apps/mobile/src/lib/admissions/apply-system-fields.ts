export const STUDENT_GRADE_OPTIONS = [
  { value: 'pk', label: 'Pre-K' },
  { value: 'k', label: 'Kindergarten' },
  { value: '1', label: '1st Grade' },
  { value: '2', label: '2nd Grade' },
  { value: '3', label: '3rd Grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
  { value: '9', label: '9th Grade' },
  { value: '10', label: '10th Grade' },
  { value: '11', label: '11th Grade' },
  { value: '12', label: '12th Grade' },
];

export type ExtractedStudentData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  grade: string;
};

function parseResponses(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (key === '__progress') continue;
    if (typeof entry === 'string') {
      result[key] = entry;
    } else if (entry != null) {
      result[key] = String(entry);
    }
  }
  return result;
}

export function extractStudentFromResponses(responses: unknown): ExtractedStudentData | null {
  const record = parseResponses(responses);
  const firstName = record.student_first_name?.trim() ?? '';
  const lastName = record.student_last_name?.trim() ?? '';
  const dateOfBirth = record.student_date_of_birth?.trim() ?? '';
  const grade = record.student_grade?.trim() ?? '';

  if (!firstName || !lastName || !dateOfBirth || !grade) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return null;
  }

  return { firstName, lastName, dateOfBirth, grade };
}
