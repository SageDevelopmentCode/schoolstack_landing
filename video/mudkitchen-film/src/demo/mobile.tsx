import React from "react";
import {
  IoCalendar,
  IoCalendarOutline,
  IoCard,
  IoCardOutline,
  IoChatbubble,
  IoChatbubbleOutline,
  IoEllipsisHorizontal,
  IoEllipsisHorizontalOutline,
  IoHome,
  IoHomeOutline,
} from "react-icons/io5";
import { FONT } from "../theme";
import { ADMIN, STORY } from "./tokens";

export type ParentTab = "home" | "billing" | "messages" | "calendar" | "more";

const TABS: { id: ParentTab; label: string; icon: React.ElementType; active: React.ElementType }[] = [
  { id: "home", label: "Home", icon: IoHomeOutline, active: IoHome },
  { id: "billing", label: "Billing", icon: IoCardOutline, active: IoCard },
  { id: "messages", label: "Messages", icon: IoChatbubbleOutline, active: IoChatbubble },
  { id: "calendar", label: "Calendar", icon: IoCalendarOutline, active: IoCalendar },
  { id: "more", label: "More", icon: IoEllipsisHorizontalOutline, active: IoEllipsisHorizontal },
];

// ParentFloatingTabBar: 60pt row floating 4pt above the home indicator.
export const MobileTabBar: React.FC<{ active: ParentTab; unread?: number; press?: number }> = ({ active, unread = 0, press = 0 }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 110,
        background: `linear-gradient(180deg, rgba(248,248,243,0) 0%, ${STORY.paper} 34%)`,
        zIndex: 29,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 20,
        right: 20,
        bottom: 38,
        height: 60,
        display: "flex",
        gap: 4,
        zIndex: 30,
      }}
    >
      {TABS.map((t) => {
        const on = t.id === active;
        const Icon = on ? t.active : t.icon;
        const color = on ? ADMIN.accent : ADMIN.textTertiary;
        return (
          <div
            key={t.id}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              padding: "6px 2px",
              borderRadius: 12,
              backgroundColor: on ? ADMIN.accentLight : "transparent",
              transform: on ? `scale(${1 - press * 0.06})` : undefined,
            }}
          >
            <div style={{ position: "relative" }}>
              <Icon size={20} color={color} />
              {t.id === "messages" && unread > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -8,
                    minWidth: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: ADMIN.accent,
                    color: "#fff",
                    fontFamily: FONT.storyBody,
                    fontSize: 8,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                  }}
                >
                  {unread}
                </div>
              ) : null}
            </div>
            <div style={{ fontFamily: FONT.storyBody, fontWeight: 700, fontSize: 9, lineHeight: "11px", color }}>{t.label}</div>
          </div>
        );
      })}
    </div>
  </>
);

// StoryChip tones used across the app.
export const MobileChip: React.FC<{ label: string; tone: "success" | "info" | "warning" | "neutral"; style?: React.CSSProperties }> = ({
  label,
  tone,
  style,
}) => {
  const t =
    tone === "success"
      ? { bg: "#E6F2E8", fg: "#2F6B45" }
      : tone === "info"
        ? { bg: "#E3EEF5", fg: "#2F6480" }
        : tone === "warning"
          ? { bg: "#FBEFD9", fg: "#9A6A12" }
          : { bg: "#EEF1EC", fg: STORY.muted };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "3px 9px",
        backgroundColor: t.bg,
        color: t.fg,
        fontFamily: FONT.storyBody,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {label}
    </span>
  );
};

// StoryPillNav (billing sections, calendar views).
export const MobilePillNav: React.FC<{ items: string[]; active: number }> = ({ items, active }) => (
  <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 14, backgroundColor: "#EEF2EE" }}>
    {items.map((it, i) => (
      <div
        key={it}
        style={{
          flex: "1 1 auto",
          textAlign: "center",
          padding: "7px 6px",
          borderRadius: 10,
          whiteSpace: "nowrap",
          fontFamily: FONT.storyBody,
          fontSize: 12,
          fontWeight: 700,
          color: i === active ? STORY.primary : STORY.muted,
          backgroundColor: i === active ? STORY.white : "transparent",
          boxShadow: i === active ? STORY.shadowPill : "none",
        }}
      >
        {it}
      </div>
    ))}
  </div>
);
