import type { MetadataRoute } from "next";
import { ENTITY_SUMMARY, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: ENTITY_SUMMARY,
    start_url: "/",
    display: "standalone",
    background_color: "#1a3327",
    theme_color: "#1a3327",
    icons: [
      {
        src: "/images/icon-192.webp",
        sizes: "192x192",
        type: "image/webp",
      },
      {
        src: "/images/icon-512.webp",
        sizes: "512x512",
        type: "image/webp",
      },
    ],
  };
}
