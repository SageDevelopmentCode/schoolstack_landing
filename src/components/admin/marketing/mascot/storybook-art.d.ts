export type MascotName =
  | "terra" | "pip" | "nutmeg" | "fennel" | "clover" | "marigold"
  | "dig" | "loam" | "dot" | "flicker" | "bramble" | "tansy";

export type MascotView =
  | "neutral" | "happy" | "laughing" | "excited" | "curious" | "thinking" | "surprised"
  | "silly" | "wink" | "love" | "shy" | "sleepy" | "oops" | "determined" | "confused"
  | "cheeky" | "tears" | "wave" | "celebrate" | "thumbs" | "point" | "hold" | "highfive"
  | "run" | "sit" | "peek";

export const MASCOT_NAMES: MascotName[];
export const MASCOT_VIEWS: MascotView[];
export function renderMascotSvg(
  name: MascotName,
  view?: MascotView,
  opts?: { ground?: boolean },
): string;
