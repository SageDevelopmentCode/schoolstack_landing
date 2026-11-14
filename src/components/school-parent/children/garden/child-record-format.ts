import { extractStudentFromResponses } from "@/lib/admissions/apply-system-fields";
import type { ApplicationDetail } from "@/lib/admissions/parent-portal-access";

/** "March 4, 2019" from a YYYY-MM-DD birth date (moved from the record header). */
export function formatBirthDate(value: string): string | null {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function calculateAge(value: string): number | null {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const birth = new Date(y, m - 1, d);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age >= 0 ? age : null;
}

/** Name, grade and birth details from the application's student answers. */
export function applicationStudentFacts(application: ApplicationDetail | null | undefined) {
  const student = application ? extractStudentFromResponses(application.responses) : null;
  return {
    student,
    fullName: student ? `${student.firstName} ${student.lastName}` : "Student",
    birthDate: student ? formatBirthDate(student.dateOfBirth) : null,
    age: student ? calculateAge(student.dateOfBirth) : null,
  };
}
