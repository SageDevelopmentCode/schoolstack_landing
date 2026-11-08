import type { ReactNode } from "react";
import MarketingBrightToolShell from "@/components/marketing/shared/MarketingBrightToolShell";

export default function EnrollmentCalculatorShell({ children }: { children: ReactNode }) {
  return (
    <MarketingBrightToolShell>
      <style>{`
        @media print {
          header.fixed,
          footer,
          .calculator-print-hide {
            display: none !important;
          }
          .calculator-hero {
            background: #f4f1ec !important;
            color: #1d1a16 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      {children}
    </MarketingBrightToolShell>
  );
}
