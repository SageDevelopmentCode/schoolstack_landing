import localFont from "next/font/local";

/**
 * Site-wide heading font (`--font-heading`), loaded by the root layout. Not preloaded: the home
 * page does not use it, and next/font's size-matched fallback keeps the swap on other pages subtle.
 */
export const lora = localFont({
  src: [
    { path: "../../fonts/lora/lora-latin-400-normal.woff2", weight: "400" },
    { path: "../../fonts/lora/lora-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../../fonts/lora/lora-latin-500-normal.woff2", weight: "500" },
    { path: "../../fonts/lora/lora-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../../fonts/lora/lora-latin-600-normal.woff2", weight: "600" },
    { path: "../../fonts/lora/lora-latin-600-italic.woff2", weight: "600", style: "italic" },
    { path: "../../fonts/lora/lora-latin-700-normal.woff2", weight: "700" },
    { path: "../../fonts/lora/lora-latin-700-italic.woff2", weight: "700", style: "italic" },
  ],
  display: "swap",
  preload: false,
  variable: "--font-lora",
});
