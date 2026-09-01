import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type AdminMetricAccent = "forest" | "sky" | "gold" | "berry";

const ACCENT_COLORS: Record<AdminMetricAccent, string> = {
  forest: "#315E4F",
  sky: "#8ABAC6",
  gold: "#E4BD65",
  berry: "#B66A83",
};

type AdminMetricCardProps = {
  theme: ParentThemeTokens;
  value: string;
  label: string;
  accent?: AdminMetricAccent;
  onClick?: () => void;
  className?: string;
};

export default function AdminMetricCard({
  theme,
  value,
  label,
  accent = "forest",
  onClick,
  className = "",
}: AdminMetricCardProps) {
  const sharedClassName = `relative overflow-hidden rounded-[15px] border bg-white p-[15px] text-left ${className}`;
  const borderStyle = { borderColor: "#E0E7E0" as const };

  const content = (
    <>
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: ACCENT_COLORS[accent] }}
        aria-hidden
      />
      <b
        className="mb-0.5 block font-heading text-2xl font-semibold"
        style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
      >
        {value}
      </b>
      <span className="text-[11px]" style={{ color: theme.muted }}>
        {label}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${sharedClassName} cursor-pointer transition-transform hover:-translate-y-px`}
        style={borderStyle}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={sharedClassName} style={borderStyle}>
      {content}
    </div>
  );
}
