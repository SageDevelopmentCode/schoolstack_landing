import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { MUDKITCHEN_MARKETING_GARDEN_THEME } from "@/lib/marketing/mudkitchen-garden-marketing-theme";

/**
 * Garden palette for the free tools (enrollment calculator, tuition planner,
 * ops check). The fonts fall back to the app font because `CalculatorDialog`
 * portals to <body>, outside the `.sf-garden` scope that defines them.
 */
export const MARKETING_TOOL_GARDEN_THEME: ParentThemeTokens = {
  ...MUDKITCHEN_MARKETING_GARDEN_THEME,
  white: "#FFFFFF",
  shadowCard: "0 6px 0 0 #2B241D",
  fontDisplay: "var(--font-sf-display, var(--font-secondary))",
  fontBody: "var(--font-sf-body, var(--font-secondary))",
};

const focusRing = "focus-visible:outline-none focus-visible:ring-4";

/** Compact clay "toy" button for in-tool primary actions (Start, Next). */
export const toolBtnPrimary = `inline-flex items-center justify-center gap-2 rounded-full bg-[var(--sf-clay)] px-6 py-3 text-[15px] font-extrabold text-white shadow-[0_4px_0_0_var(--sf-clay-deep)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_var(--sf-clay-deep)] active:translate-y-1 active:shadow-[0_1px_0_0_var(--sf-clay-deep)] disabled:pointer-events-none disabled:opacity-40 cursor-pointer ${focusRing} focus-visible:ring-[var(--sf-clay)]/40`;

/** Compact ink outline "toy" button for in-tool secondary actions (Back, Start over, Print). */
export const toolBtnOutline = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--sf-ink)] bg-white px-5 py-2.5 text-sm font-extrabold text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_var(--sf-ink)] active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--sf-ink)] cursor-pointer ${focusRing} focus-visible:ring-[var(--sf-ink)]/30`;
