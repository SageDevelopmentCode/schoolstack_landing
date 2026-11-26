"use client";

import { useEffect, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import DemoWalkthroughStepList from "@/components/demo/DemoWalkthroughStepList";
import type { DemoWalkthroughStep } from "@/data/school-demos/walkthrough-placeholder";
import type { SchoolDemoLogo } from "@/components/demo/SchoolDemoWordmark";
import {
  DemoCoBrandCard,
  DemoSnapshotLink,
  DemoStepProgress,
} from "@/components/demo/DemoWalkthroughPanel";
import { Pill } from "@/components/garden/ui";

type Props = {
  open: boolean;
  onClose: () => void;
  schoolName: string;
  schoolLogo: SchoolDemoLogo;
  steps: DemoWalkthroughStep[];
  activeStep: number;
  onStepSelect: (index: number) => void;
  /** Their snapshot page, when they opened it on this device. */
  snapshotHref?: string | null;
};

export default function DemoWalkthroughMobileSheet({
  open,
  onClose,
  schoolName,
  schoolLogo,
  steps,
  activeStep,
  onStepSelect,
  snapshotHref,
}: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleStepSelect = (index: number) => {
    onStepSelect(index);
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="demo-walkthrough-mobile-sheet"
        >
          <div
            className="absolute inset-0 bg-[var(--sf-ink)]/45"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-label="Walkthrough steps"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden border-l-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] shadow-[0_24px_60px_rgba(43,36,29,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b-2 border-[var(--sf-ink)]/10 px-4 pb-4 pt-4">
              <div className="min-w-0">
                <Pill tint="forest" className="!px-3 !py-1 !text-xs">
                  <span aria-hidden="true">🧺</span> Concept walkthrough
                </Pill>
                <p
                  id={titleId}
                  className="sf-display mt-2 truncate text-2xl leading-[1.05] text-[var(--sf-ink)]"
                >
                  {schoolName}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[var(--sf-ink)] ring-2 ring-inset ring-[var(--sf-ink)]/20 transition hover:ring-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
                aria-label="Close steps menu"
              >
                <X className="h-5 w-5" strokeWidth={2.4} aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <DemoCoBrandCard schoolLogo={schoolLogo} className="mb-5" />
              <div className="mb-6">
                <DemoStepProgress activeStep={activeStep} total={steps.length} />
              </div>
              <DemoWalkthroughStepList
                steps={steps}
                activeStep={activeStep}
                onStepSelect={handleStepSelect}
                compact
              />
              {snapshotHref ? <DemoSnapshotLink href={snapshotHref} className="mt-6" /> : null}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
