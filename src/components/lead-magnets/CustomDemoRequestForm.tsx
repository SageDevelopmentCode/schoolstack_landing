"use client";

import { useId, useState, type FormEvent, type MouseEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Tick, btnOutline, btnPop } from "@/components/garden/ui";
import { GARDEN_FIELD } from "@/components/get-started/GetStartedStoryTextField";
import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";
import { scrollToSectionById } from "@/lib/marketing/book-demo-hash-context";
import { normalizeWebsiteUrl } from "@/lib/marketing/lead-magnets";
import { submitLead } from "@/lib/marketing/submit-lead";
import LeadHoneypot from "./LeadHoneypot";
import { CUSTOM_DEMO_COPY } from "./lead-magnet-copy";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COPY = CUSTOM_DEMO_COPY.form;

type Field = "name" | "email" | "school" | "website";

/**
 * "Build my preview" form (Garden). It posts a custom_demo lead. The API sends you a
 * Discord alert and emails the visitor a confirmation.
 */
export default function CustomDemoRequestForm({
  placement,
  compact = false,
  bookDemoHref = GET_STARTED_PAGE_PATH,
  onSuccess,
  autoFocus = false,
}: {
  /** Stored as magnet_detail so /admin/leads shows where the request came from. */
  placement: string;
  /** Popup layout: two columns become one, and the optional question is hidden. */
  compact?: boolean;
  bookDemoHref?: string;
  onSuccess?: () => void;
  autoFocus?: boolean;
}) {
  const uid = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Set<Field>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const fieldId = (f: string) => `${uid}-${f}`;

  function validate() {
    const next = new Set<Field>();
    if (!name.trim()) next.add("name");
    if (!EMAIL_PATTERN.test(email.trim())) next.add("email");
    if (!school.trim()) next.add("school");
    // Optional: only flag a website the visitor typed that we can't read.
    if (website.trim() && !normalizeWebsiteUrl(website)) next.add("website");
    setErrors(next);
    if (next.size) {
      const first = (["name", "email", "school", "website"] as Field[]).find((f) => next.has(f));
      if (first) document.getElementById(fieldId(first))?.focus();
    }
    return next.size === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitLead({
      magnet: "custom_demo",
      name: name.trim(),
      email: email.trim(),
      schoolName: school.trim(),
      websiteUrl: website.trim(),
      message: message.trim(),
      placement,
      companyWebsite: honeypot,
    });
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    setDone(true);
    onSuccess?.();
  }

  const clear = (f: Field) =>
    setErrors((prev) => {
      if (!prev.has(f)) return prev;
      const next = new Set(prev);
      next.delete(f);
      return next;
    });

  // A same-page hash scrolls to that section below the fixed navbar.
  const onBookDemoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!bookDemoHref.startsWith("#")) return;
    const id = bookDemoHref.slice(1);
    if (!document.getElementById(id)) return;
    e.preventDefault();
    scrollToSectionById(id);
  };

  if (done) {
    return (
      <div role="status" className="py-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sf-mint)] ring-2 ring-[var(--sf-ink)]">
          <Tick className="h-8 w-8" tick />
        </div>
        <p className="sf-display mt-5 text-3xl leading-[1.05] text-[var(--sf-ink)]">{CUSTOM_DEMO_COPY.success.title}</p>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[var(--sf-soft)]">
          {CUSTOM_DEMO_COPY.success.body}
        </p>
        <a href={bookDemoHref} onClick={onBookDemoClick} className={`${btnOutline} mt-6 !px-6 !py-3 !text-sm`}>
          {CUSTOM_DEMO_COPY.success.bookLabel}
        </a>
      </div>
    );
  }

  const input = (f: Field) =>
    `${GARDEN_FIELD.input} ${errors.has(f) ? GARDEN_FIELD.inputError : GARDEN_FIELD.inputOk} ${compact ? "!py-2.5 sm:!py-3" : ""}`;
  const labelClass = compact ? `${GARDEN_FIELD.label} !mb-1.5` : GARDEN_FIELD.label;
  const describedBy = (f: Field, helper = false) =>
    [helper ? fieldId(`${f}-helper`) : null, errors.has(f) ? fieldId(`${f}-error`) : null].filter(Boolean).join(" ") ||
    undefined;
  const errorText = (f: Field, text: string) =>
    errors.has(f) ? (
      <p id={fieldId(`${f}-error`)} className={GARDEN_FIELD.error} role="alert">
        {text}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="relative text-[var(--sf-ink)]">
      <LeadHoneypot value={honeypot} onChange={setHoneypot} />
      <div className={`grid grid-cols-1 ${compact ? "gap-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3" : "gap-4 sm:grid-cols-2 sm:gap-5"}`}>
        <div>
          <label htmlFor={fieldId("name")} className={labelClass}>
            {COPY.nameLabel}
          </label>
          <input
            id={fieldId("name")}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clear("name");
            }}
            autoComplete="given-name"
            maxLength={120}
            autoFocus={autoFocus}
            aria-invalid={errors.has("name")}
            aria-describedby={describedBy("name")}
            className={input("name")}
          />
          {errorText("name", COPY.errors.name)}
        </div>
        <div>
          <label htmlFor={fieldId("email")} className={labelClass}>
            {COPY.emailLabel}
          </label>
          <input
            id={fieldId("email")}
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clear("email");
            }}
            autoComplete="email"
            maxLength={254}
            aria-invalid={errors.has("email")}
            aria-describedby={describedBy("email")}
            className={input("email")}
          />
          {errorText("email", COPY.errors.email)}
        </div>
        <div>
          <label htmlFor={fieldId("school")} className={labelClass}>
            {COPY.schoolLabel}
          </label>
          <input
            id={fieldId("school")}
            value={school}
            onChange={(e) => {
              setSchool(e.target.value);
              clear("school");
            }}
            autoComplete="organization"
            maxLength={200}
            aria-invalid={errors.has("school")}
            aria-describedby={describedBy("school")}
            className={input("school")}
          />
          {errorText("school", COPY.errors.school)}
        </div>
        <div>
          <label htmlFor={fieldId("website")} className={labelClass}>
            {COPY.websiteLabel} <span className={GARDEN_FIELD.optional}>{COPY.websiteOptional}</span>
          </label>
          <input
            id={fieldId("website")}
            type="url"
            inputMode="url"
            value={website}
            onChange={(e) => {
              setWebsite(e.target.value);
              clear("website");
            }}
            placeholder={COPY.websitePlaceholder}
            autoComplete="url"
            maxLength={500}
            aria-invalid={errors.has("website")}
            aria-describedby={describedBy("website")}
            className={input("website")}
          />
          {errorText("website", COPY.errors.website)}
        </div>
        {!compact ? (
          <div className="sm:col-span-2">
            <label htmlFor={fieldId("message")} className={GARDEN_FIELD.label}>
              {COPY.messageLabel} <span className={GARDEN_FIELD.optional}>{COPY.messageOptional}</span>
            </label>
            <textarea
              id={fieldId("message")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={COPY.messagePlaceholder}
              maxLength={1000}
              rows={3}
              className={`${GARDEN_FIELD.input} ${GARDEN_FIELD.inputOk} resize-y`}
            />
          </div>
        ) : null}
      </div>

      <div className={compact ? "mt-4 sm:mt-5" : "mt-7 border-t-2 border-dashed border-[var(--sf-ink)]/15 pt-6"}>
        <button
          type="submit"
          disabled={submitting}
          className={`${btnPop} w-full disabled:cursor-wait disabled:opacity-80 ${compact ? "!py-3.5 sm:!py-4" : ""}`}
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden />
              {COPY.submitting}
            </>
          ) : (
            <>
              {COPY.submit}
              <ArrowRight size={18} strokeWidth={2.6} aria-hidden />
            </>
          )}
        </button>
        {submitError ? (
          <p className="mt-3 text-center text-[13px] font-bold text-[var(--sf-clay-deep)]" role="alert">
            {submitError}
          </p>
        ) : null}
        <p className="mt-3 text-center text-xs leading-relaxed text-[var(--sf-soft)]">{COPY.privacy}</p>
      </div>
    </form>
  );
}
