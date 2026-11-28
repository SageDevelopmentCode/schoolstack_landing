import { serializeJsonLd } from "@/lib/seo";
import {
  COMPANY_LOCATION,
  ENTITY_DISAMBIGUATION,
  ENTITY_SUMMARY,
  ENTITY_TOPICS,
  HOME_DESCRIPTION,
  MUDKITCHEN_CONTACT,
  SITE_NAME,
  SITE_URL,
  SOFTWARE_FEATURES,
  SAME_AS,
} from "@/lib/site";
import { founderPeopleJsonLd } from "@/lib/seo";

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
      alternateName: ["Mud Kitchen", "trymudkitchen"],
      url: SITE_URL,
      description: ENTITY_SUMMARY,
      disambiguatingDescription: ENTITY_DISAMBIGUATION,
      knowsAbout: ENTITY_TOPICS,
      founder: founderPeopleJsonLd(),
      foundingLocation: {
        "@type": "Place",
        address: { "@type": "PostalAddress", ...COMPANY_LOCATION },
      },
      address: { "@type": "PostalAddress", ...COMPANY_LOCATION },
      email: MUDKITCHEN_CONTACT.email,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: MUDKITCHEN_CONTACT.email,
        telephone: MUDKITCHEN_CONTACT.phoneHref.replace("tel:", ""),
        areaServed: "US",
        availableLanguage: "English",
      },
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
      applicationSubCategory: "Microschool Management Software",
      operatingSystem: "Web, iOS, Android",
      description: HOME_DESCRIPTION,
      disambiguatingDescription: ENTITY_DISAMBIGUATION,
      audience: {
        "@type": "Audience",
        audienceType: "Microschool founders and small private school administrators",
      },
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
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
    />
  );
}
