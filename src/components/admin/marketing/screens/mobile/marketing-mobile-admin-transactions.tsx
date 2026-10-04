import { MobileAdminScreenShell, MobileCard, MobileKicker, MobileTitle } from "@/components/admin/marketing/screens/mobile/mobile-screen-chrome";
import { SCREEN } from "@/components/admin/marketing/screens/story-chrome";

const ROWS = [
  { title: "May tuition — Emma Mitchell", amount: "$1,250", status: "Completed", type: "Tuition" },
  { title: "Enrollment deposit", amount: "$500", status: "Completed", type: "Enrollment" },
  { title: "Application fee", amount: "$75", status: "Pending", type: "Application" },
];

export function MarketingMobileAdminTransactionsScreen() {
  return (
    <MobileAdminScreenShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <MobileKicker>Finances workspace</MobileKicker>
          <MobileTitle size={30}>Transactions</MobileTitle>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: SCREEN.muted, lineHeight: 1.35 }}>
            24 payments recorded across application, enrollment, and tuition fees.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <MobileCard>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: SCREEN.muted }}>Collected YTD</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 750 }}>$38,400</p>
          </MobileCard>
          <MobileCard>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: SCREEN.muted }}>Pending</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 750 }}>2 · $1,325</p>
          </MobileCard>
        </div>
        {ROWS.map((row) => (
          <MobileCard key={row.title}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.25, flex: 1 }}>{row.title}</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 750, flexShrink: 0 }}>{row.amount}</p>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: row.status === "Completed" ? SCREEN.successBg : SCREEN.sunBg,
                  color: row.status === "Completed" ? SCREEN.success : SCREEN.sun,
                }}
              >
                {row.status}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: SCREEN.soft,
                  color: SCREEN.primary,
                }}
              >
                {row.type}
              </span>
            </div>
          </MobileCard>
        ))}
      </div>
    </MobileAdminScreenShell>
  );
}
