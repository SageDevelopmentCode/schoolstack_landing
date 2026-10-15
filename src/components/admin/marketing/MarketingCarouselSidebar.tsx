"use client";

import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import type { MarketingCarousel } from "@/components/admin/marketing/carousels/types";
import type { MarketingCarouselPostStatus } from "@/lib/marketing/carousel-post-status";

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
  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-admin-border bg-admin-surface">
      <div className="shrink-0 border-b border-admin-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-admin-faint">Carousels</p>
        <p className="mt-0.5 text-[11px] text-admin-muted">{carousels.length} available</p>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3" aria-label="Marketing carousels">
        {carousels.map((carousel) => {
          const selected = carousel.id === selectedId;
          const slideLabel =
            carousel.slides.length === 1 ? "1 slide" : `${carousel.slides.length} slides`;
          const posted = postedByCarouselId[carousel.id]?.posted ?? false;

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
                <AdminStatusBadge
                  label={posted ? "Posted" : "Not posted"}
                  variant={posted ? "success" : "warning"}
                />
              </div>
              {carousel.description ? (
                <p className="mt-1 text-xs leading-snug text-admin-muted">{carousel.description}</p>
              ) : null}
              <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-admin-faint">
                {slideLabel}
              </p>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
