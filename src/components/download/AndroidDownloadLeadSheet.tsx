"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Smartphone, X } from "lucide-react";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import PublicFormHoneypotField from "@/components/public-forms/PublicFormHoneypotField";
import { MOBILE_APP_DOWNLOAD_DEFAULT_SOURCE_PAGE_PATH } from "@/lib/mobile-app-download/constants";
import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";
import { MUDKITCHEN_MARKETING_STORY_THEME } from "@/lib/marketing/mudkitchen-story-theme";

const theme = MUDKITCHEN_MARKETING_STORY_THEME;

const inputClassName =
  "w-full rounded-xl border border-black/[0.09] bg-white px-3.5 py-3 text-sm text-text placeholder:text-text-faint font-secondary outline-none focus:ring-2 focus:ring-clay/25 focus:border-clay transition";

type AndroidDownloadLeadSheetProps = {
  open: boolean;
  onClose: () => void;
};

type AndroidDownloadLeadSheetPanelProps = {
  titleId: string;
  onClose: () => void;
};

function AndroidDownloadLeadSheetPanel({
  titleId,
  onClose,
}: AndroidDownloadLeadSheetPanelProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit =
    name.trim().length > 0 && email.trim().length > 0 && !isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/mobile-app-download-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          sourcePagePath: MOBILE_APP_DOWNLOAD_DEFAULT_SOURCE_PAGE_PATH,
          [PUBLIC_FORM_HONEYPOT_FIELD]: companyWebsite,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div
        className="absolute inset-0 bg-black/45"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
        aria-hidden="true"
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 340 }}
        className="absolute inset-x-0 bottom-0 z-[15] mx-auto flex max-h-[min(92vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border border-black/[0.08] bg-[#FFFAF4] shadow-[0_-12px_48px_rgba(43,36,29,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-black/12" />
        </div>

        <div
          className="flex items-start justify-between gap-3 border-b px-5 py-3"
          style={{ borderColor: theme.line }}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: theme.primarySoft }}
            >
              <Smartphone
                className="h-4 w-4"
                style={{ color: theme.primary }}
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <h2
                id={titleId}
                className="font-display text-lg text-text leading-tight"
              >
                Get the Android app
              </h2>
              <p className="m-0 mt-0.5 text-xs leading-relaxed text-text-muted font-secondary">
                Google Play isn&apos;t live yet — we&apos;ll email you the link.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="rounded-lg p-1 text-text-muted transition hover:bg-black/[0.05] disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {submitted ? (
            <div className="py-4 text-center">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.successBg }}
              >
                <Check
                  className="h-6 w-6"
                  style={{ color: theme.success }}
                  aria-hidden
                />
              </div>
              <p className="font-display text-xl text-text">You&apos;re on the list</p>
              <p className="mt-3 text-[15px] leading-relaxed text-text-muted font-secondary">
                Thanks — we&apos;ll send the Google Play link to{" "}
                <span className="font-medium text-text">{email}</span> as soon as
                it&apos;s ready.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-8 inline-flex h-11 items-center justify-center rounded-pill bg-clay px-6 text-sm font-semibold text-white transition hover:bg-clay/90"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={(event) => void handleSubmit(event)}>
              <PublicFormHoneypotField
                value={companyWebsite}
                onChange={setCompanyWebsite}
              />
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="android-download-name"
                    className="mb-1.5 block text-sm font-medium text-text font-secondary"
                  >
                    Name
                  </label>
                  <input
                    id="android-download-name"
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
                    htmlFor="android-download-email"
                    className="mb-1.5 block text-sm font-medium text-text font-secondary"
                  >
                    Email
                  </label>
                  <input
                    id="android-download-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClassName}
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              {submitError ? (
                <p className="mt-4 text-sm text-red-600" role="alert">
                  {submitError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className={`mt-6 flex h-12 w-full items-center justify-center rounded-pill bg-clay text-sm font-semibold text-white transition hover:bg-clay/90 disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_LOADING_LAYOUT_CLASS}`}
              >
                <ButtonLoadingLabel loading={isSubmitting} loadingLabel="Sending…">
                  Send me the link
                </ButtonLoadingLabel>
              </button>
            </form>
          )}
        </div>
      </motion.aside>
    </>
  );
}

export default function AndroidDownloadLeadSheet({
  open,
  onClose,
}: AndroidDownloadLeadSheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AndroidDownloadLeadSheetPanel titleId={titleId} onClose={onClose} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
