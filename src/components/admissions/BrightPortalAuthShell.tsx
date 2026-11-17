"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { gardenFontVariables } from "@/components/garden/fonts";
import BrightAuthPageLayout from "@/components/login/BrightAuthPageLayout";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import "@/components/garden/garden.css";

type BrightPortalAuthShellProps = {
  children: ReactNode;
  /** School theme: its accent replaces Garden clay on the form side. */
  theme?: ParentThemeTokens | null;
};

export function BrightAuthSessionCheck() {
  return (
    <div
      className={`${gardenFontVariables} sf-garden sf-grid flex min-h-dvh flex-col items-center justify-center gap-3 bg-[var(--sf-cream)] px-6`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-6 w-6 animate-spin text-[var(--sf-forest)]" aria-hidden />
      <p className="text-sm font-semibold text-[var(--sf-soft)]">Checking your session…</p>
    </div>
  );
}

/** Calm Garden shell for signed-out parent/apply gates. */
export default function BrightPortalAuthShell({ children, theme }: BrightPortalAuthShellProps) {
  return <BrightAuthPageLayout theme={theme}>{children}</BrightAuthPageLayout>;
}
