"use client";

import { useId, useState, type FormEvent } from "react";
import { Loader2, Mail } from "lucide-react";
import { Tick, btnPop } from "@/components/garden/ui";
import { GARDEN_FIELD } from "@/components/get-started/GetStartedStoryTextField";
import type { FreeToolPlanId } from "@/lib/marketing/lead-magnets";
import { submitLead } from "@/lib/marketing/submit-lead";
import LeadHoneypot from "./LeadHoneypot";
import { EMAIL_PLAN_COPY as COPY } from "./lead-magnet-copy";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Optional "email me my results" card for the free tools. The results stay on the page
 * either way: this is a convenience, not a gate. `getLines` builds the plain-text results
 * when the visitor submits. The API removes links and caps the length before emailing them.
 */
export default function EmailMyPlan({
  toolId,
  getLines,
  className = "",
}: {
  toolId: FreeToolPlanId;
  getLines: () => string[];
  className?: string;
}) {
  const uid = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError(true);
      document.getElementById(`${uid}-email`)?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitLead({
      magnet: "tool_plan",
      toolId,
      email: email.trim(),
      name: name.trim(),
      planLines: getLines(),
      companyWebsite: honeypot,
    });
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    setSentTo(email.trim());
  }

  return (
    <section
      aria-labelledby={`${uid}-title`}
      className={`calculator-print-hide relative rounded-[26px] border-2 border-[var(--sf-ink)] bg-[var(--sf-sky)]/60 px-5 py-6 shadow-[0_5px_0_0_var(--sf-ink)] print:hidden sm:px-7 ${className}`}
    >
      <div className="flex items-start gap-4">
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-[var(--sf-ink)] sm:flex">
          <Mail className="h-5 w-5 text-[#24507a]" strokeWidth={2.4} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`${uid}-title`} className="sf-display text-[1.6rem] leading-[1.05] text-[var(--sf-ink)]">
            {COPY.title}
          </h2>
          {sentTo ? (
            <p role="status" className="mt-3 flex items-center gap-2 text-[15px] font-bold text-[var(--sf-forest)]">
              <Tick className="h-6 w-6 shrink-0" tick />
              {COPY.success}
            </p>
          ) : (
            <>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--sf-ink)]/75">{COPY.body}</p>
              <form onSubmit={handleSubmit} noValidate className="relative mt-4">
                <LeadHoneypot value={honeypot} onChange={setHoneypot} />
                <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-end">
                  <div>
                    <label htmlFor={`${uid}-name`} className={GARDEN_FIELD.label}>
                      {COPY.nameLabel} <span className={GARDEN_FIELD.optional}>{COPY.nameOptional}</span>
                    </label>
                    <input
                      id={`${uid}-name`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="given-name"
                      maxLength={120}
                      className={`${GARDEN_FIELD.input} ${GARDEN_FIELD.inputOk} !py-3`}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-email`} className={GARDEN_FIELD.label}>
                      {COPY.emailLabel}
                    </label>
                    <input
                      id={`${uid}-email`}
                      type="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError(false);
                      }}
                      autoComplete="email"
                      maxLength={254}
                      aria-invalid={emailError}
                      aria-describedby={emailError ? `${uid}-email-error` : undefined}
                      className={`${GARDEN_FIELD.input} ${emailError ? GARDEN_FIELD.inputError : GARDEN_FIELD.inputOk} !py-3`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${btnPop} !px-6 !py-3 !text-[15px] disabled:cursor-wait disabled:opacity-80`}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
                    {submitting ? COPY.submitting : COPY.submit}
                  </button>
                </div>
                {emailError ? (
                  <p id={`${uid}-email-error`} className={GARDEN_FIELD.error} role="alert">
                    {COPY.errors.email}
                  </p>
                ) : null}
                {submitError ? (
                  <p className="mt-2 text-[13px] font-bold text-[var(--sf-clay-deep)]" role="alert">
                    {submitError}
                  </p>
                ) : null}
                <p className="mt-3 text-xs leading-relaxed text-[var(--sf-soft)]">{COPY.privacy}</p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
