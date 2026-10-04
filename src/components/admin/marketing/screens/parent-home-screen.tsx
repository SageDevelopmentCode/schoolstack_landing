import {
  ParentProductNav,
  PRODUCT,
  ProductCard,
  ProductHeading,
  ProductKicker,
  ProductRoot,
} from "@/components/admin/marketing/screens/product-chrome";

const ACTIONS = [
  { label: "Tuition & Billing", detail: "$1,250 due May 15" },
  { label: "Enrollment", detail: "Emma is 7 of 8 steps" },
  { label: "Calendar", detail: "This week’s school days" },
  { label: "Messages", detail: "Notes from teachers" },
];

/** Marketing copy of the parent portal home. */
export default function ParentHomeScreen() {
  return (
    <ProductRoot>
      <ParentProductNav active="Home" />
      <div style={{ padding: "28px 28px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <ProductKicker>Mitchell family</ProductKicker>
          <ProductHeading size={48}>Welcome back, Sarah.</ProductHeading>
          <p style={{ margin: "10px 0 0", fontSize: 22, color: PRODUCT.muted }}>
            Here’s what your family needs today.
          </p>
        </div>

        <ProductCard>
          <ProductKicker>Start here</ProductKicker>
          <p style={{ margin: "8px 0 0", fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 28, letterSpacing: "-0.03em" }}>
            Emma’s enrollment is almost done
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 20, color: PRODUCT.muted }}>7 of 8 required steps complete. Liam is enrolled.</p>
        </ProductCard>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {ACTIONS.map((action) => (
            <ProductCard key={action.label} style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{action.label}</div>
              <div style={{ marginTop: 6, fontSize: 18, color: PRODUCT.muted }}>{action.detail}</div>
            </ProductCard>
          ))}
        </div>
      </div>
    </ProductRoot>
  );
}
