/**
 * Real customer proof, used on /try and the home page. Keep every string
 * true and word for word:
 * - TUITION_RATING: 7 Sage Field parents rated the tuition payment flow
 *   5 out of 5 after paying.
 * - PARENT_QUOTE: an anonymous Sage Field parent. Replace `quote` with the
 *   parent's exact words if they differ.
 *
 * No AggregateRating JSON-LD: reviews a company collects about itself are
 * ineligible for star rich results.
 */
export const TUITION_RATING = {
  stars: 5,
  count: 7,
  label: "7 five-star reviews from parents paying tuition",
  srLabel: "Rated 5 out of 5 stars by 7 Sage Field parents after paying tuition",
} as const;

export const PARENT_QUOTE = {
  quote:
    "By far the best app and experience I’ve had compared to any other educational software I’ve used.",
  attribution: "Parent, Sage Field",
} as const;
