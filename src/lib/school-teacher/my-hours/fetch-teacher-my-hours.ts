import type { TeacherMyHoursPageData } from "@/lib/school-teacher/my-hours/types";

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
    const message =
      payload && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "Failed to load My Hours.";
    throw new Error(message);
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
    | { error?: string }
    | null;

  if (!response.ok) {
    const message =
      payload && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "Failed to clock in.";
    throw new Error(message);
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
    | { error?: string }
    | null;

  if (!response.ok) {
    const message =
      payload && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "Failed to clock out.";
    throw new Error(message);
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
