export function sanitizePdfFilename(name: string): string {
  return name
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 120) || "application";
}

const PDF_CAPTURE_CONTAINER_STYLES: Partial<CSSStyleDeclaration> = {
  position: "fixed",
  left: "0",
  top: "0",
  width: "800px",
  opacity: "0",
  pointerEvents: "none",
  zIndex: "-1",
};

/** How long the capture's own images get to load before they are dropped. */
const CAPTURE_IMAGE_TIMEOUT_MS = 10_000;
/** Last-resort cap so a stalled export shows an error instead of spinning. */
const PDF_EXPORT_TIMEOUT_MS = 45_000;

function mountElementForPdfCapture(element: HTMLElement): {
  container: HTMLDivElement;
  captureTarget: HTMLElement;
} {
  const container = document.createElement("div");
  Object.assign(container.style, PDF_CAPTURE_CONTAINER_STYLES);
  const captureTarget = element.cloneNode(true) as HTMLElement;
  // next/image defaults to lazy loading; the capture must load everything.
  for (const img of Array.from(captureTarget.querySelectorAll("img"))) {
    img.loading = "eager";
  }
  container.appendChild(captureTarget);
  document.body.appendChild(container);
  return { container, captureTarget };
}

function waitForImage(img: HTMLImageElement): Promise<void> {
  if (img.complete || !img.src) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });
}

/**
 * html2canvas waits for every <img> in its document clone with no timeout,
 * so one image that never loads stalls the export forever. Give the capture's
 * images a bounded wait, then drop any that still haven't loaded.
 */
async function settleCaptureImages(captureTarget: HTMLElement): Promise<void> {
  const images = Array.from(captureTarget.querySelectorAll("img"));
  if (images.length === 0) return;
  await Promise.race([
    Promise.all(images.map(waitForImage)),
    new Promise((resolve) => setTimeout(resolve, CAPTURE_IMAGE_TIMEOUT_MS)),
  ]);
  for (const img of images) {
    if (!img.complete) img.remove();
  }
}

/** html2pdf.js copies the source into this overlay on <body> and captures it. */
const HTML2PDF_OVERLAY_CLASS = "html2pdf__overlay";

/**
 * html2canvas clones the whole page before rendering the target. Skip every
 * top-level <body> child except html2pdf's overlay, so the rest of the app
 * (sidebar images, drawers, overlays) can't slow or stall the export. <head>
 * is kept, so styles and fonts still apply.
 */
function ignoreAllButPdfOverlay(node: Element): boolean {
  return (
    node.parentElement === document.body &&
    !node.classList.contains(HTML2PDF_OVERLAY_CLASS)
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`PDF export timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function exportApplicationPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;
  const safeName = sanitizePdfFilename(filename);
  const { container, captureTarget } = mountElementForPdfCapture(element);

  try {
    await withTimeout(
      (async () => {
        await settleCaptureImages(captureTarget);
        await html2pdf()
          .set({
            margin: [12, 12, 12, 12],
            filename: `${safeName}.pdf`,
            image: { type: "jpeg", quality: 0.95 },
            html2canvas: {
              scale: 1,
              useCORS: true,
              logging: false,
              ignoreElements: ignoreAllButPdfOverlay,
            },
            jsPDF: {
              unit: "mm",
              format: "a4",
              orientation: "portrait",
            },
          })
          .from(captureTarget)
          .save();
      })(),
      PDF_EXPORT_TIMEOUT_MS,
    );
  } finally {
    container.remove();
  }
}
