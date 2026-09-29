import React from "react";
import { Easing, interpolate } from "remotion";
import { CLAMP } from "../theme";
import { ADMIN, SITE, STORY } from "./tokens";

// Same card the homepage wraps each portal demo in (LandingScaledDemoFrame):
// rounded-2xl, 1px border-default, soft long shadow, no browser chrome.
// Children are laid out at website CSS pixels (`designWidth` wide) and scaled up.
export const DemoFrame: React.FC<{
  width: number;
  height: number;
  designWidth: number;
  background?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, height, designWidth, background = "#FFFFFF", children, style }) => {
  const s = width / designWidth;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 16 * s,
        border: `${Math.max(1, s)}px solid ${SITE.border}`,
        boxShadow: SITE.frameShadow,
        backgroundColor: background,
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: designWidth,
          height: height / s,
          transform: `scale(${s})`,
          transformOrigin: "top left",
          display: "flex",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export type CursorStop = { at: number; x: number; y: number; click?: boolean };

const MOVE = 14;
const glide = Easing.bezier(0.4, 0, 0.2, 1);
const ease = (t: number) => glide(Math.min(1, Math.max(0, t)));

// Autoplay tour cursor from the website demos: glides to each stop, pulses on click.
export const DemoCursor: React.FC<{
  f: number;
  stops: CursorStop[];
  variant?: "admin" | "teacher";
  appear?: number;
}> = ({ f, stops, variant = "admin", appear = 6 }) => {
  if (stops.length === 0) return null;
  let x = stops[0].x;
  let y = stops[0].y;
  for (let i = 1; i < stops.length; i += 1) {
    const s = stops[i];
    const t = ease((f - (s.at - MOVE)) / MOVE);
    if (f >= s.at - MOVE) {
      x = stops[i - 1].x + (s.x - stops[i - 1].x) * t;
      y = stops[i - 1].y + (s.y - stops[i - 1].y) * t;
    }
  }
  let press = 0;
  for (const s of stops) {
    if (s.click) press = Math.max(press, interpolate(f, [s.at, s.at + 4, s.at + 10], [0, 1, 0], CLAMP));
  }
  const opacity = interpolate(f, [stops[0].at - appear, stops[0].at], [0, 1], CLAMP);
  const size = variant === "admin" ? 18 : 20;
  const scale = variant === "admin" ? 1 + press * 0.6 : 1 - press * 0.3;
  const color = variant === "admin" ? ADMIN.cursor : STORY.teacherAccent;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: 999,
        backgroundColor: color,
        boxShadow: variant === "admin" ? ADMIN.cursorGlow : "0 0 0 3px rgba(46,74,60,0.25), 0 2px 8px rgba(46,74,60,0.4)",
        transform: `scale(${scale})`,
        opacity,
        zIndex: 100,
        pointerEvents: "none",
      }}
    />
  );
};

// Tweened number for metric count-ups.
export const countUp = (f: number, from: number, dur: number, value: number) =>
  value * interpolate(f, [from, from + dur], [0, 1], { ...CLAMP, easing: (t) => 1 - Math.pow(1 - t, 3) });
