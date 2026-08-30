import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminButtonVariant = "primary" | "soft" | "outline" | "danger";

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  theme: ParentThemeTokens;
  variant?: AdminButtonVariant;
  children: ReactNode;
  size?: "default" | "compact";
};

function variantStyle(
  theme: ParentThemeTokens,
  variant: AdminButtonVariant,
): React.CSSProperties {
  switch (variant) {
    case "soft":
      return {
        backgroundColor: "#E8F2E9",
        color: "#346A4E",
      };
    case "outline":
      return {
        backgroundColor: theme.white,
        color: theme.primary,
        border: "1px solid #B9CDBD",
      };
    case "danger":
      return {
        backgroundColor: "#F8E7E4",
        color: "#AD574C",
      };
    default:
      return {
        backgroundColor: theme.primary,
        color: theme.white,
      };
  }
}

export default function AdminButton({
  theme,
  variant = "primary",
  children,
  className = "",
  style,
  size = "default",
  ...props
}: AdminButtonProps) {
  const sizeClass =
    size === "compact"
      ? "px-[9px] py-[7px] text-[10px]"
      : "px-[13px] py-[10px] text-xs";

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 border-0 font-bold transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${sizeClass} ${className}`}
      style={{
        borderRadius: "10px",
        ...variantStyle(theme, variant),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
