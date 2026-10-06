import {
  ParentProductNav,
  PRODUCT,
  ProductCard,
  ProductHeading,
  ProductKicker,
  ProductRoot,
} from "@/components/admin/marketing/screens/product-chrome";

/** Marketing copy of parent Tuition & Billing. Numbers match the demo billing fixtures. */
export default function BillingProductScreen() {
  return (
    <ProductRoot>
      <ParentProductNav active="Tuition & Billing" />
      <div style={{ padding: "26px 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <ProductKicker>Tuition & payments</ProductKicker>
          <ProductHeading>Family tuition</ProductHeading>
          <p style={{ margin: "8px 0 0", fontSize: 20, color: PRODUCT.muted }}>
            2 payments remaining · $4,500 left this school year
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 16 }}>
          <ProductCard>
            <ProductKicker>Next payment</ProductKicker>
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontSize: 72,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
              }}
            >
              $1,250
            </p>
            <p style={{ margin: "10px 0 18px", fontSize: 20, color: PRODUCT.muted }}>Due May 15, 2026 · Family total due</p>
            <span
              style={{
                display: "inline-block",
                background: PRODUCT.accent,
                color: "#fff",
                borderRadius: 12,
                padding: "12px 18px",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              Pay now
            </span>
          </ProductCard>

          <ProductCard style={{ background: PRODUCT.accentDark, color: "#F8F8F3", border: "none" }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#D7E4D4" }}>
              Payment settings
            </p>
            <p style={{ margin: "10px 0 0", fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 32, letterSpacing: "-0.03em" }}>
              Autopay is off
            </p>
            <p style={{ margin: "10px 0 0", fontSize: 18, lineHeight: 1.4, color: "#D7E4D4" }}>
              Turn on automatic payments and each scheduled tuition payment is collected on its due date.
            </p>
            <div
              style={{
                marginTop: 18,
                background: "#fff",
                color: PRODUCT.accentDark,
                textAlign: "center",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              Turn on autopay
            </div>
          </ProductCard>
        </div>

        <ProductHeading size={28}>By student</ProductHeading>
        <ProductCard style={{ padding: 0 }}>
          <StudentRow name="Emma" detail="$1,250 due · 10-month plan" />
          <div style={{ height: 1, background: PRODUCT.line }} />
          <StudentRow name="Liam" detail="Paid up · 10-month plan" />
        </ProductCard>
      </div>
    </ProductRoot>
  );
}

function StudentRow({ name, detail }: { name: string; detail: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          background: PRODUCT.pill,
          color: PRODUCT.accentDark,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {name.slice(0, 1)}
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: 20, fontWeight: 700 }}>{name}</span>
        <span style={{ display: "block", fontSize: 16, color: PRODUCT.muted }}>{detail}</span>
      </span>
    </div>
  );
}
