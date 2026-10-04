import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { PillNav, SCREEN, ScreenRoot, StoryCard, StoryHeading, StoryKicker } from "@/components/admin/marketing/screens/story-chrome";

const TABS = ["Families", "Rate catalog", "Rules", "Payment history", "Forms"];

function TuitionChrome({
  subtitle,
  subtab,
  children,
}: {
  subtitle: string;
  subtab: string;
  children: ReactNode;
}) {
  return (
    <ScreenRoot>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
        <div>
          <StoryKicker>My school</StoryKicker>
          <StoryHeading>Tuition</StoryHeading>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: SCREEN.muted }}>{subtitle}</p>
        </div>
        <span
          style={{
            background: SCREEN.primary,
            color: "#fff",
            borderRadius: 12,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          New rate plan
        </span>
      </div>
      <div style={{ marginTop: 14 }}>
        <PillNav items={TABS} active="Rate catalog" />
      </div>
      <div style={{ marginTop: 12 }}>
        <PillNav items={["Tuition rates", "Payment options", "Fees"]} active={subtab} />
      </div>
      {children}
    </ScreenRoot>
  );
}

/** Marketing copy of My School → Tuition, rate catalog. $12,800 tuition and $250 enrollment fee. */
export function TuitionIncludedScreen() {
  return (
    <TuitionChrome
      subtitle="Rate plans, payment options, and fees for each program"
      subtab="Tuition rates"
    >
      <StoryCard style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <StoryKicker>Primary program</StoryKicker>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 750 }}>2026–27 School Year</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: SCREEN.muted }}>Standard tuition · included</p>
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 32,
              fontWeight: 560,
              letterSpacing: "-0.03em",
            }}
          >
            $12,800
            <span style={{ fontSize: 14, color: SCREEN.muted }}>/yr</span>
          </p>
        </div>
      </StoryCard>
      <StoryCard style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 750 }}>Enrollment fee</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: SCREEN.muted }}>
              Billed separately when a family enrolls
            </p>
          </div>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 750 }}>$250</p>
        </div>
      </StoryCard>
    </TuitionChrome>
  );
}

/** Marketing copy of My School → Tuition payment options, plus the Rivera sibling discount. */
export function TuitionPaymentOptionsScreen() {
  return (
    <TuitionChrome subtitle="Payment options and written discount rules" subtab="Payment options">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
        <OptionCard title="Pay in full" amount="$12,800" detail="1 payment · default" selected />
        <OptionCard title="10 monthly payments" amount="$1,280" detail="Due on the 1st" />
      </div>
      <StoryCard style={{ marginTop: 12 }}>
        <StoryKicker>Adjustments</StoryKicker>
        <p style={{ margin: "8px 0 0", fontSize: 15, fontWeight: 750 }}>Sibling discount · Rivera family</p>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: SCREEN.muted }}>10% off standard tuition</p>
        <p style={{ margin: "10px 0 0", fontSize: 13, color: SCREEN.muted }}>
          Financial aid and fee waivers are written case by case. They are not automatic.
        </p>
      </StoryCard>
    </TuitionChrome>
  );
}

function OptionCard({
  title,
  amount,
  detail,
  selected = false,
}: {
  title: string;
  amount: string;
  detail: string;
  selected?: boolean;
}) {
  return (
    <StoryCard
      style={{
        borderColor: selected ? SCREEN.primary : SCREEN.line,
        background: selected ? "#F3F7F2" : SCREEN.white,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 750 }}>{title}</p>
        {selected ? <Check size={16} color={SCREEN.primary} /> : null}
      </div>
      <p
        style={{
          margin: "10px 0 0",
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontSize: 28,
          fontWeight: 560,
          letterSpacing: "-0.03em",
        }}
      >
        {amount}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 12, color: SCREEN.muted }}>{detail}</p>
    </StoryCard>
  );
}
