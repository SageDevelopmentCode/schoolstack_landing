import { throwPortalJsonApiError } from "@/lib/portal-json-api-error";
import type { TeacherMyHoursPageData } from "@/lib/school-teacher/my-hours/types";

export { PortalJsonApiError as TeacherMyHoursApiError } from "@/lib/portal-json-api-error";

export async function fetchTeacherMyHoursPageData(
  organizationId: string,
  options?: { from?: string; to?: string },
): Promise<TeacherMyHoursPageData> {
  const params = new URLSearchParams({ organizationId });
  if (options?.from) params.set("from", options.from);
  if (options?.to) params.set("to", options.to);

  const response = await fetch(
    `/api/teacher-portal/my-hours?${params.toString()}`,
    { credentials: "same-origin" },
  );

  const payload = (await response.json().catch(() => null)) as
    | TeacherMyHoursPageData
    | { error?: string; code?: string }
    | null;

  if (!response.ok) {
    throwPortalJsonApiError(payload, response.status, "Failed to load My Hours.");
  }

  return payload as TeacherMyHoursPageData;
}

export async function postTeacherMyHoursClockIn(
  organizationId: string,
): Promise<TeacherMyHoursPageData> {
  const response = await fetch("/api/teacher-portal/my-hours/clock-in", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId }),
  });

  const payload = (await response.json().catch(() => null)) as
    | TeacherMyHoursPageData
    | { error?: string; code?: string }
    | null;

  if (!response.ok) {
    throwPortalJsonApiError(payload, response.status, "Failed to clock in.");
  }

  return payload as TeacherMyHoursPageData;
}

export async function postTeacherMyHoursClockOut(
  organizationId: string,
): Promise<{ pageData: TeacherMyHoursPageData; sessionMinutes: number }> {
  const response = await fetch("/api/teacher-portal/my-hours/clock-out", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { pageData: TeacherMyHoursPageData; session?: { minutes: number } }
    | { error?: string; code?: string }
    | null;

  if (!response.ok) {
    throwPortalJsonApiError(payload, response.status, "Failed to clock out.");
  }

  const data = payload as {
    pageData: TeacherMyHoursPageData;
    session?: { minutes: number };
  };

  return {
    pageData: data.pageData,
    sessionMinutes: data.session?.minutes ?? 0,
  };
}
