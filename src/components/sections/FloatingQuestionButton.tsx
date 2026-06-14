"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Check } from "lucide-react";

const inputClassName =
  "w-full rounded-md bg-white border border-black/[0.09] px-3 py-2.5 text-sm text-[#2E4A3C] placeholder-[#2E4A3C]/40 font-body outline-none focus:ring-2 focus:ring-[#2E4A3C]/30 focus:border-[#2E4A3C] transition";

export default function FloatingQuestionButton() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit =
    question.trim().length > 0 && name.trim().length > 0 && email.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/homepage-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: question.trim(),
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong");
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (submitted) {
      setQuestion("");
      setName("");
      setEmail("");
      setSubmitted(false);
      setSubmitError(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 w-[320px] rounded-2xl bg-[#F7F1E7] shadow-[0_8px_40px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.07)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.07]">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/Logo.png"
                  alt="MudKitchen"
                  width={22}
                  height={22}
                  className="object-contain"
                />
                <span className="text-[#2E4A3C] font-semibold text-sm font-body">
                  Ask a Question
                </span>
              </div>
              <button
                onClick={handleClose}
                className="w-6 h-6 flex items-center justify-center rounded-full text-[#2E4A3C]/50 hover:text-[#2E4A3C] hover:bg-black/[0.06] transition-colors"
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M1 1l10 10M11 1L1 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {submitted ? (
              <div className="px-4 py-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#2E4A3C] text-white">
                  <Check className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm font-semibold text-[#2E4A3C] font-body">
                  Question received
                </p>
                <p className="mt-1 text-xs text-[#2E4A3C]/70 font-body">
                  Thanks! We&apos;ll get back to you at the email you provided.
                </p>
              </div>
            ) : (
              <div className="px-4 py-4 flex flex-col gap-3">
                <textarea
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What's your question?"
                  className={`${inputClassName} resize-none`}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputClassName}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className={inputClassName}
                />
                {submitError ? (
                  <p className="text-sm text-red-600 font-body">{submitError}</p>
                ) : null}
                <button
                  type="button"
                  disabled={!canSubmit || isSubmitting}
                  onClick={handleSubmit}
                  className="w-full rounded-xl bg-[#2E4A3C] hover:bg-[#233B2F] text-white text-sm font-semibold font-body py-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Question"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 rounded-full bg-[#2E4A3C] hover:bg-[#233B2F] text-white px-4 py-2.5 shadow-lg transition-colors"
        aria-label="Questions?"
        aria-expanded={open}
      >
        <Image
          src="/images/Logo.png"
          alt=""
          width={20}
          height={20}
          className="object-contain brightness-0 invert"
          aria-hidden
        />
        <span className="text-sm font-semibold font-body pr-0.5">
          Questions?
        </span>
      </motion.button>
    </div>
  );
}
