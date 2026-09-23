"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import TurnstileField, {
  isTurnstileClientConfigured,
} from "@/components/public-forms/TurnstileField";
import {
  PUBLIC_SUPPORT_REQUEST_TOPICS,
  PUBLIC_SUPPORT_REQUEST_TOPIC_LABELS,
  type PublicSupportRequestTopic,
} from "@/lib/public-support/public-support-types";
import { MAX_PUBLIC_SUPPORT_DESCRIPTION_LENGTH } from "@/lib/public-support/public-support-validation";

const inputClassName =
  "w-full rounded-md bg-white border border-black/[0.09] px-3 py-2.5 text-sm text-[#2E4A3C] placeholder-[#2E4A3C]/40 font-body outline-none focus:ring-2 focus:ring-[#2E4A3C]/30 focus:border-[#2E4A3C] transition";

const textareaClassName =
  "w-full min-h-[160px] resize-y rounded-md bg-white border border-black/[0.09] px-3 py-2.5 text-sm text-[#2E4A3C] placeholder-[#2E4A3C]/40 font-body outline-none focus:ring-2 focus:ring-[#2E4A3C]/30 focus:border-[#2E4A3C] transition";

export default function PublicSupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<PublicSupportRequestTopic>("general");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRequired = isTurnstileClientConfigured();

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    message.trim().length > 0 &&
    !isSubmitting &&
    (!turnstileRequired || turnstileToken);

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
          turnstileToken,
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
      setTurnstileToken(null);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-clay/20 bg-clay/5 px-6 py-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-clay/15">
          <Check className="h-6 w-6 text-clay" aria-hidden />
        </div>
        <h2 className="font-display text-2xl text-text">Message sent</h2>
        <p className="mt-3 text-[15px] font-secondary text-text-muted leading-relaxed max-w-md mx-auto">
          Thanks for reaching out. We received your support request and will get
          back to you as soon as we can — usually within one business day.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-medium text-clay hover:text-clay/80 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="rounded-2xl border border-black/[0.08] bg-white px-6 py-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] sm:px-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="support-name" className="block text-sm font-medium text-text mb-1.5">
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
          <label htmlFor="support-email" className="block text-sm font-medium text-text mb-1.5">
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
        <label htmlFor="support-topic" className="block text-sm font-medium text-text mb-1.5">
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
        <label htmlFor="support-message" className="block text-sm font-medium text-text mb-1.5">
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
        <p className="mt-2 text-xs text-text-faint font-secondary">
          {message.length.toLocaleString()} /{" "}
          {MAX_PUBLIC_SUPPORT_DESCRIPTION_LENGTH.toLocaleString()} characters
        </p>
      </div>

      {submitError ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="mt-5">
        <TurnstileField onTokenChange={setTurnstileToken} />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className={`mt-6 inline-flex h-11 items-center justify-center rounded-pill bg-clay px-6 text-sm font-semibold text-white transition hover:bg-clay/90 disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_LOADING_LAYOUT_CLASS}`}
      >
        <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Sending…">
          Send message
        </ButtonLoadingLabel>
      </button>
    </form>
  );
}
