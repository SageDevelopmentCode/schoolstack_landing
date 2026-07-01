import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cormorant",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-source-sans",
});

export const metadata: Metadata = pageMetadata({
  title: "Rooted Meadows Rollout Timeline",
  description:
    "A phased rollout plan for Rooted Meadows Waldorf School — admin, admissions, tuition, committees, teacher portal, and parent experience on MudKitchen.",
  path: "/timeline/rooted-meadows-school",
  noIndex: true,
});

export default function RootedMeadowsTimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${cormorant.variable} ${sourceSans.variable} min-h-screen bg-[#FAF8F4] font-[family-name:var(--font-source-sans)] text-[#2b2a26] [&_.font-heading]:font-[family-name:var(--font-cormorant)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
