"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import type { CSSProperties, ReactNode } from "react";
import { FONT, G, Hand } from "@/components/admin/marketing/ads/ad-kit";
import { YOUR } from "@/components/admin/marketing/carousels/free-preview-mocks";
import { FOUNDER_PORTRAITS } from "@/components/about-garden/about-copy";

// Classroom-object art for the founder-note and school-object ads: letters, texts, slips, passes,
// report cards, flyers, whiteboards. CSS shapes and gradients only (no filters, no inline SVG art),
// so every export stays fast and never goes black.

/** Signature used on the anonymous founder-voice ads (Sets G and H). */
export const FOUNDER_SIGNATURE = "— the MudKitchen founder";

/** Named founder for the signed sets (Set J and the bundle note). The photo path has a space, so it is URL-encoded for html-to-image. */
export const FOUNDER_JULIUS = {
  name: "Julius",
  fullName: FOUNDER_PORTRAITS.julius.name,
  role: "Co-founder, MudKitchen",
  photo: encodeURI(FOUNDER_PORTRAITS.julius.src),
} as const;

export const JULIUS_SIGNATURE = "— Julius, co-founder of MudKitchen";

// ---------------------------------------------------------------- founder photo

/** Round founder photo with an ink ring. */
export function FounderAvatar({ size = 96, ring = 4, style }: { size?: number; ring?: number; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: "block",
        width: size,
        height: size,
        flexShrink: 0,
        boxSizing: "border-box",
        borderRadius: 999,
        border: `${ring}px solid ${G.ink}`,
        overflow: "hidden",
        background: G.cream,
        ...style,
      }}
    >
      <img src={FOUNDER_JULIUS.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 28%", display: "block" }} />
    </span>
  );
}

/** Taped instant photo of the founder with a handwritten caption. */
export function FounderPolaroid({
  width = 280,
  rotate = -4,
  caption = "hi, I'm Julius 👋",
  tape = G.butter,
  style,
}: {
  width?: number;
  rotate?: number;
  caption?: ReactNode;
  tape?: string | false;
  style?: CSSProperties;
}) {
  const pad = Math.round(width * 0.06);
  return (
    <div style={{ position: "relative", width, transform: rotate ? `rotate(${rotate}deg)` : undefined, ...style }}>
      <div
        style={{
          boxSizing: "border-box",
          width,
          padding: `${pad}px ${pad}px ${Math.round(pad * 0.6)}px`,
          background: "#FFFFFF",
          border: `4px solid ${G.ink}`,
          borderRadius: 10,
          boxShadow: `0 10px 0 ${G.ink}`,
        }}
      >
        <div style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden", borderRadius: 4, background: G.cream }}>
          <img src={FOUNDER_JULIUS.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%", display: "block" }} />
        </div>
        <Hand size={Math.round(width * 0.12)} color={G.ink} rotate={0} style={{ textAlign: "center", marginTop: Math.round(pad * 0.5), lineHeight: 1.15 }}>
          {caption}
        </Hand>
      </div>
      {tape ? (
        <span aria-hidden style={{ position: "absolute", top: -20, left: "50%", marginLeft: -Math.round(width * 0.26), width: Math.round(width * 0.52), height: 40, background: tape, opacity: 0.9, transform: "rotate(4deg)", borderRadius: 4 }} />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- notes app

/** A phone "Notes" statement: amber back bar, date line, bold title, plain body. */
export function NotesAppCard({ title, date = "Today at 9:41 PM", width = 780, rotate = 0, children, style }: { title: ReactNode; date?: string; width?: number; rotate?: number; children: ReactNode; style?: CSSProperties }) {
  const amber = "#D9921F";
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        background: "#FFFFFF",
        border: `4px solid ${G.ink}`,
        borderRadius: 40,
        boxShadow: `0 12px 0 ${G.ink}`,
        overflow: "hidden",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        fontFamily: FONT.body,
        color: G.ink,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 34px 10px", fontWeight: 700, fontSize: 28, color: amber }}>
        <span>‹ Notes</span>
        <span style={{ fontWeight: 800 }}>Done</span>
      </div>
      <p style={{ margin: 0, textAlign: "center", fontWeight: 600, fontSize: 20, color: "#9A9086" }}>{date}</p>
      <div style={{ padding: "18px 40px 36px" }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: 40, lineHeight: 1.15, letterSpacing: "-0.01em" }}>{title}</p>
        <div style={{ marginTop: 16, fontWeight: 600, fontSize: 29, lineHeight: 1.38, color: G.ink }}>{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- voice memo

// Fixed bar heights so every export is identical.
const WAVE = Array.from({ length: 40 }, (_, i) => 14 + Math.round(Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.55)) * 64));

/** Voice memo from the founder: photo, play button, waveform, then the transcript. */
export function VoiceMemoCard({ duration = "0:24", transcript, width = 900, rotate = 0, style }: { duration?: string; transcript: ReactNode; width?: number; rotate?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        background: "#FFFFFF",
        border: `4px solid ${G.ink}`,
        borderRadius: 40,
        boxShadow: `0 12px 0 ${G.ink}`,
        overflow: "hidden",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        fontFamily: FONT.body,
        color: G.ink,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "24px 30px", background: "#F6F3EE", borderBottom: "2px solid #E4D8C8" }}>
        <FounderAvatar size={86} ring={3} />
        <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ fontWeight: 800, fontSize: 30 }}>{FOUNDER_JULIUS.name}</span>
          <span style={{ fontWeight: 600, fontSize: 22, color: G.soft }}>{FOUNDER_JULIUS.role} · voice memo</span>
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "28px 30px 10px" }}>
        <span style={{ width: 78, height: 78, flexShrink: 0, borderRadius: 999, background: G.forest, border: `4px solid ${G.ink}`, boxSizing: "border-box", display: "grid", placeItems: "center" }}>
          <span aria-hidden style={{ width: 0, height: 0, marginLeft: 6, borderTop: "15px solid transparent", borderBottom: "15px solid transparent", borderLeft: `24px solid ${G.cream}` }} />
        </span>
        <span aria-hidden style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, height: 84 }}>
          {WAVE.map((h, i) => (
            <span key={i} style={{ flex: 1, height: h, borderRadius: 999, background: i < 14 ? G.forest : "#CFC5B8" }} />
          ))}
        </span>
        <span style={{ fontWeight: 800, fontSize: 26, color: G.soft, flexShrink: 0 }}>{duration}</span>
      </div>
      <div style={{ margin: "14px 30px 30px", padding: "20px 24px", borderRadius: 24, background: G.cream }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: 19, letterSpacing: "0.14em", textTransform: "uppercase", color: G.soft }}>Transcript</p>
        <div style={{ marginTop: 8, fontWeight: 600, fontSize: 29, lineHeight: 1.36, color: G.ink }}>{transcript}</div>
      </div>
    </div>
  );
}

const RULE = "#B9D3EE";
const MARGIN = "#E9897A";

/** Ruled notebook paper with a red margin, punched holes and a strip of tape. */
export function NotebookPaper({
  width = 820,
  rotate = -1.5,
  tape = G.butter,
  lineGap = 64,
  padding = "56px 56px 48px 120px",
  children,
  style,
}: {
  width?: number | string;
  rotate?: number;
  tape?: string | false;
  lineGap?: number;
  padding?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{ position: "relative", width, transform: rotate ? `rotate(${rotate}deg)` : undefined, ...style }}>
      <div
        style={{
          position: "relative",
          boxSizing: "border-box",
          padding,
          background: `repeating-linear-gradient(180deg, #FFFEFA 0, #FFFEFA ${lineGap - 3}px, ${RULE} ${lineGap - 3}px, ${RULE} ${lineGap}px)`,
          backgroundPosition: `0 ${Math.round(lineGap * 0.62)}px`,
          border: `4px solid ${G.ink}`,
          borderRadius: 14,
          boxShadow: `0 12px 0 ${G.ink}`,
          overflow: "hidden",
        }}
      >
        <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 88, width: 3, background: MARGIN }} />
        {[0.18, 0.5, 0.82].map((top) => (
          <span key={top} aria-hidden style={{ position: "absolute", left: 30, top: `${top * 100}%`, width: 28, height: 28, marginTop: -14, borderRadius: 999, background: G.cream, border: "3px solid rgba(43,36,29,.25)" }} />
        ))}
        <div style={{ position: "relative" }}>{children}</div>
      </div>
      {tape ? (
        <span aria-hidden style={{ position: "absolute", top: -22, left: "50%", marginLeft: -80, width: 160, height: 44, background: tape, opacity: 0.9, transform: "rotate(-3deg)", borderRadius: 4 }} />
      ) : null}
    </div>
  );
}

/** Handwritten line for letters (Gochi Hand, ink, no tilt). */
export function LetterLine({ children, size = 44, color = G.ink, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return (
    <Hand size={size} color={color} rotate={0} style={{ lineHeight: 1.45, ...style }}>
      {children}
    </Hand>
  );
}

// ---------------------------------------------------------------- texts

export type TextMessage = { from: "founder" | "you"; text: ReactNode };

/** A phone-style text thread with the MudKitchen founder (grey bubbles) and you (blue bubbles). `named` shows Julius and his photo. */
export function TextThread({ messages, width = 700, named = false, children, style }: { messages: TextMessage[]; width?: number; named?: boolean; children?: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        background: "#FFFFFF",
        border: `4px solid ${G.ink}`,
        borderRadius: 44,
        boxShadow: `0 12px 0 ${G.ink}`,
        overflow: "hidden",
        fontFamily: FONT.body,
        color: G.ink,
        ...style,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "22px 0 16px", background: "#F6F3EE", borderBottom: "2px solid #E4D8C8" }}>
        {named ? (
          <FounderAvatar size={66} ring={3} />
        ) : (
          <span style={{ width: 66, height: 66, borderRadius: 999, background: G.cream, border: "3px solid #E4D8C8", display: "grid", placeItems: "center" }}>
            <img src="/images/Logo.png" alt="" style={{ width: 46, height: 46, objectFit: "contain" }} />
          </span>
        )}
        <span style={{ fontWeight: 800, fontSize: 24 }}>{named ? `${FOUNDER_JULIUS.name} · MudKitchen` : "MudKitchen founder"}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "24px 24px 28px" }}>
        {messages.map((m, i) => {
          const mine = m.from === "you";
          return (
            <div
              key={i}
              style={{
                alignSelf: mine ? "flex-end" : "flex-start",
                maxWidth: "80%",
                padding: "16px 22px",
                borderRadius: mine ? "28px 28px 8px 28px" : "28px 28px 28px 8px",
                background: mine ? "#2F7CF6" : "#ECE8E2",
                color: mine ? "#FFFFFF" : G.ink,
                fontWeight: 700,
                fontSize: 29,
                lineHeight: 1.25,
              }}
            >
              {m.text}
            </div>
          );
        })}
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- email

/** An inbox row, then the opened email. `attachment` renders under the body. */
export function InboxEmail({
  subject,
  body,
  from = "MudKitchen founder",
  width = 900,
  named = false,
  attachment,
  style,
}: {
  subject: ReactNode;
  body: ReactNode;
  from?: string;
  width?: number;
  /** Show the founder's photo instead of the MudKitchen logo. */
  named?: boolean;
  attachment?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{ width, boxSizing: "border-box", background: "#FFFFFF", border: `4px solid ${G.ink}`, borderRadius: 32, boxShadow: `0 12px 0 ${G.ink}`, fontFamily: FONT.body, color: G.ink, overflow: "hidden", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 28px", background: "#F6F3EE", borderBottom: "2px solid #E4D8C8" }}>
        {named ? (
          <FounderAvatar size={58} ring={3} />
        ) : (
          <span style={{ width: 54, height: 54, borderRadius: 999, background: G.cream, border: "2px solid #E4D8C8", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <img src="/images/Logo.png" alt="" style={{ width: 38, height: 38, objectFit: "contain" }} />
          </span>
        )}
        <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
          <span style={{ fontWeight: 800, fontSize: 24 }}>{from}</span>
          <span style={{ fontWeight: 600, fontSize: 19, color: G.soft }}>to you · Inbox</span>
        </span>
        <span style={{ width: 16, height: 16, borderRadius: 999, background: "#2F7CF6" }} />
      </div>
      <div style={{ padding: "24px 30px 28px" }}>
        <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 36, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{subject}</p>
        <div style={{ margin: "12px 0 0", fontWeight: 600, fontSize: 26, lineHeight: 1.4, color: G.soft }}>{body}</div>
        {attachment ? <div style={{ marginTop: 20 }}>{attachment}</div> : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- school objects

/** Tick box drawn in ink; `checked` fills it forest with a white check. */
export function TickBox({ checked = true, size = 44 }: { checked?: boolean; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        boxSizing: "border-box",
        borderRadius: 10,
        border: `4px solid ${G.ink}`,
        background: checked ? G.forest : "#FFFFFF",
        display: "grid",
        placeItems: "center",
        color: "#FFFFFF",
        fontFamily: FONT.body,
        fontWeight: 900,
        fontSize: Math.round(size * 0.62),
        lineHeight: 1,
      }}
    >
      {checked ? "✓" : ""}
    </span>
  );
}

/** Dashed "cut here" line with a scissors glyph. */
export function TearLine({ label = "cut here", color = "rgba(43,36,29,.45)" }: { label?: string; color?: string }) {
  return (
    <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0" }}>
      <span style={{ fontSize: 30, color }}>✂</span>
      <span style={{ flex: 1, borderTop: `4px dashed ${color}` }} />
      <span style={{ fontFamily: FONT.hand, fontSize: 26, color }}>{label}</span>
    </div>
  );
}

/** Blank line with a small caption under it (signature / date fields). */
export function SignatureLine({ caption, children, width = "100%" }: { caption: string; children?: ReactNode; width?: number | string }) {
  return (
    <div style={{ width }}>
      <div style={{ minHeight: 58, borderBottom: `4px solid ${G.ink}`, display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>{children}</div>
      <p style={{ margin: "8px 0 0", fontFamily: FONT.body, fontWeight: 800, fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", color: G.soft }}>{caption}</p>
    </div>
  );
}

/** Rubber stamp: outlined, uppercase, tilted. */
export function Stamp({ children, color = G.clay, rotate = -10, size = 34, style }: { children: ReactNode; color?: string; rotate?: number; size?: number; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "10px 22px",
        border: `5px solid ${color}`,
        borderRadius: 14,
        color,
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        transform: `rotate(${rotate}deg)`,
        opacity: 0.9,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Form header row used on slips and passes: small caps label left, school mark right. */
export function FormHeader({ label, title, tint = YOUR.soft }: { label: string; title: ReactNode; tint?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "18px 26px", background: tint, borderBottom: `4px solid ${G.ink}` }}>
      <span style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 20, letterSpacing: "0.14em", textTransform: "uppercase", color: G.soft }}>{label}</span>
        <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 40, lineHeight: 1.05, letterSpacing: "-0.025em", color: G.ink }}>{title}</span>
      </span>
      <img src="/images/Logo.png" alt="" style={{ width: 64, height: 64, objectFit: "contain", transform: "rotate(-6deg)" }} />
    </div>
  );
}

/** Ink-outlined paper form (permission slip, hall pass, report card, flyer). */
export function PaperForm({ children, width = 860, rotate = -1.5, bg = "#FFFEFA", style }: { children: ReactNode; width?: number | string; rotate?: number; bg?: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        background: bg,
        border: `4px solid ${G.ink}`,
        borderRadius: 22,
        boxShadow: `0 12px 0 ${G.ink}`,
        overflow: "hidden",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        fontFamily: FONT.body,
        color: G.ink,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Whiteboard with an aluminium frame and a marker tray. */
export function Whiteboard({ children, width = 620, height = 460, rotate = -2, style }: { children: ReactNode; width?: number; height?: number; rotate?: number; style?: CSSProperties }) {
  return (
    <div style={{ width, transform: rotate ? `rotate(${rotate}deg)` : undefined, ...style }}>
      <div
        style={{
          position: "relative",
          height,
          boxSizing: "border-box",
          padding: 30,
          background: "linear-gradient(160deg, #FFFFFF 0%, #F3F6F8 60%, #E9EEF1 100%)",
          border: "14px solid #C9CED3",
          outline: `4px solid ${G.ink}`,
          borderRadius: 10,
          boxShadow: `0 12px 0 ${G.ink}`,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      <div style={{ display: "flex", gap: 14, margin: "10px 0 0 40px" }}>
        {["#2F7CF6", "#D64545", "#2E9E5B"].map((c) => (
          <span key={c} style={{ width: 90, height: 20, borderRadius: 999, background: c, border: `3px solid ${G.ink}` }} />
        ))}
      </div>
    </div>
  );
}

/** Marker stroke box for whiteboard sketches (a wobbly rounded outline). */
export function MarkerBox({ color = "#2F7CF6", style, children }: { color?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div style={{ position: "absolute", border: `5px solid ${color}`, borderRadius: "14px 22px 12px 26px / 22px 12px 26px 14px", ...style }}>
      {children}
    </div>
  );
}

/** Handwritten label with a drawn arrow. Arrow heads point away from the label. */
export function Annotation({ children, arrow = "down-left", color = G.clayDeep, size = 40 }: { children: ReactNode; arrow?: "down-left" | "down-right" | "left" | "right" | "up-left" | "up-right"; color?: string; size?: number }) {
  const paths: Record<typeof arrow, string> = {
    "down-left": "M90 6 C 70 30, 40 40, 12 70 M12 70 L 14 48 M12 70 L 34 66",
    "down-right": "M10 6 C 30 30, 60 40, 88 70 M88 70 L 66 66 M88 70 L 86 48",
    left: "M92 40 C 70 20, 40 20, 10 40 M10 40 L 28 26 M10 40 L 30 52",
    right: "M8 40 C 30 20, 60 20, 90 40 M90 40 L 72 26 M90 40 L 70 52",
    "up-left": "M90 74 C 70 50, 40 40, 12 10 M12 10 L 14 32 M12 10 L 34 14",
    "up-right": "M10 74 C 30 50, 60 40, 88 10 M88 10 L 66 14 M88 10 L 86 32",
  };
  const flip = arrow === "down-right" || arrow === "right" || arrow === "up-right";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexDirection: flip ? "row" : "row-reverse" }}>
      <Hand size={size} color={color} rotate={-3}>
        {children}
      </Hand>
      <svg width="100" height="80" viewBox="0 0 100 80" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={paths[arrow]} />
      </svg>
    </span>
  );
}

/** Big strike-through for crossed-out list items. */
export function Struck({ children, color = G.clay }: { children: ReactNode; color?: string }) {
  return <span style={{ textDecoration: "line-through", textDecorationThickness: 5, textDecorationColor: color }}>{children}</span>;
}
