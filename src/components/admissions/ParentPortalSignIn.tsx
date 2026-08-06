"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ApplyAuthShell from "@/components/admissions/ApplyAuthShell";
import { ApplyAuthShellLoader } from "@/components/admissions/ApplyAuthShellLoader";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import VerificationCodeInput from "@/components/ui/VerificationCodeInput";
import {
  CLIENT_AUTH_ACTIVITY_ACTIONS,
  reportAuthActivity,
  reportAuthOtpFailed,
  reportAuthOtpRequested,
} from "@/lib/activity-auth-client";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { AuthActivityMetadata } from "@/lib/activity-log";
import { attemptPostSignInRedirect } from "@/lib/auth/resolve-post-sign-in-redirect";
import { createClient } from "@/utils/supabase/client";

const RESEND_COOLDOWN_SECONDS = 30;

type ParentPortalSignInProps = {
  branding: OrganizationBranding;
  schoolName: string;
  organizationId?: string;
  organizationSlug?: string;
  authPage?: Extract<AuthActivityMetadata["page"], "/apply" | "/parent">;
  title?: string;
  subtitle?: string;
  onComplete: () => void;
};

const inputClassName = "w-full rounded-md border px-3 py-2.5 text-sm";

export default function ParentPortalSignIn({
  branding,
  schoolName,
  organizationId,
  organizationSlug,
  authPage = "/apply",
  title = "Sign in to continue",
  subtitle = "Enter the email you used for your application. We&apos;ll send you a one-time code.",
  onComplete,
}: ParentPortalSignInProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  const [phase, setPhase] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputStyle: React.CSSProperties = {
    borderColor: C.inputBorder,
    backgroundColor: C.input,
    color: C.textPrimary,
  };

  const normalizedCode = code.replace(/\D/g, "").slice(0, 6);

  const completeSignIn = useCallback(
    async (method: "otp" | "session_restored") => {
      if (
        organizationSlug &&
        (await attemptPostSignInRedirect(router, organizationSlug, method))
      ) {
        return;
      }

      onComplete();
    },
    [onComplete, organizationSlug, router],
  );

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session) {
        reportAuthActivity({
          action: CLIENT_AUTH_ACTIVITY_ACTIONS.SESSION_RESTORED,
          organizationId,
          surface: "parent_portal",
          metadata: {
            page: authPage,
            organizationSlug,
          },
        });
        void completeSignIn("session_restored");
        return;
      }

      setCheckingSession(false);
    }

    void checkExistingSession();

    return () => {
      cancelled = true;
    };
  }, [authPage, completeSignIn, organizationId, organizationSlug, supabase.auth]);

  const notifyOtpRequested = useCallback(
    (resent: boolean) => {
      reportAuthOtpRequested({
        email: email.trim().toLowerCase(),
        organizationId,
        organizationSlug,
        schoolName,
        surface: "parent_portal",
        mode: "login",
        page: authPage,
        resent,
      });
    },
    [authPage, email, organizationId, organizationSlug, schoolName],
  );

  const sendOtp = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      throw new Error(otpError.message);
    }

    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }, [email, supabase.auth]);

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await sendOtp();
      notifyOtpRequested(false);
      setPhase("verify");
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: normalizedCode,
        type: "email",
      });

      if (verifyError) {
        throw new Error(verifyError.message);
      }

      reportAuthActivity({
        action: CLIENT_AUTH_ACTIVITY_ACTIONS.OTP_VERIFIED,
        organizationId,
        surface: "parent_portal",
        metadata: {
          method: "otp",
          mode: "login",
          page: authPage,
          organizationSlug,
        },
      });
      reportAuthActivity({
        action: CLIENT_AUTH_ACTIVITY_ACTIONS.SIGNED_IN,
        organizationId,
        surface: "parent_portal",
        metadata: {
          method: "otp",
          mode: "login",
          page: authPage,
          organizationSlug,
        },
      });

      await completeSignIn("otp");
    } catch (err) {
      reportAuthOtpFailed({
        email: email.trim().toLowerCase(),
        organizationId,
        organizationSlug,
        surface: "parent_portal",
        mode: "login",
        page: authPage,
        errorCode:
          err instanceof Error ? err.message.slice(0, 120) : "verify_failed",
      });
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await sendOtp();
      notifyOtpRequested(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <ApplyAuthShell
        branding={branding}
        schoolName={schoolName}
        title={title}
        subtitle={subtitle}
      >
        <ApplyAuthShellLoader message="Checking your session…" C={C} />
      </ApplyAuthShell>
    );
  }

  return (
    <ApplyAuthShell
      branding={branding}
      schoolName={schoolName}
      title={title}
      subtitle={subtitle}
    >
        {phase === "email" ? (
          <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="parent-email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="parent-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>

            {error ? (
              <p className="text-sm" style={{ color: C.error }}>
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-md px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-60 ${BUTTON_LOADING_LAYOUT_CLASS}`}
              style={{ backgroundColor: C.accent }}
            >
              <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Sending code…">
                Send verification code
              </ButtonLoadingLabel>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit} className="mt-8 space-y-4">
            <p className="text-sm" style={{ color: C.textSecondary }}>
              We sent a 6-digit code to{" "}
              <span className="font-medium" style={{ color: C.textPrimary }}>
                {email.trim().toLowerCase()}
              </span>
              .
            </p>

            <VerificationCodeInput
              id="parent-code"
              label="Verification code"
              value={code}
              onChange={setCode}
              disabled={isSubmitting}
              autoFocus
              C={C}
            />

            {error ? (
              <p className="text-sm" style={{ color: C.error }}>
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || normalizedCode.length < 6}
              className={`w-full rounded-md px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-60 ${BUTTON_LOADING_LAYOUT_CLASS}`}
              style={{ backgroundColor: C.accent }}
            >
              <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Verifying…">
                Continue
              </ButtonLoadingLabel>
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setPhase("email");
                  setCode("");
                  setError(null);
                }}
                className="underline-offset-2 hover:underline"
                style={{ color: C.textSecondary }}
              >
                Use a different email
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isSubmitting}
                className="underline-offset-2 hover:underline disabled:opacity-60"
                style={{ color: C.accent }}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}
    </ApplyAuthShell>
  );
}
