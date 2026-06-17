import type { Metadata } from "next";
import { Open_Sans, Poppins } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-open-sans",
});

export const metadata: Metadata = pageMetadata({
  title: "Ascend Micro School Website Demo",
  description:
    "A concept admissions landing page for Ascend Micro School — a faith-based K–8 hybrid microschool in Northern Colorado Springs.",
  path: "/demo/ascend-micro-school",
  noIndex: true,
});

export default function AscendMicroSchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${poppins.variable} ${openSans.variable} [&_.font-heading]:font-[family-name:var(--font-poppins)] [&_.font-secondary]:font-[family-name:var(--font-open-sans)]`}
    >
      {children}
    </div>
  );
}
