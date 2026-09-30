"use client";

import { useState } from "react";
import { SITE_NAME } from "@/lib/site";

type Props = {
  email: string;
  token: string;
  invalidLink: boolean;
};

export default function UnsubscribeConfirmClient({
  email,
  token,
  invalidLink,
}: Props) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleConfirm() {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (invalidLink) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-stone-900 mb-3">
          Link not valid
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          This unsubscribe link is missing information or is no longer valid. Use
          the link at the bottom of a recent {SITE_NAME} email, or contact us if
          you need help.
        </p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-stone-900 mb-3">
          You&apos;re unsubscribed
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          <span className="font-medium text-stone-800">{email}</span> will no
          longer receive non-essential emails from {SITE_NAME}, such as reminders
          and digests. You&apos;ll still get receipts and confirmations when you
          take action in the product.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm max-w-md w-full">
      <h1 className="text-xl font-semibold text-stone-900 mb-2 text-center">
        Unsubscribe from non-essential emails
      </h1>
      <p className="text-stone-600 text-sm leading-relaxed mb-6 text-center">
        Confirm that{" "}
        <span className="font-medium text-stone-800">{email}</span> should stop
        receiving reminders, digests, and other non-essential messages from{" "}
        {SITE_NAME}. Payment receipts, application confirmations, and similar
        messages will still be sent when needed.
      </p>
      {errorMessage ? (
        <p className="text-sm text-red-700 mb-4 text-center" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={status === "loading"}
        className="w-full rounded-lg bg-[#2E4A3C] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
      >
        {status === "loading" ? "Saving…" : "Confirm unsubscribe"}
      </button>
    </div>
  );
}
