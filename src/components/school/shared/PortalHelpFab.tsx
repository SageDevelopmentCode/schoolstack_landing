"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

const AdminSupportRequestModal = dynamic(
  () => import("@/components/school-admin/AdminSupportRequestModal"),
  { ssr: false },
);

type PortalHelpFabProps = {
  C: AdminThemeTokens;
  organizationId: string;
  userEmail?: string | null;
  currentPath?: string;
  submitEndpoint: string;
  visible?: boolean;
  readOnly?: boolean;
  documentationHref?: string;
  variant?: "fixed" | "inline";
  iconOnly?: boolean;
  className?: string;
};

export default function PortalHelpFab({
  C,
  organizationId,
  userEmail,
  currentPath,
  submitEndpoint,
  visible = true,
  readOnly = false,
  documentationHref,
  variant = "fixed",
  iconOnly = false,
  className = "",
}: PortalHelpFabProps) {
  const [supportOpen, setSupportOpen] = useState(false);

  if (!visible) return null;

  const variantClassName = iconOnly
    ? "fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full p-0 shadow-lg transition hover:opacity-90 sm:bottom-6 sm:right-6"
    : variant === "inline"
      ? "inline-flex shrink-0 items-center gap-2 rounded-pill px-3 py-2 text-xs font-medium shadow-lg transition hover:opacity-90"
      : "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-pill px-4 py-2.5 text-xs font-medium shadow-lg transition hover:opacity-90 sm:bottom-6 sm:right-6 sm:px-5 sm:py-3 sm:text-sm";

  return (
    <>
      <button
        type="button"
        title="Need help?"
        aria-label="Need help?"
        onClick={() => setSupportOpen(true)}
        className={`${variantClassName} ${className}`.trim()}
        style={{
          backgroundColor: C.clayBg,
          border: `1px solid ${C.clayBorder}`,
          color: C.textSecondary,
        }}
      >
        <Image
          src="/images/Logo.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 w-auto object-contain"
          aria-hidden
        />
        {iconOnly ? null : "Need help?"}
      </button>

      {supportOpen ? (
        <AdminSupportRequestModal
          C={C}
          open={supportOpen}
          onClose={() => setSupportOpen(false)}
          organizationId={organizationId}
          userEmail={userEmail}
          currentPath={currentPath}
          submitEndpoint={submitEndpoint}
          documentationHref={documentationHref}
          readOnly={readOnly}
        />
      ) : null}
    </>
  );
}
