import type { ReactNode } from "react";
import { dmSans, fraunces } from "@/lib/fonts";
import { SCREEN } from "@/components/admin/marketing/screens/story-chrome";

const TABS = ["Home", "Enrollment", "Children", "Billing", "More"] as const;

export function MobileScreenShell({
  children,
  activeTab,
}: {
  children: ReactNode;
  activeTab: (typeof TABS)[number];
}) {
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable}`}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: SCREEN.paper,
        color: SCREEN.ink,
        fontFamily: "var(--font-dm-sans), sans-serif",
      }}
    >
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "0 16px 12px" }}>{children}</div>
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          borderTop: `1px solid ${SCREEN.line}`,
          background: SCREEN.white,
          padding: "6px 4px 4px",
        }}
      >
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <div
              key={tab}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 9,
                fontWeight: active ? 700 : 600,
                color: active ? SCREEN.primary : SCREEN.muted,
                padding: "4px 2px",
              }}
            >
              {tab}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MobileAdminScreenShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable}`}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: SCREEN.paper,
        color: SCREEN.ink,
        fontFamily: "var(--font-dm-sans), sans-serif",
        padding: "8px 16px 16px",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

export function MobileKicker({ children }: { children: string }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: SCREEN.sage,
      }}
    >
      {children}
    </p>
  );
}

export function MobileTitle({ children, size = 26 }: { children: ReactNode; size?: number }) {
  return (
    <h2
      style={{
        margin: "4px 0 0",
        fontFamily: "var(--font-fraunces), Georgia, serif",
        fontSize: size,
        fontWeight: 560,
        letterSpacing: "-0.03em",
        lineHeight: 1.08,
      }}
    >
      {children}
    </h2>
  );
}

export function MobileCard({ children, tone = "white" }: { children: ReactNode; tone?: "white" | "forest" }) {
  const forest = tone === "forest";
  return (
    <div
      style={{
        background: forest ? SCREEN.primary : SCREEN.white,
        color: forest ? "#FFFFFF" : SCREEN.ink,
        border: forest ? "none" : `1px solid ${SCREEN.line}`,
        borderRadius: 16,
        padding: 14,
        boxShadow: forest ? "none" : "0 2px 8px rgba(43, 36, 29, 0.06)",
      }}
    >
      {children}
    </div>
  );
}
