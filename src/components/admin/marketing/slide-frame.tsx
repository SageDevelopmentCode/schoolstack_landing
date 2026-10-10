"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import { Link2 } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1350;

export const SLIDE = {
  paper: "#F7F1E7",
  ink: "#2B241D",
  muted: "#6D6257",
  white: "#FFFAF4",
  forest: "#2E4A3C",
  forestDeep: "#233B2F",
  line: "#E4D8C8",
  clay: "#A05C45",
} as const;

type SlideCanvasProps = {
  children: ReactNode;
  background?: string;
  logo?: "corner" | "none";
  logoTop?: number;
};

export default function SlideCanvas({
  children,
  background = SLIDE.paper,
  logo = "corner",
  logoTop = 28,
}: SlideCanvasProps) {
  return (
    <article
      style={{
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        background,
        color: SLIDE.ink,
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-body), Geist, sans-serif",
      }}
    >
      {children}
      {logo === "corner" ? <CornerLogo top={logoTop} /> : null}
    </article>
  );
}

function CornerLogoPill() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px 10px 12px",
        borderRadius: 999,
        background: "rgba(247, 241, 231, 0.94)",
        border: `1px solid ${SLIDE.line}`,
      }}
    >
      <img src="/images/Logo.png" alt="" style={{ height: 44, width: "auto", display: "block" }} />
      <span
        style={{
          fontFamily: "var(--font-display), Lora, Georgia, serif",
          fontSize: 26,
          fontWeight: 650,
          letterSpacing: "-0.03em",
          color: SLIDE.ink,
        }}
      >
        MudKitchen
      </span>
    </div>
  );
}

function CornerLogo({ top = 28 }: { top?: number }) {
  return (
    <div style={{ position: "absolute", top, right: 28, zIndex: 5 }}>
      <CornerLogoPill />
    </div>
  );
}

export function PromoSlideTopRow({ siteLabel }: { siteLabel: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 28,
        right: 28,
        zIndex: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "rgba(247, 241, 231, 0.82)",
          minWidth: 0,
        }}
      >
        <Link2 size={28} strokeWidth={2.25} aria-hidden />
        <p style={{ margin: 0, fontSize: 30, fontWeight: 500 }}>{siteLabel}</p>
      </div>
      <CornerLogoPill />
    </div>
  );
}

export function displayStyle(size: number, color: string = SLIDE.ink): CSSProperties {
  return {
    margin: 0,
    fontFamily: "var(--font-display), Lora, Georgia, serif",
    fontSize: size,
    fontWeight: 650,
    lineHeight: 0.96,
    letterSpacing: "-0.035em",
    color,
  };
}
