"use client";

/*
 * Curriculum Bookshelf: a library of guide covers first (with "pick up at
 * page N", the co-op chat and recent page notes on the side), then a calm
 * reader with ONE top bar (page scrubber along its edge, a Pages panel that
 * drops over the page, secondary actions under ⋯ More), so the page gets
 * the rest of the height. Chat opens as the drawer.
 */

import { Fragment, useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  MessageSquare,
  MonitorPlay,
  Rows3,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { GCard, GChip, G_FOCUS, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { getProgramCoopCurriculumTabLabel, type ProgramCoopCurriculumRecord } from "@/lib/admissions/program-coop-curriculum-storage";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import { sectionForPage, useReaderKeys } from "./reader/hooks";
import PageThumb from "./reader/PageThumb";
import { ICON_BTN, PageBox, ReaderMoreMenu, WorkspaceScrollReader, ZOOM_OPTIONS, type ReaderMenuGroup } from "./reader/ReaderParts";
import { useCurriculumDocument } from "./reader/useCurriculumDocument";
import { useCurriculumThread } from "./useCurriculumThread";
import type { CurriculumWorkspace } from "./useCurriculumWorkspace";

function GuideCover({ ws, record }: { ws: CurriculumWorkspace; record: ProgramCoopCurriculumRecord }) {
  const pdf = useCurriculumDocument({
    organizationId: ws.organizationId,
    programId: ws.programId,
    guideId: record.id,
    signedUrls: ws.signedUrls,
    previewMode: ws.previewMode,
  });
  return (
    <div className="flex aspect-[8.5/11] w-full items-center justify-center overflow-hidden rounded-[10px] bg-[var(--sf-paper)] ring-1 ring-[var(--sf-ink)]/10">
      {pdf.doc && pdf.firstPage ? (
        <PageThumb doc={pdf.doc} page={1} firstPage={pdf.firstPage} width={220} className="w-full [&>div]:!h-auto [&>div]:!w-full" />
      ) : pdf.status === "error" ? (
        <BookOpen className="h-8 w-8 text-[var(--sf-ink)]/30" aria-hidden />
      ) : (
        <div aria-hidden className="h-full w-full animate-pulse bg-[var(--sf-ink)]/[0.04] motion-reduce:animate-none" />
      )}
    </div>
  );
}

function GuidePageCount({ ws, guideId }: { ws: CurriculumWorkspace; guideId: string }) {
  const pdf = useCurriculumDocument({
    organizationId: ws.organizationId,
    programId: ws.programId,
    guideId,
    signedUrls: ws.signedUrls,
    previewMode: ws.previewMode,
  });
  return pdf.numPages ? <>{pdf.numPages} pages</> : null;
}

function Shelf({ ws, onOpen }: { ws: CurriculumWorkspace; onOpen: (guideId: string, page?: number) => void }) {
  const general = useCurriculumThread({
    organizationId: ws.organizationId,
    programId: ws.programId,
    curriculumId: null,
    initialMessages: ws.initialThreadMessages.general,
    previewMode: ws.previewMode,
  });
  const latestGeneral = general.messages.slice(-3).reverse();
  const recentNotes = ws.thread.messages.filter((message) => message.pageNumber).slice(-4).reverse();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className={PORTAL_HOME_CONTAINER_CLASS}>
        <ParentGardenPageHeader
          kicker="Co-op"
          title={
            <>
              Curriculum <span className="text-[var(--sf-clay)]">guides</span>
            </>
          }
          subtitle="Pick a guide to read, teach from, or talk about with the other families."
        />
        <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
          <GCard index={1} kicker="Your bookshelf" title="Guides for this co-op">
            <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3" data-testid="curriculum-guide-list">
              {ws.curricula.map((record) => {
                const label = getProgramCoopCurriculumTabLabel(record);
                const remembered = ws.remembered[record.id];
                const isCurrent = record.id === ws.guide?.id;
                return (
                  <li key={record.id} className="flex flex-col gap-2.5 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-3">
                    <button
                      type="button"
                      onClick={() => onOpen(record.id)}
                      onPointerEnter={() => ws.prefetchGuide(record.id)}
                      data-testid={`curriculum-guide-tab-${record.id}`}
                      aria-label={`Open ${label}`}
                      className={`group rounded-[12px] ${G_FOCUS}`}
                    >
                      <span className="block transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transition-none">
                        <GuideCover ws={ws} record={record} />
                      </span>
                    </button>
                    <div className="min-w-0">
                      <h3 className="m-0 line-clamp-2 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]" title={label}>
                        {label}
                      </h3>
                      <p className="m-0 mt-0.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                        <GuidePageCount ws={ws} guideId={record.id} />
                        {remembered && remembered > 1 ? <> · last on p. {remembered}</> : null}
                      </p>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpen(record.id, remembered)}
                        className={`${isCurrent ? gBtnPopSm : gBtnOutlineSm} !px-3.5 !py-2`}
                      >
                        {remembered && remembered > 1 ? `Continue at p. ${remembered}` : "Open"}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => ws.openDiscussion(record.id)}
                        aria-label={`Discuss ${label}`}
                        data-testid={`curriculum-discussion-open-${record.id}`}
                        className={ICON_BTN}
                      >
                        <MessageSquare className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </GCard>

          <div className="flex min-w-0 flex-col gap-5">
            <GCard
              index={2}
              kicker="Co-op chat"
              title="General"
              action={
                <button type="button" onClick={() => ws.openDiscussion(null)} className={gLinkSm} data-testid="curriculum-discussion-open-general">
                  Open chat <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              }
            >
              {latestGeneral.length === 0 ? (
                <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[14px] font-semibold text-[var(--sf-soft)]">
                  No messages yet. Ask the co-op a question about the curriculum.
                </p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {latestGeneral.map((message) => (
                    <li key={message.id} className="rounded-[14px] bg-[var(--sf-paper)] px-3.5 py-2.5">
                      <p className="m-0 text-[12px] font-extrabold text-[var(--sf-clay-deep)]">
                        {message.senderDisplayName}
                        <span className="font-semibold text-[var(--sf-soft)]"> · {formatRelativeTime(message.createdAt)}</span>
                      </p>
                      <p className="m-0 mt-0.5 line-clamp-2 text-[14px] font-semibold text-[var(--sf-ink)]">{message.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </GCard>

            {ws.guide ? (
              <GCard index={3} kicker="Recent notes" title={ws.guideLabel}>
                {recentNotes.length === 0 ? (
                  <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">
                    Notes families leave on a page show up here.
                  </p>
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {recentNotes.map((message) => (
                      <li key={message.id}>
                        <button
                          type="button"
                          onClick={() => ws.guide && onOpen(ws.guide.id, message.pageNumber ?? undefined)}
                          className={`flex w-full items-start gap-3 rounded-[14px] px-2 py-2 text-left hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`}
                        >
                          <GChip tone="info" className="mt-0.5">p. {message.pageNumber}</GChip>
                          <span className="min-w-0">
                            <span className="block line-clamp-2 text-[14px] font-semibold text-[var(--sf-ink)]">{message.body}</span>
                            <span className="block text-[12px] font-semibold text-[var(--sf-soft)]">{message.senderDisplayName}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </GCard>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

type PagesMode = "strip" | "grid";
const PAGES_MODE_KEY = "mk-curriculum-tray";

/** Strip or grid for the Pages panel, remembered per browser. */
function usePagesMode() {
  const [mode, setModeState] = useState<PagesMode>("strip");
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(PAGES_MODE_KEY);
    } catch {
      // storage blocked
    }
    if (stored === "grid") queueMicrotask(() => setModeState("grid"));
  }, []);
  const setMode = useCallback((next: PagesMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(PAGES_MODE_KEY, next);
    } catch {
      // storage blocked
    }
  }, []);
  return [mode, setMode] as const;
}

function ThumbButton({ ws, pageNumber, width }: { ws: CurriculumWorkspace; pageNumber: number; width: number }) {
  const { pdf, page } = ws;
  const active = pageNumber === page;
  return (
    <button
      type="button"
      onClick={() => ws.goToPage(pageNumber)}
      aria-label={`Page ${pageNumber}`}
      aria-current={active ? "page" : undefined}
      data-thumb={pageNumber}
      className={`flex w-full flex-col items-center gap-1 rounded-[8px] p-1 ${G_FOCUS} ${
        active ? "bg-[var(--sf-accent-wash)] ring-2 ring-[var(--sf-clay)]" : "hover:bg-[var(--sf-ink)]/[0.04]"
      }`}
    >
      <PageThumb doc={pdf.doc!} page={pageNumber} firstPage={pdf.firstPage!} width={width} />
      <span className="text-[11px] font-bold tabular-nums text-[var(--sf-soft)]">{pageNumber}</span>
    </button>
  );
}

/**
 * Thin page scrubber along the bar's bottom edge: a 3px track with the read
 * part filled, and a transparent range input on top for drag / keyboard.
 */
function PageScrubber({ ws }: { ws: CurriculumWorkspace }) {
  const { pdf, page } = ws;
  if (!pdf.doc || pdf.numPages < 2) return null;
  const pct = ((page - 1) / (pdf.numPages - 1)) * 100;
  return (
    <div className="group absolute inset-x-0 -bottom-[1.5px] z-10 h-[3px]">
      <input
        type="range"
        min={1}
        max={pdf.numPages}
        value={page}
        onChange={(event) => ws.goToPage(Number(event.target.value))}
        aria-label="Page"
        aria-valuetext={`Page ${page} of ${pdf.numPages}`}
        data-testid="curriculum-page-scrubber"
        className="peer absolute inset-x-0 -top-2 z-10 m-0 h-[18px] w-full cursor-pointer opacity-0"
      />
      <div aria-hidden className="absolute inset-0 bg-[var(--sf-ink)]/10" />
      <div aria-hidden className="absolute inset-y-0 left-0 bg-[var(--sf-clay)]" style={{ width: `${pct}%` }} />
      <span
        aria-hidden
        style={{ left: `${pct}%` }}
        className="pointer-events-none absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 scale-75 rounded-full border-2 border-white bg-[var(--sf-clay)] opacity-0 shadow transition-[opacity,transform] duration-150 group-hover:scale-100 group-hover:opacity-100 peer-focus-visible:scale-125 peer-focus-visible:opacity-100 peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--sf-clay)]/25 peer-active:scale-125 peer-active:opacity-100 motion-reduce:transition-none"
      />
    </div>
  );
}

/**
 * Pages panel: drops down from the bar over the page (the reader keeps its
 * full height). Strip = a row of thumbnails; grid = every page under the
 * guide's chapters. Clicking a page jumps there and keeps the panel open.
 */
function PagesPanel({
  ws,
  id,
  mode,
  setMode,
  onClose,
}: {
  ws: CurriculumWorkspace;
  id: string;
  mode: PagesMode;
  setMode: (mode: PagesMode) => void;
  onClose: () => void;
}) {
  const { pdf, page } = ws;
  const reduce = useReducedMotion() === true;
  const bodyRef = useRef<HTMLDivElement>(null);

  // Keep the current page's thumbnail in view.
  useEffect(() => {
    const active = bodyRef.current?.querySelector<HTMLElement>(`[data-thumb="${page}"]`);
    active?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
  }, [mode, page, reduce]);

  if (!pdf.doc || !pdf.firstPage) return null;
  const pages = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
  const chapterStarts = new Map(
    ws.outline.entries.filter((entry) => entry.depth === 0).map((entry) => [entry.page, entry.title]),
  );
  const segment = (value: PagesMode, label: string, Icon: typeof Rows3) => (
    <button
      type="button"
      role="radio"
      aria-checked={mode === value}
      onClick={() => setMode(value)}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-extrabold transition-colors ${G_FOCUS} ${
        mode === value ? "bg-[var(--sf-ink)] text-white" : "text-[var(--sf-ink)]/70 hover:text-[var(--sf-ink)]"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );

  return (
    <motion.div
      id={id}
      role="region"
      aria-label="Pages"
      data-testid="curriculum-page-tray"
      data-size={mode}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: reduce ? 0 : 0.2, ease: PORTAL_EASE }}
      className="absolute inset-x-0 top-full z-30 border-b-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[0_22px_40px_-24px_rgba(40,28,18,0.5)]"
    >
      <div className="flex items-center gap-3 px-3 pb-1 pt-2.5 sm:px-4">
        <p className="m-0 min-w-0 flex-1 truncate text-[12px] font-extrabold text-[var(--sf-soft)]">
          Pages <span className="tabular-nums">· {page} of {pdf.numPages}</span>
        </p>
        <div role="radiogroup" aria-label="Page view" className="flex items-center rounded-full bg-[var(--sf-ink)]/[0.06] p-0.5">
          {segment("strip", "Strip", Rows3)}
          {segment("grid", "Grid", LayoutGrid)}
        </div>
        <button type="button" onClick={onClose} aria-label="Close pages" className={`${ICON_BTN} h-8 w-8`}>
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div ref={bodyRef}>
        {mode === "strip" ? (
          <ol aria-label="Pages" className="m-0 flex list-none gap-2 overflow-x-auto overscroll-contain px-3 pb-3 pt-1.5">
            {pages.map((pageNumber) => (
              <li key={pageNumber} className="w-[72px] shrink-0">
                <ThumbButton ws={ws} pageNumber={pageNumber} width={62} />
              </li>
            ))}
          </ol>
        ) : (
          <ol
            aria-label="Pages"
            className="m-0 grid max-h-[60vh] list-none grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-x-2 gap-y-3 overflow-y-auto overscroll-contain px-3 pb-4 pt-2 sm:px-4"
          >
            {pages.map((pageNumber) => {
              const chapter = chapterStarts.get(pageNumber);
              return (
                <Fragment key={pageNumber}>
                  {chapter ? (
                    <li className="col-span-full pt-1">
                      <p className="m-0 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/15 pb-1 text-[12px] font-extrabold uppercase tracking-[0.12em] text-[var(--sf-clay-deep)]">
                        {chapter}
                      </p>
                    </li>
                  ) : null}
                  <li>
                    <ThumbButton ws={ws} pageNumber={pageNumber} width={88} />
                  </li>
                </Fragment>
              );
            })}
          </ol>
        )}
      </div>
    </motion.div>
  );
}

function Reader({ ws, onBack }: { ws: CurriculumWorkspace; onBack: () => void }) {
  const { pdf, page } = ws;
  const ready = pdf.status === "ready";
  const section = sectionForPage(ws.outline.entries, page);
  const notes = ws.thread.messages.length;
  const [pagesOpen, setPagesOpen] = useState(false);
  const [pagesMode, setPagesMode] = usePagesMode();
  const barRef = useRef<HTMLDivElement>(null);
  const pagesButtonRef = useRef<HTMLButtonElement>(null);
  const pagesId = useId();
  const discuss = () => ws.guide && ws.openDiscussion(ws.guide.id);

  useReaderKeys(ready && !ws.presenting, {
    toggleTray: () => setPagesOpen((open) => !open),
    toggleTrayMode: () => {
      setPagesOpen(true);
      setPagesMode(pagesMode === "grid" ? "strip" : "grid");
    },
    prev: () => ws.goToPage(page - 1),
    next: () => ws.goToPage(page + 1),
    first: () => ws.goToPage(1),
    last: () => ws.goToPage(pdf.numPages),
    zoomIn: ws.zoom.zoomIn,
    zoomOut: ws.zoom.zoomOut,
  });

  // Escape or a click outside the bar closes the Pages panel.
  useEffect(() => {
    if (!pagesOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      setPagesOpen(false);
      pagesButtonRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setPagesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [pagesOpen]);

  const zoomValue = String(ws.zoom.zoom);
  const menuGroups: ReaderMenuGroup[] = [
    {
      label: "Zoom",
      items: [
        ...ZOOM_OPTIONS.map((option) => ({
          key: `zoom-${option.value}`,
          label: option.label,
          checked: String(option.value) === zoomValue,
          onSelect: () => ws.zoom.setZoom(option.value),
        })),
        { key: "zoom-in", label: "Zoom in", icon: <ZoomIn className="h-4 w-4" />, hint: "+", onSelect: ws.zoom.zoomIn },
        { key: "zoom-out", label: "Zoom out", icon: <ZoomOut className="h-4 w-4" />, hint: "−", onSelect: ws.zoom.zoomOut },
      ],
    },
    {
      label: "Go to",
      items: [
        { key: "first", label: "First page", icon: <ChevronsLeft className="h-4 w-4" />, hint: "Home", disabled: page <= 1, onSelect: () => ws.goToPage(1) },
        {
          key: "last",
          label: "Last page",
          icon: <ChevronsRight className="h-4 w-4" />,
          hint: "End",
          disabled: page >= pdf.numPages,
          onSelect: () => ws.goToPage(pdf.numPages),
        },
      ],
    },
    {
      className: "sm:hidden",
      items: [
        {
          key: "discuss",
          label: notes ? `Discuss · ${notes}` : "Discuss",
          icon: <MessageSquare className="h-4 w-4" />,
          onSelect: discuss,
        },
      ],
    },
  ];

  return (
    <section className="flex min-h-0 flex-1 flex-col" data-testid="curriculum-pdf-viewer" aria-label={ws.guideLabel}>
      <h1 className="sr-only">Curriculum: {ws.guideLabel}</h1>
      <div ref={barRef} className="relative z-20 shrink-0 border-b-[1.5px] border-[var(--sf-ink)]/10 bg-white">
        <div className="flex items-center gap-1.5 px-2 py-2 min-[360px]:px-3 sm:gap-3 sm:px-4" data-testid="curriculum-reader-bar">
          <button type="button" onClick={onBack} aria-label="Back to bookshelf" className={`${gBtnOutlineSm} shrink-0 !px-3 !py-2`}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Bookshelf</span>
          </button>
          <div className="hidden min-w-0 flex-1 md:block">
            <p className="m-0 truncate text-[14px] font-extrabold text-[var(--sf-ink)]" title={ws.guideLabel}>
              {ws.guideLabel}
            </p>
            {section ? <p className="m-0 truncate text-[12px] font-semibold text-[var(--sf-soft)]">{section.title}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              className={`${ICON_BTN} !hidden sm:!inline-flex`}
              onClick={() => ws.goToPage(page - 1)}
              disabled={!ready || page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <PageBox page={page} numPages={pdf.numPages} onGo={ws.goToPage} compact />
            <button
              type="button"
              className={`${ICON_BTN} !hidden sm:!inline-flex`}
              onClick={() => ws.goToPage(page + 1)}
              disabled={!ready || page >= pdf.numPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 md:ml-0">
            <button
              ref={pagesButtonRef}
              type="button"
              onClick={() => setPagesOpen((open) => !open)}
              disabled={!ready}
              aria-expanded={pagesOpen}
              aria-controls={pagesOpen ? pagesId : undefined}
              aria-label="Pages"
              data-testid="curriculum-pages-toggle"
              className={`${gBtnOutlineSm} !px-2.5 !py-2 lg:!px-3 ${pagesOpen ? "!border-[var(--sf-ink)] !bg-[var(--sf-accent-wash)]" : ""}`}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">Pages</span>
            </button>
            <button type="button" onClick={discuss} className={`${gBtnOutlineSm} !hidden !px-3 !py-2 sm:!inline-flex`}>
              <MessageSquare className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">Discuss</span>
              {notes ? <span className="tabular-nums">{notes}</span> : null}
              <span className="sr-only lg:hidden">Discuss</span>
            </button>
            <button type="button" onClick={ws.startPresenting} disabled={!ready} className={`${gBtnPopSm} !px-3 !py-2`}>
              <MonitorPlay className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Present</span>
            </button>
            <ReaderMoreMenu
              groups={menuGroups}
              footer={
                <>
                  <span className="font-extrabold text-[var(--sf-ink)]/70">Shortcuts</span> · ← → pages · t page panel · g
                  strip / grid · + − zoom
                </>
              }
            />
          </div>
        </div>
        <PageScrubber ws={ws} />
        <AnimatePresence>
          {pagesOpen && ready ? (
            <PagesPanel ws={ws} id={pagesId} mode={pagesMode} setMode={setPagesMode} onClose={() => setPagesOpen(false)} />
          ) : null}
        </AnimatePresence>
      </div>
      <WorkspaceScrollReader ws={ws} maxFitWidth={900} onOpenPageNotes={discuss} />
    </section>
  );
}

export default function Bookshelf({ ws }: { ws: CurriculumWorkspace }) {
  const [view, setView] = useState<"shelf" | "reader">("shelf");

  const open = (guideId: string, page?: number) => {
    ws.selectGuide(guideId);
    setView("reader");
    if (page && page > 1) {
      // Let the reader mount on the new guide, then jump.
      window.setTimeout(() => ws.scrollReaderTo(page), 120);
    }
  };

  return view === "shelf" ? <Shelf ws={ws} onOpen={open} /> : <Reader ws={ws} onBack={() => setView("shelf")} />;
}
