import React from "react";
import { Img, staticFile } from "remotion";
import type { LucideIcon } from "lucide-react";
import { C, FONT } from "../theme";

// Outer tool pill — glass version of the site's `bg-white/20 border-white/40` pill.
export const ToolLogo: React.FC<{ logo: string; size: number; crop?: { x: number; y: number; w: number } }> = ({
  logo,
  size,
  crop,
}) => {
  if (!crop) {
    return <Img src={staticFile(logo)} style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }} />;
  }
  const imgW = size / crop.w;
  return (
    <div style={{ width: size, height: size, overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <Img
        src={staticFile(logo)}
        style={{ position: "absolute", width: imgW, height: imgW, left: -crop.x * imgW, top: -crop.y * imgW, maxWidth: "none" }}
      />
    </div>
  );
};

export const GlassPill: React.FC<{
  logo: string;
  name: string;
  font: number;
  crop?: { x: number; y: number; w: number };
  style?: React.CSSProperties;
}> = ({ logo, name, font, crop, style }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: font * 0.45,
      padding: `${font * 0.42}px ${font * 0.8}px ${font * 0.42}px ${font * 0.6}px`,
      borderRadius: 999,
      background: "linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.12))",
      border: "1px solid rgba(255,255,255,0.42)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.35)",
      backdropFilter: "blur(10px)",
      whiteSpace: "nowrap",
      fontFamily: FONT.ui,
      fontWeight: 500,
      fontSize: font,
      color: "#fff",
      ...style,
    }}
  >
    <ToolLogo logo={logo} size={font * 1.15} crop={crop} />
    {name}
  </div>
);

// Inner feature chip — the site's white `rounded-pill bg-white shadow-md` chip.
export const FeatureChip: React.FC<{
  icon: LucideIcon;
  iconColor: string;
  label: string;
  font: number;
  style?: React.CSSProperties;
}> = ({ icon: Icon, iconColor, label, font, style }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: font * 0.4,
      padding: `${font * 0.36}px ${font * 0.75}px`,
      borderRadius: 999,
      backgroundColor: "#fff",
      boxShadow: "0 8px 22px rgba(10,25,18,0.28)",
      whiteSpace: "nowrap",
      fontFamily: FONT.ui,
      fontWeight: 600,
      fontSize: font,
      color: C.forest,
      ...style,
    }}
  >
    <Icon size={font * 1.05} color={iconColor} strokeWidth={2.2} />
    {label}
  </div>
);

export const LogoMark: React.FC<{ size: number; bloom?: number; style?: React.CSSProperties }> = ({
  size,
  bloom = 0,
  style,
}) => (
  <div style={{ position: "relative", width: size, height: size, ...style }}>
    {bloom > 0 ? (
      <div
        style={{
          position: "absolute",
          inset: -size * 0.9,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(197,213,184,${0.55 * bloom}) 0%, rgba(166,184,154,${0.22 * bloom}) 35%, transparent 68%)`,
          filter: "blur(6px)",
        }}
      />
    ) : null}
    <Img
      src={staticFile("brand/Logo.png")}
      style={{ position: "relative", width: size, height: size, objectFit: "contain" }}
    />
  </div>
);

// Connector: faint static line + brighter animated dashed overlay (duplicates the site).
export const Connector: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  frame: number;
  delayFrames: number;
  reach?: number;
  opacity?: number;
  dashColor?: string;
  staticColor?: string;
}> = ({ x1, y1, x2, y2, frame, delayFrames, reach = 1, opacity = 1, dashColor = C.sageLight, staticColor = C.sage }) => {
  const ex = x1 + (x2 - x1) * reach;
  const ey = y1 + (y2 - y1) * reach;
  // Site: strokeDasharray "4 20", dashoffset 0 -> -24 every 1.4s (42 frames), linear.
  const offset = -(((frame - delayFrames) % 42) / 42) * 24 * 1.5;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={staticColor} strokeOpacity={0.22} strokeWidth={1.5} />
      <line
        x1={x1}
        y1={y1}
        x2={ex}
        y2={ey}
        stroke={dashColor}
        strokeOpacity={0.6}
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeDasharray="6 30"
        strokeDashoffset={offset}
      />
    </g>
  );
};
