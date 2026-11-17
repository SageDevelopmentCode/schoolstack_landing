import { btnPop } from "@/components/garden/ui";
import { BUTTON_LOADING_LAYOUT_CLASS } from "@/components/ui/ButtonLoadingLabel";
import { MUDKITCHEN_MARKETING_BRIGHT_THEME } from "@/lib/marketing/mudkitchen-bright-marketing-theme";

/*
 * Calm Garden classes for the shared sign-in kit (`/login`, parent and apply
 * gates). They need a `.sf-garden` ancestor, which `BrightAuthPageLayout`
 * provides. Inside a school's gate `--sf-clay*` is the school's accent.
 */

/** Only used for the `theme` prop `GetStartedStoryTextField` requires; the garden appearance ignores it. */
export const BRIGHT_AUTH_THEME = MUDKITCHEN_MARKETING_BRIGHT_THEME;

/** The one toy button per step. */
export const BRIGHT_AUTH_PRIMARY_BUTTON = `${btnPop} w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${BUTTON_LOADING_LAYOUT_CLASS}`;

export const BRIGHT_AUTH_ERROR_CLASS =
  "mb-4 rounded-2xl bg-[var(--sf-peach)] px-4 py-2.5 text-sm font-semibold text-[var(--sf-clay-deep)]";

/** Paper card that holds each step's form (no tilt, no tape: it's a form). */
export const GARDEN_AUTH_CARD =
  "rounded-[30px] border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] p-5 shadow-[0_6px_0_0_var(--sf-ink)] sm:p-6";

/** Inline text action ("Use password instead", "Resend code"). */
export const GARDEN_AUTH_LINK =
  "rounded-sm font-extrabold text-[var(--sf-clay-deep)] underline decoration-[var(--sf-clay)]/40 decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--sf-clay)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 disabled:cursor-not-allowed disabled:opacity-60";

/** Quieter text action ("Use a different email"). */
export const GARDEN_AUTH_QUIET_LINK =
  "rounded-sm font-bold text-[var(--sf-soft)] underline decoration-[var(--sf-ink)]/20 decoration-2 underline-offset-4 transition-colors hover:text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 disabled:cursor-not-allowed disabled:opacity-60";

/** Small outline pill for "Back". */
export const GARDEN_AUTH_BACK =
  "mb-6 inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--sf-ink)]/15 bg-white px-3.5 py-1.5 text-sm font-extrabold text-[var(--sf-ink)] transition hover:border-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 disabled:cursor-not-allowed disabled:opacity-50";

/** Helper line under a form ("Prefer a password? …"). */
export const GARDEN_AUTH_HELPER = "text-sm text-[var(--sf-soft)]";

/** Text-only school name when a school has no logo image. */
export const GARDEN_AUTH_WORDMARK_TEXT = "sf-display text-2xl leading-tight";
