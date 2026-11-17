"use client";

import { useState } from "react";
import { btnPop, Tick } from "@/components/garden/ui";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import PublicFormHoneypotField from "@/components/public-forms/PublicFormHoneypotField";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";
import {
  PUBLIC_SUPPORT_REQUEST_TOPICS,
  PUBLIC_SUPPORT_REQUEST_TOPIC_LABELS,
  type PublicSupportRequestTopic,
} from "@/lib/public-support/public-support-types";
import { MAX_PUBLIC_SUPPORT_DESCRIPTION_LENGTH } from "@/lib/public-support/public-support-validation";

const inputClassName =
  "w-full rounded-2xl border-2 border-[var(--sf-ink)]/80 bg-white px-4 py-3 text-base text-[var(--sf-ink)] placeholder:text-[var(--sf-soft)]/70 outline-none transition focus-visible:border-[var(--sf-ink)] focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

const textareaClassName = `${inputClassName} min-h-[160px] resize-y`;

const labelClassName = "mb-2 block text-sm font-extrabold text-[var(--sf-ink)]";

export default function PublicSupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<PublicSupportRequestTopic>("general");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [companyWebsite, setCompanyWebsite] = useState("");

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    message.trim().length > 0 &&
    !isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/public-support-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic,
          message: message.trim(),
          sourcePagePath: "/support",
          [PUBLIC_FORM_HONEYPOT_FIELD]: companyWebsite,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setTopic("general");
      setMessage("");
      setCompanyWebsite("");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[26px] border-2 border-[var(--sf-forest)] bg-[var(--sf-mint)] px-6 py-10 text-center shadow-[0_4px_0_0_var(--sf-forest)]">
        <Tick className="mx-auto mb-4 h-14 w-14" />
        <h2 className="sf-display text-3xl leading-[1.05] text-[var(--sf-ink)]">Message sent</h2>
        <p className="mx-auto mt-3 max-w-md text-[16px] leading-relaxed text-[var(--sf-ink)]/80">
          Thanks for reaching out. We received your support request and will get
          back to you as soon as we can — usually within one business day.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 rounded-full text-sm font-extrabold text-[var(--sf-forest)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-forest)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-forest)]/40"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="relative"
    >
      <PublicFormHoneypotField
        value={companyWebsite}
        onChange={setCompanyWebsite}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="support-name" className={labelClassName}>
            Name
          </label>
          <input
            id="support-name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="support-email" className={labelClassName}>
            Email
          </label>
          <input
            id="support-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            placeholder="you@school.org"
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="support-topic" className={labelClassName}>
          Topic
        </label>
        <select
          id="support-topic"
          required
          value={topic}
          onChange={(event) =>
            setTopic(event.target.value as PublicSupportRequestTopic)
          }
          className={inputClassName}
        >
          {PUBLIC_SUPPORT_REQUEST_TOPICS.map((option) => (
            <option key={option} value={option}>
              {PUBLIC_SUPPORT_REQUEST_TOPIC_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label htmlFor="support-message" className={labelClassName}>
          Message
        </label>
        <textarea
          id="support-message"
          required
          value={message}
          maxLength={MAX_PUBLIC_SUPPORT_DESCRIPTION_LENGTH}
          onChange={(event) => setMessage(event.target.value)}
          className={textareaClassName}
          placeholder="Tell us how we can help..."
        />
        <p className="mt-2 text-xs font-semibold text-[var(--sf-soft)]">
          {message.length.toLocaleString()} /{" "}
          {MAX_PUBLIC_SUPPORT_DESCRIPTION_LENGTH.toLocaleString()} characters
        </p>
      </div>

      {submitError ? (
        <p className="mt-5 rounded-2xl bg-[var(--sf-peach)] px-4 py-2.5 text-sm font-semibold text-[var(--sf-clay-deep)]" role="alert">
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className={`${btnPop} mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto`}
      >
        <span className={BUTTON_LOADING_LAYOUT_CLASS}>
          <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Sending…">
            Send message
          </ButtonLoadingLabel>
        </span>
      </button>
    </form>
  );
}
