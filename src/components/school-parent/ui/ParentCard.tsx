import type { CSSProperties, ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentCardProps = {
  theme: ParentThemeTokens;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: "default" | "today" | "primary";
};

export default function ParentCard({
  theme,
  children,
  className = "",
  style,
  variant = "default",
}: ParentCardProps) {
  const variantStyle: CSSProperties =
    variant === "today"
      ? {
          background: "linear-gradient(135deg, #fffdf6, #f2f8ef)",
        }
      : variant === "primary"
        ? {
            backgroundColor: theme.primary,
            color: theme.white,
            borderColor: "transparent",
          }
        : {
            backgroundColor: theme.white,
          };

  return (
    <div
      className={`relative overflow-hidden border p-6 ${className}`}
      style={{
        borderColor: "rgba(74, 97, 82, 0.1)",
        borderRadius: theme.radiusCard,
        boxShadow: theme.shadowCard,
        ...variantStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
