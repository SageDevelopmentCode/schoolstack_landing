import { ExternalLink } from "lucide-react";
import { GIFT_CARD_PAGE_COPY, GIFT_CARD_TERMS_PATH } from "@/lib/marketing/gift-card-offer";

/** "Read the full terms": opens /gift-card/terms in a new tab so the booking flow keeps its place. */
export default function GiftCardTermsLink() {
  return (
    <a
      href={GIFT_CARD_TERMS_PATH}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-extrabold text-[var(--sf-clay-deep)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--sf-clay)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
    >
      {GIFT_CARD_PAGE_COPY.termsLink}
      <ExternalLink size={15} strokeWidth={2.6} aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
