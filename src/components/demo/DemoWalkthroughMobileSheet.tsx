"use client";

import { useEffect, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import DemoWalkthroughStepList from "@/components/demo/DemoWalkthroughStepList";
import { BOLD_HEADING } from "@/components/home/bright-styles";
import type { DemoWalkthroughStep } from "@/data/school-demos/walkthrough-placeholder";
import type { SchoolDemoLogo } from "@/components/demo/SchoolDemoWordmark";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";

type Props = {
  open: boolean;
  onClose: () => void;
  schoolName: string;
  schoolLogo: SchoolDemoLogo;
  steps: DemoWalkthroughStep[];
  activeStep: number;
  schoolPrimary: string;
  onStepSelect: (index: number) => void;
};

export default function DemoWalkthroughMobileSheet({
  open,
  onClose,
  schoolName,
  schoolLogo,
  steps,
  activeStep,
  schoolPrimary,
  onStepSelect,
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
            className="absolute inset-0 bg-black/45"
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
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden border-l border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.12)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
              <div className="min-w-0">
                <p
                  id={titleId}
                  className={`truncate text-base ${BOLD_HEADING}`}
                >
                  {schoolName}
                </p>
                <p
                  className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: schoolPrimary }}
                >
                  Concept walkthrough
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F4F1EC] text-[#1d1a16] transition hover:bg-black/5"
                aria-label="Close steps menu"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="flex items-center justify-center border-b border-black/5 px-4 py-2">
              <SchoolDemoWordmark
                logo={schoolLogo}
                className="h-7 w-auto max-w-[160px] object-contain"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <DemoWalkthroughStepList
                steps={steps}
                activeStep={activeStep}
                accentColor={schoolPrimary}
                onStepSelect={handleStepSelect}
                compact
              />
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
