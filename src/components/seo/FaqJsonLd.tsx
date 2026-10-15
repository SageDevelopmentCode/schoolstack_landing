import { faqPageJsonLd, serializeJsonLd } from "@/lib/seo";
import type { FaqItem } from "@/lib/faq";

type FaqJsonLdProps = {
  faqs: FaqItem[];
};

export default function FaqJsonLd({ faqs }: FaqJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(faqPageJsonLd(faqs)),
      }}
    />
  );
}
