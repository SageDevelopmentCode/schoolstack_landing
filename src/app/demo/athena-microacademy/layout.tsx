import type { Metadata } from "next";
import { Instrument_Serif, Work_Sans } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "Athena Micro-academy of Austin — Website Demo",
  description:
    "A concept admissions landing page for Athena Micro-academy of Austin — a relationship-centered microschool for grades 6–12 in South Austin.",
};

export default function AthenaMicroacademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${instrumentSerif.variable} ${workSans.variable} [&_.font-heading]:font-[family-name:var(--font-instrument-serif)] [&_.font-secondary]:font-[family-name:var(--font-work-sans)]`}
    >
      {children}
    </div>
  );
}
