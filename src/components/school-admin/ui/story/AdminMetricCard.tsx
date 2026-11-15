import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { G_FOCUS } from "@/components/school-parent/garden/ui";

const GARDEN_BARS: Record<AdminMetricAccent, string> = {
  forest: "bg-[var(--sf-forest)]",
  sky: "bg-[#5b8fc7]",
  gold: "bg-[#d9a400]",
  berry: "bg-[var(--sf-clay)]",
};

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
  const skin = useAdminGardenSkin();
  if (skin) {
    const inner = (
      <>
        <span aria-hidden className={`mb-3 block h-1.5 w-8 rounded-full ${GARDEN_BARS[accent]}`} />
        <span className="sf-display block text-[2rem] leading-none tabular-nums text-[var(--sf-ink)]">{value}</span>
        <span className="mt-1.5 block text-[13px] font-extrabold text-[var(--sf-ink)]/65">{label}</span>
      </>
    );
    const gardenClass = `block w-full min-w-0 rounded-[22px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-4 py-4 text-left shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:px-5 ${className}`;
    return onClick ? (
      <button
        type="button"
        onClick={onClick}
        className={`${gardenClass} cursor-pointer transition-all hover:-translate-y-0.5 hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`}
      >
        {inner}
      </button>
    ) : (
      <div className={gardenClass}>{inner}</div>
    );
  }
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
