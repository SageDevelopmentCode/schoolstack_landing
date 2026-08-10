import type { Metadata } from "next";
import { instrumentSerif, workSans } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Athena Micro-academy Website Demo",
  description:
    "A concept admissions landing page for Athena Micro-academy of Austin — a relationship-centered microschool for grades 6–12 in South Austin.",
  path: "/demo/athena-microacademy",
  noIndex: true,
});

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
