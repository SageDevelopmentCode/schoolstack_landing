"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { btnPop } from "@/components/garden/ui";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import VerificationCodeInput from "@/components/ui/VerificationCodeInput";
import { DEMO_REQUEST_ROLE_OPTIONS, type DemoRequestRoleId } from "@/lib/demo-request-roles";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";
import { STUDENT_COUNT_OPTIONS, type StudentCountId } from "@/lib/student-count-options";
import { createClient } from "@/utils/supabase/client";

type Phase = "details" | "verify";

const inputClassName =
  "w-full rounded-2xl border-2 border-[var(--sf-ink)]/80 bg-white px-4 py-3 text-base text-[var(--sf-ink)] outline-none transition focus-visible:border-[var(--sf-ink)] focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

const chipClassName =
  "rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";
const chipIdleClassName =
  "border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)] hover:border-[var(--sf-ink)]/50";
const chipCheckedClassName =
  "border-[var(--sf-forest)] bg-[var(--sf-mint)] text-[var(--sf-forest-deep)] shadow-[0_2px_0_0_var(--sf-forest)]";

const ROLE_CHOICES = DEMO_REQUEST_ROLE_OPTIONS.map((option) => ({
  id: option.id,
  label: option.title,
}));

const STUDENT_COUNT_CHOICES = STUDENT_COUNT_OPTIONS.map((option) => ({
  id: option.id,
  label: option.shortLabel,
}));

/** Optional single-choice chips. Arrow keys move and select; picking the checked chip again clears it. */
function ChoiceChips<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T | null;
  onChange: (next: T | null) => void;
  disabled?: boolean;
}) {
  const labelId = useId();
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const checkedIndex = options.findIndex((option) => option.id === value);
  const focusableIndex = checkedIndex >= 0 ? checkedIndex : 0;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].id);
    chipRefs.current[next]?.focus();
  }

  return (
    <div>
      <p id={labelId} className="mb-2 text-sm font-extrabold text-[var(--sf-ink)]">
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {options.map((option, index) => {
          const checked = option.id === value;
          return (
            <button
              key={option.id}
              ref={(node) => {
                chipRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={index === focusableIndex ? 0 : -1}
              disabled={disabled}
              className={`${chipClassName} ${checked ? chipCheckedClassName : chipIdleClassName} disabled:cursor-not-allowed disabled:opacity-60`}
              onClick={() => onChange(checked ? null : option.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
  const [firstName, setFirstName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [code, setCode] = useState("");
  const [role, setRole] = useState<DemoRequestRoleId | null>(null);
  const [studentCount, setStudentCount] = useState<StudentCountId | null>(null);
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
        firstName: firstName.trim(),
        role,
        studentCount,
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
            <span className="mb-2 block text-sm font-extrabold text-[var(--sf-ink)]">
              First name
            </span>
            <input
              className={inputClassName}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
              required
              maxLength={80}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-[var(--sf-ink)]">
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
            <span className="mb-2 block text-sm font-extrabold text-[var(--sf-ink)]">
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
          {error ? (
            <p role="alert" className="rounded-2xl bg-[var(--sf-peach)] px-4 py-2.5 text-sm font-semibold text-[var(--sf-clay-deep)]">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className={`${btnPop} w-full disabled:cursor-not-allowed disabled:opacity-60`}
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
          <p className="text-[15px] text-[var(--sf-soft)]">
            Enter the 6-digit code sent to {email.trim().toLowerCase()}.
          </p>
          <VerificationCodeInput variant="garden" value={code} onChange={setCode} autoFocus />
          <fieldset className="space-y-4 rounded-[26px] border-2 border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-4 py-4">
            <legend className="px-1 text-sm font-extrabold text-[var(--sf-soft)]">
              Help us set things up (optional)
            </legend>
            <ChoiceChips
              label="Which best describes you?"
              options={ROLE_CHOICES}
              value={role}
              onChange={setRole}
              disabled={isSubmitting}
            />
            <ChoiceChips
              label="How many students?"
              options={STUDENT_COUNT_CHOICES}
              value={studentCount}
              onChange={setStudentCount}
              disabled={isSubmitting}
            />
          </fieldset>
          {error ? (
            <p role="alert" className="rounded-2xl bg-[var(--sf-peach)] px-4 py-2.5 text-sm font-semibold text-[var(--sf-clay-deep)]">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className={`${btnPop} w-full disabled:cursor-not-allowed disabled:opacity-60`}
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
            className="rounded-full text-sm font-extrabold text-[var(--sf-forest)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-forest)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
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
