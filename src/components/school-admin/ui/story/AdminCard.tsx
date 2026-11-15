import type { CSSProperties, ReactNode } from "react";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export const ADMIN_RADIUS_CARD = "16px";

type AdminCardProps = {
  theme: ParentThemeTokens;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: "none" | "default" | "canvas" | "compact";
  "data-testid"?: string;
  id?: string;
};

export default function AdminCard({
  theme,
  children,
  className = "",
  style,
  padding = "default",
  "data-testid": dataTestId,
  id,
}: AdminCardProps) {
  const skin = useAdminGardenSkin();
  if (skin) {
    const pad =
      padding === "none" ? "" : padding === "canvas" ? "p-5 sm:p-6" : padding === "compact" ? "p-3" : "p-4";
    return (
      <div
        id={id}
        data-testid={dataTestId}
        className={`overflow-hidden rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[0_3px_0_0_rgba(43,36,29,0.06)] ${pad} ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }
  const paddingClass =
    padding === "none"
      ? ""
      : padding === "canvas"
        ? "p-5 sm:p-6"
        : padding === "compact"
          ? "p-3"
          : "p-4";

  return (
    <div
      id={id}
      data-testid={dataTestId}
      className={`overflow-hidden border bg-white ${paddingClass} ${className}`}
      style={{
        borderColor: "#E0E7E0",
        borderRadius: ADMIN_RADIUS_CARD,
        boxShadow: theme.shadowCard,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
