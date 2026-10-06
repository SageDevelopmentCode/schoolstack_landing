import { PillNav, SCREEN, ScreenRoot, StoryCard, StoryHeading, StoryKicker } from "@/components/admin/marketing/screens/story-chrome";

const EXPENSES = [
  { category: "Personnel", label: "Teacher salaries — March", amount: "$5,800", date: "Mar 31" },
  { category: "Facilities", label: "Monthly rent", amount: "$1,400", date: "Apr 1" },
  { category: "Supplies", label: "Art & craft materials", amount: "$487", date: "Mar 28" },
  { category: "Operations", label: "Liability insurance — Q2", amount: "$620", date: "Apr 1" },
  { category: "Software", label: "Software subscriptions", amount: "$89", date: "Apr 1" },
];

/** Marketing copy of a school admin expenses page. Line amounts match the demo expense list. */
export default function ExpensesScreen() {
  return (
    <ScreenRoot>
      <StoryKicker>Finances</StoryKicker>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
        <div>
          <StoryHeading>Expenses</StoryHeading>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: SCREEN.muted }}>
            Staffing, space, supplies, insurance, and software
          </p>
        </div>
        <PillNav items={["All", "Personnel", "Facilities", "Supplies", "Software"]} active="All" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <Metric label="Year to date" value="$8,396" />
        <Metric label="This month" value="$2,109" />
      </div>

      <StoryCard style={{ marginTop: 14, padding: 0 }}>
        {EXPENSES.map((row, index) => (
          <div key={row.label}>
            {index > 0 ? <div style={{ height: 1, background: SCREEN.line }} /> : null}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px" }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{row.label}</span>
                <span style={{ display: "block", fontSize: 12, color: SCREEN.muted }}>
                  {row.category} · {row.date}
                </span>
              </span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{row.amount}</span>
            </div>
          </div>
        ))}
      </StoryCard>
    </ScreenRoot>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <StoryCard style={{ padding: "14px 16px" }}>
      <StoryKicker>{label}</StoryKicker>
      <p
        style={{
          margin: "6px 0 0",
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontSize: 32,
          fontWeight: 560,
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </p>
    </StoryCard>
  );
}
