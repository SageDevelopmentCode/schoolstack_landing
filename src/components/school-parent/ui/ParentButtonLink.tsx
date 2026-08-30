import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentButtonLinkProps = {
  theme: ParentThemeTokens;
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "soft" | "outline";
  showArrow?: boolean;
  className?: string;
};

function variantStyle(
  theme: ParentThemeTokens,
  variant: "primary" | "soft" | "outline",
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
        border: `1px solid ${theme.line}`,
      };
    default:
      return {
        backgroundColor: theme.primary,
        color: theme.white,
      };
  }
}

export default function ParentButtonLink({
  theme,
  href,
  children,
  variant = "soft",
  showArrow = false,
  className = "",
}: ParentButtonLinkProps) {
  const isOutline = variant === "outline";

  return (
    <Link
      href={href}
      className={`inline-flex w-full items-center justify-center gap-1.5 px-[15px] py-[11px] text-[13px] font-bold transition-opacity hover:opacity-90 ${
        isOutline ? "border" : "border-0"
      } ${className}`}
      style={{
        borderRadius: theme.radiusButton,
        ...variantStyle(theme, variant),
      }}
    >
      {children}
      {showArrow ? <ArrowRight className="h-3.5 w-3.5 shrink-0" /> : null}
    </Link>
  );
}
