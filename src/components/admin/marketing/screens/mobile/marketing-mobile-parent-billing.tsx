import {
  BILLING_BY_STUDENT,
  BILLING_PAYMENT_HISTORY,
  BILLING_PAYMENT_SETTINGS,
  BILLING_PILL_NAV,
  BILLING_UPCOMING_CHARGES,
  TUITION_DEMO,
} from "@/components/admin/marketing/screens/mobile/marketing-mobile-demo-data";
import {
  MobileCard,
  MobileExpandableSection,
  MobileKicker,
  MobileParentBillingShell,
  MobilePillNav,
  MobilePrimaryCard,
  MobileSectionTitle,
  MobileStoryChip,
} from "@/components/admin/marketing/screens/mobile/mobile-screen-chrome";
import {
  MARKETING_MOBILE_SECTION_GAP,
  MARKETING_MOBILE_THEME,
} from "@/components/admin/marketing/screens/mobile/marketing-mobile-theme";

const T = MARKETING_MOBILE_THEME;

export function MarketingMobileParentBillingScreen() {
  return (
    <MobileParentBillingShell activeTab="billing">
      <div style={{ display: "flex", flexDirection: "column", gap: MARKETING_MOBILE_SECTION_GAP }}>
        <div>
          <MobileSectionTitle size={20}>Emma&apos;s tuition</MobileSectionTitle>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: T.muted, lineHeight: 1.35 }}>{TUITION_DEMO.subtitle}</p>
          <MobilePillNav items={BILLING_PILL_NAV} activeKey="emma" />
        </div>

        <MobileCard compact>
          <MobileKicker>Balance due</MobileKicker>
          <p
            style={{
              margin: "4px 0 0",
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 28,
              fontWeight: 560,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {TUITION_DEMO.nextPaymentAmount}
          </p>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: "3px 7px",
                borderRadius: 999,
                background: T.sunBg,
                color: T.sun,
              }}
            >
              Due {TUITION_DEMO.dueLabel}
            </span>
          </div>
          <div
            style={{
              marginTop: 8,
              background: T.primary,
              color: "#FFFFFF",
              borderRadius: 12,
              padding: "9px 14px",
              textAlign: "center",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {TUITION_DEMO.payButtonLabel}
          </div>
        </MobileCard>

        <MobilePrimaryCard compact>
          <MobileKicker light>Payment settings</MobileKicker>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 16, fontWeight: 560 }}>
            {BILLING_PAYMENT_SETTINGS.autopayHeading}
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 10,
              lineHeight: 1.35,
              opacity: 0.9,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {BILLING_PAYMENT_SETTINGS.autopayBody}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              marginTop: 8,
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            <span style={{ opacity: 0.85 }}>{BILLING_PAYMENT_SETTINGS.paymentMethodLabel}</span>
            <span style={{ fontWeight: 700 }}>{BILLING_PAYMENT_SETTINGS.paymentMethodAction}</span>
          </div>
          <div
            style={{
              marginTop: 8,
              background: "#FFFFFF",
              color: T.primaryDark,
              borderRadius: 10,
              padding: "8px 12px",
              textAlign: "center",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {BILLING_PAYMENT_SETTINGS.autopayButtonLabel}
          </div>
        </MobilePrimaryCard>

        <MobileExpandableSection title="By student">
          {BILLING_BY_STUDENT.map((row) => (
            <MobileCard key={row.name} compact>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700 }}>{row.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: T.muted }}>{row.detail}</p>
                </div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: row.due ? T.ink : T.muted }}>{row.amount}</p>
              </div>
            </MobileCard>
          ))}
        </MobileExpandableSection>

        <MobileExpandableSection title="Upcoming charges" showAllLabel="Show all charges">
          {BILLING_UPCOMING_CHARGES.map((charge) => (
            <MobileCard key={charge.id} compact>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700 }}>{charge.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: T.muted }}>{charge.student} · {charge.due}</p>
                </div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{charge.amount}</p>
              </div>
            </MobileCard>
          ))}
        </MobileExpandableSection>

        <MobileExpandableSection title="All family payments">
          {BILLING_PAYMENT_HISTORY.slice(0, 1).map((payment) => (
            <MobileCard key={payment.id} compact>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700 }}>{payment.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: T.muted }}>{payment.date}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{payment.amount}</p>
                  <div style={{ marginTop: 4 }}>
                    <MobileStoryChip label={payment.status} tone="success" />
                  </div>
                </div>
              </div>
            </MobileCard>
          ))}
        </MobileExpandableSection>
      </div>
    </MobileParentBillingShell>
  );
}
