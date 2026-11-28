import { FOUNDERS, SITE_NAME, SITE_URL } from "./site";

/** Safe for dangerouslySetInnerHTML inside application/ld+json script tags. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

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
  datePublished,
  dateModified,
}: {
  headline: string;
  description: string;
  path: string;
  image: string;
  author?: { name: string; url: string };
  /** ISO date or date-time. Google uses these for article dates in results. */
  datePublished?: string | null;
  dateModified?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: `${SITE_URL}${path}`,
    mainEntityOfPage: `${SITE_URL}${path}`,
    image: `${SITE_URL}${image}`,
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified || datePublished ? { dateModified: dateModified ?? datePublished } : {}),
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

/** MudKitchen's founders as schema.org Person nodes (Organization.founder, AboutPage). */
export function founderPeopleJsonLd() {
  return FOUNDERS.map((person) => ({
    "@type": "Person",
    name: person.name,
    jobTitle: person.jobTitle,
    worksFor: { "@id": `${SITE_URL}/#organization` },
    ...(person.sameAs.length ? { sameAs: [...person.sameAs] } : {}),
  }));
}

/** AboutPage schema: the page is about MudKitchen, made by its founders. */
export function aboutPageJsonLd({ path, description }: { path: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${SITE_URL}${path}`,
    description,
    about: { "@id": `${SITE_URL}/#organization` },
    mainEntity: { "@id": `${SITE_URL}/#organization` },
    author: founderPeopleJsonLd(),
  };
}

/** WebPage schema with its last-updated date, for pages that show one (features, comparisons). */
export function webPageJsonLd({ name, path, description, dateModified }: { name: string; path: string; description: string; dateModified: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url: `${SITE_URL}${path}`,
    description,
    dateModified,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}
