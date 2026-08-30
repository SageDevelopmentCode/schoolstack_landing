import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminDisplayHeadingProps = {
  theme: ParentThemeTokens;
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
  size?: "display" | "section" | "canvas";
  id?: string;
};

export default function AdminDisplayHeading({
  theme,
  children,
  as: Tag = "h2",
  className = "",
  size = "display",
  id,
}: AdminDisplayHeadingProps) {
  const sizeClass =
    size === "display"
      ? "text-[clamp(1.5rem,3.5vw,1.9375rem)] leading-[0.97] tracking-[-0.04em]"
      : size === "canvas"
        ? "text-[1.4375rem] leading-tight tracking-[-0.03em]"
        : "text-xl tracking-[-0.03em]";

  return (
    <Tag
      id={id}
      className={`font-heading font-semibold ${sizeClass} ${className}`}
      style={{
        fontFamily: theme.fontDisplay,
        color: theme.ink,
      }}
    >
      {children}
    </Tag>
  );
}
