import type { Metadata } from "next";
import { Raleway, Source_Sans_3 } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-raleway",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-source-sans",
});

export const metadata: Metadata = pageMetadata({
  title: "Homework Hub Website Demo",
  description:
    "A concept admissions landing page for Homework Hub — an award-winning academic learning center serving Pre-K through college and beyond in Melville, NY.",
  path: "/demo/homework-hub",
  noIndex: true,
});

export default function HomeworkHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${raleway.variable} ${sourceSans.variable} [&_.font-heading]:font-[family-name:var(--font-raleway)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
