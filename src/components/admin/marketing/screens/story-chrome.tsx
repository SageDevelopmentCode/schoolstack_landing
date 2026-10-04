import type { CSSProperties, ReactNode } from "react";
import { dmSans, fraunces } from "@/lib/fonts";

export const SCREEN = {
  paper: "#F6F3EC",
  white: "#FFFAF4",
  ink: "#2B241D",
  muted: "#6D6257",
  line: "#E4D8C8",
  primary: "#2E4A3C",
  primaryDark: "#233B2F",
  soft: "#E7EFE4",
  sage: "#729077",
  success: "#4A7C59",
  successBg: "#EDF4EA",
  sunBg: "#FFF6DE",
  sun: "#8A6412",
} as const;

export function ScreenRoot({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable}`}
      style={{
        height: "100%",
        background: SCREEN.paper,
        color: SCREEN.ink,
        fontFamily: "var(--font-dm-sans), sans-serif",
        padding: "22px 26px 28px",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

export function StoryKicker({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.13em",
        textTransform: "uppercase",
        color: light ? "rgba(255,255,255,0.78)" : SCREEN.sage,
      }}
    >
      {children}
    </p>
  );
}

export function StoryHeading({
  children,
  light = false,
  size = 34,
}: {
  children: ReactNode;
  light?: boolean;
  size?: number;
}) {
  return (
    <h2
      style={{
        margin: "4px 0 0",
        fontFamily: "var(--font-fraunces), Georgia, serif",
        fontSize: size,
        fontWeight: 560,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
        color: light ? "#fff" : SCREEN.ink,
      }}
    >
      {children}
    </h2>
  );
}

export function PillNav({
  items,
  active,
}: {
  items: string[];
  active: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        borderRadius: 12,
        background: SCREEN.soft,
        maxWidth: "100%",
      }}
    >
      {items.map((item) => {
        const isActive = item === active;
        return (
          <span
            key={item}
            style={{
              padding: "7px 12px",
              borderRadius: 9,
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: "nowrap",
              background: isActive ? SCREEN.white : "transparent",
              color: isActive ? SCREEN.primary : "#728079",
              boxShadow: isActive ? "0 1px 4px #dbe2dc" : undefined,
            }}
          >
            {item}
          </span>
        );
      })}
    </div>
  );
}

export function StoryCard({
  children,
  style,
  tone = "white",
}: {
  children: ReactNode;
  style?: CSSProperties;
  tone?: "white" | "forest";
}) {
  const forest = tone === "forest";
  return (
    <div
      style={{
        background: forest ? SCREEN.primary : SCREEN.white,
        color: forest ? "#fff" : SCREEN.ink,
        border: forest ? "none" : `1px solid ${SCREEN.line}`,
        borderRadius: 18,
        padding: 18,
        boxShadow: forest ? "none" : "0 3px 10px rgba(43, 36, 29, 0.05)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
