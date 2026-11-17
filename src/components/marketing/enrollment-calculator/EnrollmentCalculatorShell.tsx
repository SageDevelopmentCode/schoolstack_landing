import type { ReactNode } from "react";
import MarketingGardenToolShell from "@/components/marketing/shared/MarketingGardenToolShell";

export default function EnrollmentCalculatorShell({ children }: { children: ReactNode }) {
  return (
    <MarketingGardenToolShell>
      <style>{`
        @media print {
          header.fixed,
          footer,
          .calculator-print-hide {
            display: none !important;
          }
          .calculator-hero {
            background: #F7F1E7 !important;
            color: #2B241D !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      {children}
    </MarketingGardenToolShell>
  );
}
