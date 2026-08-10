import type { Metadata } from "next";
import { Lora } from "next/font/google";
import { sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-lora",
});

export const metadata: Metadata = pageMetadata({
  title: "The Lab Learning Space Website Demo",
  description:
    "A concept admissions landing page for The Lab Learning Space — a nonprofit mastery-based enrichment center for K–8 students in Long Beach, CA.",
  path: "/demo/lab-learning",
  noIndex: true,
});

export default function LabLearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${lora.variable} ${sourceSans3.variable} [&_.font-heading]:font-[family-name:var(--font-lora)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
