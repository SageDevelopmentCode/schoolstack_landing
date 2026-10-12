import { SITE_NAME, SITE_URL } from "./site";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildBreadcrumbs(
  ...items: BreadcrumbItem[]
): BreadcrumbItem[] {
  return [{ name: SITE_NAME, path: "/" }, ...items];
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqPageJsonLd(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function articleJsonLd({
  headline,
  description,
  path,
  image,
  author,
}: {
  headline: string;
  description: string;
  path: string;
  image: string;
  author?: { name: string; url: string };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: `${SITE_URL}${path}`,
    image: `${SITE_URL}${image}`,
    author: author
      ? {
          "@type": "Person",
          name: author.name,
          url: author.url,
        }
      : {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/Logo.png`,
      },
    },
  };
}
