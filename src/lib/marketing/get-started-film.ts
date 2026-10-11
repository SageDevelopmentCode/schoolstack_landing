/**
 * Production: set `NEXT_PUBLIC_GET_STARTED_FILM_VIDEO_URL` to the Supabase public object URL, e.g.
 * `{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/website-marketing/marketing/get-started/mudkitchen-16x9.mp4`
 * (upload after `supabase/migrations/20261115_add_website_marketing_storage.sql`).
 *
 * Local dev (env unset): run `npm run film:sync-public` after Remotion `render:16x9`.
 */
const LOCAL_DEV_FILM_SRC = "/videos/mudkitchen-16x9.mp4";

export const GET_STARTED_FILM_VIDEO_SRC =
  process.env.NEXT_PUBLIC_GET_STARTED_FILM_VIDEO_URL?.trim() ||
  LOCAL_DEV_FILM_SRC;

export const GET_STARTED_FILM_COPY = {
  kicker: "Before you meet us",
  subtitle:
    "One minute on admissions, enrollment, billing, and the family portal—so your demo can focus on your school.",
} as const;
