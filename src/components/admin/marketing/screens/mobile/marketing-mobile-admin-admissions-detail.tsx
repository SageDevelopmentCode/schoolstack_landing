import { ChevronLeft } from "lucide-react";
import { ADMISSIONS_DETAIL } from "@/components/admin/marketing/screens/mobile/marketing-mobile-demo-data";
import {
  MobileAdminShell,
  MobileCard,
  MobileKicker,
  MobileSectionTitle,
  MobileStoryChip,
} from "@/components/admin/marketing/screens/mobile/mobile-screen-chrome";
import {
  MARKETING_MOBILE_SECTION_GAP,
  MARKETING_MOBILE_THEME,
} from "@/components/admin/marketing/screens/mobile/marketing-mobile-theme";

const T = MARKETING_MOBILE_THEME;
const D = ADMISSIONS_DETAIL;

export function MarketingMobileAdminAdmissionsDetailScreen() {
  return (
    <MobileAdminShell activeTab="admissions">
      <div style={{ display: "flex", flexDirection: "column", gap: MARKETING_MOBILE_SECTION_GAP }}>
        <div style={{ margin: "0 -16px", padding: "0 16px 12px", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ paddingTop: 2, paddingBottom: 6 }}>
            <ChevronLeft size={18} color={T.primary} strokeWidth={2.2} aria-hidden />
          </div>
          <MobileKicker>Application review</MobileKicker>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 8, marginTop: 4 }}>
            <MobileSectionTitle size={19}>{D.studentName}</MobileSectionTitle>
            <MobileStoryChip label={D.statusLabel} tone={D.statusTone} />
          </div>
        </div>

        <MobileCard compact>
          <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Guardian
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 600, lineHeight: 1.35 }}>{D.guardianLine}</p>
          <p style={{ margin: "8px 0 0", fontSize: 9, color: T.muted, lineHeight: 1.35 }}>
            {D.programLabel} · {D.formTitle}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 9, color: T.muted }}>Submitted {D.submittedAt}</p>
        </MobileCard>

        <MobileCard compact>
          <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Next step
          </p>
          <div style={{ marginTop: 8 }}>
            <MobileStoryChip label={D.nextStepLabel} tone={D.nextStepTone} />
          </div>
        </MobileCard>
      </div>
    </MobileAdminShell>
  );
}
