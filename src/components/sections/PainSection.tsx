"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FadeInView } from "@/components/ui/FadeInView";

// SVG coordinate space: 1000 × 680, center at (500, 340)
const W = 1000;
const H = 680;

// Center card bounds in SVG space — contains inner ring (rx=140, ry=105)
const CARD = { l: 310, t: 200, w: 380, h: 280 };

// Approximate outer pill half-dimensions in SVG units (used to offset line start to pill edge)
const OUTER_PILL_RX = 38;
const OUTER_PILL_RY = 11;

// Returns the point on the outer pill's elliptical edge facing toward `to`
function pillEdge(
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return from;
  const nx = dx / len;
  const ny = dy / len;
  const scale =
    1 / Math.sqrt((nx / OUTER_PILL_RX) ** 2 + (ny / OUTER_PILL_RY) ** 2);
  return { x: from.x + nx * scale, y: from.y + ny * scale };
}

// 10 pairs — outer = third-party tool, inner = SchoolLayer feature at same angle
// Outer ring: rx=390, ry=240 | Inner ring: rx=140, ry=105
const PAIRS = [
  {
    tool: "Google Forms",
    logo: "/images/competitors/GoogleForms.png",
    feature: "Enrollment",
    outer: { x: 500, y: 100 },
    inner: { x: 500, y: 235 },
    delay: 0,
  },
  {
    tool: "Venmo",
    logo: "/images/competitors/Venmo.png",
    feature: "Payments",
    outer: { x: 740, y: 168 },
    inner: { x: 582, y: 255 },
    delay: 0.2,
  },
  {
    tool: "PayPal",
    logo: "/images/competitors/Paypal.svg",
    feature: "Billing",
    outer: { x: 876, y: 253 },
    inner: { x: 633, y: 308 },
    delay: 0.4,
  },
  {
    tool: "Gmail",
    logo: "/images/competitors/Gmail.png",
    feature: "Messaging",
    outer: { x: 876, y: 427 },
    inner: { x: 633, y: 372 },
    delay: 0.6,
  },
  {
    tool: "DocuSign",
    logo: "/images/competitors/DocuSign.png",
    feature: "Contracts",
    outer: { x: 740, y: 512 },
    inner: { x: 582, y: 425 },
    delay: 0.8,
  },
  {
    tool: "Calendly",
    logo: "/images/competitors/Calendly.webp",
    feature: "Calendar",
    outer: { x: 500, y: 580 },
    inner: { x: 500, y: 445 },
    delay: 1.0,
  },
  {
    tool: "Google Drive",
    logo: "/images/competitors/GoogleDrive.png",
    feature: "Files",
    outer: { x: 260, y: 512 },
    inner: { x: 418, y: 425 },
    delay: 0.8,
  },
  {
    tool: "Google Docs",
    logo: "/images/competitors/GoogleDocs.png",
    feature: "Staff",
    outer: { x: 124, y: 427 },
    inner: { x: 367, y: 372 },
    delay: 0.6,
  },
  {
    tool: "Google Sheets",
    logo: "/images/competitors/GoogleSheets.png",
    feature: "Reports",
    outer: { x: 124, y: 253 },
    inner: { x: 367, y: 308 },
    delay: 0.4,
  },
  {
    tool: "Wix",
    logo: "/images/competitors/Wix.png",
    feature: "Website",
    outer: { x: 260, y: 168 },
    inner: { x: 418, y: 255 },
    delay: 0.2,
  },
];

export default function PainSection() {
  return (
    <section className="bg-bg-alt py-24 overflow-hidden">
      {/* Heading */}
      <div className="max-w-[680px] mx-auto px-6 text-center">
        <FadeInView>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-text">
            Too big for spreadsheets.
            <br />
            Too small for enterprise.
          </h2>
        </FadeInView>

        <FadeInView delay={0.1}>
          <p className="text-[17px] text-text-muted leading-relaxed mt-6 max-w-[58ch] mx-auto">
            That&apos;s where founders end up stitching together Google Forms,
            Venmo, Stripe, Gmail, PDFs, and notes just to keep the school
            moving. You built something special. The infrastructure should not
            be the part that holds it back.
          </p>
        </FadeInView>
      </div>

      {/* Hub visual — wider than the text */}
      <FadeInView delay={0.15}>
        <div className="mt-14 w-full max-w-[1200px] mx-auto px-4 md:px-8 select-none">
          <div
            className="relative w-full"
            style={{ paddingBottom: `${(H / W) * 100}%` }}
          >
            {/* SVG — connector lines only */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              {PAIRS.map((p) => {
                const edge = pillEdge(p.outer, p.inner);
                return (
                  <g key={p.tool}>
                    {/* Faint static line — starts at pill edge */}
                    <line
                      x1={edge.x}
                      y1={edge.y}
                      x2={p.inner.x}
                      y2={p.inner.y}
                      stroke="#244b46"
                      strokeOpacity={0.1}
                      strokeWidth={1}
                    />
                    {/* Flowing animated dots: tool → feature */}
                    <motion.line
                      x1={edge.x}
                      y1={edge.y}
                      x2={p.inner.x}
                      y2={p.inner.y}
                      stroke="#244b46"
                      strokeOpacity={0.45}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeDasharray="4 20"
                      animate={{ strokeDashoffset: [0, -24] }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay,
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Outer tool pills */}
            {PAIRS.map((p) => (
              <div
                key={p.tool}
                className="absolute z-10"
                style={{
                  left: `${(p.outer.x / W) * 100}%`,
                  top: `${(p.outer.y / H) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <motion.span
                  className="flex items-center gap-1 md:gap-1.5 rounded-pill bg-surface border border-border text-[9px] md:text-[11px] text-text-faint px-2 md:px-3 py-0.5 md:py-1.5 whitespace-nowrap shadow-xs"
                  animate={{ opacity: [0.55, 0.95, 0.55] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: p.delay,
                  }}
                >
                  <Image
                    src={p.logo}
                    alt={p.tool}
                    width={14}
                    height={14}
                    className="shrink-0 object-contain"
                  />
                  {p.tool}
                </motion.span>
              </div>
            ))}

            {/* Center card: SchoolLayer + surrounding feature labels */}
            <div
              className="absolute z-20"
              style={{
                left: `${(CARD.l / W) * 100}%`,
                top: `${(CARD.t / H) * 100}%`,
                width: `${(CARD.w / W) * 100}%`,
                height: `${(CARD.h / H) * 100}%`,
              }}
            >
              {/* Card — transparent, layout only */}
              <div
                className="relative w-full h-full"
                style={{ overflow: "visible" }}
              >
                {/* "SchoolLayer" — absolute center of card */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center gap-1">
                    <Image
                      src="/images/SchoolLayerLogo.png"
                      alt="SchoolLayer"
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                    <span className="font-display text-[clamp(9px,1.2vw,15px)] text-text-muted whitespace-nowrap tracking-tight">
                      SchoolLayer
                    </span>
                  </div>
                </div>

                {/* Feature labels arranged around "SchoolLayer" inside the card */}
                {PAIRS.map((p) => {
                  const relX = ((p.inner.x - CARD.l) / CARD.w) * 100;
                  const relY = ((p.inner.y - CARD.t) / CARD.h) * 100;
                  return (
                    <div
                      key={p.feature}
                      className="absolute"
                      style={{
                        left: `${relX}%`,
                        top: `${relY}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <motion.span
                        className="block rounded-pill bg-text text-[8px] md:text-[10px] lg:text-[11px] text-white font-medium px-1.5 md:px-2.5 lg:px-3 py-0.5 md:py-1 whitespace-nowrap shadow-sm"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{
                          duration: 2.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: p.delay + 0.7,
                        }}
                      >
                        {p.feature}
                      </motion.span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </FadeInView>
    </section>
  );
}
