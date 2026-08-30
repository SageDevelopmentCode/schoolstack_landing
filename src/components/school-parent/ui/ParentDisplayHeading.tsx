import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentDisplayHeadingProps = {
  theme: ParentThemeTokens;
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
  size?: "display" | "section";
  id?: string;
};

export default function ParentDisplayHeading({
  theme,
  children,
  as: Tag = "h2",
  className = "",
  size = "display",
  id,
}: ParentDisplayHeadingProps) {
  const sizeClass =
    size === "display"
      ? "text-[clamp(1.75rem,4vw,2.375rem)] leading-tight tracking-[-0.04em]"
      : "text-2xl tracking-[-0.03em]";

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
