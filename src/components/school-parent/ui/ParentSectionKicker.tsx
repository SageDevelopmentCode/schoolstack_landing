import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentSectionKickerProps = {
  theme: ParentThemeTokens;
  children: ReactNode;
  className?: string;
  light?: boolean;
};

export default function ParentSectionKicker({
  theme: _theme,
  children,
  className = "",
  light = false,
}: ParentSectionKickerProps) {
  return (
    <p
      className={`mb-2 text-[11px] font-bold uppercase tracking-[0.12em] ${className}`}
      style={{ color: light ? "#BDDEC4" : "#759077" }}
    >
      {children}
    </p>
  );
}
