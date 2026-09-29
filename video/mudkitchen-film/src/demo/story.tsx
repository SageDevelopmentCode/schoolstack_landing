import React from "react";
import { Img, staticFile } from "remotion";
import { FONT } from "../theme";
import { STORY } from "./tokens";

// Web "School Day Story" primitives (ParentCard, ParentSectionKicker,
// ParentAttentionItem, ParentDisplayHeading) at website CSS pixels.

export const StoryKicker: React.FC<{ children: React.ReactNode; light?: boolean; admin?: boolean; style?: React.CSSProperties }> = ({
  children,
  light,
  admin,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT.storyBody,
      fontSize: admin ? 10 : 11,
      fontWeight: admin ? 800 : 700,
      letterSpacing: admin ? "0.13em" : "0.12em",
      textTransform: "uppercase",
      color: light ? STORY.kickerLight : admin ? STORY.adminKicker : STORY.kicker,
      marginBottom: admin ? 0 : 8,
      ...style,
    }}
  >
    {children}
  </div>
);

export const StoryHeading: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size,
  color = STORY.ink,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT.story,
      fontWeight: 600,
      fontSize: size,
      lineHeight: 1.15,
      letterSpacing: size > 24 ? "-0.04em" : "-0.02em",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

export const StoryCard: React.FC<{
  variant?: "default" | "today" | "primary";
  radius?: number;
  padding?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ variant = "default", radius = STORY.radiusCard, padding = 24, children, style }) => (
  <div
    style={{
      position: "relative",
      overflow: "hidden",
      border: `1px solid ${variant === "primary" ? "transparent" : STORY.cardBorder}`,
      borderRadius: radius,
      boxShadow: STORY.shadowCard,
      padding,
      background: variant === "today" ? STORY.todayGradient : variant === "primary" ? STORY.primary : STORY.white,
      color: variant === "primary" ? STORY.white : STORY.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

export const AttentionItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  iconBg?: string;
  first?: boolean;
  style?: React.CSSProperties;
}> = ({ icon, title, subtitle, iconBg = STORY.attentionBg, first, style }) => (
  <div
    style={{
      display: "flex",
      gap: 14,
      alignItems: subtitle ? "flex-start" : "center",
      borderTop: first ? "none" : `1px solid ${STORY.divider}`,
      padding: first ? "0 0 12px" : "12px 0",
      ...style,
    }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 13,
        backgroundColor: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontFamily: FONT.storyBody, fontSize: 14, fontWeight: 600, color: STORY.ink }}>{title}</div>
      {subtitle ? (
        <div style={{ fontFamily: FONT.storyBody, fontSize: 12, lineHeight: 1.6, color: "#76828A", marginTop: 2 }}>{subtitle}</div>
      ) : null}
    </div>
  </div>
);

export type AttendanceStatus = "present" | "picked_up" | "absent" | "not_marked";

const BADGE: Record<AttendanceStatus, { bg: string; fg: string; dot?: string; label: string }> = {
  present: { bg: "#ECFDF5", fg: "#059669", dot: "#10B981", label: "Present" },
  picked_up: { bg: "#F1F5F9", fg: "#64748B", dot: "#94A3B8", label: "Picked up" },
  absent: { bg: "#FFFBEB", fg: "#D97706", dot: "#FBBF24", label: "Absent" },
  not_marked: { bg: "#F9FAFB", fg: "#9CA3AF", label: "Not marked" },
};

export const AttendanceBadge: React.FC<{ status: AttendanceStatus; pop?: number }> = ({ status, pop = 1 }) => {
  const b = BADGE[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        borderRadius: 999,
        backgroundColor: b.bg,
        padding: "2px 8px",
        fontFamily: FONT.storyBody,
        fontSize: 10,
        fontWeight: 600,
        color: b.fg,
        whiteSpace: "nowrap",
        transform: `scale(${pop})`,
      }}
    >
      {b.dot ? <span style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: b.dot }} /> : null}
      {b.label}
    </span>
  );
};

// StudentPhoto: square photo tile on a child accent background, initials fallback.
export const StudentPhoto: React.FC<{
  name: string;
  photo?: string | null;
  size: number;
  radius?: number;
  bg?: string;
}> = ({ name, photo, size, radius = size * 0.3, bg = STORY.childBg[0] }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: radius,
      overflow: "hidden",
      backgroundColor: bg,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT.storyBody,
      fontWeight: 700,
      fontSize: size * 0.34,
      color: STORY.primary,
    }}
  >
    {photo ? (
      <Img src={staticFile(photo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    ) : (
      name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
    )}
  </div>
);

export const StoryButton: React.FC<{
  label: React.ReactNode;
  variant?: "primary" | "soft" | "clay";
  height?: number;
  radius?: number;
  fontSize?: number;
  style?: React.CSSProperties;
}> = ({ label, variant = "primary", height = 40, radius = STORY.radiusButton, fontSize = 13, style }) => (
  <div
    style={{
      height,
      borderRadius: radius,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      fontFamily: FONT.storyBody,
      fontWeight: 700,
      fontSize,
      backgroundColor: variant === "primary" ? STORY.primary : variant === "clay" ? STORY.clay : STORY.primaryLight,
      color: variant === "soft" ? STORY.primary : STORY.white,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {label}
  </div>
);
