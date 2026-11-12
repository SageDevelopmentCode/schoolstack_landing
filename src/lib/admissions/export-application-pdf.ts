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

function mountElementForPdfCapture(element: HTMLElement): {
  container: HTMLDivElement;
  captureTarget: HTMLElement;
} {
  const container = document.createElement("div");
  Object.assign(container.style, PDF_CAPTURE_CONTAINER_STYLES);
  const captureTarget = element.cloneNode(true) as HTMLElement;
  container.appendChild(captureTarget);
  document.body.appendChild(container);
  return { container, captureTarget };
}

export async function exportApplicationPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;
  const safeName = sanitizePdfFilename(filename);
  const { container, captureTarget } = mountElementForPdfCapture(element);

  try {
    await html2pdf()
      .set({
        margin: [12, 12, 12, 12],
        filename: `${safeName}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: {
          scale: 1,
          useCORS: true,
          logging: false,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(captureTarget)
      .save();
  } finally {
    container.remove();
  }
}
