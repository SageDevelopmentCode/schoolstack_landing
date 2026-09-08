"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  loadPdfOutline,
  resolveDestToPageNumber,
  type PdfOutlineItem,
} from "@/lib/admissions/program-coop-curriculum-pdf-outline";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import ParentButton from "@/components/school-parent/ui/ParentButton";

type CurriculumPdfContentsPanelProps = {
  theme: ParentThemeTokens;
  open: boolean;
  pdfDoc: PDFDocumentProxy;
  numPages: number;
  currentPage: number;
  onClose: () => void;
  onSelectPage: (pageNumber: number) => void;
};

function clampPageNumber(value: number, numPages: number): number {
  return Math.min(Math.max(1, Math.round(value)), numPages);
}

function OutlineTree({
  theme,
  items,
  depth,
  currentPage,
  onSelectBookmark,
}: {
  theme: ParentThemeTokens;
  items: PdfOutlineItem[];
  depth: number;
  currentPage: number;
  onSelectBookmark: (dest: PdfOutlineItem["dest"]) => void;
}) {
  return (
    <ul className="m-0 list-none p-0">
      {items.map((item, index) => {
        const title = item.title?.trim() || `Section ${index + 1}`;
        return (
          <li key={`${depth}-${index}-${title}`}>
            <button
              type="button"
              onClick={() => onSelectBookmark(item.dest)}
              className="w-full border-0 bg-transparent px-2 py-1.5 text-left text-xs hover:opacity-90"
              style={{
                color: theme.ink,
                paddingLeft: `${8 + depth * 12}px`,
              }}
            >
              {title}
            </button>
            {item.items && item.items.length > 0 ? (
              <OutlineTree
                theme={theme}
                items={item.items}
                depth={depth + 1}
                currentPage={currentPage}
                onSelectBookmark={onSelectBookmark}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export default function CurriculumPdfContentsPanel({
  theme,
  open,
  pdfDoc,
  numPages,
  currentPage,
  onClose,
  onSelectPage,
}: CurriculumPdfContentsPanelProps) {
  const [outline, setOutline] = useState<PdfOutlineItem[] | null>(null);
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [goToPageValue, setGoToPageValue] = useState("");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setOutlineLoading(true);

    void loadPdfOutline(pdfDoc)
      .then((items) => {
        if (!cancelled) setOutline(items);
      })
      .finally(() => {
        if (!cancelled) setOutlineLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, pdfDoc]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleGoToPage = useCallback(() => {
    const parsed = Number.parseInt(goToPageValue, 10);
    if (!Number.isFinite(parsed)) return;
    onSelectPage(clampPageNumber(parsed, numPages));
    setGoToPageValue("");
  }, [goToPageValue, numPages, onSelectPage]);

  const handleSelectBookmark = useCallback(
    async (dest: PdfOutlineItem["dest"]) => {
      const pageNumber = await resolveDestToPageNumber(pdfDoc, dest);
      if (pageNumber != null) {
        onSelectPage(pageNumber);
      }
    },
    [onSelectPage, pdfDoc],
  );

  const titleId = "curriculum-pdf-contents-panel-title";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute inset-0 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="curriculum-pdf-contents-panel"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 left-0 flex w-[min(100%,16rem)] max-w-full flex-col overflow-hidden border-r"
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2.5"
              style={{ borderColor: theme.line }}
            >
              <h2
                id={titleId}
                className="text-xs font-semibold"
                style={{ color: theme.ink }}
              >
                Contents
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close contents"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent"
                style={{ color: theme.muted }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex shrink-0 gap-2 border-b px-3 py-2.5" style={{ borderColor: theme.line }}>
              <input
                type="number"
                min={1}
                max={numPages}
                value={goToPageValue}
                onChange={(event) => setGoToPageValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleGoToPage();
                }}
                placeholder="Page #"
                aria-label="Go to page number"
                className="min-w-0 flex-1 rounded-md border px-2 py-1.5 text-xs outline-none"
                style={{
                  borderColor: theme.line,
                  backgroundColor: theme.cream,
                  color: theme.ink,
                }}
              />
              <ParentButton
                theme={theme}
                variant="soft"
                className="shrink-0 px-2.5 py-1.5 text-xs"
                onClick={handleGoToPage}
              >
                Go
              </ParentButton>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-1 py-2">
              {outlineLoading ? (
                <p className="px-2 py-1 text-xs" style={{ color: theme.muted }}>
                  Loading bookmarks…
                </p>
              ) : null}

              {!outlineLoading && outline && outline.length > 0 ? (
                <div className="mb-3">
                  <p
                    className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: theme.muted }}
                  >
                    Bookmarks
                  </p>
                  <OutlineTree
                    theme={theme}
                    items={outline}
                    depth={0}
                    currentPage={currentPage}
                    onSelectBookmark={(dest) => void handleSelectBookmark(dest)}
                  />
                </div>
              ) : null}

              <div>
                <p
                  className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: theme.muted }}
                >
                  All pages
                </p>
                <ul className="m-0 list-none p-0">
                  {Array.from({ length: numPages }, (_, index) => {
                    const pageNumber = index + 1;
                    const isActive = pageNumber === currentPage;
                    return (
                      <li key={pageNumber}>
                        <button
                          type="button"
                          onClick={() => onSelectPage(pageNumber)}
                          className="w-full rounded-md border-0 px-2 py-1.5 text-left text-xs"
                          style={{
                            color: theme.ink,
                            backgroundColor: isActive ? theme.primarySoft : "transparent",
                          }}
                        >
                          Page {pageNumber}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
