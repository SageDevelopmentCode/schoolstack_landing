/**
 * Get-started product film (`/get-started` bottom section).
 *
 * URL resolution (first match wins):
 * 1. `NEXT_PUBLIC_GET_STARTED_FILM_VIDEO_URL` — explicit override (CDN, nested path, etc.)
 * 2. `NEXT_PUBLIC_SUPABASE_URL` + public object in bucket `website-marketing` at `mudkitchen-16x9.mp4`
 * 3. Local dev: `/videos/mudkitchen-16x9.mp4` — run `npm run film:sync-public` after Remotion `render:16x9`
 *
 * Upload after `supabase/migrations/20261115_add_website_marketing_storage.sql`.
 */
const LOCAL_DEV_FILM_SRC = "/videos/mudkitchen-16x9.mp4";

const WEBSITE_MARKETING_BUCKET = "website-marketing";

/** Canonical object key in `website-marketing` (bucket root). */
export const GET_STARTED_FILM_OBJECT_PATH = "mudkitchen-16x9.mp4";

function supabasePublicFilmUrl(supabaseUrl: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${WEBSITE_MARKETING_BUCKET}/${GET_STARTED_FILM_OBJECT_PATH}`;
}

function resolveGetStartedFilmVideoSrc(): string {
  const explicit = process.env.NEXT_PUBLIC_GET_STARTED_FILM_VIDEO_URL?.trim();
  if (explicit) return explicit;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (supabaseUrl) return supabasePublicFilmUrl(supabaseUrl);

  return LOCAL_DEV_FILM_SRC;
}

export const GET_STARTED_FILM_VIDEO_SRC = resolveGetStartedFilmVideoSrc();

export const GET_STARTED_FILM_COPY = {
  kicker: "Before you meet us",
  subtitle:
    "One minute on admissions, enrollment, billing, and the family portal—so your demo can focus on your school.",
} as const;
