import type { CSSProperties, ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export const ADMIN_RADIUS_CARD = "16px";

type AdminCardProps = {
  theme: ParentThemeTokens;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: "none" | "default" | "canvas" | "compact";
  "data-testid"?: string;
};

export default function AdminCard({
  theme,
  children,
  className = "",
  style,
  padding = "default",
  "data-testid": dataTestId,
}: AdminCardProps) {
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
