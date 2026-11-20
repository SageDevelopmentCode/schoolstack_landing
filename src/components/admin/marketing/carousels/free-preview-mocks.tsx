"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import type { CSSProperties, ReactNode } from "react";
import type { MascotName, MascotView } from "@/components/admin/marketing/mascot/Mascot";
import { Accent, CtaButton, FONT, G, Hand, Headline, MascotSlide, PlacedMascot } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import { CAROUSEL_DEMO_INNER_WIDTH } from "@/components/admin/marketing/carousels/carousel-product-slide";
import {
  GardenAdminDashboardWindow,
  GardenTeacherHomeWindow,
  GardenWebsiteWindow,
} from "@/components/admin/marketing/screens/marketing-garden-demo-windows";

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

// ---------------------------------------------------------------- real screens

/** Inner size of a MockBrowser body (960 − 2×4 border, 620 − 58 bar − 2×4 border). */
const BODY_W = BROWSER_W - 8;
const BODY_H = BROWSER_H - 66;
const REAL_SCALE = BODY_W / CAROUSEL_DEMO_INNER_WIDTH;
const REAL_H = Math.round(BODY_H / REAL_SCALE);

/** A real Garden demo window (1100px canvas) scaled to fill a MockBrowser body. */
function RealScreen({ children }: { children: ReactNode }) {
  return (
    <div data-demo-window style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Scaled w={CAROUSEL_DEMO_INNER_WIDTH} h={REAL_H} scale={REAL_SCALE}>
        {children}
      </Scaled>
    </div>
  );
}

// ---------------------------------------------------------------- phone

export const PHONE_W = 360;
export const PHONE_H = 760;

/**
 * Real screenshots of the MudKitchen mobile app, signed in to the fictional "Your School" on the local
 * stack (scripts/seed-your-school-marketing-local.ts). Captured on the iOS Simulator at 720px wide.
 */
export const APP_SCREENS = {
  parent: {
    home: "/images/marketing/app-screens/parent-home.png",
    billing: "/images/marketing/app-screens/parent-billing.png",
    messages: "/images/marketing/app-screens/parent-messages.png",
    forms: "/images/marketing/app-screens/parent-forms.png",
    calendar: "/images/marketing/app-screens/parent-calendar.png",
  },
  teacher: {
    home: "/images/marketing/app-screens/teacher-home.png",
    rollCall: "/images/marketing/app-screens/teacher-roll-call.png",
  },
  admin: {
    dashboard: "/images/marketing/app-screens/admin-dashboard.png",
    admissions: "/images/marketing/app-screens/admin-admissions.png",
  },
} as const;

export type AppScreenApp = keyof typeof APP_SCREENS;
export type AppScreenName<A extends AppScreenApp> = keyof (typeof APP_SCREENS)[A];

/** A real app screenshot in an ink phone bezel (the capture already includes the status bar). */
export function AppPhone<A extends AppScreenApp>({ app, screen }: { app: A; screen: AppScreenName<A> }) {
  const src = (APP_SCREENS[app] as Record<string, string>)[screen as string];
  return (
    <div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        boxSizing: "border-box",
        padding: 11,
        background: G.ink,
        borderRadius: 60,
        boxShadow: "0 22px 40px rgba(43,36,29,.28)",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 49, overflow: "hidden", background: "#FFFFFF" }}>
        <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />
        <span aria-hidden style={{ position: "absolute", top: 11, left: "50%", marginLeft: -52, width: 104, height: 30, borderRadius: 999, background: "#000000" }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- scaled shortcuts

/** The real Garden school website, branded "Your School". */
export function YourWebsiteWindow({ scale = 1, label }: { scale?: number; label?: string }) {
  return (
    <Scaled w={BROWSER_W} h={BROWSER_H + 12} scale={scale}>
      <MockBrowser label={label}>
        <RealScreen>
          <GardenWebsiteWindow brand="your-school" contentHeight={REAL_H} />
        </RealScreen>
      </MockBrowser>
    </Scaled>
  );
}

/** The real Garden admin dashboard, branded "Your School". */
export function YourAdminWindow({ scale = 1, label }: { scale?: number; label?: string }) {
  return (
    <Scaled w={BROWSER_W} h={BROWSER_H + 12} scale={scale}>
      <MockBrowser label={label}>
        <RealScreen>
          <GardenAdminDashboardWindow brand="your-school" contentHeight={REAL_H} />
        </RealScreen>
      </MockBrowser>
    </Scaled>
  );
}

/** The real Garden teacher portal (Today), branded "Your School". */
export function YourTeacherWindow({ scale = 1, label }: { scale?: number; label?: string }) {
  return (
    <Scaled w={BROWSER_W} h={BROWSER_H + 12} scale={scale}>
      <MockBrowser label={label}>
        <RealScreen>
          <GardenTeacherHomeWindow brand="your-school" contentHeight={REAL_H} />
        </RealScreen>
      </MockBrowser>
    </Scaled>
  );
}

/** Any real Garden window (billing, admissions, roll call…) in the same ink browser chrome. */
export function YourRealWindow({ scale = 1, label, children }: { scale?: number; label?: string; children: (contentHeight: number) => ReactNode }) {
  return (
    <Scaled w={BROWSER_W} h={BROWSER_H + 12} scale={scale}>
      <MockBrowser label={label}>
        <RealScreen>{children(REAL_H)}</RealScreen>
      </MockBrowser>
    </Scaled>
  );
}

/** The real parent app (Home by default) for "Your School". */
export function YourParentPhone({ scale = 1, screen = "home" }: { scale?: number; screen?: AppScreenName<"parent"> }) {
  return (
    <Scaled w={PHONE_W} h={PHONE_H} scale={scale}>
      <AppPhone app="parent" screen={screen} />
    </Scaled>
  );
}

/** The real teacher app for "Your School". */
export function YourTeacherPhone({ scale = 1, screen = "rollCall" }: { scale?: number; screen?: AppScreenName<"teacher"> }) {
  return (
    <Scaled w={PHONE_W} h={PHONE_H} scale={scale}>
      <AppPhone app="teacher" screen={screen} />
    </Scaled>
  );
}

/** The real school-admin app for "Your School". */
export function YourAdminPhone({ scale = 1, screen = "dashboard" }: { scale?: number; screen?: AppScreenName<"admin"> }) {
  return (
    <Scaled w={PHONE_W} h={PHONE_H} scale={scale}>
      <AppPhone app="admin" screen={screen} />
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
      <p style={{ margin: "10px 0 0", fontWeight: 600, fontSize: 25, lineHeight: 1.35, color: G.soft }}>Your website, parent app, teacher portal and admin portal, with your logo and colours.</p>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 22, flexWrap: "wrap" }}>
        <span style={{ padding: "16px 30px", borderRadius: 999, background: G.forest, color: "#FFFFFF", fontWeight: 800, fontSize: 25 }}>Open your preview</span>
        <span style={{ fontWeight: 700, fontSize: 21, color: G.soft }}>🔒 Private link, just for you</span>
      </div>
    </div>
  );
}

/** One big "link" pill with the four things behind it. */
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
        {["Website", "Parent app", "Teacher portal", "Admin portal"].map((item, i) => (
          <span
            key={item}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 20px",
              borderRadius: 999,
              background: [YOUR.soft, YOUR.tint, "#ECE2F3", "#EEF5E9"][i],
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
