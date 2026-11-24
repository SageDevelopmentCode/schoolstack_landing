import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { CLAMP } from "../theme";
import { DREAM_FONT, GRADE, SLATE_COLOR } from "./look";
import { DREAM_FPS } from "./edl";
import type { ShotSpec } from "./shots";

export const clipPath = (id: string) => `footage/dream/${id}.mp4`;

// Placeholder for a clip that hasn't been dropped in yet: shot id, what it must
// show, and the file it expects. The words and tags still play on top.
const Slate: React.FC<{ spec: ShotSpec; n: number; frames: number }> = ({ spec, n, frames }) => {
  const f = useCurrentFrame();
  const drift = interpolate(f, [0, Math.max(1, frames)], [0, 40]);
  return (
    <AbsoluteFill style={{ backgroundColor: SLATE_COLOR[spec.act] ?? "#222" }}>
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 46px)`,
          backgroundPosition: `${drift}px 0`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 250,
          fontFamily: DREAM_FONT.mono,
          color: "rgba(247,241,231,0.55)",
          fontSize: 30,
          lineHeight: 1.45,
        }}
      >
        <div style={{ fontSize: 34, color: "rgba(247,241,231,0.8)" }}>
          {String(n).padStart(2, "0")} · {spec.id} · {spec.act.toUpperCase()}
        </div>
        <div style={{ marginTop: 14 }}>{spec.what}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          bottom: 420,
          fontFamily: DREAM_FONT.mono,
          fontSize: 24,
          color: "rgba(247,241,231,0.35)",
        }}
      >
        missing: public/{clipPath(spec.id)}
      </div>
    </AbsoluteFill>
  );
};

// Warm light leak rolling in from one edge, burned over the shot.
const Leak: React.FC<{ frames: number; seed: string }> = ({ frames, seed }) => {
  const f = useCurrentFrame();
  const side = random(seed) > 0.5 ? 100 : 0;
  const o = interpolate(f, [0, frames * 0.35, frames], [0, 0.55, 0.15], CLAMP);
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: o,
        background: `radial-gradient(60% 45% at ${side}% ${30 + f * 0.4}%, rgba(255,150,70,0.9), rgba(255,90,40,0.35) 40%, transparent 72%)`,
      }}
    />
  );
};

export const DreamShot: React.FC<{
  spec: ShotSpec;
  n: number;
  frames: number;
  available: boolean;
  srcIn?: number;
}> = ({ spec, n, frames, available, srcIn = 0 }) => {
  const f = useCurrentFrame();
  const [z0, z1] = spec.zoom ?? [1, 1.04];
  const zoom = interpolate(f, [0, frames], [z0, z1], CLAMP);
  const focus = spec.focus ?? { x: 0.5, y: 0.5 };
  // Gate weave: a pixel or two of drift, held for 2 frames, like a film gate.
  const step = Math.floor(f / 2);
  const wx = (random(`${spec.id}-x-${step}`) - 0.5) * 3;
  const wy = (random(`${spec.id}-y-${step}`) - 0.5) * 3;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0b09", overflow: "hidden" }}>
      {available ? (
        <OffthreadVideo
          src={staticFile(clipPath(spec.id))}
          trimBefore={Math.round(srcIn * DREAM_FPS)}
          playbackRate={spec.rate ?? 1}
          muted
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${focus.x * 100}% ${focus.y * 100}%`,
            transform: `translate(${wx}px, ${wy}px) scale(${zoom})`,
            transformOrigin: `${focus.x * 100}% ${focus.y * 100}%`,
            filter: GRADE,
          }}
        />
      ) : (
        <Slate spec={spec} n={n} frames={frames} />
      )}
      {spec.leak ? <Leak frames={frames} seed={spec.id} /> : null}
    </AbsoluteFill>
  );
};
