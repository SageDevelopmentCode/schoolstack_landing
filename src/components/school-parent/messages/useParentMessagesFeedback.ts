"use client";

import { useCallback } from "react";
import type {
  MessagesFeedbackEvent,
  MessagesFeedbackHandler,
} from "@/components/messages/messages-inbox-view-model";
import { describeParentMessagesFeedback } from "@/lib/messages/parent-messages-feedback";
import { parentToast } from "@/lib/school-parent/parent-toast";

/** Inbox feedback events → parent Garden toasts (copy lives in lib for tests). */
export function useParentMessagesFeedback(): MessagesFeedbackHandler {
  return useCallback((event: MessagesFeedbackEvent) => {
    const toast = describeParentMessagesFeedback(event);
    const options = { id: toast.id, description: toast.description };
    if (toast.kind === "success") parentToast.success(toast.title, options);
    else parentToast.error(toast.title, options);
  }, []);
}
