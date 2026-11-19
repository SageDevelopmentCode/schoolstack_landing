import { toPng } from "html-to-image";

/**
 * Rasterises a full-size, off-screen design node to a PNG data URL at exactly width × height.
 * Nodes marked `data-marketing-export-ignore="true"` and fixed-position nodes (preview chrome) are skipped.
 */
export async function nodeToPng(node: HTMLElement, width: number, height: number): Promise<string> {
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 1,
    width,
    height,
    canvasWidth: width,
    canvasHeight: height,
    skipAutoScale: true,
    filter: (domNode) => {
      if (!(domNode instanceof HTMLElement)) return true;
      if (domNode.dataset.marketingExportIgnore === "true") return false;
      return window.getComputedStyle(domNode).position !== "fixed";
    },
  });
}

/** Triggers a browser download of a data or object URL. */
export function downloadUrl(href: string, fileName: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.click();
}

/** `data:image/png;base64,AAAA` → `AAAA` (throws on an empty export). */
export function dataUrlBase64(dataUrl: string): string {
  const base64 = dataUrl.split(",")[1];
  if (!base64) throw new Error("Export returned an empty image.");
  return base64;
}
