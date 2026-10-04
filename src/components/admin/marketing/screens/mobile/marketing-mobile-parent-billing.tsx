import { MobileCard, MobileKicker, MobileScreenShell, MobileTitle } from "@/components/admin/marketing/screens/mobile/mobile-screen-chrome";
import { SCREEN } from "@/components/admin/marketing/screens/story-chrome";

export function MarketingMobileParentBillingScreen() {
  return (
    <MobileScreenShell activeTab="Billing">
      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
        <div>
          <MobileKicker>Tuition & payments</MobileKicker>
          <MobileTitle size={28}>Emma&apos;s tuition</MobileTitle>
        </div>
        <MobileCard>
          <MobileKicker>Next payment</MobileKicker>
          <p
            style={{
              margin: "8px 0 0",
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 36,
              fontWeight: 560,
              letterSpacing: "-0.03em",
            }}
          >
            $1,250
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: SCREEN.muted }}>Due May 15 · Remaining $4,500</p>
          <div
            style={{
              marginTop: 14,
              background: SCREEN.primary,
              color: "#FFFFFF",
              borderRadius: 12,
              padding: "12px 16px",
              textAlign: "center",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            Pay $1,250
          </div>
        </MobileCard>
        <MobileCard>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>May tuition</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: SCREEN.muted }}>Emma Mitchell</p>
            </div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>$1,250</p>
          </div>
        </MobileCard>
      </div>
    </MobileScreenShell>
  );
}
