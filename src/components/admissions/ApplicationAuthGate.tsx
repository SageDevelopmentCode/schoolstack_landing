"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Building2, LogIn, UserPlus } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import VerificationCodeInput from "@/components/ui/VerificationCodeInput";
import type { BootstrapApplicantResult } from "@/lib/admissions/applicant-bootstrap";
import { attemptPostSignInRedirect } from "@/lib/auth/resolve-post-sign-in-redirect";
import { reportAuthOtpFailed } from "@/lib/activity-auth-client";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type {
  ApplyAuthEntryOption,
  OrganizationBranding,
} from "@/lib/organization-settings/types";
import { AUTH_GATE_PROMO } from "@/lib/site";
import {
  AuthGatePromoPlaceholder,
} from "@/components/admissions/AuthGatePromoPanel";
import { createClient } from "@/utils/supabase/client";

const AuthGatePromoPanelLazy = dynamic(
  () =>
    import("@/components/admissions/AuthGatePromoPanel").then((mod) => ({
      default: mod.AuthGatePromoPanel,
    })),
  { ssr: false },
);

const AuthHelpButton = dynamic(
  () =>
    import("@/components/admissions/AuthGatePromoPanel").then((mod) => ({
      default: mod.AuthHelpButton,
    })),
  { ssr: false },
);

type AuthMode = "create" | "login";
type AuthPhase = "choice" | "credentials" | "verify";

const RESEND_COOLDOWN_SECONDS = 30;

type AuthEntryIntent = "apply" | "schedule_campus_tour";

export type ApplicationAuthGateProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug?: string;
  formTitle: string;
  organizationId: string;
  formVersionId: string;
  forceNew?: boolean;
  tourEntryOption?: ApplyAuthEntryOption | null;
  onComplete: () => void;
  onBootstrapped?: (result: BootstrapApplicantResult) => void;
  onRedirectApplyDashboard?: () => void;
  onRedirectScheduleTour?: () => void;
};

const stepVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 16 : -16,
  }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -16 : 16,
  }),
};

const stepTransition = { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const };

function inputStyle(C: AdminThemeTokens) {
  return {
    borderColor: C.inputBorder,
    backgroundColor: C.input,
    color: C.textPrimary,
  };
}

function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  autoComplete,
  disabled,
  C,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  C: AdminThemeTokens;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium"
        style={{ color: C.textPrimary }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        style={inputStyle(C)}
      />
    </div>
  );
}

export default function ApplicationAuthGate({
  branding,
  schoolName,
  schoolSlug,
  formTitle,
  organizationId,
  formVersionId,
  forceNew = false,
  tourEntryOption = null,
  onComplete,
  onBootstrapped,
  onRedirectApplyDashboard,
  onRedirectScheduleTour,
}: ApplicationAuthGateProps) {
  const router = useRouter();
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const pageBg = branding.colors.bg;

  const [phase, setPhase] = useState<AuthPhase>("choice");
  const [direction, setDirection] = useState(1);
  const [mode, setMode] = useState<AuthMode>("create");
  const [entryIntent, setEntryIntent] = useState<AuthEntryIntent>("apply");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [showPromo, setShowPromo] = useState(false);
  const [carouselActive, setCarouselActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) {
      return;
    }

    const enablePromo = () => setShowPromo(true);

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(enablePromo, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }

    const id = window.setTimeout(enablePromo, 1000);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!showPromo) return;

    const id = window.setTimeout(() => {
      setCarouselActive(true);
    }, AUTH_GATE_PROMO.slideIntervalMs);

    return () => window.clearTimeout(id);
  }, [showPromo]);

  useEffect(() => {
    if (!carouselActive) return;

    const id = setInterval(() => {
      setActiveSlide((index) => (index + 1) % AUTH_GATE_PROMO.slides.length);
    }, AUTH_GATE_PROMO.slideIntervalMs);

    return () => clearInterval(id);
  }, [carouselActive]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const goToPhase = (nextPhase: AuthPhase, nextDirection: number) => {
    setDirection(nextDirection);
    setPhase(nextPhase);
    setAuthError(null);
  };

  const handleChooseMode = (nextMode: AuthMode) => {
    setEntryIntent("apply");
    setMode(nextMode);
    goToPhase("credentials", 1);
  };

  const handleChooseTour = () => {
    setEntryIntent("schedule_campus_tour");
    setMode("create");
    goToPhase("credentials", 1);
  };

  const sendOtp = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        shouldCreateUser: mode === "create",
        data:
          mode === "create"
            ? {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
              }
            : undefined,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }, [email, firstName, lastName, mode, supabase.auth]);

  const notifyVerificationCodeSent = useCallback(
    (resent: boolean) => {
      void fetch("/api/admissions/notify-verification-code-sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          organizationSlug: schoolSlug,
          schoolName,
          email: email.trim().toLowerCase(),
          mode,
          firstName: mode === "create" ? firstName.trim() : undefined,
          lastName: mode === "create" ? lastName.trim() : undefined,
          resent,
        }),
      }).catch(() => {
        // Discord notification is best-effort; do not block auth flow.
      });
    },
    [email, firstName, lastName, mode, organizationId, schoolName, schoolSlug],
  );

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    try {
      await sendOtp();
      notifyVerificationCodeSent(false);
      goToPhase("verify", 1);
      setCode("");
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Failed to send verification code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const bootstrapApplicant = async () => {
    const response = await fetch("/api/admissions/applicant-bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId,
        formVersionId,
        firstName: mode === "create" ? firstName.trim() : undefined,
        lastName: mode === "create" ? lastName.trim() : undefined,
        schoolName,
        formTitle,
        mode,
        forceNew,
        entryIntent,
      }),
    });

    const payload = (await response.json()) as BootstrapApplicantResult & {
      error?: string;
    };

    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to set up your application.");
    }

    if (payload.action === "redirect_apply_dashboard") {
      onRedirectApplyDashboard?.();
      return payload;
    }

    if (payload.action === "redirect_schedule_tour") {
      onRedirectScheduleTour?.();
      return payload;
    }

    if (payload.action === "redirect_teacher_portal") {
      if (
        schoolSlug &&
        (await attemptPostSignInRedirect(router, schoolSlug, "otp"))
      ) {
        return payload;
      }
    }

    onBootstrapped?.(payload);
    return payload;
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: normalizedCode,
        type: "email",
      });

      if (verifyError) {
        throw new Error(verifyError.message);
      }

      if (
        schoolSlug &&
        (await attemptPostSignInRedirect(router, schoolSlug, "otp"))
      ) {
        return;
      }

      const result = await bootstrapApplicant();
      if (
        result.action !== "redirect_apply_dashboard" &&
        result.action !== "redirect_teacher_portal" &&
        result.action !== "redirect_schedule_tour"
      ) {
        onComplete();
      }
    } catch (error) {
      reportAuthOtpFailed({
        email: email.trim().toLowerCase(),
        organizationId,
        organizationSlug: schoolSlug,
        surface: "public_apply",
        mode,
        page: "/forms/apply",
        errorCode:
          error instanceof Error ? error.message.slice(0, 120) : "verify_failed",
      });
      setAuthError(
        error instanceof Error ? error.message : "Verification failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isSubmitting) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      await sendOtp();
      notifyVerificationCodeSent(true);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Failed to resend verification code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToChoice = () => {
    goToPhase("choice", -1);
  };

  const handleBackToCredentials = () => {
    goToPhase("credentials", -1);
    setCode("");
  };

  const switchMode = (nextMode: AuthMode) => {
    if (nextMode !== mode) {
      setMode(nextMode);
      setAuthError(null);
    }
  };

  const normalizedCode = code.replace(/\D/g, "").slice(0, 6);
  const canVerify = normalizedCode.length === 6 && !isSubmitting;
  const canResend = resendCooldown <= 0 && !isSubmitting;

  const phaseHeading =
    phase === "choice"
      ? "Begin your application"
      : phase === "credentials"
        ? entryIntent === "schedule_campus_tour"
          ? "Schedule your campus tour"
          : mode === "create"
            ? "Create your account"
            : "Log in to continue"
        : "Check your email";

  const phaseSubtext =
    phase === "choice" ? (
      <>
        Save your progress for{" "}
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {formTitle}
        </span>{" "}
        at {schoolName} and pick up where you left off.
      </>
    ) : phase === "credentials" ? (
      entryIntent === "schedule_campus_tour" ? (
        "Create your account so we can save your tour booking and connect it when you apply later."
      ) : mode === "create" ? (
        "Enter your name and email. We will send a verification code to get started."
      ) : (
        "Enter your email and we will send a verification code to continue your application."
      )
    ) : (
      <>
        We sent a 6-digit code to{" "}
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {email}
        </span>
        . If it doesn&apos;t arrive within a minute, check your spam or junk folder.
      </>
    );

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {showPromo ? (
        <AuthGatePromoPanelLazy activeSlide={activeSlide} />
      ) : (
        <AuthGatePromoPlaceholder />
      )}

      <div
        className="relative flex min-h-0 flex-1 flex-col lg:min-h-dvh"
        style={{ backgroundColor: pageBg, color: C.textPrimary }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 pb-20 sm:px-6 sm:py-8 sm:pb-24 lg:flex lg:items-center lg:justify-center lg:py-12">
          <div className="mx-auto w-full max-w-md">
            {phase !== "choice" ? (
              <button
                type="button"
                onClick={phase === "credentials" ? handleBackToChoice : handleBackToCredentials}
                disabled={isSubmitting}
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: C.textSecondary }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : null}

            <div className="mb-8">
              <SchoolDemoWordmark
                logo={{
                  src: branding.logo.src,
                  alt: branding.logo.alt || schoolName,
                  width: branding.logo.width,
                  height: branding.logo.height,
                  text: branding.logo.src ? undefined : schoolName,
                }}
                className="mb-6 h-8 w-auto max-w-[200px] object-contain"
                sizes="200px"
                priority
              />

              <h1
                className={`font-display font-medium leading-tight ${
                  phase === "choice" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
                style={{ color: C.accentDark }}
              >
                {phaseHeading}
              </h1>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                {phaseSubtext}
              </p>
            </div>

            {authError ? (
              <p
                className="mb-4 rounded-md border px-3 py-2.5 text-sm"
                style={{
                  borderColor: C.border,
                  backgroundColor: C.surface,
                  color: "#b42318",
                }}
                role="alert"
              >
                {authError}
              </p>
            ) : null}

            <AnimatePresence mode="wait" initial={false} custom={direction}>
              {phase === "choice" ? (
                <motion.div
                  key="choice"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  className="space-y-3"
                >
                  <button
                    type="button"
                    onClick={() => handleChooseMode("create")}
                    className="flex w-full items-center gap-4 rounded-xl border p-4 text-left shadow-sm transition hover:shadow-md sm:p-5"
                    style={{
                      borderColor: C.border,
                      backgroundColor: C.surface,
                    }}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12"
                      style={{ backgroundColor: C.clayBg, color: C.clay }}
                    >
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold" style={{ color: C.textPrimary }}>
                        Create an account
                      </p>
                      <p className="mt-0.5 text-sm" style={{ color: C.textSecondary }}>
                        New here? Start your application.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChooseMode("login")}
                    className="flex w-full items-center gap-4 rounded-xl border p-4 text-left shadow-sm transition hover:shadow-md sm:p-5"
                    style={{
                      borderColor: C.border,
                      backgroundColor: C.surface,
                    }}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12"
                      style={{ backgroundColor: C.clayBg, color: C.clay }}
                    >
                      <LogIn className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold" style={{ color: C.textPrimary }}>
                        Log in to continue
                      </p>
                      <p className="mt-0.5 text-sm" style={{ color: C.textSecondary }}>
                        Already started? Pick up where you left off.
                      </p>
                    </div>
                  </button>

                  {tourEntryOption ? (
                    <button
                      type="button"
                      onClick={handleChooseTour}
                      className="flex w-full items-center gap-4 rounded-xl border p-4 text-left shadow-sm transition hover:shadow-md sm:p-5"
                      style={{
                        borderColor: C.border,
                        backgroundColor: C.surface,
                      }}
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12"
                        style={{ backgroundColor: C.clayBg, color: C.clay }}
                      >
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold" style={{ color: C.textPrimary }}>
                          {tourEntryOption.label ?? "Schedule a tour of campus"}
                        </p>
                        <p className="mt-0.5 text-sm" style={{ color: C.textSecondary }}>
                          {tourEntryOption.description ??
                            "Meet with faculty and learn more about our school."}
                        </p>
                      </div>
                    </button>
                  ) : null}
                </motion.div>
              ) : phase === "credentials" ? (
                <motion.div
                  key="credentials"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  className="space-y-4"
                >
                  <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                    {mode === "create" ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AuthField
                          id="auth-first-name"
                          label="First name"
                          value={firstName}
                          onChange={setFirstName}
                          required
                          autoComplete="given-name"
                          disabled={isSubmitting}
                          C={C}
                        />
                        <AuthField
                          id="auth-last-name"
                          label="Last name"
                          value={lastName}
                          onChange={setLastName}
                          required
                          autoComplete="family-name"
                          disabled={isSubmitting}
                          C={C}
                        />
                      </div>
                    ) : null}

                    <AuthField
                      id="auth-email"
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      required
                      autoComplete="email"
                      disabled={isSubmitting}
                      C={C}
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`mt-2 w-full rounded-md px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${BUTTON_LOADING_LAYOUT_CLASS}`}
                      style={{ backgroundColor: C.accent }}
                    >
                      <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Sending code…">
                        Continue
                      </ButtonLoadingLabel>
                    </button>
                  </form>

                  <p className="text-sm" style={{ color: C.textSecondary }}>
                    {mode === "create" ? (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("login")}
                          className="font-medium underline-offset-2 hover:underline"
                          style={{ color: C.accent }}
                        >
                          Log in
                        </button>
                      </>
                    ) : (
                      <>
                        New here?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("create")}
                          className="font-medium underline-offset-2 hover:underline"
                          style={{ color: C.accent }}
                        >
                          Create an account
                        </button>
                      </>
                    )}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="verify"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  className="space-y-4"
                >
                  <form onSubmit={handleVerifySubmit} className="space-y-4">
                    <VerificationCodeInput
                      id="auth-code"
                      label="Verification code"
                      value={code}
                      onChange={setCode}
                      disabled={isSubmitting}
                      autoFocus
                      C={C}
                    />

                    <p className="text-xs" style={{ color: C.textSecondary }}>
                      Enter the 6-digit code from your email. If you don&apos;t see it,
                      check your spam or junk folder. Codes expire after a few minutes.
                    </p>

                    <button
                      type="submit"
                      disabled={!canVerify}
                      className={`w-full rounded-md px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_LOADING_LAYOUT_CLASS}`}
                      style={{ backgroundColor: C.accent }}
                    >
                      <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Verifying…">
                        Verify and continue
                      </ButtonLoadingLabel>
                    </button>
                  </form>

                  <p className="text-sm" style={{ color: C.textSecondary }}>
                    Didn&apos;t get a code?{" "}
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={!canResend}
                      className="font-medium underline-offset-2 enabled:hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ color: C.accent }}
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend code"}
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AuthHelpButton />
    </div>
  );
}
