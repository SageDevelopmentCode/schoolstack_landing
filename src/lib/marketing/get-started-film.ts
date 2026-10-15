/**
 * Get-started product film (`/get-started` bottom section).
 * Fixed YouTube embed — no env-based URL resolution.
 */
export const GET_STARTED_FILM_YOUTUBE_VIDEO_ID = "t9najg6kHIc";

export const GET_STARTED_FILM_YOUTUBE_EMBED_SRC = `https://www.youtube.com/embed/${GET_STARTED_FILM_YOUTUBE_VIDEO_ID}`;

export const GET_STARTED_FILM_COPY = {
  kicker: "Before you meet us",
  subtitle:
    "One minute on admissions, enrollment, billing, and the family portal—so your demo can focus on your school.",
} as const;
