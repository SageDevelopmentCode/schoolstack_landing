/**
 * When the lead popup may open. All thresholds live here so they can be tuned in one place.
 *
 * It opens on whichever trigger comes first, at most once per visit and once per `cooldownDays`:
 * - engagement: on the home page, when a target section scrolls into view. On other pages,
 *   when the visitor has spent `minSeconds` on the page AND scrolled `minScrollRatio` of it.
 * - exit intent (desktop / fine pointer only): the mouse leaves through the top of the
 *   window after `exitIntentMinSeconds`.
 */
export const LEAD_POPUP_TRIGGERS = {
  cooldownDays: 7,
  /** Home page: the pricing section (id="pricing") scrolling into view counts as interest. */
  homeTargetSelector: "#pricing",
  homeTargetVisibleRatio: 0.25,
  minSeconds: 20,
  minScrollRatio: 0.4,
  exitIntentMinSeconds: 10,
  /** Never shown on these paths (prefix match). */
  excludedPrefixes: ["/try", "/support", "/free-preview", "/demo", "/admin", "/school", "/login", "/gift-card/terms", "/privacy", "/terms"],
} as const;

export const LEAD_POPUP_SHOWN_KEY = "mk-lead-popup-shown";
