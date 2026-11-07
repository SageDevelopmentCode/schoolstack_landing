import type { AboutFeatureChip } from "@/components/about/about-feature-chips";

type AboutFeatureChipGridProps = {
  items: readonly AboutFeatureChip[];
  className?: string;
};

export default function AboutFeatureChipGrid({
  items,
  className = "",
}: AboutFeatureChipGridProps) {
  return (
    <ul className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${className}`.trim()}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-black/8 px-4 py-3"
            style={{
              backgroundColor: item.chipBg,
            }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: item.iconBg,
                color: item.iconColor,
              }}
              aria-hidden
            >
              <Icon size={17} strokeWidth={2} />
            </span>
            <span className="font-secondary text-[15px] leading-snug text-[#1d1a16]">
              {item.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
