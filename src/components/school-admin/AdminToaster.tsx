"use client";

import { Toaster } from "sonner";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type AdminToasterProps = {
  C: AdminThemeTokens;
};

export default function AdminToaster({ C }: AdminToasterProps) {
  return (
    <>
      <style>{`
        [data-sonner-toast] [data-close-button] {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          color: #fff !important;
        }
      `}</style>
      <Toaster
        theme="dark"
        richColors={false}
        position="bottom-right"
        closeButton
        offset={{ bottom: 16, right: 16 }}
        toastOptions={{
          style: {
            backgroundColor: C.textPrimary,
            color: "#FFFFFF",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: C.r.lg,
            boxShadow: C.shadowMedium,
          },
        }}
      />
    </>
  );
}
