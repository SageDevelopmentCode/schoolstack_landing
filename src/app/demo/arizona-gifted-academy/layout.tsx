import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair-display",
});

export const metadata: Metadata = pageMetadata({
  title: "Arizona Gifted Academy Website Demo",
  description:
    "A concept admissions landing page for Arizona Gifted Academy — a boutique gifted microschool in Scottsdale, Arizona for PK–5 learners.",
  path: "/demo/arizona-gifted-academy",
  noIndex: true,
});

export default function ArizonaGiftedAcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${playfair.variable} ${sourceSans3.variable} [&_.font-heading]:font-[family-name:var(--font-playfair-display)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
