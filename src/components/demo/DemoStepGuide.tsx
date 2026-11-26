"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lightbulb, MousePointerClick } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { DemoStepGuide as StepGuide } from "@/data/school-demos/walkthroughs/step-guides";

interface Props {
  guide: StepGuide;
  /** "Step 3 of 9 · Admin view" */
  stepLabel: string;
  title: string;
}

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Mark every sibling of `layer` and of its ancestors inert, up to `document.body`. */
function inertOutside(layer: HTMLElement): HTMLElement[] {
  const inerted: HTMLElement[] = [];
  let node: HTMLElement | null = layer;
  while (node.parentElement) {
    for (const sibling of node.parentElement.children) {
      if (!(sibling instanceof HTMLElement)) continue;
      if (sibling === node || sibling.hasAttribute("inert")) continue;
      sibling.setAttribute("inert", "");
      inerted.push(sibling);
    }
    if (node.parentElement === document.body) break;
    node = node.parentElement;
  }
  return inerted;
}

/**
 * The step's tip, out of the way until asked: a lightbulb in the corner of the preview
 * opens a bottom sheet (dark overlay) with what they're looking at and one thing to try.
 */
export default function DemoStepGuide({ guide, stepLabel, title }: Props) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const titleId = useId();
  const bulbRef = useRef<HTMLButtonElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Focus "Got it" on open, back to the lightbulb on close. Esc closes.
  // Tab stays in the sheet, and the rest of the page is inert while it is open.
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) bulbRef.current?.focus();
      return;
    }
    wasOpen.current = true;
    const inerted = layerRef.current ? inertOutside(layerRef.current) : [];
    doneRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusables.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const outside = !(active instanceof Node) || !panel.contains(active);
      if (event.shiftKey && (active === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      for (const el of inerted) el.removeAttribute("inert");
    };
  }, [open]);

  return (
    <>
      <motion.button
        ref={bulbRef}
        type="button"
        onClick={() => setOpen(true)}
        initial={reduce ? false : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", damping: 16, stiffness: 320, delay: 0.5 }}
        className={`absolute bottom-7 right-5 z-10 grid h-11 w-11 place-items-center rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] text-[var(--sf-ink)] shadow-[0_3px_0_0_var(--sf-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none sm:bottom-9 sm:right-8 lg:bottom-14 lg:right-12 ${FOCUS}`}
        aria-label="Tip for this step"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-testid="demo-step-guide"
      >
        <Lightbulb className="h-5 w-5" strokeWidth={2.4} aria-hidden />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="sheet"
            ref={layerRef}
            className="fixed inset-0 z-[120] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
          >
            <div className="absolute inset-0 bg-black/55" onClick={() => setOpen(false)} aria-hidden="true" />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              initial={reduce ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reduce ? undefined : { y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="relative w-full max-w-md rounded-t-[28px] border-2 border-b-0 border-[var(--sf-ink)] bg-[var(--sf-paper)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 text-[var(--sf-ink)] shadow-[0_-12px_40px_rgba(43,36,29,0.25)] outline-none"
              data-testid="demo-step-guide-sheet"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--sf-ink)]/15" aria-hidden="true" />
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--sf-butter)] ring-2 ring-[var(--sf-ink)]">
                  <Lightbulb className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-forest)]">
                    {stepLabel}
                  </p>
                  <h2 id={titleId} className="sf-display mt-1 text-[1.35rem] leading-[1.1]">
                    {title}
                  </h2>
                </div>
              </div>
              <p className="mt-4 text-[15px] font-bold leading-snug">{guide.what}</p>
              {guide.tryThis ? (
                <p className="mt-3 flex items-start gap-2 rounded-2xl bg-[var(--sf-butter)]/60 px-3.5 py-2.5 text-[14px] font-semibold leading-snug">
                  <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} aria-hidden />
                  <span>
                    <span className="font-extrabold text-[var(--sf-forest)]">Try:</span> {guide.tryThis}
                  </span>
                </p>
              ) : null}
              <button
                ref={doneRef}
                type="button"
                onClick={() => setOpen(false)}
                className={`mt-5 h-12 w-full rounded-full bg-[var(--sf-forest)] text-[15px] font-extrabold text-white shadow-[0_3px_0_0_var(--sf-forest-deep)] transition active:translate-y-0.5 active:shadow-none ${FOCUS}`}
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
