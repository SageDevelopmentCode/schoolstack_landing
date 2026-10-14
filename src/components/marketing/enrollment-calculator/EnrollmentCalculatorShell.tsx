import type { ReactNode } from "react";
import { dmSans, fraunces } from "@/lib/fonts";
import { MUDKITCHEN_MARKETING_STORY_THEME } from "@/lib/marketing/mudkitchen-story-theme";
import { parentThemeCssVars } from "@/lib/organization-settings/parent-theme";

const theme = MUDKITCHEN_MARKETING_STORY_THEME;

export default function EnrollmentCalculatorShell({ children }: { children: ReactNode }) {
  return (
    <main
      className={`${fraunces.variable} ${dmSans.variable} min-h-screen px-4 pb-24 pt-[100px] font-secondary sm:px-6 lg:px-8 print:bg-white print:px-6 print:pb-8 print:pt-6 [&_.font-heading]:font-[family-name:var(--font-fraunces)]`}
      style={{
        ...parentThemeCssVars(theme),
        backgroundColor: theme.paper,
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        color: theme.ink,
      }}
    >
      <style>{`
        @media print {
          header.fixed,
          footer,
          .calculator-print-hide {
            display: none !important;
          }
          .calculator-hero {
            background: #EAF2EB !important;
            color: #2B241D !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .calculator-hero,
          .calculator-hero * {
            color: #2B241D !important;
          }
        }
      `}</style>
      <div className="mx-auto max-w-[1220px]">{children}</div>
    </main>
  );
}
