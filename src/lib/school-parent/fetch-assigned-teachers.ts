import type { ParentAssignedTeacher } from "@/lib/admissions/parent-portal-access";

export async function fetchAssignedTeachersForStudent(
  organizationId: string,
  studentId: string,
): Promise<ParentAssignedTeacher[]> {
  const params = new URLSearchParams({ organizationId });
  const response = await fetch(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/teachers?${params.toString()}`,
  );

  const payload = (await response.json().catch(() => null)) as {
    teachers?: ParentAssignedTeacher[];
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Failed to load assigned teachers.");
  }

  return payload?.teachers ?? [];
}
