"use client";

import { Toaster } from "sonner";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentToasterProps = {
  C: AdminThemeTokens;
  /** When the fixed help FAB is visible, lift toasts above it. */
  helpButtonVisible?: boolean;
};

export default function ParentToaster({
  C,
  helpButtonVisible = false,
}: ParentToasterProps) {
  const bottomOffset = helpButtonVisible ? 80 : 16;

  return (
    <>
      <style>{`
        [data-sonner-toast] {
          overflow: visible !important;
        }

        :where([data-sonner-toaster][dir='ltr'] button[data-close-button]) {
          --toast-close-button-start: auto;
          --toast-close-button-end: 0;
          --toast-close-button-transform: translate(35%, -35%);
        }

        [data-sonner-toast] [data-close-button] {
          z-index: 10 !important;
          opacity: 1 !important;
          background: rgba(255, 255, 255, 0.28) !important;
          border: 1px solid rgba(255, 255, 255, 0.45) !important;
          border-radius: ${C.r.md} !important;
          color: #fff !important;
        }

        [data-sonner-toast] [data-close-button]:hover {
          background: rgba(255, 255, 255, 0.42) !important;
        }
      `}</style>
      <Toaster
        theme="dark"
        richColors={false}
        position="bottom-right"
        closeButton
        offset={{ bottom: bottomOffset, right: 16 }}
        toastOptions={{
          style: {
            backgroundColor: C.textPrimary,
            color: "#FFFFFF",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: C.r.xl,
            boxShadow: C.shadowMedium,
          },
        }}
      />
    </>
  );
}
