"use client";

import { useLayoutEffect, useRef, useState } from "react";
import PageCanvas from "./PageCanvas";
import type { PDFDocumentProxy } from "./pdfjs";
import type { CurriculumPageSize } from "./useCurriculumDocument";

/**
 * One page fitted inside its box (both width and height), for Present. The
 * pages either side stay mounted (stacked, hidden) under stable keys, so a
 * flip shows an already-painted canvas instead of a blank one.
 */
export default function SinglePageView({
  doc,
  page,
  numPages,
  firstPage,
  padding = 16,
  className = "",
  pageClassName = "",
}: {
  doc: PDFDocumentProxy;
  page: number;
  numPages: number;
  firstPage: CurriculumPageSize;
  padding?: number;
  className?: string;
  pageClassName?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const node = boxRef.current;
    if (!node) return;
    const measure = () => setBox({ width: node.clientWidth, height: node.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const aspect = firstPage.height / firstPage.width;
  const width = Math.max(
    120,
    Math.floor(Math.min(box.width - padding * 2, (box.height - padding * 2) / aspect)),
  );

  return (
    <div ref={boxRef} className={`relative flex min-h-0 flex-1 items-center justify-center overflow-hidden ${className}`}>
      {box.width > 0 ? (
        <div className="grid place-items-center">
          {[page - 1, page, page + 1]
            .filter((pageNumber) => pageNumber >= 1 && pageNumber <= numPages)
            .map((pageNumber) => {
              const current = pageNumber === page;
              return (
                <div
                  key={pageNumber}
                  aria-hidden={current ? undefined : true}
                  className={`[grid-area:1/1] ${current ? "" : "pointer-events-none invisible"}`}
                >
                  <PageCanvas
                    doc={doc}
                    pageNumber={pageNumber}
                    width={width}
                    fallbackHeight={Math.round(width * aspect)}
                    active
                    className={pageClassName}
                  />
                </div>
              );
            })}
        </div>
      ) : null}
    </div>
  );
}
