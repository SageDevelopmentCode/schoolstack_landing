// Signature preview font — safe to import from client components (single family only).
import localFont from "next/font/local";

export const greatVibes = localFont({
  src: [{ path: "../../fonts/great-vibes/great-vibes-latin-400-normal.woff2", weight: "400" }],
  display: "swap",
  preload: false,
  variable: "--font-great-vibes",
});
