"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import { ParentGardenScope } from "@/components/school-parent/garden/ParentGardenFrame";

/*
 * Admin Garden skin. Admin pages that moved to Garden (Admissions) wrap their
 * content in <AdminGardenSkin>. Shared story primitives (AdminCard,
 * AdminButton, AdminChip, BuilderQuestionCard, ConfirmDialog, …) read it and
 * render the Garden look; everywhere else they stay School Day Story. This is
 * how deep editors move to Garden without forking their logic.
 * Only mount it INSIDE a ParentGardenFrame (the classes use Garden tokens).
 */

const AdminGardenSkinContext = createContext<ParentThemeTokens | null>(null);

export function AdminGardenSkin({ theme, children }: { theme: ParentThemeTokens; children: ReactNode }) {
  return <AdminGardenSkinContext.Provider value={theme}>{children}</AdminGardenSkinContext.Provider>;
}

/** The school theme when rendering inside a Garden admin page, else null. */
export function useAdminGardenSkin(): ParentThemeTokens | null {
  return useContext(AdminGardenSkinContext);
}

/** Secondary solid action (accent fill, no toy shadow: the page keeps its one toy button). */
export const gBtnSolidSm = `inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[var(--sf-ink)]/80 bg-[var(--sf-clay)] px-4 py-2 text-[13px] font-extrabold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--sf-clay-deep)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${G_FOCUS}`;
/** Soft accent action. */
export const gBtnSoftSm = `inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-transparent bg-[var(--sf-accent-wash)] px-4 py-2 text-[13px] font-extrabold text-[var(--sf-clay-deep)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-clay)]/30 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${G_FOCUS}`;
export const gBtnOutlineTight = `inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[var(--sf-ink)]/20 bg-white px-4 py-2 text-[13px] font-extrabold text-[var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/45 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${G_FOCUS}`;
export const gBtnDangerTight = `inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#b4412f]/35 bg-white px-4 py-2 text-[13px] font-extrabold text-[#9a3422] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b4412f]/70 hover:bg-[#fdf0ec] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${G_FOCUS}`;
/** Compact modifier for dense rows. */
export const G_BTN_COMPACT = "!px-3 !py-1.5 !text-[12px]";

/**
 * Wrap portalled overlays (createPortal to <body>) in this so skinned
 * primitives inside them keep the Garden tokens and fonts. No-op outside
 * Garden admin pages.
 */
export function SkinPortalScope({ children }: { children: ReactNode }) {
  const skin = useAdminGardenSkin();
  if (!skin) return <>{children}</>;
  return (
    <ParentGardenScope theme={skin} className="contents">
      {children}
    </ParentGardenScope>
  );
}
