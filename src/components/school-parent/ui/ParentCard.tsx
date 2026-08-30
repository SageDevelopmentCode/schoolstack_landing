import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentCardProps = {
  theme: ParentThemeTokens;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: "default" | "today" | "primary";
} & Pick<HTMLAttributes<HTMLDivElement>, "data-testid">;

export default function ParentCard({
  theme,
  children,
  className = "",
  style,
  variant = "default",
  "data-testid": dataTestId,
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
      data-testid={dataTestId}
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
