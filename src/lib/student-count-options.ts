export type StudentCountId = "0-10" | "11-25" | "26-75" | "76+";

/** Student count ranges (stored as `demo_requests.student_count` and `free_school_signup_details.student_count`). */
export const STUDENT_COUNT_OPTIONS: { id: StudentCountId; label: string; shortLabel: string }[] = [
  { id: "0-10", label: "0–10 students", shortLabel: "0–10" },
  { id: "11-25", label: "11–25 students", shortLabel: "11–25" },
  { id: "26-75", label: "26–75 students", shortLabel: "26–75" },
  { id: "76+", label: "76+ students", shortLabel: "76+" },
];

export const STUDENT_COUNTS: Record<string, string> = Object.fromEntries(
  STUDENT_COUNT_OPTIONS.map((option) => [option.id, option.label]),
);

export function isStudentCountId(value: unknown): value is StudentCountId {
  return typeof value === "string" && STUDENT_COUNT_OPTIONS.some((option) => option.id === value);
}
