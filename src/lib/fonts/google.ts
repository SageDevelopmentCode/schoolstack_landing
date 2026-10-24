// Google fonts — import only from Server Components / layouts (or narrow client imports of a single font).
import {
  Geist,
  Great_Vibes,
  Fragment_Mono,
  Delicious_Handrawn,
  Inter,
  Manrope,
  Poppins,
} from "next/font/google";

export const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
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

export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-manrope",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});
