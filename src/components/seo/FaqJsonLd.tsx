import { faqPageJsonLd } from "@/lib/seo";
import type { FaqItem } from "@/lib/faq";

type FaqJsonLdProps = {
  faqs: FaqItem[];
};

export default function FaqJsonLd({ faqs }: FaqJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqPageJsonLd(faqs)),
      }}
    />
  );
}
