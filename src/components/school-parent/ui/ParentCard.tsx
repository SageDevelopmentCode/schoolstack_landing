import type { CSSProperties, ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentCardProps = {
  theme: ParentThemeTokens;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: "default" | "today" | "primary" | "announcement";
  "data-testid"?: string;
};

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
        : variant === "announcement"
          ? {
              background: `linear-gradient(135deg, ${theme.infoBg}, ${theme.white})`,
              borderColor: `${theme.info}33`,
            }
          : {
              backgroundColor: theme.white,
            };

  const showAnnouncementAccent = variant === "announcement";

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
      {showAnnouncementAccent ? (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 top-0 w-1 rounded-l-[inherit]"
          style={{ backgroundColor: theme.info }}
        />
      ) : null}
      {children}
    </div>
  );
}
