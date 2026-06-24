import type { Metadata } from "next";
import { Montserrat, Nunito } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-montserrat",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = pageMetadata({
  title: "Monarch Hills Education Website Demo",
  description:
    "A concept admissions landing page for Monarch Hills Education — outdoor enrichment and alternative education for grades TK–6 in San Luis Obispo, California.",
  path: "/demo/monarch-hills",
  noIndex: true,
});

export default function MonarchHillsEducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${montserrat.variable} ${nunito.variable} [&_.font-heading]:font-[family-name:var(--font-montserrat)] [&_.font-secondary]:font-[family-name:var(--font-nunito)]`}
    >
      {children}
    </div>
  );
}
