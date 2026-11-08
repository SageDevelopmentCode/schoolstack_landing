"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import BrightAuthPageLayout from "@/components/login/BrightAuthPageLayout";

type BrightPortalAuthShellProps = {
  children: ReactNode;
};

export function BrightAuthSessionCheck() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white px-6">
      <Loader2 className="h-6 w-6 animate-spin text-[#1d1a16]" />
      <p className="font-secondary text-sm text-[#1d1a16]/70">Checking your session…</p>
    </div>
  );
}

/** Bright marketing shell for signed-out parent/apply gates. */
export default function BrightPortalAuthShell({ children }: BrightPortalAuthShellProps) {
  return <BrightAuthPageLayout>{children}</BrightAuthPageLayout>;
}
