import type { ReactNode } from "react";
import { Bell, CircleHelp, LayoutGrid, Users } from "lucide-react";
import { dmSans, fraunces } from "@/lib/fonts";
import {
  MARKETING_MOBILE_TAB_BAR_INSET,
  MarketingParentTabBar,
  type MarketingParentTabId,
  MarketingSchoolAdminTabBar,
  type MarketingSchoolAdminTabId,
} from "@/components/admin/marketing/screens/mobile/marketing-mobile-floating-tab-bar";
import {
  MARKETING_MOBILE_CONTENT_ZOOM,
  MARKETING_MOBILE_DATE_LABEL,
  MARKETING_MOBILE_THEME,
} from "@/components/admin/marketing/screens/mobile/marketing-mobile-theme";

const T = MARKETING_MOBILE_THEME;

function shellClassName() {
  return `${fraunces.variable} ${dmSans.variable}`;
}

function MobileParentPortalHeader({
  greeting,
  dateLabel = MARKETING_MOBILE_DATE_LABEL,
}: {
  greeting: string;
  dateLabel?: string;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        margin: "0 -16px",
        padding: "10px 16px 14px",
        background: `linear-gradient(180deg, ${T.primaryDark} 0%, ${T.primary} 100%)`,
        color: "#FFFFFF",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 21,
              fontWeight: 560,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            {greeting}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.88, lineHeight: 1.3 }}>{dateLabel}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, paddingTop: 2 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden
          >
            <CircleHelp size={16} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden
          >
            <Bell size={15} color="#FFFFFF" strokeWidth={2.2} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileScrollViewport({ children, paddingTop = 8 }: { children: ReactNode; paddingTop?: number }) {
  const zoom = MARKETING_MOBILE_CONTENT_ZOOM;
  const bottomInset = MARKETING_MOBILE_TAB_BAR_INSET / zoom;

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          padding: `${paddingTop}px 16px ${bottomInset}px`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            width: `${100 / zoom}%`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export type MobileHomeSubTabId = "overview" | "family";

export function MobileHomeSubTabBar({ activeTab }: { activeTab: MobileHomeSubTabId }) {
  const tabs: { id: MobileHomeSubTabId; label: string; icon: typeof LayoutGrid }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "family", label: "Family", icon: Users },
  ];
  return (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        gap: 4,
        margin: "0 -16px",
        padding: "0 16px 8px",
        borderBottom: `1px solid ${T.line}`,
        background: T.paper,
      }}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <div
            key={tab.id}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "8px 4px",
              borderBottom: active ? `2px solid ${T.primary}` : "2px solid transparent",
              color: active ? T.primary : T.muted,
              marginBottom: -1,
            }}
          >
            <Icon size={14} strokeWidth={active ? 2.4 : 2} />
            <span style={{ fontSize: 12, fontWeight: active ? 700 : 600 }}>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function MobileParentHomeShell({
  children,
  activeTab,
  headerGreeting,
  homeSubTab = "overview",
}: {
  children: ReactNode;
  activeTab: MarketingParentTabId;
  headerGreeting: string;
  homeSubTab?: MobileHomeSubTabId;
}) {
  return (
    <div
      className={shellClassName()}
      style={{
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: T.paper,
        color: T.ink,
        fontFamily: "var(--font-dm-sans), sans-serif",
      }}
    >
      <MobileParentPortalHeader greeting={headerGreeting} />
      <MobileHomeSubTabBar activeTab={homeSubTab} />
      <MobileScrollViewport>{children}</MobileScrollViewport>
      <MarketingParentTabBar activeTab={activeTab} />
    </div>
  );
}

export function MobileParentBillingShell({
  children,
  activeTab,
}: {
  children: ReactNode;
  activeTab: MarketingParentTabId;
}) {
  return (
    <div
      className={shellClassName()}
      style={{
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: T.paper,
        color: T.ink,
        fontFamily: "var(--font-dm-sans), sans-serif",
      }}
    >
      <MobileScrollViewport>{children}</MobileScrollViewport>
      <MarketingParentTabBar activeTab={activeTab} />
    </div>
  );
}

export function MobileAdminShell({
  children,
  activeTab,
}: {
  children: ReactNode;
  activeTab: MarketingSchoolAdminTabId;
}) {
  return (
    <div
      className={shellClassName()}
      style={{
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: T.paper,
        color: T.ink,
        fontFamily: "var(--font-dm-sans), sans-serif",
      }}
    >
      <MobileScrollViewport paddingTop={6}>{children}</MobileScrollViewport>
      <MarketingSchoolAdminTabBar activeTab={activeTab} />
    </div>
  );
}

export function MobileKicker({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: light ? "rgba(255,255,255,0.78)" : T.sage,
      }}
    >
      {children}
    </p>
  );
}

export function MobilePrimaryCard({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <div
      style={{
        background: T.primary,
        color: "#FFFFFF",
        borderRadius: 16,
        padding: compact ? 10 : 12,
      }}
    >
      {children}
    </div>
  );
}

export function MobileExpandableSection({
  title,
  children,
  showAllLabel,
}: {
  title: string;
  children: ReactNode;
  showAllLabel?: string;
}) {
  return (
    <div>
      <MobileSectionTitle size={19}>{title}</MobileSectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>{children}</div>
      {showAllLabel ? (
        <p style={{ margin: "6px 0 0", fontSize: 11, fontWeight: 700, color: T.primary }}>{showAllLabel}</p>
      ) : null}
    </div>
  );
}

export function MobileSectionTitle({ children, size = 21 }: { children: ReactNode; size?: number }) {
  return (
    <h2
      style={{
        margin: 0,
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

export function MobileTitle({ children, size = 26 }: { children: ReactNode; size?: number }) {
  return <MobileSectionTitle size={size}>{children}</MobileSectionTitle>;
}

export function MobileCard({ children, tone = "white", compact = false }: { children: ReactNode; tone?: "white" | "forest"; compact?: boolean }) {
  const forest = tone === "forest";
  return (
    <div
      style={{
        background: forest ? T.primary : T.white,
        color: forest ? "#FFFFFF" : T.ink,
        border: forest ? "none" : `1px solid ${T.line}`,
        borderRadius: 16,
        padding: compact ? 10 : 12,
        boxShadow: forest ? "none" : "0 2px 8px rgba(43, 36, 29, 0.06)",
      }}
    >
      {children}
    </div>
  );
}

export function MobilePillNav({
  items,
  activeKey,
}: {
  items: readonly { key: string; label: string }[];
  activeKey: string;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <span
            key={item.key}
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "6px 10px",
              borderRadius: 999,
              background: active ? T.soft : T.white,
              color: active ? T.primary : T.muted,
              border: `1px solid ${active ? "transparent" : T.line}`,
            }}
          >
            {item.label}
          </span>
        );
      })}
    </div>
  );
}

export function MobileFilterPills({ labels, activeIndex = 0, compact = false }: { labels: readonly string[]; activeIndex?: number; compact?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 6, overflow: "hidden", flexWrap: "nowrap" }}>
      {labels.map((label, index) => {
        const active = index === activeIndex;
        return (
          <span
            key={label}
            style={{
              flexShrink: 0,
              fontSize: 10,
              fontWeight: 700,
              padding: compact ? "4px 8px" : "5px 10px",
              borderRadius: 999,
              background: active ? T.primary : T.white,
              color: active ? "#FFFFFF" : T.muted,
              border: `1px solid ${active ? T.primary : T.line}`,
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

export function MobileStoryChip({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "pending" | "info";
}) {
  const styles =
    tone === "success"
      ? { background: T.successBg, color: T.success }
      : tone === "pending"
        ? { background: T.sunBg, color: T.sun }
        : { background: T.soft, color: T.primary };
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 7px",
        borderRadius: 999,
        ...styles,
      }}
    >
      {label}
    </span>
  );
}
