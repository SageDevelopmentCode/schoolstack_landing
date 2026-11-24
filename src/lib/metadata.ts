import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  GOOGLE_SITE_VERIFICATION,
  SITE_NAME,
  SITE_URL,
} from "./site";
import {
  LINK_PREVIEW_SIZE,
  linkPreviewCard,
  linkPreviewImageUrl,
} from "./marketing/link-previews";

type PageMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  ogImageAlt?: string;
  /** Overrides the page's link-preview card (src/lib/marketing/link-previews.ts). */
  ogImagePath?: string;
  keywords?: string[];
};

const HOME_PREVIEW = linkPreviewCard("/");
const HOME_PREVIEW_IMAGE = linkPreviewImageUrl(HOME_PREVIEW);

function defaultOgImages(alt: string, imagePath = HOME_PREVIEW_IMAGE) {
  return [
    {
      url: imagePath,
      width: LINK_PREVIEW_SIZE.width,
      height: LINK_PREVIEW_SIZE.height,
      alt,
      type: "image/png",
    },
  ];
}

function siteIcons() {
  return {
    icon: [
      { url: "/images/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/icon-192.webp", sizes: "192x192", type: "image/webp" },
    ],
    apple: "/images/apple-touch-icon.png",
  };
}

function sharedMetadataFields(
  title: string,
  description: string,
  ogImagePath = HOME_PREVIEW_IMAGE,
  ogImageAlt = title,
) {
  return {
    applicationName: SITE_NAME,
    category: "Education",
    icons: siteIcons(),
    ...(GOOGLE_SITE_VERIFICATION
      ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
      : {}),
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: "website" as const,
      locale: "en_US",
      images: defaultOgImages(ogImageAlt, ogImagePath),
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [{ url: ogImagePath, alt: ogImageAlt }],
    },
  };
}

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  noIndex = false,
  ogImageAlt,
  ogImagePath,
  keywords,
}: PageMetadataOptions): Metadata {
  const canonical = path ? `${SITE_URL}${path}` : undefined;
  const card = linkPreviewCard(path);
  const imagePath = ogImagePath ?? linkPreviewImageUrl(card);
  const imageAlt = ogImageAlt ?? (ogImagePath ? title : card.alt);
  const shared = sharedMetadataFields(title, description, imagePath, imageAlt);

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : DEFAULT_KEYWORDS,
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
          },
          twitter: shared.twitter,
        }
      : {}),
  };
}

export function rootMetadata(): Metadata {
  const title = "MudKitchen — The complete operating system for microschools";
  const shared = sharedMetadataFields(
    title,
    DEFAULT_DESCRIPTION,
    HOME_PREVIEW_IMAGE,
    HOME_PREVIEW.alt,
  );

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
    icons: siteIcons(),
    ...(GOOGLE_SITE_VERIFICATION
      ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
      : {}),
    openGraph: shared.openGraph,
    twitter: shared.twitter,
  };
}
