"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BOLD_HEADING, DARK_PILL } from "@/components/home/bright-styles";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import VerificationCodeInput from "@/components/ui/VerificationCodeInput";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";
import { createClient } from "@/utils/supabase/client";

type Phase = "details" | "verify";

const inputClassName =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-[#1d1a16] outline-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d1a16]";

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago";
  } catch {
    return "America/Chicago";
  }
}

export default function TryFreeSchoolForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [phase, setPhase] = useState<Phase>("details");
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [code, setCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timezone = browserTimezone();
  const normalizedEmail = email.trim().toLowerCase();

  async function prepareSignup() {
    const response = await fetch("/api/try/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        schoolName: schoolName.trim(),
        timezone,
        [PUBLIC_FORM_HONEYPOT_FIELD]: companyWebsite,
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      throw new Error(payload?.error || "Could not start signup.");
    }
  }

  async function sendCode() {
    await prepareSignup();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    if (otpError) {
      throw new Error(otpError.message);
    }
  }

  async function handleDetailsSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await sendCode();
      setEmailVerified(false);
      setPhase("verify");
      setCode("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not send a verification code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function hasConfirmedSessionForEmail(): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return (
      Boolean(user?.email_confirmed_at) &&
      (user?.email?.trim().toLowerCase() ?? "") === normalizedEmail
    );
  }

  async function ensureEmailVerified(token: string) {
    if (emailVerified || (await hasConfirmedSessionForEmail())) {
      setEmailVerified(true);
      return;
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token,
      type: "email",
    });
    if (verifyError) {
      throw new Error(verifyError.message);
    }
    setEmailVerified(true);
  }

  async function completeFreeSchool() {
    const response = await fetch("/api/try/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolName: schoolName.trim(),
        timezone,
      }),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      slug?: string;
    } | null;
    if (!response.ok || !payload?.slug) {
      throw new Error(payload?.error || "Could not create your school.");
    }

    router.replace(`/school/${payload.slug}/admin`);
    router.refresh();
  }

  async function handleVerifySubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const token = code.replace(/\D/g, "").slice(0, 6);

    try {
      await ensureEmailVerified(token);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not verify that code.",
      );
      setIsSubmitting(false);
      return;
    }

    try {
      await completeFreeSchool();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create your school.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-8">
      <label className="hidden" aria-hidden="true">
        Company website
        <input
          type="text"
          name={PUBLIC_FORM_HONEYPOT_FIELD}
          value={companyWebsite}
          onChange={(event) => setCompanyWebsite(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>

      {phase === "details" ? (
        <form className="space-y-4" onSubmit={handleDetailsSubmit}>
          <label className="block">
            <span className={`${BOLD_HEADING} mb-2 block text-sm tracking-normal!`}>
              School name
            </span>
            <input
              className={inputClassName}
              value={schoolName}
              onChange={(event) => setSchoolName(event.target.value)}
              autoComplete="organization"
              required
              maxLength={200}
            />
          </label>
          <label className="block">
            <span className={`${BOLD_HEADING} mb-2 block text-sm tracking-normal!`}>
              Email
            </span>
            <input
              className={inputClassName}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            className={`${DARK_PILL} w-full justify-center disabled:cursor-not-allowed disabled:opacity-60`}
            disabled={isSubmitting}
          >
            <span className={BUTTON_LOADING_LAYOUT_CLASS}>
              <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Sending code">
                Email me a code
              </ButtonLoadingLabel>
            </span>
          </button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleVerifySubmit}>
          <p className="text-sm text-[#5c564e]">
            Enter the 6-digit code sent to {email.trim().toLowerCase()}.
          </p>
          <VerificationCodeInput variant="bright" value={code} onChange={setCode} autoFocus />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            className={`${DARK_PILL} w-full justify-center disabled:cursor-not-allowed disabled:opacity-60`}
            disabled={
              isSubmitting ||
              (!emailVerified && code.replace(/\D/g, "").length < 6)
            }
          >
            <span className={BUTTON_LOADING_LAYOUT_CLASS}>
              <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Creating school">
                Create my school
              </ButtonLoadingLabel>
            </span>
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-[#1d1a16] underline-offset-4 hover:underline"
            disabled={isSubmitting}
            onClick={() => {
              setPhase("details");
              setEmailVerified(false);
              setCode("");
              setError(null);
            }}
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
  );
}
