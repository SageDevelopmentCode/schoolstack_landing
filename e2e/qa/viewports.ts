export const PORTAL_QA_VIEWPORTS = [
  { name: "mobile", width: 375, height: 812, minHeightRatio: 0.35, minPx: 200 },
  { name: "tablet", width: 768, height: 1024, minHeightRatio: 0.35, minPx: 280 },
  { name: "desktop", width: 1280, height: 800, minHeightRatio: 0.3, minPx: 280 },
] as const;

export type PortalQaViewport = (typeof PORTAL_QA_VIEWPORTS)[number];
