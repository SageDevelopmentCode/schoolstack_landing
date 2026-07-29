"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  AuthGatePromoPanel,
  AuthHelpButton,
} from "@/components/admissions/AuthGatePromoPanel";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import OrganizationSelector from "@/components/login/OrganizationSelector";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import VerificationCodeInput from "@/components/ui/VerificationCodeInput";
import { DEFAULT_BRANDING } from "@/lib/organization-settings/catalog";
import type { LiveOrganizationOption } from "@/lib/organization-settings/list-live-organizations";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import { AUTH_GATE_PROMO } from "@/lib/site";
import {
  reportAuthOtpFailed,
  reportAuthOtpRequested,
} from "@/lib/activity-auth-client";
import { createClient } from "@/utils/supabase/client";

const RESEND_COOLDOWN_SECONDS = 30;

type LoginAuthMethod = "otp" | "password" | "session_restored";

type LoginPhase = "select_org" | "email" | "verify" | "password";

type LoginExperienceProps = {
  organizations: LiveOrganizationOption[];
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

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    borderColor: C.inputBorder,
    backgroundColor: C.input,
    color: C.textPrimary,
  };
}

export default function LoginExperience({ organizations }: LoginExperienceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const initialSchoolSlug = searchParams.get("school")?.trim() ?? null;
  const initialOrganization = useMemo(
    () =>
      initialSchoolSlug
        ? organizations.find((organization) => organization.slug === initialSchoolSlug) ?? null
        : null,
    [initialSchoolSlug, organizations],
  );

  const [phase, setPhase] = useState<LoginPhase>(
    initialOrganization ? "email" : "select_org",
  );
  const [direction, setDirection] = useState(1);
  const [selectedOrganization, setSelectedOrganization] =
    useState<LiveOrganizationOption | null>(initialOrganization);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [accessibleSlugs, setAccessibleSlugs] = useState<string[] | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);

  const branding = selectedOrganization?.branding ?? DEFAULT_BRANDING;
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const pageBg = branding.colors.bg;
  const normalizedCode = code.replace(/\D/g, "").slice(0, 6);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((index) => (index + 1) % AUTH_GATE_PROMO.slides.length);
    }, AUTH_GATE_PROMO.slideIntervalMs);
    return () => clearInterval(id);
  }, [activeSlide]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const goToPhase = useCallback((nextPhase: LoginPhase, nextDirection: number) => {
    setDirection(nextDirection);
    setPhase(nextPhase);
    setError(null);
  }, []);

  const resolveAuthenticatedSession = useCallback(
    async (slug?: string, method?: LoginAuthMethod) => {
      const params = new URLSearchParams();
      if (slug) {
        params.set("slug", slug);
      }
      if (method) {
        params.set("method", method);
      }

      const query = params.toString();
      const response = await fetch(
        query
          ? `/api/auth/login-destination?${query}`
          : "/api/auth/login-destination",
      );
      const payload = (await response.json()) as {
        href?: string;
        needsSchoolSelection?: boolean;
        accessibleSlugs?: string[];
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to determine where to send you next.");
      }

      if (payload.href) {
        router.replace(payload.href);
        router.refresh();
        return { redirected: true as const };
      }

      if (payload.needsSchoolSelection) {
        setAccessibleSlugs(payload.accessibleSlugs ?? []);
        return { redirected: false as const };
      }

      throw new Error(payload.message ?? "Unable to determine where to send you next.");
    },
    [router],
  );

  const completeSignIn = useCallback(
    async (
      organization: LiveOrganizationOption,
      method: LoginAuthMethod,
    ) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const result = await resolveAuthenticatedSession(organization.slug, method);
        if (!result.redirected) {
          throw new Error("Unable to determine where to send you next.");
        }
      } catch (completeError) {
        setError(
          completeError instanceof Error
            ? completeError.message
            : "Sign in failed. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [resolveAuthenticatedSession],
  );

  const handleOrganizationSelect = useCallback(
    async (organization: LiveOrganizationOption) => {
      setSelectedOrganization(organization);
      setError(null);
      setIsSubmitting(true);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          await completeSignIn(organization, "session_restored");
          return;
        }

        goToPhase("email", 1);
      } finally {
        setIsSubmitting(false);
      }
    },
    [completeSignIn, goToPhase, supabase.auth],
  );

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      setCheckingSession(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        setAccessibleSlugs(null);
        setCheckingSession(false);
        return;
      }

      try {
        const slug = initialOrganization?.slug;
        const result = await resolveAuthenticatedSession(
          slug,
          "session_restored",
        );

        if (!cancelled && !result.redirected) {
          setCheckingSession(false);
        }
      } catch (sessionError) {
        if (!cancelled) {
          setError(
            sessionError instanceof Error
              ? sessionError.message
              : "Unable to continue with your existing session.",
          );
          setCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [initialOrganization, resolveAuthenticatedSession, supabase.auth]);

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
      if (selectedOrganization) {
        reportAuthOtpRequested({
          email: email.trim().toLowerCase(),
          organizationId: selectedOrganization.id,
          organizationSlug: selectedOrganization.slug,
          schoolName: selectedOrganization.name,
          surface: "login",
          mode: "login",
          page: "/login",
        });
      }
      goToPhase("verify", 1);
      setCode("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to send verification code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrganization) return;

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

      await completeSignIn(selectedOrganization, "otp");
    } catch (submitError) {
      reportAuthOtpFailed({
        email: email.trim().toLowerCase(),
        organizationId: selectedOrganization.id,
        organizationSlug: selectedOrganization.slug,
        surface: "login",
        mode: "login",
        page: "/login",
        errorCode:
          submitError instanceof Error
            ? submitError.message.slice(0, 120)
            : "verify_failed",
      });
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Verification failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrganization) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      await completeSignIn(selectedOrganization, "password");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Sign in failed. Please try again.",
      );
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
      if (selectedOrganization) {
        reportAuthOtpRequested({
          email: email.trim().toLowerCase(),
          organizationId: selectedOrganization.id,
          organizationSlug: selectedOrganization.slug,
          schoolName: selectedOrganization.name,
          surface: "login",
          mode: "login",
          page: "/login",
          resent: true,
        });
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to resend verification code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToOrganizations = () => {
    setSelectedOrganization(null);
    setEmail("");
    setPassword("");
    setCode("");
    goToPhase("select_org", -1);
  };

  const handleBackToEmail = () => {
    setCode("");
    goToPhase("email", -1);
  };

  const switchToPassword = () => {
    setCode("");
    goToPhase("password", 1);
  };

  const switchToOtpEmail = () => {
    setPassword("");
    setCode("");
    goToPhase("email", -1);
  };

  const heading =
    phase === "select_org"
      ? "Sign in to your school"
      : phase === "email" || phase === "password"
        ? "Sign in to continue"
        : "Check your email";

  const subtext =
    phase === "select_org" ? (
      "Choose your school to continue to your portal."
    ) : phase === "email" ? (
      <>
        Enter the email you use with{" "}
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {selectedOrganization?.name}
        </span>
        . We&apos;ll send you a one-time code, or you can sign in with your password.
      </>
    ) : phase === "password" ? (
      "Sign in with your email and password."
    ) : (
      <>
        We sent a 6-digit code to{" "}
        <span className="font-medium" style={{ color: C.textPrimary }}>
          {email.trim().toLowerCase()}
        </span>
        . If it doesn&apos;t arrive within a minute, check your spam or junk folder.
      </>
    );

  if (checkingSession) {
    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6"
        style={{ backgroundColor: pageBg, color: C.textSecondary }}
      >
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: C.accent }} />
        <p className="text-sm">Checking your session…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AuthGatePromoPanel activeSlide={activeSlide} />

      <div
        className="relative flex min-h-0 flex-1 flex-col lg:min-h-dvh"
        style={{ backgroundColor: pageBg, color: C.textPrimary }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 pb-20 sm:px-6 sm:py-8 sm:pb-24 lg:flex lg:items-center lg:justify-center lg:py-12">
          <div className="mx-auto w-full max-w-md">
            {phase !== "select_org" ? (
              <button
                type="button"
                onClick={
                  phase === "email" || phase === "password"
                    ? handleBackToOrganizations
                    : handleBackToEmail
                }
                disabled={isSubmitting}
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: C.textSecondary }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : null}

            <div className="mb-8">
              {selectedOrganization ? (
                <SchoolDemoWordmark
                  logo={{
                    src: selectedOrganization.branding.logo.src,
                    alt:
                      selectedOrganization.branding.logo.alt ||
                      selectedOrganization.name,
                    width: selectedOrganization.branding.logo.width,
                    height: selectedOrganization.branding.logo.height,
                    text: selectedOrganization.branding.logo.src
                      ? undefined
                      : selectedOrganization.name,
                  }}
                  className="mb-6 h-8 w-auto max-w-[200px] object-contain"
                />
              ) : null}

              <h1
                className={`font-display font-medium leading-tight ${
                  phase === "select_org" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
                style={{ color: C.accentDark }}
              >
                {heading}
              </h1>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                {subtext}
              </p>
            </div>

            {error ? (
              <p
                className="mb-4 rounded-md border px-3 py-2.5 text-sm"
                style={{
                  borderColor: C.border,
                  backgroundColor: C.surface,
                  color: "#b42318",
                }}
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <AnimatePresence mode="wait" initial={false} custom={direction}>
              {phase === "select_org" ? (
                <motion.div
                  key="select_org"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                >
                  <OrganizationSelector
                    organizations={organizations}
                    onSelect={handleOrganizationSelect}
                    accessibleSlugs={accessibleSlugs}
                    C={C}
                  />
                </motion.div>
              ) : phase === "email" ? (
                <motion.div
                  key="email"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  className="space-y-4"
                >
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="login-email" className="text-sm font-medium">
                        Email
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                        style={inputStyle(C)}
                        disabled={isSubmitting}
                      />
                    </div>

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

                  <p className="text-sm" style={{ color: C.textSecondary }}>
                    Prefer a password?{" "}
                    <button
                      type="button"
                      onClick={switchToPassword}
                      className="font-medium underline-offset-2 hover:underline"
                      style={{ color: C.accent }}
                    >
                      Sign in with password
                    </button>
                  </p>

                  <p className="text-sm" style={{ color: C.textSecondary }}>
                    New here?{" "}
                    <Link
                      href={`/school/${selectedOrganization?.slug}/forms/apply`}
                      className="font-medium underline-offset-2 hover:underline"
                      style={{ color: C.accent }}
                    >
                      Start your application
                    </Link>
                  </p>
                </motion.div>
              ) : phase === "password" ? (
                <motion.div
                  key="password"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  className="space-y-4"
                >
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="login-password-email" className="text-sm font-medium">
                        Email
                      </label>
                      <input
                        id="login-password-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                        style={inputStyle(C)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="login-password" className="text-sm font-medium">
                        Password
                      </label>
                      <input
                        id="login-password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                        style={inputStyle(C)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full rounded-md px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-60 ${BUTTON_LOADING_LAYOUT_CLASS}`}
                      style={{ backgroundColor: C.accent }}
                    >
                      <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Signing in…">
                        Sign in
                      </ButtonLoadingLabel>
                    </button>
                  </form>

                  <p className="text-sm" style={{ color: C.textSecondary }}>
                    Prefer a one-time code?{" "}
                    <button
                      type="button"
                      onClick={switchToOtpEmail}
                      className="font-medium underline-offset-2 hover:underline"
                      style={{ color: C.accent }}
                    >
                      Use email code instead
                    </button>
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
                      id="login-code"
                      label="Verification code"
                      value={code}
                      onChange={setCode}
                      disabled={isSubmitting}
                      autoFocus
                      C={C}
                    />

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
                  </form>

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
