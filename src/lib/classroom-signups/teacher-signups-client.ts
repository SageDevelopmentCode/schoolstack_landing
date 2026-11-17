import type { ClassroomSignup, ClassroomSignupDraft } from "./types";

const API = "/api/teacher-portal/classroom-signups";

export class SignupApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | null,
  ) {
    super(message);
    this.name = "SignupApiError";
  }
}

async function call<T>(url: string, init: RequestInit, fallback: string): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string; code?: string };
  if (!response.ok) {
    throw new SignupApiError(payload.error?.trim() || fallback, response.status, payload.code ?? null);
  }
  return payload;
}

/** POST a new signup as a draft or straight to open. */
export async function createTeacherSignup(
  organizationId: string,
  draft: ClassroomSignupDraft,
  status: "open" | "draft",
): Promise<ClassroomSignup> {
  const { signup } = await call<{ signup?: ClassroomSignup }>(
    API,
    {
      method: "POST",
      body: JSON.stringify({
        organizationId,
        title: draft.title,
        description: draft.description,
        signupType: draft.signupType,
        audience: draft.audience,
        classroomId: draft.classroomId,
        classroomIds: draft.classroomIds,
        classroomName: draft.classroomName,
        responseDeadline: draft.responseDeadline,
        config: draft.config,
        status,
      }),
    },
    status === "open" ? "Failed to publish signup." : "Failed to save draft.",
  );
  if (!signup) throw new SignupApiError(status === "open" ? "Failed to publish signup." : "Failed to save draft.", 500, null);
  return signup;
}

export async function updateTeacherSignup(
  organizationId: string,
  signupId: string,
  draft: ClassroomSignupDraft,
  status: ClassroomSignup["status"],
): Promise<ClassroomSignup> {
  const { signup } = await call<{ signup?: ClassroomSignup }>(
    `${API}/${signupId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        organizationId,
        update: {
          title: draft.title,
          description: draft.description,
          responseDeadline: draft.responseDeadline,
          signupType: draft.signupType,
          audience: draft.audience,
          classroomId: draft.classroomId,
          classroomIds: draft.classroomIds,
          config: draft.config,
          status,
        },
      }),
    },
    "Failed to save signup.",
  );
  if (!signup) throw new SignupApiError("Failed to save signup.", 500, null);
  return signup;
}

export async function closeTeacherSignup(organizationId: string, signupId: string): Promise<ClassroomSignup> {
  const { signup } = await call<{ signup?: ClassroomSignup }>(
    `${API}/${signupId}`,
    { method: "PATCH", body: JSON.stringify({ organizationId, status: "closed" }) },
    "Failed to close signup.",
  );
  if (!signup) throw new SignupApiError("Failed to close signup.", 500, null);
  return signup;
}

export type SignupReminderResult = {
  familiesNotified: number;
  emailsSent: number;
  emailsAttempted: number;
  pushRecipients: number;
};

export async function sendTeacherSignupReminder(
  organizationId: string,
  signupId: string,
  message: string,
): Promise<SignupReminderResult> {
  return call<SignupReminderResult>(
    `${API}/${signupId}/remind`,
    { method: "POST", body: JSON.stringify({ organizationId, message }) },
    "Failed to send the reminder.",
  );
}
