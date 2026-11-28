"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Layers, Megaphone, Smartphone, type LucideIcon } from "lucide-react";
import { GChip, G_FOCUS, type GChipTone } from "@/components/school-parent/garden/ui";
import { GardenFilterChips } from "@/components/school-admin/garden/kit";
import { GardenGroupHeading } from "@/components/school-admin/garden/blocks";
import type { MarketingCarousel } from "@/components/admin/marketing/carousels/types";
import { countPostedSlides, type MarketingCarouselPostStatus } from "@/lib/marketing/carousel-post-status";

type Group = "ads" | "posts" | "store";

const GROUPS: Array<{ key: Group; label: string; icon: LucideIcon; tint: string }> = [
  { key: "ads", label: "Ads", icon: Megaphone, tint: "bg-[var(--sf-peach)]" },
  { key: "posts", label: "Posts", icon: Layers, tint: "bg-[var(--sf-mint)]" },
  { key: "store", label: "App store", icon: Smartphone, tint: "bg-[var(--sf-sky)]" },
];

function groupOf(carousel: MarketingCarousel): Group {
  if (carousel.kind === "ad") return "ads";
  if (carousel.kind === "store") return "store";
  return "posts";
}

/** Ad sets and post sets count posted slides ("3/12 posted"); a swipe carousel is posted or not as a whole. */
export function postedChip(
  carousel: MarketingCarousel,
  status: MarketingCarouselPostStatus | undefined,
): { label: string; tone: GChipTone } {
  const isSet = carousel.kind === "ad" || carousel.kind === "post";
  if (!isSet) {
    return status?.posted ? { label: "Posted", tone: "success" } : { label: "Not posted", tone: "warning" };
  }
  const total = carousel.slides.length;
  const posted = countPostedSlides(status, carousel.slides.map((slide) => slide.id));
  if (posted === 0) return { label: "Not posted", tone: "warning" };
  if (posted === total) return { label: "Posted", tone: "success" };
  return { label: `${posted}/${total} posted`, tone: "neutral" };
}

/** The Carousels studio's list rail: group filter chips, then one row per entry. */
export function MarketingCarouselRail({
  carousels,
  selectedId,
  postedByCarouselId,
  statusesLoading,
  flashId,
  onSelect,
}: {
  carousels: MarketingCarousel[];
  selectedId: string;
  postedByCarouselId: Record<string, MarketingCarouselPostStatus | undefined>;
  statusesLoading: boolean;
  flashId: string | null;
  onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | Group>("all");
  const counts = useMemo(() => {
    const result: Record<Group, number> = { ads: 0, posts: 0, store: 0 };
    for (const carousel of carousels) result[groupOf(carousel)] += 1;
    return result;
  }, [carousels]);

  const options = [
    { key: "all", label: "All", count: carousels.length },
    ...GROUPS.filter((group) => counts[group.key] > 0).map((group) => ({
      key: group.key,
      label: group.label,
      count: counts[group.key],
    })),
  ];

  return (
    <>
      <div className="shrink-0 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 px-4 pb-3 pt-4">
        <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">Studio</p>
        <h2 className="m-0 text-[17px] font-extrabold text-[var(--sf-ink)]">Carousels &amp; ads</h2>
        <GardenFilterChips
          options={options}
          value={filter}
          onChange={(key) => setFilter(key as "all" | Group)}
          ariaLabel="Show"
          className="mt-3"
        />
      </div>
      <nav aria-label="Marketing carousels" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2.5 py-3">
        {GROUPS.filter((group) => filter === "all" || filter === group.key).map((group) => {
          const items = carousels.filter((carousel) => groupOf(carousel) === group.key);
          if (!items.length) return null;
          const Icon = group.icon;
          return (
            <section key={group.key} aria-label={group.label}>
              <div className="px-1.5">
                <GardenGroupHeading count={items.length}>{group.label}</GardenGroupHeading>
              </div>
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {items.map((carousel) => {
                  const selected = carousel.id === selectedId;
                  const flashed = carousel.id === flashId;
                  const slideLabel = carousel.slides.length === 1 ? "1 slide" : `${carousel.slides.length} slides`;
                  const sizeLabel =
                    carousel.kind === "store"
                      ? " · App Store + Play"
                      : (carousel.sizes?.length ?? 1) > 1
                        ? " · feed + story"
                        : "";
                  const chip = postedChip(carousel, postedByCarouselId[carousel.id]);
                  return (
                    <li key={carousel.id}>
                      <button
                        type="button"
                        aria-current={selected ? "true" : undefined}
                        onClick={() => onSelect(carousel.id)}
                        data-testid={`marketing-carousel-${carousel.id}`}
                        className={`flex w-full items-start gap-3 rounded-[14px] border-[1.5px] px-2.5 py-2.5 text-left transition-colors duration-300 ${
                          flashed
                            ? "border-[var(--sf-forest)]/35 bg-[var(--sf-mint)]"
                            : selected
                              ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)]"
                              : "border-transparent hover:bg-[var(--sf-accent-wash)]"
                        } ${G_FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`}
                      >
                        <span
                          aria-hidden
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-[var(--sf-ink)]/15 ${group.tint}`}
                        >
                          <Icon className="h-4 w-4 text-[var(--sf-ink)]/75" strokeWidth={2.4} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-extrabold leading-snug text-[var(--sf-ink)]">
                            {carousel.title}
                          </span>
                          {carousel.description ? (
                            <span className="mt-0.5 line-clamp-2 block text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
                              {carousel.description}
                            </span>
                          ) : null}
                          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-[12px] font-bold tabular-nums text-[var(--sf-soft)]">
                              {slideLabel}
                              {sizeLabel}
                            </span>
                            {statusesLoading ? null : <GChip tone={chip.tone}>{chip.label}</GChip>}
                          </span>
                        </span>
                        <ChevronRight
                          className={`mt-1 h-4 w-4 shrink-0 ${selected ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-ink)]/25"}`}
                          aria-hidden
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </nav>
    </>
  );
}
