/* eslint-disable @next/next/no-img-element -- Marketing screen copies use plain img for PNG export. */
import {
  Bell,
  Calendar,
  ChevronRight,
  DollarSign,
  Heart,
  House,
  MessageSquare,
  Users,
} from "lucide-react";
import {
  PillNav,
  SCREEN,
  ScreenRoot,
  StoryCard,
  StoryHeading,
  StoryKicker,
} from "@/components/admin/marketing/screens/story-chrome";

const NAV = [
  { label: "Home", icon: House },
  { label: "Billing / tuition", icon: DollarSign, active: true },
  { label: "Messages", icon: MessageSquare },
  { label: "Calendar / events", icon: Calendar },
  { label: "My children", icon: Users },
  { label: "Committees", icon: Heart },
];

/**
 * Marketing copy of the parent Billing / tuition page.
 * Numbers match demo parent billing fixtures ($1,250 due May 15, $4,500 remaining).
 */
export default function ParentBillingScreen() {
  return (
    <div style={{ height: "100%", background: SCREEN.paper, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 18px",
          background: SCREEN.white,
          borderBottom: `1px solid ${SCREEN.line}`,
          fontFamily: "var(--font-dm-sans), sans-serif",
        }}
      >
        <img src="/images/Logo.webp" alt="" style={{ height: 22, width: "auto" }} />
        <div style={{ display: "flex", gap: 6, flex: 1, minWidth: 0 }}>
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <span
                key={item.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 8px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 650,
                  color: item.active ? SCREEN.primary : SCREEN.muted,
                  background: item.active ? SCREEN.soft : "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={12} strokeWidth={2.2} />
                {item.label}
              </span>
            );
          })}
        </div>
        <Bell size={15} color={SCREEN.muted} />
        <span style={{ fontSize: 12, fontWeight: 700, color: SCREEN.ink }}>Sarah</span>
      </div>

      <ScreenRoot>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
          <div>
            <StoryKicker>Tuition & payments</StoryKicker>
            <StoryHeading>Family tuition</StoryHeading>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: SCREEN.muted }}>
              2 payments remaining · $4,500 left this school year
            </p>
          </div>
          <PillNav items={["Family view", "Emma", "Liam", "Forms"]} active="Family view" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 14, marginTop: 18 }}>
          <StoryCard>
            <StoryKicker>Next payment</StoryKicker>
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontSize: 52,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                fontWeight: 560,
              }}
            >
              $1,250
            </p>
            <p style={{ margin: "8px 0 14px", fontSize: 13, color: SCREEN.muted }}>
              Due May 15, 2026 · Family total due
            </p>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: SCREEN.primary,
                color: "#fff",
                borderRadius: 12,
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Pay now
            </span>
          </StoryCard>

          <StoryCard tone="forest">
            <StoryKicker light>Payment settings</StoryKicker>
            <StoryHeading light size={26}>
              Autopay is off
            </StoryHeading>
            <p style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.45, color: "#D6E6D9" }}>
              Turn on automatic payments and we&apos;ll process each scheduled tuition payment on its due date.
            </p>
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: "1px solid rgba(255,255,255,0.18)",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#D4E4D7",
              }}
            >
              <span>Payment method</span>
              <span style={{ fontWeight: 700, color: "#fff" }}>Add a card →</span>
            </div>
            <div
              style={{
                marginTop: 14,
                background: "#fff",
                color: SCREEN.primary,
                textAlign: "center",
                borderRadius: 12,
                padding: "10px 12px",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Turn on autopay
            </div>
          </StoryCard>
        </div>

        <p
          style={{
            margin: "20px 0 10px",
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 22,
            fontWeight: 560,
          }}
        >
          By student
        </p>
        <StoryCard style={{ padding: 0 }}>
          <StudentRow name="Emma" detail="$1,250 due · 10-month plan" />
          <div style={{ height: 1, background: SCREEN.line }} />
          <StudentRow name="Liam" detail="Paid up · 10-month plan" />
        </StoryCard>
      </ScreenRoot>
    </div>
  );
}

function StudentRow({ name, detail }: { name: string; detail: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          background: SCREEN.soft,
          color: SCREEN.primary,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {name.slice(0, 1)}
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{name}</span>
        <span style={{ display: "block", fontSize: 12, color: SCREEN.muted }}>{detail}</span>
      </span>
      <ChevronRight size={16} color={SCREEN.muted} />
    </div>
  );
}
