import {
  BarChart2,
  CalendarDays,
  CreditCard,
  FilePen,
  FolderOpen,
  Globe,
  MessageSquare,
  Receipt,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

// Ported 1:1 from src/components/sections/PainSection.tsx (site hub diagram).
// SVG coordinate space: 1000 x 680, center (500, 340).
// Outer ring rx=390 ry=240 | inner ring rx=140 ry=105.
export const HUB_W = 1000;
export const HUB_H = 680;
export const HUB_CENTER = { x: 500, y: 340 };
export const OUTER_PILL_RX = 38;
export const OUTER_PILL_RY = 11;

export type HubPair = {
  tool: string;
  logo: string;
  feature: string;
  icon: LucideIcon;
  iconColor: string;
  outer: { x: number; y: number };
  inner: { x: number; y: number };
  // Seconds, exactly as on the site (wave from the top, both sides, bottom last).
  delay: number;
  // Fractional crop box for padded wordmark assets (x, y, w of the icon within the image).
  logoCrop?: { x: number; y: number; w: number };
};

export const PAIRS: HubPair[] = [
  { tool: "Google Forms", logo: "brand/competitors/GoogleForms.png", feature: "Enrollment", icon: UserPlus, iconColor: "#2563EB", outer: { x: 500, y: 100 }, inner: { x: 500, y: 235 }, delay: 0 },
  { tool: "Venmo", logo: "brand/competitors/Venmo.png", feature: "Payments", icon: CreditCard, iconColor: "#059669", outer: { x: 740, y: 168 }, inner: { x: 582, y: 255 }, delay: 0.2 },
  { tool: "PayPal", logo: "brand/competitors/Paypal.svg", feature: "Billing", icon: Receipt, iconColor: "#7C3AED", outer: { x: 876, y: 253 }, inner: { x: 633, y: 308 }, delay: 0.4 },
  { tool: "Gmail", logo: "brand/competitors/Gmail.png", feature: "Messaging", icon: MessageSquare, iconColor: "#0284C7", outer: { x: 876, y: 427 }, inner: { x: 633, y: 372 }, delay: 0.6 },
  { tool: "DocuSign", logo: "brand/competitors/DocuSign.png", feature: "Contracts", icon: FilePen, iconColor: "#4F46E5", outer: { x: 740, y: 512 }, inner: { x: 582, y: 425 }, delay: 0.8 },
  { tool: "Calendly", logo: "brand/competitors/Calendly.webp", feature: "Calendar", icon: CalendarDays, iconColor: "#DC2626", outer: { x: 500, y: 580 }, inner: { x: 500, y: 445 }, delay: 1.0, logoCrop: { x: 0.07, y: 0.405, w: 0.175 } },
  { tool: "Google Drive", logo: "brand/competitors/GoogleDrive.png", feature: "Files", icon: FolderOpen, iconColor: "#D97706", outer: { x: 260, y: 512 }, inner: { x: 418, y: 425 }, delay: 0.8 },
  { tool: "Google Docs", logo: "brand/competitors/GoogleDocs.png", feature: "Staff", icon: Users, iconColor: "#0D9488", outer: { x: 124, y: 427 }, inner: { x: 367, y: 372 }, delay: 0.6 },
  { tool: "Google Sheets", logo: "brand/competitors/GoogleSheets.png", feature: "Reports", icon: BarChart2, iconColor: "#4338CA", outer: { x: 124, y: 253 }, inner: { x: 367, y: 308 }, delay: 0.4 },
  { tool: "Wix", logo: "brand/competitors/Wix.png", feature: "Website", icon: Globe, iconColor: "#A05C45", outer: { x: 260, y: 168 }, inner: { x: 418, y: 255 }, delay: 0.2 },
];

// 9:16 keeps six tools, re-spaced evenly on a tall ellipse so nothing crowds the edges.
const VERTICAL_KEEP = ["Google Forms", "Venmo", "Gmail", "Calendly", "Google Sheets", "DocuSign"];
const VERTICAL_ANGLES: Record<string, number> = {
  "Google Forms": -90,
  Venmo: -30,
  Gmail: 30,
  Calendly: 90,
  DocuSign: 150,
  "Google Sheets": 210,
};

export type PlacedPair = HubPair & {
  // Frame-space positions (px), relative to the hub center.
  o: { x: number; y: number };
  i: { x: number; y: number };
  angle: number;
};

export type HubLayout = {
  pairs: PlacedPair[];
  outerRx: number;
  outerRy: number;
  innerRx: number;
  innerRy: number;
  pillFont: number;
  chipFont: number;
};

export function hubLayout(vertical: boolean): HubLayout {
  if (!vertical) {
    const s = 1.5;
    return {
      pairs: PAIRS.map((p) => ({
        ...p,
        o: { x: (p.outer.x - HUB_CENTER.x) * s, y: (p.outer.y - HUB_CENTER.y) * s },
        i: { x: (p.inner.x - HUB_CENTER.x) * s, y: (p.inner.y - HUB_CENTER.y) * s },
        angle: Math.atan2(p.outer.y - HUB_CENTER.y, p.outer.x - HUB_CENTER.x),
      })),
      outerRx: 390 * s,
      outerRy: 240 * s,
      innerRx: 140 * s,
      innerRy: 105 * s,
      pillFont: 22,
      chipFont: 18,
    };
  }
  const outerRx = 330;
  const outerRy = 470;
  const innerRx = 170;
  const innerRy = 215;
  return {
    pairs: PAIRS.filter((p) => VERTICAL_KEEP.includes(p.tool)).map((p) => {
      const deg = VERTICAL_ANGLES[p.tool];
      const a = (deg * Math.PI) / 180;
      const fromTop = Math.abs(deg + 90);
      return {
        ...p,
        // Same symmetric wave as the site: top first, both sides, bottom last (0-1.0s).
        delay: Math.min(fromTop, 360 - fromTop) / 180,
        o: { x: Math.cos(a) * outerRx, y: Math.sin(a) * outerRy },
        i: { x: Math.cos(a) * innerRx, y: Math.sin(a) * innerRy },
        angle: a,
      };
    }),
    outerRx,
    outerRy,
    innerRx,
    innerRy,
    pillFont: 28,
    chipFont: 24,
  };
}

// Point on an elliptical pill edge facing `to` — same math as the site's pillEdge().
export function pillEdge(
  from: { x: number; y: number },
  to: { x: number; y: number },
  rx: number,
  ry: number,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return from;
  const nx = dx / len;
  const ny = dy / len;
  const scale = 1 / Math.sqrt((nx / rx) ** 2 + (ny / ry) ** 2);
  return { x: from.x + nx * scale, y: from.y + ny * scale };
}

// Quadratic Bezier with a tangential control point, used for the spiral collapse.
export function spiralPoint(
  start: { x: number; y: number },
  t: number,
  swirl = 0.55,
) {
  const cx = -start.y * swirl + start.x * 0.35;
  const cy = start.x * swirl + start.y * 0.35;
  const u = 1 - t;
  return {
    x: u * u * start.x + 2 * u * t * cx,
    y: u * u * start.y + 2 * u * t * cy,
  };
}
