import localFont from "next/font/local";

export const geist = localFont({
  src: [
    { path: "../../fonts/geist/geist-latin-400-normal.woff2", weight: "400" },
    { path: "../../fonts/geist/geist-latin-500-normal.woff2", weight: "500" },
    { path: "../../fonts/geist/geist-latin-600-normal.woff2", weight: "600" },
    { path: "../../fonts/geist/geist-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-geist",
});

export const fragmentMono = localFont({
  src: [{ path: "../../fonts/fragment-mono/fragment-mono-latin-400-normal.woff2", weight: "400" }],
  display: "swap",
  variable: "--font-fragment-mono",
});

export const deliciousHandrawn = localFont({
  src: [
    {
      path: "../../fonts/delicious-handrawn/delicious-handrawn-latin-400-normal.woff2",
      weight: "400",
    },
  ],
  display: "swap",
  variable: "--font-delicious",
});

export const poppins = localFont({
  src: [
    { path: "../../fonts/poppins/poppins-latin-300-normal.woff2", weight: "300" },
    { path: "../../fonts/poppins/poppins-latin-400-normal.woff2", weight: "400" },
    { path: "../../fonts/poppins/poppins-latin-500-normal.woff2", weight: "500" },
    { path: "../../fonts/poppins/poppins-latin-600-normal.woff2", weight: "600" },
  ],
  display: "swap",
  variable: "--font-poppins",
});

export const manrope = localFont({
  src: [
    { path: "../../fonts/manrope/manrope-latin-400-normal.woff2", weight: "400" },
    { path: "../../fonts/manrope/manrope-latin-500-normal.woff2", weight: "500" },
    { path: "../../fonts/manrope/manrope-latin-600-normal.woff2", weight: "600" },
    { path: "../../fonts/manrope/manrope-latin-700-normal.woff2", weight: "700" },
    { path: "../../fonts/manrope/manrope-latin-800-normal.woff2", weight: "800" },
  ],
  display: "swap",
  variable: "--font-manrope",
});

export const inter = localFont({
  src: [
    { path: "../../fonts/inter/inter-latin-400-normal.woff2", weight: "400" },
    { path: "../../fonts/inter/inter-latin-500-normal.woff2", weight: "500" },
    { path: "../../fonts/inter/inter-latin-600-normal.woff2", weight: "600" },
    { path: "../../fonts/inter/inter-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-inter",
});
