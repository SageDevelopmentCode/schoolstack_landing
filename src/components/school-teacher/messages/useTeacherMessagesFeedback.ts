"use client";

import { useCallback } from "react";
import type {
  MessagesFeedbackEvent,
  MessagesFeedbackHandler,
} from "@/components/messages/messages-inbox-view-model";
import {
  describeTeacherMessagesFeedback,
  TEACHER_MESSAGES_ERROR_FOR_SUCCESS,
} from "@/lib/messages/teacher-messages-feedback";
import { adminToast } from "@/lib/school-admin/admin-toast";

/** Inbox feedback events → staff Garden toasts (copy lives in lib for tests). */
export function useTeacherMessagesFeedback(): MessagesFeedbackHandler {
  return useCallback((event: MessagesFeedbackEvent) => {
    const toast = describeTeacherMessagesFeedback(event);
    if (!toast) return;
    if (toast.kind === "success") {
      const errorId = TEACHER_MESSAGES_ERROR_FOR_SUCCESS[toast.id];
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
