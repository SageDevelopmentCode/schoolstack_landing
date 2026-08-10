import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cormorant",
});

export const metadata: Metadata = pageMetadata({
  title: "Spring River School Website Demo",
  description:
    "A concept admissions landing page for Spring River School — a Waldorf-inspired homeschool community in Atlantic Beach, Florida serving K–12 through nature-based outdoor learning.",
  path: "/demo/spring-river-school",
  noIndex: true,
});

export default function SpringRiverSchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${cormorant.variable} ${sourceSans3.variable} [&_.font-heading]:font-[family-name:var(--font-cormorant)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
