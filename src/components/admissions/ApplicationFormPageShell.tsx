"use client";

import type { ReactNode } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplicationFormPageShellProps = {
  branding: OrganizationBranding;
  children: ReactNode;
  className?: string;
  /** When true, fill a parent flex container instead of forcing full viewport height. */
  fillParent?: boolean;
};

export default function ApplicationFormPageShell({
  branding,
  children,
  className = "",
  fillParent = false,
}: ApplicationFormPageShellProps) {
  const heightClass = fillParent ? "h-full min-h-0" : "min-h-dvh";

  return (
    <div
      className={`flex flex-col ${heightClass} ${className}`.trim()}
      style={{ backgroundColor: branding.colors.bg }}
    >
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
