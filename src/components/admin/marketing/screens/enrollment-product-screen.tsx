import {
  ParentProductNav,
  PRODUCT,
  ProductCard,
  ProductHeading,
  ProductKicker,
  ProductRoot,
} from "@/components/admin/marketing/screens/product-chrome";

const CHILDREN = [
  { name: "Emma", on: true },
  { name: "Jake", on: false },
  { name: "Liam", on: false },
];

const STEPS = [
  { label: "Program Description & Key Policies", state: "Complete" },
  { label: "Community Agreement", state: "Complete" },
  { label: "Emergency Contact & Health", state: "Complete" },
  { label: "Emergency Medication Plan", state: "Optional" },
  { label: "Proof of Immunizations", state: "Complete" },
  { label: "Pay Registration Fee", state: "Required" },
];

/** Marketing copy of the parent enrollment checklist. Emma is 7 of 8 required steps. */
export default function EnrollmentProductScreen() {
  return (
    <ProductRoot>
      <ParentProductNav active="Enrollment" />
      <div style={{ padding: "26px 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
          <div>
            <ProductKicker>Enrollment</ProductKicker>
            <ProductHeading>Enrollment checklist</ProductHeading>
            <p style={{ margin: "8px 0 0", fontSize: 20, color: PRODUCT.muted }}>
              Welcome back, Sarah — here’s your enrollment progress.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, background: PRODUCT.pill, borderRadius: 999, padding: 6 }}>
            {CHILDREN.map((child) => (
              <span
                key={child.name}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: child.on ? PRODUCT.white : "transparent",
                  color: child.on ? PRODUCT.ink : PRODUCT.muted,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {child.name}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <ProductCard>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Luff Learning enrollment checklist</div>
            <p style={{ margin: "6px 0 12px", fontSize: 18, color: PRODUCT.muted }}>7/8 required steps complete</p>
            <div style={{ height: 10, borderRadius: 999, background: "#E4E8E1", overflow: "hidden" }}>
              <div style={{ width: "87.5%", height: "100%", background: PRODUCT.accent }} />
            </div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {STEPS.map((step) => (
                <div
                  key={step.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: `1px solid ${step.state === "Complete" ? PRODUCT.pillLine : PRODUCT.line}`,
                    background: step.state === "Complete" ? "#F4F8F4" : PRODUCT.white,
                    fontSize: 18,
                  }}
                >
                  <span style={{ fontWeight: 650 }}>{step.label}</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: step.state === "Complete" ? PRODUCT.success : step.state === "Optional" ? PRODUCT.warning : PRODUCT.accentDark,
                    }}
                  >
                    {step.state}
                  </span>
                </div>
              ))}
            </div>
          </ProductCard>

          <ProductCard>
            <ProductKicker>Enrollment step</ProductKicker>
            <ProductHeading size={32}>Program Description & Key Policies</ProductHeading>
            <p style={{ margin: "14px 0 0", fontSize: 20, lineHeight: 1.4, color: PRODUCT.muted }}>
              Review the program overview, attendance expectations, and community guidelines for Luff Learning Fine Arts Academy.
            </p>
            <p style={{ margin: "18px 0 0", fontSize: 16, color: PRODUCT.muted }}>
              Preview mode — forms and signatures are read-only in this demo.
            </p>
          </ProductCard>
        </div>
      </div>
    </ProductRoot>
  );
}
