import type { ReactNode } from "react";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
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
  const skin = useAdminGardenSkin();
  if (skin) {
    const gardenSize =
      size === "display"
        ? "text-[1.75rem] sm:text-[2.1rem] leading-[1]"
        : size === "canvas"
          ? "text-[1.5rem] leading-[1.05]"
          : "text-[1.3rem] leading-[1.1]";
    return (
      <Tag id={id} className={`sf-display m-0 text-[var(--sf-ink)] ${gardenSize} ${className}`}>
        {children}
      </Tag>
    );
  }
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
