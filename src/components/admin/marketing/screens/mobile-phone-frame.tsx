import type { CSSProperties, ReactNode } from "react";

export const MOBILE_PHONE_WIDTH = 390;
export const MOBILE_PHONE_HEIGHT = 844;

type MobilePhoneFrameProps = {
  children: ReactNode;
  scale?: number;
  style?: CSSProperties;
};

export function MobilePhoneFrame({ children, scale = 1, style }: MobilePhoneFrameProps) {
  const scaledWidth = MOBILE_PHONE_WIDTH * scale;
  const scaledHeight = MOBILE_PHONE_HEIGHT * scale;

  return (
    <div
      style={{
        width: scaledWidth,
        height: scaledHeight,
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          width: MOBILE_PHONE_WIDTH,
          height: MOBILE_PHONE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          borderRadius: 44,
          background: "#1A1A1A",
          padding: 10,
          boxSizing: "border-box",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 36,
            overflow: "hidden",
            background: "#F6F3EC",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div
            style={{
              height: 44,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#F6F3EC",
            }}
          >
            <div style={{ width: 108, height: 28, borderRadius: 20, background: "#1A1A1A" }} />
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>{children}</div>
          <div
            style={{
              height: 28,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#F6F3EC",
            }}
          >
            <div style={{ width: 120, height: 4, borderRadius: 999, background: "#D8D0C4" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
