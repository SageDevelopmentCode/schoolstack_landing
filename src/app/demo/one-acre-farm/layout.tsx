import type { Metadata } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-lora",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-source-sans",
});

export const metadata: Metadata = pageMetadata({
  title: "One Acre Farm Website Demo",
  description:
    "A concept admissions landing page for One Acre Farm Educational Foundation — a nonprofit educational farm with Farm School learning pods in Porter, TX.",
  path: "/demo/one-acre-farm",
  noIndex: true,
});

export default function OneAcreFarmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${lora.variable} ${sourceSans.variable} [&_.font-heading]:font-[family-name:var(--font-lora)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
