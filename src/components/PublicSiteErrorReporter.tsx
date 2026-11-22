"use client";

import { useEffect } from "react";
import {
  hasUnsavedFieldValues,
  isChunkLoadError,
  reloadOnceForChunkError,
} from "@/lib/chunk-load-recovery";
import { isPublicSitePath } from "@/lib/public-site/client-error-filter";
import {
  messageFromRejectionReason,
  PUBLIC_SITE_ERROR_REPORTING_ENABLED,
  reportPublicSiteClientError,
} from "@/lib/public-site/report-client-error";

type EditableField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isEditableField(target: EventTarget | null): target is EditableField {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/**
 * Reports uncaught browser errors on public marketing pages (home, /get-started,
 * /free-preview, tools, blog…) so they reach Discord, not only Sentry. Portals and admin
 * are skipped: they report their own errors. Renders nothing.
 */
export default function PublicSiteErrorReporter() {
  useEffect(() => {
    if (!PUBLIC_SITE_ERROR_REPORTING_ENABLED) return;

    /** Fields the visitor typed into or changed, so a chunk reload never wipes their input. */
    const editedFields = new Set<EditableField>();
    const onFieldEdit = (event: Event) => {
      if (isEditableField(event.target)) editedFields.add(event.target);
    };

    const hasUnsavedInput = () => {
      for (const field of editedFields) {
        if (!field.isConnected) editedFields.delete(field);
      }
      return hasUnsavedFieldValues(editedFields);
    };

    /** A stale chunk on a public page (deploy mid-visit): reload once instead of alerting.
     *  Skipped on portals, and while the visitor has typed into a form (the booking form keeps
     *  its details only in React state); the error is reported instead, as any other. */
    const recoverFromChunkError = (error: unknown) =>
      isPublicSitePath(window.location.pathname) &&
      isChunkLoadError(error) &&
      !hasUnsavedInput() &&
      reloadOnceForChunkError();

    const onError = (event: ErrorEvent) => {
      const error: unknown = event.error;
      if (recoverFromChunkError(error ?? event.message)) return;
      reportPublicSiteClientError({
        source: "window_error",
        message: event.message || (error instanceof Error ? error.message : ""),
        filename: event.filename,
        stack: error instanceof Error ? error.stack : null,
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const message = messageFromRejectionReason(event.reason);
      if (!message) return;
      if (recoverFromChunkError(event.reason ?? message)) return;
      reportPublicSiteClientError({
        source: "unhandled_rejection",
        message,
        stack: event.reason instanceof Error ? event.reason.stack : null,
      });
    };

    document.addEventListener("input", onFieldEdit, true);
    document.addEventListener("change", onFieldEdit, true);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      document.removeEventListener("input", onFieldEdit, true);
      document.removeEventListener("change", onFieldEdit, true);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
