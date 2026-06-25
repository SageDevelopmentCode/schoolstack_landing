import type { Metadata } from "next";
import { Cormorant_Garamond, Raleway } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cormorant",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-raleway",
});

export const metadata: Metadata = pageMetadata({
  title: "Nature's Schoolhouse Microschool Website Demo",
  description:
    "A concept admissions landing page for Nature's Schoolhouse Microschool — a nature-forward, flexible learning community in Cedar Park, Texas.",
  path: "/demo/natures-schoolhouse",
  noIndex: true,
});

export default function NaturesSchoolhouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${cormorant.variable} ${raleway.variable} [&_.font-heading]:font-[family-name:var(--font-cormorant)] [&_.font-secondary]:font-[family-name:var(--font-raleway)]`}
    >
      {children}
    </div>
  );
}
