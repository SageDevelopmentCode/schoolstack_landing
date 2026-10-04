import { MobileCard, MobileKicker, MobileScreenShell, MobileTitle } from "@/components/admin/marketing/screens/mobile/mobile-screen-chrome";
import { SCREEN } from "@/components/admin/marketing/screens/story-chrome";

export function MarketingMobileParentHomeScreen() {
  return (
    <MobileScreenShell activeTab="Home">
      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
        <div>
          <MobileTitle size={28}>Good morning, Sarah. ☀️</MobileTitle>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: SCREEN.muted, lineHeight: 1.35 }}>
            Here is what your family needs for Sunday, October 4, 2026.
          </p>
        </div>
        <MobileCard>
          <MobileKicker>Start here</MobileKicker>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 17, fontWeight: 560 }}>
            You&apos;re all caught up
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: SCREEN.muted }}>No urgent tasks right now.</p>
        </MobileCard>
        <MobileCard tone="forest">
          <MobileKicker>Upcoming events</MobileKicker>
          <p style={{ margin: "8px 0 0", fontSize: 15, fontWeight: 650 }}>Spring art showcase</p>
          <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.88 }}>Saturday, Apr 25</p>
        </MobileCard>
        <div>
          <MobileKicker>Your children</MobileKicker>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {["Emma", "Liam"].map((name) => (
              <div key={name} style={{ flex: 1 }}>
                <MobileCard>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{name}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: SCREEN.muted }}>Enrolled</p>
                </MobileCard>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileScreenShell>
  );
}
