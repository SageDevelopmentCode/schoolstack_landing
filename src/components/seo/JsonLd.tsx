import {
  HOME_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOFTWARE_FEATURES,
  SAME_AS,
} from "@/lib/site";

const LOGO_URL = `${SITE_URL}/images/Logo.png`;
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SOFTWARE_ID = `${SITE_URL}/#software`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
      ...(SAME_AS.length > 0 ? { sameAs: SAME_AS } : {}),
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: {
        "@id": ORG_ID,
      },
      isPartOf: {
        "@id": ORG_ID,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": SOFTWARE_ID,
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "School Management Software",
      operatingSystem: "Web",
      description: HOME_DESCRIPTION,
      url: SITE_URL,
      featureList: SOFTWARE_FEATURES,
      offers: {
        "@type": "Offer",
        description: "Contact for pricing",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/get-started`,
      },
      publisher: {
        "@id": ORG_ID,
      },
    },
  ],
};

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
