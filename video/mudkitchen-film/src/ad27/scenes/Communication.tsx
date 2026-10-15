import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { CLAMP, EXPO_IN_OUT, EXPO_OUT, SOFT_IN_OUT } from "../../theme";
import { useLayout } from "../../components/layout";
import { DemoFrame } from "../../demo/DemoFrame";
import { COVER_PHOTO, NewsletterEditor, TeacherUpdateCard, newsletterTargets } from "../demo/NewsletterEditor";
import { HIT } from "../timeline";
import { editorGeom, toCanvas, useAdFrame } from "../stage";

const CARD_W = 250;
// TeacherUpdateCard height at CARD_W (two-line preview).
const CARD_H = 92;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// A teacher update and a classroom photo slide in, line up, then drop into the
// newsletter: the update into Sam's class update, the photo into the cover image.
export const Communication: React.FC<{ from: number }> = ({ from }) => {
  const f = useAdFrame(from);
  const L = useLayout();
  const g = editorGeom(L);
  const s = g.w / g.dw;
  const tg = newsletterTargets(g.dw);

  const enter = interpolate(f, [HIT.commsIn, HIT.commsIn + 16], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const editorX = (1 - enter) * L.W * 0.9;

  const cs = L.vertical ? 2.5 : 1.8;
  const updW = CARD_W * cs;
  const photo = L.vertical ? { w: 440, h: 300 } : { w: 340, h: 232 };
  const align = L.vertical
    ? { upd: { x: L.cx, y: 720 }, pho: { x: L.cx, y: 1090 } }
    : { upd: { x: 720, y: 470 }, pho: { x: 1210, y: 470 } };
  const inP = interpolate(f, [HIT.cardsIn, HIT.cardsAlign], [0, 1], { ...CLAMP, easing: EXPO_OUT });
  const copied = f >= HIT.dockUpdate - 10;

  const updFly = interpolate(f, [HIT.dockUpdate - 10, HIT.dockUpdate + 2], [0, 1], { ...CLAMP, easing: EXPO_IN_OUT });
  const phoFly = interpolate(f, [HIT.dockPhoto - 10, HIT.dockPhoto + 2], [0, 1], { ...CLAMP, easing: EXPO_IN_OUT });
  const updateFill = interpolate(f, [HIT.dockUpdate, HIT.dockUpdate + 12], [0, 1], CLAMP);
  const photoFill = interpolate(f, [HIT.dockPhoto, HIT.dockPhoto + 10], [0, 1], { ...CLAMP, easing: EXPO_OUT });

  const samT = toCanvas(g, g.dw, { x: tg.samText.x + tg.samText.w / 2, y: tg.samText.y + tg.samText.h / 2 });
  const coverT = toCanvas(g, g.dw, { x: tg.cover.x + tg.cover.w / 2, y: tg.cover.y + tg.cover.h / 2 });

  const updStart = { x: -updW, y: align.upd.y };
  const phoStart = { x: L.W + photo.w, y: align.pho.y };
  const upd = {
    x: lerp(lerp(updStart.x, align.upd.x, inP), samT.x, updFly),
    y: lerp(lerp(updStart.y, align.upd.y, inP), samT.y, updFly),
    scale: lerp(1, (tg.samText.w * s) / updW, updFly),
    opacity: interpolate(updFly, [0.7, 1], [1, 0], CLAMP),
  };
  const pho = {
    x: lerp(lerp(phoStart.x, align.pho.x, inP), coverT.x, phoFly),
    y: lerp(lerp(phoStart.y, align.pho.y, inP), coverT.y, phoFly),
    scale: lerp(1, (tg.cover.w * s) / photo.w, phoFly),
    opacity: interpolate(phoFly, [0.75, 1], [1, 0], CLAMP),
  };
  const scrim = interpolate(f, [HIT.cardsIn, HIT.cardsAlign, HIT.dockUpdate - 6, HIT.dockPhoto + 4], [0, 0.2, 0.2, 0], CLAMP);

  const zMax = L.vertical ? 1.08 : 1.05;
  const z = interpolate(f, [HIT.dockPhoto + 2, HIT.commsOut], [1, zMax], { ...CLAMP, easing: SOFT_IN_OUT });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${samT.x}px ${samT.y}px`, transform: `translateX(${editorX}px) scale(${z})` }}>
        <div style={{ position: "absolute", left: g.left, top: g.top }}>
          <DemoFrame width={g.w} height={g.h} designWidth={g.dw}>
            <NewsletterEditor dw={g.dw} height={g.h / s} updateFill={updateFill} photoFill={photoFill} />
          </DemoFrame>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(43,36,29,${scrim})` }} />

      <div
        style={{
          position: "absolute",
          visibility: updFly < 1 ? "visible" : "hidden",
          left: upd.x - updW / 2,
          top: upd.y - (CARD_H * cs) / 2,
          width: updW,
          height: CARD_H * cs,
          transform: `scale(${upd.scale})`,
          opacity: upd.opacity,
        }}
      >
        <div style={{ width: CARD_W, transform: `scale(${cs})`, transformOrigin: "top left", boxShadow: "0 14px 34px rgba(43,36,29,0.16)", borderRadius: 6 }}>
          <TeacherUpdateCard copied={copied} width={CARD_W} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          visibility: phoFly < 1 ? "visible" : "hidden",
          left: pho.x - photo.w / 2,
          top: pho.y - photo.h / 2,
          width: photo.w,
          height: photo.h,
          borderRadius: 14,
          overflow: "hidden",
          border: "6px solid #fff",
          boxShadow: "0 24px 50px rgba(43,36,29,0.22)",
          transform: `scale(${pho.scale}) rotate(${(1 - inP) * 4}deg)`,
          opacity: pho.opacity,
        }}
      >
        <Img src={staticFile(COVER_PHOTO)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
};
