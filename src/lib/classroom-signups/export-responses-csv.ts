import type { ClassroomSignup, ClassroomSignupResponse } from "./types";

function cell(value: string): string {
  // Neutralise spreadsheet formulas, then quote.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** What the family signed up for, in words (slot labels, role names or their note). */
export function describeSignupSelection(signup: ClassroomSignup, response: ClassroomSignupResponse): string {
  if (signup.signupType === "time_slots") {
    const slots = signup.config.slots ?? [];
    return response.selectedSlotIds.map((id) => slots.find((s) => s.id === id)?.label || id).join(", ");
  }
  if (signup.signupType === "roles") {
    const roles = signup.config.roles ?? [];
    return response.selectedRoleIds.map((id) => roles.find((r) => r.id === id)?.name || id).join(", ");
  }
  return "Signed up";
}

/** CSV of confirmed responses: Family, Guardian, Email, Student, Signed up for, Note, Submitted. */
export function buildSignupResponsesCsv(signup: ClassroomSignup, responses: ClassroomSignupResponse[]): string {
  const header = ["Family", "Guardian", "Email", "Student", "Signed up for", "Note", "Submitted"];
  const rows = responses
    .filter((response) => response.status === "confirmed")
    .map((response) => [
      response.familyName,
      response.guardianName,
      response.guardianEmail,
      response.studentName,
      describeSignupSelection(signup, response),
      response.note ?? "",
      response.createdAt ? new Date(response.createdAt).toISOString().slice(0, 10) : "",
    ]);
  return [header, ...rows].map((row) => row.map((value) => cell(String(value ?? ""))).join(",")).join("\r\n");
}

/** "reading-buddies-responses.csv" */
export function signupResponsesCsvFilename(signup: Pick<ClassroomSignup, "title">): string {
  const slug = signup.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug || "signup"}-responses.csv`;
}
