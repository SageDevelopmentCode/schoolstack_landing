export type DownloadAppSlideGroup = "connected" | "family" | "tuition";

export type DownloadAppSlide = {
  src: string;
  alt: string;
  caption: string;
  group: DownloadAppSlideGroup;
};

export const DOWNLOAD_APP_SLIDES: DownloadAppSlide[] = [
  {
    src: "/images/mobileapp/1.webp",
    alt: "Everything your microschool needs together in one app.",
    caption: "One calm home for school life—built for microschools.",
    group: "connected",
  },
  {
    src: "/images/mobileapp/2.webp",
    alt: "Give families one place to stay in the loop.",
    caption: "Start here cards and upcoming events keep everyone aligned.",
    group: "connected",
  },
  {
    src: "/images/mobileapp/3.webp",
    alt: "Real conversations with teachers, not lost in email.",
    caption: "Message staff directly in the app—no digging through inboxes.",
    group: "connected",
  },
  {
    src: "/images/mobileapp/4.webp",
    alt: "Tuition and billing where families already are.",
    caption: "See balances, pay tuition, and manage autopay in one place.",
    group: "tuition",
  },
  {
    src: "/images/mobileapp/5.webp",
    alt: "From application to enrolled, progress families can see.",
    caption: "Enrollment checklists and status your family can follow.",
    group: "family",
  },
  {
    src: "/images/mobileapp/6.webp",
    alt: "Support teachers with a calmer school day.",
    caption: "Teachers see what needs attention without the scramble.",
    group: "tuition",
  },
  {
    src: "/images/mobileapp/7.webp",
    alt: "Attendance and rosters, quick on the classroom floor.",
    caption: "Mark attendance and search rosters from the classroom.",
    group: "tuition",
  },
  {
    src: "/images/mobileapp/8.webp",
    alt: "Attendance and rosters, quick on the classroom floor.",
    caption: "Fast attendance workflows for teachers on the go.",
    group: "tuition",
  },
  {
    src: "/images/mobileapp/9.webp",
    alt: "Enrollment is on track with admissions at a glance.",
    caption: "School admins see applications, tuition, and messages together.",
    group: "tuition",
  },
  {
    src: "/images/mobileapp/10.webp",
    alt: "Admissions and enrollment that move as fast as you do.",
    caption: "Pipeline views from first application through enrolled.",
    group: "family",
  },
];

const GROUP_ORDER: DownloadAppSlideGroup[] = ["connected", "family", "tuition"];

export function getSlideByIndex(index: number): DownloadAppSlide | undefined {
  if (index < 0 || index >= DOWNLOAD_APP_SLIDES.length) return undefined;
  return DOWNLOAD_APP_SLIDES[index];
}

export function getSlidesForGroup(group: DownloadAppSlideGroup): DownloadAppSlide[] {
  return DOWNLOAD_APP_SLIDES.filter((slide) => slide.group === group);
}

export function getFirstSlideIndexForGroup(group: DownloadAppSlideGroup): number {
  const index = DOWNLOAD_APP_SLIDES.findIndex((slide) => slide.group === group);
  return index >= 0 ? index : 0;
}

export function getGroupForSlideIndex(index: number): DownloadAppSlideGroup {
  return getSlideByIndex(index)?.group ?? GROUP_ORDER[0];
}

export const DOWNLOAD_APP_SLIDE_COUNT = DOWNLOAD_APP_SLIDES.length;

/** Aspect ratio width / height for layout (1242×2688). */
export const DOWNLOAD_APP_SLIDE_ASPECT_RATIO = 1242 / 2688;
