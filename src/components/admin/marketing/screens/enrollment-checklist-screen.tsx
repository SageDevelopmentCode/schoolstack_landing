import { Check, Clock } from "lucide-react";
import { SCREEN, ScreenRoot, StoryCard, StoryHeading, StoryKicker } from "@/components/admin/marketing/screens/story-chrome";

const CHILDREN = [
  { name: "Emma", status: "In progress", active: true },
  { name: "Jake", status: "Under review", active: false },
  { name: "Liam", status: "Enrolled", active: false },
];

const STEPS = [
  { label: "Program description & key policies", done: true },
  { label: "Community agreement", done: true },
  { label: "Emergency contact & health form", done: true },
  { label: "Proof of immunizations", done: true },
  { label: "Pay registration fee", done: false },
];

/** Marketing copy of the parent enrollment checklist. Emma 7/8, Jake under review, Liam enrolled. */
export default function EnrollmentChecklistScreen() {
  return (
    <ScreenRoot>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <StoryKicker>Enrollment</StoryKicker>
          <StoryHeading>Enrollment checklist</StoryHeading>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: SCREEN.muted }}>
            Welcome back, Sarah — here&apos;s your enrollment progress.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {CHILDREN.map((child) => (
            <div
              key={child.name}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                background: child.active ? SCREEN.white : "transparent",
                border: `1px solid ${child.active ? SCREEN.primary : SCREEN.line}`,
                minWidth: 92,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 750, color: child.active ? SCREEN.primary : SCREEN.ink }}>
                {child.name}
              </div>
              <div style={{ fontSize: 11, color: SCREEN.muted, marginTop: 2 }}>{child.status}</div>
            </div>
          ))}
        </div>
      </div>

      <StoryCard style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 750 }}>Emma&apos;s enrollment checklist</p>
          <p style={{ margin: 0, fontSize: 12, color: SCREEN.muted }}>7/8 required steps</p>
        </div>
        <div style={{ marginTop: 10, height: 8, borderRadius: 999, background: SCREEN.soft, overflow: "hidden" }}>
          <div style={{ width: "87.5%", height: "100%", background: SCREEN.primary }} />
        </div>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {STEPS.map((step) => (
            <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: step.done ? SCREEN.successBg : SCREEN.sunBg,
                  color: step.done ? SCREEN.success : SCREEN.sun,
                  flexShrink: 0,
                }}
              >
                {step.done ? <Check size={14} /> : <Clock size={14} />}
              </span>
              <span style={{ fontSize: 14, fontWeight: 650 }}>{step.label}</span>
            </div>
          ))}
        </div>
      </StoryCard>
    </ScreenRoot>
  );
}
