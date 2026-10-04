import type { CSSProperties, ReactNode } from "react";
import { dmSans, fraunces } from "@/lib/fonts";

/** Homepage demo palette. Solid hex so carousel PNG export stays reliable. */
export const PRODUCT = {
  paper: "#F8F8F3",
  ink: "#283943",
  muted: "#65777F",
  line: "#E4E8E1",
  white: "#FFFFFF",
  accent: "#769a61",
  accentDark: "#5f824f",
  pill: "#E9F2EA",
  pillLine: "#BCD4C1",
  success: "#34825A",
  successBg: "#EBF8EF",
  warning: "#986F14",
  warningBg: "#FFF4D9",
} as const;

export function ProductRoot({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable}`}
      style={{
        height: "100%",
        background: PRODUCT.paper,
        color: PRODUCT.ink,
        fontFamily: "var(--font-dm-sans), sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}

const PARENT_NAV = ["Home", "Enrollment", "My Children", "Tuition & Billing", "Calendar", "More"];

export function ParentProductNav({ active }: { active: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "18px 28px",
        background: PRODUCT.white,
        borderBottom: `1px solid ${PRODUCT.line}`,
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          background: PRODUCT.pill,
          color: PRODUCT.accentDark,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
        >
        L
      </span>
      <div style={{ display: "flex", gap: 6, flex: 1, minWidth: 0 }}>
        {PARENT_NAV.map((label) => {
          const on = label === active;
          return (
            <span
              key={label}
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 650,
                color: on ? PRODUCT.accentDark : PRODUCT.muted,
                background: on ? PRODUCT.pill : "transparent",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: PRODUCT.accent,
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        SM
      </span>
    </div>
  );
}

export function ProductKicker({ children }: { children: string }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 14,
        fontWeight: 800,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: PRODUCT.accent,
      }}
    >
      {children}
    </p>
  );
}

export function ProductHeading({ children, size = 40 }: { children: ReactNode; size?: number }) {
  return (
    <h2
      style={{
        margin: "6px 0 0",
        fontFamily: "var(--font-fraunces), Georgia, serif",
        fontSize: size,
        fontWeight: 560,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
        color: PRODUCT.ink,
      }}
    >
      {children}
    </h2>
  );
}

export function ProductCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: PRODUCT.white,
        borderRadius: 22,
        border: `1px solid ${PRODUCT.line}`,
        padding: 22,
        boxShadow: "0 3px 10px rgba(50, 72, 61, 0.035)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
