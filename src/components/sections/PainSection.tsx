"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  UserPlus,
  CreditCard,
  Receipt,
  MessageSquare,
  FilePen,
  CalendarDays,
  FolderOpen,
  Users,
  BarChart2,
  Globe,
} from "lucide-react";
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
    icon: UserPlus,
    outer: { x: 500, y: 100 },
    inner: { x: 500, y: 235 },
    delay: 0,
  },
  {
    tool: "Venmo",
    logo: "/images/competitors/Venmo.png",
    feature: "Payments",
    icon: CreditCard,
    outer: { x: 740, y: 168 },
    inner: { x: 582, y: 255 },
    delay: 0.2,
  },
  {
    tool: "PayPal",
    logo: "/images/competitors/Paypal.svg",
    feature: "Billing",
    icon: Receipt,
    outer: { x: 876, y: 253 },
    inner: { x: 633, y: 308 },
    delay: 0.4,
  },
  {
    tool: "Gmail",
    logo: "/images/competitors/Gmail.png",
    feature: "Messaging",
    icon: MessageSquare,
    outer: { x: 876, y: 427 },
    inner: { x: 633, y: 372 },
    delay: 0.6,
  },
  {
    tool: "DocuSign",
    logo: "/images/competitors/DocuSign.png",
    feature: "Contracts",
    icon: FilePen,
    outer: { x: 740, y: 512 },
    inner: { x: 582, y: 425 },
    delay: 0.8,
  },
  {
    tool: "Calendly",
    logo: "/images/competitors/Calendly.webp",
    feature: "Calendar",
    icon: CalendarDays,
    outer: { x: 500, y: 580 },
    inner: { x: 500, y: 445 },
    delay: 1.0,
  },
  {
    tool: "Google Drive",
    logo: "/images/competitors/GoogleDrive.png",
    feature: "Files",
    icon: FolderOpen,
    outer: { x: 260, y: 512 },
    inner: { x: 418, y: 425 },
    delay: 0.8,
  },
  {
    tool: "Google Docs",
    logo: "/images/competitors/GoogleDocs.png",
    feature: "Staff",
    icon: Users,
    outer: { x: 124, y: 427 },
    inner: { x: 367, y: 372 },
    delay: 0.6,
  },
  {
    tool: "Google Sheets",
    logo: "/images/competitors/GoogleSheets.png",
    feature: "Reports",
    icon: BarChart2,
    outer: { x: 124, y: 253 },
    inner: { x: 367, y: 308 },
    delay: 0.4,
  },
  {
    tool: "Wix",
    logo: "/images/competitors/Wix.png",
    feature: "Website",
    icon: Globe,
    outer: { x: 260, y: 168 },
    inner: { x: 418, y: 255 },
    delay: 0.2,
  },
];

export default function PainSection() {
  return (
    <section className="bg-accent py-16 overflow-hidden">
      {/* Heading */}
      <div className="max-w-[680px] mx-auto px-6 text-center">
        <FadeInView>
          <p className="text-[13px] font-medium uppercase tracking-widest text-accent-soft mb-3">
            Too many tools
          </p>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-white">
            When your school runs in five different places,{" "}
            <em style={{ color: 'var(--color-clay)', fontStyle: 'italic' }}>everything feels harder.</em>
          </h2>
        </FadeInView>

        <FadeInView delay={0.1}>
          <p className="text-[17px] text-accent-highlight leading-relaxed mt-4 max-w-[58ch] mx-auto opacity-80">
            Enrollment lives in a form builder. Parent updates happen in texts
            and email. Student details sit in spreadsheets. Important tasks
            depend on memory. Mud Kitchen pulls those moving pieces into one
            shared system, so your team always knows where things live and what
            needs attention next.
          </p>
        </FadeInView>
      </div>

      {/* CTA */}
      <FadeInView delay={0.15}>
        <div className="mt-6 flex justify-center">
          <a
            href="/get-started"
            className="inline-flex items-center gap-2 bg-clay text-white text-sm font-medium font-secondary rounded-pill px-7 h-11 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
          >
            Book a Demo
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </FadeInView>

      {/* Hub visual — wider than the text */}
      <FadeInView delay={0.2}>
        <div className="mt-10 w-full max-w-[1200px] mx-auto px-4 md:px-8 select-none">
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
                      stroke="#A6B89A"
                      strokeOpacity={0.2}
                      strokeWidth={1}
                    />
                    {/* Flowing animated dots: tool → feature */}
                    <motion.line
                      x1={edge.x}
                      y1={edge.y}
                      x2={p.inner.x}
                      y2={p.inner.y}
                      stroke="#C5D5B8"
                      strokeOpacity={0.55}
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
                  className="flex items-center gap-1 md:gap-1.5 rounded-pill bg-white/20 border border-white/40 text-[9px] md:text-[11px] text-white px-2 md:px-3 py-0.5 md:py-1.5 whitespace-nowrap shadow-xs"
                  animate={{ opacity: [0.75, 1, 0.75] }}
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
                      src="/images/Logo.png"
                      alt="MudKitchen"
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                    <span className="font-display text-[clamp(9px,1.2vw,15px)] text-white/60 whitespace-nowrap tracking-tight">
                      MudKitchen
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
                        className="flex items-center gap-1 rounded-pill bg-white text-[8px] md:text-[10px] lg:text-[11px] text-accent font-semibold px-1.5 md:px-2.5 lg:px-3 py-0.5 md:py-1 whitespace-nowrap shadow-md"
                        animate={{ opacity: [0.85, 1, 0.85] }}
                        transition={{
                          duration: 2.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: p.delay + 0.7,
                        }}
                      >
                        <p.icon size={9} className="shrink-0 md:w-[11px] md:h-[11px]" />
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
