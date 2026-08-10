import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { nunito } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-quicksand",
});

export const metadata: Metadata = pageMetadata({
  title: "Zoe Learning House Website Demo",
  description:
    "A concept admissions landing page for Zoe Learning House — a holistic Christian K–5 microschool in Greater New Orleans with flexible 1–5 day options.",
  path: "/demo/zoe-learning-house",
  noIndex: true,
});

export default function ZoeLearningHouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${quicksand.variable} ${nunito.variable} [&_.font-heading]:font-[family-name:var(--font-quicksand)] [&_.font-secondary]:font-[family-name:var(--font-nunito)]`}
    >
      {children}
    </div>
  );
}
