import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  GOOGLE_SITE_VERIFICATION,
  SITE_NAME,
  SITE_URL,
} from "./site";

type PageMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  ogImageAlt?: string;
  ogImagePath?: string;
};

function defaultOgImages(alt: string, imagePath = "/opengraph-image") {
  return [
    {
      url: imagePath,
      width: 1200,
      height: 630,
      alt,
    },
  ];
}

function sharedMetadataFields(
  title: string,
  description: string,
  ogImagePath = "/opengraph-image",
) {
  return {
    applicationName: SITE_NAME,
    category: "Education",
    icons: {
      icon: "/images/Logo.png",
      apple: "/images/Logo.png",
    },
    ...(GOOGLE_SITE_VERIFICATION
      ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
      : {}),
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: "website" as const,
      locale: "en_US",
      images: defaultOgImages(title, ogImagePath),
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [ogImagePath],
    },
  };
}

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  noIndex = false,
  ogImageAlt,
  ogImagePath = "/opengraph-image",
}: PageMetadataOptions): Metadata {
  const canonical = path ? `${SITE_URL}${path}` : undefined;
  const imageAlt = ogImageAlt ?? title;
  const shared = sharedMetadataFields(title, description, ogImagePath);

  return {
    title,
    description,
    keywords: DEFAULT_KEYWORDS,
    ...(noIndex
      ? { robots: { index: false, follow: false } }
      : { robots: { index: true, follow: true } }),
    ...(canonical
      ? {
          alternates: {
            canonical,
          },
          openGraph: {
            ...shared.openGraph,
            url: canonical,
            images: defaultOgImages(imageAlt, ogImagePath),
          },
          twitter: {
            ...shared.twitter,
            images: [ogImagePath],
          },
        }
      : {}),
  };
}

export function rootMetadata(): Metadata {
  const title = "MudKitchen — The complete operating system for microschools";
  const shared = sharedMetadataFields(title, DEFAULT_DESCRIPTION);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    applicationName: SITE_NAME,
    category: "Education",
    robots: { index: true, follow: true },
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: "/images/Logo.png",
      apple: "/images/Logo.png",
    },
    ...(GOOGLE_SITE_VERIFICATION
      ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
      : {}),
    openGraph: shared.openGraph,
    twitter: shared.twitter,
  };
}
