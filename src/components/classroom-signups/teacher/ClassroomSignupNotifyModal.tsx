"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import type { ClassroomSignup } from "@/lib/classroom-signups/types";
import {
  countUnrespondedFamilies,
  formatSignupDeadline,
} from "@/lib/classroom-signups/utils";
import type { ClassroomSignupResponse } from "@/lib/classroom-signups/types";

type ClassroomSignupNotifyModalProps = {
  signup: ClassroomSignup;
  responses: ClassroomSignupResponse[];
  teacherName: string;
  open: boolean;
  onClose: () => void;
  onSent?: () => void;
};

export default function ClassroomSignupNotifyModal({
  signup,
  responses,
  teacherName,
  open,
  onClose,
  onSent,
}: ClassroomSignupNotifyModalProps) {
  const { theme } = useParentTheme();
  const unresponded = countUnrespondedFamilies(signup, responses);
  const deadline = formatSignupDeadline(signup.responseDeadline);

  const defaultMessage = `${teacherName} needs help with "${signup.title}".${
    deadline ? ` Please sign up by ${deadline}.` : ""
  }`;

  const [message, setMessage] = useState(defaultMessage);
  const [alsoSendMessage, setAlsoSendMessage] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handleSend = async () => {
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSending(false);
    setSent(true);
    onSent?.();
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-lg rounded-[20px] border bg-white p-6 shadow-xl"
        style={{ borderColor: "#DCE4DC" }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              className="font-serif text-xl font-semibold"
              style={{ color: theme.ink }}
            >
              Send notification
            </h2>
            <p className="mt-1 text-sm" style={{ color: "#76828A" }}>
              Notify families about this signup
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" style={{ color: "#76828A" }} />
          </button>
        </div>

        <ParentCard theme={theme} className="!p-4">
          <p className="text-sm font-semibold" style={{ color: theme.ink }}>
            {signup.familyCount} families
            {unresponded > 0
              ? ` (${unresponded} haven't responded yet)`
              : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ backgroundColor: "#E9F2EA", color: theme.primary }}
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </span>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ backgroundColor: "#EEF7EF", color: "#3D6B4F" }}
            >
              Parent home attention
            </span>
          </div>
        </ParentCard>

        <div className="mt-4">
          <label
            htmlFor="notify-message"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#76828A" }}
          >
            Message preview
          </label>
          <textarea
            id="notify-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-[12px] border px-3 py-2.5 text-sm outline-none focus:ring-2"
            style={{ borderColor: "#DCE4DC", color: theme.ink }}
          />
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={alsoSendMessage}
            onChange={(e) => setAlsoSendMessage(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm" style={{ color: "#5D6D73" }}>
            Also send as a portal message (coming soon)
          </span>
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <AdminButton theme={theme} variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            theme={theme}
            variant="primary"
            onClick={handleSend}
            disabled={sending || sent}
          >
            {sent ? "Sent!" : sending ? "Sending…" : "Send notification"}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
