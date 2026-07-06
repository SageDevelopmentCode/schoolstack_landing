"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CircleHelp, LogIn, UserPlus } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import type { BootstrapApplicantResult } from "@/lib/admissions/applicant-bootstrap";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { AUTH_GATE_PROMO } from "@/lib/site";
import { createClient } from "@/utils/supabase/client";

type AuthMode = "create" | "login";
type AuthPhase = "choice" | "credentials" | "verify";

const RESEND_COOLDOWN_SECONDS = 30;

export type ApplicationAuthGateProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug?: string;
  formTitle: string;
  organizationId: string;
  formVersionId: string;
  forceNew?: boolean;
  onComplete: () => void;
  onBootstrapped?: (result: BootstrapApplicantResult) => void;
  onRedirectApplyDashboard?: () => void;
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

const slideFadeTransition = { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const };

function PromoSlideThumbnails({
  slides,
  activeSlide,
  onSelectSlide,
  className = "",
}: {
  slides: typeof AUTH_GATE_PROMO.slides;
  activeSlide: number;
  onSelectSlide: (index: number) => void;
  className?: string;
}) {
  return (
    <div className={`flex gap-1.5 overflow-x-auto ${className}`.trim()}>
      {slides.map((item, index) => {
        const isActive = index === activeSlide;
        return (
          <button
            key={item.image}
            type="button"
            onClick={() => onSelectSlide(index)}
            aria-label={`Show slide ${index + 1}`}
            aria-current={isActive ? "true" : undefined}
            className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border-2 transition ${
              isActive
                ? "border-white opacity-100"
                : "border-white/25 opacity-70 hover:border-white/40 hover:opacity-90"
            }`}
          >
            <Image src={item.image} alt="" fill className="object-cover" sizes="40px" />
          </button>
        );
      })}
    </div>
  );
}

function ApplicationAuthPromoPanel({
  compact = false,
  activeSlide,
  onSelectSlide,
}: {
  compact?: boolean;
  activeSlide: number;
  onSelectSlide: (index: number) => void;
}) {
  const slides = AUTH_GATE_PROMO.slides;
  const slide = slides[activeSlide];

  return (
    <div
      className={`relative overflow-hidden ${
        compact ? "h-[40vh] min-h-[280px] lg:hidden" : "hidden lg:flex lg:min-h-dvh lg:flex-1"
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={slideFadeTransition}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={activeSlide === 0}
            className="object-cover"
            sizes={compact ? "100vw" : "50vw"}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

      <div className="relative z-10 flex h-full w-full flex-col p-6 lg:p-10">
        <div className="inline-flex w-fit items-center gap-2 rounded-pill bg-white px-3 py-1.5 shadow-sm">
          <img
            src="/images/Logo.png"
            alt="MudKitchen"
            className="h-6 w-auto object-contain"
          />
          <span className="font-display text-base font-semibold text-clay">
            MudKitchen
          </span>
        </div>

        <div className={`mt-auto ${compact ? "max-w-lg" : "max-w-md"}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={slideFadeTransition}
            >
              <span className="inline-flex items-center rounded-pill bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/85">
                {slide.badge}
              </span>

              <h2
                className={`mt-4 font-display font-medium leading-[1.12] text-white ${
                  compact
                    ? "text-[clamp(1.2rem,4.2vw,1.55rem)]"
                    : "text-[clamp(1.35rem,1.65vw,1.75rem)]"
                }`}
              >
                <span className="block">{slide.headlineLead}</span>
                <em
                  className="mt-0 block text-[#E8D5C8]"
                  style={{ fontStyle: "italic" }}
                >
                  {slide.headlineAccent}
                </em>
              </h2>

              <p
                className={`mt-4 leading-relaxed text-white/75 ${
                  compact ? "text-sm line-clamp-3" : "text-[15px]"
                }`}
              >
                {slide.subtext}
              </p>
            </motion.div>
          </AnimatePresence>

          {!compact ? (
            <PromoSlideThumbnails
              slides={slides}
              activeSlide={activeSlide}
              onSelectSlide={onSelectSlide}
              className="mt-8"
            />
          ) : (
            <PromoSlideThumbnails
              slides={slides}
              activeSlide={activeSlide}
              onSelectSlide={onSelectSlide}
              className="mt-4 pb-1"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AuthHelpButton() {
  return (
    <Link
      href="/get-started"
      className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-pill bg-clay px-4 py-2.5 text-xs font-medium text-white shadow-lg transition hover:opacity-90 sm:bottom-6 sm:right-6 sm:px-5 sm:py-3 sm:text-sm"
    >
      <CircleHelp className="h-4 w-4" />
      Need help?
    </Link>
  );
}

export default function ApplicationAuthGate({
  branding,
  schoolName,
  formTitle,
  organizationId,
  formVersionId,
  forceNew = false,
  onComplete,
  onBootstrapped,
  onRedirectApplyDashboard,
}: ApplicationAuthGateProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const pageBg = branding.colors.bg;

  const [phase, setPhase] = useState<AuthPhase>("choice");
  const [direction, setDirection] = useState(1);
  const [mode, setMode] = useState<AuthMode>("create");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((index) => (index + 1) % AUTH_GATE_PROMO.slides.length);
    }, AUTH_GATE_PROMO.slideIntervalMs);
    return () => clearInterval(id);
  }, [activeSlide]);

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
    setMode(nextMode);
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
    [email, firstName, lastName, mode, schoolName],
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

      const result = await bootstrapApplicant();
      if (result.action !== "redirect_apply_dashboard") {
        onComplete();
      }
    } catch (error) {
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
        ? mode === "create"
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
      mode === "create" ? (
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
      <ApplicationAuthPromoPanel
        activeSlide={activeSlide}
        onSelectSlide={setActiveSlide}
      />
      <ApplicationAuthPromoPanel
        compact
        activeSlide={activeSlide}
        onSelectSlide={setActiveSlide}
      />

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
                      className="mt-2 w-full rounded-md px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ backgroundColor: C.accent }}
                    >
                      {isSubmitting ? "Sending code…" : "Continue"}
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
                    <AuthField
                      id="auth-code"
                      label="Verification code"
                      type="text"
                      value={normalizedCode}
                      onChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
                      required
                      autoComplete="one-time-code"
                      disabled={isSubmitting}
                      C={C}
                    />

                    <p className="text-xs" style={{ color: C.textSecondary }}>
                      Enter the 6-digit code from your email. If you don&apos;t see it,
                      check your spam or junk folder. Codes expire after a few minutes.
                    </p>

                    <button
                      type="submit"
                      disabled={!canVerify}
                      className="w-full rounded-md px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ backgroundColor: C.accent }}
                    >
                      {isSubmitting ? "Verifying…" : "Verify and continue"}
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
