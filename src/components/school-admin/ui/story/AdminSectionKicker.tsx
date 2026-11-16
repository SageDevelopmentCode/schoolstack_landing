import type { ReactNode } from "react";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
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
  const skin = useAdminGardenSkin();
  if (skin) {
    return (
      <p className={`m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)] ${className}`}>
        {children}
      </p>
    );
  }
  return (
    <p
      className={`text-[10px] font-extrabold uppercase tracking-[0.13em] ${className}`}
      style={{ color: "#729077" }}
    >
      {children}
    </p>
  );
}
