import {
  TRANSACTION_ROWS,
  TRANSACTION_STATUS_FILTERS,
  TRANSACTION_TYPE_FILTERS,
  TRANSACTIONS_META,
  TRANSACTIONS_METRICS,
} from "@/components/admin/marketing/screens/mobile/marketing-mobile-demo-data";
import {
  MobileAdminShell,
  MobileCard,
  MobileFilterPills,
  MobileKicker,
  MobileSectionTitle,
  MobileStoryChip,
} from "@/components/admin/marketing/screens/mobile/mobile-screen-chrome";
import {
  MARKETING_MOBILE_SECTION_GAP,
  MARKETING_MOBILE_THEME,
} from "@/components/admin/marketing/screens/mobile/marketing-mobile-theme";

const T = MARKETING_MOBILE_THEME;

export function MarketingMobileAdminTransactionsScreen() {
  return (
    <MobileAdminShell activeTab="more">
      <div style={{ display: "flex", flexDirection: "column", gap: MARKETING_MOBILE_SECTION_GAP }}>
        <div>
          <MobileKicker>Finances workspace</MobileKicker>
          <MobileSectionTitle size={20}>Transactions</MobileSectionTitle>
          <p style={{ margin: "4px 0 0", fontSize: 10, color: T.muted, lineHeight: 1.35 }}>{TRANSACTIONS_META.subtitle}</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
          }}
        >
          {TRANSACTIONS_METRICS.map((metric) => (
            <MobileCard key={metric.label} compact>
              <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                <div style={{ width: 3, borderRadius: 999, background: metric.accent, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 750, lineHeight: 1.1 }}>{metric.value}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 9, fontWeight: 600, color: T.muted, lineHeight: 1.2 }}>{metric.label}</p>
                </div>
              </div>
            </MobileCard>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <MobileFilterPills labels={TRANSACTION_STATUS_FILTERS} activeIndex={0} compact />
          <MobileFilterPills labels={TRANSACTION_TYPE_FILTERS} activeIndex={0} compact />
        </div>

        {TRANSACTION_ROWS.slice(0, 3).map((row) => (
          <MobileCard key={row.title} compact>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 6, alignItems: "flex-start" }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, lineHeight: 1.25, flex: 1 }}>{row.title}</p>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 750, flexShrink: 0 }}>{row.amount}</p>
            </div>
            <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
              <MobileStoryChip label={row.status} tone={row.statusTone} />
              <MobileStoryChip label={row.type} tone="info" />
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 9, color: T.muted, lineHeight: 1.3 }}>{row.meta}</p>
          </MobileCard>
        ))}
      </div>
    </MobileAdminShell>
  );
}
