"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminMessagesBroadcastCompose from "./AdminMessagesBroadcastCompose";
import {
  committeeTransition,
  modalPanel,
} from "@/components/school-admin/committees/committee-motion";
import { ADMIN_BROADCAST_CONFIRM_THRESHOLD } from "@/lib/messages/admin-broadcast-constants";
import { filterContactsByAudience } from "@/lib/messages/contact-filters";
import { formatBroadcastRecipientSummary } from "@/lib/messages/format-broadcast-recipients";
import type { MessageContact } from "@/lib/messages/types";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import AdminMessagesAudiencePicker, {
  emptyAdminBroadcastAudience,
  hasAdminBroadcastAudienceSelection,
  type AdminBroadcastAudienceState,
  type AdminBroadcastOptionClassroom,
  type AdminBroadcastOptionProgram,
} from "./AdminMessagesAudiencePicker";

type BroadcastPreviewResponse = {
  count: number;
  recipientNames: string[];
  exceedsLimit: boolean;
};

type BroadcastSendResponse = {
  sentCount: number;
  failedCount: number;
  failures: { guardianId: string; name: string; error: string }[];
};

type AdminMessagesBroadcastModalProps = {
  open: boolean;
  onClose: () => void;
  onSent: () => void;
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  contacts: MessageContact[];
  loadingContacts?: boolean;
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
};

type Step = "recipients" | "compose";

function continueRecipientsLabel(
  audience: AdminBroadcastAudienceState,
  previewCount: number,
  previewExceedsLimit: boolean,
): string {
  if (previewCount === 0 && !hasAdminBroadcastAudienceSelection(audience)) {
    return "Continue";
  }

  const countLabel = previewExceedsLimit
    ? `${previewCount} parents selected (limit is 200)`
    : `${previewCount} parent${previewCount === 1 ? "" : "s"} selected`;

  return `${countLabel} • Continue`;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }
  return data as T;
}

export default function AdminMessagesBroadcastModal({
  open,
  onClose,
  onSent,
  organizationId,
  organizationSlug,
  schoolName,
  contacts,
  loadingContacts = false,
  C,
  theme,
}: AdminMessagesBroadcastModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const [step, setStep] = useState<Step>("recipients");
  const [audience, setAudience] = useState<AdminBroadcastAudienceState>(
    emptyAdminBroadcastAudience(),
  );
  const [programs, setPrograms] = useState<AdminBroadcastOptionProgram[]>([]);
  const [classrooms, setClassrooms] = useState<AdminBroadcastOptionClassroom[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);
  const [previewRecipientNames, setPreviewRecipientNames] = useState<string[]>([]);
  const [previewExceedsLimit, setPreviewExceedsLimit] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const parentContacts = useMemo(
    () => filterContactsByAudience(contacts, "parents"),
    [contacts],
  );

  const formattedRecipientNames = useMemo(
    () => formatBroadcastRecipientSummary(previewRecipientNames),
    [previewRecipientNames],
  );

  const resetState = useCallback(() => {
    setStep("recipients");
    setAudience(emptyAdminBroadcastAudience());
    setPreviewCount(0);
    setPreviewRecipientNames([]);
    setPreviewExceedsLimit(false);
    setPreviewLoading(false);
    setMessageBody("");
    setFiles([]);
    setSending(false);
    setConfirmOpen(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !sending) handleClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, open, sending]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoadingOptions(true);

    void fetchJson<{
      programs: AdminBroadcastOptionProgram[];
      classrooms: AdminBroadcastOptionClassroom[];
    }>(
      `/api/school-admin/messages/broadcast/options?organizationId=${encodeURIComponent(organizationId)}`,
    )
      .then((data) => {
        if (cancelled) return;
        setPrograms(data.programs);
        setClassrooms(data.classrooms);
      })
      .catch((err) => {
        if (cancelled) return;
        adminToast.error(formatActionError(err, "Failed to load bulk message options."));
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, organizationId]);

  useEffect(() => {
    if (!open) return undefined;

    if (!hasAdminBroadcastAudienceSelection(audience)) {
      setPreviewCount(0);
      setPreviewRecipientNames([]);
      setPreviewExceedsLimit(false);
      setPreviewLoading(false);
      return undefined;
    }

    let cancelled = false;
    setPreviewLoading(true);
    const timeout = window.setTimeout(() => {
      void fetchJson<BroadcastPreviewResponse>(
        "/api/school-admin/messages/broadcast/preview",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId, audience }),
        },
      )
        .then((data) => {
          if (cancelled) return;
          setPreviewCount(data.count);
          setPreviewRecipientNames(data.recipientNames);
          setPreviewExceedsLimit(data.exceedsLimit);
        })
        .catch((err) => {
          if (cancelled) return;
          adminToast.error(formatActionError(err, "Failed to preview recipients."));
        })
        .finally(() => {
          if (!cancelled) setPreviewLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [audience, open, organizationId]);

  const canContinueRecipients =
    hasAdminBroadcastAudienceSelection(audience) &&
    previewCount > 0 &&
    !previewExceedsLimit &&
    !previewLoading;

  const canSend =
    Boolean(messageBody.trim() || files.length > 0) &&
    previewCount > 0 &&
    !previewExceedsLimit;

  const handleSend = async () => {
    if (!canSend || sending) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.set("organizationId", organizationId);
      formData.set("organizationSlug", organizationSlug);
      formData.set("schoolName", schoolName);
      formData.set("body", messageBody.trim());
      formData.set("audience", JSON.stringify(audience));
      for (const file of files) {
        formData.append("files", file);
      }

      const result = await fetchJson<BroadcastSendResponse>(
        "/api/school-admin/messages/broadcast",
        {
          method: "POST",
          body: formData,
        },
      );

      if (result.failedCount > 0) {
        adminToast.info(
          `Sent to ${result.sentCount} parent${result.sentCount === 1 ? "" : "s"}. ${result.failedCount} failed.`,
        );
      } else {
        adminToast.success(
          `Sent to ${result.sentCount} parent${result.sentCount === 1 ? "" : "s"}.`,
        );
      }

      onSent();
      handleClose();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to send bulk messages."));
    } finally {
      setSending(false);
      setConfirmOpen(false);
    }
  };

  const sendButtonLabel =
    previewCount > 0 && previewCount <= 3 && formattedRecipientNames
      ? `Send to ${formattedRecipientNames}`
      : previewCount > 0
        ? `Send to ${previewCount}`
        : "Send bulk message";

  const handleComposeClick = () => {
    if (previewCount > ADMIN_BROADCAST_CONFIRM_THRESHOLD) {
      setConfirmOpen(true);
      return;
    }
    void handleSend();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={committeeTransition}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 cursor-default"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => {
              if (!sending) handleClose();
            }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="broadcast-message-title"
            tabIndex={-1}
            className="relative flex max-h-[min(90dvh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl shadow-xl outline-none"
            style={{ backgroundColor: theme.white }}
            variants={modalPanel(reducedMotion)}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={committeeTransition}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: theme.line }}
            >
              <AdminDisplayHeading
                theme={theme}
                as="h2"
                id="broadcast-message-title"
                size="section"
                className="!text-lg"
              >
                {step === "recipients" ? "Bulk message" : "Write your message"}
              </AdminDisplayHeading>
              <button
                type="button"
                onClick={handleClose}
                disabled={sending}
                className="rounded-lg p-1.5 cursor-pointer transition hover:bg-black/[0.04] disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {step === "recipients" ? (
                loadingOptions || loadingContacts ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin" style={{ color: theme.muted }} />
                  </div>
                ) : (
                  <AdminMessagesAudiencePicker
                    theme={theme}
                    C={C}
                    audience={audience}
                    onAudienceChange={setAudience}
                    programs={programs}
                    classrooms={classrooms}
                    parentContacts={parentContacts}
                  />
                )
              ) : (
                <div className="space-y-4">
                  <div
                    className="rounded-xl border px-4 py-3 text-sm line-clamp-2"
                    style={{ borderColor: theme.line, backgroundColor: "#F4F7F5" }}
                  >
                    {formattedRecipientNames ? (
                      <>
                        Sending individually to{" "}
                        <span className="font-semibold">{formattedRecipientNames}</span>.
                      </>
                    ) : (
                      <>
                        Sending individually to{" "}
                        <span className="font-semibold">{previewCount}</span> parent
                        {previewCount === 1 ? "" : "s"}.
                      </>
                    )}
                  </div>
                  <AdminMessagesBroadcastCompose
                    value={messageBody}
                    onChange={setMessageBody}
                    files={files}
                    onFilesChange={setFiles}
                    disabled={sending}
                    C={C}
                    theme={theme}
                    placeholder="Write a message to send to each parent individually…"
                  />
                </div>
              )}
            </div>

            <div
              className={`flex items-center gap-3 border-t px-5 py-4 ${
                step === "recipients" ? "justify-end" : "justify-between"
              }`}
              style={{ borderColor: theme.line }}
            >
              {step === "compose" ? (
                <AdminButton
                  theme={theme}
                  variant="outline"
                  disabled={sending}
                  onClick={() => setStep("recipients")}
                >
                  Back
                </AdminButton>
              ) : null}

              {step === "recipients" ? (
                <AdminButton
                  theme={theme}
                  disabled={!canContinueRecipients}
                  onClick={() => setStep("compose")}
                  aria-busy={previewLoading}
                  className="inline-flex items-center gap-2"
                >
                  {previewLoading && hasAdminBroadcastAudienceSelection(audience) ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : null}
                  {continueRecipientsLabel(audience, previewCount, previewExceedsLimit)}
                </AdminButton>
              ) : (
                <AdminButton
                  theme={theme}
                  disabled={!canSend || sending}
                  onClick={handleComposeClick}
                >
                  {sending ? "Sending…" : sendButtonLabel}
                </AdminButton>
              )}
            </div>

            {confirmOpen ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-4">
                <div
                  className="w-full max-w-sm rounded-2xl border p-5 shadow-xl"
                  style={{ backgroundColor: theme.white, borderColor: theme.line }}
                >
                  <p className="text-base font-semibold" style={{ color: theme.ink }}>
                    {formattedRecipientNames
                      ? `Send bulk message to ${formattedRecipientNames}?`
                      : `Send bulk message to ${previewCount} parents?`}
                  </p>
                  <p className="mt-2 text-sm" style={{ color: theme.muted }}>
                    MudKitchen will send this message individually to each parent&apos;s school
                    office thread.
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <AdminButton
                      theme={theme}
                      variant="outline"
                      disabled={sending}
                      onClick={() => setConfirmOpen(false)}
                    >
                      Cancel
                    </AdminButton>
                    <AdminButton theme={theme} disabled={sending} onClick={() => void handleSend()}>
                      {sending ? "Sending…" : "Send messages"}
                    </AdminButton>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
