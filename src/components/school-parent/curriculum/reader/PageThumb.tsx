"use client";

import { useEffect, useRef, useState } from "react";
import PageCanvas from "./PageCanvas";
import type { PDFDocumentProxy } from "./pdfjs";
import type { CurriculumPageSize } from "./useCurriculumDocument";

/**
 * Low-resolution page preview that renders only once scrolled into view
 * (so a 300-page book doesn't fetch 300 pages up front).
 */
export default function PageThumb({
  doc,
  page,
  firstPage,
  width,
  className = "",
  organizationId,
}: {
  doc: PDFDocumentProxy;
  page: number;
  firstPage: CurriculumPageSize;
  width: number;
  className?: string;
  organizationId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      <PageCanvas
        doc={doc}
        pageNumber={page}
        width={width}
        fallbackHeight={Math.round((width * firstPage.height) / firstPage.width)}
        active={visible}
        thumbnail
        organizationId={organizationId}
        className="rounded-[4px] ring-1 ring-[var(--sf-ink)]/12"
      />
    </div>
  );
}
