"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CircleHelp, LogIn, UserPlus } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { AUTH_GATE_PROMO } from "@/lib/site";

type AuthMode = "create" | "login";
type AuthPhase = "choice" | "credentials" | "verify";

export type ApplicationAuthGateProps = {
  branding: OrganizationBranding;
  schoolName: string;
  formTitle: string;
  onComplete: () => void;
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
  C,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2"
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
            className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border transition ${
              isActive
                ? "border-white ring-2 ring-white opacity-100"
                : "border-white/20 opacity-70 hover:opacity-90"
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
                className={`mt-4 font-display font-medium leading-[1.08] text-white ${
                  compact
                    ? "text-[clamp(1.5rem,5vw,2rem)]"
                    : "text-[clamp(1.75rem,2.5vw,2.5rem)]"
                }`}
              >
                {slide.headlineLead}
                <br />
                <em style={{ color: "#E8D5C8", fontStyle: "italic" }}>
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
  onComplete,
}: ApplicationAuthGateProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const pageBg = branding.colors.bg;

  const [phase, setPhase] = useState<AuthPhase>("choice");
  const [direction, setDirection] = useState(1);
  const [mode, setMode] = useState<AuthMode>("create");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((index) => (index + 1) % AUTH_GATE_PROMO.slides.length);
    }, AUTH_GATE_PROMO.slideIntervalMs);
    return () => clearInterval(id);
  }, []);

  const goToPhase = (nextPhase: AuthPhase, nextDirection: number) => {
    setDirection(nextDirection);
    setPhase(nextPhase);
  };

  const handleChooseMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    goToPhase("credentials", 1);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Future: supabase.auth.signInWithOtp({
    //   email,
    //   options: {
    //     shouldCreateUser: mode === "create",
    //     data: mode === "create" ? { full_name: name } : undefined,
    //   },
    // })
    goToPhase("verify", 1);
    setCode("");
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Future: supabase.auth.verifyOtp({ email, token: code, type: "email" })
    onComplete();
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
    }
  };

  const normalizedCode = code.replace(/\D/g, "").slice(0, 6);
  const canVerify = normalizedCode.length === 6;

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
        .
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
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition hover:opacity-80"
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
                  className="rounded-xl border p-6 shadow-sm"
                  style={{
                    borderColor: C.border,
                    backgroundColor: C.surface,
                  }}
                >
                  <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                    {mode === "create" ? (
                      <AuthField
                        id="auth-name"
                        label="Full name"
                        value={name}
                        onChange={setName}
                        required
                        autoComplete="name"
                        C={C}
                      />
                    ) : null}

                    <AuthField
                      id="auth-email"
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      required
                      autoComplete="email"
                      C={C}
                    />

                    <button
                      type="submit"
                      className="mt-2 w-full rounded-md px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: C.accent }}
                    >
                      Continue
                    </button>
                  </form>

                  <p className="mt-4 text-center text-sm" style={{ color: C.textSecondary }}>
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
                  className="rounded-xl border p-6 shadow-sm"
                  style={{
                    borderColor: C.border,
                    backgroundColor: C.surface,
                  }}
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
                      C={C}
                    />

                    <p className="text-xs" style={{ color: C.textSecondary }}>
                      Enter the 6-digit code from your email. Codes expire after a few
                      minutes.
                    </p>

                    <button
                      type="submit"
                      disabled={!canVerify}
                      className="w-full rounded-md px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ backgroundColor: C.accent }}
                    >
                      Verify and continue
                    </button>
                  </form>

                  <p className="mt-4 text-center text-sm" style={{ color: C.textSecondary }}>
                    Didn&apos;t get a code?{" "}
                    <button
                      type="button"
                      disabled
                      title="Coming soon"
                      className="font-medium underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ color: C.accent }}
                    >
                      Resend code
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
