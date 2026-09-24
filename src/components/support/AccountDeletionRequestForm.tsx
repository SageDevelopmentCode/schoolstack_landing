"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import TurnstileField, {
  isTurnstileClientConfigured,
} from "@/components/public-forms/TurnstileField";
import { MAX_PUBLIC_SUPPORT_DESCRIPTION_LENGTH } from "@/lib/public-support/public-support-validation";

const inputClassName =
  "w-full rounded-md bg-white border border-black/[0.09] px-3 py-2.5 text-sm text-[#2E4A3C] placeholder-[#2E4A3C]/40 font-body outline-none focus:ring-2 focus:ring-[#2E4A3C]/30 focus:border-[#2E4A3C] transition";

const textareaClassName =
  "w-full min-h-[120px] resize-y rounded-md bg-white border border-black/[0.09] px-3 py-2.5 text-sm text-[#2E4A3C] placeholder-[#2E4A3C]/40 font-body outline-none focus:ring-2 focus:ring-[#2E4A3C]/30 focus:border-[#2E4A3C] transition";

export default function AccountDeletionRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRequired = isTurnstileClientConfigured();

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    !isSubmitting &&
    (!turnstileRequired || turnstileToken);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const trimmedMessage =
      message.trim() ||
      "Please delete my MudKitchen account and remove my login access.";

    try {
      const response = await fetch("/api/public-support-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic: "account-deletion",
          message: trimmedMessage,
          sourcePagePath: "/account-deletion",
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
        <h2 className="font-display text-2xl text-text">Request received</h2>
        <p className="mt-3 text-[15px] font-secondary text-text-muted leading-relaxed max-w-md mx-auto">
          We received your account deletion request and will follow up at the
          email you provided — usually within one business day. You may hear
          from us sooner if we need to confirm details before removing your
          login.
        </p>
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
          <label
            htmlFor="deletion-name"
            className="block text-sm font-medium text-text mb-1.5"
          >
            Name
          </label>
          <input
            id="deletion-name"
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
          <label
            htmlFor="deletion-email"
            className="block text-sm font-medium text-text mb-1.5"
          >
            Email on your MudKitchen account
          </label>
          <input
            id="deletion-email"
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
        <label
          htmlFor="deletion-message"
          className="block text-sm font-medium text-text mb-1.5"
        >
          Additional details (optional)
        </label>
        <textarea
          id="deletion-message"
          value={message}
          maxLength={MAX_PUBLIC_SUPPORT_DESCRIPTION_LENGTH}
          onChange={(event) => setMessage(event.target.value)}
          className={textareaClassName}
          placeholder="Anything else we should know before removing your account?"
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
          Request account deletion
        </ButtonLoadingLabel>
      </button>
    </form>
  );
}
