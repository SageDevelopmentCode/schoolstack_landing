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
  opts?: { ground?: boolean; shadow?: boolean },
): string;
export function renderMascotIconSvg(name: MascotName, bg?: 0 | 1, opts?: { square?: boolean }): string;
export function mascotIconBackgrounds(name: MascotName): [string, string];
