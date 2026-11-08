"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BrightAuthSessionCheck } from "@/components/admissions/BrightPortalAuthShell";
import GetStartedStoryTextField from "@/components/get-started/GetStartedStoryTextField";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import BrightAuthPageLayout from "@/components/login/BrightAuthPageLayout";
import {
  BRIGHT_AUTH_ERROR_CLASS,
  BRIGHT_AUTH_PRIMARY_BUTTON,
  BRIGHT_AUTH_THEME,
} from "@/components/login/bright-auth-form-styles";
import LoginPhaseHeader from "@/components/login/login-phase-header";
import OrganizationSelector from "@/components/login/OrganizationSelector";
import ButtonLoadingLabel from "@/components/ui/ButtonLoadingLabel";
import VerificationCodeInput from "@/components/ui/VerificationCodeInput";
import {
  NO_SCHOOL_ACCESS_MESSAGE,
  normalizeLoginErrorMessage,
} from "@/lib/auth/login-error-message";
import type { LiveOrganizationOption } from "@/lib/organization-settings/list-live-organizations";
import {
  reportAuthOtpFailed,
  reportAuthOtpRequested,
} from "@/lib/activity-auth-client";
import { createClient } from "@/utils/supabase/client";

const RESEND_COOLDOWN_SECONDS = 30;

type LoginAuthMethod = "otp" | "password" | "session_restored";

type LoginPhase = "select_org" | "email" | "verify" | "password";

type LoginExperienceProps = {
  /** School named by `?school=`, resolved server-side. */
  initialOrganization: LiveOrganizationOption | null;
};

type LoginDestinationPayload = {
  href?: string;
  needsSchoolSelection?: boolean;
  noAccess?: boolean;
  organizations?: LiveOrganizationOption[];
  error?: string;
  message?: string;
};

type SessionResolution =
  | { kind: "redirected" }
  | { kind: "needs_school_selection"; organizations: LiveOrganizationOption[] }
  | { kind: "no_access" };

async function fetchLoginDestination(
  slug: string | undefined,
  method: LoginAuthMethod | undefined,
): Promise<{ status: number; ok: boolean; payload: LoginDestinationPayload }> {
  const params = new URLSearchParams();
  if (slug) params.set("slug", slug);
  if (method) params.set("method", method);

  const query = params.toString();
  const response = await fetch(
    query ? `/api/auth/login-destination?${query}` : "/api/auth/login-destination",
  );
  const payload = (await response
    .json()
    .catch(() => ({}))) as LoginDestinationPayload;

  return { status: response.status, ok: response.ok, payload };
}

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

export default function LoginExperience({ initialOrganization }: LoginExperienceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const initialAuthMethod = searchParams.get("auth")?.trim() ?? null;

  const [phase, setPhase] = useState<LoginPhase>(
    initialAuthMethod === "password" ? "password" : "email",
  );
  const [direction, setDirection] = useState(1);
  // Only set for `?school=` deep links or after the user picks a school.
  const [selectedOrganization, setSelectedOrganization] =
    useState<LiveOrganizationOption | null>(initialOrganization);
  const [pickerOrganizations, setPickerOrganizations] = useState<
    LiveOrganizationOption[]
  >([]);
  // How the user authenticated, so the post-picker call is attributed correctly.
  const [authMethod, setAuthMethod] = useState<LoginAuthMethod>("session_restored");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [openingOrganizationId, setOpeningOrganizationId] = useState<string | null>(
    null,
  );
  const [openingOrganizationName, setOpeningOrganizationName] = useState<string | null>(
    null,
  );

  const normalizedCode = code.replace(/\D/g, "").slice(0, 6);
  const normalizedEmail = email.trim().toLowerCase();

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

  /**
   * Asks the server where this signed-in user belongs. Without a slug the server
   * detects their school(s). A deep-linked school the user cannot access falls
   * back to detection instead of leaving them stuck.
   */
  const resolveAuthenticatedSession = useCallback(
    async (slug?: string, method?: LoginAuthMethod): Promise<SessionResolution> => {
      let attempt = await fetchLoginDestination(slug, method);

      if (!attempt.ok && slug && (attempt.status === 403 || attempt.status === 404)) {
        attempt = await fetchLoginDestination(undefined, method);
      }

      const { ok, payload } = attempt;

      if (!ok) {
        throw new Error(
          payload.message ?? "Unable to determine where to send you next.",
        );
      }

      if (payload.noAccess) {
        return { kind: "no_access" };
      }

      if (payload.href) {
        router.replace(payload.href);
        router.refresh();
        return { kind: "redirected" };
      }

      if (payload.needsSchoolSelection) {
        return {
          kind: "needs_school_selection",
          organizations: payload.organizations ?? [],
        };
      }

      throw new Error(
        payload.message ?? "Unable to determine where to send you next.",
      );
    },
    [router],
  );

  /** Applies a non-redirect resolution: school picker, or sign out when no access. */
  const applyResolution = useCallback(
    async (resolution: SessionResolution, method: LoginAuthMethod) => {
      if (resolution.kind === "needs_school_selection") {
        setPickerOrganizations(resolution.organizations);
        setSelectedOrganization(null);
        setAuthMethod(method);
        goToPhase("select_org", 1);
        return;
      }

      if (resolution.kind === "no_access") {
        await supabase.auth.signOut();
        setPassword("");
        setCode("");
        goToPhase("email", -1);
        setError(NO_SCHOOL_ACCESS_MESSAGE);
      }
    },
    [goToPhase, supabase.auth],
  );

  const finishAuthentication = useCallback(
    async (method: LoginAuthMethod, organization: LiveOrganizationOption | null) => {
      const resolution = await resolveAuthenticatedSession(
        organization?.slug,
        method,
      );
      await applyResolution(resolution, method);
    },
    [applyResolution, resolveAuthenticatedSession],
  );

  const handleOrganizationSelect = useCallback(
    async (organization: LiveOrganizationOption) => {
      setSelectedOrganization(organization);
      setOpeningOrganizationId(organization.id);
      setOpeningOrganizationName(organization.name);
      setError(null);
      setIsSubmitting(true);

      try {
        const resolution = await resolveAuthenticatedSession(
          organization.slug,
          authMethod,
        );
        if (resolution.kind !== "redirected") {
          throw new Error("Unable to determine where to send you next.");
        }
      } catch (selectError) {
        setError(
          normalizeLoginErrorMessage(
            selectError,
            "Unable to continue with this school.",
          ),
        );
      } finally {
        setIsSubmitting(false);
        setOpeningOrganizationId(null);
        setOpeningOrganizationName(null);
      }
    },
    [authMethod, resolveAuthenticatedSession],
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
        setCheckingSession(false);
        return;
      }

      try {
        const resolution = await resolveAuthenticatedSession(
          initialOrganization?.slug,
          "session_restored",
        );

        if (cancelled) return;

        if (resolution.kind !== "redirected") {
          await applyResolution(resolution, "session_restored");
          if (cancelled) return;
          setCheckingSession(false);
        }
      } catch (sessionError) {
        if (!cancelled) {
          setError(
            normalizeLoginErrorMessage(
              sessionError,
              "Unable to continue with your existing session.",
            ),
          );
          setCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [applyResolution, initialOrganization, resolveAuthenticatedSession, supabase.auth]);

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

  const reportOtpRequested = useCallback(
    (resent: boolean) => {
      reportAuthOtpRequested({
        email: normalizedEmail,
        organizationId: selectedOrganization?.id,
        organizationSlug: selectedOrganization?.slug,
        schoolName: selectedOrganization?.name,
        surface: "login",
        mode: "login",
        page: "/login",
        ...(resent ? { resent: true } : {}),
      });
    },
    [normalizedEmail, selectedOrganization],
  );

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await sendOtp();
      reportOtpRequested(false);
      goToPhase("verify", 1);
      setCode("");
    } catch (submitError) {
      setError(
        normalizeLoginErrorMessage(submitError, "Failed to send verification code."),
      );
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
        reportAuthOtpFailed({
          email: normalizedEmail,
          organizationId: selectedOrganization?.id,
          organizationSlug: selectedOrganization?.slug,
          surface: "login",
          mode: "login",
          page: "/login",
          errorCode: verifyError.message.slice(0, 120),
        });
        throw new Error(verifyError.message);
      }

      await finishAuthentication("otp", selectedOrganization);
    } catch (submitError) {
      setError(
        normalizeLoginErrorMessage(
          submitError,
          "Verification failed. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      await finishAuthentication("password", selectedOrganization);
    } catch (submitError) {
      setError(
        normalizeLoginErrorMessage(submitError, "Sign in failed. Please try again."),
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
      reportOtpRequested(true);
    } catch (submitError) {
      setError(
        normalizeLoginErrorMessage(
          submitError,
          "Failed to resend verification code.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Back from the post-auth school picker: sign out and start over. */
  const handleBackFromSchoolPicker = async () => {
    setIsSubmitting(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setIsSubmitting(false);
    }
    setSelectedOrganization(initialOrganization);
    setPickerOrganizations([]);
    setEmail("");
    setPassword("");
    setCode("");
    setOpeningOrganizationId(null);
    setOpeningOrganizationName(null);
    goToPhase("email", -1);
  };

  const handleBackToEmail = () => {
    setCode("");
    goToPhase("email", -1);
  };

  const switchToOtpEmail = () => {
    setPassword("");
    setCode("");
    goToPhase("email", -1);
  };

  const switchToPassword = () => {
    setCode("");
    goToPhase("password", 1);
  };

  const phaseForHeader =
    phase === "password" ? "password" : phase === "email" ? "email" : phase;

  const subtitle =
    phase === "select_org" ? (
      "Choose which school to open."
    ) : phase === "email" ? (
      selectedOrganization ? (
        <>
          Enter the email you use with{" "}
          <span className="font-semibold text-[#1d1a16]">{selectedOrganization.name}</span>
          . We&apos;ll send you a one-time code.
        </>
      ) : (
        "Enter the email you use with your school. We'll send you a one-time code."
      )
    ) : phase === "password" ? (
      "Sign in with your email and password."
    ) : (
      <>
        We sent a 6-digit code to{" "}
        <span className="font-semibold text-[#1d1a16]">{normalizedEmail}</span>. If it
        doesn&apos;t arrive within a minute, check your spam or junk folder.
      </>
    );

  const schoolWordmark =
    selectedOrganization && phase !== "select_org" ? (
      <SchoolDemoWordmark
        logo={{
          src: selectedOrganization.branding.logo.src,
          alt:
            selectedOrganization.branding.logo.alt || selectedOrganization.name,
          width: selectedOrganization.branding.logo.width,
          height: selectedOrganization.branding.logo.height,
          text: selectedOrganization.branding.logo.src
            ? undefined
            : selectedOrganization.name,
        }}
        className="mb-6 h-8 w-auto max-w-[200px] object-contain"
      />
    ) : null;

  if (checkingSession) {
    return <BrightAuthSessionCheck />;
  }

  return (
    <BrightAuthPageLayout>
            {phase === "verify" || phase === "select_org" ? (
              <button
                type="button"
                onClick={
                  phase === "select_org" ? handleBackFromSchoolPicker : handleBackToEmail
                }
                disabled={isSubmitting}
                className="mb-6 inline-flex items-center gap-1.5 font-secondary text-sm font-medium text-[#1d1a16]/70 transition hover:text-[#1d1a16] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : null}

            <LoginPhaseHeader
              preset="login"
              phase={phaseForHeader}
              subtitle={subtitle}
              schoolWordmark={schoolWordmark}
            />

            {openingOrganizationId && openingOrganizationName ? (
              <div
                className="-mt-4 mb-4 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-[#F4F1EC] px-4 py-2 font-secondary text-sm font-medium text-[#1d1a16]/80"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="h-4 w-4 animate-spin text-[#1d1a16]" aria-hidden />
                Opening {openingOrganizationName}…
              </div>
            ) : null}

            {error ? (
              <p className={BRIGHT_AUTH_ERROR_CLASS} role="alert">
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
                    organizations={pickerOrganizations}
                    onSelect={handleOrganizationSelect}
                    disabled={isSubmitting}
                    openingOrganizationId={openingOrganizationId}
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
                    <GetStartedStoryTextField
                      theme={BRIGHT_AUTH_THEME}
                      id="login-email"
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                    />

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

                  <p className="font-secondary text-sm text-[#1d1a16]/70">
                    Prefer a password?{" "}
                    <button
                      type="button"
                      onClick={switchToPassword}
                      disabled={isSubmitting}
                      className="font-semibold text-clay underline-offset-2 hover:underline disabled:opacity-60"
                    >
                      Use password instead
                    </button>
                  </p>

                  {selectedOrganization ? (
                    <p className="font-secondary text-sm text-[#1d1a16]/70">
                      New here?{" "}
                      <Link
                        href={`/school/${selectedOrganization.slug}/forms/apply`}
                        className="font-semibold text-clay underline-offset-2 hover:underline"
                      >
                        Start your application
                      </Link>
                    </p>
                  ) : null}
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
                    <GetStartedStoryTextField
                      theme={BRIGHT_AUTH_THEME}
                      id="login-password-email"
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                    />

                    <GetStartedStoryTextField
                      theme={BRIGHT_AUTH_THEME}
                      id="login-password"
                      label="Password"
                      type="password"
                      value={password}
                      onChange={setPassword}
                      autoComplete="current-password"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting || !email.trim() || !password}
                      className={BRIGHT_AUTH_PRIMARY_BUTTON}
                    >
                      <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Signing in…">
                        Sign in
                      </ButtonLoadingLabel>
                    </button>
                  </form>

                  <p className="font-secondary text-sm text-[#1d1a16]/70">
                    Prefer a one-time code?{" "}
                    <button
                      type="button"
                      onClick={switchToOtpEmail}
                      disabled={isSubmitting}
                      className="font-semibold text-clay underline-offset-2 hover:underline disabled:opacity-60"
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
                      variant="bright"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting || normalizedCode.length < 6}
                      className={BRIGHT_AUTH_PRIMARY_BUTTON}
                    >
                      <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Verifying…">
                        Continue
                      </ButtonLoadingLabel>
                    </button>
                  </form>

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
                </motion.div>
              )}
            </AnimatePresence>
    </BrightAuthPageLayout>
  );
}
