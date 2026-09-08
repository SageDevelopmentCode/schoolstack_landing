import type { PDFDocumentProxy } from "pdfjs-dist";

export type PdfOutlineItem = {
  title: string;
  dest: string | unknown[] | null;
  items?: PdfOutlineItem[];
};

export async function loadPdfOutline(
  pdfDoc: PDFDocumentProxy,
): Promise<PdfOutlineItem[] | null> {
  const getOutline = (
    pdfDoc as PDFDocumentProxy & {
      getOutline?: () => Promise<PdfOutlineItem[] | null>;
    }
  ).getOutline;

  if (!getOutline) return null;

  const outline = await getOutline.call(pdfDoc);
  if (!outline || outline.length === 0) return null;
  return outline;
}

export async function resolveDestToPageNumber(
  pdfDoc: PDFDocumentProxy,
  dest: string | unknown[] | null | undefined,
): Promise<number | null> {
  if (dest == null) return null;

  const getDestination = (
    pdfDoc as PDFDocumentProxy & {
      getDestination?: (id: string) => Promise<unknown[] | null>;
    }
  ).getDestination;
  const getPageIndex = (
    pdfDoc as PDFDocumentProxy & {
      getPageIndex?: (ref: unknown) => Promise<number>;
    }
  ).getPageIndex;

  if (!getPageIndex) return null;

  let explicitDest: unknown = dest;
  if (typeof dest === "string") {
    if (!getDestination) return null;
    explicitDest = await getDestination.call(pdfDoc, dest);
  }

  if (!Array.isArray(explicitDest) || explicitDest.length === 0) return null;

  const pageIndex = await getPageIndex.call(pdfDoc, explicitDest[0]);
  if (!Number.isInteger(pageIndex) || pageIndex < 0) return null;
  return pageIndex + 1;
}
