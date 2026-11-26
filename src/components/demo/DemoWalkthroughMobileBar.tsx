"use client";

import { useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, List, X } from "lucide-react";
import DemoWalkthroughMobileSheet from "@/components/demo/DemoWalkthroughMobileSheet";
import { DEMO_PREVIEW_ROLES, type DemoPreviewVariant } from "@/components/demo/DemoPreviewFrame";
import type { DemoWalkthroughStep } from "@/data/school-demos/walkthrough-placeholder";
import type { SchoolDemoLogo } from "@/components/demo/SchoolDemoWordmark";

interface Props {
  schoolName: string;
  schoolLogo: SchoolDemoLogo;
  steps: DemoWalkthroughStep[];
  activeStep: number;
  onStepSelect: (index: number) => void;
  /** Their snapshot page, when they opened it on this device. */
  snapshotHref?: string | null;
  /** Whose view the active step shows; tints the bar and names it ("· Admin view"). */
  preview: DemoPreviewVariant;
}

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

/** First-visit "Tap Next" hint: shown until they move once, then remembered on this device. */
const HINT_SEEN_KEY = "mk-demo-next-hint-seen";
const HINT_EVENT = "mk-demo-next-hint-seen";

function subscribeHint(onChange: () => void) {
  window.addEventListener(HINT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(HINT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readHintSeen() {
  try {
    return window.localStorage.getItem(HINT_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markHintSeen() {
  try {
    window.localStorage.setItem(HINT_SEEN_KEY, "1");
  } catch {
    // Storage blocked: hide it for this page only.
  }
  window.dispatchEvent(new Event(HINT_EVENT));
}

/** Server render and first paint assume "seen", so the bubble never flashes for returning visitors. */
function useNextHintSeen() {
  return useSyncExternalStore(subscribeHint, readHintSeen, () => true);
}

export default function DemoWalkthroughMobileBar({
  schoolName,
  schoolLogo,
  steps,
  activeStep,
  onStepSelect,
  snapshotHref,
  preview,
}: Props) {
  const role = DEMO_PREVIEW_ROLES[preview];
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const hintSeen = useNextHintSeen();
  const step = steps[activeStep];
  const total = steps.length;
  const canPrev = activeStep > 0;
  const canNext = activeStep < total - 1;
  const showHint = !hintSeen && !hintDismissed && canNext;

  const dismissHint = () => {
    setHintDismissed(true);
    markHintSeen();
  };
  const goTo = (index: number) => {
    dismissHint();
    onStepSelect(index);
  };

  return (
    <>
      <div
        className="sticky top-0 z-[90] flex shrink-0 items-center gap-2 border-b-2 border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-3 py-2.5 lg:hidden"
        data-testid="demo-walkthrough-mobile-bar"
        data-role={preview}
      >
        {/* Role tint over the paper, matching the preview's wash (behind the bar's content). */}
        <span
          className={`pointer-events-none absolute inset-0 -z-10 transition-colors duration-300 ${role.bar}`}
          aria-hidden="true"
        />
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => goTo(activeStep - 1)}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[var(--sf-ink)] ring-2 ring-inset ring-[var(--sf-ink)]/20 transition enabled:hover:ring-[var(--sf-ink)] disabled:opacity-35 ${FOCUS}`}
          aria-label="Previous step"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.4} aria-hidden />
        </button>

        <div className="min-w-0 flex-1">
          <p
            className="truncate whitespace-nowrap text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-forest)]"
            aria-label={`Step ${activeStep + 1} of ${total}, ${role.label}`}
          >
            Step {activeStep + 1}/{total}
            <span className="text-[var(--sf-ink)]/55"> · {role.short}</span>
          </p>
          <p className="line-clamp-2 text-[13px] font-extrabold leading-tight text-[var(--sf-ink)]">
            {step?.title ?? schoolName}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            dismissHint();
            setSheetOpen(true);
          }}
          className={`inline-flex h-9 shrink-0 items-center gap-1 rounded-full border-2 border-[var(--sf-ink)] bg-white px-2.5 text-[12px] font-extrabold text-[var(--sf-ink)] shadow-[0_2px_0_0_var(--sf-ink)] transition active:translate-y-0.5 active:shadow-none ${FOCUS}`}
        >
          <List className="h-4 w-4" strokeWidth={2.4} aria-hidden />
          Steps
        </button>

        <div className="relative shrink-0">
          {showHint ? (
            <span
              className="pointer-events-none absolute inset-0 rounded-full bg-[var(--sf-forest)]/40 motion-safe:animate-ping"
              aria-hidden="true"
            />
          ) : null}
          <button
            type="button"
            disabled={!canNext}
            onClick={() => goTo(activeStep + 1)}
            className={`relative inline-flex h-9 items-center gap-0.5 rounded-full bg-[var(--sf-forest)] pl-3.5 pr-2 text-[13px] font-extrabold text-white shadow-[0_3px_0_0_var(--sf-forest-deep)] transition enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:opacity-35 ${FOCUS}`}
            aria-label={canNext ? "Next step" : "Last step"}
          >
            {canNext ? "Next" : "Done"}
            <ChevronRight className="h-4 w-4" strokeWidth={2.6} aria-hidden />
          </button>
        </div>

        {showHint ? (
          <div
            className="absolute right-3 top-full z-[95] mt-2 flex max-w-[15rem] items-start gap-2 rounded-2xl border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] py-2 pl-3 pr-1.5 shadow-[0_3px_0_0_var(--sf-ink)]"
            role="status"
            data-testid="demo-next-hint"
          >
            {/* Tail pointing up at the Next button. */}
            <span
              className="absolute -top-[7px] right-7 h-3 w-3 rotate-45 border-l-2 border-t-2 border-[var(--sf-ink)] bg-[var(--sf-butter)]"
              aria-hidden="true"
            />
            <p className="relative text-[12.5px] font-bold leading-snug text-[var(--sf-ink)]">
              Tap <span className="font-extrabold">Next</span> to walk through all {total} steps.
            </p>
            <button
              type="button"
              onClick={dismissHint}
              className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-full text-[var(--sf-ink)] hover:bg-white/60 ${FOCUS}`}
              aria-label="Dismiss tip"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      <DemoWalkthroughMobileSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        schoolName={schoolName}
        schoolLogo={schoolLogo}
        steps={steps}
        activeStep={activeStep}
        onStepSelect={goTo}
        snapshotHref={snapshotHref}
      />
    </>
  );
}
