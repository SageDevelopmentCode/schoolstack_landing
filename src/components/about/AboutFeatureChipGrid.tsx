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
    <ul className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`.trim()}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-lg border px-4 py-3"
            style={{
              backgroundColor: item.chipBg,
              borderColor: item.chipBorder,
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
              style={{
                backgroundColor: item.iconBg,
                color: item.iconColor,
              }}
              aria-hidden
            >
              <Icon size={16} strokeWidth={2} />
            </span>
            <span className="text-[15px] font-secondary text-text leading-snug">
              {item.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
