export type ParentPortalFeatureVisual = {
  tagline: string;
  heroImage: string;
  accentIllustration: string;
};

const DEFAULT_VISUAL: ParentPortalFeatureVisual = {
  tagline: "Your parent portal is taking shape.",
  heroImage: "/images/stock/ImageTwo.webp",
  accentIllustration: "/images/illustrations/HeroLeft.webp",
};

const FEATURE_VISUALS: Record<string, ParentPortalFeatureVisual> = {
  billing: {
    tagline: "Tuition and receipts, without the runaround.",
    heroImage: "/images/stock/ImageFive.webp",
    accentIllustration: "/images/illustrations/Folder.webp",
  },
  messages: {
    tagline: "School conversations, in one calm inbox.",
    heroImage: "/images/stock/ImageOne.webp",
    accentIllustration: "/images/illustrations/Notebook.webp",
  },
  calendar: {
    tagline: "Field trips, events, and key dates — all here.",
    heroImage: "/images/stock/ImageNine.webp",
    accentIllustration: "/images/illustrations/Counting.webp",
  },
  attendance: {
    tagline: "Check-in history and absences at a glance.",
    heroImage: "/images/stock/ImageFour.webp",
    accentIllustration: "/images/illustrations/Backpack.webp",
  },
  feed: {
    tagline: "Photos and classroom moments from your child's day.",
    heroImage: "/images/stock/ImageThree.webp",
    accentIllustration: "/images/illustrations/Drawing2.webp",
  },
  children: {
    tagline: "Profiles, contacts, and enrollment — all in one place.",
    heroImage: "/images/stock/Homeschool2.webp",
    accentIllustration: "/images/illustrations/Plant.webp",
  },
  committees: {
    tagline: "Volunteer and plug into school community life.",
    heroImage: "/images/stock/ImageTen.webp",
    accentIllustration: "/images/illustrations/Basket.webp",
  },
};

export function getParentPortalFeatureVisual(
  featureKey: string,
): ParentPortalFeatureVisual {
  const baseKey = featureKey.split("/")[0] ?? featureKey;
  return FEATURE_VISUALS[baseKey] ?? DEFAULT_VISUAL;
}

export function formatParentPortalFeedbackType(type: string): string {
  switch (type) {
    case "feature_request":
      return "Feature request";
    case "feedback":
      return "General feedback";
    case "bug":
      return "Something isn't working";
    default:
      return type;
  }
}
