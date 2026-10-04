import { AlertCircle, ChevronRight } from "lucide-react";
import {
  HOME_ATTENTION_ITEMS,
  HOME_EVENT,
  HOME_START_HERE_HEADLINE,
  MITCHELL_FAMILY,
} from "@/components/admin/marketing/screens/mobile/marketing-mobile-demo-data";
import {
  MobileCard,
  MobileKicker,
  MobileParentHomeShell,
  MobilePrimaryCard,
} from "@/components/admin/marketing/screens/mobile/mobile-screen-chrome";
import {
  MARKETING_MOBILE_SECTION_GAP,
  MARKETING_MOBILE_THEME,
} from "@/components/admin/marketing/screens/mobile/marketing-mobile-theme";

const T = MARKETING_MOBILE_THEME;

export function MarketingMobileParentHomeScreen() {
  return (
    <MobileParentHomeShell activeTab="home" headerGreeting={MITCHELL_FAMILY.greeting} homeSubTab="overview">
      <div style={{ display: "flex", flexDirection: "column", gap: MARKETING_MOBILE_SECTION_GAP }}>
        <MobileCard compact>
          <MobileKicker>Start here</MobileKicker>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 15,
              fontWeight: 560,
              lineHeight: 1.2,
            }}
          >
            {HOME_START_HERE_HEADLINE}
          </p>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
            {HOME_ATTENTION_ITEMS.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: index > 0 ? "8px 0 0" : 0,
                  borderTop: index > 0 ? `1px solid ${T.line}` : "none",
                  marginTop: index > 0 ? 8 : 0,
                }}
              >
                <div style={{ flexShrink: 0, color: item.urgent ? "#C45C2A" : T.primary }}>
                  <AlertCircle size={16} strokeWidth={2.2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, lineHeight: 1.25 }}>{item.title}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: T.muted }}>{item.detail}</p>
                </div>
                <ChevronRight size={14} color={T.muted} strokeWidth={2.2} />
              </div>
            ))}
          </div>
        </MobileCard>

        <MobilePrimaryCard compact>
          <MobileKicker light>Upcoming events</MobileKicker>
          <p style={{ margin: "6px 0 0", fontSize: 14, fontWeight: 650 }}>{HOME_EVENT.title}</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, opacity: 0.88 }}>{HOME_EVENT.date}</p>
          <p style={{ margin: "8px 0 0", fontSize: 11, fontWeight: 700, textDecoration: "underline", opacity: 0.95 }}>
            {HOME_EVENT.calendarLinkLabel}
          </p>
        </MobilePrimaryCard>
      </div>
    </MobileParentHomeShell>
  );
}
