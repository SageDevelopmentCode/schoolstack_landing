"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  LogIn,
  UserPlus,
} from "lucide-react";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import VerificationCodeInput from "@/components/ui/VerificationCodeInput";
import type { BootstrapApplicantResult } from "@/lib/admissions/applicant-bootstrap";
import { attemptPostSignInRedirect } from "@/lib/auth/resolve-post-sign-in-redirect";
import { reportAuthOtpFailed } from "@/lib/activity-auth-client";
import type {
  ApplyAuthEntryOption,
  OrganizationBranding,
} from "@/lib/organization-settings/types";
import AuthGatePromoColumn from "@/components/admissions/AuthGatePromoColumn";
import type { ApplyProgramOption } from "@/components/admissions/ApplyProgramSelectStep";
import ApplyAuthGardenFrame, {
  APPLY_AUTH_CARD,
} from "@/components/admissions/garden/ApplyAuthGardenFrame";
import {
  G_FOCUS,
  G_INPUT,
  G_LABEL,
  GIcon,
  GKicker,
  SPRINGY,
  gBtnPop,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import { createClient } from "@/utils/supabase/client";
import { reportApplyOperationalError } from "@/lib/operational-errors-client";

const AuthHelpButton = dynamic(
  () =>
    import("@/components/admissions/AuthGatePromoPanel").then((mod) => ({
      default: mod.AuthHelpButton,
    })),
  { ssr: false },
);

type AuthMode = "create" | "login";
type AuthPhase = "choice" | "credentials" | "verify" | "program";

const RESEND_COOLDOWN_SECONDS = 30;

type AuthEntryIntent = "apply" | "schedule_campus_tour";

export type { ApplyProgramOption };

export type ApplicationAuthGateProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug?: string;
  formTitle: string;
  organizationId: string;
  formVersionId: string;
  forceNew?: boolean;
  genericEntry?: boolean;
  programOptions?: ApplyProgramOption[];
  initialPhase?: AuthPhase;
  programOnly?: boolean;
  tourEntryOption?: ApplyAuthEntryOption | null;
  onComplete: () => void;
  onBootstrapped?: (result: BootstrapApplicantResult) => void;
  onProgramSelected?: (formVersionId: string) => void;
  onAuthComplete?: () => void;
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

/* Garden classes for the gate (school accent via `--sf-clay*`). */
const PRIMARY_BUTTON = `${gBtnPop} w-full disabled:translate-y-0 disabled:shadow-[0_5px_0_0_var(--sf-ink)] ${BUTTON_LOADING_LAYOUT_CLASS}`;
const TEXT_LINK = `${gLinkSm} disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50`;
const BACK_LINK = `mb-4 inline-flex items-center gap-1.5 rounded-md text-[13px] font-extrabold text-[var(--sf-soft)] transition-colors hover:text-[var(--sf-ink)] disabled:cursor-not-allowed disabled:opacity-50 ${G_FOCUS}`;
const OPTION_ROW = `group flex w-full items-center gap-4 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-4 text-left hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/25 hover:bg-[var(--sf-accent-wash)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${SPRINGY} ${G_FOCUS}`;
const OPTION_TITLE = "m-0 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]";
const OPTION_META = "m-0 mt-0.5 text-[13px] font-semibold leading-snug text-[var(--sf-soft)]";
const ERROR_NOTE =
  "mb-4 rounded-[14px] border-[1.5px] border-[#b42318]/20 bg-[#fdf1ef] px-3.5 py-2.5 text-[13px] font-bold leading-relaxed text-[#b42318]";

function OptionChevron() {
  return (
    <ChevronRight
      className="ml-auto h-4 w-4 shrink-0 text-[var(--sf-ink)]/35 transition-colors group-hover:text-[var(--sf-clay-deep)]"
      aria-hidden
    />
  );
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
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={G_LABEL}>
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
        className={G_INPUT}
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
  genericEntry = false,
  programOptions = [],
  initialPhase = "choice",
  programOnly = false,
  tourEntryOption = null,
  onComplete,
  onBootstrapped,
  onProgramSelected,
  onAuthComplete,
  onRedirectApplyDashboard,
  onRedirectScheduleTour,
}: ApplicationAuthGateProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [phase, setPhase] = useState<AuthPhase>(initialPhase);
  const [direction, setDirection] = useState(1);
  const [mode, setMode] = useState<AuthMode>("create");
  const [entryIntent, setEntryIntent] = useState<AuthEntryIntent>("apply");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  useEffect(() => {
    if (!programOnly) return;

    let cancelled = false;

    async function prefillNamesFromMetadata() {
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user?.user_metadata) return;

      const meta = data.user.user_metadata;
      const metaFirst =
        typeof meta.first_name === "string" ? meta.first_name.trim() : "";
      const metaLast =
        typeof meta.last_name === "string" ? meta.last_name.trim() : "";

      if (metaFirst) {
        setFirstName(metaFirst);
      }
      if (metaLast) {
        setLastName(metaLast);
      }
      if (metaFirst || metaLast) {
        setMode("create");
      }
    }

    void prefillNamesFromMetadata();

    return () => {
      cancelled = true;
    };
  }, [programOnly, supabase.auth]);

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

  const bootstrapApplicant = async (bootstrapFormVersionId: string, bootstrapFormTitle: string) => {
    const response = await fetch("/api/admissions/applicant-bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId,
        formVersionId: bootstrapFormVersionId,
        firstName: mode === "create" ? firstName.trim() : undefined,
        lastName: mode === "create" ? lastName.trim() : undefined,
        schoolName,
        formTitle: bootstrapFormTitle,
        mode,
        forceNew,
        entryIntent,
      }),
    });

    const payload = (await response.json()) as BootstrapApplicantResult & {
      error?: string;
    };

    if (!response.ok) {
      const error = Object.assign(
        new Error(payload.error ?? "Failed to set up your application."),
        { status: response.status },
      );
      throw error;
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

  const bootstrapGenericProgramSelection = async (selectedFormVersionId: string) => {
    const option = programOptions.find(
      (row) => row.formVersionId === selectedFormVersionId,
    );
    const bootstrapTitle =
      option?.formTitle ?? option?.programName ?? "Application";

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await bootstrapApplicant(selectedFormVersionId, bootstrapTitle);
      if (result.action === "resume" && result.applicationId) {
        onProgramSelected?.(selectedFormVersionId);
        onAuthComplete?.();
        onComplete();
      }
    } catch (error) {
      reportApplyOperationalError(organizationId, "apply.applicant_bootstrap", error, {
        responseStatus:
          error && typeof error === "object" && "status" in error
            ? Number((error as { status: number }).status)
            : undefined,
      });
      setAuthError(
        error instanceof Error
          ? error.message
          : "Failed to set up your application.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const continueAfterAuth = async () => {
    if (
      schoolSlug &&
      (await attemptPostSignInRedirect(router, schoolSlug, "otp"))
    ) {
      return;
    }

    if (entryIntent === "schedule_campus_tour") {
      const result = await bootstrapApplicant(formVersionId, formTitle);
      if (result.action === "redirect_schedule_tour") {
        onRedirectScheduleTour?.();
      }
      return;
    }

    if (genericEntry && programOptions.length > 1) {
      goToPhase("program", 1);
      return;
    }

    if (genericEntry && programOptions.length === 1) {
      await bootstrapGenericProgramSelection(programOptions[0]!.formVersionId);
      return;
    }

    const result = await bootstrapApplicant(formVersionId, formTitle);
    if (
      result.action !== "redirect_apply_dashboard" &&
      result.action !== "redirect_teacher_portal" &&
      result.action !== "redirect_schedule_tour"
    ) {
      onComplete();
    }
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
      setIsSubmitting(false);
      return;
    }

    try {
      await continueAfterAuth();
    } catch (error) {
      reportApplyOperationalError(organizationId, "apply.applicant_bootstrap", error, {
        responseStatus:
          error && typeof error === "object" && "status" in error
            ? Number((error as { status: number }).status)
            : undefined,
      });
      setAuthError(
        error instanceof Error ? error.message : "Failed to set up your application.",
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

  const handleBackFromProgram = () => {
    if (programOnly) {
      onRedirectApplyDashboard?.();
      return;
    }
    goToPhase("verify", -1);
  };

  const handleProgramSelect = (selectedFormVersionId: string) => {
    void bootstrapGenericProgramSelection(selectedFormVersionId);
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
      : phase === "program"
        ? "Choose a program"
        : phase === "credentials"
        ? entryIntent === "schedule_campus_tour"
          ? "Schedule your campus tour"
          : mode === "create"
            ? "Create your account"
            : "Log in to continue"
        : "Check your email";

  const phaseSubtext =
    phase === "choice" ? (
      genericEntry ? (
        <>
          Save your progress at {schoolName} and pick up where you left off.
        </>
      ) : (
        <>
          Save your progress for{" "}
          <span className="font-extrabold text-[var(--sf-ink)]">
            {formTitle}
          </span>{" "}
          at {schoolName} and pick up where you left off.
        </>
      )
    ) : phase === "program" ? (
      "Select the program you want to apply for. You can start another application later for a sibling."
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
        <span className="font-extrabold text-[var(--sf-ink)]">
          {email}
        </span>
        . If it doesn&apos;t arrive within a minute, check your spam or junk folder.
      </>
    );

  return (
    <>
      <ApplyAuthGardenFrame
        branding={branding}
        schoolName={schoolName}
        aside={<AuthGatePromoColumn />}
      >
        <section className={APPLY_AUTH_CARD} aria-labelledby="apply-auth-heading">
          {phase !== "choice" && !(programOnly && phase === "program") ? (
            <button
              type="button"
              onClick={
                phase === "credentials"
                  ? handleBackToChoice
                  : phase === "program"
                    ? handleBackFromProgram
                    : handleBackToCredentials
              }
              disabled={isSubmitting}
              className={BACK_LINK}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
          ) : null}

          <GKicker>{genericEntry ? schoolName : formTitle}</GKicker>
          <h1
            id="apply-auth-heading"
            className={`sf-display m-0 mt-1.5 leading-[1.05] text-[var(--sf-ink)] ${
              phase === "choice"
                ? "text-[1.85rem] sm:text-[2.2rem]"
                : "text-[1.6rem] sm:text-[1.85rem]"
            }`}
          >
            {phaseHeading}
          </h1>
          <p className="m-0 mt-2.5 text-sm font-semibold leading-relaxed text-[var(--sf-soft)]">
            {phaseSubtext}
          </p>

          <div className="mt-6">
            {authError ? (
              <p className={ERROR_NOTE} role="alert">
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
                    className={OPTION_ROW}
                  >
                    <GIcon>
                      <UserPlus />
                    </GIcon>
                    <div className="min-w-0">
                      <p className={OPTION_TITLE}>Create an account</p>
                      <p className={OPTION_META}>New here? Start your application.</p>
                    </div>
                    <OptionChevron />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChooseMode("login")}
                    className={OPTION_ROW}
                  >
                    <GIcon>
                      <LogIn />
                    </GIcon>
                    <div className="min-w-0">
                      <p className={OPTION_TITLE}>Log in to continue</p>
                      <p className={OPTION_META}>
                        Already started? Pick up where you left off.
                      </p>
                    </div>
                    <OptionChevron />
                  </button>

                  {tourEntryOption ? (
                    <button
                      type="button"
                      onClick={handleChooseTour}
                      className={OPTION_ROW}
                    >
                      <GIcon>
                        <Building2 />
                      </GIcon>
                      <div className="min-w-0">
                        <p className={OPTION_TITLE}>
                          {tourEntryOption.label ?? "Schedule a tour of campus"}
                        </p>
                        <p className={OPTION_META}>
                          {tourEntryOption.description ??
                            "Meet with faculty and learn more about our school."}
                        </p>
                      </div>
                      <OptionChevron />
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
                  className="space-y-5"
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
                        />
                        <AuthField
                          id="auth-last-name"
                          label="Last name"
                          value={lastName}
                          onChange={setLastName}
                          required
                          autoComplete="family-name"
                          disabled={isSubmitting}
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
                    />

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={PRIMARY_BUTTON}
                      >
                        <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Sending code…">
                          Continue
                        </ButtonLoadingLabel>
                      </button>
                    </div>
                  </form>

                  <p className="m-0 text-sm font-semibold text-[var(--sf-soft)]">
                    {mode === "create" ? (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("login")}
                          className={TEXT_LINK}
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
                          className={TEXT_LINK}
                        >
                          Create an account
                        </button>
                      </>
                    )}
                  </p>
                </motion.div>
              ) : phase === "program" ? (
                <motion.div
                  key="program"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                >
                  <ul className="m-0 list-none space-y-3 p-0">
                    {programOptions.map((option) => (
                      <li key={option.formVersionId}>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleProgramSelect(option.formVersionId)}
                          className={OPTION_ROW}
                        >
                          <div className="min-w-0 flex-1">
                            <p className={OPTION_TITLE}>{option.programName}</p>
                            <p className={`${OPTION_META} line-clamp-2`}>
                              {option.intro || option.formTitle}
                            </p>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-0.5 text-sm font-extrabold text-[var(--sf-clay-deep)]">
                            Apply
                            <ChevronRight className="h-4 w-4" aria-hidden />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
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
                  className="space-y-5"
                >
                  <form onSubmit={handleVerifySubmit} className="space-y-4">
                    <VerificationCodeInput
                      id="auth-code"
                      label="Verification code"
                      value={code}
                      onChange={setCode}
                      disabled={isSubmitting}
                      autoFocus
                      variant="school-garden"
                    />

                    <p className="m-0 text-[13px] font-semibold leading-relaxed text-[var(--sf-soft)]">
                      Enter the 6-digit code from your email. If you don&apos;t see it,
                      check your spam or junk folder. Codes expire after a few minutes.
                    </p>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={!canVerify}
                        className={PRIMARY_BUTTON}
                      >
                        <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Verifying…">
                          Verify and continue
                        </ButtonLoadingLabel>
                      </button>
                    </div>
                  </form>

                  <p className="m-0 text-sm font-semibold text-[var(--sf-soft)]">
                    Didn&apos;t get a code?{" "}
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={!canResend}
                      className={TEXT_LINK}
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
        </section>
      </ApplyAuthGardenFrame>

      <AuthHelpButton />
    </>
  );
}
