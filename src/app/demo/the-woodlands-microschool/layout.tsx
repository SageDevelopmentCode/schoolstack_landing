import type { Metadata } from "next";
import { Libre_Baskerville, Nunito_Sans } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-libre-baskerville",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-nunito-sans",
});

export const metadata: Metadata = pageMetadata({
  title: "The Woodlands Microschool Website Demo",
  description:
    "A concept admissions landing page for The Woodlands Microschool — an accredited private microschool in Conroe, Texas with a distinctive four-hour day.",
  path: "/demo/the-woodlands-microschool",
  noIndex: true,
});

export default function TheWoodlandsMicroschoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${libreBaskerville.variable} ${nunitoSans.variable} [&_.font-heading]:font-[family-name:var(--font-libre-baskerville)] [&_.font-secondary]:font-[family-name:var(--font-nunito-sans)]`}
    >
      {children}
    </div>
  );
}
