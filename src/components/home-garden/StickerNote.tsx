import type { Sticker } from "@/components/home/FloatingStickers";

/**
 * One of the sample product notifications ("Tuition paid · October · autopay"),
 * drawn as a pastel sticky note with a tape strip.
 */
export default function StickerNote({
  sticker,
  tint = "bg-white",
  tilt = 0,
  className = "",
  size = "md",
}: {
  sticker: Sticker;
  tint?: string;
  tilt?: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const Icon = sticker.icon;
  return (
    <div
      className={`sf-wiggle relative flex items-center gap-3 rounded-2xl border-2 border-[var(--sf-ink)] ${tint} ${
        size === "sm" ? "px-3 py-2" : "px-4 py-3"
      } shadow-[0_5px_0_0_var(--sf-ink)] ${className}`}
      style={{ rotate: `${tilt}deg` }}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-[var(--sf-ink)] ${size === "sm" ? "h-8 w-8" : "h-10 w-10"}`}
        style={{ color: sticker.color }}
        aria-hidden="true"
      >
        <Icon size={size === "sm" ? 16 : 19} strokeWidth={2.4} />
      </span>
      <span className="min-w-0 text-left leading-tight">
        <span className={`block font-extrabold text-[var(--sf-ink)] ${size === "sm" ? "text-sm" : "text-[15px]"}`}>{sticker.title}</span>
        <span className={`block font-semibold text-[var(--sf-soft)] ${size === "sm" ? "text-xs" : "text-[13px]"}`}>{sticker.subtitle}</span>
      </span>
    </div>
  );
}
