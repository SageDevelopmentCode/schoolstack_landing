import type { Metadata } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-lora",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-source-sans-3",
});

export const metadata: Metadata = pageMetadata({
  title: "Paradise Earth Academy Website Demo",
  description:
    "A concept admissions landing page for Paradise Earth Academy — a private K-8 school in Gilbert, Arizona with holistic academics, nature days, and flexible enrollment.",
  path: "/demo/paradise-earth-academy",
  noIndex: true,
});

export default function ParadiseEarthAcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${lora.variable} ${sourceSans3.variable} [&_.font-heading]:font-[family-name:var(--font-lora)] [&_.font-secondary]:font-[family-name:var(--font-source-sans-3)]`}
    >
      {children}
    </div>
  );
}
