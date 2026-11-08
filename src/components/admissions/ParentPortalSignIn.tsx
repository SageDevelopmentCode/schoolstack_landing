"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ApplyAuthShell from "@/components/admissions/ApplyAuthShell";
import { ApplyAuthShellLoader } from "@/components/admissions/ApplyAuthShellLoader";
import BrightPortalAuthShell, {
  BrightAuthSessionCheck,
} from "@/components/admissions/BrightPortalAuthShell";
import GetStartedStoryTextField from "@/components/get-started/GetStartedStoryTextField";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import {
  BRIGHT_AUTH_ERROR_CLASS,
  BRIGHT_AUTH_PRIMARY_BUTTON,
  BRIGHT_AUTH_THEME,
} from "@/components/login/bright-auth-form-styles";
import LoginPhaseHeader, {
  type BrightAuthPreset,
} from "@/components/login/login-phase-header";
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
import { normalizeLoginErrorMessage } from "@/lib/auth/login-error-message";
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
  layoutVariant?: "legacy" | "bright";
  title?: string;
  subtitle?: string;
  onComplete: () => void;
};

const inputClassName = "w-full rounded-md border px-3 py-2.5 text-sm";

function authPresetFromPage(
  authPage: "/apply" | "/parent",
): BrightAuthPreset {
  return authPage === "/parent" ? "parent" : "apply";
}

export default function ParentPortalSignIn({
  branding,
  schoolName,
  organizationId,
  organizationSlug,
  authPage = "/apply",
  layoutVariant = "legacy",
  title = "Sign in to continue",
  subtitle = "Enter the email you used for your application. We'll send you a one-time code.",
  onComplete,
}: ParentPortalSignInProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const isBright = layoutVariant === "bright";
  const headerPreset = authPresetFromPage(authPage);

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
  const normalizedEmail = email.trim().toLowerCase();

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
        email: normalizedEmail,
        organizationId,
        organizationSlug,
        schoolName,
        surface: "parent_portal",
        mode: "login",
        page: authPage,
        resent,
      });
    },
    [authPage, normalizedEmail, organizationId, organizationSlug, schoolName],
  );

  const sendOtp = useCallback(async () => {
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      throw new Error(otpError.message);
    }

    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }, [normalizedEmail, supabase.auth]);

  const mapError = useCallback(
    (err: unknown, fallback: string) =>
      isBright
        ? normalizeLoginErrorMessage(err, fallback)
        : err instanceof Error
          ? err.message
          : fallback,
    [isBright],
  );

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
      setError(mapError(err, "Failed to send verification code."));
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
        email: normalizedEmail,
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
        email: normalizedEmail,
        organizationId,
        organizationSlug,
        surface: "parent_portal",
        mode: "login",
        page: authPage,
        errorCode:
          err instanceof Error ? err.message.slice(0, 120) : "verify_failed",
      });
      setError(mapError(err, "Verification failed. Please try again."));
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
      setError(mapError(err, "Failed to resend verification code."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToEmail = () => {
    setPhase("email");
    setCode("");
    setError(null);
  };

  const schoolWordmark = (
    <SchoolDemoWordmark
      logo={{
        src: branding.logo.src,
        alt: branding.logo.alt || schoolName,
        width: branding.logo.width,
        height: branding.logo.height,
        text: branding.logo.src ? undefined : schoolName,
      }}
      className="mb-6 h-8 w-auto max-w-[200px] object-contain"
    />
  );

  const headerSubtitle =
    phase === "verify" ? (
      <>
        We sent a 6-digit code to{" "}
        <span className="font-semibold text-[#1d1a16]">{normalizedEmail}</span>. If it
        doesn&apos;t arrive within a minute, check your spam or junk folder.
      </>
    ) : (
      subtitle
    );

  if (checkingSession) {
    if (isBright) {
      return <BrightAuthSessionCheck />;
    }

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

  const legacyForm =
    phase === "email" ? (
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
            {normalizedEmail}
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
            onClick={handleBackToEmail}
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
    );

  const brightForm =
    phase === "email" ? (
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <GetStartedStoryTextField
          theme={BRIGHT_AUTH_THEME}
          id="parent-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />

        {error ? (
          <p className={BRIGHT_AUTH_ERROR_CLASS} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className={BRIGHT_AUTH_PRIMARY_BUTTON}
        >
          <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Sending code…">
            Send verification code
          </ButtonLoadingLabel>
        </button>
      </form>
    ) : (
      <form onSubmit={handleVerifySubmit} className="space-y-4">
        <VerificationCodeInput
          id="parent-code"
          label="Verification code"
          value={code}
          onChange={setCode}
          disabled={isSubmitting}
          autoFocus
          variant="bright"
        />

        {error ? (
          <p className={BRIGHT_AUTH_ERROR_CLASS} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || normalizedCode.length < 6}
          className={BRIGHT_AUTH_PRIMARY_BUTTON}
        >
          <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Verifying…">
            Continue
          </ButtonLoadingLabel>
        </button>

        <div className="flex items-center justify-between font-secondary text-sm">
          <button
            type="button"
            onClick={handleBackToEmail}
            disabled={isSubmitting}
            className="text-[#1d1a16]/70 underline-offset-2 hover:underline disabled:opacity-60"
          >
            Use a different email
          </button>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || isSubmitting}
            className="font-semibold text-clay underline-offset-2 hover:underline disabled:opacity-60"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
          </button>
        </div>
      </form>
    );

  if (isBright) {
    return (
      <BrightPortalAuthShell>
        {phase === "verify" ? (
          <button
            type="button"
            onClick={handleBackToEmail}
            disabled={isSubmitting}
            className="mb-6 inline-flex items-center gap-1.5 font-secondary text-sm font-medium text-[#1d1a16]/70 transition hover:text-[#1d1a16] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : null}

        <LoginPhaseHeader
          preset={headerPreset}
          phase={phase}
          subtitle={headerSubtitle}
          schoolWordmark={schoolWordmark}
        />

        {brightForm}
      </BrightPortalAuthShell>
    );
  }

  return (
    <ApplyAuthShell
      branding={branding}
      schoolName={schoolName}
      title={title}
      subtitle={subtitle}
    >
      {legacyForm}
    </ApplyAuthShell>
  );
}
