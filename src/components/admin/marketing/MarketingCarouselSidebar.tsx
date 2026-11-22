"use client";

import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import type { MarketingCarousel } from "@/components/admin/marketing/carousels/types";
import { countPostedSlides, type MarketingCarouselPostStatus } from "@/lib/marketing/carousel-post-status";
import type { AdminStatusVariant } from "@/lib/admin-ui/admin-status-styles";

type MarketingCarouselSidebarProps = {
  carousels: MarketingCarousel[];
  selectedId: string;
  postedByCarouselId: Record<string, MarketingCarouselPostStatus | undefined>;
  onSelect: (id: string) => void;
};

export function MarketingCarouselSidebar({
  carousels,
  selectedId,
  postedByCarouselId,
  onSelect,
}: MarketingCarouselSidebarProps) {
  const groups = [
    { label: "Ads", items: carousels.filter((carousel) => carousel.kind === "ad") },
    { label: "Posts", items: carousels.filter((carousel) => carousel.kind !== "ad" && carousel.kind !== "store") },
    { label: "App store", items: carousels.filter((carousel) => carousel.kind === "store") },
  ];

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-admin-border bg-admin-surface">
      <div className="shrink-0 border-b border-admin-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-admin-faint">Carousels</p>
        <p className="mt-0.5 text-[11px] text-admin-muted">{carousels.length} available</p>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3" aria-label="Marketing carousels">
        {groups.map((group) =>
          group.items.length ? (
            <div key={group.label} className="flex flex-col gap-2">
              <p className="px-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-admin-faint">
                {group.label} · {group.items.length}
              </p>
              {group.items.map((carousel) => {
                const selected = carousel.id === selectedId;
                const slideLabel =
                  carousel.slides.length === 1 ? "1 slide" : `${carousel.slides.length} slides`;
                const sizeLabel =
                  carousel.kind === "store" ? " · App Store + Play" : (carousel.sizes?.length ?? 1) > 1 ? " · feed + story" : "";
                const badge = postedBadge(carousel, postedByCarouselId[carousel.id]);

                return (
                  <button
                    key={carousel.id}
                    type="button"
                    aria-current={selected ? "true" : undefined}
                    onClick={() => onSelect(carousel.id)}
                    className={`w-full rounded-admin-md border px-3 py-2.5 text-left transition-colors ${
                      selected
                        ? "border-admin-accent/30 bg-admin-accent/10"
                        : "border-admin-border bg-admin-surface hover:border-admin-border-strong hover:bg-admin-canvas/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 text-sm font-medium text-admin-text">{carousel.title}</p>
                      <AdminStatusBadge label={badge.label} variant={badge.variant} />
                    </div>
                    {carousel.description ? (
                      <p className="mt-1 text-xs leading-snug text-admin-muted">{carousel.description}</p>
                    ) : null}
                    <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-admin-faint">
                      {slideLabel}
                      {sizeLabel}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : null,
        )}
      </nav>
    </aside>
  );
}

/** Ad sets and post sets count posted slides ("3/12 posted"); a swipe carousel is posted or not as a whole. */
function postedBadge(
  carousel: MarketingCarousel,
  status: MarketingCarouselPostStatus | undefined,
): { label: string; variant: AdminStatusVariant } {
  const isSet = carousel.kind === "ad" || carousel.kind === "post";
  if (!isSet) {
    return status?.posted ? { label: "Posted", variant: "success" } : { label: "Not posted", variant: "warning" };
  }
  const total = carousel.slides.length;
  const posted = countPostedSlides(status, carousel.slides.map((slide) => slide.id));
  if (posted === 0) return { label: "Not posted", variant: "warning" };
  if (posted === total) return { label: "Posted", variant: "success" };
  return { label: `${posted}/${total} posted`, variant: "neutral" };
}
