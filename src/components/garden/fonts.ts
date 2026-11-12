import { Bricolage_Grotesque, Gochi_Hand, Nunito } from "next/font/google";

/** Chunky display type for headings, prices and big numbers. */
export const gardenDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-sf-display",
  display: "swap",
});
/** Rounded, friendly body copy. */
export const gardenBody = Nunito({ subsets: ["latin"], variable: "--font-sf-body", display: "swap" });
/** Handwritten accents: subtitles, captions, little notes. Use sparingly. */
export const gardenHand = Gochi_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sf-hand",
  display: "swap",
});

export const gardenFontVariables = `${gardenDisplay.variable} ${gardenBody.variable} ${gardenHand.variable}`;
