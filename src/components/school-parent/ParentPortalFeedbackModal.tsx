"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

const FEEDBACK_TYPE_OPTIONS = [
  { value: "feature_request", label: "Feature request" },
  { value: "feedback", label: "General feedback" },
  { value: "bug", label: "Something isn't working" },
] as const;

type FeedbackType = (typeof FEEDBACK_TYPE_OPTIONS)[number]["value"];

export type ParentPortalFeedbackModalProps = {
  C: AdminThemeTokens;
  open: boolean;
  onClose: () => void;
  organizationId: string;
  schoolSlug: string;
  schoolName: string;
  featureKey: string;
  featureLabel: string;
  userProfile: FamilyUserProfile;
  pagePath?: string;
};

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.sm,
    fontSize: "13px",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };
}

function labelStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: C.textSecondary,
    marginBottom: 6,
  };
}

export default function ParentPortalFeedbackModal({
  C,
  open,
  onClose,
  organizationId,
  schoolSlug,
  schoolName,
  featureKey,
  featureLabel,
  userProfile,
  pagePath,
}: ParentPortalFeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("feature_request");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setFeedbackType("feature_request");
    setMessage("");
    setSubmitted(false);
    setSubmitError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, submitting]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
    window.setTimeout(resetForm, 200);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !message.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/parent-portal/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          schoolSlug,
          schoolName,
          featureKey,
          featureLabel,
          feedbackType,
          message: message.trim(),
          pagePath,
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
      setSubmitting(false);
    }
  };

  const style = inputStyle(C);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={submitting ? undefined : handleClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="parent-feedback-modal-title"
            aria-describedby={
              submitted
                ? "parent-feedback-success-description"
                : "parent-feedback-modal-description"
            }
            className="flex max-h-[min(90vh,640px)] w-full max-w-[480px] flex-col overflow-hidden rounded-xl shadow-xl"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-start justify-between gap-3"
              style={{
                padding: "18px 20px 16px",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: C.clayBg, border: `1px solid ${C.clayBorder}` }}
                >
                  <Image
                    src="/images/Logo.png"
                    alt=""
                    width={22}
                    height={22}
                    className="h-[22px] w-[22px] object-contain"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0">
                  <h2
                    id="parent-feedback-modal-title"
                    className="text-sm font-semibold leading-tight"
                    style={{ color: C.textPrimary }}
                  >
                    Request a feature or give feedback
                  </h2>
                  <p
                    id="parent-feedback-modal-description"
                    className="mt-0.5 text-xs leading-relaxed"
                    style={{ color: C.textTertiary }}
                  >
                    Help us shape {featureLabel.toLowerCase()} for {schoolName}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="flex shrink-0 items-center rounded-md p-1 disabled:opacity-50"
                style={{
                  color: C.textTertiary,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitted ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3
                  className="text-base font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  Thanks for sharing
                </h3>
                <p
                  id="parent-feedback-success-description"
                  className="mt-2 max-w-xs text-sm leading-relaxed"
                  style={{ color: C.textSecondary }}
                >
                  Your feedback helps us prioritize what to build next in the parent
                  portal.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-6 rounded-md px-4 py-2 text-sm font-semibold"
                  style={getAdminButtonStyle(C, "primary")}
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div
                  className="flex-1 space-y-4 overflow-y-auto"
                  style={{ padding: "16px 20px" }}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <span style={labelStyle(C)}>Your name</span>
                      <div
                        className="rounded-md px-3 py-2 text-sm"
                        style={{
                          backgroundColor: C.elevated,
                          border: `1px solid ${C.border}`,
                          color: C.textPrimary,
                        }}
                      >
                        {userProfile.displayName}
                      </div>
                    </div>
                    <div>
                      <span style={labelStyle(C)}>Email</span>
                      <div
                        className="truncate rounded-md px-3 py-2 text-sm"
                        style={{
                          backgroundColor: C.elevated,
                          border: `1px solid ${C.border}`,
                          color: C.textPrimary,
                        }}
                      >
                        {userProfile.email}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="parent-feedback-type" style={labelStyle(C)}>
                      Type
                    </label>
                    <select
                      id="parent-feedback-type"
                      value={feedbackType}
                      disabled={submitting}
                      onChange={(event) =>
                        setFeedbackType(event.target.value as FeedbackType)
                      }
                      style={style}
                    >
                      {FEEDBACK_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="parent-feedback-message" style={labelStyle(C)}>
                      Message
                    </label>
                    <textarea
                      id="parent-feedback-message"
                      value={message}
                      disabled={submitting}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="What would make this section more useful for your family?"
                      rows={5}
                      required
                      style={{ ...style, resize: "vertical", minHeight: 110 }}
                    />
                  </div>

                  {submitError ? (
                    <p className="text-xs" style={{ color: C.error }}>
                      {submitError}
                    </p>
                  ) : null}
                </div>

                <div
                  className="flex shrink-0 justify-end gap-2"
                  style={{
                    padding: "14px 20px",
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
                    style={getAdminButtonStyle(C, "secondary")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !message.trim()}
                    className="rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    style={getAdminButtonStyle(C, "primary")}
                  >
                    {submitting ? "Sending…" : "Send feedback"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
