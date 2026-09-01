import type { StudentHealthProfile } from "@/lib/student-health/types";
import { emptyStudentHealthProfile } from "@/lib/student-health/types";

export class StudentHealthFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudentHealthFetchError";
  }
}

export async function fetchStudentHealthProfile(
  organizationId: string,
  studentId: string,
): Promise<StudentHealthProfile> {
  const params = new URLSearchParams({ organizationId });
  const response = await fetch(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/health?${params.toString()}`,
  );
  const payload = (await response.json().catch(() => ({}))) as {
    profile?: StudentHealthProfile;
    error?: string;
  };

  if (!response.ok) {
    throw new StudentHealthFetchError(payload.error ?? "Failed to load health profile.");
  }

  return payload.profile ?? emptyStudentHealthProfile();
}

export async function createStudentHealthItemClient(
  organizationId: string,
  studentId: string,
  itemType: string,
  values: Record<string, unknown>,
) {
  const response = await fetch(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/health`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId, itemType, values }),
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new StudentHealthFetchError(
      typeof payload.error === "string" ? payload.error : "Failed to save health item.",
    );
  }
  return payload;
}

export async function updateStudentHealthItemClient(
  organizationId: string,
  studentId: string,
  itemId: string,
  itemType: string,
  values: Record<string, unknown>,
) {
  const response = await fetch(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/health/${encodeURIComponent(itemId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId, itemType, values }),
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new StudentHealthFetchError(
      typeof payload.error === "string" ? payload.error : "Failed to update health item.",
    );
  }
  return payload;
}

export async function deleteStudentHealthItemClient(
  organizationId: string,
  studentId: string,
  itemId: string,
) {
  const params = new URLSearchParams({ organizationId });
  const response = await fetch(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/health/${encodeURIComponent(itemId)}?${params.toString()}`,
    { method: "DELETE" },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new StudentHealthFetchError(
      typeof payload.error === "string" ? payload.error : "Failed to delete health item.",
    );
  }
  return payload;
}

function adminHealthBasePath(schoolSlug: string, studentId: string): string {
  return `/api/school/${encodeURIComponent(schoolSlug)}/students/${encodeURIComponent(studentId)}/health`;
}

export async function fetchStudentHealthProfileAdmin(
  schoolSlug: string,
  studentId: string,
): Promise<StudentHealthProfile> {
  const response = await fetch(adminHealthBasePath(schoolSlug, studentId));
  const payload = (await response.json().catch(() => ({}))) as {
    profile?: StudentHealthProfile;
    error?: string;
  };

  if (!response.ok) {
    throw new StudentHealthFetchError(payload.error ?? "Failed to load health profile.");
  }

  return payload.profile ?? emptyStudentHealthProfile();
}

export async function createStudentHealthItemAdmin(
  schoolSlug: string,
  studentId: string,
  itemType: string,
  values: Record<string, unknown>,
) {
  const response = await fetch(adminHealthBasePath(schoolSlug, studentId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemType, values }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new StudentHealthFetchError(
      typeof payload.error === "string" ? payload.error : "Failed to save health item.",
    );
  }
  return payload;
}

export async function updateStudentHealthItemAdmin(
  schoolSlug: string,
  studentId: string,
  itemId: string,
  itemType: string,
  values: Record<string, unknown>,
) {
  const response = await fetch(
    `${adminHealthBasePath(schoolSlug, studentId)}/${encodeURIComponent(itemId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemType, values }),
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new StudentHealthFetchError(
      typeof payload.error === "string" ? payload.error : "Failed to update health item.",
    );
  }
  return payload;
}

export async function deleteStudentHealthItemAdmin(
  schoolSlug: string,
  studentId: string,
  itemId: string,
) {
  const response = await fetch(
    `${adminHealthBasePath(schoolSlug, studentId)}/${encodeURIComponent(itemId)}`,
    { method: "DELETE" },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new StudentHealthFetchError(
      typeof payload.error === "string" ? payload.error : "Failed to delete health item.",
    );
  }
  return payload;
}

function teacherHealthBasePath(studentId: string): string {
  return `/api/teacher-portal/students/${encodeURIComponent(studentId)}/health`;
}

export async function fetchStudentHealthProfileTeacher(
  organizationId: string,
  studentId: string,
): Promise<StudentHealthProfile> {
  const params = new URLSearchParams({ organizationId });
  const response = await fetch(
    `${teacherHealthBasePath(studentId)}?${params.toString()}`,
  );
  const payload = (await response.json().catch(() => ({}))) as {
    profile?: StudentHealthProfile;
    error?: string;
  };

  if (!response.ok) {
    throw new StudentHealthFetchError(payload.error ?? "Failed to load health profile.");
  }

  return payload.profile ?? emptyStudentHealthProfile();
}

export async function createStudentHealthItemTeacher(
  organizationId: string,
  studentId: string,
  itemType: string,
  values: Record<string, unknown>,
) {
  const response = await fetch(teacherHealthBasePath(studentId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId, itemType, values }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new StudentHealthFetchError(
      typeof payload.error === "string" ? payload.error : "Failed to save health item.",
    );
  }
  return payload;
}

export async function updateStudentHealthItemTeacher(
  organizationId: string,
  studentId: string,
  itemId: string,
  itemType: string,
  values: Record<string, unknown>,
) {
  const response = await fetch(
    `${teacherHealthBasePath(studentId)}/${encodeURIComponent(itemId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId, itemType, values }),
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new StudentHealthFetchError(
      typeof payload.error === "string" ? payload.error : "Failed to update health item.",
    );
  }
  return payload;
}

export async function deleteStudentHealthItemTeacher(
  organizationId: string,
  studentId: string,
  itemId: string,
) {
  const params = new URLSearchParams({ organizationId });
  const response = await fetch(
    `${teacherHealthBasePath(studentId)}/${encodeURIComponent(itemId)}?${params.toString()}`,
    { method: "DELETE" },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new StudentHealthFetchError(
      typeof payload.error === "string" ? payload.error : "Failed to delete health item.",
    );
  }
  return payload;
}
