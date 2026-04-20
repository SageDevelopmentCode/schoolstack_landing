import type { Metadata } from "next";
import { Geist, Lora, Fragment_Mono, Delicious_Handrawn } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-lora",
});

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-fragment-mono",
});

const deliciousHandrawn = Delicious_Handrawn({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-delicious",
});

export const metadata: Metadata = {
  title: "SchoolLayer — The complete operating system for microschools",
  description:
    "SchoolLayer was built inside a real microschool to replace the 7 tools founders are stitching together. One system for enrollment, billing, parent communication, and daily operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${lora.variable} ${fragmentMono.variable} ${deliciousHandrawn.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
