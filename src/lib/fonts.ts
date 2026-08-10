import localFont from "next/font/local";
import {
  Geist,
  Great_Vibes,
  Lora,
  Fragment_Mono,
  Delicious_Handrawn,
  Poppins,
} from "next/font/google";

export const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-lora",
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
    {
      path: "../fonts/nunito-sans/nunito-sans-latin-400-normal.woff2",
      weight: "400",
    },
    {
      path: "../fonts/nunito-sans/nunito-sans-latin-500-normal.woff2",
      weight: "500",
    },
    {
      path: "../fonts/nunito-sans/nunito-sans-latin-600-normal.woff2",
      weight: "600",
    },
    {
      path: "../fonts/nunito-sans/nunito-sans-latin-700-normal.woff2",
      weight: "700",
    },
  ],
  display: "swap",
  variable: "--font-nunito-sans",
});
