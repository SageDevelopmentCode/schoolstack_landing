/**
 * Portal-density buttons for the MudKitchen account area. The kit's btnPop /
 * btnForest are sized for marketing heroes; these keep the same toy depth at
 * app size. Calm Garden: the toy (hard shadow) only on the primary action;
 * secondary actions are flat outlines or text links.
 */

export const portalFocusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sf-cream)]";

const toyBase = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-1 disabled:pointer-events-none disabled:opacity-60 cursor-pointer ${portalFocusRing}`;

/** Clay toy: the one primary action on a view. */
export const btnSmPop = `${toyBase} bg-[var(--sf-clay)] text-white shadow-[0_4px_0_0_var(--sf-clay-deep)] hover:shadow-[0_6px_0_0_var(--sf-clay-deep)] active:shadow-[0_1px_0_0_var(--sf-clay-deep)] focus-visible:ring-[var(--sf-clay)]/40`;

/** Forest toy: confirmation. */
export const btnSmForest = `${toyBase} bg-[var(--sf-forest)] text-white shadow-[0_4px_0_0_var(--sf-forest-deep)] hover:shadow-[0_6px_0_0_var(--sf-forest-deep)] active:shadow-[0_1px_0_0_var(--sf-forest-deep)] focus-visible:ring-[var(--sf-forest)]/40`;

/** Flat ink outline: secondary actions (no toy shadow). */
export const btnSmOutline = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--sf-ink)]/80 bg-white px-5 py-2 text-[15px] font-extrabold text-[var(--sf-ink)] transition-colors duration-200 hover:bg-[var(--sf-cream)] disabled:pointer-events-none disabled:opacity-60 cursor-pointer ${portalFocusRing} focus-visible:ring-[var(--sf-ink)]/25`;

/** Flat forest outline: secondary confirm-type action. */
export const btnSmForestOutline = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--sf-forest)] bg-white px-5 py-2 text-[15px] font-extrabold text-[var(--sf-forest)] transition-colors duration-200 hover:bg-[var(--sf-mint)]/60 disabled:pointer-events-none disabled:opacity-60 cursor-pointer ${portalFocusRing} focus-visible:ring-[var(--sf-forest)]/30`;

/** Inline text link with an underline. */
export const textLink = `inline-flex items-center gap-1.5 rounded-md font-extrabold text-[var(--sf-clay-deep)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--sf-clay)] ${portalFocusRing} focus-visible:ring-[var(--sf-clay)]/30`;
