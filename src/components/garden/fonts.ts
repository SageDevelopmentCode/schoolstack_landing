import localFont from "next/font/local";

/** Chunky display type for headings, prices and big numbers. */
export const gardenDisplay = localFont({
  src: [
    {
      path: "../../fonts/bricolage-grotesque/bricolage-grotesque-latin-800-normal.woff2",
      weight: "800",
    },
  ],
  display: "swap",
  variable: "--font-sf-display",
});

/** Rounded, friendly body copy. */
export const gardenBody = localFont({
  src: [
    { path: "../../fonts/nunito/nunito-latin-400-normal.woff2", weight: "400" },
    { path: "../../fonts/nunito/nunito-latin-500-normal.woff2", weight: "500" },
    { path: "../../fonts/nunito/nunito-latin-600-normal.woff2", weight: "600" },
    { path: "../../fonts/nunito/nunito-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-sf-body",
});

/** Handwritten accents: subtitles, captions, little notes. Use sparingly. */
export const gardenHand = localFont({
  src: [{ path: "../../fonts/gochi-hand/gochi-hand-latin-400-normal.woff2", weight: "400" }],
  display: "swap",
  variable: "--font-sf-hand",
});

export const gardenFontVariables = `${gardenDisplay.variable} ${gardenBody.variable} ${gardenHand.variable}`;
