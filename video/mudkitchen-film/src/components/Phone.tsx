import React from "react";
import { IoBatteryFull, IoCellular, IoWifi } from "react-icons/io5";
import { FONT } from "../theme";
import { STORY } from "../demo/tokens";

// iPhone-style device. Children are laid out in React Native points
// (`designWidth` wide, like the Expo app) and scaled to the screen.
export const PHONE_DESIGN_WIDTH = 375;
export const STATUS_BAR_H = 50;
export const HOME_INDICATOR_H = 34;

export const Phone: React.FC<{
  width: number;
  height: number;
  screen?: string;
  statusTone?: "dark" | "light";
  designWidth?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, height, screen = STORY.paper, statusTone = "dark", designWidth = PHONE_DESIGN_WIDTH, children, style }) => {
  const bezel = width * 0.032;
  const r = width * 0.16;
  const screenW = width - bezel * 2;
  const screenH = height - bezel * 2;
  const s = screenW / designWidth;
  const ink = statusTone === "light" ? "#FFFFFF" : "#111111";
  return (
    <div
      style={{
        width,
        height,
        borderRadius: r,
        padding: bezel,
        background: "linear-gradient(145deg, #2a3a31 0%, #16211b 55%, #243329 100%)",
        boxShadow:
          "0 60px 120px rgba(43,36,29,0.22), 0 18px 36px rgba(43,36,29,0.14), inset 0 0 0 1.5px rgba(255,255,255,0.10)",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          width: screenW,
          height: screenH,
          borderRadius: r - bezel,
          backgroundColor: screen,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: designWidth,
            height: screenH / s,
            transform: `scale(${s})`,
            transformOrigin: "top left",
          }}
        >
          {children}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: STATUS_BAR_H,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 30px 0 34px",
              fontFamily: FONT.storyBody,
              fontWeight: 600,
              fontSize: 15,
              color: ink,
              zIndex: 50,
            }}
          >
            <span style={{ letterSpacing: "-0.01em" }}>9:41</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <IoCellular size={15} color={ink} />
              <IoWifi size={15} color={ink} />
              <IoBatteryFull size={22} color={ink} />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: designWidth / 2 - 62,
              top: 11,
              width: 124,
              height: 35,
              borderRadius: 99,
              backgroundColor: "#0B0F0D",
              zIndex: 51,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: designWidth / 2 - 67,
              bottom: 8,
              width: 134,
              height: 5,
              borderRadius: 99,
              backgroundColor: "rgba(17,17,17,0.85)",
              zIndex: 51,
            }}
          />
        </div>
      </div>
    </div>
  );
};
