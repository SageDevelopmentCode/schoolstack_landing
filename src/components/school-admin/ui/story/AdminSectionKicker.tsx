import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminSectionKickerProps = {
  theme: ParentThemeTokens;
  children: ReactNode;
  className?: string;
};

export default function AdminSectionKicker({
  theme: _theme,
  children,
  className = "",
}: AdminSectionKickerProps) {
  return (
    <p
      className={`text-[10px] font-extrabold uppercase tracking-[0.13em] ${className}`}
      style={{ color: "#729077" }}
    >
      {children}
    </p>
  );
}
