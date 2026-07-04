"use client";

import type { ReactNode } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplicationFormPageShellProps = {
  branding: OrganizationBranding;
  children: ReactNode;
  className?: string;
};

export default function ApplicationFormPageShell({
  branding,
  children,
  className = "",
}: ApplicationFormPageShellProps) {
  return (
    <div
      className={`flex min-h-dvh flex-col ${className}`.trim()}
      style={{ backgroundColor: branding.colors.bg }}
    >
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
