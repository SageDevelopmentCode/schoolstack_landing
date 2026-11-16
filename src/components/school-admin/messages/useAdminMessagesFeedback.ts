"use client";

import { useCallback } from "react";
import type {
  MessagesFeedbackEvent,
  MessagesFeedbackHandler,
} from "@/components/messages/messages-inbox-view-model";
import {
  ADMIN_MESSAGES_ERROR_FOR_SUCCESS,
  describeAdminMessagesFeedback,
} from "@/lib/messages/admin-messages-feedback";
import { adminToast } from "@/lib/school-admin/admin-toast";

/** Inbox feedback events → admin Garden toasts (copy lives in lib for tests). */
export function useAdminMessagesFeedback(): MessagesFeedbackHandler {
  return useCallback((event: MessagesFeedbackEvent) => {
    const toast = describeAdminMessagesFeedback(event);
    if (!toast) return;
    if (toast.kind === "success") {
      const errorId = ADMIN_MESSAGES_ERROR_FOR_SUCCESS[toast.id];
      if (errorId) adminToast.dismiss(errorId);
      adminToast.success(toast.title, { id: toast.id, description: toast.description });
      return;
    }
    const retry = toast.retry;
    adminToast.error(toast.title, {
      id: toast.id,
      description: toast.description,
      action: retry
        ? {
            label: "Retry",
            onClick: () => {
              adminToast.dismiss(toast.id);
              retry();
            },
          }
        : undefined,
    });
  }, []);
}
