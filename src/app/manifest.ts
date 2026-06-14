import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      "The complete operating system for microschools — enrollment, billing, parent communication, and daily operations.",
    start_url: "/",
    display: "standalone",
    background_color: "#1a3327",
    theme_color: "#1a3327",
    icons: [
      {
        src: "/images/Logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
