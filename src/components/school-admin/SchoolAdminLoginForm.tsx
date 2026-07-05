"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

const RESEND_COOLDOWN_SECONDS = 60;

type AuthPhase = "email" | "verify" | "password";

type SchoolAdminLoginFormProps = {
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
};

const inputClassName = "w-full rounded-md border px-3 py-2.5 text-sm";

export default function SchoolAdminLoginForm({
  slug,
  schoolName,
  branding,
}: SchoolAdminLoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  const nextPath = searchParams.get("next") || `/school/${slug}/admin`;

  const [phase, setPhase] = useState<AuthPhase>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        router.replace(nextPath);
        router.refresh();
        return;
      }

      setCheckingSession(false);
    }

    void checkExistingSession();

    return () => {
      cancelled = true;
    };
  }, [nextPath, router, supabase.auth]);

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

  const switchToOtpEmail = () => {
    setPhase("email");
    setPassword("");
    setCode("");
    setError(null);
  };

  const switchToPassword = () => {
    setPhase("password");
    setCode("");
    setError(null);
  };

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await sendOtp();
      setPhase("verify");
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

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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

      router.replace(nextPath);
      router.refresh();
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

  const handleVerifySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const normalizedCode = code.replace(/\D/g, "").slice(0, 6);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: normalizedCode,
        type: "email",
      });

      if (verifyError) {
        throw new Error(verifyError.message);
      }

      router.replace(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Verification failed. Please try again.",
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

  const normalizedCode = code.replace(/\D/g, "").slice(0, 6);
  const logoSrc = branding.logo.src.trim();

  const phaseSubtext =
    phase === "email"
      ? "Enter your email to receive a verification code."
      : phase === "password"
        ? "Sign in with your email and password."
        : `We sent a code to ${email.trim().toLowerCase()}.`;

  if (checkingSession) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center"
        style={{ backgroundColor: C.bg }}
      >
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: C.accent }}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-dvh items-center justify-center px-6 py-12"
      style={{ backgroundColor: C.bg, color: C.textPrimary }}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3 text-center">
          {logoSrc ? (
            <div className="flex justify-center">
              <Image
                src={logoSrc}
                alt={branding.logo.alt || schoolName}
                width={branding.logo.width || 180}
                height={branding.logo.height || 52}
                className="h-12 w-auto object-contain"
              />
            </div>
          ) : (
            <p className="text-lg font-semibold" style={{ color: C.accentDark }}>
              {schoolName}
            </p>
          )}
          <div>
            <h1 className="text-xl font-semibold">School admin sign in</h1>
            <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
              {phaseSubtext}
            </p>
          </div>
        </div>

        {error ? (
          <p
            className="rounded-md border px-3 py-2 text-sm"
            style={{
              borderColor: C.errorBorder,
              backgroundColor: C.errorBg,
              color: C.error,
            }}
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {phase === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
                style={inputStyle}
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: C.accent }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending code…
                </>
              ) : (
                "Send verification code"
              )}
            </button>
            <p className="text-center">
              <button
                type="button"
                onClick={switchToPassword}
                className="text-xs underline-offset-2 hover:underline"
                style={{ color: C.textTertiary }}
              >
                Sign in with password
              </button>
            </p>
          </form>
        ) : phase === "password" ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
                style={inputStyle}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClassName}
                style={inputStyle}
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: C.accent }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
            <p className="text-center">
              <button
                type="button"
                onClick={switchToOtpEmail}
                className="text-xs underline-offset-2 hover:underline"
                style={{ color: C.textTertiary }}
              >
                Use verification code instead
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Verification code</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className={`${inputClassName} tracking-[0.3em]`}
                style={inputStyle}
                placeholder="000000"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting || normalizedCode.length !== 6}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: C.accent }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Sign in"
              )}
            </button>
            <div className="flex items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={switchToOtpEmail}
                className="underline-offset-2 hover:underline"
                style={{ color: C.textSecondary }}
              >
                Use a different email
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isSubmitting}
                className="underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: C.accent }}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
