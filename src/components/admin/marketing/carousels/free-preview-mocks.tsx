"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import type { CSSProperties, ReactNode } from "react";
import type { MascotName, MascotView } from "@/components/admin/marketing/mascot/Mascot";
import { Accent, CtaButton, FONT, G, Hand, Headline, MascotSlide, PlacedMascot } from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Shared art for the "free custom preview" campaign (ads, posts and two swipe carousels).
// Everything is branded with a generic "Your School" placeholder: never a real school or a
// prospect's concept demo from src/data/school-demos (those are private).

export const FREE_PREVIEW_URL = "trymudkitchen.com/free-preview";
export const FREE_PREVIEW_CTA = "Get my free preview";

/** Destination URL template, repeated in each set's description. */
export const FREE_PREVIEW_UTM =
  "trymudkitchen.com/free-preview?utm_source={meta|instagram|linkedin}&utm_medium={paid|social}&utm_campaign=free-preview&utm_content=<slide-id>";

/** The placeholder school's brand: deliberately not MudKitchen's palette, to show "your colours". */
export const YOUR = {
  name: "Your School",
  primary: "#3E5C8A",
  primaryDeep: "#2C4468",
  accent: "#F0A04B",
  soft: "#E6EDF7",
  tint: "#FFF4E6",
} as const;

// ---------------------------------------------------------------- helpers

/** Draws `children` at its natural w×h and scales the whole thing (keeps mocks crisp at any size). */
export function Scaled({ w, h, scale, children, style }: { w: number; h: number; scale: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: "relative", width: Math.round(w * scale), height: Math.round(h * scale), flexShrink: 0, ...style }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}

function Bar({ w, h = 14, color = "#E3DBD0", style }: { w: number | string; h?: number; color?: string; style?: CSSProperties }) {
  return <span style={{ display: "block", width: w, height: h, borderRadius: 999, background: color, ...style }} />;
}

function Check({ size = 22, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

// ---------------------------------------------------------------- brand

/** Placeholder logo: a sprout in a circle, in the placeholder school's colours. */
export function YourSchoolMark({ size = 56, ring = G.ink }: { size?: number; ring?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden style={{ display: "block", flexShrink: 0 }}>
      <circle cx="24" cy="24" r="21.5" fill={YOUR.primary} stroke={ring} strokeWidth="3" />
      <path d="M24 36V22" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M24 25c0-6 4-10 11-10 0 6-4 10-11 10z" fill={YOUR.accent} />
      <path d="M24 28c0-5-3.5-8.5-9.5-8.5 0 5 3.5 8.5 9.5 8.5z" fill="#FFFFFF" />
    </svg>
  );
}

/** Top of a character standing on the bottom edge of a 1080×1350 slide (the art box has ~20/260 empty space under the feet). */
export const groundedY = (width: number) => 1350 - Math.round((width * 260) / 240) + Math.round((width * 20) / 260);

export function YourSchoolLockup({ size = 48, fontSize = 28, color = G.ink, ring }: { size?: number; fontSize?: number; color?: string; ring?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * 0.25) }}>
      <YourSchoolMark size={size} ring={ring} />
      <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize, letterSpacing: "-0.02em", color, whiteSpace: "nowrap" }}>{YOUR.name}</span>
    </span>
  );
}

// ---------------------------------------------------------------- browser + website

export const BROWSER_W = 960;
export const BROWSER_H = 620;

/** Ink-outlined browser window. The address bar reads as a private preview, not a real URL. */
export function MockBrowser({ children, label = `${YOUR.name} · private preview`, width = BROWSER_W, height = BROWSER_H }: { children: ReactNode; label?: string; width?: number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        background: "#FFFFFF",
        border: `4px solid ${G.ink}`,
        borderRadius: 30,
        boxShadow: `0 12px 0 ${G.ink}`,
        overflow: "hidden",
      }}
    >
      <div style={{ height: 58, flexShrink: 0, display: "flex", alignItems: "center", gap: 18, padding: "0 22px", background: G.cream, borderBottom: `3px solid ${G.ink}` }}>
        <span style={{ display: "flex", gap: 9 }}>
          {["#E9897A", "#F2C14E", "#8DBF7A"].map((c) => (
            <span key={c} style={{ width: 16, height: 16, borderRadius: 999, background: c, border: `2px solid ${G.ink}` }} />
          ))}
        </span>
        <span
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 34,
            padding: "0 16px",
            borderRadius: 999,
            background: "#FFFFFF",
            border: "2px solid #E4D8C8",
            fontFamily: FONT.body,
            fontWeight: 700,
            fontSize: 19,
            color: G.soft,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G.forest} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          {label}
        </span>
      </div>
      <div style={{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden" }}>{children}</div>
    </div>
  );
}

const PROGRAMS = [
  { name: "Little Learners", ages: "Ages 4–6", tint: YOUR.tint },
  { name: "Lower School", ages: "Ages 6–9", tint: YOUR.soft },
  { name: "Upper School", ages: "Ages 9–12", tint: "#EEF5E9" },
];

/** A school website in the placeholder brand: nav, hero, programs. */
export function WebsiteMock() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FFFDF9", fontFamily: FONT.body, color: G.ink }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 34px" }}>
        <YourSchoolLockup size={40} fontSize={24} ring={YOUR.primaryDeep} />
        <span style={{ display: "flex", alignItems: "center", gap: 26, fontWeight: 700, fontSize: 18, color: G.soft }}>
          <span>Programs</span>
          <span>Tuition</span>
          <span>About</span>
          <span style={{ padding: "10px 20px", borderRadius: 999, background: YOUR.primary, color: "#FFFFFF", fontWeight: 800 }}>Apply</span>
        </span>
      </div>
      <div style={{ margin: "4px 34px 0", height: 290, borderRadius: 26, background: YOUR.soft, position: "relative", overflow: "hidden", display: "flex" }}>
        <div style={{ padding: "40px 0 0 40px", width: 470, position: "relative", zIndex: 2 }}>
          <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 46, lineHeight: 1.02, letterSpacing: "-0.03em", color: YOUR.primaryDeep }}>A small school for curious kids.</p>
          <p style={{ margin: "14px 0 0", fontWeight: 600, fontSize: 19, lineHeight: 1.35, color: G.soft }}>Mixed-age classes, project days and lots of time outside.</p>
          <span style={{ display: "inline-block", marginTop: 20, padding: "12px 24px", borderRadius: 999, background: YOUR.accent, color: G.ink, fontWeight: 800, fontSize: 19 }}>Book a tour</span>
        </div>
        <svg width="420" height="290" viewBox="0 0 420 290" aria-hidden style={{ position: "absolute", right: 0, bottom: 0 }}>
          <circle cx="300" cy="90" r="42" fill={YOUR.accent} />
          <path d="M0 230 Q 110 150 220 210 T 420 180 V 290 H 0z" fill={YOUR.primary} opacity="0.85" />
          <path d="M60 290 Q 190 200 320 250 T 420 240 V 290z" fill={YOUR.primaryDeep} />
        </svg>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, margin: "22px 34px 0" }}>
        {PROGRAMS.map((p) => (
          <div key={p.name} style={{ padding: "18px 20px", borderRadius: 20, background: p.tint, border: "2px solid #EDE4D8" }}>
            <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 23, color: G.ink }}>{p.name}</p>
            <p style={{ margin: "4px 0 12px", fontWeight: 700, fontSize: 16, color: G.soft }}>{p.ages}</p>
            <Bar w="90%" h={10} />
            <Bar w="65%" h={10} style={{ marginTop: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const ADMIN_NAV = ["Dashboard", "Admissions", "Students", "Tuition", "Messages", "Calendar"];
const ADMIN_TILES = [
  { label: "Applications", tint: YOUR.tint },
  { label: "Tuition", tint: YOUR.soft },
  { label: "Messages", tint: "#EEF5E9" },
];
const ADMIN_ROWS = [
  { status: "New", bg: YOUR.tint, color: "#9A5A12" },
  { status: "Tour booked", bg: YOUR.soft, color: YOUR.primaryDeep },
  { status: "Enrolled", bg: "#E3F1DC", color: "#2F6B3A" },
];

/** Admin portal in the placeholder brand: sidebar, tiles and an admissions list (placeholder bars, no data). */
export function AdminPortalMock() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", background: "#FBF8F3", fontFamily: FONT.body, color: G.ink }}>
      <div style={{ width: 230, flexShrink: 0, background: YOUR.primaryDeep, padding: "24px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ marginBottom: 18 }}>
          <YourSchoolLockup size={36} fontSize={21} color="#FFFFFF" ring="#FFFFFF" />
        </div>
        {ADMIN_NAV.map((item, i) => (
          <span
            key={item}
            style={{
              padding: "11px 14px",
              borderRadius: 14,
              background: i === 0 ? "rgba(255,255,255,.16)" : "transparent",
              color: i === 0 ? "#FFFFFF" : "rgba(255,255,255,.72)",
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            {item}
          </span>
        ))}
      </div>
      <div style={{ flex: 1, padding: "26px 30px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 34, letterSpacing: "-0.02em" }}>Good morning</p>
          <span style={{ padding: "9px 18px", borderRadius: 999, background: YOUR.accent, fontWeight: 800, fontSize: 16 }}>+ New</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {ADMIN_TILES.map((t) => (
            <div key={t.label} style={{ padding: "16px 18px", borderRadius: 18, background: t.tint, border: "2px solid #EDE4D8" }}>
              <p style={{ margin: "0 0 12px", fontWeight: 800, fontSize: 18, color: G.soft }}>{t.label}</p>
              <Bar w="55%" h={22} color={YOUR.primary} style={{ opacity: 0.85 }} />
              <Bar w="80%" h={10} style={{ marginTop: 12 }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, borderRadius: 20, background: "#FFFFFF", border: "2px solid #EDE4D8", padding: "16px 20px" }}>
          <p style={{ margin: "0 0 10px", fontFamily: FONT.display, fontWeight: 800, fontSize: 22 }}>Admissions</p>
          {ADMIN_ROWS.map((row, i) => (
            <div key={row.status} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: i ? "2px dashed #EDE4D8" : "none" }}>
              <span style={{ width: 34, height: 34, borderRadius: 999, background: [YOUR.soft, YOUR.tint, "#EEF5E9"][i] }} />
              <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                <Bar w={[180, 150, 200][i]} h={12} color="#D9CFC2" />
                <Bar w={[110, 130, 90][i]} h={9} />
              </span>
              <span style={{ padding: "6px 14px", borderRadius: 999, background: row.bg, color: row.color, fontWeight: 800, fontSize: 15 }}>{row.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- phone

export const PHONE_W = 360;
export const PHONE_H = 740;

const PARENT_CARDS = [
  { title: "Tuition", sub: "Paid · autopay on", icon: "✓", tint: "#E3F1DC" },
  { title: "Field trip form", sub: "Ready to sign", icon: "✎", tint: YOUR.tint },
  { title: "This week", sub: "Friday picnic", icon: "★", tint: YOUR.soft },
];

/** Parent app on a phone in the placeholder brand. */
export function ParentAppPhone() {
  return (
    <div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        boxSizing: "border-box",
        padding: 12,
        background: G.ink,
        borderRadius: 58,
        boxShadow: "0 22px 40px rgba(43,36,29,.28)",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 46, overflow: "hidden", background: "#FBF8F3", fontFamily: FONT.body, color: G.ink }}>
        <div style={{ background: YOUR.primary, padding: "52px 24px 26px", color: "#FFFFFF" }}>
          <span style={{ position: "absolute", top: 14, left: "50%", marginLeft: -50, width: 100, height: 26, borderRadius: 999, background: G.ink }} />
          <YourSchoolLockup size={38} fontSize={22} color="#FFFFFF" ring="#FFFFFF" />
          <p style={{ margin: "20px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.02em" }}>Hi there 👋</p>
          <p style={{ margin: "6px 0 0", fontWeight: 700, fontSize: 17, color: "rgba(255,255,255,.8)" }}>Here&rsquo;s your week.</p>
        </div>
        <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {PARENT_CARDS.map((c) => (
            <div key={c.title} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 20, background: "#FFFFFF", border: "2px solid #EDE4D8" }}>
              <span style={{ width: 44, height: 44, borderRadius: 14, background: c.tint, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 22, color: YOUR.primaryDeep }}>{c.icon}</span>
              <span style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 800, fontSize: 19 }}>{c.title}</span>
                <span style={{ fontWeight: 600, fontSize: 15, color: G.soft }}>{c.sub}</span>
              </span>
            </div>
          ))}
          <div style={{ marginTop: 4, padding: "14px 16px", borderRadius: 20, background: YOUR.tint, border: "2px solid #F3DDBF" }}>
            <p style={{ margin: "0 0 10px", fontWeight: 800, fontSize: 16, color: "#9A5A12" }}>From the classroom</p>
            <Bar w="92%" h={10} color="#EBD3B4" />
            <Bar w="70%" h={10} color="#EBD3B4" style={{ marginTop: 8 }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 16, height: 62, borderRadius: 999, background: "#FFFFFF", border: "2px solid #EDE4D8", display: "flex", alignItems: "center", justifyContent: "space-around" }}>
          {["Home", "Billing", "Messages", "More"].map((tab, i) => (
            <span key={tab} style={{ fontWeight: 800, fontSize: 14, color: i === 0 ? YOUR.primary : G.soft }}>{tab}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- scaled shortcuts

export function YourWebsiteWindow({ scale = 1, label }: { scale?: number; label?: string }) {
  return (
    <Scaled w={BROWSER_W} h={BROWSER_H + 12} scale={scale}>
      <MockBrowser label={label}>
        <WebsiteMock />
      </MockBrowser>
    </Scaled>
  );
}

export function YourAdminWindow({ scale = 1, label }: { scale?: number; label?: string }) {
  return (
    <Scaled w={BROWSER_W} h={BROWSER_H + 12} scale={scale}>
      <MockBrowser label={label}>
        <AdminPortalMock />
      </MockBrowser>
    </Scaled>
  );
}

export function YourParentPhone({ scale = 1 }: { scale?: number }) {
  return (
    <Scaled w={PHONE_W} h={PHONE_H} scale={scale}>
      <ParentAppPhone />
    </Scaled>
  );
}

// ---------------------------------------------------------------- inbox + link

/** "Your preview is ready" email card. */
export function PreviewReadyEmail({ width = 760, rotate = 0, style }: { width?: number; rotate?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        padding: "28px 32px 32px",
        background: "#FFFFFF",
        border: `4px solid ${G.ink}`,
        borderRadius: 32,
        boxShadow: `0 10px 0 ${G.ink}`,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        fontFamily: FONT.body,
        color: G.ink,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ width: 62, height: 62, borderRadius: 999, background: G.cream, border: "2px solid #E4D8C8", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <img src="/images/Logo.png" alt="" style={{ width: 44, height: 44, objectFit: "contain" }} />
        </span>
        <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ fontWeight: 800, fontSize: 26 }}>MudKitchen</span>
          <span style={{ fontWeight: 600, fontSize: 21, color: G.soft }}>to you · Inbox</span>
        </span>
      </div>
      <p style={{ margin: "22px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: Math.min(38, Math.round(width * 0.048)), lineHeight: 1.1, letterSpacing: "-0.02em" }}>Your private preview is ready 🎉</p>
      <p style={{ margin: "10px 0 0", fontWeight: 600, fontSize: 25, lineHeight: 1.35, color: G.soft }}>Your website, parent app and admin portal, with your logo, colours and programs.</p>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 22, flexWrap: "wrap" }}>
        <span style={{ padding: "16px 30px", borderRadius: 999, background: G.forest, color: "#FFFFFF", fontWeight: 800, fontSize: 25 }}>Open your preview</span>
        <span style={{ fontWeight: 700, fontSize: 21, color: G.soft }}>🔒 Private link, just for you</span>
      </div>
    </div>
  );
}

/** One big "link" pill with the three things behind it. */
export function PreviewLinkCard({ width = 820, style }: { width?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        padding: "30px 34px",
        background: "#FFFFFF",
        border: `4px solid ${G.ink}`,
        borderRadius: 36,
        boxShadow: `0 12px 0 ${G.ink}`,
        fontFamily: FONT.body,
        color: G.ink,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ width: 66, height: 66, borderRadius: 20, background: G.butter, border: `3px solid ${G.ink}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={G.ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
            <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
          </svg>
        </span>
        <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 38, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{YOUR.name} · preview</span>
          <span style={{ fontWeight: 700, fontSize: 22, color: G.soft }}>🔒 Private link</span>
        </span>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        {["Website", "Parent app", "Admin portal"].map((item, i) => (
          <span
            key={item}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 20px",
              borderRadius: 999,
              background: [YOUR.soft, YOUR.tint, "#EEF5E9"][i],
              border: "2px solid #E4D8C8",
              fontWeight: 800,
              fontSize: 25,
            }}
          >
            <span style={{ width: 28, height: 28, borderRadius: 999, background: G.forest, display: "grid", placeItems: "center" }}>
              <Check size={16} />
            </span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Colour swatches pulled from the placeholder brand. */
export function BrandSwatches({ size = 150, style }: { size?: number; style?: CSSProperties }) {
  const swatches = [
    { color: YOUR.primary, label: "your blue", hex: YOUR.primary },
    { color: YOUR.accent, label: "your orange", hex: YOUR.accent },
    { color: YOUR.soft, label: "your sky", hex: YOUR.soft },
  ];
  return (
    <div style={{ display: "flex", gap: Math.round(size * 0.16), ...style }}>
      {swatches.map((s, i) => (
        <div
          key={s.label}
          style={{
            width: size,
            boxSizing: "border-box",
            padding: 12,
            background: "#FFFFFF",
            border: `3px solid ${G.ink}`,
            borderRadius: 22,
            boxShadow: `0 8px 0 ${G.ink}`,
            transform: `rotate(${[-4, 2, -1][i]}deg)`,
          }}
        >
          <span style={{ display: "block", height: Math.round(size * 0.72), borderRadius: 14, background: s.color, border: "2px solid rgba(43,36,29,.12)" }} />
          <span style={{ display: "block", marginTop: 10, fontFamily: FONT.hand, fontSize: Math.round(size * 0.2), color: G.ink, lineHeight: 1 }}>{s.label}</span>
          <span style={{ display: "block", marginTop: 4, fontFamily: FONT.body, fontWeight: 700, fontSize: Math.round(size * 0.13), color: G.soft }}>{s.hex}</span>
        </div>
      ))}
    </div>
  );
}

/** Small "free · private · 2 business days" pill for ad headers. */
export function FreeTag({ text = "Free · private · no obligation" }: { text?: string }) {
  return (
    <span
      style={{
        padding: "12px 22px",
        borderRadius: 999,
        background: G.butter,
        border: `3px solid ${G.ink}`,
        fontFamily: FONT.body,
        fontWeight: 800,
        fontSize: 24,
        color: G.ink,
        whiteSpace: "nowrap",
        transform: "rotate(2deg)",
      }}
    >
      {text}
    </span>
  );
}

// ---------------------------------------------------------------- swipe carousel CTA

type CastMember = { name: MascotName; view: MascotView; x: number; y: number; width: number; flip?: boolean };

/** Closing slide for the free-preview swipe carousels: forest panel, headline, CTA, landing URL and crew. */
export function FreePreviewCtaSlide({ lead, accent, aside, cast, children }: { lead: ReactNode; accent: ReactNode; aside?: ReactNode; cast: CastMember[]; children?: ReactNode }) {
  return (
    <MascotSlide background={G.forest}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 140, zIndex: 4 }}>
        <Headline size={86} color={G.cream}>
          {lead}
          <br />
          <Accent color={G.butter}>{accent}</Accent>
        </Headline>
        {aside ? (
          <Hand size={40} color={G.mint} rotate={-2} style={{ marginTop: 24 }}>
            {aside}
          </Hand>
        ) : null}
      </div>
      {children}
      {cast.map((m) => (
        <PlacedMascot key={m.name} name={m.name} view={m.view} width={m.width} x={m.x} y={m.y} flip={m.flip} z={3} />
      ))}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 70, zIndex: 5, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18 }}>
        <CtaButton bg={G.butter} color={G.forestDeep} shadow="#1A2C22">
          {FREE_PREVIEW_CTA}
        </CtaButton>
        <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: G.mint }}>{FREE_PREVIEW_URL}</span>
      </div>
    </MascotSlide>
  );
}
