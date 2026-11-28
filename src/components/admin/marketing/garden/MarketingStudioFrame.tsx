"use client";

import type { ReactNode } from "react";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { AdminGardenSkin } from "@/components/school-admin/garden/skin";
import { MUDKITCHEN_ADMIN_GARDEN_THEME as THEME } from "@/components/admin/garden/theme";

/**
 * Full-height Garden studio (Carousels, Avatars & icons): header on top, a
 * list rail on the left with its own scroll, and the canvas stage on dot-grid
 * paper. The page never scrolls on desktop, so the canvas stays big. Below
 * `lg` the rail stacks above the stage and the frame scrolls.
 *
 * `overlays` (the off-screen PNG export slots) render OUTSIDE the Garden scope
 * so exported art keeps exactly the look it had before the redesign.
 */
export function MarketingStudioFrame({
  header,
  rail,
  children,
  overlays,
  "data-testid": testId,
}: {
  header: ReactNode;
  rail: ReactNode;
  children: ReactNode;
  overlays?: ReactNode;
  "data-testid"?: string;
}) {
  return (
    <div className="relative h-full min-h-0">
      <ParentGardenFrame theme={THEME} className="h-full bg-[var(--sf-cream)]">
        <AdminGardenSkin theme={THEME}>
          <div
            data-testid={testId}
            data-admin-garden-scroller
            className="sf-admin-garden-skin flex h-full min-h-0 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 lg:overflow-hidden lg:px-8 lg:py-5"
          >
            {header}
            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[0_3px_0_0_rgba(43,36,29,0.08)] max-lg:h-[46vh]">
                {rail}
              </aside>
              <div className="flex min-h-[70vh] min-w-0 flex-col gap-3 lg:min-h-0">{children}</div>
            </div>
          </div>
        </AdminGardenSkin>
      </ParentGardenFrame>
      {overlays}
    </div>
  );
}

/** The canvas area: cream dot-grid paper with a soft inner border. */
export const STUDIO_STAGE_CLASS =
  "sf-grid relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] max-lg:min-h-[62vh]";
