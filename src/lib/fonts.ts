import localFont from "next/font/local";
import {
  Geist,
  Great_Vibes,
  Fragment_Mono,
  Delicious_Handrawn,
  Poppins,
} from "next/font/google";

export const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const lora = localFont({
  src: [
    { path: "../fonts/lora/lora-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/lora/lora-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/lora/lora-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/lora/lora-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../fonts/lora/lora-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/lora/lora-latin-600-italic.woff2", weight: "600", style: "italic" },
    { path: "../fonts/lora/lora-latin-700-normal.woff2", weight: "700" },
    { path: "../fonts/lora/lora-latin-700-italic.woff2", weight: "700", style: "italic" },
  ],
  display: "swap",
  variable: "--font-lora",
});

export const nunito = localFont({
  src: [
    { path: "../fonts/nunito/nunito-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/nunito/nunito-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/nunito/nunito-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/nunito/nunito-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-nunito",
});

export const nunitoSans = localFont({
  src: [
    { path: "../fonts/nunito-sans/nunito-sans-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/nunito-sans/nunito-sans-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/nunito-sans/nunito-sans-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/nunito-sans/nunito-sans-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-nunito-sans",
});

export const sourceSans3 = localFont({
  src: [
    { path: "../fonts/source-sans-3/source-sans-3-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/source-sans-3/source-sans-3-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/source-sans-3/source-sans-3-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/source-sans-3/source-sans-3-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-source-sans",
});

export const cormorantGaramond = localFont({
  src: [
    { path: "../fonts/cormorant-garamond/cormorant-garamond-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/cormorant-garamond/cormorant-garamond-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/cormorant-garamond/cormorant-garamond-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/cormorant-garamond/cormorant-garamond-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-cormorant",
});

export const playfairDisplay = localFont({
  src: [
    { path: "../fonts/playfair-display/playfair-display-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/playfair-display/playfair-display-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/playfair-display/playfair-display-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/playfair-display/playfair-display-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../fonts/playfair-display/playfair-display-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/playfair-display/playfair-display-latin-600-italic.woff2", weight: "600", style: "italic" },
    { path: "../fonts/playfair-display/playfair-display-latin-700-normal.woff2", weight: "700" },
    { path: "../fonts/playfair-display/playfair-display-latin-700-italic.woff2", weight: "700", style: "italic" },
  ],
  display: "swap",
  variable: "--font-playfair-display",
});

export const raleway = localFont({
  src: [
    { path: "../fonts/raleway/raleway-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/raleway/raleway-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/raleway/raleway-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/raleway/raleway-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-raleway",
});

export const lato = localFont({
  src: [
    { path: "../fonts/lato/lato-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/lato/lato-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/lato/lato-latin-700-normal.woff2", weight: "700" },
    { path: "../fonts/lato/lato-latin-700-italic.woff2", weight: "700", style: "italic" },
  ],
  display: "swap",
  variable: "--font-lato",
});

export const openSans = localFont({
  src: [
    { path: "../fonts/open-sans/open-sans-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/open-sans/open-sans-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/open-sans/open-sans-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/open-sans/open-sans-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-open-sans",
});

export const dmSerifDisplay = localFont({
  src: [
    { path: "../fonts/dm-serif-display/dm-serif-display-latin-400-normal.woff2", weight: "400" },
  ],
  display: "swap",
  variable: "--font-dm-serif-display",
});

export const montserrat = localFont({
  src: [
    { path: "../fonts/montserrat/montserrat-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/montserrat/montserrat-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/montserrat/montserrat-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/montserrat/montserrat-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-montserrat",
});

export const quicksand = localFont({
  src: [
    { path: "../fonts/quicksand/quicksand-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/quicksand/quicksand-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/quicksand/quicksand-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/quicksand/quicksand-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-quicksand",
});

export const fraunces = localFont({
  src: [
    { path: "../fonts/fraunces/fraunces-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/fraunces/fraunces-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/fraunces/fraunces-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/fraunces/fraunces-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-fraunces",
});

export const libreBaskerville = localFont({
  src: [
    { path: "../fonts/libre-baskerville/libre-baskerville-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/libre-baskerville/libre-baskerville-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-libre-baskerville",
});

export const instrumentSerif = localFont({
  src: [
    { path: "../fonts/instrument-serif/instrument-serif-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/instrument-serif/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  display: "swap",
  variable: "--font-instrument-serif",
});

export const workSans = localFont({
  src: [
    { path: "../fonts/work-sans/work-sans-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/work-sans/work-sans-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/work-sans/work-sans-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/work-sans/work-sans-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-work-sans",
});

export const dmSans = localFont({
  src: [
    { path: "../fonts/dm-sans/dm-sans-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/dm-sans/dm-sans-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/dm-sans/dm-sans-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/dm-sans/dm-sans-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-dm-sans",
});

export const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-fragment-mono",
});

export const deliciousHandrawn = Delicious_Handrawn({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-delicious",
});

export const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-great-vibes",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-poppins",
});
