import {
  ACTIVITY_ACTIONS,
  type ActivitySurface,
  type AuthActivityMetadata,
} from "@/lib/activity-log";

export const CLIENT_AUTH_ACTIVITY_ACTIONS = {
  OTP_VERIFIED: ACTIVITY_ACTIONS.AUTH_OTP_VERIFIED,
  OTP_FAILED: ACTIVITY_ACTIONS.AUTH_OTP_FAILED,
  SIGNED_IN: ACTIVITY_ACTIONS.AUTH_SIGNED_IN,
  SIGNED_OUT: ACTIVITY_ACTIONS.AUTH_SIGNED_OUT,
  SESSION_RESTORED: ACTIVITY_ACTIONS.AUTH_SESSION_RESTORED,
} as const;

export type ClientAuthActivityAction =
  (typeof CLIENT_AUTH_ACTIVITY_ACTIONS)[keyof typeof CLIENT_AUTH_ACTIVITY_ACTIONS];

export type ReportAuthActivityInput = {
  action: ClientAuthActivityAction;
  organizationId?: string;
  surface: ActivitySurface;
  metadata?: AuthActivityMetadata;
};

export type ReportAuthOtpRequestedInput = {
  email: string;
  organizationId?: string;
  organizationSlug?: string;
  schoolName?: string;
  surface: ActivitySurface;
  mode?: "create" | "login";
  page?: AuthActivityMetadata["page"];
  resent?: boolean;
  firstName?: string;
  lastName?: string;
};

export type ReportAuthOtpFailedInput = Omit<
  ReportAuthOtpRequestedInput,
  "resent" | "firstName" | "lastName" | "schoolName"
> & {
  errorCode?: string;
};

function postPreAuthActivity(body: Record<string, unknown>): void {
  void fetch("/api/activity/auth-otp-requested", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {
    // Activity logging is best-effort; do not block auth flows.
  });
}

function postAuthActivity(
  input: ReportAuthActivityInput,
): Promise<void> {
  return fetch("/api/activity/auth-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: input.action,
      organizationId: input.organizationId,
      surface: input.surface,
      metadata: input.metadata,
    }),
  })
    .then(() => undefined)
    .catch(() => undefined);
}

export function reportAuthActivity(input: ReportAuthActivityInput): void {
  void postAuthActivity(input);
}

export async function reportAuthActivityAndWait(
  input: ReportAuthActivityInput,
): Promise<void> {
  await postAuthActivity(input);
}

export function reportAuthOtpRequested({
  email,
  organizationId,
  organizationSlug,
  schoolName,
  surface,
  mode = "login",
  page,
  resent = false,
  firstName,
  lastName,
}: ReportAuthOtpRequestedInput): void {
  postPreAuthActivity({
    action: ACTIVITY_ACTIONS.AUTH_OTP_REQUESTED,
    email,
    organizationId,
    organizationSlug,
    schoolName,
    surface,
    mode,
    page,
    resent,
    firstName,
    lastName,
  });
}

export function reportAuthOtpFailed({
  email,
  organizationId,
  organizationSlug,
  surface,
  mode = "login",
  page,
  errorCode,
}: ReportAuthOtpFailedInput): void {
  postPreAuthActivity({
    action: ACTIVITY_ACTIONS.AUTH_OTP_FAILED,
    email,
    organizationId,
    organizationSlug,
    surface,
    mode,
    page,
    errorCode,
  });
}
