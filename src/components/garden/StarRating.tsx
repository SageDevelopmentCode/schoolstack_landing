import { Star } from "lucide-react";

const STAR_COLORS = {
  light: { fill: "var(--sf-clay)", stroke: "var(--sf-clay-deep)" },
  dark: { fill: "var(--sf-butter)", stroke: "var(--sf-butter)" },
} as const;

const LABEL_CLASS = {
  light: "text-[var(--sf-ink)]",
  dark: "text-[var(--sf-cream)]",
} as const;

const SIZES = {
  sm: { star: 16, text: "text-sm" },
  md: { star: 20, text: "text-[15px]" },
} as const;

/**
 * Five filled stars plus a short visible label. The stars are decorative;
 * screen readers get `srLabel` instead of the visible label.
 */
export default function StarRating({
  label,
  srLabel,
  tone = "light",
  size = "sm",
  className = "",
}: {
  label: string;
  srLabel: string;
  tone?: "light" | "dark";
  size?: "sm" | "md";
  className?: string;
}) {
  const color = STAR_COLORS[tone];
  const s = SIZES[size];
  return (
    <p className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 ${className}`}>
      <span className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={s.star} fill={color.fill} stroke={color.stroke} strokeWidth={1.8} />
        ))}
      </span>
      <span aria-hidden="true" className={`font-extrabold ${s.text} ${LABEL_CLASS[tone]}`}>
        {label}
      </span>
      <span className="sr-only">{srLabel}</span>
    </p>
  );
}
