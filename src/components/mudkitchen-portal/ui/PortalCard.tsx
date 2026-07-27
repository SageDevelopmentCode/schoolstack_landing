"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePortalTheme } from "@/components/mudkitchen-portal/PortalThemeProvider";

type PortalCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  tinted?: boolean;
};

export default function PortalCard({
  children,
  className = "",
  style,
  tinted = false,
}: PortalCardProps) {
  const T = usePortalTheme();

  return (
    <div
      className={`rounded-2xl border p-6 sm:p-7 ${className}`}
      style={{
        backgroundColor: tinted ? T.stepBg : T.surface,
        borderColor: tinted ? T.secondaryBtnBorder : T.border,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
