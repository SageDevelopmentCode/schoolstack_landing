import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentButtonVariant = "primary" | "soft" | "outline";

type ParentButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  theme: ParentThemeTokens;
  variant?: ParentButtonVariant;
  children: ReactNode;
};

function variantStyle(
  theme: ParentThemeTokens,
  variant: ParentButtonVariant,
): React.CSSProperties {
  switch (variant) {
    case "soft":
      return {
        backgroundColor: "#E8F1E9",
        color: "#356B4E",
      };
    case "outline":
      return {
        backgroundColor: theme.white,
        color: theme.primary,
        border: `1px solid #B3C7B8`,
      };
    default:
      return {
        backgroundColor: theme.primary,
        color: theme.white,
      };
  }
}

const ParentButton = forwardRef<HTMLButtonElement, ParentButtonProps>(
  function ParentButton(
    {
      theme,
      variant = "primary",
      children,
      className = "",
      style,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        className={`border-0 px-[15px] py-[11px] text-[13px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50 ${className}`}
        style={{
          borderRadius: theme.radiusButton,
          ...variantStyle(theme, variant),
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    );
  },
);

export default ParentButton;
